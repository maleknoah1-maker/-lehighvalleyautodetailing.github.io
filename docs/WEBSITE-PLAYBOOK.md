# Local Service Business Website Playbook

What we built for lehighvalleyautodetailing.com, why it ranks, and how to do the same for the next client. Part 1 explains the site. Part 2 lists what to collect from the new client. Part 3 is a planning prompt you can paste into Claude.

---

## Part 1: What the Lehigh Valley Auto Detailing site does

### 1. Why it ranks so well

In rough order of impact:

1. **The domain and business name match what people search.** "Lehigh Valley Auto Detailing" at lehighvalleyautodetailing.com is exactly what a local customer types. You can't always copy this, but pick the closest available domain that names the service and the area.
2. **A complete Google Business Profile.** This is what puts the business in the "map pack" (the 3 businesses shown with the map), which is where most local clicks happen. The profile has:
   - the right primary category
   - 20 service-area towns
   - hours, with "appointment required" turned on
   - services with prices
   - photos
   - attributes (payment methods and so on)
   - a booking link
   - reviews, all answered by the owner
3. **Reviews.** Real 5-star Google reviews, more than nearby competitors have, each one answered.
4. **Consistent NAP.** Name, address and phone, plus service area, hours and description, are identical everywhere: website, Google, Square, Stripe, social profiles. One NAP sheet is the source of truth and everything gets copied from it.
5. **One page per service and per location topic.** Each service has its own page (interior, exterior, full detail, pet hair, mobile, maintenance plan). That way each page can rank for its own search, like "pet hair removal car Coopersburg."
6. **Structured data on every page.** This is hidden code (JSON-LD, the format Google calls "schema") that tells Google and AI tools exactly what the business is, what it offers, its prices, its area and its FAQs.
7. **FAQs everywhere, with FAQ schema.** There's a dedicated /faq/ page, plus a short FAQ section on every service page, every blog post and the homepage. These get pulled into Google's "People also ask" box and into AI answers.
8. **Educational blog content.** Guides that answer real questions, like whether automatic car washes damage paint, what road salt does to a car, what interior detailing costs, and how to keep a car clean between details. These bring in people who aren't ready to buy yet, and they show Google and AI tools that the business knows its subject.
9. **Fast, simple, static site.** It's plain HTML, CSS and JavaScript on GitHub Pages: no WordPress, no page builder, no plugins. It loads fast, has nothing to hack, and there's no hosting bill.
10. **Search Console and a sitemap.** Google gets told about every page, and the owner can request indexing for new ones.

### 2. Tech stack

- **Code:** hand-written static HTML, with one shared stylesheet (`site.css`, about 1,500 lines) and two small scripts (`site.js` and `script.js`). No framework.
- **Hosting:** GitHub Pages with a GitHub Actions deploy, on a custom domain over HTTPS. It's free.
- **Forms:** Formspree. The booking form emails the owner, and spam is filtered with a hidden honeypot field.
- **Booking:** Square Appointments (free plan) as a secondary "Pick a Time Online" option. The request form stays the main option.
- **Payments:** Stripe for cards and for subscription plans (12 monthly payment links plus a customer portal). Cash and Venmo are accepted in person.
- **Analytics:** Google Analytics 4 with key events, plus Google Search Console.
- **Files for AI search:** `llms.txt` (a plain-text summary of the business for AI tools), `robots.txt` and `sitemap.xml`.

### 3. Design system

- **Look:** dark and premium, matching the owner's business card. It's built around a near-black background (#0a0a0a), silver text and accents (#c0c0c0 / #d8d8d8), a crimson accent (#a8332a) and gold review stars (#d9a93a). All colors are defined once as CSS variables so they stay consistent.
- **Type:** an elegant serif for headlines (Cormorant Garamond) with an *italic accent word* in each headline ("Detailing packages *& prices.*"), and a clean sans-serif for body text (Montserrat).
- **Layout:**
  - a floating glass-style header bar
  - rounded "panel" sections
  - soft glow lighting in the hero
  - small diamond accents taken from the logo
  - big section headings, each with a small label and divider line above it
- **Motion, kept subtle:** sections fade in as you scroll, prices count up when you switch tabs, the reviews scroll in a continuous loop, and the hero rotates through a video and photos. Motion turns off for visitors who've set their device to reduce motion.
- **Phones first:** 16px side margins, no sideways scrolling, and a call / text / book bar pinned to the bottom of the screen. Every layout was checked at phone width.
- **Real photos only:** genuine before-and-after pairs of the owner's own work, cropped and color-corrected but never edited to fake results. They're served as WebP files, with small 360px versions for phones, lazy loading, and the hero image preloaded.
- **A custom favicon set:** the "LV" monogram in every size browsers use (16, 32, 48, 180, 192 and 512px), plus a web app manifest.

### 4. Pages and site structure

```
/                      Home (hero, trust strip, services, how it works, gallery, about, reviews, FAQ, contact form, map)
/services/             All packages and prices (tabs: Combo / Interior / Exterior), add-ons, mobile, FAQ
/interior-detailing/   Service page: intro, before and after, packages, FAQ, call to action, related links
/exterior-detailing/   Service page
/full-detail/          Service page (the combo packages)
/pet-hair-removal/     Service page (add-on)
/mobile-detailing/     Zones table, travel fees, price examples, requirements, FAQ
/maintenance-plan/     Monthly subscription plans, winter rule, FAQ
/faq/                  All FAQs (dedicated page, important for SEO)
/blog/ + 4 posts       Educational guides, each with an FAQ section
/service-policies/     Booking, cancellation, payment, plan terms, mobile rules
/privacy/              Privacy policy (names Formspree, Google Analytics, Stripe, Square)
/404.html              Branded not-found page
```

Every page has breadcrumbs, the same header and footer, links to related services, and a call to action at the bottom.

### 5. What turns visitors into customers

- **Prices in the first screen.** Starting prices appear at the top of the Services page and the price cards follow right below. Hiding prices drives people away.
- **Several ways to say yes, with one main one.** The main option is the request form; "Book Now" goes there. The others are call, text a photo for a quote, and Square online booking under the form. Every extra option gets more people to reach out.
- **Packages listed item by item**, with a "Most Popular" badge and the savings shown ("Save $30 to $40 vs. booking separately"). The best-value combo is listed first.
- **Proof on every page:** the 5.0 Google rating, a scrolling reviews section with a "Read full review" button for long reviews, real before-and-after photos, and an embedded Google map.
- **Removing worries:** no deposit, no cancellation fee, pay when it's done, "We reply within 24 hours," and a clear policies page.
- **A smart booking form:** it shows the address and utility questions only when mobile is picked, includes a service list, and is easy to read on a phone.
- **A dismissible top banner** announcing the newest service, like mobile detailing.

### 6. SEO checklist (every page)

- [ ] A unique title (about 60 characters, formatted "Service in Town, ST | Brand") and meta description (about 155 characters)
- [ ] One H1 heading per page, with headings in logical order below it
- [ ] A canonical URL ending in a trailing slash, matching the sitemap
- [ ] Open Graph and Twitter tags (title, description, image) for link previews
- [ ] Hidden structured data (JSON-LD):
  - Home: AutomotiveBusiness (or the right LocalBusiness type) with name, URL, phone, email, logo, image, price range, address (city, state and ZIP only if the street is private), areaServed (every town), sameAs (Google profile, Instagram), payment methods, OfferCatalog with prices, plus WebSite and FAQPage
  - Service pages: Service with Offer or AggregateOffer prices, plus BreadcrumbList and FAQPage
  - Blog posts: BlogPosting (author, date, publisher), plus BreadcrumbList and FAQPage
  - Plans: Service with monthly UnitPriceSpecification offers
- [ ] An FAQ section, both visible on the page and in the hidden FAQPage code (the questions must match)
- [ ] Descriptive alt text on every image (what it actually shows, never "image1")
- [ ] Internal links to related services and the main booking spot
- [ ] Town names written out in the copy (footer, mobile zones, schema)
- [ ] The page listed in `sitemap.xml` and `llms.txt`
- [ ] A version number on the CSS and JS links (`site.css?v=14`) so returning visitors get updates

### 7. Local SEO off the website

- **Google Business Profile:** see section 1. Also:
  - pick the right primary category
  - add every service with a price
  - set the service-area towns (up to 20), exactly matching the site
  - fill in every attribute
  - turn on "appointment required" if it applies
  - add the booking link
  - post photos regularly
  - reply to every review
- **NAP sheet:** one document with name, address, phone, email, website, hours, service area, prices, payment methods and every profile link. If it isn't in the NAP, it isn't true.
- **Citations:** Bing Places (it can import from Google), Apple Business Connect, Facebook, Yelp. All of them copied from the NAP sheet.
- **Reddit:** an honest business account answering local "who should I use for X" threads. Old threads still rank high on Google and feed AI answers. No fake customer accounts.
- **Social posts:** link each post to the matching service page (with `?utm_source=instagram&utm_medium=social` added), not the homepage.

### 8. Analytics setup

- Google Analytics 4 events sent by the site's own code:
  - `form_submit` (only after Formspree accepts the request)
  - `phone_click`
  - `text_click`
  - `booking_click` (online booking link)
- Mark them as key events in GA4. An event can only be marked after it has fired once.
- The owner's own visits are excluded by opening any page with `?notrack=1` once in each browser. This turns Google Analytics off on that device, and `?notrack=0` turns it back on.
- Search Console is verified, the sitemap is submitted, and new pages are sent for indexing.
- A useful prompt for later: "Look at which pages get traffic but have a high bounce rate, and figure out how to improve conversions and session length on those pages."

### 9. Content rules we followed

- Never make up reviews, numbers, awards or claims. Use only the client's real photos and real facts.
- No em dashes in customer-facing copy (owner preference). Write plainly and specifically.
- Every price on the site matches the NAP sheet, and prices never change without the owner's OK.
- Show the owner a preview or mockup before anything goes live, and publish only after they approve.
- Keep the main call to action consistent. New options are added as extras, not replacements.

### 10. How the work was done

- Claude builds on a working branch, takes screenshots at phone width (390px) and desktop width (1280px) as previews, and the owner approves before anything goes live.
- To go live: open a pull request, merge it into main, and GitHub Actions publishes the site in under a minute.
- Claude in Chrome handles anything inside the owner's accounts: Google Business Profile, Google Analytics, Search Console, Square and Stripe. Claude writes a precise prompt for it, and the owner pastes it in.
- Claude in Chrome can't create accounts or type passwords, so the owner does sign-ups and identity checks themselves.

---

## Part 2: What to collect from the new client

**Business basics (this becomes their NAP sheet)**
- Legal and public business name, owner name
- Address: will the street be public, or city, state and ZIP only?
- Phone (do they take texts?), email, current domain or domain ideas
- Hours, or "by appointment"
- Primary Google category, services offered, and where they work (their location, customers' locations, or both)
- Service-area towns (up to 20) and how far they'll travel
- Payment methods accepted

**Services and prices**
- Every service and package, what's included item by item, and prices (by size, tier or hour)
- Add-ons, extra charges, deposits and cancellation rules, and when payment is due
- Which service they most want to sell (list it first and show it as the best deal)
- Any memberships or subscriptions

**Brand and design**
- Logo files, business card, colors, fonts they like
- 2 or 3 websites they like and why, and any they dislike or don't want copied
- The feel they want (premium, friendly, rugged, clinical and so on)

**Proof**
- Real before-and-after or project photos, original files
- Google reviews (screenshots or the profile link), testimonials, years in business, licenses or insurance (only if true)
- An owner photo and their story for the About section

**Accounts and access**
- Google Business Profile (do they own it?), Google Analytics, Search Console
- Domain registrar login, social profile links
- Booking tool (Square, Calendly and so on) and payment tool (Stripe, Square)
- Form email destination

**Competitors and goals**
- 2 or 3 local competitors and their websites
- Main goal (calls, form requests, bookings) and what counts as a lead
- The 5 to 10 questions customers ask most (these become the FAQs)

---

## Part 3: Planning prompt to paste into Claude

```
You are planning a website for a local service business. Use the playbook below as the standard: same quality, structure, SEO and conversion approach, but a design and content that fit THIS business. Don't copy another business's design.

BUSINESS INFO (this is the source of truth; never invent facts, reviews, numbers or claims):
[paste the client's NAP sheet and answers from Part 2 here]

REQUIREMENTS
1. Tech: plain static HTML, CSS and JS hosted on GitHub Pages with a custom domain; Formspree for forms; no framework or WordPress unless I say otherwise.
2. Pages: Home, Services & Pricing (prices visible in the first screen), one page per main service, a location or "service area" section, a dedicated FAQ page, a blog with 3 or 4 starter guides answering real customer questions, Policies, Privacy, and a custom 404 page.
3. Every page:
   - a unique title and meta description
   - one H1 heading
   - a canonical URL
   - Open Graph tags
   - breadcrumbs
   - a visible FAQ section with matching FAQPage schema
   - JSON-LD for the right LocalBusiness type (name, phone, email, URL, logo, address, every service-area town, sameAs, payment methods, services and prices)
   - Service and BlogPosting schema where relevant
   - descriptive alt text
   - internal links
   - a call to action at the bottom
4. Conversion: one main call to action plus extras (call, text, online booking if they have one); packages listed item by item with a "Most Popular" badge and savings shown; proof on every page (Google rating, reviews, real photos); clear reassurances (deposits, cancellation, when payment is due); a call / text / book bar pinned to the bottom of phone screens.
5. Design:
   - a defined design system (colors as CSS variables, a headline font and a body font)
   - phone-first, with 16px side margins and no sideways scrolling
   - subtle scroll and hover motion that turns off when visitors have reduced motion set on their device
   - real photos as WebP files with small phone versions and lazy loading
   - a full favicon set
6. SEO files: sitemap.xml, robots.txt, llms.txt (a plain-text business summary with services, prices and page links).
7. Analytics: GA4 with events form_submit (only after the form succeeds), phone_click, text_click, booking_click; an opt-out for the owner's own visits with ?notrack=1; Search Console setup steps.
8. Off-site plan: a Google Business Profile setup checklist (category, services, up to 20 service-area towns matching the site, attributes, booking link, photos, review replies), a NAP sheet, a citations list, and a review-request plan.
9. Copy rules: plain and specific, no em dashes, no invented facts, prices only from the NAP sheet.

DELIVER FIRST (before writing any code):
- a sitemap with each page's main search target ("service + town")
- a section-by-section outline of the homepage and one service page
- a design direction (colors, fonts, mood) with reasons, plus 2 options for me to pick from
- a list of photos and info still missing from the client
- the blog topic list and FAQ list
Then wait for my approval before building. Show previews (phone 390px and desktop 1280px) before anything goes live.
```
