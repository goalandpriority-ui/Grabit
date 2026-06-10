/* ============================================
   GrabIt — app.js
   Frontend logic for video download flow
   ============================================ */

const BACKEND_URL = 'https://grabit-fzi4.onrender.com';

// ── NAV TOGGLE (mobile) ──
const navToggle = document.querySelector('.nav-toggle');
const navLinks  = document.querySelector('.nav-links');
if (navToggle) {
  navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
}

// ── ACTIVE NAV LINK ──
document.querySelectorAll('.nav-links a').forEach(link => {
  if (link.href === location.href) link.classList.add('active');
});

// ── PLATFORM DETECT ──
function detectPlatform(url) {
  const map = [
    ['youtube.com', 'YouTube'], ['youtu.be', 'YouTube'],
    ['instagram.com', 'Instagram'],
    ['facebook.com', 'Facebook'], ['fb.watch', 'Facebook'],
    ['tiktok.com', 'TikTok'],
    ['twitter.com', 'Twitter/X'], ['x.com', 'Twitter/X'],
    ['reddit.com', 'Reddit'],
    ['vimeo.com', 'Vimeo'],
    ['twitch.tv', 'Twitch'],
    ['dailymotion.com', 'Dailymotion'],
    ['soundcloud.com', 'SoundCloud'],
    ['pinterest.com', 'Pinterest'],
    ['linkedin.com', 'LinkedIn'],
    ['ted.com', 'TED'],
    ['sharechat.com', 'ShareChat'],
    ['moj.in', 'Moj'],
  ];
  for (const [domain, name] of map) {
    if (url.includes(domain)) return name;
  }
  return 'Video';
}

// ── MAIN DOWNLOAD LOGIC ──
const urlInput   = document.getElementById('urlInput');
const grabBtn    = document.getElementById('grabBtn');
const statusBox  = document.getElementById('status');
const resultBox  = document.getElementById('resultBox');

function showStatus(type, msg) {
  statusBox.className = `status show ${type}`;
  statusBox.innerHTML = type === 'loading'
    ? `<div class="spinner"></div><span>${msg}</span>`
    : `<span>${type === 'error' ? '✕' : '✓'}</span><span>${msg}</span>`;
}

function hideStatus() {
  statusBox.className = 'status';
}

async function grabVideo() {
  const url = urlInput.value.trim();
  if (!url) { showStatus('error', 'Please paste a video URL first.'); return; }

  resultBox.classList.remove('show');
  showStatus('loading', 'Fetching video info…');
  grabBtn.disabled = true;

  try {
    const res = await fetch(`${BACKEND_URL}/info`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    if (!res.ok) throw new Error('Could not fetch video. Check the URL and try again.');
    const data = await res.json();

    hideStatus();
    renderResult(data, url);
  } catch (err) {
    showStatus('error', err.message || 'Something went wrong. Try again.');
  } finally {
    grabBtn.disabled = false;
  }
}

function renderResult(data, url) {
  const platform = detectPlatform(url);

  document.getElementById('resThumb').src  = data.thumbnail || '';
  document.getElementById('resTitle').textContent    = data.title || 'Untitled Video';
  document.getElementById('resPlatform').textContent = platform;

  const qualityRow = document.getElementById('qualityRow');
  qualityRow.innerHTML = '';

  const formats = data.formats || [{ label: 'Best Quality', url: data.download_url }];
  formats.forEach((fmt, i) => {
    const btn = document.createElement('button');
    btn.className = 'quality-btn' + (i === 0 ? ' selected' : '');
    btn.textContent = fmt.label;
    btn.dataset.url = fmt.url;
    btn.onclick = () => {
      document.querySelectorAll('.quality-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    };
    qualityRow.appendChild(btn);
  });

  resultBox.classList.add('show');
}

async function downloadSelected() {
  const selected = document.querySelector('.quality-btn.selected');
  if (!selected) return;

  const dlUrl = selected.dataset.url;
  if (!dlUrl) { showStatus('error', 'No download URL found.'); return; }

  showStatus('loading', 'Starting download…');

  try {
    // Proxy download through backend to avoid CORS
    const res = await fetch(`${BACKEND_URL}/download`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: dlUrl })
    });

    if (!res.ok) throw new Error('Download failed.');

    const blob = await res.blob();
    const a    = document.createElement('a');
    a.href     = URL.createObjectURL(blob);
    a.download = document.getElementById('resTitle').textContent + '.mp4';
    a.click();
    URL.revokeObjectURL(a.href);

    showStatus('success', 'Download started! Check your downloads folder.');
  } catch (err) {
    showStatus('error', err.message);
  }
}

// ── EVENT LISTENERS ──
if (grabBtn) grabBtn.addEventListener('click', grabVideo);

if (urlInput) {
  urlInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') grabVideo();
  });
}

const dlBtn = document.getElementById('dlBtn');
if (dlBtn) dlBtn.addEventListener('click', downloadSelected);

// ── FAQ ACCORDION ──
document.querySelectorAll('.faq-q').forEach(q => {
  q.addEventListener('click', () => {
    const item = q.closest('.faq-item');
    item.classList.toggle('open');
  });
});

// ── CONTACT FORM ──
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type=submit]');
    btn.textContent = 'Sending…';
    btn.disabled = true;

    // Replace with your form backend (Formspree / EmailJS etc.)
    await new Promise(r => setTimeout(r, 1500));

    btn.textContent = 'Message Sent ✓';
    contactForm.reset();
    setTimeout(() => { btn.textContent = 'Send Message'; btn.disabled = false; }, 3000);
  });
      }
    
