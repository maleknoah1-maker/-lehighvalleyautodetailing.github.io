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
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => observer.observe(el));

// ─── SMOOTH ACTIVE NAV ───
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a, .mobile-menu a');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 120) current = s.id;
  });
  navLinks.forEach(link => {
    link.style.color = link.getAttribute('href') === '#' + current ? 'var(--text)' : '';
  });
}, { passive: true });

// ─── HERO MESH GRADIENT (WebGL) ───
(function () {
  const canvas = document.getElementById('hero-canvas');
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false });
  if (!gl) return; // silently skip if WebGL unavailable

  const VS = `
    attribute vec2 a_pos;
    void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
  `;

  // Smooth value-noise fbm mesh gradient — dark luxury palette
  // Colors: #0a0a0a → #1a1a1a → #222222, with very faint silver shimmer
  const FS = `
    precision highp float;
    uniform float u_time;
    uniform vec2  u_res;

    // Value noise hash
    float hash(vec2 p) {
      p = fract(p * vec2(234.34, 435.345));
      p += dot(p, p + 34.23);
      return fract(p.x * p.y);
    }

    // Bicubic-smoothed value noise
    float vnoise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash(i),               hash(i + vec2(1.0, 0.0)), f.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
        f.y
      );
    }

    // 4-octave fBm
    float fbm(vec2 p) {
      float v = 0.0, a = 0.5;
      p += vec2(17.4, 5.3);
      for (int i = 0; i < 4; i++) {
        v += a * vnoise(p);
        p  = p * 2.03 + vec2(1.7, 9.2);
        a *= 0.5;
      }
      return v;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_res;
      uv.y = 1.0 - uv.y;

      float t = u_time * 0.07;

      // Two domain-warped fbm layers for fluid mesh look
      vec2 q = vec2(fbm(uv * 2.1 + vec2(t, t * 0.6)),
                    fbm(uv * 2.1 + vec2(t * 0.8, -t * 0.5)));

      float n = fbm(uv * 1.8 + 1.8 * q + vec2(-t * 0.4, t * 0.3));
      n += fbm(uv * 3.4 + vec2(t * 0.5, -t * 0.7)) * 0.35;
      n /= 1.35;

      // Map n (0–1) to luxury dark range
      // Base: #0a0a0a (0.039) → mid: #181818 (0.094) → peak: #252525 (0.145)
      // Plus rare silver flicker only at extreme highs
      float base   = 0.039;
      float mid    = 0.094;
      float peak   = 0.148;

      float bright;
      if (n < 0.5) {
        bright = mix(base, mid,  n * 2.0);
      } else {
        bright = mix(mid,  peak, (n - 0.5) * 2.0);
      }

      // Very faint silver shimmer in brightest spots (~top 8%)
      float shimmer = smoothstep(0.88, 1.0, n) * 0.055;
      bright += shimmer;

      // Subtle vignette keeps edges anchored to pure black
      float dist = length(uv - 0.5) * 1.4;
      float vignette = 1.0 - clamp(dist * dist, 0.0, 0.72);
      bright *= vignette;

      gl_FragColor = vec4(vec3(bright), 1.0);
    }
  `;

  function compileShader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn('Shader compile error:', gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  const vs = compileShader(gl.VERTEX_SHADER, VS);
  const fs = compileShader(gl.FRAGMENT_SHADER, FS);
  if (!vs || !fs) return;

  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn('Program link error:', gl.getProgramInfoLog(prog));
    return;
  }
  gl.useProgram(prog);

  // Full-screen quad
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(prog, 'u_time');
  const uRes  = gl.getUniformLocation(prog, 'u_res');

  function resize() {
    const w = canvas.clientWidth  * Math.min(window.devicePixelRatio, 1.5) | 0;
    const h = canvas.clientHeight * Math.min(window.devicePixelRatio, 1.5) | 0;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width  = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  }

  let rafId;
  function render(ts) {
    resize();
    gl.uniform1f(uTime, ts * 0.001);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    rafId = requestAnimationFrame(render);
  }

  // Pause when hero leaves viewport — save GPU
  const heroSection = document.getElementById('hero');
  const visObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        if (!rafId) rafId = requestAnimationFrame(render);
      } else {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    });
  }, { threshold: 0 });
  visObs.observe(heroSection);

  rafId = requestAnimationFrame(render);
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

  const DURATION = 420; // milliseconds — under the 0.5s cap
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

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

// ─── BEFORE / AFTER CAROUSEL (gallery) ───
// Auto-advances every 5s; click a thumbnail to jump to that pair.
// Hovering the carousel pauses autoplay; leaving resumes it.
(function () {
  const carousel = document.querySelector('.gallery-carousel');
  const slides = document.querySelectorAll('.gallery-slide');
  const thumbs = document.querySelectorAll('.gallery-thumb');
  if (!carousel || !slides.length || !thumbs.length) return;

  const AUTOPLAY_MS = 5000;
  let current = 0;
  let timer = null;

  function show(i) {
    current = i;
    slides.forEach((slide, j) => slide.classList.toggle('is-active', j === i));
    thumbs.forEach((t, j) => {
      t.classList.toggle('is-active', j === i);
      t.setAttribute('aria-pressed', String(j === i));
    });
  }

  function start() {
    if (!timer) timer = setInterval(() => show((current + 1) % slides.length), AUTOPLAY_MS);
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

  start();
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
