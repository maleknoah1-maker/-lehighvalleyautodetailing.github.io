// Winter theme: falling snow inside [data-snow] sections only.
// Remove this file (and winter.css) in spring.
// - One small canvas per section, behind the content, never catches clicks
// - No animation at all when the visitor prefers reduced motion
// - Pauses when the section is off screen or the tab is hidden
(function () {
  const sections = document.querySelectorAll('[data-snow]');
  if (!sections.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  sections.forEach(function (section) {
    const canvas = document.createElement('canvas');
    canvas.className = 'snow-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    section.prepend(canvas);
    const ctx = canvas.getContext('2d');
    let flakes = [], w = 0, h = 0, dpr = 1, raf = 0, visible = false, last = 0;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = section.clientWidth;
      h = section.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // About one flake per 9,000 px², capped so tall sections stay light
      const count = Math.min(140, Math.max(25, Math.round((w * h) / 9000)));
      while (flakes.length < count) flakes.push(make(true));
      flakes.length = count;
    }
    function make(anywhere) {
      return {
        x: Math.random() * w,
        y: anywhere ? Math.random() * h : -6,
        r: 0.8 + Math.random() * 2.2,
        vy: 18 + Math.random() * 36,          // px per second
        drift: 6 + Math.random() * 14,
        phase: Math.random() * Math.PI * 2,
        a: 0.35 + Math.random() * 0.5
      };
    }
    function frame(t) {
      const dt = Math.min(0.05, (t - (last || t)) / 1000);
      last = t;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < flakes.length; i++) {
        const f = flakes[i];
        f.y += f.vy * dt;
        f.phase += dt;
        const x = f.x + Math.sin(f.phase) * f.drift;
        if (f.y > h + 6) { flakes[i] = make(false); continue; }
        ctx.globalAlpha = f.a;
        ctx.beginPath();
        ctx.arc(x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }
    function start() { if (!raf && visible && !document.hidden) { last = 0; raf = requestAnimationFrame(frame); } }
    function stop() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }

    resize();
    if (window.ResizeObserver) new ResizeObserver(resize).observe(section);
    else window.addEventListener('resize', resize);
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      visible ? start() : stop();
    }).observe(section);
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
  });
})();

// ─── SANTA FLY-BY: side-view sleigh and reindeer crossing [data-santa] sections ───
// Pale silhouette behind the content, never catches clicks. Skipped for reduced
// motion (the snow script above already returned early in that case).
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const hosts = document.querySelectorAll('[data-santa]');
  if (!hosts.length) return;

  // One reindeer facing right, about 60 x 46 units
  const deer = '<g class="deer">' +
    '<ellipse cx="25" cy="30" rx="18" ry="7.5"/>' +
    '<path d="M36 25 Q42 20 45 12 L50 11 Q48 20 41 30 Z"/>' +
    '<ellipse cx="51" cy="11.5" rx="6.5" ry="3.4" transform="rotate(12 51 11.5)"/>' +
    '<path d="M8 27 l-7 -3 l2 4 Z"/>' +
    '<g class="line"><path d="M46 9 l-5 -8 M43.5 5 l-5 -1.5 M49 8.5 l-1 -8 M48.6 4 l-4 -2.5"/>' +
    '<path class="legs" d="M36 34 L47 40 M33 35.5 L44 44 M15 34 L4 39 M17 35.5 L7 44"/></g>' +
    '</g>';
  const deerAt = [[96, 12], [160, 8], [224, 4], [288, 0]];
  const svg =
    '<svg viewBox="0 0 352 80" xmlns="http://www.w3.org/2000/svg" focusable="false">' +
      '<g class="line harness"><path d="M74 33 L121 41 L185 37 L249 33 L313 29"/></g>' +
      deerAt.map(function (p) { return '<g transform="translate(' + p[0] + ' ' + p[1] + ')">' + deer + '</g>'; }).join('') +
      '<circle class="nose" cx="345.5" cy="13.8" r="1.9"/>' +
      // sleigh: sack, Santa, body, runner
      '<circle cx="21" cy="30" r="9.5"/>' +
      '<ellipse cx="39" cy="30" rx="9" ry="10"/>' +
      '<circle cx="44" cy="16.5" r="5.2"/>' +
      '<path d="M39 14 L51 7.5 L57 14.5 L47 14 Z"/><circle cx="57.5" cy="15.5" r="2.1"/>' +
      '<g class="line"><path d="M46 27 L72 33"/></g>' +
      '<path d="M9 58 L13 40 Q15 35 23 35 L56 37 Q68 37 73 30 L80 29 L73 50 Q69 58 58 58 Z"/>' +
      '<g class="line runner"><path d="M3 66 Q12 71 24 66 L66 66 Q76 66 79 57 M24 58 L22 66 M56 58 L58 66"/></g>' +
    '</svg>';

  hosts.forEach(function (host) {
    const el = document.createElement('div');
    el.className = 'santa';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '<div class="santa-bob">' + svg + '</div>';
    host.prepend(el);
    let visible = false;
    function sync() { el.classList.toggle('is-paused', !visible || document.hidden); }
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; sync(); }).observe(host);
    document.addEventListener('visibilitychange', sync);
    sync();
  });
})();
