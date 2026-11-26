// Bean cursor, bean trail, click bursts
import { beanSprite, ROAST_COLORS, reduceMotion, finePointer, rand, lerp } from './beans.js';

const canvas = document.getElementById('fx');
const ctx = canvas.getContext('2d');
const cursor = document.querySelector('.cursor');
const label = cursor.querySelector('.cursor-label');
let W = 0, H = 0, dpr = 1;
const parts = [];

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth; H = window.innerHeight;
  canvas.width = W * dpr; canvas.height = H * dpr;
  canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
}
resize();
window.addEventListener('resize', resize);

let mx = -100, my = -100, cx = -100, cy = -100, ang = 0, lastX = null, lastY = null, acc = 0;
let started = false;

if (finePointer) {
  document.documentElement.classList.add('has-cursor');
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    mx = e.clientX; my = e.clientY;
    if (!started) { started = true; cx = mx; cy = my; cursor.classList.add('on'); }
    const t = e.target.closest && e.target.closest('[data-cursor], a, button, .row, canvas#latte');
    if (t) {
      cursor.classList.add('hot');
      label.textContent = t.dataset?.cursor || (t.id === 'latte' ? 'Pour' : '');
    } else {
      cursor.classList.remove('hot'); label.textContent = '';
    }
    if (!reduceMotion) trail(mx, my);
  }, { passive: true });
  document.addEventListener('pointerleave', () => cursor.classList.remove('on'));
  document.addEventListener('pointerenter', () => started && cursor.classList.add('on'));
  window.addEventListener('pointerdown', () => cursor.classList.add('down'));
  window.addEventListener('pointerup', () => cursor.classList.remove('down'));
}

function trail(x, y) {
  if (lastX === null) { lastX = x; lastY = y; return; }
  acc += Math.hypot(x - lastX, y - lastY);
  lastX = x; lastY = y;
  if (acc > 46) {
    acc = 0;
    parts.push({
      x: x + rand(-4, 4), y: y + rand(-4, 4), vx: rand(-18, 18), vy: rand(-10, 30),
      a: rand(0, 6.28), va: rand(-4, 4), life: 0, max: rand(0.55, 0.9), len: rand(9, 14),
      c: ROAST_COLORS[(Math.random() * 4) | 0], g: 120, alpha: 0.8
    });
  }
}

export function burst(x, y, n = 12) {
  if (reduceMotion) return;
  for (let i = 0; i < n; i++) {
    const a = rand(0, Math.PI * 2), s = rand(160, 460);
    parts.push({
      x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 120,
      a: rand(0, 6.28), va: rand(-14, 14), life: 0, max: rand(0.8, 1.3),
      len: rand(14, 24), c: ROAST_COLORS[(Math.random() * 5) | 0], g: 1100, alpha: 1
    });
  }
}

// click bursts everywhere except the hero (which has real physics beans)
window.addEventListener('pointerdown', (e) => {
  if (e.target.closest && e.target.closest('#home, #latte, .tab-panel')) return;
  burst(e.clientX, e.clientY, 11);
});

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;

  if (finePointer && started) {
    cx = lerp(cx, mx, 0.28); cy = lerp(cy, my, 0.28);
    const dx = mx - cx, dy = my - cy;
    if (Math.hypot(dx, dy) > 1.2) {
      const target = Math.atan2(dy, dx);
      let d = target - ang; while (d > Math.PI) d -= 6.283; while (d < -Math.PI) d += 6.283;
      ang += d * 0.18;
    }
    cursor.style.transform = `translate3d(${cx}px,${cy}px,0)`;
    cursor.style.setProperty('--rot', ang + 'rad');
  }

  if (parts.length || ctx._dirty) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life += dt;
      if (p.life >= p.max) { parts.splice(i, 1); continue; }
      p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.a += p.va * dt;
      p.vx *= 1 - 1.4 * dt;
      const k = p.life / p.max;
      const s = p.len * (1 - k * 0.3);
      const spr = beanSprite(p.c, Math.round(p.len), dpr);
      ctx.globalAlpha = p.alpha * (1 - k * k);
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.a);
      const sc = s / p.len;
      ctx.drawImage(spr, -spr.width / dpr / 2 * sc, -spr.height / dpr / 2 * sc, spr.width / dpr * sc, spr.height / dpr * sc);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    ctx._dirty = parts.length > 0;
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
