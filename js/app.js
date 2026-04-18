/* ===== Wedding New — app.js ===== */

// ---- Petal rain on envelope screen ----
(function spawnPetals() {
  const container = document.getElementById('petals');
  if (!container) return;
  for (let i = 0; i < 22; i++) {
    const p = document.createElement('div');
    p.className = 'petal';
    p.style.left = Math.random() * 100 + 'vw';
    p.style.animationDuration = (4 + Math.random() * 6) + 's';
    p.style.animationDelay = (Math.random() * 6) + 's';
    p.style.width = (8 + Math.random() * 8) + 'px';
    p.style.height = (10 + Math.random() * 10) + 'px';
    p.style.opacity = (0.4 + Math.random() * 0.5).toString();
    container.appendChild(p);
  }
})();

// ---- Open invitation ----
function openInvitation() {
  const btn = document.getElementById('open-btn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

  const env = document.getElementById('envelope-screen');
  env.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
  env.style.opacity = '0';
  env.style.transform = 'scale(1.05)';

  setTimeout(function () {
    env.style.display = 'none';
    const main = document.getElementById('main-content');
    main.style.display = 'block';
    main.style.opacity = '0';
    main.style.transition = 'opacity 0.6s ease';
    document.body.style.overflow = 'auto';

    setTimeout(function () {
      main.style.opacity = '1';
      AOS.init({ once: true, offset: 60 });
      startCountdown();
      initNavHighlight();
      renderWishes();
      launchConfetti();
      tryAutoplay();
    }, 50);
  }, 850);
}

// ---- Confetti burst ----
function launchConfetti() {
  if (typeof confetti === 'undefined') return;
  var colors = ['#c9a84c', '#e8c97a', '#fff8e7', '#f5edd8'];
  confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: colors, zIndex: 9999 });
  setTimeout(function () {
    confetti({ particleCount: 50, spread: 100, origin: { y: 0.5 }, colors: colors, zIndex: 9999 });
  }, 600);
}

// ---- Countdown ----
function startCountdown() {
  var target = new Date('2024-05-01T18:38:00+05:30').getTime();
  function tick() {
    var diff = Math.abs(target - Date.now());
    document.getElementById('cd-days').textContent  = Math.floor(diff / 86400000);
    document.getElementById('cd-hours').textContent = Math.floor((diff % 86400000) / 3600000);
    document.getElementById('cd-mins').textContent  = Math.floor((diff % 3600000) / 60000);
    document.getElementById('cd-secs').textContent  = Math.floor((diff % 60000) / 1000);
  }
  tick();
  setInterval(tick, 1000);
}

// ---- Music ----
var audioEl = null;
var musicPlaying = false;

function tryAutoplay() {
  getAudio().play().then(function () {
    musicPlaying = true;
    document.getElementById('music-btn').classList.add('playing');
  }).catch(function () { /* autoplay blocked — user must tap */ });
}

function getAudio() {
  if (!audioEl) {
    audioEl = new Audio('assets/music/sound.mp3');
    audioEl.loop = true;
    audioEl.volume = 0.7;
  }
  return audioEl;
}

function toggleMusic() {
  var btn = document.getElementById('music-btn');
  var icon = document.getElementById('music-icon');
  if (musicPlaying) {
    getAudio().pause();
    musicPlaying = false;
    btn.classList.remove('playing');
    icon.className = 'fa-solid fa-music';
  } else {
    getAudio().play();
    musicPlaying = true;
    btn.classList.add('playing');
    icon.className = 'fa-solid fa-compact-disc';
  }
}

// ---- Bottom nav highlight on scroll ----
function initNavHighlight() {
  var sections = ['home', 'couple', 'events', 'gallery', 'wishes'];
  var navItems = document.querySelectorAll('.nav-item[data-section]');

  function onScroll() {
    var scrollY = window.scrollY + window.innerHeight * 0.4;
    var current = sections[0];
    sections.forEach(function (id) {
      var el = document.getElementById(id);
      if (el && el.offsetTop <= scrollY) current = id;
    });
    navItems.forEach(function (a) {
      a.classList.toggle('active', a.dataset.section === current);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ---- Lightbox ----
function openLightbox(src) {
  var lb = document.getElementById('lightbox');
  document.getElementById('lb-img').src = src;
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = 'auto';
}

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeLightbox();
});

// ---- Wishes (localStorage) ----
var WISHES_KEY = 'ps_wedding_wishes';

function getWishes() {
  try { return JSON.parse(localStorage.getItem(WISHES_KEY)) || []; }
  catch (e) { return []; }
}

function saveWishes(arr) {
  localStorage.setItem(WISHES_KEY, JSON.stringify(arr));
}

function renderWishes() {
  var list = document.getElementById('wishes-list');
  if (!list) return;
  var wishes = getWishes();
  if (wishes.length === 0) {
    list.innerHTML = '<p style="text-align:center;color:var(--text-muted);font-size:0.85rem;">Be the first to leave a wish 💛</p>';
    return;
  }
  list.innerHTML = wishes.slice().reverse().map(function (w) {
    return '<div class="wish-card">' +
      '<div class="wish-card-header">' +
      '<span class="wish-card-name">' + escHtml(w.name) + '</span>' +
      '<span class="wish-card-time">' + w.time + '</span>' +
      '</div>' +
      '<p class="wish-card-msg">' + escHtml(w.msg) + '</p>' +
      '</div>';
  }).join('');
}

function submitWish() {
  var nameEl = document.getElementById('wish-name');
  var msgEl  = document.getElementById('wish-msg');
  var name = nameEl.value.trim();
  var msg  = msgEl.value.trim();

  if (!name) { nameEl.focus(); shake(nameEl); return; }
  if (!msg)  { msgEl.focus();  shake(msgEl);  return; }

  var wishes = getWishes();
  wishes.push({
    name: name,
    msg: msg,
    time: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  });
  saveWishes(wishes);
  nameEl.value = '';
  msgEl.value  = '';
  renderWishes();

  // mini confetti
  if (typeof confetti !== 'undefined') {
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 }, colors: ['#c9a84c','#e8c97a','#fff'], zIndex: 9999 });
  }
}

function shake(el) {
  el.style.animation = 'none';
  el.style.borderColor = '#e74c3c';
  setTimeout(function () { el.style.borderColor = ''; }, 1200);
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
