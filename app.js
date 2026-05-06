// ============================================================
// MANASA – Main Application JS
// ============================================================

// ── EVENT DATA ──────────────────────────────────────────────
const EVENTS = [
  { id: 1, title: "EDM Night Out", category: "music", date: "2026-05-09", time: "9:00 PM", venue: "Palace Grounds", location: "Bengaluru", price: 799, originalPrice: 999, emoji: "🎶", gradient: "linear-gradient(135deg,#f97316,#ef4444)", description: "The biggest EDM night in Bengaluru with top international DJs.", rating: 4.8, reviews: 234, trending: true, tags: ["Electronic", "Dance", "Nightlife"] },
  { id: 2, title: "DevFest 2025", category: "tech", date: "2026-05-11", time: "9:00 AM", venue: "NIMHANS Convention Centre", location: "Bengaluru", price: 0, emoji: "💻", gradient: "linear-gradient(135deg,#8b5cf6,#3b82f6)", description: "Google Developer Groups' annual tech fest with 50+ talks and workshops.", rating: 4.9, reviews: 412, trending: true, tags: ["Google", "Flutter", "AI/ML"] },
  { id: 3, title: "Street Food Carnival", category: "food", date: "2026-05-03", time: "11:00 AM", venue: "Cubbon Park", location: "Bengaluru", price: 0, emoji: "🍜", gradient: "linear-gradient(135deg,#10b981,#06b6d4)", description: "100+ street food stalls from across India. Eat, explore, and enjoy!", rating: 4.7, reviews: 589, trending: true, tags: ["Food", "Street", "Family"] },
  { id: 4, title: "The Comedy Factory", category: "comedy", date: "2026-05-09", time: "7:30 PM", venue: "Humming Tree, Indiranagar", location: "Bengaluru", price: 499, emoji: "😂", gradient: "linear-gradient(135deg,#fbbf24,#f97316)", description: "An evening of stand-up comedy featuring 5 top comedians.", rating: 4.6, reviews: 178, trending: false, tags: ["Stand-up", "Comedy", "Adults"] },
  { id: 5, title: "Yoga & Meditation Retreat", category: "wellness", date: "2026-05-11", time: "6:00 AM", venue: "Lal Bagh Botanical Garden", location: "Bengaluru", price: 299, emoji: "🧘", gradient: "linear-gradient(135deg,#06d6a0,#10b981)", description: "Start your Sunday with a guided yoga session in the serene Lal Bagh.", rating: 4.9, reviews: 97, trending: false, tags: ["Yoga", "Wellness", "Morning"] },
  { id: 6, title: "Bengaluru Half Marathon", category: "sports", date: "2026-05-17", time: "5:30 AM", venue: "Kanteerava Stadium", location: "Bengaluru", price: 999, emoji: "🏃", gradient: "linear-gradient(135deg,#ef4444,#f97316)", description: "The iconic Bengaluru Half Marathon — 21 km through the heart of the city.", rating: 4.8, reviews: 1204, trending: true, tags: ["Running", "Fitness", "Marathon"] },
  { id: 7, title: "AI Summit Bengaluru", category: "tech", date: "2026-05-22", time: "10:00 AM", venue: "The Leela Palace", location: "Bengaluru", price: 2999, emoji: "🤖", gradient: "linear-gradient(135deg,#6366f1,#8b5cf6)", description: "Industry leaders discuss the future of AI, LLMs, and responsible AI development.", rating: 4.7, reviews: 203, trending: true, tags: ["AI", "ML", "Enterprise"] },
  { id: 8, title: "Carnatic Classical Night", category: "music", date: "2026-05-16", time: "6:30 PM", venue: "Chowdiah Memorial Hall", location: "Bengaluru", price: 400, emoji: "🎵", gradient: "linear-gradient(135deg,#dc2626,#f59e0b)", description: "An evening of soul-stirring Carnatic music performed by maestros.", rating: 4.9, reviews: 156, trending: false, tags: ["Classical", "Carnatic", "Cultural"] },
  { id: 9, title: "Watercolor Workshop", category: "workshop", date: "2026-05-17", time: "3:00 PM", venue: "Artjam Studio, HSR Layout", location: "Bengaluru", price: 1200, emoji: "🎨", gradient: "linear-gradient(135deg,#ec4899,#a855f7)", description: "Learn watercolor painting from scratch with professional artist Meena Iyer.", rating: 4.8, reviews: 64, trending: false, tags: ["Art", "Painting", "Beginner"] },
  { id: 10, title: "Craft Beer Festival", category: "food", date: "2026-05-24", time: "4:00 PM", venue: "UB City Courtyard", location: "Bengaluru", price: 599, emoji: "🍺", gradient: "linear-gradient(135deg,#f59e0b,#ef4444)", description: "Taste 60+ craft beers from 20 local and national breweries. Live music included!", rating: 4.6, reviews: 321, trending: true, tags: ["Beer", "Craft", "Adults"] },
  { id: 11, title: 'Standup Paddleboard Yoga', category: 'wellness', date: '2026-05-25', time: '7:00 AM', venue: 'Ulsoor Lake', location: 'Bengaluru', price: 1800, emoji: '🏄', gradient: 'linear-gradient(135deg,#06b6d4,#6366f1)', description: 'Combine yoga with stand-up paddleboarding for a truly unique morning experience.', rating: 4.7, reviews: 43, trending: false, tags: ['Yoga', 'Outdoor', 'Unique'] },
  { id: 12, title: 'Thriller Book Club Live', category: 'workshop', date: '2026-05-18', time: '6:00 PM', venue: 'Atta Galatta, Koramangala', location: 'Bengaluru', price: 150, emoji: '📚', gradient: 'linear-gradient(135deg,#1e3a5f,#0ea5e9)', description: 'Live author session and discussion for this month\'s thriller pick.', rating: 4.5, reviews: 88, trending: false, tags: ['Books', 'Reading', 'Literary'] },
  { id: 13, title: 'Neon Bollywood Night', category: 'music', date: '2026-06-06', time: '8:00 PM', venue: 'JW Marriott, Vittal Mallya Rd', location: 'Bengaluru', price: 899, originalPrice: 1199, emoji: '🎤', gradient: 'linear-gradient(135deg,#ec4899,#f97316)', description: 'Dance to retro & modern Bollywood hits under neon lights with live DJ and singers.', rating: 4.8, reviews: 312, trending: true, tags: ['Bollywood', 'Dance', 'Nightlife'] },
  { id: 14, title: 'Startup Pitch Night', category: 'tech', date: '2026-06-12', time: '5:00 PM', venue: 'WeWork Galaxy, MG Road', location: 'Bengaluru', price: 0, emoji: '🚀', gradient: 'linear-gradient(135deg,#0ea5e9,#10b981)', description: 'Watch 12 early-stage startups pitch to top VCs. Open to founders, investors & enthusiasts.', rating: 4.9, reviews: 176, trending: true, tags: ['Startups', 'Networking', 'Investors'] },
];

const WEEKEND_EVENTS = EVENTS.slice(0, 5);

// ── NAVBAR SCROLL ────────────────────────────────────────────
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (nav) {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }
});

// ── HAMBURGER ────────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });
}

// ── RENDER TRENDING GRID ─────────────────────────────────────
function renderTrendingGrid() {
  const grid = document.getElementById('trendingGrid');
  if (!grid) return;
  const trending = EVENTS.filter(e => e.trending).slice(0, 6);
  grid.innerHTML = trending.map(e => createEventCard(e)).join('');
}

// ── RENDER WEEKEND LIST ──────────────────────────────────────
function renderWeekendList() {
  const list = document.getElementById('weekendList');
  if (!list) return;
  const items = WEEKEND_EVENTS;
  const days = ['03', '09', '11', '17', '18'];
  const months = ['May', 'May', 'May', 'May', 'May'];
  list.innerHTML = items.map((e, i) => `
    <div class="weekend-item" onclick="window.location='event-detail.html?id=${e.id}'">
      <div class="weekend-date">
        <div class="day">${days[i]}</div>
        <div class="mon">${months[i]}</div>
      </div>
      <div class="weekend-thumb" style="background:${e.gradient}">${e.emoji}</div>
      <div class="weekend-info">
        <h4>${e.title}</h4>
        <p><i class="fas fa-map-marker-alt"></i> ${e.venue} · ${e.time}</p>
      </div>
      <div class="weekend-price">${e.price === 0 ? 'FREE' : '₹' + e.price}</div>
    </div>
  `).join('');
}

// ── EVENT CARD TEMPLATE ──────────────────────────────────────
function createEventCard(e) {
  const savedEvents = JSON.parse(localStorage.getItem('savedEvents') || '[]');
  const isSaved = savedEvents.includes(e.id);
  return `
    <div class="event-card" onclick="window.location='event-detail.html?id=${e.id}'">
      <div class="event-thumb" style="background:${e.gradient}">
        <div class="thumb-badge">${e.category}</div>
        <div class="thumb-save ${isSaved ? 'saved' : ''}" onclick="toggleSave(event, ${e.id}, this)">
          <i class="fa${isSaved ? 's' : 'r'} fa-heart" style="color:${isSaved ? '#ff5c35' : 'white'}"></i>
        </div>
        <span style="font-size:56px">${e.emoji}</span>
        <div class="thumb-price">${e.price === 0 ? 'FREE' : '₹' + e.price}</div>
      </div>
      <div class="event-body">
        <div class="event-meta">
          <span><i class="far fa-calendar"></i> ${formatDate(e.date)}</span>
          <span><i class="far fa-clock"></i> ${e.time}</span>
        </div>
        <h3>${e.title}</h3>
        <p><i class="fas fa-map-marker-alt" style="color:var(--accent);margin-right:4px"></i>${e.venue}</p>
      </div>
      <div class="event-footer">
        <div class="event-rating">★ ${e.rating} <span>(${e.reviews})</span></div>
        <button class="btn-book" onclick="event.stopPropagation(); bookEvent(${e.id})">Book Now</button>
      </div>
    </div>
  `;
}

// ── TOGGLE SAVE ──────────────────────────────────────────────
function toggleSave(event, id, btn) {
  event.stopPropagation();
  let saved = JSON.parse(localStorage.getItem('savedEvents') || '[]');
  if (saved.includes(id)) {
    saved = saved.filter(s => s !== id);
    btn.innerHTML = '<i class="far fa-heart"></i>';
    showToast('Removed from saved events');
  } else {
    saved.push(id);
    btn.innerHTML = '<i class="fas fa-heart" style="color:#ff5c35"></i>';
    showToast('Event saved! ❤️');
  }
  localStorage.setItem('savedEvents', JSON.stringify(saved));
}

// ── BOOK EVENT ───────────────────────────────────────────────
function bookEvent(id) {
  window.location.href = 'booking.html?id=' + id;
}

// ── DATE FORMATTER ───────────────────────────────────────────
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── TOAST ────────────────────────────────────────────────────
function showToast(msg) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ── SEARCH HERO ──────────────────────────────────────────────
const heroSearch = document.getElementById('heroSearch');
if (heroSearch) {
  heroSearch.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      window.location.href = `events.html?q=${encodeURIComponent(heroSearch.value)}`;
    }
  });
}

// ── INIT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderTrendingGrid();
  renderWeekendList();
});

// ── ANIMATIONS: Fade in on scroll ────────────────────────────
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.cat-card, .event-card, .review-card, .blog-card, .weekend-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });
});
