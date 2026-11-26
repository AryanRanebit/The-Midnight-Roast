// Story section: a bean that roasts as you scroll
import { mixHex, reduceMotion, clamp } from './beans.js';
import { burst } from './fx.js';

const STOPS = ['#7f8d4f', '#b98a4c', '#7a4a26', '#2a160c'];   // green → light → medium → dark
const CREASE = ['#4d5a2c', '#6e4a22', '#1c0f07', '#0c0603'];

export function initRoast() {
  const track = document.getElementById('roastTrack');
  const svg = document.getElementById('bigBeanSvg');
  const bean = document.getElementById('bigBean');
  const fill = document.getElementById('meterFill');
  const labels = [...document.querySelectorAll('#meterLabels li')];
  const stages = [...document.querySelectorAll('#roastCopy .stage')];
  const body = svg.querySelector('.bean-body');
  let cracked = false, lastStage = -1, spinBoost = 0;

  function paint(p) {
    const seg = p * (STOPS.length - 1);
    const i = Math.min(STOPS.length - 2, Math.floor(seg)), t = seg - i;
    const color = mixHex(STOPS[i], STOPS[i + 1], t);
    const crease = mixHex(CREASE[i], CREASE[i + 1], t);
    svg.style.setProperty('--bean', color);
    svg.style.setProperty('--crease', crease);
    const rot = -24 + p * 150 + spinBoost;
    const sc = 0.78 + p * 0.28;
    body.style.transform = `rotate(${rot}deg) scale(${sc})`;
    fill.style.transform = `scaleX(${p})`;
    const s = Math.min(stages.length - 1, Math.floor(p * stages.length * 0.9999));
    if (s !== lastStage) {
      stages.forEach((el, k) => el.classList.toggle('is-on', k === s));
      labels.forEach((el, k) => el.classList.toggle('is-on', k === s));
      lastStage = s;
    }
    // first crack
    const isCracked = p > 0.5;
    if (isCracked !== cracked) {
      cracked = isCracked;
      svg.classList.toggle('cracked', cracked);
      if (cracked && !reduceMotion) {
        const r = bean.getBoundingClientRect();
        burst(r.left + r.width / 2, r.top + r.height / 2, 8);
        svg.classList.remove('pop'); void svg.getBoundingClientRect(); svg.classList.add('pop');
      }
    }
  }

  function onScroll() {
    const r = track.getBoundingClientRect();
    const total = r.height - window.innerHeight;
    const p = clamp(-r.top / Math.max(1, total), 0, 1);
    paint(p);
  }

  if (reduceMotion) {
    paint(0.8);
    stages.forEach(s => s.classList.add('is-on'));
    return;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  // poke the bean
  bean.addEventListener('click', (e) => {
    spinBoost += 360;
    svg.classList.remove('pop'); void svg.getBoundingClientRect(); svg.classList.add('pop');
    burst(e.clientX, e.clientY, 9);
    onScroll();
  });
}
