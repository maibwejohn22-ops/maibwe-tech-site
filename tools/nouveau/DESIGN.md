# /nouveau/ — design system and build brief (« Nord doré »)

New home page **prototype** for johnmaibwe.com (Applications John Maibwe, AJM).
It lives at `/nouveau/` only and is `noindex, nofollow`. The live site must stay byte-identical.

Builders rely on this file only. If something here is ambiguous, follow the spirit:
**credible, calm, premium; few words, big type, one accent; every effect must survive
reduced motion and a modest Android phone.**

---

## 0. Ground rules (read first)

**Never** switch branches, commit or push. Never touch `public/index.html`, `public/en/`,
`public/assets/site.css`, `public/assets/site.js`, `deploy/`, `Dockerfile`, `vercel.json`.

**You own only your section's three files** (5 builders work in parallel):

| File | What |
|---|---|
| `tools/nouveau/sections/<id>.html` | HTML fragment, root = `<section id="<id>" class="section <id> …" data-theme="…">` |
| `tools/nouveau/css/<id>.css` | styles, every selector scoped to `#<id>` or `.<id>__*` |
| `tools/nouveau/js/<id>.js` | one `AJM.register('<id>', fn)` call (the file is wrapped in its own IIFE by the build) |

Do **not** edit `page.html`, `css/base.css`, `js/core.js`, `build.py`, `composants.html` or another
section's files. Need a shared change? Say so in your report instead.
New images: `public/assets/nouveau/img/<id>-*.webp` only (see § 10).

**Naming.** Classes: `.<id>__element` / `.<id>__element--modifier` (BEM with the section id as
block, e.g. `.apps__tab`, `.pile__layer--active`). Element ids: prefixed `<id>-` (e.g. `apps-tab-eglise`).
The build fails on duplicate ids. No global element selectors (`h2 { … }`), no `!important`.

**Build & preview.**

```bash
python3 /Users/johnmaibwesihaya/dev/Nexora/maibwe-tech-site/tools/nouveau/build.py
```

Assembles `public/nouveau/index.html`, `public/assets/nouveau/nouveau.css`, `nouveau.js`
(+ `public/nouveau/composants.html`, a sample page of every component). It **fails loudly** on:
missing/duplicate markers, missing fragment, `<section id>` or `data-theme` missing, inline
`<script>`, `on*=` attributes, `javascript:` URLs, external img/script sources, `<iframe>`,
duplicate ids, `href="#x"` pointing nowhere. Keep your fragment valid at all times: a broken
fragment breaks everyone's build. It prints the page weight against the 700 KB budget.

Preview server « ajm-prototype » serves `public/` on http://localhost:8090 → open
http://localhost:8090/nouveau/ in **your own tab**. Add `?motion=reduced` to see the calm version
(the in-app browser cannot emulate `prefers-reduced-motion`); `?motion=full` forces motion.
Design-system sample: http://localhost:8090/nouveau/composants.html
Screenshot tip: when the Browser pane is narrower than an emulated 1440 px viewport, captures can
come back mostly empty (page painted in a tiny corner). Then verify desktop layout numerically
(`getBoundingClientRect`, `scrollWidth`) and take visual screenshots at the pane's own width or with
the mobile preset. Images: check they really paint (draw one into a canvas and read a pixel).

**CSP (nginx, production):** `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'
https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:;
connect-src 'self' https://api.web3forms.com; form-action 'self' https://api.web3forms.com https://web3forms.com`.
So: no inline JS, no event attributes, no external images/scripts/CDNs, `data:` images OK,
`style="…"` attributes OK (use them only for per-element custom properties like `--i: 3`).

---

## 1. Direction: « Nord doré » (Golden North)

A Québec night in deep navy, lit by **one** warm gold accent — the gold of the AJM logo.
Editorial and calm: very large Montserrat headlines of very few words, one word per
headline set in an italic serif (Instrument Serif) in gold, generous space, hairline rules,
soft grain. Living details are slow and quiet (rolling counters, a packet travelling on a data
line, an outline word filling with colour as you read). One pinned storytelling moment (the
« pile »: an app exploded into its layers). It should feel like a confident studio that ships
real apps — not a template, not a crypto landing page.

References adapted (from John's « Websites in 2026 » videos): one hero object that transforms;
a pinned section where a central visual stays while chapters alternate left/right (the
burger exploded view → the app « pile »); huge few-word headlines; restrained palette with one
strong accent; thin sticky glass header; rolling counters; flowing data lines; clip-path
colour wipes; outline display words. Craft over gimmick: if an effect does not help a parish
secretary or an SME owner understand what AJM does, cut it.

---

## 2. Palette

| Token | Hex | Use |
|---|---|---|
| `--navy` | #14253F | brand navy; `navy` theme background; primary button on cream |
| `--navy-2` | #1D3355 | raised surfaces on dark, hover of navy buttons |
| `--deep` | #0C1729 | default page / `dark` theme background |
| `--ink` | #070F1C | deepest: `ink` theme, footer, text on gold |
| `--gold` | #D29B38 | **THE accent.** Accent words, buttons and details on dark; `gold` theme field |
| `--gold-hi` | #E8B55A | hover/focus of gold on dark |
| `--gold-ink` | #946414 | gold for **text** on cream/paper (4.5:1 — never on dark) |
| `--cream` | #F5F0E6 | text on dark; `cream` theme background |
| `--cream-2` | #EAE1CF | cream borders/raised |
| `--paper` | #FBF8F2 | cards on cream |
| `--signal` | #7FD4E0 | « glace » — the only secondary accent, see below |
| `--signal-ink` | #1F6F80 | signal dot on light backgrounds |
| `--ok-on-dark` / `--ok-on-light` | #5BD6A0 / #1F7A52 | « Disponible » status dot only |

**Why a secondary accent (`--signal`, ice blue).** Gold stays the single *brand* accent (text,
buttons, highlights). The data/infrastructure moments (data lines, packets, terminal prompt,
server node, « Bêta » dot) need a cool, technical counterpoint so they read as *machinery*,
not as calls to action. A pale ice/St. Lawrence blue fits the Québec « nord » story, has 10.6:1
contrast on `--deep`, and is used **only on dark themes, only for thin lines, dots, glows and
mono labels** — never for headings, buttons, or large fills, never on cream. If a section has
no data/tech motif, it has no signal colour.

Contrast (WCAG): cream on deep 15.8; gold on deep 7.3; `#A9B6CA` muted on deep 8.7; navy on
cream 13.5; `#4E5A70` muted on cream 6.1; gold-ink on cream 4.5; ink on gold 7.8; `#342E22`
muted on gold 5.4. **Gold on cream is 2.2 → never use `--gold` for text on cream** (use
`var(--accent)` which is gold-ink there).

### Section themes (`data-theme` on each `<section>`, required)

Each theme sets semantic tokens. **Always style with the semantic tokens**, never raw hex,
so components work in every theme:
`--bg --fg --fg-muted --accent --accent-strong --on-accent --accent-hover --line --line-strong
--surface --surface-2 --focus --ok --signal-dot`.

| Theme | bg | fg | accent (text) | button | Notes |
|---|---|---|---|---|---|
| `dark` | deep | cream | gold | gold / ink text | default |
| `ink` | ink | cream | gold | gold / ink text | data & infra |
| `navy` | navy | cream | gold | gold / ink text | products |
| `cream` | cream | navy | gold-ink | navy / cream text | light sections |
| `gold` | gold | ink | ink | ink / cream text | the one bold full-bleed moment |

**Page rhythm (fixed):**

| # | id | theme | role |
|---|---|---|---|
| 1 | `hero` | `dark` (+ `bg-grain bg-glow`) | first impression, the object |
| 2 | `pile` | `ink` (top edge blends from deep) | pinned storytelling |
| 3 | `services` | `cream` (+ `bg-grain`) | 8 services, outline → fill |
| 4 | `apps` | `navy` | 7 products, ARIA tabs |
| 5 | `donnees` | `ink` (+ `bg-grid bg-signal`) | infrastructure & trust |
| 6 | `chiffres` | `gold` | real numbers, rolling counters |
| 7 | `methode` | `cream` | 4 steps + FAQ |
| 8 | `ponts` | `dark` (+ `bg-grain`) | about, Québec ↔ Africa |
| 9 | `contact` | `cream` | final CTA + form |
| — | footer | `ink` | in page.html |

The header reads the theme of the block under it (`data-on="dark|light|gold"`) and adapts.

---

## 3. Typography

Fonts (Google Fonts, `display=swap`, already linked in page.html):
**Montserrat** 400/500/600/700/800 (brand, everything) and **Instrument Serif** 400 regular +
italic (accent words only). Mono = system stack (`--font-mono`), never downloaded.

| Token | Size (360 → 1440 px) | Class | Use |
|---|---|---|---|
| `--fs-mega` | 52 → 168 px | `.display.display--mega` | 1–3 *short* words (hero, contact, big numbers) |
| `--fs-display` | 40 → 101 px | `.display` | section headlines (≤ 6 words) |
| `--fs-h2` | 32 → 60 px | `.h2` | sub-headlines |
| `--fs-h3` | 21 → 30 px | `.h3` | card / chapter titles |
| `--fs-lead` | 18 → 22 px | `.lead` | intro paragraph (muted, max 44 rem) |
| `--fs-body` | 17 px | body | |
| `--fs-small` | 15 px | `.small` | |
| `--fs-xs` | 13 px | `.eyebrow` | kicker: uppercase, 0.16em, accent colour, 28 px rule before |
| `--fs-2xs` | 12 px | `.tech`, `.chip` | mono uppercase technical labels (secondary only) |

Rules:
- Display: weight 800, line-height 0.95 (mega 0.9), tracking −0.04em (mega −0.05em), `text-wrap: balance`.
- **Accent word:** wrap one word/phrase of a headline in `<em>` → Instrument Serif italic, 1.08em,
  `var(--accent)`. One `<em>` per headline, usually the last words: « Ce que nous <em>faisons.</em> ».
- **Mobile check is mandatory at 375 px:** a Montserrat 800 word wider than ~11 characters does
  not fit at `--fs-mega`. Headings use `overflow-wrap: break-word` as a safety net (ugly mid-word
  breaks) — design so it never triggers: shorter words, smaller size on small screens, or put the
  long word in the (narrower) serif `<em>`.
- French typography: typographic apostrophe ’, guillemets « » with `&nbsp;` inside, `&nbsp;`
  before `: ; ? !`, « 360&nbsp;+ » style is not needed (write « 360+ » or « plus de 360 »).
  Accents on capitals in uppercase text are fine (CSS uppercase keeps them).
- Outline words: `.outline-text` (1.5 px visible stroke in `--fg`; set `--stroke-w`,
  `--stroke-color`). Only ≥ 48 px. If an outline word carries meaning, it must become filled
  (see `.wipe-text`) or have full-contrast stroke. **Montserrat is a variable font with
  overlapping contours**: a plain `-webkit-text-stroke` draws stray lines inside M, N, B, e…
  So `.outline-text` paints a doubled stroke *under* a fill of the background colour
  (`paint-order: stroke fill`, fill = `var(--outline-fill, var(--bg))`). On a non-uniform
  background set `--outline-fill`. Never write a raw `color: transparent; -webkit-text-stroke`.

---

## 4. Space, layout, breakpoints

- Spacing scale `--s-1 … --s-10` = 4, 8, 12, 16, 24, 32, 48, 64, 96, 128 px.
- `--section-pad` = clamp(80 px, …, 160 px) vertical padding of `.section`.
- `--gutter` = clamp(16 px, 4vw, 40 px). `.wrap` = max 1280 px + gutters; `.wrap--narrow` = 860 px.
- `--header-h` = 64 px. Sticky things use `top: calc(var(--header-h) + …)`.
- `.section-head` (+ `--center`): grid with gap 24 px, max 62 rem, bottom margin 48–96 px.
- `.grid-12`: 12 `minmax(0,1fr)` columns, gap `--grid-gap`. **Always `minmax(0, 1fr)`** in your
  own grids: a device frame or long word in an `auto`/`1fr` track inflates the column.
- Breakpoints (match `AJM.breakpoints`): **sm 640, md 900, lg 1100, xl 1280** (min-width).
  Desktop storytelling/pinning starts at **900 px**; header collapses to « Menu » below 1100.
- Radii `--r-xs 6 · --r-sm 10 · --r-md 16 · --r-lg 24 · --r-xl 36 · --r-pill`.
- Shadows `--shadow-1` (light), `--shadow-2` (cards/devices), `--shadow-3` (hero object),
  `--glow-gold`, `--glow-signal`.
- `html` and `body` use `overflow-x: clip` (not hidden) so `position: sticky` works. Never put
  `overflow: hidden` on a section that contains a sticky element; use `overflow: clip` on an
  inner wrapper if you need to cut decorative overflow.

---

## 5. Components (base.css) — see them live in `/nouveau/composants.html`

**Eyebrow / kicker** `<p class="eyebrow">Services</p>` (`.eyebrow--plain` without the rule).

**Headlines** `<h2 class="display" id="services-title">Ce que nous <em>faisons.</em></h2>`
— each section is `aria-labelledby` its headline. The page has exactly one `<h1>` (hero).

**Buttons** (≥ 48 px tall, pill, clip-path colour wipe on hover/focus; theme-aware):
```html
<a class="btn btn--primary" href="#contact">Parlons de votre projet</a>
<a class="btn btn--ghost" href="#apps">Voir nos applications
  <svg class="btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
```
Sizes `.btn--sm` (40 px), `.btn--lg` (56 px). Text link: `<a class="link-arrow" href="…">App Store →</a>`.

**Chips & status** (status = dot + **text**, colour is never the only signal):
```html
<span class="chip">iOS · Android</span>
<span class="chip status status--disponible">Disponible</span>
<span class="chip status status--bientot">Bientôt sur l’App Store</span>
<span class="chip status status--beta">Bêta privée</span>
<span class="chip status status--conception">En conception</span>
```

**Card** `.card` (surface, hairline, `--r-lg`), `.card--raised`, `.card--interactive` (lift on hover;
only on things that are actually links/buttons).

**Tech label** `<p class="tech">PostgreSQL · Docker</p>` — mono, uppercase, muted, secondary.

**Outline → fill wipe** (default = filled, so no-JS/reduced is readable; JS animates the clip):
```html
<span class="wipe-text">
  <span class="wipe-text__base outline-text">Automatisation</span>
  <span class="wipe-text__fill" aria-hidden="true">Automatisation</span>
</span>
```
```js
gsap.fromTo(fill, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', ease: 'none',
  scrollTrigger: { trigger: row, start: 'top 85%', end: 'top 45%', scrub: AJM.scrub } });
```
Set `--wipe-color` to fill in another colour (e.g. `var(--accent)`).

**Backgrounds** (on a `.section`, which is `position: relative; isolation: isolate`):
`.bg-grain` (SVG noise on `::after`, `--grain-opacity`), `.bg-glow` (gold radial; `--glow-x/-y/-a`),
`.bg-signal` (ice radial, dark themes), `.bg-grid` (64 px hairline grid on `::before`, masked;
`--grid-x/-y`). Your own decorative layers: `position: absolute; z-index: -1; pointer-events: none`.
Note `::before`/`::after` of your `<section>` may be taken by these classes.

**Device frames** (neutral, pure CSS — never Apple frame images). Size **only** via the custom
property (clamp/min welcome); bezel and radius derive from it:
```html
<div class="device-phone" style="--phone-w: clamp(220px, 24vw, 320px)">
  <div class="device-phone__screen">
    <img src="/assets/nouveau/img/ec-accueil.webp" width="540" height="1173"
         alt="Église Connect : l’écran d’accueil affiche la prochaine messe" loading="lazy" decoding="async">
  </div>
</div>

<div class="device-laptop" style="--laptop-w: 640px">
  <div class="device-laptop__lid"><div class="device-laptop__screen"><svg …>…</svg></div></div>
  <div class="device-laptop__base" aria-hidden="true"></div>
</div>
```
Phone screen ratio 1290/2796 (all screenshots); the screen is clipped with `clip-path`, so animate
**children** of `__screen` (stack several `img`/`svg`, or `.device-screen-layer` divs, all absolutely
filling it), never the screen itself. `::before` = glass sheen, `::after` = neutral camera dot.
Laptop screen 16/10 (no real web screenshots exist: use an abstract SVG, see § 10).

**Iso stage** — the shared 3D angle that links the hero object to the pile:
`<div class="iso-stage"><div class="iso">…</div></div>` → `transform: var(--iso)` =
`rotateX(55deg) rotateZ(-38deg)`, `perspective: 1800px`. In GSAP use the same numbers
(`rotationX: 55, rotationZ: -38`).

**Split text / counters** classes (`.split-word`, `.split-word__inner`, `.split-word--mask`, `.roll*`)
are produced by `AJM.utils` (§ 7); don't write that markup by hand.

**Header & footer** live in page.html (don't restyle them from a section).

---

## 6. Accessibility (non-negotiable)

- Semantic HTML: `<section aria-labelledby>`, real headings in order (h1 hero → h2 per section →
  h3 inside), lists for lists, `<figure>/<figcaption>` for visuals, `<details>/<summary>` for FAQ.
- **All meaningful text in HTML** — never in canvas, images or CSS `content`. SVG text is allowed
  only for decorative labels that duplicate HTML text (then `aria-hidden="true"` on the SVG).
- Decorative things: `aria-hidden="true"` (+ `alt=""` on decorative images). Illustrations that
  convey something: `role="img"` + `aria-label` in French.
- Focus visible everywhere (base.css handles `:focus-visible` with `--focus`); never remove outlines.
  Anything clickable is an `<a>` or `<button>`; hit targets ≥ 44 px on touch.
- Contrast AA with the tokens above; text over images/gradients must stay ≥ 4.5:1.
- ARIA tabs where tabs are used (pattern in § 9 « apps »).
- External links: `target="_blank" rel="noopener"` + `<span class="sr-only"> (nouvel onglet)</span>`.
- Auto-moving content lasting > 5 s needs a visible pause control (WCAG 2.2.2), or must stop by
  itself, or must be scroll-driven instead of time-driven. Prefer scroll-driven.
- **Reduced motion = a complete calm version:** no pinning/sticky storytelling, no scroll-scrubbed
  motion, no loops, no typing, no split text, counters show final values, everything stacked and
  readable. Essential behaviour (tabs, menu, form, details) still works. Test with `?motion=reduced`.
- No JavaScript = same as reduced motion: **never hide content in CSS** waiting for JS. Initial
  hidden states are set by JS (`gsap.set`, `gsap.from`, `immediateRender`) right before animating.
  Exception: the hero's CSS-only intro (`@keyframes` with `animation-fill-mode: both`) — it ends
  visible without JS.

---

## 7. core.js API (`window.AJM`)

core.js runs first (deferred, after GSAP + ScrollTrigger). It adds `html.js`, sets
`html[data-motion="full|reduced"]`, registers ScrollTrigger, handles the header (`data-at-top`,
theme under the bar, `aria-current` on nav links, « Menu » toggle, closes the menu when focus
leaves it), and refreshes ScrollTrigger after `document.fonts.ready` and `window.load` only.
**A refresh resets the scroll position while it measures**, which used to cancel smooth anchor
scrolls and #fragment jumps; so ScrollTrigger's own load/DOMContentLoaded auto-refresh is off
(`autoRefreshEvents: 'visibilitychange,resize'`), `AJM.refresh()` waits until scrolling has
stopped for 250 ms, image loads never trigger a refresh (every `<img>` has width/height), and a
deep link (`/nouveau/#methode`) is re-applied after each refresh until the visitor scrolls.

```js
// tools/nouveau/js/apps.js  (wrapped in its own IIFE + 'use strict' by build.py)
AJM.register('apps', function (api) {
  // 1. essential behaviour — ALWAYS (also in reduced motion)
  setupTabs(api);                      // your function, defined in this file

  // 2. motion — only when allowed
  if (!api.motion) return;

  var gsap = api.gsap;
  gsap.from(api.q('.apps__tab'), {
    y: 24, opacity: 0, duration: AJM.dur.reveal, ease: AJM.ease.out, stagger: 0.06,
    scrollTrigger: { trigger: api.el, start: 'top 75%', once: true }
  });

  api.mm.add('(min-width: 900px)', function () {          // desktop-only scrub
    gsap.to(api.$('.apps__phone--back'), { yPercent: -12, ease: 'none',
      scrollTrigger: { trigger: api.el, start: 'top bottom', end: 'bottom top', scrub: AJM.scrub } });
  });

  return function cleanup() { /* remove anything not created through gsap / api.listen */ };
});
```

`AJM.register(id, initFn)` — inits run once, after DOM parsing, in page order, each inside its own
`gsap.context()` scoped to `#id` (selector strings in gsap calls are scoped to your section).
If the reduced-motion preference changes live (or `AJM.setReduced(bool)` is called), every
section is torn down (cleanups, `mm.revert()`, `ctx.revert()`, split/counter DOM restored) and
initialised again. **So your init must be re-runnable** and must undo its own side effects.

`initFn(api)` receives:

| `api.` | |
|---|---|
| `id`, `el` | section id and `<section>` element |
| `motion` | `true` if motion is allowed (not reduced AND GSAP loaded). **Gate all motion on it.** |
| `reduced` | the raw preference |
| `gsap`, `ScrollTrigger` | the libraries (or `null`) |
| `$(sel)`, `q(sel)` | `querySelector` / array `querySelectorAll` inside the section |
| `mm` | a `gsap.matchMedia()` for breakpoint-specific animations (auto-reverted) |
| `add(fn)` | run `fn` inside the section's gsap context (for tweens created later, e.g. in a click handler) |
| `listen(target, type, fn, opts)` | `addEventListener` that is auto-removed on teardown |
| `onCleanup(fn)` | register extra cleanup; or simply `return` a cleanup function |
| `utils` | = `AJM.utils` |

Globals: `AJM.reduced`, `AJM.breakpoints {sm 640, md 900, lg 1100, xl 1280}`,
`AJM.ease {out:'expo.out', soft:'power3.out', inOut:'power2.inOut', none:'none'}`,
`AJM.dur {micro .2, ui .45, reveal .9, big 1.4}`, `AJM.scrub` (0.6), `AJM.refresh()`
(debounced `ScrollTrigger.refresh`, call after you change layout), `AJM.headerHeight()`,
`AJM.setReduced(bool)` (testing).

`AJM.utils`:
- `splitWords(el, {mask})` → array of `.split-word__inner` spans to animate (`yPercent: 110` from a
  mask looks best). Splits on breakable spaces only: `&nbsp;` keeps two words together. Screen readers get one `.sr-only` copy of the sentence; the visual copy is
  `aria-hidden`. Keeps `<em>`/`<strong>`/`<br>`; **never** use on text containing links. Motion only.
- `rollingCounter(el, {duration, stagger, ease})` → `{ play(delay), set(progress) }`. `el` contains the
  real final text (« 360+ », « 7 »); digits become 0–9 strips moved by transform (odometer, units
  first). The visual starts at 0 → call it only when `api.motion`, then `play()` from a
  ScrollTrigger `onEnter` (`once: true`).
- `countUp(el, {to, from, duration, decimals})` — text count-up (rewrites text; prefer rollingCounter).
- `inView(el, cb, {once, rootMargin, threshold, onLeave})` → disconnect fn (IntersectionObserver).
- `pauseWhenHidden(el, anim)` → stop fn. A looping tween/timeline plays only while `el` is on
  screen and the tab is visible. **Every infinite loop must use it** (and be cleaned up).
- `clamp(v,min,max)`, `lerp(a,b,t)`, `mapRange(v,inMin,inMax,outMin,outMax)`, `isFinePointer()`.

A section's JS touches **only its own section's DOM**. No cross-section coupling: the hero →
pile « handoff » is visual only (same `--iso` angle, same deep→ink colours).

---

## 8. Motion principles

| | Duration | Ease (GSAP / CSS) |
|---|---|---|
| micro (hover, focus, chips) | 0.2 s | `power3.out` / `--ease-out-soft` |
| UI (menu, tab switch) | 0.45 s | `expo.out` / `--ease-out` |
| reveal (text/cards entering) | 0.9 s, stagger 0.05–0.08 | `expo.out` |
| big (hero intro, wipes, counters) | 1.2–1.8 s | `expo.out` |
| scrubbed | — | `ease: 'none'`, `scrub: AJM.scrub` (0.6) |

- **Scrubbed (tied to scroll position):** hero object transform; pile layer separation + active
  chapter; services outline→fill (desktop); chiffres gold wipe; méthode progress line + number fills;
  ponts arc reveal + audience band; light parallax (≤ 12 % of element height).
- **Triggered once (time-based on enter, `once: true`):** headline word rises, card/list reveals,
  rolling counters, the terminal typing, tab-switch transitions.
- **Loops:** only slow ones (≥ 3 s per cycle), only while visible (`pauseWhenHidden`), never
  conveying essential info (hero screen cycle has a pause button).
- **Never put a CSS `transition` on a property GSAP animates** (GSAP reads the computed value
  mid-transition and can record the wrong start/end — the pile labels once animated 0 → 0).
  Prefer `fromTo()` over `from()` when the element also has CSS states.
- **Only animate `transform`, `opacity`, `clip-path`** (and SVG `opacity`/`transform`). No width,
  height, top/left, margin, box-shadow, filter, backdrop-filter or stroke-dashoffset animation.
  Draw a path by revealing it with a `clip-path` wipe instead of `stroke-dashoffset`.
- Distances: reveals 24–40 px; rotations ≤ 3° except the iso object; no bounce/elastic eases.
- **One** pinned/sticky storytelling section: `pile`. Pin with CSS `position: sticky` (preferred:
  no pin-spacer, robust on iOS) and drive animation with ScrollTrigger; if you use
  `ScrollTrigger pin`, set `pinSpacing: true`, `anticipatePin: 1`, start after the header.
- Desktop scrubs inside `api.mm.add('(min-width: 900px)', …)`; on phones prefer triggered reveals.
- No scroll-jacking, no smooth-scroll library, no `scroll` listeners (use ScrollTrigger / IO).
  Native anchor scrolling is smooth via CSS (`scroll-padding-top` handles the header).
- `will-change` only on elements animating continuously; GSAP sets `force3D` itself.
- Use the motion **intentionally**: a section should have one signature effect, not five.

---

## 9. Section briefs

Copy is in French, « vous » form, for non-technical readers (parishes, schools, NGOs, SMEs,
entrepreneurs). Technical terms only in `.tech` labels or chips. Suggested copy below is a
starting point — keep the facts exact (§ 11). Reuse/adapt the current site's wording
(`public/index.html`) where it fits.

### 9.1 `hero` — theme `dark`, classes `bg-grain bg-glow` — « one object that transforms »
- Full first screen: `min-height: calc(100svh - var(--header-h))`. Desktop: text left (7 cols),
  object right (5 cols). Mobile: text, then the object (smaller, `--phone-w: clamp(200px, 58vw, 260px)`).
- Eyebrow « Studio logiciel · Québec ». **The only `<h1>`**, mega:
  « Simples. Utiles. <em>Accessibles.</em> » (each word on its own line on desktop is fine; check 375 px —
  « Accessibles. » fits only in the serif).
- Lead: « Applications web et mobiles, logiciels sur mesure et intelligence artificielle — conçus
  au Québec pour les paroisses, les écoles, les organismes, les PME et les entrepreneurs, ici
  comme en Afrique francophone. »
- CTAs: `.btn--primary` « Parlons de votre projet » → `#contact`; `.btn--ghost` « Voir nos applications » → `#apps`.
- Small facts line under CTAs (real): « 4 applications sur l’App Store · 3 sur Google Play ».
- **The object:** one `.device-phone` (with `--shadow-3` and a soft gold glow behind), slightly turned
  in 3D (e.g. `rotateY(-14deg) rotateX(6deg)`). Its screen holds 4 real screenshots stacked
  (`ec-accueil` eager + `fetchpriority="high"`; `cr-accueil`, `vm-accueil`, `pc-teleprompteur` lazy)
  and cycles every ~3.5 s with a clip-path wipe (next screen wipes up from the bottom). A small glass
  chip next to the phone shows the current app name (« Église Connect » …), `aria-hidden`.
  Visible pause/play `<button class="hero__pause" aria-pressed>` (WCAG 2.2.2), or stop after one
  cycle on Église Connect. The phone `<figure>` gets
  `aria-label="Aperçu de nos applications : Église Connect, Campus RDC, VillageMap RDC et TELEPromptCam Pro"`;
  the imgs `alt=""`.
- **Transformation (desktop ≥ 900, scrubbed over the hero's scroll-out):** the phone rotates into
  the shared iso angle (`rotationX: 55, rotationZ: -38`), scales ~0.8 and drifts up — the same
  angle the `pile` section opens with, so the phone visually « becomes » the stack. The headline
  drifts up slightly. Nothing fades below 0.2 opacity while still on screen.
- Intro: pure CSS `@keyframes` (no JS needed, no flash): words rise from a mask (0.9 s, 70 ms
  stagger — wrap words in `<span class="hero__w">` by hand in the HTML, *not* splitWords), the
  phone rises/fades in (1.2 s, 0.3 s delay). Gate under `@media (prefers-reduced-motion: no-preference)`
  and `html:not([data-motion="reduced"])`.
- Decorative scroll cue (« Défiler » + a 1 px line scaling on Y), `aria-hidden`.
- Reduced: static, phone shows Église Connect, no cycle, no button, no transform.
- Tip: the header is sticky in flow; for a full-bleed hero under the glass bar use
  `margin-top: calc(-1 * var(--header-h)); padding-top: var(--header-h)`.

### 9.2 `pile` — theme `ink` — the pinned exploded view (burger → « pile technique »)
- Top edge: blend from `--deep` to `--ink` (a 20 vh gradient layer) so the hero flows in.
- Head: eyebrow « Anatomie d’une application », h2 « Ce qu’il y a <em>sous l’écran.</em> »,
  lead « Une application, c’est cinq couches qui travaillent ensemble. Nous les construisons
  toutes — et nous restons là pour les entretenir. »
- **Desktop ≥ 900:** grid `1fr minmax(320px, 36%) 1fr`. The central visual is a grid item spanning
  all rows, `align-self: start; position: sticky; top: calc(var(--header-h) + 4vh);
  height: calc(100svh - var(--header-h) - 8vh)`. Five chapters (`<ol class="pile__chapters">`, each
  `min-height: 85svh`, content vertically centred) **alternate left/right** of it (odd in column 1,
  right-aligned toward the centre; even in column 3).
- Visual = `.iso-stage` > stack of 5 `.pile__layer` planes in the iso angle (rounded rects ~ 70 % of
  the column, CSS gradients, hairline borders, each with a tiny HTML label tag). The whole visual is
  `role="img"` + `aria-label="Schéma : les cinq couches d’une application, de l’écran au serveur"`;
  layer labels inside are `aria-hidden` (chapters carry the text).
  Layers top → bottom:
  1. **L’écran** — what users touch. Top plane shows `ec-accueil.webp` (cropped) or an abstract UI.
     Chapter: « Ce que vos membres voient et touchent : une interface claire, lisible, pensée pour le
     téléphone comme pour l’ordinateur. » `.tech` « iOS · Android · Web »
  2. **Les fonctions** — small module tiles (Annonces, Comptes, Notifications, Formulaires).
     « Les règles de votre organisation, traduites en fonctions : publier une annonce, recevoir une
     demande, envoyer un rappel. » `.tech` « API · logique métier »
  3. **L’intelligence** — a few gold nodes linked by hairlines.
     « L’intelligence artificielle et l’automatisation, là où elles font vraiment gagner du temps :
     rédiger, trier, rappeler, répondre. » `.tech` « IA · automatisation »
  4. **Les données** — table rows / cylinder motif.
     « Vos informations, rangées, protégées et sauvegardées — jamais revendues. »
     `.tech` « PostgreSQL · sauvegardes chiffrées »
  5. **Le serveur** — rack lines, a tag « Québec », ice-blue (`--signal`) status dots.
     « Notre propre serveur, hébergé au Québec. » `.tech` « OVHcloud Beauharnois · Docker · Coolify »
- Scroll (ScrollTrigger, scrub): over the first ~15 % of the stage the layers separate from a tight
  stack (≈ the hero phone) to an exploded view (`z`/`y` offsets per layer, transform only). Each
  chapter (`start: 'top 60%', end: 'bottom 40%'`) sets the active layer: gold edge + label lights up,
  others dim to ~0.4 opacity. Chapter text reveals once (y 30 → 0, opacity).
- **Mobile < 900 and reduced motion:** no sticky. The exploded visual is shown once (static, all
  layers labelled) above the stacked chapters; each chapter shows its layer number badge.
- Close with a one-line outro under the stage: « Nous construisons chaque couche — et nous restons
  là ensuite. » + `.link-arrow` « Voir nos services » → `#services`.

### 9.3 `services` — theme `cream`, `bg-grain` — huge outline words that fill
- Head: eyebrow « Services », h2 « Ce que nous <em>faisons.</em> », lead « Huit façons de vous
  accompagner, du premier site web jusqu’à l’intelligence artificielle. »
- `<ol class="services__list">` of 8 rows separated by hairlines. Row grid (desktop): index « 01 »
  (`.tech`) | service name as `.wipe-text` at ~`clamp(2.25rem, 1rem + 4.4vw, 5rem)` | description +
  `.tech` label. Mobile: stacked.
- Names, descriptions (from the current site), tech labels:
  1. Applications web — Sites professionnels et applications web modernes, rapides et sécurisés, faciles à mettre à jour. · « Next.js · HTML/CSS »
  2. Applications iOS et Android — Applications mobiles conçues pour vos utilisateurs et publiées sur l’App Store et Google Play. · « iOS · Android »
  3. Logiciels sur mesure — Portails, outils de gestion et logiciels internes construits exactement pour votre façon de travailler. · « Portails · outils de gestion »
  4. Intelligence artificielle — Assistants, analyse et rédaction de documents, recherche intelligente : l’IA là où elle fait vraiment gagner du temps. · « Assistants · rédaction · recherche »
  5. Automatisation — Rapports, rappels, envois et liens entre vos outils : la machine s’en occupe, vous gagnez des heures. · « Rappels · rapports · intégrations »
  6. Cloud et bases de données — Vos données organisées, sécurisées et sauvegardées, hébergées de façon fiable. · « PostgreSQL · Docker · sauvegardes »
  7. Transformation numérique — Un accompagnement clair pour moderniser vos processus, choisir les bons outils et éviter les mauvaises dépenses. · « Conseil · choix d’outils »
  8. Maintenance — Nous reprenons et faisons évoluer vos projets existants, même créés par d’autres. · « Reprise · évolution »
  (Use « Applications iOS et Android » or shorten the visible giant word to « Mobile » with the full
  name right below — the giant word must fit at 375 px.)
- Signature effect: each name is outline at rest and **fills left→right with a clip-path wipe**,
  scrubbed as the row crosses the viewport (`top 85%` → `top 45%`, desktop); on mobile triggered
  once. The index number turns `--accent` when the row is filled. Default (no JS/reduced) = filled.
- Optional quiet detail: a single navy pill « Parlons-en → » (`#contact`) after the list.

### 9.4 `apps` — theme `navy` (+ subtle `bg-signal` optional) — 7 products, ARIA tabs
- Head: eyebrow « Produits », h2 « Sept produits, <em>un même soin.</em> », lead « Certains sont
  déjà sur l’App Store et Google Play, d’autres sont en chemin — leur état est toujours indiqué
  clairement. »
- Layout desktop: tablist left (vertical; each tab = name + status chip), panel right (phone(s) +
  text). Mobile: tablist becomes a horizontally scrollable row of pills (scroll-snap), panel below.
- **ARIA tabs:** `role="tablist" aria-label="Nos produits"` (+ `aria-orientation="vertical"` on
  desktop); `role="tab"` buttons with `id="apps-tab-<slug>"`, `aria-selected`, `aria-controls`,
  roving `tabindex` (0 on selected, −1 others); `role="tabpanel"` with `id="apps-panel-<slug>"`,
  `aria-labelledby`, `tabindex="0"`. Keys: ←/→ and ↑/↓ move + activate (automatic activation),
  Home/End. **Progressive enhancement:** in the HTML, all 7 panels are visible articles and the
  tablist has `hidden`; JS (always, even reduced) un-hides the tablist and sets `hidden` on
  non-selected panels. Without JS, the page shows the 7 products stacked.
- Panel content: `.tech` kind, h3 name, status chip, description, « Pour qui » line, links
  (exact URLs in § 11; external → new tab with sr-only note). Visual: 1–2 `.device-phone`
  (main + a smaller one offset behind, real screenshots):
  Église Connect `ec-accueil` + `ec-annonces` (or `ec-services`); Campus RDC `cr-accueil`;
  VillageMap RDC `vm-accueil` + `vm-ajouter`; TELEPromptCam Pro `pc-teleprompteur` + `pc-scripts`.
  **AdProtectX, Zembo Music IA, Castor IA: no screenshots exist** → an inline SVG illustration inside
  the phone frame in the app's spirit (AdProtectX: shield + on/off toggles for categories, cyan-ish
  `--signal` details; Zembo: dark screen, gold waveform, lyric lines as bars, language pills
  FR · EN · ES · LN · SW; Castor IA: chat bubbles as bars, cream/navy), **no invented numbers or fake
  data**, and a visible caption « Illustration — l’application n’est pas encore publique ».
  SVG `role="img"` with a French `aria-label`.
- Motion: tab switch = new screen wipes up with clip-path (0.6 s expo.out) + text fade/slide 12 px;
  back phone gets a light scrubbed parallax (desktop). Reduced: instant switch.

### 9.5 `donnees` — theme `ink`, `bg-grid bg-signal` — infrastructure & trust, flowing data lines
- Head: eyebrow « Vos données », h2 « Vos données, <em>bien gardées.</em> », lead « Nos applications
  sont hébergées sur notre propre serveur, à Beauharnois, au Québec. Connexions chiffrées,
  sauvegardes chiffrées et une gestion des renseignements personnels qui suit la Loi 25. »
- **Data-flow diagram** (`<figure>` with `<figcaption>`, nodes are HTML text): « Vos utilisateurs »
  (téléphone · ordinateur) → « Serveur AJM — Québec » (`.tech` Docker · Coolify) → « Base de données »
  (`.tech` PostgreSQL) → « Sauvegardes chiffrées ». Links are 1 px lines (`--line-strong`) with small
  `--signal` packets (6 px dots + `--glow-signal`) travelling along them with `transform` only
  (straight/orthogonal segments; translate along each segment), staggered, slow (≥ 3 s), looping
  only while visible (`pauseWhenHidden`). Label the first link « HTTPS ».
  Mobile: the flow becomes vertical. Reduced: static lines, packets hidden.
- **Decorative terminal** (`aria-hidden="true"`): a dark window with a title bar reading
  « terminal — exemple illustratif ». Types a few illustrative lines once when in view
  (≈ 35 ms/char), e.g. `$ docker compose ps`, `$ pg_dump app | gpg --encrypt > sauvegarde.gpg`,
  `$ curl -I https://johnmaibwe.com` → `strict-transport-security: max-age=31536000`.
  No timestamps, no « live » wording, no fake metrics. The full text is in the HTML (no-JS/reduced:
  shown static).
- Trust grid, 6 `.card`s (line icon as inline SVG, title, one sentence, `.tech`):
  Serveur au Québec (OVHcloud, Beauharnois) · Connexions chiffrées (HTTPS partout, HSTS) ·
  Sauvegardes chiffrées · Données bien rangées (bases PostgreSQL) · Loi 25 (politique de
  confidentialité, collecte minimale, une personne responsable nommée — link `/confidentialite.html`) ·
  Aucun pistage publicitaire (« Ce site n’utilise ni témoins publicitaires ni outil de mesure d’audience. »).

### 9.6 `chiffres` — theme `gold` — the clip-path colour wipe + rolling counters
- Head: eyebrow « En chiffres », h2 « Des faits, <em>pas des promesses.</em> »
- 6 figures in a grid with hairline dividers; number in Montserrat 800 at
  `clamp(4rem, 2rem + 8vw, 9rem)`, tracking −0.05em, label below (`--fg-muted`):
  « 7 » produits développés ou en chemin · « 4 » applications sur l’App Store · « 3 » applications
  sur Google Play · « 8 » services · « 2 » marchés — Québec · RDC et Afrique francophone ·
  « 360+ » téléchargements depuis avril 2026.
- Footnote (small, muted): « Premiers téléchargements cumulés : 261 sur l’App Store et 104 sur
  Google Play, d’avril 2026 au 7 octobre 2026. »
- Signature: entering the section, a gold panel expands from an inset rounded card to full bleed
  (`clip-path: inset(14% 5% 14% 5% round 32px)` → `inset(0 round 0)`, scrubbed `top bottom` →
  `top 25%`). Implement with an absolute `.chiffres__bg` layer and, **only when `api.motion`**, add a
  class that makes the section itself `--ink` behind it; keep text off the not-yet-gold area (reveal
  text after ~40 % progress). Counters: `AJM.utils.rollingCounter` + `play()` once at `top 70%`,
  staggered 0.1 s. Reduced/no-JS: solid gold, final numbers.
- These are the **only** numbers on the page besides store facts; never animate them as « live ».

### 9.7 `methode` — theme `cream` — 4 steps + FAQ
- Head: eyebrow « Méthode », h2 « Quatre étapes. <em>Aucune surprise.</em> », lead « Chaque projet
  suit le même chemin : partir de votre réalité, livrer un outil fiable, puis l’améliorer avec vous. »
- `<ol>` of 4 steps (current site copy): 1 Comprendre le besoin — Nous écoutons d’abord : votre
  organisation, vos contraintes, ce qui vous fait perdre du temps aujourd’hui. 2 Concevoir une
  solution simple — Nous proposons la solution la plus simple qui règle vraiment le problème, pas
  la plus compliquée. 3 Développer un produit fiable — Nous construisons avec des technologies
  éprouvées, testons rigoureusement et livrons un outil stable. 4 Améliorer avec vos retours —
  Après la mise en service, vos retours et ceux de vos utilisateurs guident chaque amélioration.
- Layout: giant outline numbers « 01 »…« 04 » (`.wipe-text`, ~`clamp(5rem, 3rem + 9vw, 12rem)`) left,
  title + text right; a vertical 1 px track with a gold fill scaled on Y (`scaleY` scrubbed) runs
  down the list. Each number fills bottom→top (clip-path) as its step reaches the centre.
- Callout: « La première rencontre est gratuite — et vous repartez avec des conseils utiles. »
- FAQ « Questions fréquentes » (h3) with 6 `<details class="methode__faq">` from the current site
  (prix, délais, IA, hébergement et domaine, évolutions, hors Québec — adapt the last answer to
  « Québec, RDC et Afrique francophone, à distance »). Chevron rotates (transform). No height animation.

### 9.8 `ponts` — theme `dark`, `bg-grain` — about AJM, the Québec ↔ Africa bridge
- Head: eyebrow « À propos », h2 « Basée au Québec, <em>ouverte au monde.</em> »
- About (facts only): « Applications John Maibwe (AJM) est une entreprise individuelle fondée en mai
  2026 au Québec par John Maibwe. Un seul interlocuteur, de la première conversation jusqu’à la
  maintenance : vous savez toujours à qui vous parlez. » + adapt the current site's « Nous ne
  faisons pas que de beaux sites… qu’est-ce qui vous ferait vraiment gagner du temps ? ».
- **Bridge visual:** wide SVG with two nodes « Québec » and « RDC · Afrique francophone » joined by a
  gold arc (1.5 px) and two fainter dotted arcs; node labels are HTML positioned over the SVG (SVG
  `aria-hidden`; a visually-hidden sentence states the two markets). Reveal the arc with a
  left→right `clip-path` wipe, scrubbed (no stroke-dashoffset). Mobile: arc becomes vertical or
  simplified. Reduced: static, fully drawn.
- « Pour qui » band: Paroisses et diocèses · Écoles et universités · Organismes et ONG · PME ·
  Entrepreneurs · Communautés, as large outline words moving horizontally **with scroll** (scrubbed
  `xPercent`, no autoplay; duplicated copy `aria-hidden`). The real list is an HTML `<ul>`.
  Reduced: wrapped static list.
- Values (small 4-up, optional): Simplicité · Fiabilité · Accessibilité · Impact (current site copy).
- No photos of people (no stock photos in the prototype).

### 9.9 `contact` — theme `cream` — final call to action
- Eyebrow « Contact », headline mega-ish « Parlons de <em>votre projet.</em> », lead « Décrivez
  votre besoin en quelques lignes : nous vous répondons rapidement, en langage clair, sans jargon.
  La première rencontre est gratuite. »
- Big `mailto:john@johnmaibwe.com` link (display-ish size, underline drawn with a `scaleX` wipe).
- Form: **reuse the current site's form** (`public/index.html`, `#contactForm`): same Web3Forms
  `action="https://api.web3forms.com/submit" method="POST"`, same `access_key`
  (`072943ae-2b7c-4151-91dd-86ed93e98fc4`), hidden `subject` « Nouveau message — johnmaibwe.com
  (prototype) », `from_name`, honeypot `botcheck` (`tabindex="-1"`, `aria-hidden`), `langue`, fields
  nom / email / sujet (same 10 options) / message with the same constraints; ids prefixed `contact-`.
  JS (always, not motion-gated): port the submit logic of `public/assets/site.js` (« Formulaire de
  contact » block: 3 s timer + honeypot → fake success, length checks, > 3 links refused,
  `fetch` with `Accept: application/json`, `aria-busy`, status `role="status" aria-live="polite"`,
  success panel + « Envoyer un autre message »). French messages written inline in contact.js.
  Without JS the form posts normally. Note under the form: « Vos informations sont transmises via
  Web3Forms, uniquement pour traiter votre demande. » + link `/confidentialite.html`.
- Side info: Courriel · Zones « Québec · RDC et Afrique francophone — rencontres à distance » ·
  Langues « Français et anglais ».
- Motion: headline words rise, email underline wipe, form fields fade in (stagger). Minimal.

---

## 10. Images & performance

**Budget: total page < 700 KB excluding Google Fonts** (build.py prints it). Today the shell is
~182 KB (GSAP 115 KB + base CSS/JS + HTML); all 8 screenshots add 240 KB → **≈ 420 KB**, leaving
~280 KB for all section HTML/CSS/JS/SVG. Per-section guideline: CSS ≤ 12 KB, JS ≤ 10 KB, inline
SVG ≤ 15 KB. Hand-write SVG (few nodes, no editor bloat).

Inventory — `public/assets/nouveau/img/` (WebP, 540 px wide, cwebp q70; ratio 1290/2796; all
`width="540" height="1170|1173"`). Real store screenshots, checked: no personal data.

| File | Bytes | Size | Content | Suggested alt |
|---|---|---|---|---|
| `ec-accueil.webp` | 30 214 | 540×1173 | Église Connect home: next Mass, donate, request | « Église Connect : l’accueil affiche la prochaine messe et les services de la paroisse » |
| `ec-annonces.webp` | 27 178 | 540×1173 | Église Connect announcements list | « Église Connect : la liste des annonces de la paroisse » |
| `ec-services.webp` | 31 216 | 540×1173 | Église Connect « Demander un service » | « Église Connect : demander un service (transport, prière, baptême…) » |
| `cr-accueil.webp` | 37 338 | 540×1170 | Campus RDC home + search | « Campus RDC : rechercher une université congolaise » |
| `vm-accueil.webp` | 31 338 | 540×1170 | VillageMap RDC home | « VillageMap RDC : chaque village mérite d’être visible » |
| `vm-ajouter.webp` | 23 286 | 540×1170 | VillageMap RDC add-a-village form | « VillageMap RDC : formulaire pour ajouter un village » |
| `pc-teleprompteur.webp` | 28 344 | 540×1173 | TELEPromptCam Pro prompter (dark) | « TELEPromptCam Pro : le texte défile juste sous la caméra » |
| `pc-scripts.webp` | 30 698 | 540×1173 | TELEPromptCam Pro scripts list | « TELEPromptCam Pro : la liste des scripts » |
| **Total** | **239 612** | | | |

Deliberately **not** used: VillageMap « GPS + photos » (shows real coordinates), VillageMap map
(map tiles, « 0 village »), Campus RDC directory (third-party campus photos). No screenshots exist
for AdProtectX, Zembo Music IA, Castor IA, nor for any web/admin portal → abstract SVG illustrations.
Logo: `/assets/ajm-icon.svg` (810 B). **AVIF is not used:** macOS `sips` AVIF output decodes as
transparent in Chromium. New images: WebP via
`sips -s format png --resampleWidth 540 SRC --out /tmp/x.png && cwebp -q 70 -m 6 -sharp_yuv -metadata none /tmp/x.png -o public/assets/nouveau/img/<id>-name.webp`
(work files in the scratchpad, never in source repos; never edit source repos).

Rules: `width`/`height` on every `<img>` (no layout shift → stable ScrollTrigger); `loading="lazy"
decoding="async"` everywhere except the hero's first screen (`fetchpriority="high"`); same URL
reused across sections (browser cache). Call `AJM.refresh()` if you change layout after load.
Test on the mobile preset: no horizontal scroll (`document.documentElement.scrollWidth === innerWidth`).

---

## 11. Facts — the only facts allowed

- **AJM = Applications John Maibwe**, software studio in Québec, Canada. Sole proprietorship
  (entreprise individuelle) of **John Maibwe**, NEQ 2282127606, registered **May 2026**, **one founder**.
  Contact **john@johnmaibwe.com**, site johnmaibwe.com. Markets: **Québec** and **DR Congo /
  francophone Africa**. Service languages: French and English.
- **8 services:** applications web; applications iOS et Android; logiciels sur mesure; intelligence
  artificielle; automatisation; cloud et bases de données; transformation numérique; maintenance.
- **7 products** (status must match exactly):

| Product | What | Status chip | Links (exact) |
|---|---|---|---|
| Église Connect | App for Catholic parishes: announcements, Mass times, events, service requests, notifications; mobile app + admin portal + public site | Disponible | web https://www.egliseconnect.ca · App Store https://apps.apple.com/ca/app/%C3%A9glise-connect/id6766056580 · Google Play https://play.google.com/store/apps/details?id=ca.paroisseresurrection.app |
| Campus RDC | Directory of DR Congo universities: admission, fees, faculties, documents, official contacts | Disponible | https://apps.apple.com/ca/app/campus-rdc/id6764663959 · https://play.google.com/store/apps/details?id=com.campusrdc.mobile |
| VillageMap RDC | Citizen mapping of DR Congo villages (GPS position + photos) | Disponible | web https://villagemap-rdc.vercel.app · https://apps.apple.com/ca/app/villagemap-rdc/id6784472711 · https://play.google.com/store/apps/details?id=com.maibwetech.villagemaprdc |
| TELEPromptCam Pro | iPhone teleprompter: text scrolls just under the camera; iCloud sync of scripts | Disponible (iPhone) | https://apps.apple.com/ca/app/telepromptcam-pro/id6762070943 · /promptcam/support.html |
| AdProtectX | Family filter for ads and unwanted content via iOS encrypted DNS — no VPN, does not read pages | Bientôt sur l’App Store | /adprotectx/support.html · /adprotectx/confidentialite.html |
| Zembo Music IA | Turns a story or memory into a personalised song; AI-written lyrics in French, English, Spanish, Lingala, Swahili | Bêta privée | `#contact` « Être informé du lancement » |
| Castor IA | French-language AI assistant (web, iPhone, Android) | En conception | `#contact` « Suivre le projet » |

- **Numbers you may show:** 7 produits · 4 applications sur l’App Store (Église Connect, Campus RDC,
  VillageMap RDC, TELEPromptCam Pro) · 3 sur Google Play (Église Connect, Campus RDC, VillageMap RDC) ·
  8 services · 2 marchés · « plus de 360 téléchargements depuis avril 2026 » (App Store 261 + Google
  Play 104 first-time downloads, to 7 Oct 2026). Nothing else: no client counts, no percentages,
  no « 100 % », no years of experience, no response times, no uptime.
- **Infrastructure & trust:** own server hosted in Québec (OVHcloud, Beauharnois); Docker + Coolify;
  PostgreSQL databases; encrypted backups; HTTPS everywhere + HSTS; Québec Law 25 practices
  (privacy policy at /confidentialite.html, data minimisation, a named person responsible: John
  Maibwe); no ad tracking / no audience measurement on the site; the web server keeps no visit log.
- Tech names usable as small labels: iOS, Android, Web, React Native, Next.js, PostgreSQL, Docker,
  Coolify, HTTPS, HSTS, API.
- **Never:** name CIMKO or Classy Event (or any client), invent clients/testimonials/logos, use
  Apple device frame images, show « live » counters, claim certifications (« conforme », « certifié »),
  use stock photos of people.

---

## 12. Definition of done (each builder)

1. `python3 tools/nouveau/build.py` passes; weight still < 700 KB.
2. Own tab at http://localhost:8090/nouveau/: screenshots desktop (~1440) and mobile preset;
   no console errors/warnings from your section; no horizontal scroll at 375 px.
3. `?motion=reduced`: section fully readable, stacked, static; essential behaviour works.
4. Keyboard: Tab through your section — visible focus, logical order, no trap; tabs/menus/details
   work with the keyboard.
5. Header changes colour correctly over your section; anchors land below the header.
6. Facts checked against § 11; copy in French, « vous », no jargon outside `.tech`.
7. Reset any viewport emulation (`resize_window` preset « desktop »), close only your own tab.
8. Report: what you built, the signature effect, files touched, any shared change you need.

---

## 13. Integration notes (after the 5 builders)

- **Header theme, nested blocks.** core.js now watches every `[data-theme]` inside `<main>`, not
  only the sections. When several themed blocks cross the probe line under the bar, the last one
  in document order (the innermost) wins. Used by the cream outro at the end of `pile`
  (`.pile__outro[data-theme="cream"]`): the bar turns light as soon as the cream page reaches it.
  `aria-current` in the nav still follows the top-level sections only.
- **One FAQ per page.** The FAQ lives in `methode` (6 questions). `contact` holds the form
  (§ 9.9, the live site's Web3Forms form ported to contact.js, subject « … (prototype) ») on the
  left, e-mail + facts on the right: every « Parlons de votre projet » ends on a working form.
- **Clip-path strings with radii.** GSAP normalises clip-path through the computed style, which
  drops zero radii (`inset(0%)`), so a tween from `inset(… round 50vw …)` to `round 0vw` interpolates
  garbage. For multi-phase clip shapes, tween a proxy number and write the string yourself (see the
  dome in pile.js), and set `clip-path: none` at the end so no anti-aliased edge is left at a seam.
- **Pinning.** No ScrollTrigger `pin` anywhere: `pile` and `apps` use CSS `position: sticky`, so
  there are no pin-spacers to order. Under reduced motion there are no sticky elements in `<main>`
  and zero ScrollTriggers.
- **Visual QA without the Browser pane.** The pane often captures a 1440 px emulation in a corner.
  Headless Chrome driven over the DevTools protocol (Node 24 has a global `WebSocket`) gives exact
  1440 / 1024 / 768 / 390 captures and `Emulation.setEmulatedMedia` for `prefers-reduced-motion`.
- **Review fixes (fixer pass).** No time-based loops outside the hero any more: the packets of
  `donnees` and `ponts` are driven by the scroll (WCAG 2.2.2). The pile's desktop choreography
  never lets the stack touch the chapter text (explode `top 85%→35%` of chapter 2, its text
  revealed at `top 40%`; layers close at `top 80%→45%` of chapter 3 while the stack is still
  aside, it returns to the centre at `top 45%→15%`, launch at `top 30%→-10%`), verified by
  hit-testing every text line against the plates at 1440 × 900 and 1366 × 768. `ec-services.webp`
  is currently unused by the page (kept for a later screen). Backups: the diagram draws the
  « Sauvegarde chiffrée » node outside the server frame and the caption makes no claim about
  where copies are stored — to confirm with John.
