/* Case study pages: intro fade + side steps that highlight as you scroll */
(function () {
  const links = Array.prototype.slice.call(document.querySelectorAll('.steps a'));
  const sections = links.map((a) => document.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);
  let active = null;
  function onScroll() {
    const line = window.innerHeight * 0.35;
    let current = sections[0] && sections[0].id;
    sections.forEach((s) => { if (s.getBoundingClientRect().top - line <= 0) current = s.id; });
    if (current === active) return;
    active = current;
    links.forEach((a) => a.classList.toggle('on', a.getAttribute('href') === '#' + current));
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const gsap = window.gsap;
  if (gsap && !(window.JJ && window.JJ.reduced)) {
    gsap.from(document.querySelectorAll('.intro'), { opacity: 0, y: 16, duration: 1.2, stagger: 0.12, ease: 'power2.out' });
  }
})();
