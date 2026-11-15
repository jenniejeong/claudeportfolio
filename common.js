/* Shared behavior for every page: theme, nav, mobile menu, cursor, magnetic button, scroll reveals */
(function () {
  const de = document.documentElement;
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.JJ = { reduced: reduced };

  /* ---------- light / dark theme (shared across pages via localStorage) ---------- */
  let themeT;
  function applyTheme(t, save) {
    if (save) {
      de.classList.add('theme-anim'); clearTimeout(themeT);
      themeT = setTimeout(() => de.classList.remove('theme-anim'), 600);
      try { localStorage.setItem('jj-theme', t); } catch (e) {}
    }
    de.setAttribute('data-theme', t);
    const dark = t === 'dark';
    document.querySelectorAll('[data-theme-toggle]').forEach((b) => {
      b.setAttribute('aria-pressed', dark ? 'true' : 'false');
      const label = b.querySelector('[data-theme-label]') || b;
      label.textContent = dark ? 'Light mode' : 'Dark mode';
    });
  }
  function readTheme() { let t = 'light'; try { t = localStorage.getItem('jj-theme') || 'light'; } catch (e) {} applyTheme(t); }
  readTheme();
  window.addEventListener('storage', (e) => { if (e.key === 'jj-theme') readTheme(); });
  window.addEventListener('pageshow', readTheme);
  document.querySelectorAll('[data-theme-toggle]').forEach((b) =>
    b.addEventListener('click', () => applyTheme(de.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true)));

  /* ---------- nav state + reading progress ---------- */
  const nav = document.querySelector('.nav');
  const progress = document.querySelector('.progress');
  function onScroll() {
    if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 24);
    if (progress) {
      const max = de.scrollHeight - window.innerHeight;
      progress.style.transform = 'scaleX(' + (max > 0 ? window.scrollY / max : 0) + ')';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  const menu = document.getElementById('mobile-menu');
  const openBtn = document.querySelector('[data-menu-open]');
  function setMenu(open) {
    if (!menu) return;
    menu.hidden = !open;
    if (openBtn) openBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  if (openBtn) openBtn.addEventListener('click', () => setMenu(true));
  document.querySelectorAll('[data-menu-close]').forEach((el) => el.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- custom cursor (mouse only) ---------- */
  function initCursor() {
    const gsap = window.gsap, c = document.querySelector('.cursor');
    if (!gsap || !c || !window.matchMedia('(pointer: fine)').matches) return;
    const label = c.querySelector('span');
    const xTo = gsap.quickTo(c, 'x', { duration: 0.35, ease: 'power3' });
    const yTo = gsap.quickTo(c, 'y', { duration: 0.35, ease: 'power3' });
    window.addEventListener('pointermove', (e) => {
      c.style.opacity = 1; xTo(e.clientX); yTo(e.clientY);
      const t = e.target.closest ? e.target.closest('[data-cursor]') : null;
      c.classList.toggle('is-big', !!t);
      if (t) label.textContent = t.getAttribute('data-cursor');
    }, { passive: true });
    document.addEventListener('pointerleave', () => { c.style.opacity = 0; });
  }

  /* ---------- magnetic pill button ---------- */
  function initMagnet() {
    const gsap = window.gsap; if (!gsap) return;
    document.querySelectorAll('.magnet').forEach((el) => {
      const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, .4)' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, .4)' });
      el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * 0.3); yTo((e.clientY - r.top - r.height / 2) * 0.4); });
      el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
    });
  }

  /* ---------- scroll reveals + parallax ---------- */
  function initReveals() {
    const gsap = window.gsap, ST = window.ScrollTrigger;
    if (!gsap || !ST || reduced) return;
    gsap.registerPlugin(ST);
    document.querySelectorAll('.rv').forEach((el) => {
      gsap.from(el, { y: 36, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
    });
    document.querySelectorAll('.px img').forEach((img) => {
      gsap.fromTo(img, { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  }


  /* ---------- footer photo trail (mouse only) ---------- */
  function initTrail() {
    const gsap = window.gsap, foot = document.querySelector('.foot'), trail = foot && foot.querySelector('.trail');
    if (!gsap || !trail || reduced || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const imgs = Array.prototype.slice.call(trail.querySelectorAll('img'));
    let i = 0, z = 1, last = null;
    const q = [];
    let lastOut = 0;
    const out = (el) => gsap.to(el, { opacity: 0, scale: 0.98, duration: 0.16, ease: 'power1.in', overwrite: 'auto' });
    const tick = () => {
      const t = performance.now();
      while (q.length > 6) { out(q.shift().el); lastOut = t; }
      if (q.length && t - lastOut > 45 && t - q[0].t > 110) { out(q.shift().el); lastOut = t; }
    };
    gsap.ticker.add(tick);
    foot.addEventListener('pointermove', (e) => {
      const r = foot.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      if (last && Math.hypot(x - last.x, y - last.y) < 55) return;
      last = { x: x, y: y };
      const el = imgs[i % imgs.length]; i++;
      gsap.killTweensOf(el);
      el.style.zIndex = ++z;
      gsap.set(el, { x: x - el.offsetWidth / 2, y: y - el.offsetHeight / 2, rotate: (Math.random() - 0.5) * 6, scale: 0.97, opacity: 0 });
      gsap.to(el, { opacity: 1, scale: 1, duration: 0.18, ease: 'power2.out' });
      for (let k = q.length - 1; k >= 0; k--) if (q[k].el === el) q.splice(k, 1);
      q.push({ el: el, t: performance.now() });
    });
    foot.addEventListener('pointerleave', () => { last = null; });
  }

  initCursor();
  initMagnet();
  initReveals();
  initTrail();
})();
