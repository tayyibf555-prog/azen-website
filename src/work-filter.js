/* ==========================================================
   Work filter — search + category chips over the #work
   case-study carousel (build contract v4: docs/research/
   work-board-spec.md). Purely additive: the carousel markup,
   Embla wiring, and card content are untouched. This module
   only toggles [hidden] on the six .case-card slides (they
   sit in a flex track, so hidden slides collapse cleanly)
   and asks Embla to reInit() after the visible set changes.
   ----------------------------------------------------------
   Debug hook: window.__azenFilter = { apply(cat, q) } lets a
   headless harness drive the predicate directly and read back
   the shown count, without simulating input/click events.
   ========================================================== */

const root = document.querySelector('.work-filter');
const work = document.getElementById('work');

if (root && work) {
  const input = root.querySelector('#wf-q');
  const chips = Array.from(root.querySelectorAll('.wf-chip'));
  const count = root.querySelector('.wf-count');
  const empty = work.querySelector('.wf-empty');
  const clearBtn = empty && empty.querySelector('.wf-clear');

  // Single read pass: cache each slide's tags + searchable text once so
  // every apply() afterward is pure computation + one write pass — no
  // interleaved read/write layout thrash while the user types.
  const cards = Array.from(work.querySelectorAll('.carousel-container > .case-card')).map((el) => {
    const tags = (el.dataset.tags || '').split(/\s+/).filter(Boolean);
    const name = el.querySelector('.case-foot-copy .small-description.grey');
    const descriptor = el.querySelector('.case-foot-copy .small-description.white');
    const text = `${name ? name.textContent : ''} ${descriptor ? descriptor.textContent : ''}`.toLowerCase();
    return { el, tags, text };
  });

  const TOTAL = cards.length;

  // The predicate (build contract v4): a card shows iff the category
  // matches (or "all") AND the query is empty or found in name+descriptor.
  const predicate = (cat, q, tags, text) =>
    (cat === 'all' || tags.includes(cat)) && (q === '' || text.includes(q));

  let activeCat = 'all';

  const apply = (cat, rawQuery) => {
    const raw = rawQuery || '';
    activeCat = cat;
    if (input) input.value = raw;
    const q = raw.trim().toLowerCase();

    // Read/compute phase — no DOM writes yet.
    let shown = 0;
    const results = cards.map((card) => {
      const isMatch = predicate(activeCat, q, card.tags, card.text);
      if (isMatch) shown += 1;
      return [card.el, isMatch];
    });

    // Write phase — batched.
    results.forEach(([el, isMatch]) => { el.hidden = !isMatch; });

    chips.forEach((chip) => {
      const on = chip.dataset.cat === activeCat;
      chip.classList.toggle('is-active', on);
      chip.setAttribute('aria-pressed', String(on));
    });

    if (count) {
      count.textContent = (activeCat === 'all' && q === '') ? '' : `${shown} of ${TOTAL} systems`;
    }

    if (empty) empty.hidden = shown !== 0;

    window.__azenWork?.reInit();

    return shown;
  };

  let debounceId = null;
  if (input) {
    input.addEventListener('input', () => {
      clearTimeout(debounceId);
      debounceId = setTimeout(() => apply(activeCat, input.value), 120);
    });
  }

  chips.forEach((chip) => {
    chip.addEventListener('click', () => apply(chip.dataset.cat, input ? input.value : ''));
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => apply('all', ''));
  }

  apply('all', '');

  // Headless verify hook (build contract v4 §Verify).
  window.__azenFilter = { apply: (cat, q) => apply(cat, q || '') };
}
