# Nav Logo, Hero Slideshow, Footer/Services Polish, and Services Page Split Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a nav-bar home logo, replace the hero's WebGL gradient with a cross-fading photo slideshow, enlarge the footer logo, move the Google Map into the shared footer, accent the active pill tab, add icons to How It Works, and split the Services pricing section onto its own `/services` page (mirroring the existing `/faq` page pattern) with every link that used to reach Contact still working.

**Architecture:** Static site, no build step (`index.html` / `faq/index.html` / new `services/index.html`, sharing `styles.css` and `script.js`, deployed as-is to GitHub Pages). Every task edits these files directly. There is no test framework or build tool in this environment (confirmed: no node, no real python — only the WindowsApps stub, no npm). "Tests" in this plan are structural verification: grep/PowerShell checks that markup, classes, and JSON are present/absent/valid, matching how every prior change to this repo has been verified. A final manual visual QA pass in a browser closes out the plan.

**Tech Stack:** HTML5, CSS3 (custom properties, no preprocessor), vanilla JS (IIFEs in `script.js`), no dependencies.

## Global Constraints

- No em dashes in customer-facing copy.
- Root-absolute paths (`/`, `/#anchor`, `/services`, `/faq`) for any link that must work identically from more than one page; bare `#anchor` only for links that stay on the same page they're written on.
- New pages (`services/index.html`) follow the `faq/index.html` pattern exactly: `../`-prefixed asset paths, own title/meta/og/twitter tags, canonical URL, duplicated LocalBusiness JSON-LD, shared nav/footer markup copied verbatim.
- `--accent` is `#a8332a` (crimson), `--accent-text` is `var(--text)` (near-white) — reuse these variables, never hardcode the hex, so future accent-color swaps keep working.
- Any new soft dark-gradient glow must use `var(--dither-noise) repeat` as its first background layer paired with a matching `mask-image`, and must NOT have a CSS `blur()` filter on the same element (established anti-banding pattern in this codebase) — not needed for this plan (no new glows), noted only because Task 6 touches `#hero::after`, which already follows this pattern and must keep doing so.
- `script.js`'s existing null-guard convention (`if (!el) return;` at the top of each IIFE) must be preserved/followed for any new IIFE, since script.js is shared across pages that don't all have the same DOM.

---

## File Structure

| File | Responsibility |
|---|---|
| `index.html` | Homepage. Loses the Services section (moves to `services/index.html`), loses the hero canvas element (replaced by slideshow markup), loses the Contact section's map (moves to footer), gains nav logo, How-It-Works icons, an About→Add-Ons bridge CTA, Add-Ons context line. |
| `faq/index.html` | Gains nav logo, footer map. Nav "Services" link and its two in-copy "Services page" links point to `/services` instead of `/#services`. |
| `services/index.html` (new) | New page, built like `faq/index.html`. Contains the pill-toggle/pricing-panel markup moved from `index.html`, its own head tags, LocalBusiness JSON-LD (with `hasOfferCatalog`), shared nav/footer (with logo + map). |
| `styles.css` | All visual changes: `.nav-logo`, hero slideshow layer + recolored glow, `.footer-logo` size, `.contact-map` moved styles (renamed context, same rules), `.pill.is-active` color, `.how-icon`, `.services-bridge`. |
| `script.js` | Removes the hero WebGL IIFE (~lines 51-222). Adds a hero slideshow autoplay IIFE modeled on the existing gallery-carousel autoplay IIFE (~line 390). Pill-toggle IIFE (~line 248) and its null-guard already work unmodified on the new page. |
| `sitemap.xml` | Gains a `/services` `<url>` entry. |

---

## Task 1: Nav logo as home link

**Files:**
- Modify: `styles.css:142-147` (`.nav-inner`), add new `.nav-logo`/`.nav-logo-img` rules nearby
- Modify: `index.html:111-112` (`.nav-inner` opening, before `.nav-links`)
- Modify: `faq/index.html:145-146` (same structure)

**Interfaces:**
- Produces: `.nav-logo` (anchor), `.nav-logo-img` (img) — reused verbatim by Task 7 when building `services/index.html`'s nav.

- [ ] **Step 1: Verify current state has no nav logo**

Run:
```bash
grep -n "nav-logo" "index.html" "faq/index.html" "styles.css"
```
Expected: no matches (confirms the logo isn't already present, so we don't duplicate it).

- [ ] **Step 2: Add `.nav-logo`/`.nav-logo-img` CSS**

In `styles.css`, change the `.nav-inner` rule (currently lines 142-147):

```css
.nav-inner {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
}
```

to:

```css
.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.nav-logo {
  display: flex;
  align-items: center;
}
.nav-logo-img {
  height: 40px;
  width: auto;
  display: block;
}
```

- [ ] **Step 3: Add the logo link to `index.html`'s nav**

In `index.html`, change (lines 111-112):

```html
      <div class="nav-inner">
        <ul class="nav-links">
```

to:

```html
      <div class="nav-inner">
        <a href="/" class="nav-logo" aria-label="Lehigh Valley Auto Detailing home">
          <img src="images/lehigh-valley-auto-detailing-logo.png" alt="Lehigh Valley Auto Detailing" class="nav-logo-img" />
        </a>
        <ul class="nav-links">
```

- [ ] **Step 4: Add the logo link to `faq/index.html`'s nav**

In `faq/index.html`, change (lines 145-146):

```html
      <div class="nav-inner">
        <ul class="nav-links">
```

to:

```html
      <div class="nav-inner">
        <a href="/" class="nav-logo" aria-label="Lehigh Valley Auto Detailing home">
          <img src="../images/lehigh-valley-auto-detailing-logo.png" alt="Lehigh Valley Auto Detailing" class="nav-logo-img" />
        </a>
        <ul class="nav-links">
```

- [ ] **Step 5: Verify**

Run:
```bash
grep -c "nav-logo" "index.html"
grep -c "nav-logo" "faq/index.html"
grep -c "\.nav-logo" "styles.css"
```
Expected: 2 in each HTML file (the `<a class="nav-logo">` and `<img class="nav-logo-img">`), at least 2 in styles.css (`.nav-logo` and `.nav-logo-img` rules).

- [ ] **Step 6: Commit**

```bash
git add index.html faq/index.html styles.css
git commit -m "Add clickable nav logo as home link"
```

---

## Task 2: Larger footer logo

**Files:**
- Modify: `styles.css:1319-1324` (`.footer-logo`)

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing new (value-only change); Task 7 copies `.footer-logo` usage as-is into `services/index.html`.

- [ ] **Step 1: Verify current size**

Run:
```bash
grep -n "height: 36px" styles.css
```
Expected: one match, inside `.footer-logo`.

- [ ] **Step 2: Increase the size**

In `styles.css`, change:

```css
.footer-logo {
  height: 36px;
  width: auto;
  opacity: 0.4;
  filter: brightness(0.85);
}
```

to:

```css
.footer-logo {
  height: 56px;
  width: auto;
  opacity: 0.4;
  filter: brightness(0.85);
}
```

- [ ] **Step 3: Verify**

Run:
```bash
grep -n "height: 56px" styles.css
```
Expected: one match, inside `.footer-logo`.

- [ ] **Step 4: Commit**

```bash
git add styles.css
git commit -m "Increase footer logo size from 36px to 56px"
```

---

## Task 3: Move Google Map into the shared footer

**Files:**
- Modify: `index.html:907-920` (remove `.contact-map` from Contact section)
- Modify: `index.html:928-949` (add map into footer)
- Modify: `faq/index.html:270-292` (add map into footer)
- Modify: `styles.css:1149-1171` (`.contact-map` rules — adjust width cap for footer context)

**Interfaces:**
- Produces: `.footer-map` (wraps the existing `.contact-map-frame`/`.contact-map-iframe`/`.contact-map-note` classes, reused as-is) — Task 7 copies this verbatim into `services/index.html`'s footer.

- [ ] **Step 1: Verify current location**

Run:
```bash
grep -n "contact-map" index.html faq/index.html
```
Expected: 5 matches in `index.html` (the wrapping div, frame, iframe class, and note — all inside the Contact section, before `</main>`), 0 matches in `faq/index.html`.

- [ ] **Step 2: Remove the map from the Contact section in `index.html`**

Delete this block (lines 907-920):

```html
        <div class="contact-map reveal">
          <div class="contact-map-frame">
            <iframe
              class="contact-map-iframe"
              src="https://www.google.com/maps?q=Coopersburg,PA+18036&output=embed"
              width="100%"
              height="350"
              allowfullscreen=""
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              title="Map showing the Coopersburg, PA service area"></iframe>
          </div>
          <p class="contact-map-note">Exact drop-off address provided upon booking confirmation.</p>
        </div>

```

so the Contact section's `.container` closes right after the `.contact-grid` div ends, with no `.contact-map` sibling remaining.

- [ ] **Step 3: Add the map into `index.html`'s footer**

Change the footer (lines 928-949) from:

```html
  <footer role="contentinfo">
    <div class="container">
      <div class="footer-inner">
        <img src="images/lehigh-valley-auto-detailing-logo.png" class="footer-logo" alt="Lehigh Valley Auto Detailing" />
        <a href="https://instagram.com/lehighautodetailing" class="footer-social" target="_blank" rel="noopener" aria-label="Follow us on Instagram (@lehighautodetailing)">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect x="2.5" y="2.5" width="19" height="19" rx="5" stroke="currentColor" stroke-width="1.6"/>
            <circle cx="12" cy="12" r="4.5" stroke="currentColor" stroke-width="1.6"/>
            <circle cx="17.4" cy="6.6" r="1.2" fill="currentColor"/>
          </svg>
          <span>@lehighautodetailing</span>
        </a>
        <p class="footer-copy">&copy; 2026 Lehigh Valley Auto Detailing. Coopersburg, PA.</p>

        <div class="payment-accepted">
          <p class="payment-label">Payment Accepted</p>
          <p class="payment-methods">Visa &middot; Mastercard &middot; American Express &middot; Discover &middot; Apple Pay &middot; Google Pay</p>
          <p class="payment-secure">Secure payments powered by Stripe</p>
        </div>
      </div>
    </div>
  </footer>
```

to:

```html
  <footer role="contentinfo">
    <div class="container">
      <div class="footer-inner">
        <img src="images/lehigh-valley-auto-detailing-logo.png" class="footer-logo" alt="Lehigh Valley Auto Detailing" />
        <a href="https://instagram.com/lehighautodetailing" class="footer-social" target="_blank" rel="noopener" aria-label="Follow us on Instagram (@lehighautodetailing)">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect x="2.5" y="2.5" width="19" height="19" rx="5" stroke="currentColor" stroke-width="1.6"/>
            <circle cx="12" cy="12" r="4.5" stroke="currentColor" stroke-width="1.6"/>
            <circle cx="17.4" cy="6.6" r="1.2" fill="currentColor"/>
          </svg>
          <span>@lehighautodetailing</span>
        </a>
        <p class="footer-copy">&copy; 2026 Lehigh Valley Auto Detailing. Coopersburg, PA.</p>

        <div class="footer-map">
          <div class="contact-map-frame">
            <iframe
              class="contact-map-iframe"
              src="https://www.google.com/maps?q=Coopersburg,PA+18036&output=embed"
              width="100%"
              height="260"
              allowfullscreen=""
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              title="Map showing the Coopersburg, PA service area"></iframe>
          </div>
          <p class="contact-map-note">Exact drop-off address provided upon booking confirmation.</p>
        </div>

        <div class="payment-accepted">
          <p class="payment-label">Payment Accepted</p>
          <p class="payment-methods">Visa &middot; Mastercard &middot; American Express &middot; Discover &middot; Apple Pay &middot; Google Pay</p>
          <p class="payment-secure">Secure payments powered by Stripe</p>
        </div>
      </div>
    </div>
  </footer>
```

(Height dropped from 350 to 260 to fit the footer's more compact vertical rhythm — matches the site's own 640px-breakpoint mobile map height, used here at all widths since the footer context is narrower than the full Contact section was.)

- [ ] **Step 4: Add the same footer map block to `faq/index.html`**

In `faq/index.html`, change the footer (lines 270-292) the same way, using `../images/` for the logo (already correct) and identical map markup as Step 3 (the iframe src/title are location-based, not page-based, so they're identical across pages):

```html
        <p class="footer-copy">&copy; 2026 Lehigh Valley Auto Detailing. Coopersburg, PA.</p>

        <div class="footer-map">
          <div class="contact-map-frame">
            <iframe
              class="contact-map-iframe"
              src="https://www.google.com/maps?q=Coopersburg,PA+18036&output=embed"
              width="100%"
              height="260"
              allowfullscreen=""
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              title="Map showing the Coopersburg, PA service area"></iframe>
          </div>
          <p class="contact-map-note">Exact drop-off address provided upon booking confirmation.</p>
        </div>

        <div class="payment-accepted">
```

(insert the new `.footer-map` block between the existing `.footer-copy` paragraph and `.payment-accepted` div — same position as in `index.html`.)

- [ ] **Step 5: Add `.footer-map` width cap in `styles.css`**

In `styles.css`, after the existing `.contact-map-note` rule (ends around line 1171), add:

```css
.footer-map {
  width: 100%;
  max-width: 500px;
  margin-top: 0.5rem;
}
```

- [ ] **Step 6: Verify**

Run:
```bash
grep -c "footer-map" index.html faq/index.html styles.css
grep -c "contact-map" index.html
```
Expected: `footer-map` appears at least twice in each HTML file (wrapper div open+implicit, plus CSS class) and once in `styles.css`; `contact-map` in `index.html` now only matches the `contact-map-frame`/`contact-map-iframe`/`contact-map-note` classes inside the new `.footer-map` block (3 matches), not the old standalone `.contact-map reveal` wrapper (confirms it was removed from Contact, not duplicated).

- [ ] **Step 7: Commit**

```bash
git add index.html faq/index.html styles.css
git commit -m "Move Google Map from Contact section into shared footer"
```

---

## Task 4: Crimson accent on the active pill tab

**Files:**
- Modify: `styles.css:586-589` (`.pill.is-active`)

**Interfaces:**
- Consumes: `var(--accent)`, `var(--accent-text)` (already defined in `:root`, `styles.css:12,14`).
- Produces: nothing new; Task 7 copies `.pill`/`.pill-toggle` usage as-is into `services/index.html`.

- [ ] **Step 1: Verify current color**

Run:
```bash
grep -n "pill.is-active" -A 3 styles.css
```
Expected: shows `background: var(--silver); color: var(--black);`.

- [ ] **Step 2: Change to the accent color**

In `styles.css`, change:

```css
.pill.is-active {
  background: var(--silver);
  color: var(--black);
}
```

to:

```css
.pill.is-active {
  background: var(--accent);
  color: var(--accent-text);
}
```

- [ ] **Step 3: Verify**

Run:
```bash
grep -n "pill.is-active" -A 3 styles.css
```
Expected: shows `background: var(--accent); color: var(--accent-text);`.

- [ ] **Step 4: Commit**

```bash
git add styles.css
git commit -m "Use crimson accent color for the active pill tab"
```

---

## Task 5: How It Works step icons

**Files:**
- Modify: `index.html:189-210` (`.how-grid`, all 4 `.how-item`s)
- Modify: `styles.css:510-517` (`.how-item`, add `.how-icon`/`.how-icon-svg`)

**Interfaces:**
- Produces: `.how-icon` (wraps one `<svg class="how-icon-svg">` per step), positioned before `.how-num` in each `.how-item`.

- [ ] **Step 1: Verify no icons currently exist**

Run:
```bash
grep -n "how-icon" index.html styles.css
```
Expected: no matches.

- [ ] **Step 2: Add `.how-icon` CSS**

In `styles.css`, after the `.how-item {}` rule (line 510), add:

```css
.how-icon {
  margin-bottom: 1rem;
}
.how-icon-svg {
  width: 32px;
  height: 32px;
  color: var(--accent);
}
```

- [ ] **Step 3: Add icons to each step in `index.html`**

Change the four `.how-item` blocks (lines 190-209) from:

```html
          <div class="how-item reveal reveal-delay-1">
            <p class="how-num">01</p>
            <h3 class="how-title">Book Your<br>Appointment</h3>
            <p class="how-desc">Request a quote through the form below, or call or text us directly. We'll confirm a time that works for you.</p>
          </div>
          <div class="how-item reveal reveal-delay-2">
            <p class="how-num">02</p>
            <h3 class="how-title">Drop Off<br>Your Vehicle</h3>
            <p class="how-desc">Bring your car to our Coopersburg location. We're a stationary shop, so there's no mobile chaos and no compromises.</p>
          </div>
          <div class="how-item reveal reveal-delay-3">
            <p class="how-num">03</p>
            <h3 class="how-title">We Detail<br>Your Car</h3>
            <p class="how-desc">Professional grade equipment and meticulous attention to every inch, inside and out.</p>
          </div>
          <div class="how-item reveal reveal-delay-4">
            <p class="how-num">04</p>
            <h3 class="how-title">Pick Up<br>&amp; Enjoy</h3>
            <p class="how-desc">Drive away with a vehicle that looks, feels, and smells brand new.</p>
          </div>
```

to:

```html
          <div class="how-item reveal reveal-delay-1">
            <div class="how-icon">
              <svg class="how-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.5"/>
                <path d="M3 9h18" stroke="currentColor" stroke-width="1.5"/>
                <path d="M8 3v4M16 3v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                <path d="M8 13h2M8 17h2M14 13h2M14 17h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </div>
            <p class="how-num">01</p>
            <h3 class="how-title">Book Your<br>Appointment</h3>
            <p class="how-desc">Request a quote through the form below, or call or text us directly. We'll confirm a time that works for you.</p>
          </div>
          <div class="how-item reveal reveal-delay-2">
            <div class="how-icon">
              <svg class="how-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M4 16l1.1-4.4A2 2 0 0 1 7.04 10h9.92a2 2 0 0 1 1.94 1.6L20 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M3 16h18v2.5a1 1 0 0 1-1 1h-1.5a1 1 0 0 1-1-1V18h-11v.5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V16z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                <circle cx="7" cy="16.2" r="1.3" fill="currentColor"/>
                <circle cx="17" cy="16.2" r="1.3" fill="currentColor"/>
              </svg>
            </div>
            <p class="how-num">02</p>
            <h3 class="how-title">Drop Off<br>Your Vehicle</h3>
            <p class="how-desc">Bring your car to our Coopersburg location. We're a stationary shop, so there's no mobile chaos and no compromises.</p>
          </div>
          <div class="how-item reveal reveal-delay-3">
            <div class="how-icon">
              <svg class="how-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M10 3h3v2.2l1.5 1.3H10V3z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                <rect x="8" y="8" width="8" height="13" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
                <path d="M16 9l3-1.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
                <path d="M20 5.5l1 .6M21 7.5h1.2M19.3 9l.9.8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
              </svg>
            </div>
            <p class="how-num">03</p>
            <h3 class="how-title">We Detail<br>Your Car</h3>
            <p class="how-desc">Professional grade equipment and meticulous attention to every inch, inside and out.</p>
          </div>
          <div class="how-item reveal reveal-delay-4">
            <div class="how-icon">
              <svg class="how-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M3 15l1.1-4.4A2 2 0 0 1 6.04 9h7.92a2 2 0 0 1 1.94 1.6L17 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 15h15v2.5a1 1 0 0 1-1 1h-1.5a1 1 0 0 1-1-1V17h-8v.5a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V15z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                <circle cx="6" cy="15.2" r="1.2" fill="currentColor"/>
                <circle cx="14" cy="15.2" r="1.2" fill="currentColor"/>
                <path d="M18 10.5l1.8 1.8L23 8.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <p class="how-num">04</p>
            <h3 class="how-title">Pick Up<br>&amp; Enjoy</h3>
            <p class="how-desc">Drive away with a vehicle that looks, feels, and smells brand new.</p>
          </div>
```

- [ ] **Step 4: Verify**

Run:
```bash
grep -c "how-icon-svg" index.html
```
Expected: 4.

- [ ] **Step 5: Commit**

```bash
git add index.html styles.css
git commit -m "Add icons to each How It Works step"
```

---

## Task 6: Hero slideshow background

**Files:**
- Modify: `index.html:156-175` (`#hero` section)
- Modify: `styles.css:239-301` (`#hero`, `#hero-canvas`, `#hero::after`, `.hero-inner`, `.hero-logo`)
- Modify: `script.js:51-222` (remove WebGL IIFE, add slideshow IIFE)

**Interfaces:**
- Consumes: `images/02-after-cargo-floor.jpg`, `images/04-after-dashboard.jpg`, `images/06-after-second-row.jpg`, `images/08-after-backseat-floor.jpg`, `images/10-after-dashboard-2.jpg`, `images/12-after-driver-door.jpg` (existing files, no upload needed).
- Produces: `.hero-slideshow`, `.hero-slide` (with `.is-active` toggle, mirrors `.gallery-slide`'s existing convention), `.hero-scrim`.

- [ ] **Step 1: Verify current hero structure**

Run:
```bash
grep -n "hero-canvas\|hero-slideshow" index.html script.js
```
Expected: `hero-canvas` appears in `index.html` (the `<canvas>` tag) and twice in `script.js` (the `getElementById` call and the guard comment); `hero-slideshow` has no matches yet.

- [ ] **Step 2: Replace the canvas element with slideshow markup in `index.html`**

Change (lines 156-159):

```html
    <section id="hero" aria-label="Hero">
      <canvas id="hero-canvas" aria-hidden="true"></canvas>
      <div class="hero-inner">
        <img src="images/lehigh-valley-auto-detailing-logo.png" class="hero-logo" alt="Lehigh Valley Auto Detailing" />
```

to:

```html
    <section id="hero" aria-label="Hero">
      <div class="hero-slideshow" aria-hidden="true">
        <img src="images/02-after-cargo-floor.jpg" class="hero-slide is-active" alt="" />
        <img src="images/04-after-dashboard.jpg" class="hero-slide" alt="" />
        <img src="images/06-after-second-row.jpg" class="hero-slide" alt="" />
        <img src="images/08-after-backseat-floor.jpg" class="hero-slide" alt="" />
        <img src="images/10-after-dashboard-2.jpg" class="hero-slide" alt="" />
        <img src="images/12-after-driver-door.jpg" class="hero-slide" alt="" />
      </div>
      <div class="hero-scrim" aria-hidden="true"></div>
      <div class="hero-inner">
        <img src="images/lehigh-valley-auto-detailing-logo.png" class="hero-logo" alt="Lehigh Valley Auto Detailing" />
```

(`alt=""` on the slides matches the existing convention for the gallery's own thumbnail/background imagery that's purely decorative — the images already have real alt text where they're the primary content, e.g. the gallery carousel's main frame.)

- [ ] **Step 3: Replace `#hero-canvas` CSS with `.hero-slideshow`/`.hero-slide`/`.hero-scrim`, and recolor `#hero::after`**

In `styles.css`, change (lines 251-280):

```css
/* ─── MESH GRADIENT CANVAS ─── */
#hero-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  display: block;
}

/* Subtle radial glow — sits above canvas, below content */
#hero::after {
  content: '';
  position: absolute;
  top: 30%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  height: 600px;
  background:
    var(--dither-noise) repeat,
    radial-gradient(ellipse, rgba(192,192,192,0.06) 0%, transparent 70%);
  /* Mask fades noise + color together, so the 600x600 box edge never shows
     as a hard-edged block — without this the tiled noise is visible right
     up to the box boundary regardless of how far the gradient has faded. */
  mask-image: radial-gradient(ellipse, black 0%, transparent 70%);
  -webkit-mask-image: radial-gradient(ellipse, black 0%, transparent 70%);
  pointer-events: none;
  z-index: 1;
}
```

to:

```css
/* ─── PHOTO SLIDESHOW ─── */
.hero-slideshow {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
}
.hero-slide {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 1.2s ease;
}
.hero-slide.is-active { opacity: 1; }

/* Darkens the photos so hero text/buttons stay legible over any slide */
.hero-scrim {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: linear-gradient(180deg, rgba(10,10,10,0.72) 0%, rgba(10,10,10,0.6) 50%, rgba(10,10,10,0.78) 100%);
  pointer-events: none;
}

/* Subtle radial glow — sits above slideshow + scrim, below content */
#hero::after {
  content: '';
  position: absolute;
  top: 30%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  height: 600px;
  background:
    var(--dither-noise) repeat,
    radial-gradient(ellipse, rgba(168,51,42,0.16) 0%, transparent 70%);
  /* Mask fades noise + color together, so the 600x600 box edge never shows
     as a hard-edged block — without this the tiled noise is visible right
     up to the box boundary regardless of how far the gradient has faded. */
  mask-image: radial-gradient(ellipse, black 0%, transparent 70%);
  -webkit-mask-image: radial-gradient(ellipse, black 0%, transparent 70%);
  pointer-events: none;
  z-index: 1;
}
```

(The glow's rgba changed from silver `rgba(192,192,192,0.06)` to crimson `rgba(168,51,42,0.16)` — the same hardcoded-RGB-of-`--accent` approach already used for `#addons::after`'s red blob, since custom properties can't be channel-split inside `rgba()`. Opacity raised from 0.06 to 0.16 to match the other crimson glows' visibility, since 0.06 was tuned for a much lighter silver tone.)

- [ ] **Step 4: Remove the WebGL IIFE from `script.js`**

Delete the entire block from the `// ─── HERO MESH GRADIENT (WebGL) ───` comment through its closing `})();` (lines 51-222 — verify exact boundaries with the grep from Step 1 before deleting, since surrounding line numbers may have drifted from earlier edits this session).

- [ ] **Step 5: Add the hero slideshow autoplay IIFE to `script.js`**

In the same place the WebGL IIFE used to be (right after the `// ─── NAV SCROLL SHRINK ───`/hamburger/reveal/scrollspy blocks, before `// ─── SPOTLIGHT CARD ─── `), add:

```javascript
// ─── HERO SLIDESHOW ───
// Cross-fades through the hero's background photos on a timer. Mirrors the
// gallery carousel's autoplay pattern (same AUTOPLAY_MS, same setInterval
// approach) — see the carousel IIFE below for the sibling implementation.
(function () {
  const slides = document.querySelectorAll('.hero-slideshow .hero-slide');
  if (!slides.length) return; // page has no hero section (e.g. /faq, /services)

  const AUTOPLAY_MS = 5000;
  let current = 0;

  setInterval(function () {
    current = (current + 1) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === current);
    });
  }, AUTOPLAY_MS);
})();
```

- [ ] **Step 6: Verify**

Run:
```bash
grep -n "hero-canvas\|getContext('webgl'" script.js
grep -c "hero-slide\b" script.js
grep -c "class=\"hero-slide" index.html
```
Expected: first command has no matches (WebGL code fully removed); second command shows at least 2 (querySelector call + classList.toggle usage); third command shows 6 (one per image).

- [ ] **Step 7: Commit**

```bash
git add index.html styles.css script.js
git commit -m "Replace hero WebGL gradient with a cross-fading photo slideshow"
```

---

## Task 7: Move Services to its own page at /services

**Files:**
- Create: `services/index.html`
- Modify: `index.html` (remove Services section, add About→Add-Ons bridge, update nav Services links + hero "View Services" button, add Add-Ons context line)
- Modify: `faq/index.html` (update nav Services links, update the two in-copy "Services page" links)
- Modify: `sitemap.xml` (add `/services` entry)
- Modify: `styles.css` (add `.services-bridge`, `.addons-context`)

**Interfaces:**
- Consumes: `.nav-logo` (Task 1), `.footer-map` (Task 3), `.pill.is-active` accent color (Task 4) — all already correct in the shared nav/footer markup this task copies.
- Produces: `services/index.html` as a working standalone page; `.services-bridge` (homepage-only).

- [ ] **Step 1: Verify current state**

Run:
```bash
ls services 2>/dev/null || echo "no services dir yet"
grep -n "#services" index.html faq/index.html
```
Expected: `services` directory doesn't exist yet; `#services` matches in both HTML files' nav links, mobile menu, hero button (`index.html` only), and FAQ body copy (`faq/index.html` only).

- [ ] **Step 2: Create `services/index.html`**

Create the file with this content (head tags follow the exact `faq/index.html` pattern; body is the shared nav/footer with `../`-prefixed paths, Task 1/3's logo and map already included, plus the pill-toggle/pricing-panel markup moved from `index.html` verbatim, with its panel-cta `#contact` links changed to `/#contact`):

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Interior & Exterior Detailing Packages & Pricing | Lehigh Valley Auto Detailing</title>
  <meta name="description" content="Full pricing for Interior, Exterior, and Combo auto detailing packages in Coopersburg, PA. Every service spelled out, no surprise charges." />
  <meta name="keywords" content="auto detailing prices Coopersburg PA, car detailing packages Lehigh Valley, interior exterior detailing cost" />
  <meta property="og:title" content="Interior & Exterior Detailing Packages & Pricing | Lehigh Valley Auto Detailing" />
  <meta property="og:description" content="Full pricing for Interior, Exterior, and Combo auto detailing packages in Coopersburg, PA. Every service spelled out, no surprise charges." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://lehighvalleyautodetailing.com/services" />
  <meta property="og:image" content="https://lehighvalleyautodetailing.com/images/06-after-second-row.jpg" />
  <meta property="og:image:alt" content="Second-row leather seats and floor mats after detailing — cleaned and conditioned" />
  <meta property="og:site_name" content="Lehigh Valley Auto Detailing" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Interior & Exterior Detailing Packages & Pricing | Lehigh Valley Auto Detailing" />
  <meta name="twitter:description" content="Full pricing for Interior, Exterior, and Combo auto detailing packages in Coopersburg, PA. Every service spelled out, no surprise charges." />
  <meta name="twitter:image" content="https://lehighvalleyautodetailing.com/images/06-after-second-row.jpg" />
  <link rel="canonical" href="https://lehighvalleyautodetailing.com/services" />
  <link rel="icon" type="image/x-icon" href="../favicon.ico" />
  <link rel="icon" type="image/png" sizes="48x48" href="../favicon-48x48.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="../styles.css" />

  <!-- ══ LocalBusiness / AutoDetailing structured data (JSON-LD) ══ -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": ["AutoDetailing", "LocalBusiness"],
    "name": "Lehigh Valley Auto Detailing",
    "url": "https://lehighvalleyautodetailing.com",
    "image": "https://lehighvalleyautodetailing.com/images/06-after-second-row.jpg",
    "telephone": "+1-484-719-1144",
    "email": "lehighvalleyautodetailing@gmail.com",
    "priceRange": "$$",
    "sameAs": [
      "https://www.google.com/maps?cid=6334011887982355620",
      "https://instagram.com/lehighautodetailing"
    ],
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Coopersburg",
      "addressRegion": "PA",
      "postalCode": "18036",
      "addressCountry": "US"
    },
    "areaServed": [
      { "@type": "City", "name": "Coopersburg" },
      { "@type": "City", "name": "Allentown" },
      { "@type": "City", "name": "Bethlehem" },
      { "@type": "City", "name": "Center Valley" },
      { "@type": "City", "name": "Emmaus" },
      { "@type": "City", "name": "Quakertown" }
    ],
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "description": "By appointment only"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Detailing Packages",
      "itemListElement": [
        {
          "@type": "OfferCatalog",
          "name": "Interior Detailing",
          "itemListElement": [
            { "@type": "Offer", "priceCurrency": "USD", "price": "80", "itemOffered": { "@type": "Service", "name": "Basic Interior Clean (Car / Sedan)" } },
            { "@type": "Offer", "priceCurrency": "USD", "price": "150", "itemOffered": { "@type": "Service", "name": "Standard Interior Detail (Car / Sedan)" } },
            { "@type": "Offer", "priceCurrency": "USD", "price": "225", "itemOffered": { "@type": "Service", "name": "Deep Interior Restoration (Car / Sedan)" } }
          ]
        },
        {
          "@type": "OfferCatalog",
          "name": "Exterior Detailing",
          "itemListElement": [
            { "@type": "Offer", "priceCurrency": "USD", "price": "50", "itemOffered": { "@type": "Service", "name": "Maintenance Wash & Dry (Car / Sedan)" } },
            { "@type": "Offer", "priceCurrency": "USD", "price": "100", "itemOffered": { "@type": "Service", "name": "Full Exterior Detail (Car / Sedan)" } }
          ]
        },
        {
          "@type": "OfferCatalog",
          "name": "Combo Detailing",
          "itemListElement": [
            { "@type": "Offer", "priceCurrency": "USD", "price": "115", "itemOffered": { "@type": "Service", "name": "Full Detail Refresh (Car / Sedan)" } },
            { "@type": "Offer", "priceCurrency": "USD", "price": "220", "itemOffered": { "@type": "Service", "name": "Full Detail Complete (Car / Sedan)" } },
            { "@type": "Offer", "priceCurrency": "USD", "price": "285", "itemOffered": { "@type": "Service", "name": "Full Detail Ultimate (Car / Sedan)" } }
          ]
        }
      ]
    }
  }
  </script>

  <!-- ══ Google Analytics 4 ══ -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-XHWCRL0JG6"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XHWCRL0JG6');
  </script>
</head>
<body>

  <!-- ══ NAVIGATION ══ -->
  <nav id="nav" role="navigation" aria-label="Main navigation">
    <div class="container">
      <div class="nav-inner">
        <a href="/" class="nav-logo" aria-label="Lehigh Valley Auto Detailing home">
          <img src="../images/lehigh-valley-auto-detailing-logo.png" alt="Lehigh Valley Auto Detailing" class="nav-logo-img" />
        </a>
        <ul class="nav-links">
          <li><a href="/#about">About</a></li>
          <li>
            <a href="/services" class="nav-leaves" aria-current="page">
              Services
              <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M6 3H3.5A1.5 1.5 0 0 0 2 4.5v8A1.5 1.5 0 0 0 3.5 14h8a1.5 1.5 0 0 0 1.5-1.5V10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9.5 2h4.5v4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M14 2 7.5 8.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </a>
          </li>
          <li><a href="/#addons">Add-Ons</a></li>
          <li>
            <a href="/faq" class="nav-leaves">
              FAQs
              <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M6 3H3.5A1.5 1.5 0 0 0 2 4.5v8A1.5 1.5 0 0 0 3.5 14h8a1.5 1.5 0 0 0 1.5-1.5V10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9.5 2h4.5v4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M14 2 7.5 8.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </a>
          </li>
          <li><a href="/#gallery">Gallery</a></li>
          <li><a href="/#contact" class="nav-book">Book Now</a></li>
        </ul>
        <button class="hamburger" aria-label="Toggle mobile menu" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  </nav>

  <!-- Mobile menu -->
  <nav class="mobile-menu" aria-label="Mobile navigation">
    <a href="/#about">About</a>
    <a href="/services" class="nav-leaves" aria-current="page">
      Services
      <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M6 3H3.5A1.5 1.5 0 0 0 2 4.5v8A1.5 1.5 0 0 0 3.5 14h8a1.5 1.5 0 0 0 1.5-1.5V10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M9.5 2h4.5v4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M14 2 7.5 8.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </a>
    <a href="/#addons">Add-Ons</a>
    <a href="/faq" class="nav-leaves">
      FAQs
      <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M6 3H3.5A1.5 1.5 0 0 0 2 4.5v8A1.5 1.5 0 0 0 3.5 14h8a1.5 1.5 0 0 0 1.5-1.5V10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M9.5 2h4.5v4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M14 2 7.5 8.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </a>
    <a href="/#gallery">Gallery</a>
    <a href="/#contact" class="nav-book">Book Now</a>
  </nav>

  <main>

    <!-- ══ SERVICES ══ -->
    <section id="services" aria-label="Detailing packages">
      <div class="container">
        <div class="services-header reveal">
          <p class="label">Packages</p>
          <div class="section-divider"></div>
          <div class="pill-toggle" role="tablist" aria-label="Service category">
            <button class="pill is-active" type="button" role="tab" id="pill-interior" data-tab="interior" aria-selected="true" aria-controls="panel-interior">Interior</button>
            <button class="pill" type="button" role="tab" id="pill-exterior" data-tab="exterior" aria-selected="false" aria-controls="panel-exterior">Exterior</button>
            <button class="pill" type="button" role="tab" id="pill-combo" data-tab="combo" aria-selected="false" aria-controls="panel-combo">Combo</button>
          </div>
        </div>

        <!-- ── INTERIOR PANEL ── -->
        <div class="pricing-panel" id="panel-interior" data-panel="interior" role="tabpanel" aria-labelledby="pill-interior">
          <div class="panel-head reveal">
            <h2 class="section-heading">Interior Detailing<br>Packages.</h2>
            <p class="section-subtext">Every service is spelled out — you see exactly what you're getting.</p>
          </div>

          <div class="pricing-cards">

            <!-- BASIC -->
            <div class="pricing-card reveal reveal-delay-1" data-glow>
              <p class="card-tier">Tier 01</p>
              <h3 class="card-title">Basic Interior<br>Clean</h3>
              <div class="card-pricing">
                <div class="price-row">
                  <span class="price-vehicle">Car / Sedan</span>
                  <span class="price-amount">$80</span>
                </div>
                <div class="price-row">
                  <span class="price-vehicle">SUV / Truck</span>
                  <span class="price-amount">$100</span>
                </div>
                <div class="price-row">
                  <span class="price-vehicle">Large SUV / Van</span>
                  <span class="price-amount">$120</span>
                </div>
              </div>
              <p class="card-includes">What's Included</p>
              <ul class="card-features">
                <li>Full vacuum — seats, carpets, and trunk</li>
                <li>Wipe and clean all hard surfaces (dash, console, door panels)</li>
                <li>Clean interior windows</li>
              </ul>
            </div>

            <!-- STANDARD -->
            <div class="pricing-card featured reveal reveal-delay-2" data-glow>
              <div class="badge-popular">Most Popular</div>
              <p class="card-tier">Tier 02</p>
              <h3 class="card-title">Standard Interior<br>Detail</h3>
              <div class="card-pricing">
                <div class="price-row">
                  <span class="price-vehicle">Car / Sedan</span>
                  <span class="price-amount">$150</span>
                </div>
                <div class="price-row">
                  <span class="price-vehicle">SUV / Truck</span>
                  <span class="price-amount">$175</span>
                </div>
                <div class="price-row">
                  <span class="price-vehicle">Large SUV / Van</span>
                  <span class="price-amount">$200</span>
                </div>
              </div>
              <p class="card-includes">What's Included</p>
              <ul class="card-features">
                <li>Full vacuum — seats, carpets, and trunk</li>
                <li>Wipe and clean all hard surfaces (dash, console, door panels)</li>
                <li>Clean interior windows</li>
                <li>Steam clean crevices, vents, and tight areas</li>
                <li>Carpet and cloth seat shampoo with extraction</li>
                <li>Leather surfaces wiped and cleaned</li>
                <li>Door jambs cleaned</li>
                <li>UV protectant applied to dash and trim</li>
              </ul>
            </div>

            <!-- DEEP -->
            <div class="pricing-card reveal reveal-delay-3" data-glow>
              <p class="card-tier">Tier 03</p>
              <h3 class="card-title">Deep Interior<br>Restoration</h3>
              <div class="card-pricing">
                <div class="price-row">
                  <span class="price-vehicle">Car / Sedan</span>
                  <span class="price-amount">$225</span>
                </div>
                <div class="price-row">
                  <span class="price-vehicle">SUV / Truck</span>
                  <span class="price-amount">$260</span>
                </div>
                <div class="price-row">
                  <span class="price-vehicle">Large SUV / Van</span>
                  <span class="price-amount">$300</span>
                </div>
              </div>
              <p class="card-includes">What's Included</p>
              <ul class="card-features">
                <li>Full vacuum — seats, carpets, and trunk</li>
                <li>Wipe and clean all hard surfaces (dash, console, door panels)</li>
                <li>Clean interior windows</li>
                <li>Steam clean crevices, vents, and tight areas</li>
                <li>Carpet and cloth seat shampoo with extraction</li>
                <li>Leather surfaces wiped and cleaned</li>
                <li>Door jambs cleaned</li>
                <li>UV protectant applied to dash and trim</li>
                <li>Multiple extraction passes on all fabric surfaces</li>
                <li>Full steam sanitation of all surfaces</li>
                <li>Seatbelts steamed and cleaned</li>
                <li>Full trunk and cargo area including spare tire well</li>
                <li>All compartments detailed (console, door pockets)</li>
              </ul>
            </div>

          </div>

          <div class="pricing-note reveal">
            <p>Prices may vary based on vehicle condition. Heavily soiled vehicles may incur an additional surcharge ($25–$75). We do not access gloveboxes to protect your personal documents.</p>
          </div>

          <p class="panel-cta reveal">Ready to book? <a href="/#contact">Get in Touch</a></p>
        </div>

        <!-- ── EXTERIOR PANEL ── -->
        <div class="pricing-panel" id="panel-exterior" data-panel="exterior" role="tabpanel" aria-labelledby="pill-exterior" hidden>
          <div class="panel-head">
            <h2 class="section-heading">Exterior Detailing<br>Packages.</h2>
            <p class="section-subtext">Protect and restore your vehicle's exterior. Every service is spelled out — you see exactly what you're getting.</p>
          </div>

          <div class="pricing-cards two">

            <!-- MAINTENANCE WASH -->
            <div class="pricing-card" data-glow>
              <p class="card-tier">Tier 01</p>
              <h3 class="card-title">Maintenance<br>Wash &amp; Dry</h3>
              <div class="card-pricing">
                <div class="price-row">
                  <span class="price-vehicle">Car / Sedan</span>
                  <span class="price-amount">$50</span>
                </div>
                <div class="price-row">
                  <span class="price-vehicle">SUV / Truck</span>
                  <span class="price-amount">$60</span>
                </div>
                <div class="price-row">
                  <span class="price-vehicle">Large SUV / Van</span>
                  <span class="price-amount">$70</span>
                </div>
              </div>
              <p class="card-includes">What's Included</p>
              <ul class="card-features">
                <li>Foam pre-wash</li>
                <li>Hand wash</li>
                <li>Wheels and tires cleaned</li>
                <li>Hand dry</li>
                <li>Exterior windows</li>
                <li>Tire dressing</li>
              </ul>
            </div>

            <!-- FULL EXTERIOR -->
            <div class="pricing-card" data-glow>
              <p class="card-tier">Tier 02</p>
              <h3 class="card-title">Full Exterior<br>Detail</h3>
              <div class="card-pricing">
                <div class="price-row">
                  <span class="price-vehicle">Car / Sedan</span>
                  <span class="price-amount">$100</span>
                </div>
                <div class="price-row">
                  <span class="price-vehicle">SUV / Truck</span>
                  <span class="price-amount">$120</span>
                </div>
                <div class="price-row">
                  <span class="price-vehicle">Large SUV / Van</span>
                  <span class="price-amount">$140</span>
                </div>
              </div>
              <p class="card-includes">What's Included</p>
              <ul class="card-features">
                <li>Foam pre-wash</li>
                <li>Hand wash</li>
                <li>Wheels and tires cleaned</li>
                <li>Hand dry</li>
                <li>Exterior windows</li>
                <li>Tire dressing</li>
                <li>Exterior trim dressed and protected</li>
                <li>Bug and tar removal</li>
                <li>Door jambs cleaned</li>
                <li>Spray sealant (3 to 6 months protection)</li>
              </ul>
            </div>

          </div>

          <p class="panel-cta">Ready to book? <a href="/#contact">Get in Touch</a></p>
        </div>

        <!-- ── COMBO PANEL ── -->
        <div class="pricing-panel" id="panel-combo" data-panel="combo" role="tabpanel" aria-labelledby="pill-combo" hidden>
          <div class="panel-head">
            <h2 class="section-heading">Combo Detailing<br>Packages.</h2>
            <p class="section-subtext">Interior and exterior together — the best value. Every service is spelled out — you see exactly what you're getting.</p>
          </div>

          <div class="pricing-cards">

            <!-- REFRESH -->
            <div class="pricing-card" data-glow>
              <p class="card-tier">Tier 01</p>
              <h3 class="card-title">Full Detail<br>Refresh</h3>
              <div class="card-pricing">
                <div class="price-row">
                  <span class="price-vehicle">Car / Sedan</span>
                  <span class="price-amount">$115</span>
                </div>
                <div class="price-row">
                  <span class="price-vehicle">SUV / Truck</span>
                  <span class="price-amount">$140</span>
                </div>
                <div class="price-row">
                  <span class="price-vehicle">Large SUV / Van</span>
                  <span class="price-amount">$165</span>
                </div>
              </div>
              <p class="card-includes">What's Included</p>
              <ul class="card-features">
                <li>Complete Basic Interior Clean</li>
                <li>Complete Maintenance Wash &amp; Dry</li>
              </ul>
            </div>

            <!-- COMPLETE -->
            <div class="pricing-card featured" data-glow>
              <div class="badge-popular">Most Popular</div>
              <p class="card-tier">Tier 02</p>
              <h3 class="card-title">Full Detail<br>Complete</h3>
              <div class="card-pricing">
                <div class="price-row">
                  <span class="price-vehicle">Car / Sedan</span>
                  <span class="price-amount">$220</span>
                </div>
                <div class="price-row">
                  <span class="price-vehicle">SUV / Truck</span>
                  <span class="price-amount">$260</span>
                </div>
                <div class="price-row">
                  <span class="price-vehicle">Large SUV / Van</span>
                  <span class="price-amount">$300</span>
                </div>
              </div>
              <p class="card-includes">What's Included</p>
              <ul class="card-features">
                <li>Complete Standard Interior Detail</li>
                <li>Complete Full Exterior Detail</li>
              </ul>
            </div>

            <!-- ULTIMATE -->
            <div class="pricing-card" data-glow>
              <p class="card-tier">Tier 03</p>
              <h3 class="card-title">Full Detail<br>Ultimate</h3>
              <div class="card-pricing">
                <div class="price-row">
                  <span class="price-vehicle">Car / Sedan</span>
                  <span class="price-amount">$285</span>
                </div>
                <div class="price-row">
                  <span class="price-vehicle">SUV / Truck</span>
                  <span class="price-amount">$340</span>
                </div>
                <div class="price-row">
                  <span class="price-vehicle">Large SUV / Van</span>
                  <span class="price-amount">$385</span>
                </div>
              </div>
              <p class="card-includes">What's Included</p>
              <ul class="card-features">
                <li>Complete Deep Interior Restoration</li>
                <li>Complete Full Exterior Detail</li>
              </ul>
            </div>

          </div>

          <p class="panel-cta">Ready to book? <a href="/#contact">Get in Touch</a></p>
        </div>

      </div>
    </section>

  </main>

  <!-- ══ FOOTER ══ -->
  <footer role="contentinfo">
    <div class="container">
      <div class="footer-inner">
        <img src="../images/lehigh-valley-auto-detailing-logo.png" class="footer-logo" alt="Lehigh Valley Auto Detailing" />
        <a href="https://instagram.com/lehighautodetailing" class="footer-social" target="_blank" rel="noopener" aria-label="Follow us on Instagram (@lehighautodetailing)">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect x="2.5" y="2.5" width="19" height="19" rx="5" stroke="currentColor" stroke-width="1.6"/>
            <circle cx="12" cy="12" r="4.5" stroke="currentColor" stroke-width="1.6"/>
            <circle cx="17.4" cy="6.6" r="1.2" fill="currentColor"/>
          </svg>
          <span>@lehighautodetailing</span>
        </a>
        <p class="footer-copy">&copy; 2026 Lehigh Valley Auto Detailing. Coopersburg, PA.</p>

        <div class="footer-map">
          <div class="contact-map-frame">
            <iframe
              class="contact-map-iframe"
              src="https://www.google.com/maps?q=Coopersburg,PA+18036&output=embed"
              width="100%"
              height="260"
              allowfullscreen=""
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              title="Map showing the Coopersburg, PA service area"></iframe>
          </div>
          <p class="contact-map-note">Exact drop-off address provided upon booking confirmation.</p>
        </div>

        <div class="payment-accepted">
          <p class="payment-label">Payment Accepted</p>
          <p class="payment-methods">Visa &middot; Mastercard &middot; American Express &middot; Discover &middot; Apple Pay &middot; Google Pay</p>
          <p class="payment-secure">Secure payments powered by Stripe</p>
        </div>
      </div>
    </div>
  </footer>

  <script src="../script.js"></script>
</body>
</html>
```

- [ ] **Step 3: Remove the Services section from `index.html` and add the About→Add-Ons bridge**

Delete the entire `<!-- ══ SERVICES ══ -->` section (from `<section id="services" ...>` through its matching `</section>`, currently between the About section's closing `.section-fade-divider` and the Add-Ons section's leading `.section-fade-divider`). Replace it with:

```html
    <!-- ══ VIEW PRICING BRIDGE ══ -->
    <div class="services-bridge reveal">
      <p>Full pricing for Interior, Exterior, and Combo packages.</p>
      <a href="/services" class="btn-primary btn-solid">View Pricing</a>
    </div>
```

so the flow becomes: About section → `.section-fade-divider` → `.services-bridge` → `.section-fade-divider` → Add-Ons section (both existing dividers stay in place, unchanged; only the Services section between them is replaced).

- [ ] **Step 4: Update `index.html`'s nav to point Services at the new page**

Change the desktop nav (currently `<li><a href="/#services">Services</a></li>`) to:

```html
          <li>
            <a href="/services" class="nav-leaves">
              Services
              <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M6 3H3.5A1.5 1.5 0 0 0 2 4.5v8A1.5 1.5 0 0 0 3.5 14h8a1.5 1.5 0 0 0 1.5-1.5V10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9.5 2h4.5v4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M14 2 7.5 8.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </a>
          </li>
```

and the mobile menu (currently `<a href="/#services">Services</a>`) to:

```html
    <a href="/services" class="nav-leaves">
      Services
      <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M6 3H3.5A1.5 1.5 0 0 0 2 4.5v8A1.5 1.5 0 0 0 3.5 14h8a1.5 1.5 0 0 0 1.5-1.5V10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M9.5 2h4.5v4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M14 2 7.5 8.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </a>
```

- [ ] **Step 5: Update the hero "View Services" button in `index.html`**

Change:

```html
          <a href="#services" class="btn-primary">View Services</a>
```

to:

```html
          <a href="/services" class="btn-primary">View Services</a>
```

- [ ] **Step 6: Add Add-Ons context line in `index.html`**

Change the Add-Ons header (currently):

```html
        <div class="addons-header reveal">
          <p class="label">Enhancements</p>
          <div class="section-divider"></div>
          <h2 id="addons-heading" class="section-heading">Add-On<br>Services.</h2>
        </div>
```

to:

```html
        <div class="addons-header reveal">
          <p class="label">Enhancements</p>
          <div class="section-divider"></div>
          <h2 id="addons-heading" class="section-heading">Add-On<br>Services.</h2>
          <p class="addons-context">Pair these with any package — full pricing on our <a href="/services">Services page</a>.</p>
        </div>
```

- [ ] **Step 7: Update `faq/index.html`'s nav the same way as Step 4**

Apply the identical desktop nav and mobile menu changes from Step 4 to `faq/index.html` (same `/#services` → `/services` + `.nav-leaves` treatment, same SVG).

- [ ] **Step 8: Update `faq/index.html`'s two in-copy "Services page" links**

Change both instances of `href="/#services"` inside the FAQ answers (the pricing question and the Interior-tiers question) to `href="/services"`. The link text ("Services page") already reads correctly and needs no change.

- [ ] **Step 9: Add `.services-bridge` and `.addons-context` CSS**

In `styles.css`, after the `.services-header { margin-bottom: 2.75rem; }` rule, add:

```css
/* ─── VIEW PRICING BRIDGE (replaces the old in-page Services section) ─── */
.services-bridge {
  padding: 4rem 0;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
}
.services-bridge p {
  color: var(--text-muted);
  font-size: 0.95rem;
  font-weight: 300;
}
```

and after the `.addons-header` styling (near `.addons-group-head`), add:

```css
.addons-context {
  color: var(--text-muted);
  font-size: 0.85rem;
  font-weight: 300;
  margin-top: 0.5rem;
}
.addons-context a {
  color: var(--silver);
  text-decoration: none;
  border-bottom: 1px solid rgba(192,192,192,0.3);
  transition: color 0.2s, border-color 0.2s;
}
.addons-context a:hover { color: var(--accent); border-color: var(--accent); }
```

- [ ] **Step 10: Add `/services` to `sitemap.xml`**

Change `sitemap.xml` from:

```xml
  <url>
    <loc>https://lehighvalleyautodetailing.com/faq</loc>
    <lastmod>2026-07-23</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>
```

to:

```xml
  <url>
    <loc>https://lehighvalleyautodetailing.com/faq</loc>
    <lastmod>2026-07-23</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://lehighvalleyautodetailing.com/services</loc>
    <lastmod>2026-07-25</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

- [ ] **Step 11: Verify `services/index.html`'s JSON-LD is valid**

Run in PowerShell:
```powershell
$content = Get-Content "services/index.html" -Raw
$blocks = [regex]::Matches($content, '(?s)<script type="application/ld\+json">(.*?)</script>')
foreach ($b in $blocks) { $b.Groups[1].Value | ConvertFrom-Json | Out-Null }
"All $($blocks.Count) JSON-LD blocks parsed OK"
```
Expected: `All 1 JSON-LD blocks parsed OK` with no errors thrown.

- [ ] **Step 12: Verify `index.html` no longer has `hasOfferCatalog`, and no `#services` anchors remain anywhere**

Run:
```bash
grep -n "hasOfferCatalog" index.html faq/index.html services/index.html
grep -rn "#services" index.html faq/index.html services/index.html
```
Expected: first command matches only in `services/index.html`; second command has zero matches in all three files (every reference now points to `/services`, not `#services` or `/#services`).

- [ ] **Step 13: Verify tag balance on all three HTML files**

Run:
```bash
for f in index.html faq/index.html services/index.html; do
  open=$(grep -o '<section' "$f" | wc -l)
  close=$(grep -o '</section>' "$f" | wc -l)
  echo "$f: <section> open=$open close=$close"
done
```
Expected: open count equals close count for every file.

- [ ] **Step 14: Commit**

```bash
git add index.html faq/index.html services/index.html sitemap.xml styles.css
git commit -m "Move Services to its own page at /services"
```

---

## Task 8: Manual visual QA

**Files:** none (verification only).

- [ ] **Step 1: Serve the site locally**

Use the `run` skill if available in this session to launch a static server over the project root (no build step required). If unavailable, open `index.html` directly in a browser.

- [ ] **Step 2: Homepage (`/`) checks**

- Nav logo appears top-left, links to `/`.
- Hero background cross-fades through 6 photos every ~5s, crimson glow and grain visible on top, headline/buttons/phone number legible over every slide.
- Scrolling from About lands on the "View Pricing" bridge, then Add-Ons — no jarring empty gap.
- Add-Ons header shows the new context line linking to `/services`.
- Pill toggle no longer appears on the homepage (confirm the Services section is gone).
- Footer: larger logo, map, and payment-accepted block all present and centered; no map remains in the Contact section above it.
- Sticky header "Book Now" scrolls to the Contact form.
- How It Works: all 4 steps show an icon above their number.

- [ ] **Step 3: `/services` checks**

- Nav logo, footer logo/map, "Book Now" all present and working (same as homepage).
- Pill toggle switches Interior/Exterior/Combo correctly, active pill is crimson, price count-up animation plays on switch.
- All 3 "Ready to book? Get in Touch" links land on `/#contact` (homepage Contact form) in one click.
- Nav "Services" link shows the leave-page arrow and `aria-current="page"` styling consistent with how "FAQs" behaves on `/faq`.

- [ ] **Step 4: `/faq` checks**

- Nav logo and footer map present (new on this page).
- Nav "Services" link and both in-copy "Services page" links go to `/services`.

- [ ] **Step 5: Mobile width checks (≥560px per this repo's Headless-Edge screenshot quirk, or a real device/devtools below that)**

- Nav logo doesn't crowd the hamburger button.
- Footer logo/map stay centered and don't overflow.
- Hero slideshow and text remain legible at narrow widths.

- [ ] **Step 6: Fix any issues found, then re-run the relevant task's verification step before moving on.**
