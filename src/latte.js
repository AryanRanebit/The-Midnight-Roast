// Latte art cup: pour milk, etch with a toothpick, or let the pro show off
import { toast, reduceMotion, rand, clamp } from './beans.js';

const REVIEWS = {
  empty: ['A blank cup. Bold. Minimalist. Slightly lazy.', 'Nothing there. Even the barista is confused.'],
  low:   ['Is that… a comma? We\'ll allow it.', 'Abstract. We\'ll tell people it\'s on purpose.', 'A modest dribble. Respect for restraint.'],
  mid:   ['Not bad. That\'s almost a shape.', 'We\'d serve that. Reluctantly. With a smile.', 'Barista approved. Barista is also lying.'],
  high:  ['That\'s a lot of milk. It\'s now a cappuccino.', 'Is there still coffee in there? Hello?', 'Bold. Messy. Basically our Monday mornings.']
};
const pick = a => a[(Math.random() * a.length) | 0];

export function initLatte() {
  const cv = document.getElementById('latte');
  const ctx = cv.getContext('2d');
  const review = document.getElementById('review');
  const S = cv.width;                       // logical size 560
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = cv.height = Math.round(S * dpr);
  const scale = cv.width / S;
  const cxy = S / 2, R = S * 0.355;          // coffee surface radius

  // art layer
  const art = document.createElement('canvas');
  art.width = art.height = cv.width;
  const a = art.getContext('2d');
  a.scale(scale, scale);

  let tool = 'pour', drawing = false, last = null, lastT = 0, busy = false, dirty = false;

  function base() {
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.clearRect(0, 0, S, S);
    // saucer
    const sg = ctx.createRadialGradient(cxy - 60, cxy - 80, 20, cxy, cxy, S * 0.5);
    sg.addColorStop(0, '#f6ecdb'); sg.addColorStop(1, '#d8c5a4');
    ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(cxy, cxy, S * 0.485, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(60,35,15,.18)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cxy, cxy, S * 0.43, 0, 7); ctx.stroke();
    // handle
    ctx.strokeStyle = '#fbf3e4'; ctx.lineWidth = 20; ctx.beginPath(); ctx.ellipse(cxy + S * 0.39, cxy, 40, 34, 0, -1.9, 1.9); ctx.stroke();
    ctx.strokeStyle = 'rgba(60,35,15,.12)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(cxy + S * 0.39, cxy, 50, 44, 0, -1.9, 1.9); ctx.stroke();
    // cup rim
    ctx.save(); ctx.shadowColor = 'rgba(30,15,5,.35)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 8;
    ctx.fillStyle = '#fbf3e4'; ctx.beginPath(); ctx.arc(cxy, cxy, S * 0.385, 0, 7); ctx.fill(); ctx.restore();
    // coffee
    const cg = ctx.createRadialGradient(cxy - 40, cxy - 50, 10, cxy, cxy, R);
    cg.addColorStop(0, '#9a6532'); cg.addColorStop(0.55, '#7a4a22'); cg.addColorStop(1, '#4b2a12');
    ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(cxy, cxy, R, 0, 7); ctx.fill();
  }
  function compose() {
    base();
    ctx.save();
    ctx.beginPath(); ctx.arc(cxy, cxy, R - 1, 0, 7); ctx.clip();
    ctx.drawImage(art, 0, 0, S, S);
    // gloss
    const gl = ctx.createLinearGradient(cxy - R, cxy - R, cxy + R, cxy + R);
    gl.addColorStop(0, 'rgba(255,255,255,.16)'); gl.addColorStop(0.4, 'rgba(255,255,255,0)');
    ctx.fillStyle = gl; ctx.fillRect(0, 0, S, S);
    ctx.restore();
  }

  function pos(e) {
    const r = cv.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width * S, y: (e.clientY - r.top) / r.height * S };
  }
  const inside = (p, pad = 0) => Math.hypot(p.x - cxy, p.y - cxy) < R + pad;

  function blob(x, y, r, alpha = 1) {
    const g = a.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(252,244,228,${alpha})`);
    g.addColorStop(0.72, `rgba(250,238,214,${alpha})`);
    g.addColorStop(1, 'rgba(250,238,214,0)');
    a.fillStyle = g; a.beginPath(); a.arc(x, y, r, 0, 7); a.fill();
  }

  function stroke(p, t) {
    if (!last) { last = p; lastT = t; }
    const dx = p.x - last.x, dy = p.y - last.y, d = Math.hypot(dx, dy);
    const speed = d / Math.max(8, t - lastT);
    if (tool === 'pour') {
      const r = clamp(30 - speed * 14, 11, 30);
      const steps = Math.max(1, Math.ceil(d / 4));
      for (let i = 1; i <= steps; i++) blob(last.x + dx * i / steps, last.y + dy * i / steps, r);
    } else {
      // toothpick: drag a thin dark line, dragging the milk with it
      a.save();
      a.globalCompositeOperation = 'source-over';
      a.strokeStyle = 'rgba(92,55,25,.9)'; a.lineWidth = 4; a.lineCap = 'round';
      a.beginPath(); a.moveTo(last.x, last.y); a.lineTo(p.x, p.y); a.stroke();
      a.restore();
    }
    last = p; lastT = t; dirty = true;
    compose();
  }

  cv.style.touchAction = 'none';
  cv.addEventListener('pointerdown', (e) => {
    if (busy) return;
    const p = pos(e);
    drawing = true; last = null; cv.setPointerCapture(e.pointerId);
    if (inside(p, 4)) { if (tool === 'pour') { blob(p.x, p.y, 20); compose(); dirty = true; } last = p; lastT = e.timeStamp; }
  });
  cv.addEventListener('pointermove', (e) => {
    if (!drawing || busy) return;
    const p = pos(e);
    if (!inside(p, 2)) { last = null; return; }
    stroke(p, e.timeStamp);
  });
  const end = () => { if (!drawing) return; drawing = false; last = null; if (dirty) { dirty = false; rate(); } };
  cv.addEventListener('pointerup', end);
  cv.addEventListener('pointercancel', end);

  function coverage() {
    const sz = 64, c = document.createElement('canvas'); c.width = c.height = sz;
    const x = c.getContext('2d'); x.drawImage(art, 0, 0, sz, sz);
    const d = x.getImageData(0, 0, sz, sz).data;
    let n = 0, tot = 0; const rr = (R / S) * sz;
    for (let i = 0; i < sz; i++) for (let j = 0; j < sz; j++) {
      if (Math.hypot(i - sz / 2, j - sz / 2) < rr) { tot++; if (d[(j * sz + i) * 4 + 3] > 100) n++; }
    }
    return n / tot;
  }
  function rate() {
    const c = coverage();
    review.textContent = 'Barista\'s review: ' + pick(c < 0.01 ? REVIEWS.empty : c < 0.08 ? REVIEWS.low : c < 0.4 ? REVIEWS.mid : REVIEWS.high);
  }

  // tools
  cv.dataset.cursor = 'Pour';
  const chips = document.querySelectorAll('[data-tool]');
  chips.forEach(ch => ch.addEventListener('click', () => {
    tool = ch.dataset.tool; cv.dataset.cursor = tool === 'pour' ? 'Pour' : 'Etch';
    chips.forEach(c => { const on = c === ch; c.classList.toggle('is-on', on); c.setAttribute('aria-pressed', on); });
  }));
  function wipe() { a.clearRect(0, 0, S, S); compose(); }
  document.getElementById('wipe').addEventListener('click', () => {
    if (busy) return; wipe(); review.textContent = 'Wiped clean. Pretend that never happened.';
  });

  // a rosetta, poured by someone who actually knows what they're doing
  document.getElementById('showoff').addEventListener('click', async () => {
    if (busy) return;
    busy = true; wipe();
    review.textContent = 'Watch and learn. Or don\'t.';
    const sleep = ms => new Promise(r => setTimeout(r, reduceMotion ? 0 : ms));
    const n = 8;
    for (let i = 0; i < n; i++) {
      const y = cxy + R * 0.66 - i * (R * 1.2 / n);
      const w = R * 0.6 * (1 - i * 0.075);
      const r = 21 - i * 1.1;
      const steps = 22;
      for (let s = 0; s <= steps; s++) {
        const t = (s / steps) * 2 - 1;
        blob(cxy + t * w, y + Math.pow(Math.abs(t), 1.4) * 30 - 12, r);
      }
      compose(); await sleep(120);
    }
    // etch stem
    a.strokeStyle = 'rgba(92,55,25,.9)'; a.lineWidth = 4; a.lineCap = 'round';
    let prev = null;
    for (let k = 0; k <= 30; k++) {
      const t = k / 30, y = cxy + R * 0.7 - t * R * 1.35, x = cxy + Math.sin(t * 20) * 3 * (1 - t);
      if (prev) { a.beginPath(); a.moveTo(prev.x, prev.y); a.lineTo(x, y); a.stroke(); }
      prev = { x, y };
      if (k % 3 === 0) { compose(); await sleep(18); }
    }
    compose();
    busy = false;
    review.textContent = 'Barista\'s review: Effortless. Annoying. Now you try.';
    toast('Show-off. Now it\'s your turn.');
  });

  compose();
}
