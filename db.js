// ============================================================
// MANASA – API Database Layer
// ============================================================
// All data is stored in a SHARED SQLite database on the server.
// This means ALL users (you + your friends) see the same data.
//
// Requires: server.py to be running
// Start it: python3 server.py   (or double-click the .bat/.sh)
// ============================================================

const API = window.location.origin;

async function sha256(text) {
  const encoder = new TextEncoder();
  const data    = encoder.encode(text);
  const hashBuf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function verifyDBPassword(inputPassword) {
  const storedHash = localStorage.getItem('manasa_admin_hash');
  const inputHash  = await sha256(inputPassword);
  if (!storedHash) {
    localStorage.setItem('manasa_admin_hash', inputHash);
    return true;
  }
  return inputHash === storedHash;
}

async function initDB() { return true; }

async function dbRegister({ firstName, lastName, email, phone, password }) {
  try {
    const hashedPwd = await sha256(password);
    const res = await fetch(`${API}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, lastName, email, phone, password: hashedPwd })
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: 'Cannot connect to server. Is server.py running?' };
  }
}

async function dbLogin({ email, password }) {
  try {
    const hashedPwd = await sha256(password);
    const res = await fetch(`${API}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: hashedPwd })
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: 'Cannot connect to server. Is server.py running?' };
  }
}

async function dbSocialLogin({ name, email, provider }) {
  try {
    const res = await fetch(`${API}/api/social-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, provider })
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: 'Cannot connect to server. Is server.py running?' };
  }
}

async function dbGetAllUsers() {
  try {
    const res = await fetch(`${API}/api/users`);
    const data = await res.json();
    return data.users || [];
  } catch (err) { return []; }
}

async function dbDeleteUser(id) {
  try {
    const res = await fetch(`${API}/api/delete-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    return await res.json();
  } catch (err) { return { success: false }; }
}

async function dbCreateBooking({ userName, userEmail, userPhone, eventId, eventTitle, eventDate, eventTime, eventVenue, tickets, unitPrice, totalPrice }) {
  try {
    const res = await fetch(`${API}/api/booking`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName, userEmail, userPhone, eventId, eventTitle, eventDate, eventTime, eventVenue, tickets, unitPrice, totalPrice })
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: 'Cannot connect to server.' };
  }
}

async function dbGetAllBookings() {
  try {
    const res = await fetch(`${API}/api/bookings`);
    const data = await res.json();
    return data.bookings || [];
  } catch (err) { return []; }
}

async function dbClearBookings() { return; }
function persistDB() {}
