#!/usr/bin/env python3
"""
MANASA Events — Shared Backend Server
======================================
• Runs a local HTTP server on port 8000
• Serves all HTML/CSS/JS files
• Provides a REST API so ALL users share ONE database (manasa.db)
• Users sign up / log in → data saved to SQLite on THIS machine
• Admin panel reads from the same shared SQLite

HOW TO USE:
  Windows  : Double-click  "START SERVER (Windows).bat"
  Mac/Linux: Run  "bash START SERVER (Mac-Linux).sh"
  Or manually: python3 server.py

Then share your IP address (shown at startup) with friends.
They open:  http://YOUR_IP:8000
"""

import http.server
import socketserver
import json
import sqlite3
import hashlib
import os
import threading
import socket
import webbrowser
from urllib.parse import urlparse, parse_qs
from datetime import datetime

PORT      = int(os.environ.get('PORT', 8000))
DB_FILE   = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'manasa.db')
FOLDER    = os.path.dirname(os.path.abspath(__file__))

# ─────────────────────────────────────────────────────────────
# Database setup
# ─────────────────────────────────────────────────────────────
def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()
    c.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT    NOT NULL,
            last_name  TEXT    DEFAULT '',
            email      TEXT    NOT NULL UNIQUE,
            phone      TEXT    DEFAULT '',
            password   TEXT    NOT NULL,
            provider   TEXT    DEFAULT 'email',
            joined_at  TEXT    NOT NULL
        );
        CREATE TABLE IF NOT EXISTS bookings (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id    TEXT    NOT NULL UNIQUE,
            user_name   TEXT    NOT NULL,
            user_email  TEXT    NOT NULL,
            user_phone  TEXT    DEFAULT '',
            event_id    INTEGER NOT NULL,
            event_title TEXT    NOT NULL,
            event_date  TEXT    NOT NULL,
            event_time  TEXT    DEFAULT '',
            event_venue TEXT    DEFAULT '',
            tickets     INTEGER NOT NULL DEFAULT 1,
            unit_price  REAL    NOT NULL DEFAULT 0,
            total_price REAL    NOT NULL DEFAULT 0,
            status      TEXT    NOT NULL DEFAULT 'confirmed',
            booked_at   TEXT    NOT NULL
        );
    """)
    conn.commit()
    conn.close()
    print(f"  Database : {DB_FILE}")

def sha256(text):
    return hashlib.sha256(text.encode()).hexdigest()

# ─────────────────────────────────────────────────────────────
# API handlers
# ─────────────────────────────────────────────────────────────
def api_register(data):
    try:
        first = (data.get('firstName') or '').strip()
        last  = (data.get('lastName')  or '').strip()
        email = (data.get('email')     or '').strip().lower()
        phone = (data.get('phone')     or '').strip()
        pwd   = data.get('password', '')
        if not first or not email or not pwd:
            return {'success': False, 'error': 'Missing required fields'}
        conn = get_db()
        c = conn.cursor()
        c.execute('SELECT id FROM users WHERE email=?', (email,))
        if c.fetchone():
            conn.close()
            return {'success': False, 'error': 'An account with this email already exists.'}
        hashed = sha256(pwd)
        joined = datetime.utcnow().isoformat()
        c.execute(
            'INSERT INTO users (first_name,last_name,email,phone,password,provider,joined_at) VALUES (?,?,?,?,?,?,?)',
            (first, last, email, phone, hashed, 'email', joined)
        )
        conn.commit()
        c.execute('SELECT id,first_name,last_name,email,phone,provider,joined_at FROM users WHERE email=?', (email,))
        row = dict(c.fetchone())
        conn.close()
        return {'success': True, 'user': {
            'id': row['id'],
            'name': f"{row['first_name']} {row['last_name']}".strip(),
            'email': row['email'], 'phone': row['phone'],
            'provider': row['provider'], 'joined_at': row['joined_at']
        }}
    except Exception as e:
        return {'success': False, 'error': str(e)}

def api_login(data):
    try:
        email = (data.get('email') or '').strip().lower()
        pwd   = data.get('password', '')
        if not email or not pwd:
            return {'success': False, 'error': 'Missing email or password'}
        hashed = sha256(pwd)
        conn = get_db()
        c = conn.cursor()
        c.execute(
            'SELECT id,first_name,last_name,email,phone,provider,joined_at FROM users WHERE email=? AND password=?',
            (email, hashed)
        )
        row = c.fetchone()
        conn.close()
        if not row:
            return {'success': False, 'error': 'Invalid email or password.'}
        row = dict(row)
        return {'success': True, 'user': {
            'id': row['id'],
            'name': f"{row['first_name']} {row['last_name']}".strip(),
            'email': row['email'], 'phone': row['phone'],
            'provider': row['provider'], 'joined_at': row['joined_at']
        }}
    except Exception as e:
        return {'success': False, 'error': str(e)}

def api_social_login(data):
    try:
        name     = (data.get('name')     or 'User').strip()
        email    = (data.get('email')    or '').strip().lower()
        provider = (data.get('provider') or 'google')
        if not email:
            return {'success': False, 'error': 'Email required'}
        conn = get_db()
        c = conn.cursor()
        c.execute('SELECT id FROM users WHERE email=?', (email,))
        if not c.fetchone():
            parts  = name.split(' ', 1)
            first  = parts[0]
            last   = parts[1] if len(parts) > 1 else ''
            joined = datetime.utcnow().isoformat()
            c.execute(
                'INSERT INTO users (first_name,last_name,email,phone,password,provider,joined_at) VALUES (?,?,?,?,?,?,?)',
                (first, last, email, '', 'social', provider, joined)
            )
            conn.commit()
        c.execute('SELECT id,first_name,last_name,email,phone,provider,joined_at FROM users WHERE email=?', (email,))
        row = dict(c.fetchone())
        conn.close()
        return {'success': True, 'user': {
            'id': row['id'],
            'name': f"{row['first_name']} {row['last_name']}".strip(),
            'email': row['email'], 'phone': row['phone'],
            'provider': row['provider'], 'joined_at': row['joined_at']
        }}
    except Exception as e:
        return {'success': False, 'error': str(e)}

def api_get_users():
    try:
        conn = get_db()
        c = conn.cursor()
        c.execute('SELECT id,first_name,last_name,email,phone,provider,joined_at FROM users ORDER BY id DESC')
        rows = [dict(r) for r in c.fetchall()]
        conn.close()
        return {'success': True, 'users': rows}
    except Exception as e:
        return {'success': False, 'error': str(e)}

def api_create_booking(data):
    try:
        import random
        order_id = f"MNS-{int(datetime.utcnow().timestamp()*1000)}-{random.randint(100,999)}"
        conn = get_db()
        c = conn.cursor()
        c.execute(
            '''INSERT INTO bookings
               (order_id,user_name,user_email,user_phone,event_id,event_title,
                event_date,event_time,event_venue,tickets,unit_price,total_price,status,booked_at)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?,'confirmed',?)''',
            (
                order_id,
                data.get('userName',''),
                (data.get('userEmail','') or '').lower().strip(),
                data.get('userPhone',''),
                data.get('eventId', 0),
                data.get('eventTitle',''),
                data.get('eventDate',''),
                data.get('eventTime',''),
                data.get('eventVenue',''),
                data.get('tickets', 1),
                data.get('unitPrice', 0),
                data.get('totalPrice', 0),
                datetime.utcnow().isoformat()
            )
        )
        conn.commit()
        conn.close()
        return {'success': True, 'orderId': order_id}
    except Exception as e:
        return {'success': False, 'error': str(e)}

def api_get_bookings():
    try:
        conn = get_db()
        c = conn.cursor()
        c.execute('''SELECT id,order_id,user_name,user_email,user_phone,
                            event_title,event_date,tickets,total_price,status,booked_at
                     FROM bookings ORDER BY id DESC''')
        rows = [dict(r) for r in c.fetchall()]
        conn.close()
        return {'success': True, 'bookings': rows}
    except Exception as e:
        return {'success': False, 'error': str(e)}

def api_delete_user(data):
    try:
        uid = data.get('id')
        if not uid:
            return {'success': False, 'error': 'No id provided'}
        conn = get_db()
        conn.execute('DELETE FROM users WHERE id=?', (uid,))
        conn.commit()
        conn.close()
        return {'success': True}
    except Exception as e:
        return {'success': False, 'error': str(e)}

# ─────────────────────────────────────────────────────────────
# HTTP Request Handler
# ─────────────────────────────────────────────────────────────
class ManasaHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=FOLDER, **kwargs)

    def do_OPTIONS(self):
        self.send_response(200)
        self._cors()
        self.end_headers()

    def do_GET(self):
        if self.path == '/' or self.path == '':
            self.path = '/index.html'
        # Health check endpoint — Render uses this to know server is alive
        if self.path == '/health' or self.path == '/ping':
            self._json({'status': 'ok', 'service': 'MANASA Events'})
            return
        # Serve API GETs
        if self.path.startswith('/api/'):
            self._handle_api_get()
        else:
            super().do_GET()

    def do_POST(self):
        if self.path.startswith('/api/'):
            length = int(self.headers.get('Content-Length', 0))
            body   = self.rfile.read(length)
            try:
                data = json.loads(body)
            except Exception:
                data = {}
            self._handle_api_post(data)
        else:
            self.send_error(404)

    def _handle_api_get(self):
        path = self.path.split('?')[0]
        if path == '/api/users':
            self._json(api_get_users())
        elif path == '/api/bookings':
            self._json(api_get_bookings())
        else:
            self._json({'error': 'Unknown endpoint'}, 404)

    def _handle_api_post(self, data):
        path = self.path.split('?')[0]
        if path == '/api/register':
            self._json(api_register(data))
        elif path == '/api/login':
            self._json(api_login(data))
        elif path == '/api/social-login':
            self._json(api_social_login(data))
        elif path == '/api/booking':
            self._json(api_create_booking(data))
        elif path == '/api/delete-user':
            self._json(api_delete_user(data))
        else:
            self._json({'error': 'Unknown endpoint'}, 404)

    def _json(self, obj, code=200):
        body = json.dumps(obj).encode()
        self.send_response(code)
        self._cors()
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', len(body))
        self.end_headers()
        self.wfile.write(body)

    def _cors(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def log_message(self, format, *args):
        try:
            method = args[0].split()[0] if args else ''
            path   = args[0].split()[1] if args and len(args[0].split()) > 1 else ''
            print(f"  {method:6} {path}")
        except Exception:
            pass

    def send_error(self, code, message=None, explain=None):
        # Override to send friendly JSON errors instead of raw HTML errors
        if code == 404:
            self._json({'error': 'Not found', 'code': 404}, 404)
        else:
            self._json({'error': message or 'Server error', 'code': code}, code)

# ─────────────────────────────────────────────────────────────
# Keep-alive ping — prevents Render free tier from sleeping
# Pings /health every 14 minutes (Render sleeps after 15 min)
# ─────────────────────────────────────────────────────────────
def keep_alive():
    import time, urllib.request
    time.sleep(60)  # wait 1 min after startup before pinging
    while True:
        try:
            url = os.environ.get('RENDER_EXTERNAL_URL', f'http://localhost:{PORT}')
            urllib.request.urlopen(f'{url}/health', timeout=10)
            print('  PING   /health (keep-alive)')
        except Exception as e:
            print(f'  PING   failed: {e}')
        time.sleep(840)  # 14 minutes


def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return '127.0.0.1'

# ─────────────────────────────────────────────────────────────
# Start
# ─────────────────────────────────────────────────────────────
if __name__ == '__main__':
    init_db()
    is_cloud = 'PORT' in os.environ  # Railway / cloud sets PORT

    print("=" * 55)
    print("   MANASA Events — Server")
    print("=" * 55)
    if is_cloud:
        print(f"\n  Running on cloud  (port {PORT})")
        print(f"  Database : {DB_FILE}")
        print(f"  Keep-alive ping every 14 min to prevent sleep")
        threading.Thread(target=keep_alive, daemon=True).start()
    else:
        local_ip = get_local_ip()
        print(f"\n  Your URL     : http://localhost:{PORT}")
        print(f"  Friends URL  : http://{local_ip}:{PORT}   ← same WiFi only")
        print(f"\n  For friends on different networks → deploy to Railway (see HOW_TO_RUN.txt)")
        print(f"\n  Press Ctrl+C to stop\n")
        print("-" * 55)
        def open_browser():
            import time; time.sleep(1.2)
            webbrowser.open(f'http://localhost:{PORT}/index.html')
        threading.Thread(target=open_browser, daemon=True).start()

    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('', PORT), ManasaHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print('\n\n  Server stopped.')
