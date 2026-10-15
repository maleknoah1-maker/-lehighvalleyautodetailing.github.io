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

// ─── REVIEWS: "Read full review" for clamped (long) reviews ───
// Cards clamp the text in CSS; any card whose text is cut off gets a button
// that opens the whole review in a dialog. Runs after the marquee clones the
// cards, so the looping copies get the button too.
(function () {
  const cards = document.querySelectorAll('.r-card');
  if (!cards.length || typeof HTMLDialogElement === 'undefined') return;

  const dlg = document.createElement('dialog');
  dlg.className = 'review-dialog';
  dlg.setAttribute('aria-label', 'Full review');
  dlg.innerHTML = '<button class="rd-close" type="button" aria-label="Close">×</button>' +
    '<div class="stars" aria-label="5 out of 5 stars">★★★★★</div><p></p><div class="rd-name"></div>' +
    '<a class="rd-google" href="https://www.google.com/maps?cid=6334011887982355620" target="_blank" rel="noopener">See all reviews on Google →</a>';
  document.body.appendChild(dlg);
  dlg.querySelector('.rd-close').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); }); // backdrop click

  function addButtons() {
    cards.forEach(card => {
      const p = card.querySelector('blockquote p');
      if (!p || card.querySelector('.r-more') || p.scrollHeight <= p.clientHeight + 2) return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'r-more';
      btn.textContent = 'Read full review';
      if (card.getAttribute('aria-hidden') === 'true') btn.tabIndex = -1;
      btn.addEventListener('click', () => {
        dlg.querySelector('p').textContent = p.textContent;
        const cap = card.querySelector('figcaption');
        dlg.querySelector('.rd-name').innerHTML = cap ? cap.innerHTML : '';
        dlg.showModal();
      });
      card.querySelector('blockquote').after(btn);
    });
  }
  // fonts change line breaks, so measure after they load
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(addButtons);
})();

// ─── ANNOUNCEMENT BAR: dismiss (remembered) + keep the fixed header below it ───
(function () {
  const bar = document.getElementById('announce');
  const root = document.documentElement;
  function offset() {
    const b = bar && bar.isConnected ? Math.max(0, bar.getBoundingClientRect().bottom) : 0;
    root.style.setProperty('--ann', b + 'px');
  }
  if (!bar) { offset(); return; }
  bar.querySelector('.announce-close').addEventListener('click', function () {
    try { localStorage.setItem('lvad-announce-mobile', 'dismissed'); } catch (e) { /* storage blocked: just hide for now */ }
    bar.remove();
    offset();
  });
  window.addEventListener('scroll', offset, { passive: true });
  window.addEventListener('resize', offset);
  // the bar's height changes when web fonts load or the text re-wraps
  if (window.ResizeObserver) new ResizeObserver(offset).observe(bar);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(offset);
  offset();
})();

// ─── BOOKING FORM: mobile address + utilities fields ───
// Shown and required only when "Mobile (come to me)" is picked. Hidden fields
// are disabled so they're neither required nor sent to Formspree.
(function () {
  const loc = document.getElementById('service-location');
  const box = document.getElementById('mobile-fields');
  if (!loc || !box) return;
  const fields = box.querySelectorAll('input');
  function sync() {
    const mobile = loc.value.indexOf('Mobile') === 0;
    box.hidden = !mobile;
    fields.forEach(function (f) { f.disabled = !mobile; f.required = mobile; });
  }
  loc.addEventListener('change', sync);
  sync();
})();

// ─── HERO ROTATOR: plays the after video once, then rotates through photos ───
// Photos load (data-src) only after the page has loaded. If the video can't
// autoplay, it shows its poster for the normal photo duration instead.
(function () {
  const box = document.querySelector('[data-hero-rotator]');
  if (!box) return;
  const slides = Array.from(box.querySelectorAll('.hero-rot-slide'));
  const cap = box.closest('figure').querySelector('figcaption');
  const video = box.querySelector('video');
  const PHOTO_MS = 4500;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let i = 0, timer = null;

  function load(el) {
    if (el.dataset.src) { if (el.dataset.srcset) el.srcset = el.dataset.srcset; el.src = el.dataset.src; delete el.dataset.src; }
  }
  function show(n) {
    i = (n + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle('is-active', k === i));
    if (cap) cap.textContent = slides[i].dataset.caption || '';
    const cur = slides[i];
    clearTimeout(timer);
    if (cur === video) {
      video.currentTime = 0;
      const p = video.play();
      const fallback = () => { timer = setTimeout(() => show(i + 1), PHOTO_MS); };
      if (p && p.catch) p.catch(fallback); else fallback();
    } else {
      if (video) video.pause();
      load(slides[(i + 1) % slides.length]);       // warm up the next photo
      timer = setTimeout(() => show(i + 1), PHOTO_MS);
    }
  }
  if (reduce) { if (video) { video.removeAttribute('autoplay'); video.pause(); } return; }
  if (video) video.addEventListener('ended', () => show(i + 1));
  window.addEventListener('load', () => slides.forEach(load));
  // pause while the hero is off screen to save battery and data
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { if (!timer && slides[i] !== video) timer = setTimeout(() => show(i + 1), PHOTO_MS); if (slides[i] === video) video.play().catch(() => {}); }
      else { clearTimeout(timer); timer = null; if (video) video.pause(); }
    })).observe(box);
  }
  show(0);
})();
