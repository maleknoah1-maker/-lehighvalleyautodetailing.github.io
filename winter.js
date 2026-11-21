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
