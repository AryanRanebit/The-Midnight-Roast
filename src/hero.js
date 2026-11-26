// Hero: a real pile of coffee beans (gravity, collisions, cursor shoves, click bursts)
import { beanSprite, ROAST_COLORS, reduceMotion, rand, clamp } from './beans.js';

export function initHero() {
  const hero = document.getElementById('home');
  const canvas = document.getElementById('heroCanvas');
  const ctx = canvas.getContext('2d');
  const dprMax = 2;
  let dpr = 1, W = 0, H = 0, len = 48, R = 17;
  let beans = [];
  let queue = 0, qTimer = 0;
  let visible = true;
  const ptr = { x: -999, y: -999, vx: 0, vy: 0, in: false };
  const MAX = () => (W < 700 ? 70 : 150);
  const FIRST = () => (W < 700 ? 34 : 70);

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, dprMax);
    const r = hero.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    len = Math.round(clamp(W * 0.042, 30, 62));
    R = len * 0.36;
    beans.forEach(b => { b.x = clamp(b.x, R, W - R); b.y = Math.min(b.y, H - R); });
  }

  function spawn(x, y, vx = 0, vy = 0) {
    if (beans.length >= MAX()) beans.shift();
    const k = (Math.random() * ROAST_COLORS.length) | 0;
    const sc = rand(0.82, 1.12);
    beans.push({ x, y, vx, vy, a: rand(0, 6.28), va: rand(-3, 3), s: k, sc, r: R * sc });
  }

  function drop() {
    spawn(rand(R * 2, W - R * 2), -len, rand(-60, 60), rand(40, 200));
  }

  size();
  window.addEventListener('resize', () => { size(); });

  if (reduceMotion) {
    // static pile
    const n = FIRST();
    for (let i = 0; i < n; i++) spawn(rand(R, W - R), H - R - rand(0, 120) * (i / n), 0, 0);
    draw();
    return;
  }

  // intro rain
  queue = FIRST();
  function rain() {
    if (queue > 0 && visible) { drop(); queue--; }
    if (queue > 0) qTimer = setTimeout(rain, rand(25, 60));
  }
  qTimer = setTimeout(rain, 500);

  // pointer: shove beans
  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    const nx = e.clientX - r.left, ny = e.clientY - r.top;
    ptr.vx = nx - ptr.x; ptr.vy = ny - ptr.y; ptr.x = nx; ptr.y = ny; ptr.in = true;
  });
  hero.addEventListener('pointerleave', () => { ptr.in = false; ptr.x = ptr.y = -999; });

  hero.addEventListener('pointerdown', (e) => {
    if (e.target.closest('a, button')) return;
    const r = hero.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    for (let i = 0; i < 9; i++) {
      const a = rand(-Math.PI, 0), s = rand(300, 900);
      spawn(x, y, Math.cos(a) * s * 0.8, Math.sin(a) * s);
    }
    // blast away neighbours
    beans.forEach(b => {
      const dx = b.x - x, dy = b.y - y, d = Math.hypot(dx, dy) || 1;
      if (d < 170) { const f = (1 - d / 170) * 520; b.vx += dx / d * f; b.vy += dy / d * f - 160; b.va += rand(-10, 10); }
    });
  });

  // keep sim asleep when hero is offscreen
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; }, { threshold: 0 }).observe(hero);

  // give the pile a shake when the page gets scrolled quickly
  let lastY = window.scrollY;
  window.addEventListener('scroll', () => {
    const d = window.scrollY - lastY; lastY = window.scrollY;
    if (!visible || Math.abs(d) < 40) return;
    beans.forEach(b => { if (b.y > H - len * 3) { b.vy -= Math.min(260, Math.abs(d) * 4) * rand(0.4, 1); b.va += rand(-6, 6); } });
  }, { passive: true });

  const G = 2000;
  function step(dt) {
    const n = beans.length;
    for (let i = 0; i < n; i++) {
      const b = beans[i];
      b.vy += G * dt;
      if (ptr.in) {
        const dx = b.x - ptr.x, dy = b.y - ptr.y, d = Math.hypot(dx, dy);
        const rad = 95;
        if (d < rad && d > 0.01) {
          const f = (1 - d / rad);
          const sp = Math.min(60, Math.hypot(ptr.vx, ptr.vy));
          b.vx += (dx / d) * f * (260 + sp * 22) * dt * 10 * 0.4;
          b.vy += (dy / d) * f * (260 + sp * 22) * dt * 10 * 0.4 - f * 40 * dt;
          b.va += (dx / d) * f * 10 * dt * 10 * 0.1;
        }
      }
      b.x += b.vx * dt; b.y += b.vy * dt; b.a += b.va * dt;
      b.vx *= 1 - 0.25 * dt; b.va *= 1 - 1.2 * dt;
      if (b.x < b.r) { b.x = b.r; b.vx = Math.abs(b.vx) * 0.4; }
      if (b.x > W - b.r) { b.x = W - b.r; b.vx = -Math.abs(b.vx) * 0.4; }
      if (b.y > H - b.r) {
        b.y = H - b.r; b.vy = -Math.abs(b.vy) * 0.28; b.vx *= 0.9; b.va += b.vx * 0.01;
        if (Math.abs(b.vy) < 30) b.vy = 0;
      }
    }
    // pair collisions
    for (let i = 0; i < n; i++) {
      const a = beans[i];
      for (let j = i + 1; j < n; j++) {
        const b = beans[j];
        const dx = b.x - a.x, dy = b.y - a.y, min = a.r + b.r;
        if (Math.abs(dx) > min || Math.abs(dy) > min) continue;
        const d2 = dx * dx + dy * dy;
        if (d2 >= min * min || d2 === 0) continue;
        const d = Math.sqrt(d2), nx = dx / d, ny = dy / d, ov = (min - d) * 0.5;
        a.x -= nx * ov; a.y -= ny * ov; b.x += nx * ov; b.y += ny * ov;
        const rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
        if (rv < 0) {
          const j2 = -(1 + 0.25) * rv * 0.5;
          a.vx -= j2 * nx; a.vy -= j2 * ny; b.vx += j2 * nx; b.vy += j2 * ny;
          const tv = (b.vx - a.vx) * -ny + (b.vy - a.vy) * nx;
          a.va -= tv * 0.01; b.va -= tv * 0.01;
          // friction
          a.vx *= 0.995; b.vx *= 0.995;
        }
      }
    }
  }

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    for (const b of beans) {
      const spr = beanSprite(ROAST_COLORS[b.s], len, dpr);
      const w = spr.width / dpr * b.sc, h = spr.height / dpr * b.sc;
      ctx.save();
      ctx.translate(b.x, b.y); ctx.rotate(b.a);
      ctx.drawImage(spr, -w / 2, -h / 2, w, h);
      ctx.restore();
    }
  }

  let last = performance.now();
  function loop(now) {
    const dt = Math.min(1 / 30, (now - last) / 1000); last = now;
    if (visible) {
      const sub = 2;
      for (let i = 0; i < sub; i++) step(dt / sub);
      draw();
      ptr.vx *= 0.8; ptr.vy *= 0.8;
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  return { spawn };
}
