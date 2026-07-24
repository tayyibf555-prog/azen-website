# Work section — search + filters (build contract v4; board & helix retired)

The shipped #work carousel stays EXACTLY as it is. This is an ADDITIVE feature:
a search input + category filter chips between the section header and the
carousel, live-filtering which case cards show. Deviations require a flagged
report.

## UI (inside #work, after the existing header block, before the carousel)
```html
<div class="work-filter" role="search">
  <input class="wf-input description" type="search" id="wf-q"
         placeholder="Search systems…" aria-label="Search case studies">
  <div class="wf-chips" role="group" aria-label="Filter by category">
    <button class="wf-chip small-description is-active" type="button"
            data-cat="all" aria-pressed="true">All</button>
    <button class="wf-chip small-description" type="button" data-cat="operations" aria-pressed="false">Operations</button>
    <button class="wf-chip small-description" type="button" data-cat="accounting" aria-pressed="false">Accounting</button>
    <button class="wf-chip small-description" type="button" data-cat="education" aria-pressed="false">Education</button>
    <button class="wf-chip small-description" type="button" data-cat="community" aria-pressed="false">Community</button>
    <button class="wf-chip small-description" type="button" data-cat="product" aria-pressed="false">Product</button>
  </div>
  <span class="wf-count small-description grey" aria-live="polite"></span>
</div>
<div class="wf-empty description grey" hidden>
  No systems match. <button class="wf-clear small-description white" type="button">Clear filters</button>
</div>
```

## Card tagging (additive attribute on each existing case card's slide)
Add data-tags to the six cards (on the SLIDE wrapper element the carousel
lays out — inspect the shipped markup and pick the element whose hiding
removes the slide cleanly):
- Prep Point → "operations"
- Superior Accounting → "accounting"
- TTT Departmentals → "operations"
- Little Oaks → "education"
- Zia Ul Ummah → "community"
- Azen EYOS → "education product"
No other card markup changes. Flip behavior, links, copy untouched.

## Behavior (new src/work-filter.js, vanilla)
- State: one active category (chips single-select; "All" default) + query
  string. A card shows iff (cat === all || tags.includes(cat)) AND
  (query empty || (name + descriptor).toLowerCase().includes(query.trim().toLowerCase())).
- On change: toggle [hidden] on non-matching slides, update aria-pressed +
  .is-active, set .wf-count to "N of 6 systems" (empty query + All → clear
  the count text), show .wf-empty when zero match; .wf-clear resets both.
- Debounce input 120ms. No layout thrash: batch reads before writes.
- Embla relayout: after visibility changes call the work carousel's reInit().
  SANCTIONED minimal enhance.js edit (the only one): in setupCarousels,
  capture the work api and expose `window.__azenWork = api` (null-safe).
  work-filter.js calls window.__azenWork?.reInit(). If the api is absent
  (reduced-carousel environments) the filter still works — slides are in a
  flex track; hidden slides collapse.
- Keyboard: chips are real buttons; input type=search (native clear). Focus
  styles come from the global :focus-visible.
- Reduced motion: no special handling needed (no animation added; the
  carousel's own behavior is unchanged).
- Debug hook: window.__azenFilter = { apply(cat, q) } for headless verify.

## Look (marked CSS block `/* ==== work filter ==== */` in styles.input.css)
- .work-filter: flex row, gap 1vw, align center, margin-top 3vh; wraps.
- .wf-input: glass pill — background var(--glass), inset hairline, radius
  999px, padding ~0.7vw 1.4vw, color var(--white), ::placeholder var(--grey),
  width ~22vw desktop / 100% mobile; focus = hairline-strong.
- .wf-chip: pill outline — transparent bg, inset hairline, radius 999px,
  padding ~0.5vw 1.1vw, grey; .is-active = color var(--white) + inset ring
  rgba(0,113,227,.55). Hover = hairline-strong.
- .wf-empty: margin-top 2vh; .wf-clear underlined on hover.
- Mobile ≤768: .work-filter wraps, input full-width, chips horizontal-scroll
  row (overflow-x auto, no scrollbar) — same hidden-scrollbar idiom as the
  page.
- vw idiom, tokens only, no edits above the marker.

## Scope & hygiene
- index.html: the filter/empty markup + data-tags + script tag
  <script type="module" src="/src/work-filter.js"> near the other modules;
  NOTHING else in #work changes (diff must show the carousel untouched).
- enhance.js: ONLY the __azenWork exposure line(s).
- Tailwind rebuild; buster v=20260719e in ALL 8 html files.
- npm run build must pass.

## Verify (report outputs)
- Build OK; buster ×8; carousel markup unchanged vs HEAD apart from
  data-tags (show the #work diff hunks); 6 data-tags present; enhance.js
  diff = only the exposure; work-filter.js vanilla + syntax-OK; headless
  logic table: apply('all','') → 6, apply('education','') → 2,
  apply('operations','') → 2, apply('accounting','') → 1,
  apply('all','eyos') → 1, apply('community','oaks') → 0 (+ empty state
  visible). Paste the filter predicate + the reInit call site.
