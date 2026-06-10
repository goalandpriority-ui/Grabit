# GrabIt — Universal Video Downloader

Free online video downloader for 1000+ platforms. Built with HTML/CSS/JS frontend + Python Flask + yt-dlp backend.

---

## 📁 Project Structure

```
grabit/
├── index.html              ← Homepage + downloader UI
├── supported-sites.html    ← Platform list
├── how-to-use.html         ← Step-by-step guide
├── faq.html                ← FAQ (AdSense ready)
├── about.html              ← About page
├── contact.html            ← Contact form
├── privacy-policy.html     ← Privacy Policy (AdSense critical)
├── terms.html              ← Terms & Conditions
├── dmca.html               ← DMCA Policy
├── disclaimer.html         ← Disclaimer
├── 404.html                ← 404 page
├── sitemap.xml             ← SEO sitemap
├── robots.txt              ← SEO robots
├── css/
│   └── style.css           ← All styles
├── js/
│   └── app.js              ← Frontend JS
└── backend/
    ├── app.py              ← Flask API (yt-dlp)
    ├── requirements.txt    ← Python deps
    └── Procfile            ← Render.com start command
```

---

## 🚀 Deployment Guide

### Step 1 — Deploy Backend on Render.com (Free)

1. Push `backend/` folder to a GitHub repo
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo
4. Settings:
   - **Environment:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120`
5. Deploy — copy your Render URL (e.g. `https://grabit-api.onrender.com`)

### Step 2 — Update Frontend

In `js/app.js`, update line 4:
```js
const BACKEND_URL = 'https://grabit-api.onrender.com'; // your Render URL
```

### Step 3 — Deploy Frontend

Options:
- **Netlify** (recommended): drag & drop the `grabit/` folder
- **Vercel**: `vercel --prod`
- **GitHub Pages**: push to `gh-pages` branch

### Step 4 — Custom Domain

1. Buy domain (e.g. grabIt.app) from Namecheap/GoDaddy
2. Point DNS to Netlify/Vercel
3. Update all `grabIt.app` references in HTML files to your domain
4. Update `sitemap.xml` URLs

---

## 💰 AdSense Setup

1. Go to [adsense.google.com](https://adsense.google.com) → Add Site
2. Paste your domain
3. Add the AdSense script tag to all HTML pages (already commented in `index.html`)
4. Replace ad slot placeholders with real AdSense ad units
5. Wait for approval (usually 2–4 weeks)

**AdSense Checklist:**
- [x] Privacy Policy page
- [x] Terms & Conditions page
- [x] DMCA Policy page
- [x] Disclaimer page
- [x] Contact page
- [x] About page
- [x] Enough content on all pages
- [x] Mobile responsive
- [x] Fast loading
- [ ] Custom domain (you need to add this)
- [ ] Site live for 3+ months (Google prefers this)
- [ ] Add Google Analytics

---

## 🔧 Contact Form Setup

The contact form needs a backend. Easy options:

**Option A — Formspree (free):**
1. Go to [formspree.io](https://formspree.io) → New Form
2. Replace the form submission logic in `app.js` with:
```js
const res = await fetch('https://formspree.io/f/YOUR_ID', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(Object.fromEntries(new FormData(contactForm)))
});
```

**Option B — EmailJS (free tier):**
Follow [emailjs.com](https://emailjs.com) setup docs.

---

## 📧 Email Addresses to Create

- support@grabIt.app — general support
- dmca@grabIt.app — DMCA notices
- privacy@grabIt.app — privacy requests
- legal@grabIt.app — legal queries

Use [Zoho Mail](https://zoho.com/mail) free plan with your custom domain.

---

## ⚠️ Important Notes

- Update copyright year in footers annually
- Keep `yt-dlp` updated regularly: `pip install -U yt-dlp`
- Do NOT use words like "piracy", "free movies", "crack" anywhere
- Always frame as "personal offline viewing"
- Render.com free tier sleeps after 15min inactivity — add a keep-alive ping if needed

---

Built with ❤️ — GrabIt Team
