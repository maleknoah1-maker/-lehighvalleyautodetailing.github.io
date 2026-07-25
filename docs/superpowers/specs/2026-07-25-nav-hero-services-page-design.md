# Nav logo, hero slideshow, footer/services polish, and Services page split

Date: 2026-07-25

## Context

Batch of frontend changes to the Lehigh Valley Auto Detailing static site
(`index.html` + `styles.css` + `script.js` + `faq/index.html`, no build step,
deploys to GitHub Pages). Items 1-6 are small independent visual/content
tweaks. Item 7 is a structural change: moving the Services pricing section
off the homepage onto its own page at `/services`, following the exact
pattern already established by `/faq`.

## Decisions locked in during design review

- Hero slideshow uses the 6 curated "after" images (same set already used as
  gallery thumbnails), not all 12 before/after images.
- The hero's existing silver-toned corner glow (`#hero::after`) is recolored
  to the crimson accent (`#A8332A`) to match the user's description and tie
  into the red glow already used in How-It-Works/Add-Ons.
- The footer's Google Map is **moved** out of the Contact section into the
  shared footer (not duplicated) — appears once per page, on both `/` and
  `/faq` (and now `/services`, since footer is shared across all pages).
- `hasOfferCatalog` JSON-LD is **moved** (not duplicated) from the homepage's
  LocalBusiness block to `/services`'s LocalBusiness block, since that's now
  the page that actually displays the offers. Homepage and `/faq` keep the
  base LocalBusiness block only (matches the existing dual-page pattern).

## 1. Nav logo as home link

Add `<a href="/" class="nav-logo"><img src="images/lehigh-valley-auto-detailing-logo.png" alt="Lehigh Valley Auto Detailing" class="nav-logo-img"></a>` as the first
child of `.nav-inner` in both `index.html` and `faq/index.html` (and the new
`services/index.html`), before `.nav-links`. Flip `.nav-inner` from
`justify-content: flex-end` to `space-between`. `.nav-logo-img` sized ~40px
tall (auto width, source is 500x500 square), full brightness — not dimmed
like the footer treatment, since this is a primary interactive brand mark.
`href="/"` is root-absolute, consistent with the rest of the nav, so it
works identically from any page. No mobile-menu change needed (mobile menu
is a link list under a hamburger; the nav bar itself, including the new
logo, stays visible above it at all widths).

## 2. Hero slideshow background

Remove `#hero-canvas` and its WebGL mesh-gradient IIFE from `script.js`
entirely (it's being replaced). Add a `.hero-slideshow` container inside
`#hero`, absolutely positioned behind `.hero-inner`, containing 6
`.hero-slide` `<img>` elements (the curated after-shots), cross-fading via
opacity/`.is-active` toggling on a 5s interval — same timer pattern as the
existing gallery carousel autoplay (`script.js` ~line 410). A dark scrim
(`linear-gradient` over the photos) sits above the slideshow for text
legibility. Stacking order top to bottom: grain texture (`body::before`,
unchanged) → `#hero::after` glow (recolored crimson) → scrim → slideshow →
`#hero` black background. Text/buttons/phone number keep their existing
z-index above all of this via `.hero-inner`.

## 3. Larger footer logo

`.footer-logo` height `36px` → `56px`. Same dimmed treatment (opacity 0.4,
brightness 0.85) — bigger, not more prominent. Verify footer stays centered
and doesn't wrap awkwardly at mobile widths (footer-inner is already a
centered flex column, tolerant of this).

## 4. Footer map

Move `.contact-map` (iframe + "Exact drop-off address provided upon booking
confirmation" note) out of the Contact section in `index.html` into the
shared footer markup, added to `index.html`, `faq/index.html`, and the new
`services/index.html`. Capped at ~500px wide within the footer's centered
content (footer content today has no max-width constraint of its own; the
map needs one so it doesn't stretch to the full 1200px container).

## 5. Pill toggle accent

`.pill.is-active` background `var(--silver)` → `var(--accent)`, text color
`var(--silver)`'s current pairing (`var(--black)`) → `var(--accent-text)` —
matches the pattern already used by `.btn-solid`/`.badge-popular`, so it
stays correct automatically if the accent color changes again.

## 6. How It Works icons

One inline SVG per step (4 total), matching the site's existing thin-stroke
line-icon style (`currentColor`, ~1.4-1.6 stroke width, rounded caps,
viewBox `0 0 24 24`), colored crimson to tie into the section's existing red
corner glow:
- Step 1 (Book): calendar/phone icon
- Step 2 (Drop Off): car + location pin icon
- Step 3 (We Detail): spray bottle / sparkle icon
- Step 4 (Pick Up): car + checkmark icon

## 7. Services moves to its own page

**New page** `services/index.html`, built the same way `faq/index.html` was:
own `<title>` ("Interior & Exterior Detailing Packages & Pricing | Lehigh
Valley Auto Detailing" or similar), meta description targeting
pricing/service search terms, og/twitter tags, canonical URL
`https://lehighvalleyautodetailing.com/services`, `../`-prefixed asset paths
(styles.css, script.js, images/, favicons), shared nav + footer markup. The
`.pill-toggle`/`.pricing-panel` markup (all 3 panels, Interior/Exterior/
Combo) moves from `index.html` into this new page verbatim. Its JS
(`script.js` ~line 248 IIFE) is already null-guarded
(`if (!pills.length || !panels.length) return;`), so it works on the new
page with zero script.js changes — same mechanism that let the gallery-grid
effect work on `/faq` without touching script.js.

**Nav updates** (`index.html`, `faq/index.html`, `services/index.html` —
all three share the same nav markup): "Services" link `/#services` →
`/services` in both the desktop `.nav-links` and `.mobile-menu`, gains the
same `.nav-leaves` "leaves the page" arrow icon already used on "FAQs".

**Sticky header "Book Now"**: already `/#contact` root-absolute in every nav
instance today — no code change needed, just verify behavior after the
move.

**Panel CTAs** ("Ready to book? Get in Touch", 3 instances, one per panel):
`href="#contact"` → `href="/#contact"` so they work from the new page.

**Hero "View Services" button** (`index.html`): `href="#services"` →
`href="/services"`.

**Homepage flow gap**: the Services section is removed from `index.html`
entirely (About's `.section-fade-divider` now sits directly above a new
bridge block, which sits above another `.section-fade-divider` before
Add-Ons). The bridge block (`.services-bridge`) is a compact centered
text + accent-filled button ("View Pricing" → `/services`), styled like the
existing panel-cta pill buttons — not a full empty-feeling section.

**Add-Ons context**: add one line under `.addons-header` — "Pair these with
any package — full pricing on our Services page." with an inline link to
`/services`.

**FAQ page's existing "Services page" links** (2 instances, in the pricing
and package-tier answers): `href="/#services"` → `href="/services"` — these
already say "Services page" in the link text, so the copy becomes literally
accurate.

**JSON-LD**: `hasOfferCatalog` moves from `index.html`'s LocalBusiness block
into `services/index.html`'s LocalBusiness block (a duplicate of the base
block, matching the `faq/index.html` pattern, but with `hasOfferCatalog`
included). `index.html` and `faq/index.html` keep the base block only.

**Sitemap**: add a `/services` `<url>` entry to `sitemap.xml`, matching the
`/faq` entry's format (priority likely between homepage's 1.0 and FAQ's 0.6,
e.g. 0.8, since it's a primary conversion page).

## Testing

After implementation, verify on both `/` and `/services` (and spot-check
`/faq`):
- Every button/link that used to reach the Contact form still reaches it in
  1-2 clicks (sticky header Book Now, hero CTAs, panel CTAs, footer map
  stays present).
- Pill toggle works identically on `/services` (switching tabs, price
  count-up animation).
- Nav "Services" and "FAQs" both show the leave-page arrow icon and
  navigate correctly from all three pages.
- Hero slideshow cross-fades smoothly, text stays legible over every one of
  the 6 images, crimson glow and grain are both visible layered on top.
- Footer map, larger footer logo, and nav logo render correctly at mobile
  widths on all pages.
- JSON-LD on all three pages is valid (parses, no duplicate `hasOfferCatalog`
  on homepage/FAQ).
