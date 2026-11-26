// Menu: rows, animated glass illustrations, tab, randomizer
import { toast, reduceMotion, rand } from './beans.js';

// Names, prices and descriptions are the shop's own. `quip` is new copy; `layers` drive the glass drawing.
export const MENU = [
  { id: 'mocha', name: 'Midnight Mocha', price: 200,
    desc: 'Dark chocolate, espresso, and a hint of smoked sea salt.',
    quip: 'Dessert disguised as a responsible adult beverage.',
    layers: [['#4a2515', .4], ['#2a140a', .28], ['#c79a6b', .32]], hot: true, salt: true },
  { id: 'maple', name: 'Maple Bourbon Latte', price: 350,
    desc: 'Real Vermont maple syrup with a wood-fired finish.',
    quip: 'Sweet, smoky, and smoother than your excuses.',
    layers: [['#b8641f', .3], ['#3a1d0e', .26], ['#e6cfa8', .44]], hot: true, foam: true },
  { id: 'flight', name: 'The Cold Brew Flight', price: 450,
    desc: 'Four 4oz pours of our rotating single-origin roasts.',
    quip: 'Four pours, zero commitment issues.', flight: true },
  { id: 'tonic', name: 'Espresso Tonic', price: 220,
    desc: 'A double shot of espresso over sparkling tonic water with a citrus twist.',
    quip: 'Yes, coffee and tonic. Trust the fizz.',
    layers: [['#e9efe0', .84], ['#2a140a', .16]], ice: true, lemon: true, fizz: true },
  { id: 'cardamom', name: 'Cardamom Cloud', price: 280,
    desc: 'Spiced cardamom latte topped with a silky oat milk foam and saffron dust.',
    quip: 'A hug that happens to be caffeinated.',
    layers: [['#b98a56', .7], ['#f1e2c8', .3]], hot: true, saffron: true },
  { id: 'nitro', name: 'Nitro Cold Brew', price: 320,
    desc: 'Smooth, velvety cold brew infused with nitrogen for a natural creamy sweetness.',
    quip: 'Poured like a stout. Behaves like a morning person.',
    layers: [['#1f0f07', .84], ['#ead7b6', .16]], cascade: true }
];

const FLIGHT_COLORS = ['#5b3318', '#3b2010', '#7a4a26', '#2a140a'];

// ---------- glass art ----------
function glassSVG(item) {
  const top = 54, bot = 276, H = bot - top;
  const clip = `<clipPath id="gc-${item.id}"><path d="M62 ${top} H178 L168 ${bot - 8} Q167 ${bot} 158 ${bot} H82 Q73 ${bot} 72 ${bot - 8} Z"/></clipPath>`;
  if (item.flight) return flightSVG(item);

  let y = bot, rects = '', delay = 0;
  item.layers.forEach(([c, f], i) => {
    const h = f * H * 0.86; y -= h;
    rects += `<rect class="lay" style="--d:${delay}s" x="50" y="${y.toFixed(1)}" width="150" height="${(h + 1).toFixed(1)}" fill="${c}" ${item.fizz && i === 1 ? 'opacity=".8"' : ''}/>`;
    delay += 0.22;
  });
  const surfaceY = y;
  let extra = '';
  if (item.foam) extra += `<g class="lay" style="--d:${delay}s">${[70, 90, 112, 134, 154].map((x, i) => `<circle cx="${x}" cy="${surfaceY - 2 + (i % 2) * 3}" r="${12 + (i % 3) * 2}" fill="#f6ead2"/>`).join('')}</g>`;
  if (item.saffron) extra += [0, 1, 2, 3, 4, 5, 6].map(i => `<circle class="pop" style="--d:${1 + i * .06}s" cx="${82 + i * 13}" cy="${surfaceY + 8 + (i % 2) * 5}" r="2.2" fill="#e0a21a"/>`).join('');
  if (item.salt) extra += [0, 1, 2, 3, 4].map(i => `<rect class="pop" style="--d:${1 + i * .07}s" x="${86 + i * 15}" y="${surfaceY + 5 + (i % 2) * 6}" width="3.2" height="3.2" fill="#fff" opacity=".9" transform="rotate(${i * 20} ${88 + i * 15} ${surfaceY + 7})"/>`).join('');
  if (item.ice) extra += `<g class="ice">${[[84, surfaceY + 16, 30], [128, surfaceY + 34, 28], [100, surfaceY + 70, 30], [140, surfaceY + 92, 26]].map(([x, yy, s], i) => `<rect x="${x}" y="${yy}" width="${s}" height="${s}" rx="5" fill="#fff" fill-opacity=".28" stroke="#fff" stroke-opacity=".5" transform="rotate(${i * 11 - 8} ${x + s / 2} ${yy + s / 2})"/>`).join('')}</g>`;
  if (item.fizz || item.cascade) {
    extra += `<g class="bubbles">${Array.from({ length: 9 }, (_, i) => `<circle class="bub" style="--x:${(i * 17) % 90 - 45}px;--d:${(i * .37).toFixed(2)}s" cx="${86 + (i * 11) % 80}" cy="${bot - 16}" r="${2 + (i % 3)}" fill="#fff" fill-opacity=".55"/>`).join('')}</g>`;
  }
  const lemon = item.lemon ? `<g class="pop" style="--d:1.1s"><circle cx="172" cy="${top}" r="22" fill="#f3d352"/><circle cx="172" cy="${top}" r="17" fill="#f9e784"/>${[0, 1, 2, 3, 4, 5].map(i => `<path d="M172 ${top} L${172 + 16 * Math.cos(i * 1.047)} ${top + 16 * Math.sin(i * 1.047)}" stroke="#f3d352" stroke-width="2"/>`).join('')}</g>` : '';
  const steam = item.hot ? `<g class="steam" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M96 38 C88 26 104 20 96 6"/><path d="M120 36 C112 24 128 16 120 2"/><path d="M144 38 C136 26 152 20 144 6"/></g>` : '';

  return `<svg viewBox="0 0 240 300" role="img" aria-label="${item.name} illustration">
    <defs>${clip}</defs>
    <ellipse cx="120" cy="${bot + 8}" rx="70" ry="8" fill="#000" opacity=".25"/>
    ${steam}
    <g clip-path="url(#gc-${item.id})">${rects}${extra}</g>
    <path d="M62 ${top} H178 L168 ${bot - 8} Q167 ${bot} 158 ${bot} H82 Q73 ${bot} 72 ${bot - 8} Z" fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.55)" stroke-width="3" stroke-linejoin="round"/>
    <path d="M76 70 L83 250" stroke="#fff" stroke-opacity=".35" stroke-width="5" stroke-linecap="round"/>
    ${lemon}
  </svg>`;
}

function flightSVG(item) {
  let out = '<svg viewBox="0 0 240 300" role="img" aria-label="Four small glasses of cold brew on a wooden paddle">';
  out += '<rect x="10" y="190" width="220" height="40" rx="12" fill="#8a5a2b"/><rect x="10" y="190" width="220" height="10" rx="5" fill="#a87238"/>';
  FLIGHT_COLORS.forEach((c, i) => {
    const x = 22 + i * 51, top = 108, bot = 196, h = (bot - top) * 0.82, y = bot - h;
    const id = `fg${i}`;
    out += `<clipPath id="${id}"><path d="M${x} ${top} H${x + 42} L${x + 38} ${bot - 4} Q${x + 37} ${bot} ${x + 33} ${bot} H${x + 9} Q${x + 5} ${bot} ${x + 4} ${bot - 4} Z"/></clipPath>
      <g clip-path="url(#${id})"><rect class="lay" style="--d:${i * .18}s" x="${x - 2}" y="${y}" width="48" height="${h + 1}" fill="${c}"/>
      <rect class="lay" style="--d:${i * .18 + .2}s" x="${x - 2}" y="${y}" width="48" height="6" fill="#d9b98a" opacity=".55"/></g>
      <path d="M${x} ${top} H${x + 42} L${x + 38} ${bot - 4} Q${x + 37} ${bot} ${x + 33} ${bot} H${x + 9} Q${x + 5} ${bot} ${x + 4} ${bot - 4} Z" fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.55)" stroke-width="2.5"/>`;
  });
  return out + '</svg>';
}

// ---------- state ----------
let tab = {};
try { tab = JSON.parse(localStorage.getItem('mr-tab') || '{}') || {}; } catch { tab = {}; }
const byId = Object.fromEntries(MENU.map(m => [m.id, m]));
Object.keys(tab).forEach(k => { if (!byId[k]) delete tab[k]; });

const save = () => { try { localStorage.setItem('mr-tab', JSON.stringify(tab)); } catch { /* ignore */ } };
const qtyTotal = () => Object.values(tab).reduce((a, b) => a + b, 0);
const sumTotal = () => Object.entries(tab).reduce((a, [id, q]) => a + byId[id].price * q, 0);

export function initMenu({ scrollTo }) {
  const list = document.getElementById('menuList');
  const glass = document.getElementById('glass');
  const aIdx = document.getElementById('asideIdx');
  const aName = document.getElementById('asideName');
  const aDesc = document.getElementById('asideDesc');
  const aAdd = document.getElementById('asideAdd');
  const plate = document.querySelector('.plate');

  // rows
  list.innerHTML = MENU.map((m, i) => `
    <li class="row" data-id="${m.id}" tabindex="0" role="button" aria-expanded="false" aria-label="${m.name}, ${m.price} rupees. ${m.desc}">
      <span class="idx mono">${String(i + 1).padStart(2, '0')}</span>
      <span class="name">${m.name}</span>
      <span class="price mono">${m.price}rs</span>
      <button class="plus" data-add="${m.id}" aria-label="Add ${m.name} to tab" data-cursor="Add"><span>+</span></button>
      <div class="row-more">
        <div class="row-glass" aria-hidden="true"></div>
        <div class="row-text">
          <p class="quip">${m.quip}</p>
          <p class="desc">${m.desc}</p>
        </div>
      </div>
    </li>`).join('');

  let current = null;
  const rows = [...list.querySelectorAll('.row')];
  const isStacked = () => window.matchMedia('(max-width: 900px)').matches;

  function select(id, { scrollRow = false } = {}) {
    if (current === id) return;
    current = id;
    const m = byId[id], i = MENU.indexOf(m);
    rows.forEach(r => {
      const on = r.dataset.id === id;
      r.classList.toggle('is-active', on);
      r.setAttribute('aria-expanded', on);
      if (on) r.querySelector('.row-glass').innerHTML = glassSVG(m); else r.querySelector('.row-glass').innerHTML = '';
    });
    glass.innerHTML = glassSVG(m);
    aIdx.textContent = `${String(i + 1).padStart(2, '0')} / ${String(MENU.length).padStart(2, '0')}`;
    aName.textContent = m.name;
    aDesc.innerHTML = `<strong>${m.quip}</strong> ${m.desc}`;
    aAdd.dataset.add = id;
    plate.dataset.drink = id;
    if (scrollRow && isStacked()) setTimeout(() => scrollTo(rows[i], { offset: -90 }), 60);
  }

  rows.forEach(r => {
    r.addEventListener('mouseenter', () => { if (!isStacked()) select(r.dataset.id); });
    r.addEventListener('focus', () => select(r.dataset.id));
    r.addEventListener('click', (e) => {
      if (e.target.closest('[data-add]')) return;
      select(r.dataset.id, { scrollRow: true });
    });
    r.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && e.target === r) { e.preventDefault(); select(r.dataset.id); }
    });
  });

  // add buttons (rows + aside)
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-add]');
    if (!b) return;
    e.stopPropagation();
    add(b.dataset.add, b);
  });

  function add(id, from) {
    tab[id] = (tab[id] || 0) + 1;
    save(); renderTab();
    fly(from);
    const m = byId[id];
    const lines = [`${m.name} added. Bold choice.`, `One ${m.name}. Your future self says thanks.`, `${m.name}: on the tab.`];
    toast(lines[(qtyTotal()) % lines.length]);
  }

  function fly(from) {
    const target = document.getElementById('tabBtn');
    if (!from || !target) return;
    const a = from.getBoundingClientRect(), t = target.getBoundingClientRect();
    if (!reduceMotion) {
      const el = document.createElement('div');
      el.className = 'flybean';
      el.innerHTML = '<svg viewBox="0 0 100 64"><use href="#bean"/></svg>';
      el.style.left = (a.left + a.width / 2 - 14) + 'px';
      el.style.top = (a.top + a.height / 2 - 9) + 'px';
      document.body.appendChild(el);
      const dx = t.left + t.width / 2 - (a.left + a.width / 2), dy = t.top + t.height / 2 - (a.top + a.height / 2);
      el.animate([
        { transform: 'translate(0,0) rotate(0) scale(1)' },
        { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 80}px) rotate(260deg) scale(1.3)`, offset: 0.5 },
        { transform: `translate(${dx}px, ${dy}px) rotate(540deg) scale(.5)` }
      ], { duration: 750, easing: 'cubic-bezier(.4,.1,.3,1)' }).onfinish = () => { el.remove(); bump(); };
    } else bump();
  }
  const bump = () => {
    const t = document.getElementById('tabBtn');
    t.classList.remove('bump'); void t.offsetWidth; t.classList.add('bump');
  };

  // ---------- tab panel ----------
  const panel = document.getElementById('tabPanel');
  const tabBtn = document.getElementById('tabBtn');
  const tList = document.getElementById('tabList');
  const tEmpty = document.getElementById('tabEmpty');
  const tTotal = document.getElementById('tabTotal');
  const tCount = document.getElementById('tabCount');

  function renderTab() {
    const entries = Object.entries(tab).filter(([, q]) => q > 0);
    tList.innerHTML = entries.map(([id, q]) => `
      <li>
        <span class="t-name">${byId[id].name}<small>${byId[id].price}rs each</small></span>
        <span class="qty">
          <button data-dec="${id}" aria-label="Remove one ${byId[id].name}">&minus;</button>
          <b>${q}</b>
          <button data-inc="${id}" aria-label="Add one ${byId[id].name}">+</button>
        </span>
        <span class="t-sum mono">${byId[id].price * q}rs</span>
      </li>`).join('');
    tEmpty.hidden = entries.length > 0;
    tTotal.textContent = sumTotal() + 'rs';
    tCount.textContent = qtyTotal();
    tabBtn.classList.toggle('has', qtyTotal() > 0);
  }

  tList.addEventListener('click', (e) => {
    const inc = e.target.closest('[data-inc]'), dec = e.target.closest('[data-dec]');
    if (inc) tab[inc.dataset.inc]++;
    if (dec) { tab[dec.dataset.dec]--; if (tab[dec.dataset.dec] <= 0) delete tab[dec.dataset.dec]; }
    save(); renderTab();
  });

  function openTab(open) {
    const willOpen = open ?? panel.hidden;
    panel.hidden = !willOpen;
    tabBtn.setAttribute('aria-expanded', willOpen);
    if (willOpen) { requestAnimationFrame(() => panel.classList.add('open')); }
    else panel.classList.remove('open');
  }
  tabBtn.addEventListener('click', (e) => { e.stopPropagation(); openTab(); });
  document.getElementById('tabClose').addEventListener('click', () => openTab(false));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') openTab(false); });
  document.addEventListener('pointerdown', (e) => {
    if (!panel.hidden && !e.target.closest('#tabPanel, #tabBtn, [data-add]')) openTab(false);
  });

  document.getElementById('tabClear').addEventListener('click', () => {
    if (!qtyTotal()) return toast('Nothing to clear. Already admirably minimalist.');
    tab = {}; save(); renderTab(); toast('Tab cleared. Fresh start.');
  });
  document.getElementById('tabCopy').addEventListener('click', async () => {
    if (!qtyTotal()) return toast('Add something first. We can wait. Barely.');
    const text = 'My order at The Midnight Roast:\n' +
      Object.entries(tab).map(([id, q]) => `${q} x ${byId[id].name} (${byId[id].price * q}rs)`).join('\n') +
      `\nTotal: ${sumTotal()}rs`;
    try { await navigator.clipboard.writeText(text); toast('Order copied. Go forth and caffeinate.'); }
    catch {
      const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); toast('Order copied. Go forth and caffeinate.'); } catch { toast('Could not copy. Screenshot it, old school.'); }
      ta.remove();
    }
  });

  // ---------- roll the beans ----------
  let rolling = false;
  document.getElementById('roll').addEventListener('click', () => {
    if (rolling) return;
    rolling = true;
    const lines = ['Fate has spoken: ', 'The beans say: ', 'Don\'t argue with the beans: '];
    const target = (Math.random() * MENU.length) | 0;
    const steps = 12 + ((target - (MENU.indexOf(byId[current]) || 0) + MENU.length) % MENU.length);
    let i = Math.max(0, MENU.indexOf(byId[current]));
    let n = 0;
    rows.forEach(r => r.classList.remove('picked'));
    const tick = () => {
      i = (i + 1) % MENU.length; n++;
      current = null; select(MENU[i].id);
      if (n < steps) setTimeout(tick, reduceMotion ? 40 : 60 + n * n * 1.3);
      else {
        rows[i].classList.add('picked');
        toast(lines[(Math.random() * lines.length) | 0] + MENU[i].name + '.');
        if (isStacked()) scrollTo(rows[i], { offset: -90 });
        rolling = false;
      }
    };
    tick();
  });

  select(MENU[0].id);
  renderTab();
}
