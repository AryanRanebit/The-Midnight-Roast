import '@fontsource-variable/fraunces/full.css';
import '@fontsource-variable/fraunces/full-italic.css';
import '@fontsource/instrument-sans/400.css';
import '@fontsource/instrument-sans/500.css';
import '@fontsource/instrument-sans/600.css';
import '@fontsource/jetbrains-mono/400.css';
import './style.css';
import Lenis from 'lenis';
import { reduceMotion, toast, clamp } from './beans.js';
import { burst } from './fx.js';
import { initHero } from './hero.js';
import { initRoast } from './roast.js';
import { initMenu } from './menu.js';
import { initLatte } from './latte.js';

// Social links: the original site had placeholder "#" links, and no real URLs were provided.
// Add real URLs here and the buttons become links automatically.
const SOCIALS = { Instagram: '', Twitter: '', Facebook: '' };

// ---------- smooth scroll ----------
let lenis = null;
if (!reduceMotion) {
  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.95, smoothWheel: true });
}
const scrollVel = { v: 0 };
function raf(t) {
  lenis && lenis.raf(t);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

export function scrollTo(target, opts = {}) {
  if (lenis) lenis.scrollTo(target, { duration: 1.3, easing: (t) => 1 - Math.pow(1 - t, 4), ...opts });
  else {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + (opts.offset || 0), behavior: 'auto' });
  }
}

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const t = document.querySelector(id);
    if (!t) return;
    e.preventDefault();
    closeMenu();
    scrollTo(t, { offset: id === '#home' ? 0 : id === '#about' ? 0 : -10 });
  });
});
document.getElementById('toTop').addEventListener('click', () => scrollTo(0));

// ---------- nav ----------
const nav = document.getElementById('nav');
const burger = document.getElementById('burger');
function closeMenu() {
  nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false');
  burger.setAttribute('aria-label', 'Open menu'); document.documentElement.classList.remove('menu-open');
  lenis && lenis.start();
}
burger.addEventListener('click', () => {
  const open = !nav.classList.contains('open');
  nav.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', open);
  burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  document.documentElement.classList.toggle('menu-open', open);
  lenis && (open ? lenis.stop() : lenis.start());
});
window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

// active link
const secs = ['about', 'menu', 'vibe', 'location'].map(id => document.getElementById(id));
const links = [...document.querySelectorAll('#navLinks a')];

// ---------- headings: word rise ----------
document.querySelectorAll('[data-split]').forEach(h => {
  const words = h.textContent.trim().split(/\s+/);
  h.setAttribute('aria-label', h.textContent.trim());
  h.innerHTML = words.map((w, i) => `<span class="w" aria-hidden="true"><span style="--i:${i}">${w}</span></span>`).join(' ');
});
const io = new IntersectionObserver((entries) => {
  entries.forEach(en => {
    if (!en.isIntersecting) return;
    const el = en.target;
    el.classList.add('in'); io.unobserve(el);
    // hand transitions back to the element once revealed (so hover states work normally)
    if (el.classList.contains('reveal')) setTimeout(() => el.classList.remove('reveal', 'in'), 1100);
  });
}, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });
document.querySelectorAll('[data-split], .menu-head > *:not(h2), .vibe-copy > *:not(h2), .cup-wrap, .row, .visit .col, .visit-word, .menu-aside')
  .forEach((el) => { if (!el.matches('[data-split]')) el.classList.add('reveal'); io.observe(el); });

// ---------- scroll-linked: progress, hero parallax, nav, marquee ----------
const progBean = document.querySelector('.progress svg');
const progLine = document.querySelector('.progress i');
const lines = [...document.querySelectorAll('.hero-title .line')];
const badge = document.querySelector('.badge');
const badgeSvg = badge.querySelector('svg');
const hero = document.getElementById('home');
const band = document.getElementById('band');
const bandTrack = document.getElementById('bandTrack');
const run = bandTrack.querySelector('.band-run');
const oBean = document.getElementById('oBean');
let bandX = 0, dir = -1, lastY = window.scrollY, vel = 0, oSpin = 0, oCur = 0;

// duplicate marquee content for a seamless loop
bandTrack.appendChild(run.cloneNode(true));
bandTrack.appendChild(run.cloneNode(true));
bandTrack.lastChild.setAttribute('aria-hidden', 'true');
bandTrack.children[1].setAttribute('aria-hidden', 'true');
band.addEventListener('click', () => { dir *= -1; toast(dir > 0 ? 'Reversed. Same sarcasm, other direction.' : 'And we\'re back to normal.'); });

function secUpdate() {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const p = clamp(y / Math.max(1, max), 0, 1);
  progLine.style.transform = `scaleY(${p})`;
  progBean.style.transform = `translate(-50%, ${p * (window.innerHeight * 0.6)}px) rotate(${p * 1800}deg)`;
  nav.classList.toggle('scrolled', y > 40);
  // active nav link
  let active = null;
  secs.forEach(s => { const r = s.getBoundingClientRect(); if (r.top < window.innerHeight * 0.4 && r.bottom > window.innerHeight * 0.4) active = s.id; });
  links.forEach(l => l.classList.toggle('is-on', l.getAttribute('href') === '#' + active));
}

function tick() {
  const y = window.scrollY;
  vel = vel * 0.85 + (y - lastY) * 0.15; lastY = y;
  if (!reduceMotion) {
    if (y < window.innerHeight * 1.2) {
      lines.forEach(l => { l.style.transform = `translate3d(${Number(l.dataset.dir) * y * 0.16}px,0,0)`; });
      badgeSvg.style.transform = `rotate(${y * 0.25}deg)`;
      oCur += ((y * 0.5 + oSpin) - oCur) * 0.08;
      oBean.style.setProperty('--r', oCur.toFixed(1) + 'deg');
    }
    // marquee: constant drift + scroll-velocity push
    const w = run.offsetWidth;
    if (w) {
      bandX += dir * (0.7 + Math.abs(vel) * 0.35);
      if (bandX <= -w) bandX += w; if (bandX > 0) bandX -= w;
      bandTrack.style.transform = `translate3d(${bandX}px,0,0)`;
    }
  }
  requestAnimationFrame(tick);
}
window.addEventListener('scroll', secUpdate, { passive: true });
secUpdate(); tick();

// click the "o" in Roast
oBean.addEventListener('click', (e) => { oSpin += 720; burst(e.clientX, e.clientY, 10); });

// ---------- open / closed ----------
function status() {
  const el = document.getElementById('status');
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date());
  const h = +parts.find(p => p.type === 'hour').value % 24, m = +parts.find(p => p.type === 'minute').value;
  const mins = h * 60 + m, open = mins >= 7 * 60 && mins < 18 * 60;
  el.classList.toggle('open', open);
  let txt;
  if (open) {
    const left = 18 * 60 - mins;
    txt = left <= 60 ? `Open now. Closing soon, so hurry (${left} min left).` : 'Open right now. Go. Go now.';
  } else {
    txt = mins < 7 * 60 ? 'Not open yet. We open at 7:00 AM. Sleep in, just not too long.' : 'Closed for today. Back at 7:00 AM, caffeine permitting.';
  }
  el.querySelector('span').textContent = txt;
}
status(); setInterval(status, 60000);

// ---------- footer buttons ----------
document.getElementById('copyAddr').addEventListener('click', async () => {
  const text = 'Vedant Kalp Apt, Katrap, Badlapur, Maharashtra';
  try { await navigator.clipboard.writeText(text); toast('Address copied. Navigation: your problem now.'); }
  catch { toast(text); }
});
document.querySelectorAll('[data-social]').forEach(b => {
  b.addEventListener('click', () => {
    const url = SOCIALS[b.dataset.social];
    if (url) window.open(url, '_blank', 'noopener');
    else toast(`${b.dataset.social}: still brewing. Check back soon.`);
  });
});

// ---------- go ----------
initHero();
initRoast();
initMenu({ scrollTo });
initLatte();
