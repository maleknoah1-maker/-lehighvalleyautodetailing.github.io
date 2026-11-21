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

// ─── SANTA FLY-BY: full-color side view of Santa, sleigh and galloping reindeer ───
// Crosses [data-santa] sections behind the content and never catches clicks.
// Skipped entirely for visitors who prefer reduced motion.
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const hosts = document.querySelectorAll('[data-santa]');
  if (!hosts.length) return;

  // One reindeer facing right (local coordinates about 64 x 52). Legs are separate
  // paths so CSS can swing them at the hip and shoulder.
  function deer(lead) {
    return '<g class="deer">' +
      '<path class="leg back" d="M15 31 L13 43 L15 50"/>' +
      '<path class="leg front" d="M31 31 L31 43 L29 50"/>' +
      '<path d="M7 24 q-6 -3 -7 1 q3 3 7 1 z" fill="#f3e7d3"/>' +
      '<ellipse cx="24" cy="28" rx="17" ry="8" fill="#8b5a2b"/>' +
      '<ellipse cx="26" cy="31.5" rx="11" ry="3.8" fill="#b98552"/>' +
      '<path d="M35 24 Q40 18 43 11 L49 10 Q47 20 41 29 Z" fill="#8b5a2b"/>' +
      '<ellipse cx="50" cy="11" rx="7" ry="4" transform="rotate(15 50 11)" fill="#8b5a2b"/>' +
      '<ellipse cx="55.5" cy="13" rx="2.6" ry="2" fill="#6e4521"/>' +
      '<circle cx="50" cy="9.3" r="0.95" fill="#1a1a1a"/>' +
      '<path d="M45 8 l-3.5 -2.2 l1.4 3.4 z" fill="#6e4521"/>' +
      '<path d="M46 7 l-4 -7 M43.8 3 l-4.5 -1 M48.5 6.5 l-0.5 -7 M48.2 2.5 l-3.5 -2" fill="none" stroke="#d8b384" stroke-width="1.8" stroke-linecap="round"/>' +
      '<path d="M38 21 q4 6 1.5 11" fill="none" stroke="#c62828" stroke-width="2.4" stroke-linecap="round"/>' +
      '<circle cx="40" cy="32.5" r="1.6" fill="#f2c14e"/>' +
      '<path class="leg back b2" d="M19 31 L18 43 L20 50"/>' +
      '<path class="leg front f2" d="M35 31 L36 43 L34 50"/>' +
      (lead ? '<circle cx="58" cy="13.6" r="5.5" fill="#ff4d3d" opacity="0.35"/><circle cx="58" cy="13.6" r="2.4" fill="#ff3b2f"/>'
            : '<circle cx="58" cy="13.6" r="1.6" fill="#2b1a10"/>') +
      '</g>';
  }
  const deerAt = [[100, 14], [165, 10], [230, 6], [295, 2]];
  const svg =
    '<svg viewBox="0 0 362 80" xmlns="http://www.w3.org/2000/svg" focusable="false">' +
      // reins from Santa's hand to each collar
      '<path d="M62 31 L140 46 L205 42 L270 38 L335 34" fill="none" stroke="#f2c14e" stroke-width="1.1" opacity="0.9"/>' +
      deerAt.map(function (p, i) { return '<g transform="translate(' + p[0] + ' ' + p[1] + ')">' + deer(i === deerAt.length - 1) + '</g>'; }).join('') +
      // sack
      '<circle cx="22" cy="31" r="10.5" fill="#8a6a3e"/><path d="M17 22 q5 3 10 0" fill="none" stroke="#5e4526" stroke-width="1.6"/>' +
      // Santa: suit, belt, arm and mitten, face, beard, hat
      '<ellipse cx="41" cy="31" rx="9.5" ry="10.5" fill="#d32f2f"/>' +
      '<rect x="31.5" y="32" width="19" height="3.4" rx="1" fill="#1e1e1e"/><rect x="39" y="31.6" width="4.4" height="4.2" rx="0.8" fill="#f2c14e"/>' +
      '<path d="M45 26 L60 31" stroke="#d32f2f" stroke-width="4" stroke-linecap="round"/><circle cx="61.5" cy="31.4" r="2.4" fill="#1e1e1e"/>' +
      '<circle cx="45" cy="17" r="5.4" fill="#f2c7a5"/>' +
      '<path d="M40.5 18.5 Q44 30 50.5 19 Q49 22 45 21 Q42 21 40.5 18.5 Z" fill="#ffffff"/>' +
      '<circle cx="47.5" cy="15.6" r="0.9" fill="#1a1a1a"/>' +
      '<path d="M39.5 14 L51 6.5 L58 14 L47 13.6 Z" fill="#d32f2f"/>' +
      '<ellipse cx="45.5" cy="14.4" rx="6.6" ry="2" fill="#ffffff"/><circle cx="58.2" cy="15" r="2.4" fill="#ffffff"/>' +
      // sleigh body with gold trim, then runner
      '<path d="M10 60 L14 42 Q16 36 24 36 L58 38 Q70 38 75 31 L84 30 L77 52 Q72 60 60 60 Z" fill="#c62828"/>' +
      '<path d="M14 42 Q16 36 24 36 L58 38 Q70 38 75 31 L84 30" fill="none" stroke="#f2c14e" stroke-width="2.2" stroke-linecap="round"/>' +
      '<path d="M20 48 Q40 52 66 49" fill="none" stroke="#f2c14e" stroke-width="1.2" opacity="0.8"/>' +
      '<path d="M3 68 Q12 74 24 68 L68 68 Q80 68 84 58 M24 60 L22 68 M58 60 L60 68" fill="none" stroke="#f2c14e" stroke-width="2.6" stroke-linecap="round"/>' +
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
