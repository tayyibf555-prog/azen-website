/* ==========================================================
   Entrance engine — berco motion language (spec §0.7) rebuilt
   on anime.js v4, plus the shared Embla carousel factory.
   ----------------------------------------------------------
   Opacity-ONLY entrances, sine ease, 1.25s (1.5s stats/hero
   right column), triggered at the "top 95%" equivalent.
   No slide-ups, no scrub, no pin, no parallax, no Lenis.

   Progressive: content hides ONLY behind html.fx, which this
   module adds at runtime. If it never loads, everything is
   visible. Reduced motion: fx is never added, entrances
   collapse to visible; carousels stay draggable (§10.13).

     [data-fx="fade"]       whole-element fade, 1.25s
     [data-fx="fade-slow"]  whole-element fade, 1.5s
     [data-fx="chars"]      splitText chars, stagger .015
     [data-fx="words"]      splitText words, stagger .03
     [data-fx="desc"]       side descriptions, words .025 +0.25s
     [data-fx-delay]        extra delay in seconds (0/.1/.2…)
     [data-hero]            timed off the loader's azen:reveal,
                            not scroll (spec §1 entrance table)
   ========================================================== */
import { animate, onScroll, stagger, utils, splitText } from 'animejs';
import EmblaCarousel from 'embla-carousel';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const EASE = 'outSine';

/* ── Carousel factory — case studies, integrations, services(mobile) ── */
const makeCarousel = (root, opts) => {
  if (!root) return null;
  const viewport = root.querySelector('.carousel-viewport');
  const container = viewport && (viewport.querySelector('.carousel-container') || viewport.querySelector('.carousel-track'));
  if (!viewport || !container) return null;
  viewport.classList.add('is-embla');
  const api = EmblaCarousel(viewport, Object.assign({ dragFree: true, container }, opts || {}));
  const prev = root.querySelector('.carousel-prev');
  const next = root.querySelector('.carousel-next');
  const update = () => {
    if (prev) prev.disabled = !api.canScrollPrev();
    if (next) next.disabled = !api.canScrollNext();
  };
  if (prev) prev.addEventListener('click', () => api.scrollPrev());
  if (next) next.addEventListener('click', () => api.scrollNext());
  api.on('select', update).on('reInit', update);
  update();
  return api;
};

const setupCarousels = () => {
  // SANCTIONED exposure (work-board-spec v4): work-filter.js needs the
  // Embla api to reInit() after it toggles [hidden] on filtered slides.
  window.__azenWork = makeCarousel(document.getElementById('work'));
  makeCarousel(document.getElementById('stack'));
  // Services: one data source; Embla is active on mobile only (brief §2.6).
  // Embla's own breakpoint watcher handles activation across resizes.
  makeCarousel(document.getElementById('services'), {
    breakpoints: { '(min-width: 769px)': { active: false } },
  });
};

/* ── Scroll entrances (the §0.7 recipe, one reusable pass) ── */
const gate = (el) => onScroll({ target: el, enter: '95% top', repeat: false });

const scrollEntrances = () => {
  document.querySelectorAll('[data-fx]').forEach((el) => {
    const kind = el.dataset.fx;
    const delay = (parseFloat(el.dataset.fxDelay || '0') || 0) * 1000;
    if (kind === 'fade' || kind === 'fade-slow') {
      animate(el, {
        opacity: [0, 1],
        duration: kind === 'fade-slow' ? 1500 : 1250,
        delay,
        ease: EASE,
        autoplay: gate(el),
      });
    } else if (kind === 'chars') {
      const s = splitText(el, { chars: true });
      animate(s.chars, {
        opacity: [0, 1],
        duration: 1250,
        ease: EASE,
        delay: stagger(15, { start: delay }),
        autoplay: gate(el),
      });
    } else if (kind === 'words') {
      const s = splitText(el, { words: true });
      animate(s.words, {
        opacity: [0, 1],
        duration: 1250,
        ease: EASE,
        delay: stagger(30, { start: delay }),
        autoplay: gate(el),
      });
    } else if (kind === 'desc') {
      const s = splitText(el, { words: true });
      animate(s.words, {
        opacity: [0, 1],
        duration: 1250,
        ease: EASE,
        delay: stagger(25, { start: 250 + delay }),
        autoplay: gate(el),
      });
    }
  });
};

/* ── Hero sequence — clock choreography off azen:reveal ──
   Loader exits at t=0.5s; h1 chars start ≈0.6s (+0.1s after
   reveal); the rest fades at +0.3/+0.4/+0.5/+0.6 (spec §1). */
const heroSequence = () => {
  const run = () => {
    const h1 = document.querySelector('[data-hero="chars"]');
    if (h1) {
      const s = splitText(h1, { chars: true });
      utils.set(s.chars, { opacity: 0 });
      utils.set(h1, { opacity: 1 });
      animate(s.chars, {
        opacity: [0, 1],
        duration: 1250,
        ease: EASE,
        delay: stagger(15, { start: 100 }),
      });
    }
    document.querySelectorAll('[data-hero="fade"], [data-hero="fade-slow"]').forEach((el) => {
      const slow = el.dataset.hero === 'fade-slow';
      animate(el, {
        opacity: [0, 1],
        duration: slow ? 1500 : 1250,
        ease: EASE,
        delay: (parseFloat(el.dataset.heroDelay || '0') || 0) * 1000,
      });
    });
  };
  if (window.__azenRevealed) run();
  else window.addEventListener('azen:reveal', run, { once: true });
};

const boot = () => {
  setupCarousels(); // always — draggable under reduced motion too
  if (reduceMotion) return;
  document.documentElement.classList.add('fx');
  heroSequence();
  scrollEntrances();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
