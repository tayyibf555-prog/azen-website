/* ==========================================================
   anime.js (v4) scroll choreography — Quantara-style
   ----------------------------------------------------------
   Scroll-LINKED, smoothed motion (the "weighted glide" feel):
   every effect is driven by onScroll({ sync }) so it lags a
   touch behind the scroll and catches up, instead of snapping.

     [data-parallax]  vertical drift at its own speed
     [data-glide]     horizontal track that slides sideways
     [data-scale]     scale/zoom in as it enters
     [data-rotate]    slow rotation tied to scroll

   All gated on prefers-reduced-motion.
   ========================================================== */
import { animate, onScroll } from 'animejs';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const boot = () => {
  if (reduceMotion) return;

  /* -- 1. Parallax — elements drift vertically, scroll-linked ---- */
  document.querySelectorAll('[data-parallax]').forEach((el) => {
    const dist = parseFloat(el.dataset.parallax) || 50; // total px travel
    animate(el, {
      translateY: [dist, -dist],
      ease: 'linear',
      autoplay: onScroll({
        target: el,
        enter: 'top bottom',
        leave: 'bottom top',
        sync: 0.9,
      }),
    });
  });

  /* -- 2. Horizontal glide-track — slides sideways on scroll ----- */
  document.querySelectorAll('[data-glide]').forEach((track) => {
    const section = track.closest('section') || track.parentElement;
    const span = Math.max(0, track.scrollWidth - window.innerWidth);
    const travel = span > 0 ? span * 0.6 : track.offsetWidth * 0.25;
    animate(track, {
      translateX: [travel * 0.15, -travel],
      ease: 'linear',
      autoplay: onScroll({
        target: section,
        enter: 'top bottom',
        leave: 'bottom top',
        sync: 0.8,
      }),
    });
  });

  /* -- 3. Scale-on-scroll — zooms in as it enters ---------------- */
  document.querySelectorAll('[data-scale]').forEach((el) => {
    const from = parseFloat(el.dataset.scale) || 0.86;
    animate(el, {
      scale: [from, 1],
      ease: 'out(2)',
      autoplay: onScroll({
        target: el,
        enter: 'top bottom',
        leave: 'center center',
        sync: 0.7,
      }),
    });
  });

  /* -- 4. Rotate-on-scroll — slow decorative spin ---------------- */
  document.querySelectorAll('[data-rotate]').forEach((el) => {
    const deg = parseFloat(el.dataset.rotate) || 120;
    animate(el, {
      rotate: [deg * -0.4, deg],
      ease: 'linear',
      autoplay: onScroll({
        target: el,
        enter: 'top bottom',
        leave: 'bottom top',
        sync: 1,
      }),
    });
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
