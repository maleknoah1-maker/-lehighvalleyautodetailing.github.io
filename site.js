// v2 homepage extras. script.js still handles the nav, menu, reveals,
// gallery, booking form and GA click tracking.

// ─── REVIEW MARQUEE ───
// Duplicates the cards once so the track can loop seamlessly (-50%).
// The copies are hidden from screen readers so each review is read once.
(function () {
  document.querySelectorAll('[data-marquee] .marquee-track').forEach(function (track) {
    Array.from(track.children).forEach(function (card) {
      const copy = card.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      track.appendChild(copy);
    });
  });
})();

// ─── ABOUT: words light up as the pinned section scrolls past ───
(function () {
  const el = document.querySelector('[data-scroll-words]');
  if (!el) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const words = el.textContent.trim().split(/\s+/);
  el.innerHTML = words.map(function (w) { return '<span class="w">' + w + '</span>'; }).join(' ');
  const spans = el.querySelectorAll('.w');
  const section = el.closest('section');

  function update() {
    const r = section.getBoundingClientRect();
    const total = section.offsetHeight - window.innerHeight;
    // progress 0 → 1 while the section is pinned; finish a bit early
    const p = Math.min(1, Math.max(0, -r.top / (total * 0.8)));
    const lit = Math.round(p * spans.length);
    spans.forEach(function (s, i) { s.classList.toggle('on', i < lit); });
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
