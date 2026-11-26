// Shared bean drawing + helpers
export const ROAST_COLORS = ['#2a160c', '#3b2113', '#55321b', '#7a4a26', '#9a6a3a'];
export const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const rand = (a, b) => a + Math.random() * (b - a);

const cache = new Map();

/** Pre-rendered bean sprite (canvas). `len` is the bean's length in CSS px. */
export function beanSprite(color, len, dpr = Math.min(window.devicePixelRatio || 1, 2)) {
  const key = `${color}|${len}|${dpr}`;
  if (cache.has(key)) return cache.get(key);
  const w = Math.ceil(len * 1.12 * dpr);
  const h = Math.ceil(len * 0.82 * dpr);
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const x = c.getContext('2d');
  x.translate(w / 2, h / 2);
  x.scale(dpr, dpr);
  const a = len / 2, b = len * 0.32;

  const g = x.createRadialGradient(-a * 0.35, -b * 0.5, b * 0.1, 0, 0, a * 1.05);
  g.addColorStop(0, shade(color, 38));
  g.addColorStop(0.45, color);
  g.addColorStop(1, shade(color, -34));
  x.fillStyle = g;
  x.beginPath(); x.ellipse(0, 0, a, b, 0, 0, Math.PI * 2); x.fill();

  // soft shine
  x.fillStyle = 'rgba(255,255,255,.13)';
  x.beginPath(); x.ellipse(-a * 0.2, -b * 0.42, a * 0.5, b * 0.2, -0.2, 0, Math.PI * 2); x.fill();

  // crease (S-curve)
  x.lineCap = 'round';
  x.strokeStyle = 'rgba(18,9,4,.85)';
  x.lineWidth = Math.max(1.4, len * 0.075);
  x.beginPath();
  x.moveTo(-a * 0.86, b * 0.1);
  x.bezierCurveTo(-a * 0.35, -b * 0.95, a * 0.1, b * 0.95, a * 0.86, -b * 0.05);
  x.stroke();
  x.strokeStyle = 'rgba(255,220,170,.16)';
  x.lineWidth = Math.max(0.8, len * 0.025);
  x.beginPath();
  x.moveTo(-a * 0.86, b * 0.2);
  x.bezierCurveTo(-a * 0.35, -b * 0.85, a * 0.1, b * 1.05, a * 0.86, 0.05 * b);
  x.stroke();

  cache.set(key, c);
  return c;
}

export function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const r = clamp((n >> 16) + amt, 0, 255);
  const g = clamp(((n >> 8) & 255) + amt, 0, 255);
  const b = clamp((n & 255) + amt, 0, 255);
  return `rgb(${r},${g},${b})`;
}

export function mixHex(c1, c2, t) {
  const a = parseInt(c1.slice(1), 16), b = parseInt(c2.slice(1), 16);
  const r = Math.round(lerp(a >> 16, b >> 16, t));
  const g = Math.round(lerp((a >> 8) & 255, (b >> 8) & 255, t));
  const bl = Math.round(lerp(a & 255, b & 255, t));
  return `rgb(${r},${g},${bl})`;
}

export function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove('show'), 2800);
}
