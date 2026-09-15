/* FlameLauncher — i18n + presentation behaviour */

/* ── language ─────────────────────────────── */
const setLang = l => {
  document.documentElement.lang = l;
  document.querySelectorAll('[data-ko]').forEach(e => e.textContent = e.dataset[l]);
  document.querySelectorAll('.langs button').forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === l));
  try { localStorage.setItem('flamelang', l); } catch {}
};
document.querySelectorAll('.langs button').forEach(b => b.onclick = () => setLang(b.dataset.lang));
let saved; try { saved = localStorage.getItem('flamelang'); } catch {}
setLang(saved || (navigator.language.startsWith('ko') ? 'ko'
               : navigator.language.startsWith('ja') ? 'ja' : 'en'));

/* ── reveal on scroll, staggered per container ── */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: .12, rootMargin: '0px 0px -8% 0px' });

document.querySelectorAll('.rv').forEach(el => {
  const sibs = [...el.parentElement.children].filter(n => n.classList.contains('rv'));
  el.style.setProperty('--d', Math.min(sibs.indexOf(el), 8) * 0.07 + 's');
  io.observe(el);
});

/* ── scroll progress bar ─────────────────── */
const bar = document.getElementById('bar');
if (bar) addEventListener('scroll', () => {
  const h = document.documentElement.scrollHeight - innerHeight;
  bar.style.width = (h > 0 ? scrollY / h * 100 : 0) + '%';
}, { passive: true });

/* ── slide dots + arrow-key navigation ───── */
const slides = [...document.querySelectorAll('.slide')];
const nav = document.querySelector('.dots');
if (slides.length && nav) {
  slides.forEach((s, i) => {
    s.id = s.id || 'slide' + i;
    const a = document.createElement('a');
    a.href = '#' + s.id;
    a.ariaLabel = 'slide ' + (i + 1);
    nav.appendChild(a);
  });
  const dots = [...nav.children];
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) dots.forEach((d, i) => d.classList.toggle('on', slides[i] === e.target));
  }), { threshold: .5 });
  slides.forEach(s => spy.observe(s));
}
if (slides.length) {
  const go = d => {
    const i = slides.findIndex(s => s.getBoundingClientRect().bottom > innerHeight * .5);
    const t = slides[Math.max(0, Math.min(slides.length - 1, (i < 0 ? 0 : i) + d))];
    t && t.scrollIntoView({ behavior: 'smooth' });
  };
  addEventListener('keydown', e => {
    if (/INPUT|TEXTAREA/.test(e.target.tagName)) return;
    if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); go(1); }
    if (e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); go(-1); }
  });
}

/* ── count-up numbers ────────────────────── */
document.querySelectorAll('[data-count]').forEach(el => {
  const ob = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    ob.unobserve(el);
    const end = +el.dataset.count, t0 = performance.now(), dur = 1100;
    const step = t => {
      const p = Math.min(1, (t - t0) / dur);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))).toLocaleString() + (el.dataset.suffix || '');
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }), { threshold: .6 });
  ob.observe(el);
});

/* ── mods page filter ────────────────────── */
const filters = document.querySelector('.filters');
if (filters) {
  filters.onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    [...filters.children].forEach(x => x.setAttribute('aria-pressed', x === b));
    const c = b.dataset.cat;
    document.querySelectorAll('.mod').forEach(m =>
      m.classList.toggle('off', c !== 'all' && !m.dataset.cat.split(' ').includes(c)));
  };
}
