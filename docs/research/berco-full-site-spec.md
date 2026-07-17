# Berco full-site spec

Recon target: `https://berco-inc.com/` — single-page Next.js App Router site (React + GSAP ScrollTrigger/SplitText + Lenis + Embla). Evidence: served HTML (46 KB), CSS bundles `f2a74b822e89f7a7.css` (global system) + `ef552e54642fd1b8.css` (sections), app chunk `page-cd7deae484d6f5ef.js` (all 8 section components), `layout-04e132573f9ae819.js` (nav), vendor chunks 89 (GSAP+Lenis), c15bf2b0 (GSAP core), 336 (SplitText). Media metadata via HEAD/range requests only — no berco asset downloaded into the repo.

Companion doc: **`docs/research/berco-hero-spec.md`** — full hero/video/loader forensics (video inventory, intro→loop crossfade, ping-pong mechanics, procedural float, replication recipe). This spec references it rather than repeating it.

**Page skeleton in DOM order** (verified in SSR HTML and live):

```
<body>                              bg #020202, scrollbars hidden
├─ .navigation          (fixed glass pill bar)
├─ .navigation-bottom   (fixed scroll-to-top circle, hidden until past hero)
├─ .loading-screen      (fixed brand-shimmer overlay)
├─ 1. section.hero#home        100vh + margin-bottom 10vh
├─ 2. section.about#about      statement headline + 4-stat band
├─ 3. section.brands#brands    "Our Partners" card carousel (4 cards)
├─ 4. section.founders         2 giant square flip-cards
├─ 5. section.services#services  6-card grid (mobile: carousel)
├─ 6. section.brands#brands    "Our Techstack" logo carousel (7 cards)  ← duplicate id, same component
├─ 7. section.sequence         "Our Mindset" split panel + ping-pong video
└─ 8. section.contact#contact  contact info + form card — doubles as footer (copyright inside)
```

React render order (chunk `page-…js`, final component `G`): hero → about → brands#1 → founders → services → brands#2 → sequence → contact, all inside `<ReactLenis root>`. There is **no separate footer** — contact is the footer.

---

## 0. Global design system

### 0.1 Fonts

| Token | Family | Source | Weight | Used for |
|---|---|---|---|---|
| `.headline` | Helvetica Neue **Light** (`Helvetica Light`) | local `/fonts/HelveticaNeueLight.otf` (284 KB) | 300 | h1/h2 everywhere |
| `.headline-bold` (span) | Helvetica Neue **Medium** | local OTF | 400 | emphasized words inside headlines |
| `.subheadline` | Helvetica Light | local | 300 | founder names |
| `.description`, `.small-description`, `.big-description` | **Inter** | Google Fonts | 400 / 400 / 300 | all body copy |
| `.at-description` | `at` display font | local `/fonts/at.woff` (33 KB) | 400 | nav wordmark "BERCO INC" only (techno/reversed-glyph look) |
| `.hebrew-font` | IBM Plex Sans Hebrew | Google | — | HE language mode |

(Montserrat/Poppins/Roboto are imported in CSS but unused — dead weight, don't copy.)

### 0.2 Type scale (desktop vw-based; mobile ≤768px in parens)

| Class | Size | Line-height | Notes |
|---|---|---|---|
| `.headline` | **3.5vw** (7.5vw) | 100% | h1 + about stat numbers; stat numbers mobile 12.5vw |
| `.subheadline` | 2vw (5.5vw) | 100% | founder card names |
| `.big-description` | 1.5vw (4.5vw) | 100% | taglines, card titles, contact item titles; weight 300 |
| `.description` | 1vw (3.5vw) | normal | body/default |
| `.small-description` | 0.9vw (3.5vw) | normal | nav links, brand-card copy |
| `.at-description` | 1vw (3.5vw) | normal | wordmark |

No letter-spacing anywhere — the look is pure Helvetica Light at tight 100% leading with Medium spans for contrast.

### 0.3 Colors

| Token | Value | Role |
|---|---|---|
| page bg | `#020202` | body/html/#root |
| `.white` | `#fff` at opacity .975 | primary text |
| `.grey` | `#fff` at opacity .5 | secondary text (50% white — used constantly) |
| `.dark-grey` | `#000` at opacity .35 | secondary text on light imagery (Hof card only) |
| `.black` | `#111` | text on white buttons |
| card surface | `#0f1011` | every card/panel |
| card hover | `#151515` | services hover |
| hairline border | `hsla(0,0%,100%,.05)` 1px | every card/panel/nav |
| stronger border | `hsla(0,0%,100%,.1)` | hero pill (2px), circle buttons |
| glass | `hsla(0,0%,100%,.04)` + blur(5–8px) | nav, scroll-top |
| **accent** | **`#74b1c9`** (dusty blue) | ONLY the tiny eyebrow pill markers — nothing else on the whole site is colored |
| form divider | `hsla(0,0%,100%,.5)` (mobile .25) | contact input underlines — deliberately brighter than card hairlines |
| white surfaces | `#fff` | nav lang button, submit button, hover states |

Restraint is the signature: one desaturated accent, used at ~1vw size, 5 times total. Everything else is a white-opacity ladder on near-black.

### 0.4 Spacing rhythm

- **Every content section: `padding: 10vh 10vw`** (mobile `10vw`); carousels use `padding: 10vh 0` and inject `10vw`-equivalent edge spacers so cards bleed to the viewport edge while headers stay in the 80vw column.
- Hero: 100vh + `margin-bottom:10vh`. All other sections `height:fit-content` (overriding a global `section{height:100vh}` default; mobile default 200vw).
- Header→content gap inside a section: **5vh**; about uses 10vh.
- Micro gaps: 2.5vh (text stacks), 1.5vh (tight stacks), 1vh (label pairs), .5vw (icon+label rows).

### 0.5 Radii

| Element | Radius |
|---|---|
| cards / panels / sequence frame | **30px** (mobile 20px) |
| nav bar | 25px (mobile 15px) |
| nav white button | 15px (mobile 10px) |
| contact icon boxes | 10px |
| pills, carousel buttons, submit | 999px |
| circle buttons, icon chips | 100% |

### 0.6 The shared "textbox" header pattern (used by brands ×2, founders, services; sequence uses a vertical variant)

```
┌──────────────────────────────────────────────── 80vw ───────────────┐
│ ▬ Eyebrow Label            (row: #74b1c9 pill 1vw×1vh + .description grey)
│ Headline with one          ← .headline 3.5vw, 60% column
│ bold span.                                        Right-side descrip- │
│                                                   tion, 2–3 lines,    │
│                                                   .description grey,  │
│                                                   bottom-aligned      │
└──────────────────────────────────────────────────────────────────────┘
```
`.textbox{flex-row; align-items:flex-end; justify-content:space-between}`, left `.textbox-column{width:60%; gap:2.5vh}`. Mobile: stacks vertically, aligns start.

### 0.7 Motion language

All from `page-…js` / `layout-…js` (GSAP `c.ZP`, ScrollTrigger `l.Z`, SplitText `o.Z`):

- **Ease: `"sine"` for every entrance. Durations: 1.25 s** (text/cards), 1.5 s (about stats, hero right column), 0.75 s (nav), 0.5 s (scroll-top pill), 0.25–0.5 s CSS hovers, 1 s founders flip.
- **The universal scroll-entrance recipe** (every section repeats it verbatim):
  ```js
  setTimeout(() => {            // 1ms defer, then
    ScrollTrigger.refresh();
    // eyebrow row:   opacity 0→1, 1.25s sine, scrollTrigger {trigger: self, start: "top 95%"}
    // h1:            SplitText chars, stagger .015   (brands/services/contact/sequence)
    //                or SplitText words, stagger .03 (about/founders — the long statement blocks)
    // side descrip.: SplitText words, stagger .025, delay .25
    // content items: whole-element opacity fades, delays 0/.1/.2/(.3), duration 1.25–1.5s
  }, 1);
  ```
  Everything animates **opacity only** (`yPercent: 0` is set but never moves — no slide-ups anywhere). Elements start hidden via CSS utility `.opacity{opacity:0;will-change:opacity}`. Each effect re-runs on language toggle (`[language]` dep) and kills all ScrollTriggers on cleanup. An unused `.opacity-blur{opacity:0;filter:blur(8px)}` utility exists — they considered blur-in entrances and shipped plain fades.
- **No scrub, no pin, no parallax.** ScrollTrigger is used exclusively as an entrance gate (`start:"top 95%"`) plus one `onEnter/onLeaveBack` toggle for the scroll-top pill. The only continuous motion is the hero wrapper's procedural sine drift (see hero spec §3C) and the videos themselves.
- **Lenis**: `<ReactLenis root>` with defaults (lerp 0.1). Programmatic scrolls: hero CTA `scrollTo(target,{offset:0,duration:2.5})`; nav links `scrollTo(target,{offset:0})` (default duration).
- **Loader**: fixed `#020202` overlay, z 9999, pointer-events none, never unmounted. Wordmark = `.gradient-text` white shimmer (300%-wide gradient, backgroundPosition yoyo 2 s power1.inOut). Exit at t=0.5 s, 0.25 s sine fade; `onComplete` starts hero intro video. Full timing table in hero spec §4.
- **Nav behavior**: `gsap.set(yPercent:-150)` then at t=0.5 s slides down + fades in (0.75 s sine). Re-runs on language toggle. **No scroll state**: CSS declares transitions on background/height/backdrop-filter but no code ever changes them — the nav is identical glass at every scroll position. Scroll-top circle: `ScrollTrigger.create({trigger:".hero", start:"center top", onEnter: fade-in .5s, onLeaveBack: fade-out .5s})`, click → Lenis scroll to `#home`.
- **Language toggle** (nav right white pill): React context EN↔HE, swaps copy + `dir` + `.hebrew-font`/`.hebrew-row-reverse`, enabled after 3 s, debounced 3 s per click. (Azen: this slot becomes the CTA button.)

### 0.8 Media inventory (HEAD/range-verified)

| Asset | Dimensions | Size | Where |
|---|---|---|---|
| `/videos/clip.webm` | 3840×2160, 7.04 s VP9 | 2.29 MB | hero intro (plays once) |
| `/videos/clip4.webm` | 1920×1080, 4.51 s VP9 | 0.50 MB | hero ambient loop |
| `/videos/clip5.MP4` | 1280×1280, 10 s H.264 | 2.88 MB | sequence forward leg |
| `/videos/clip5-reversed.MP4` | 1280×1280, 10 s | 1.01 MB | sequence reverse leg |
| `/images/wearyourhalo.webp` | 805×415 | 12 KB | brand card logo |
| `/images/olwite.webp` | 950×275 | 16 KB | brand card logo |
| `/images/hardcore.webp` | 493×493 | 28 KB | brand card logo |
| `/svgs/nitroden.svg` + 7 techstack SVGs | vector | 1–3 KB each | brand/techstack cards |
| `/images/hof.webp` | 1920×2720 | 127 KB | founder photo (B&W, light bg) |
| `/images/zur4.webp` | 1920×2400 | 89 KB | founder photo (B&W, dark bg) |

All card images are `<link rel="preload" as="image">` in head. Founder images are `next/image` with `width/height=1000`, lazy, unoptimized paths. Head quirk: OG image URL still points at `http://localhost:3000/...` — build leftover, don't copy.

---

## 1. Hero (`section.hero#home`)

**Fully specified in `docs/research/berco-hero-spec.md`** — layout map (§1), video inventory (§2), playback logic (§3), timing table (§4), azen replication recipe (§5). Summary for context:

- 100vh; centered 60%×60% video wrapper behind text (z 0 vs 1) with 4 gradient fade divs vignetting it into `#020202`; a pre-rendered 3D chip: 7 s 4K intro plays once, then a 1080p ambient loop is revealed at t=7.8 s by a 0.1 s opacity cut (pure clock choreography). The whole wrapper drifts ±5 px / ±1° on incommensurate sine periods forever — the "not-a-video" illusion.
- Copy (quoted): h1 `"Empowering / **eCommerce** / with Bold / Solutions"` (bold = Medium span); CTA row `"Explore Our Solutions"` + 2.5vw circle arrow button (hover: white bg, black icon) → Lenis-scrolls to `#services`; bottom-left label `"Products & Services"` + tagline `"Strategic investments. Innovative / solutions. Unmatched growth opportunities."`; right column (pushed down 40vh): outlined pill `"Fintech"` + `"The Future Of eCommerce, / Delivered Today"`.
- Layout: left column 57.5%, right 42.5% align-end; content padding `25vh 10vw 5vh`. Mobile: right column hidden, hero 195vw tall, video `object-fit:cover` at 100%×45%.
- Entrance: loader exit 0.5→0.75 s; h1 chars stagger .015 from 0.6 s; everything else opacity fades at 0.8/0.9/1.0/1.1 s; nav drops in at 0.5 s.

---

## 2. About (`section.about#about`) — statement + stat band

```
┌────────────────────────── 80vw ──────────────────────────┐
│  At Berco Inc. we redefine **innovation** by empowering   │  h1 3.5vw, full width,
│  businesses to reach their full potential. From           │  3 bold spans
│  **transformative** eCommerce strategies to cutting-      │
│  edge SaaS **solutions,** we're your partner in growth.   │
│                       (gap 10vh)                          │
│  (icon) Conversions   │  (icon) Ecommerce   │ ...  │ ...  │  4 items, width 20% each,
│  7,000+               │  2018               │ 30+  │ 100M+│  3 hairline dividers 1px×15vh
└───────────────────────────────────────────────────────────┘
```

- Copy (quoted): headline above; stats: `"Conversions"→"7,000+"`, `"Ecommerce Since"→"2018"`, `"Partnered Brands"→"30+"`, `"Global Impressions / Generated Annually"→"100M+"`.
- Each stat: row of icon chip (2.5vw circle, `#0f1011` + hairline, lucide icon 1vw: trending-up / shopping-cart / users / globe) + grey label; below, the number as `h2.headline` (3.5vw — same size as h1s; the numbers ARE the typography). Items centered in their 20% column; content left-aligned within.
- No card backgrounds on desktop — floating on page black. **Mobile**: each stat becomes an 80vw `#0f1011` card (radius 10, padding 5vw); dividers hidden; number 12.5vw.
- Numbers are static text — **no count-up animation**.
- Motion (component `T`): h1 SplitText **words** stagger .03 (not chars — word-fade suits the long statement); stats fade 1.5 s with delays 0/.1/.2/.3; all `start:"top 95%"`, sine.

---

## 3. Brands #1 — "Our Partners" (`section.brands#brands`)

```
├─ textbox (80vw): ▬ Our Partners / "Where **vision** / Meets Execution."
│                              right: "Innovative brands we've partnered with, / built, and propelled to success."
└─ full-bleed Embla carousel  [pad 9.5vw][card 20vw][card][card][card][pad 9.5vw]   gap .5vw
   └─ centered under it: ‹ › round buttons (2.25vw, #0f1011, disabled at ends: opacity .5)
```

- Card anatomy (`.brands-item`, 20vw × 52.5vh, `#0f1011`, hairline border, radius 30, padding 2vw, `cursor:pointer`):
  - Logo image absolutely centered at `top:40%`, width 80% (`object-fit:contain`), with a **4-direction gradient vignette** (`:before` layering 4 linear-gradients from transparent 70% → `#0f1011`) melting the logo into the card — same trick-family as the hero fades.
  - Bottom row: left column = brand name (`.small-description grey`) over 2-line description (`.small-description white`) — note the inversion: name is dim, description bright; right = 2.25vw circle outline button with lucide-plus.
  - Hover: card `brightness(1.1)`; plus icon rotates 45°; button bg white 2.5%. All 0.25–0.5 s ease. (Cards are not links — hover is pure affordance theater.)
- Cards (quoted): `Wear Your Halo — "Faith-inspired jewelry / with timeless elegance."`, `Olwite — "Pure style, all / white, always right."`, `Hardcore — "Redefining menswear / with style and comfort."`, `NitroDen — "Revolutionizing eCommerce / with stunning storefronts."`
- Embla config: `useEmblaCarousel({ dragFree: true })` — free-momentum drag, no loop, no autoplay. Buttons drive `scrollPrev/Next`; disabled states from `canScrollPrev/Next` on `select`/`reInit`.
- Motion (component `b`): eyebrow fade → h1 chars .015 → right description words .025 (+.25 delay) → **whole carousel wrapper fades as one** (no per-card stagger), all 1.25 s sine `top 95%`.
- Mobile: cards 77.5vw × 100vw, edge pads 7.5vw, hover effects neutralized.

---

## 4. Founders (`section.founders`) — giant flip cards

```
├─ textbox: ▬ Founders / "Meet the Founders"     right: "Unlock the potential of your business / with strategies..."
└─ row, space-between:
   ┌───── 39.5vw × 39.5vw ─────┐   ┌───── 39.5vw × 39.5vw ─────┐    two SQUARE cards ≈ each
   │  B&W founder photo (top)  │   │                           │    half the content width
   │                           │   │                           │
   │  Hof Coral      (2vw)     │   │  Zur Berman               │
   │  Co-Founder & CEO    (+)  │   │  Co-Founder & CEO    (+)  │    (+) = 3.5vw glass circle
   └───────────────────────────┘   └───────────────────────────┘
```

- Card material recipe (both faces): `#0f1011`, radius 30, padding 5vw, inset 1px ring (`box-shadow: inset 0 0 0 1px` white 5%), plus a **radial sheen**: `radial-gradient(140% 107% at 50% 10%, transparent 40%, white.05 75%, white.075 100%)` — subtle top-lit vignette.
- Front: photo absolute at top (full width, contain); name `.subheadline` (2vw) + role `.description` at bottom; glass plus-circle bottom-right. **Adaptive text color per photo**: Hof (light photo) gets `black`/`dark-grey` text; Zur (dark photo) gets `white`/`grey` — copy this rule, not the values.
- Hover (front): card brightness 1.1; plus-circle → solid white, icon rotates 90° to black.
- **Flip**: click toggles React state → `.flipped` class → `transform: rotateX(180deg)` on the inner wrapper; `transition: transform 1s ease`, `perspective: 5000px`, both faces `backface-visibility:hidden`, back face pre-rotated `rotateX(180deg)`. It flips **vertically** (X-axis), not the usual Y.
- Back: name+role at top, bio paragraph (`.description white`) below, atop a **faint 4vw×4vw grid** (1px white-5% lines, masked so it fades out at all four edges: `mask-image` 2× linear-gradients composited `intersect`).
- Bios (quoted, abridged): Hof `"I'm Hof, a tech-driven entrepreneur and strategist with nearly eight years of programming experience…"`; Zur `"I'm Zur Berman, an expert in the world of eCommerce…"`.
- Motion (component `U`): h1 words .03; cards fade with delay 0 / .2 (second card delay dropped to 0 on mobile via `window.innerWidth <= 768` state).
- Mobile: cards stack, 80vw × 100vw, radius 20.

---

## 5. Services (`section.services#services`) — 6-card grid

```
├─ textbox: ▬ Our Services / "Empower **business** / growth and innovation"
│           right: "Unlock the potential of your business / with strategies and solutions that drive / growth, innovation, and success."
└─ flex-wrap, gap 1vw:  [26vw × 37.5vh] ×3 per row, ×2 rows   (3×26 + 2×1 = 80vw exactly)
   card: ┌────────────────────────┐
         │ Title (1.5vw)   (icon) │   .services-item-row: space-between, icon 1.25vw stroke-1
         │                        │
         │ Grey description (1vw) │   column space-between pushes desc to bottom
         └────────────────────────┘
```

- Cards (quoted): `Strategic Investments` (handshake) `"Providing strategic mentorship to / help businesses thrive."` · `eCommerce Excellence` (laptop) `"Building scalable platforms to dominate / the digital space."` · `SaaS Solutions` (server) `"Designing tools that redefine how businesses operate."` · `Data-Driven Insights` (bar-chart) `"Leveraging analytics and AI to guide smarter decisions and optimize performance."` · `Brand Amplification` (megaphone) `"Creating bold strategies to maximize visibility and engagement globally."` · `Innovation Incubation` (lightbulb) `"Partnering with visionary founders to launch disruptive products and solutions."`
- **Hover is the section's signature**: `background #151515; transform: scale(1.05); box-shadow: 0 0 5vw hsla(0,0%,100%,.1); z-index:2` over 0.5 s ease — the card physically swells and glows over its neighbors.
- Motion (component `D`): eyebrow fade; h1 chars .015; description words .025+.25; cards fade 1.25 s with delays 0/.1/.2 then 0/.1/.2 (row-wise ripple).
- Mobile: desktop grid `display:none`; a **duplicate DOM carousel** (`hide-on-desktop`, Embla `{slidesToScroll:1, watchDrag:true}`, cards 70vw × 65vw) with ‹ › buttons below. Quirk: the mobile duplicates use *different* lucide icons (wallet/plane/zap/tag/sparkle/square-stack) and one divergent copy line ("Providing capital and mentorship…") — sloppy duplication, don't replicate; render one data source.

---

## 6. Brands #2 — "Our Techstack" (`section.brands#brands` again)

Identical component and geometry to §3 with different data — build once, pass props.

- Header (quoted): ▬ `Our Techstack` / h1 `"The Techstack / We Use Everyday."` / right description **reused verbatim** from §3 (`"Innovative brands we've partnered with…"` — copy-paste artifact; azen should write a proper line).
- 7 logo cards, all SVG logos: `Shopify — "Powerful platform for / online stores."` · `Meta — "Connecting people / through digital platforms."` · `Slack — "Streamlined communication / for modern teams."` · `Monday.com — "Work management made / effortlessly organized."` · `Figma — "Collaborative design for / creative teams."` (has `-small` modifier: image 55% width instead of 80%) · `FireFlies.ai — "AI-powered meeting / transcription and insights."` · `Github — "Code collaboration for / developers worldwide."`
- Duplicate `id="brands"` in the DOM (invalid HTML; nav "Brands" link always hits §3). Azen: give it its own id (`#stack` / `#integrations`).

---

## 7. Sequence (`section.sequence`) — "Our Mindset" split panel

The only section whose content sits INSIDE a drawn frame:

```
┌──────────────── 80vw, radius 30, hairline border, inset glow ────────────────┐
│  ▬ Our Mindset                                 ┊  ┌────────────────────┐     │
│  Empower **growth**                            ┊  │   ping-pong video   │     │
│  for businesses                                ┊  │   (square, 55% col) │     │
│  **worldwide** today.                          ┊  │   4 fade divs       │     │
│  "From innovative algorithms to seamless       ┊  └────────────────────┘     │
│   automation, we craft solutions that turn     ┊                             │
│   challenges into opportunities with tech."    ┊         text col 45%        │
└──────────────────────────────────────────────────────────────────────────────┘
```

- Frame: `.sequence-content-outside` — border 1px white-5%, radius 30, `padding: 0 5vw`, plus overlay div carrying `box-shadow: inset 0 0 2.5vw hsla(0,0%,100%,.05)` — an inner glow that makes the frame read as backlit glass.
- Right 55%: two stacked square videos (clip5 forward / clip5-reversed) with the same 4 fade divs as the hero, melting the render into the panel. Berco's render: the chip exploding into layers, then reassembling — a 20 s pendulum.
- **Ping-pong mechanics** (component `q`; full analysis hero-spec §3B): forward autoplays; on `ended` → swap `display` to reversed + `.play()`; reversed `ended` → swap back. Two files because HTML5 video can't play backwards; frame 300 of fwd = frame 1 of rev so the cut is invisible.
- Motion: eyebrow fade, h1 chars .015, description words .025+.25 — standard recipe.
- Mobile: frame stacks vertically (`padding:7.5vw 7.5vw 0`), video full width below text.

---

## 8. Contact (`section.contact#contact`) — contact + form, doubles as footer

```
┌── left 30%, 80vh, space-between ──┐  ┌────────── right 70%, 80vh, #0f1011 card r30 ─────────┐
│ (icon) Chat to us                 │  │  Got ideas? We've got                                  │
│        Our friendly team is here… │  │  the skills. Let's team up.        (h1 3.5vw)         │
│        admin@berco-inc.com        │  │  "Tell us more about yourself and what you have       │
│ (icon) Visit us                   │  │   got in mind."                                        │
│        Come say hello at our HQ.  │  │                                                        │
│        Cooper City, Florida USA   │  │  Your Name                    ← input, no box,        │
│ (icon) Call us                    │  │  ───────────────────────────    1px underline @50%    │
│        Mon-Fri from 8am to 5pm    │  │  Position at Company                                   │
│        (954) 599-9975             │  │  ───────────────────────────                           │
│                                   │  │  Tell Us a Little About The Project                    │
│ © 2025 Berco Inc. All Rights      │  │  ───────────────────────────                           │
│   Reserved          ← the footer  │  │  (         Let's get started         ) ← white pill   │
└───────────────────────────────────┘  └────────────────────────────────────────────────────────┘
```

- Left items: 3.5vw icon box (radius 10, `#0f1011`, hairline; lucide message-circle / compass / phone-call) + column of `big-description white` title, grey line, grey value. Copy quoted above.
- Right card: `padding:10vh 5vw`, column space-between. Inputs are transparent/borderless (`.contact-input`) — the **1px dividers at 50% white** under each are the visible structure (brighter than every other hairline on the site, on purpose). Placeholders quoted in diagram.
- Submit = **`mailto:` link** — builds `mailto:admin@berco-inc.com?subject=Let's Collaborate&body=Name:…%0D%0AEmail:…` from state and sets `window.location.href`. No backend, no validation. Quirk: state tracks an `email` field but **no email input is rendered** — the mailto body always ships `Email: ` empty. (Azen: use a real endpoint or Calendly instead.)
- Motion (component `z`): h1 chars .015 (+`gsap.set` opacity dance to avoid FOUC), description fade +.25; left items 0/.1/.2; inputs+button all delay 0. Cleanup references an undefined `descriptionSplit` — a latent bug that silently throws on unmount; don't copy.
- Mobile: `flex-direction: column-reverse` — form card first, contact items + copyright below (footer stays last).

---

## 9. Azen mapping table

Azen raw material: 6 case studies w/ metrics, 4 services, scope-tier pricing (no numbers), FAQ, founder Tayyib Arbab note+photo, integrations logos, Calendly CTA (`https://calendly.com/tayyib-azen/30min`), wordmark **"azen."** with blue period, accent `#0071e3`.

| Berco slot | Azen fill |
|---|---|
| **Global accent** `#74b1c9` eyebrow pills | `#0071e3` pills — same 1vw×1vh size, same restraint (eyebrows + the wordmark period ONLY) |
| **Nav** "BERCO INC" + About/Brands/Services/Contact + white "Hebrew" pill | "azen." wordmark (blue period; skip the custom 'at' font or use azen's own display face) + Work/Services/About/Contact links + white pill **"Book a call"** → Calendly (replaces language toggle; drop the 3 s debounce) |
| **Loader** "Berco Inc." shimmer | "azen." shimmer — identical gradient-text recipe; period stays `#0071e3` inside the gradient clip |
| **1. Hero** chip video + "Empowering eCommerce with Bold Solutions" + "Fintech" pill | Azen hero render (own intro+loop per hero-spec §5). H1 pattern "X **bold** / plain / plain": e.g. "Autonomous **AI Systems** / Built for / Operations". Pill: "AI Infrastructure". CTA row → "Explore Our Systems" scrolling to services; right tagline: azen one-liner. CTA circle can ALSO deep-link Calendly — but berco's pattern is scroll-first, book-last |
| **2. About** statement + 7,000+/2018/30+/100M+ | Azen statement headline (bold spans on "autonomous", "infrastructure", "outcomes") + **metrics band is a gift — 4 slots, azen has real numbers**: `85% — Fewer Order Errors (Prep Point)` · `78% — Calls Resolved by AI (Superior Accounting)` · `90% — Faster Sourcing (TTT)` · `24/7 — Autonomous CRM (Little Oaks)`. Icons: lucide bot / phone / search / clock |
| **3. Brands #1** partner cards (logo + 2-liner + plus) | **Case-study carousel**: 6 cards (Prep Point, Superior Accounting, TTT, Little Oaks, Zia Ul Ummah, Azen EYOS). Name grey / outcome white ("85% fewer order errors." etc.). Centered client logo or a metric numeral as the "image" with the same 4-way vignette. Plus button → case-study link or flip. 6 cards justifies the carousel better than berco's 4 |
| **4. Founders** two flip squares | **Founder section, adapted for one person**: keep the two-square geometry — card A = Tayyib photo (B&W like berco's; pick text color by photo brightness), flips to bio; card B = the **founder note** as a typographic card (letter text on the masked-grid back-face style, signature at bottom) — no flip needed, or flip to photo. Eyebrow: "Founder" |
| **5. Services** 6 cards, 3×2 | Azen has **4**: Autonomous Agents / System Orchestration / Enterprise Retrieval / Optimization & Integration. Options: (a) 2×2 at 39.5vw × 30vh (matches founders width rhythm — recommended), or (b) keep 26vw and add 2 cards (e.g. "Voice Systems", "Managed Ops"). Keep hover scale 1.05 + glow verbatim — it's the section's identity. One data source; don't fork mobile copy/icons like berco did |
| **6. Brands #2** techstack logos | **Integrations logos — 1:1 mapping.** Eyebrow "Integrations", h1 "The Stack / We Deploy Every Day.", write a fresh right-side description (berco reused §3's by mistake). SVG logos, preloaded, `-small` modifier for wide marks |
| **7. Sequence** "Our Mindset" + exploding chip | Azen mindset/process panel: eyebrow "Our Mindset" or "How We Build", h1 "Systems that **run** / your operations / **while you** sleep." + azen's own ping-pong render (assemble/disassemble of azen's hero object; recipe in hero-spec §5.1/§5.4) |
| **8. Contact** info + mailto form | Same layout. Left: azen email / location / hours. Right card: keep the underlined inputs but submit → real endpoint; make the white pill **"Book a call"** → Calendly (mailto fallback). Copyright "© 2026 Azen. All Rights Reserved" stays bottom-left |

**Sections azen needs that berco lacks** — slot them in berco's language so the seams don't show:

| New section | Where in the flow | Berco-style treatment |
|---|---|---|
| **Pricing (scope tiers, no numbers)** | Between **services (5)** and **integrations (6)** — capability → engagement model reads naturally | 3 cards in services-card material (26vw, #0f1011, r30, hover swell). Tier name as `big-description`, scope bullets as grey `description` rows separated by contact-style dividers; middle tier gets the 2px white-10% pill border as "featured". Eyebrow: ▬ Engagement |
| **FAQ** | Between **sequence (7)** and **contact (8)** — objections handled right before the ask | Full-width rows in the 80vw column: question as `big-description white`, 1px white-10% divider between rows (about-divider language, horizontal), plus-circle rotating 45° on open (brands-button language). Answer reveals with the standard 1.25 s sine fade. Eyebrow: ▬ FAQ |
| **Testimonials** | Don't add a section — berco has no testimonial pattern. Put pull-quotes on case-study card backs (founders flip-back pattern: masked grid + quote) or one quote line inside case cards | Reuses flip + grid-back language; keeps section count at berco's rhythm |
| **Founder note** | Already covered by §4 mapping | — |

Resulting azen flow: nav / loader / hero / about+metrics / case-study carousel / founder / services / **pricing** / integrations / mindset-sequence / **FAQ** / contact. Ten sections, two of them new, all in berco's material system.

---

## 10. Build order (for builders)

1. **Global shell**: `#020202` body, hidden scrollbars, type classes (`.headline` 3.5vw etc.), color utilities (`.white/.grey/.opacity`), Lenis root, section padding rhythm. Fonts: azen equivalents of Helvetica Light/Medium + Inter (or keep exactly these; hero-spec §5 footnote).
2. **Shared components**: textbox header (eyebrow pill `#0071e3` + h1 + right description), card material (`#0f1011` + hairline + r30 + radial sheen), circle/pill buttons, 4-fade vignette block, carousel buttons + Embla hook (`dragFree`), the ScrollTrigger entrance recipe as one reusable helper (chars/.015, words/.03, items 0/.1/.2 delays, `top 95%`, sine 1.25 s).
3. **Nav + loader**: glass bar, yPercent drop-in, shimmer loader, scroll-top pill w/ hero trigger. Cheap, unblocks the page frame.
4. **Hero — riskiest, start its asset pipeline first**: needs azen's intro+loop renders mastered before integration (hero-spec §5 steps 1–3: 4K intro ≈2.5 Mbps VP9, 1080p loop ≈0.9 Mbps, `ended`-based swap instead of berco's 7.8 s clock, procedural drift, reduced-motion fallback). Everything else on the page is buildable while renders are in flight.
5. **About + metrics band** (pure layout, real azen numbers — quick win, high trust value).
6. **Case-study carousel** (brands component; build once, reuse for integrations in step 8).
7. **Services grid** incl. hover swell; decide 2×2 vs 3×2 here.
8. **Integrations carousel** (data pass on the step-6 component; collect SVG logos early).
9. **Founder cards** (flip mechanics + adaptive text color; needs Tayyib photo — B&W treatment).
10. **Pricing + FAQ** (new sections in berco language, per §9 table).
11. **Sequence panel** — second-riskiest (needs the ping-pong render pair; wire `ended` swap per hero-spec §3B/§5.4; lazy-load with IntersectionObserver, don't `preload="auto"` 4 MB below the fold like berco).
12. **Contact/footer** (form → real endpoint or Calendly; keep mailto only as fallback).
13. **Motion + mobile pass**: apply the entrance recipe everywhere, then the ≤768px sheet (mobile is a separate design: stat cards, services carousel, hero 195vw/cover, column-reverse contact). Add `prefers-reduced-motion` guards berco skipped.

**Risk ranking**: hero video choreography > sequence render pair > flip-card cross-browser (backface-visibility on Safari) > Embla edge-padding parity > everything else (static flex/grid).
