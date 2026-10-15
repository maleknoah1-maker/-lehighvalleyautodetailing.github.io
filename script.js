// ─── NAV SCROLL SHRINK ───
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ─── HAMBURGER MENU ───
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');
hamburger.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  hamburger.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', String(open));
});

// Close mobile menu on link click
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

// ─── SCROLL REVEAL ───
const revealEls = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0, rootMargin: '0px 0px 15% 0px' }); // fire just before an element scrolls in, so nothing sits blank

revealEls.forEach(el => observer.observe(el));

// ─── SMOOTH ACTIVE NAV ───
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a, .mobile-menu a');
// Links are root-absolute ("/#about", "/services#addons"), so match on both
// path and hash. Trailing slashes are stripped so "/services/" == "/services".
const stripSlash = p => p.replace(/\/+$/, '') || '/';
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 120) current = s.id;
  });
  navLinks.forEach(link => {
    const here = current && link.hash === '#' + current &&
      stripSlash(link.pathname) === stripSlash(location.pathname);
    link.style.color = here ? 'var(--text)' : '';
  });
}, { passive: true });

// ─── HERO SLIDESHOW ───
// Cross-fades through the hero's background photos on a timer. Mirrors the
// gallery carousel's autoplay pattern (same AUTOPLAY_MS, same setInterval
// approach) — see the carousel IIFE below for the sibling implementation.
(function () {
  const slides = document.querySelectorAll('.hero-slideshow .hero-slide');
  if (!slides.length) return; // page has no hero section (e.g. /faq, /services)

  const AUTOPLAY_MS = 5000;
  let current = 0;

  // Only the first slide loads up front; the rest (data-src) load after the page does.
  window.addEventListener('load', function () {
    slides.forEach(function (slide) {
      if (slide.dataset.src) slide.src = slide.dataset.src;
    });
  });

  setInterval(function () {
    current = (current + 1) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === current);
    });
  }, AUTOPLAY_MS);
})();

// ─── SPOTLIGHT CARD — per-card relative pointer tracking ───
// Each card tracks the cursor independently using its own bounding rect.
// --cx / --cy are offsets from the card's top-left corner, so only the
// hovered card lights up and the gradient position is cursor-accurate.
// On pointerleave the values are reset to -9999px, hiding the glow.
(function () {
  document.querySelectorAll('.addon-item[data-glow], .pricing-card[data-glow]').forEach(function (card) {
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--cx', (e.clientX - r.left).toFixed(1) + 'px');
      card.style.setProperty('--cy', (e.clientY - r.top).toFixed(1) + 'px');
    }, { passive: true });

    card.addEventListener('pointerleave', function () {
      card.style.setProperty('--cx', '-9999px');
      card.style.setProperty('--cy', '-9999px');
    }, { passive: true });
  });
})();

// ─── PACKAGE PILL TABS + PRICE ODOMETER ───
// All three panels live in the DOM (crawlable); pills show/hide them.
// On switch, the shown panel's price numbers roll up to their targets
// in a fast (<0.5s) count-up. Feature lists and labels swap instantly.
(function () {
  const pills  = document.querySelectorAll('.pill-toggle .pill');
  const panels = document.querySelectorAll('.pricing-panel');
  if (!pills.length || !panels.length) return;

  // Cache each price's integer target up front so a roll always knows
  // its destination regardless of what's currently on screen.
  document.querySelectorAll('.pricing-panel .price-amount').forEach(function (el) {
    el.dataset.value = el.textContent.replace(/[^0-9]/g, '');
  });

  const DURATION = 1400; // milliseconds — slow, smooth roll
  function easeOut(t) { return 1 - Math.pow(1 - t, 4); }

  function rollPrices(panel) {
    panel.querySelectorAll('.price-amount').forEach(function (el) {
      const target = parseInt(el.dataset.value, 10);
      if (isNaN(target)) return;
      // Token cancels any still-running roll on this element (rapid clicks).
      el._roll = (el._roll || 0) + 1;
      const myRoll = el._roll;
      const start = performance.now();
      (function step(now) {
        if (el._roll !== myRoll) return;
        const t = Math.min(1, (now - start) / DURATION);
        el.textContent = '$' + Math.round(easeOut(t) * target);
        if (t < 1) requestAnimationFrame(step);
        else el.textContent = '$' + target;
      })(start);
    });
  }

  function activate(name) {
    pills.forEach(function (p) {
      const on = p.dataset.tab === name;
      p.classList.toggle('is-active', on);
      p.setAttribute('aria-selected', String(on));
    });
    panels.forEach(function (panel) {
      const on = panel.dataset.panel === name;
      panel.hidden = !on;
      if (on) {
        // Ensure any reveal elements in the shown panel aren't stuck hidden.
        panel.querySelectorAll('.reveal').forEach(function (r) { r.classList.add('visible'); });
        rollPrices(panel);
      }
    });
  }

  pills.forEach(function (pill) {
    pill.addEventListener('click', function () { activate(pill.dataset.tab); });
  });

  // Deep links from the homepage package cards: /services#exterior etc.
  const fromHash = location.hash.slice(1);
  if (Array.prototype.some.call(pills, function (p) { return p.dataset.tab === fromHash; })) {
    activate(fromHash);
  }
})();

// ─── ANIMATED GRID PATTERN (gallery) ───
// Ports AnimatedGridPattern: numSquares=30, maxOpacity=0.1, duration=3s, repeatDelay=1s
// Each rect: fade in over 3s → hold → fade out over 3s → reposition → repeat
// Initial stagger: index * 100ms  (mirrors delay: index * 0.1 in framer transition)
(function () {
  const svgEl    = document.getElementById('gallery-grid-svg');
  const group    = document.getElementById('gallery-squares');
  if (!svgEl || !group) return;

  const CELL_W      = 40;
  const CELL_H      = 40;
  const MAX_OPACITY = 0.1;
  const DURATION    = 3000;  // 3 seconds (duration prop)
  const NUM_SQUARES = 30;

  let W = 0, H = 0;

  function getPos() {
    const cols = Math.max(1, Math.floor(W / CELL_W));
    const rows = Math.max(1, Math.floor(H / CELL_H));
    return [
      Math.floor(Math.random() * cols),
      Math.floor(Math.random() * rows)
    ];
  }

  // Create all rects upfront (mirrors generateSquares)
  const rects = Array.from({ length: NUM_SQUARES }, () => {
    const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    r.setAttribute('width',        CELL_W - 1);
    r.setAttribute('height',       CELL_H - 1);
    r.setAttribute('fill',         'currentColor');
    r.setAttribute('stroke-width', '0');
    r.style.opacity = '0';
    group.appendChild(r);
    return r;
  });

  // Animate one rect: fade in → fade out → reposition → repeat
  // Mirrors: initial={opacity:0} animate={opacity:maxOpacity} transition={duration, repeat:1, repeatType:"reverse"}
  // onAnimationComplete → updateSquarePosition → restarts
  function runRect(rect, delay) {
    function cycle() {
      if (!W || !H) { setTimeout(cycle, 200); return; }
      const [gx, gy] = getPos();
      rect.setAttribute('x', gx * CELL_W + 1);
      rect.setAttribute('y', gy * CELL_H + 1);

      let start = null;
      function step(ts) {
        if (!start) start = ts;
        const t = ts - start;
        if (t < DURATION) {
          // Fade in (0 → maxOpacity)
          rect.style.opacity = (t / DURATION * MAX_OPACITY).toFixed(4);
          requestAnimationFrame(step);
        } else if (t < DURATION * 2) {
          // Fade out — reverse (maxOpacity → 0)
          rect.style.opacity = ((1 - (t - DURATION) / DURATION) * MAX_OPACITY).toFixed(4);
          requestAnimationFrame(step);
        } else {
          rect.style.opacity = '0';
          cycle(); // reposition and restart (onAnimationComplete behaviour)
        }
      }
      requestAnimationFrame(step);
    }
    setTimeout(cycle, delay);
  }

  // ResizeObserver keeps W/H current (mirrors the ResizeObserver in the component)
  const ro = new ResizeObserver(entries => {
    for (const e of entries) { W = e.contentRect.width; H = e.contentRect.height; }
  });
  ro.observe(svgEl);

  // Boot — wait one frame for layout, then stagger-start all rects
  requestAnimationFrame(() => {
    const bbox = svgEl.getBoundingClientRect();
    W = bbox.width;
    H = bbox.height;
    rects.forEach((r, i) => runRect(r, i * 100));
  });
})();

// ─── BEFORE / AFTER CAROUSELS (gallery) ───
// One carousel per category tab (Exterior / Interior). The visible one
// auto-advances every 5s; clicking a thumbnail jumps to that pair, and
// hovering pauses autoplay. Videos only play while their slide is showing.
(function () {
  const carousels = document.querySelectorAll('.gallery-carousel');
  if (!carousels.length) return;

  const AUTOPLAY_MS = 5000;

  const instances = Array.from(carousels, carousel => {
    const slides = carousel.querySelectorAll('.gallery-slide');
    const thumbs = carousel.querySelectorAll('.gallery-thumb');
    let current = 0;
    let timer = null;

    function syncVideos() {
      slides.forEach((slide, j) => {
        slide.querySelectorAll('video').forEach(v => {
          if (j === current && !carousel.hidden) {
            v.preload = 'auto';
            const p = v.play();
            if (p) p.catch(() => {}); // autoplay can be refused; the poster still shows
          } else {
            v.pause();
          }
        });
      });
    }

    function show(i) {
      current = i;
      slides.forEach((slide, j) => slide.classList.toggle('is-active', j === i));
      thumbs.forEach((t, j) => {
        t.classList.toggle('is-active', j === i);
        t.setAttribute('aria-pressed', String(j === i));
      });
      syncVideos();
    }

    function start() {
      if (!timer && !carousel.hidden) {
        timer = setInterval(() => show((current + 1) % slides.length), AUTOPLAY_MS);
      }
    }
    function stop() {
      clearInterval(timer);
      timer = null;
    }

    thumbs.forEach((thumb, i) => {
      thumb.addEventListener('click', () => {
        show(i);
        // Restart the timer so autoplay doesn't advance right after a manual pick
        if (timer) { stop(); start(); }
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);

    return { carousel, show, start, stop, get current() { return current; } };
  });

  // Category tabs
  const tabs = document.querySelectorAll('[data-gallery-tab]');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const name = tab.dataset.galleryTab;
      tabs.forEach(t => {
        const on = t === tab;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', String(on));
      });
      instances.forEach(inst => {
        const on = inst.carousel.dataset.gallery === name;
        inst.stop();
        inst.carousel.hidden = !on;
        if (on) {
          inst.carousel.classList.add('visible'); // skip the scroll-reveal fade
          inst.show(0);
          inst.start();
        } else {
          inst.show(inst.current); // pauses its videos
        }
      });
    });
  });

  instances.forEach(inst => { inst.show(0); inst.start(); });
})();

// ─── REVIEWS: "Show all" on phones ───
// Phones show the first three cards; the button reveals the rest.
(function () {
  const btn = document.querySelector('.reviews-more-btn');
  const grid = document.getElementById('reviews-grid');
  if (!btn || !grid) return;
  btn.addEventListener('click', () => {
    grid.classList.add('is-expanded');
    btn.setAttribute('aria-expanded', 'true');
    btn.hidden = true;
  });
})();

// ─── FORMSPREE SUBMISSION ───
(function () {
  var form = document.getElementById('contact-form');
  var thankyou = document.getElementById('form-thankyou');
  if (!form || !thankyou) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var data = new FormData(form);
    var btn = form.querySelector('.btn-submit');
    var originalText = btn.textContent;
    btn.textContent = 'Sending…';
    btn.disabled = true;

    fetch(form.action, {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    })
    .then(function (res) {
      if (res.ok) {
        form.style.display = 'none';
        thankyou.style.display = 'block';
        if (typeof gtag === 'function') {
          gtag('event', 'form_submit', {
            'event_category': 'engagement',
            'event_label': 'contact_form'
          });
        }
      } else {
        return res.json().then(function (json) {
          throw new Error(json.errors ? json.errors.map(function(e){ return e.message; }).join(', ') : 'Submission failed.');
        });
      }
    })
    .catch(function (err) {
      btn.textContent = originalText;
      btn.disabled = false;
      alert('Sorry, something went wrong: ' + err.message + '\nPlease try emailing us directly.');
    });
  });
})();

// ─── GA4 CLICK TRACKING (phone / text) ───
(function () {
  if (typeof gtag !== 'function') return;
  if (window.__gaClickTrackingBound) return; // don't re-run this setup if the script ever loads twice
  window.__gaClickTrackingBound = true;

  function bindTracking(selector, eventName, fallbackLabel) {
    document.querySelectorAll(selector).forEach(function (link) {
      if (link.dataset.gaBound === 'true') return; // never attach more than one listener per element
      link.dataset.gaBound = 'true';

      var lastFired = 0;
      link.addEventListener('click', function () {
        var now = Date.now();
        if (now - lastFired < 1200) return; // collapse duplicate/ghost click events from a single tap
        lastFired = now;
        gtag('event', eventName, {
          'event_category': 'engagement',
          'event_label': link.getAttribute('data-ga-label') || fallbackLabel
        });
      });
    });
  }

  bindTracking('a[href^="tel:"]', 'phone_click', 'phone');
  bindTracking('a[href^="sms:"]', 'text_click', 'text');
  bindTracking('a[href*="book.squareup.com"]', 'booking_click', 'book_online');
})();
