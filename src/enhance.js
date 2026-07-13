/* ==========================================================
   anime.js (v4) enhancement layer
   ----------------------------------------------------------
   Runs alongside the inline vanilla script in index.html — it
   never touches elements that script already animates. Anime
   powers the moments where orchestrated timing / SVG line-draw
   clearly beat CSS keyframes:

     1. System map — connectors draw themselves in, nodes settle,
        core springs in, then the travelling pulses switch on.
     2. Hero halo — a slow living breath behind the core render.

   Everything is gated on prefers-reduced-motion.
   ========================================================== */
import {
  animate,
  createTimeline,
  createDrawable,
  createSpring,
  stagger,
  utils,
} from 'animejs';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const boot = () => {
  if (reduceMotion) return;

  /* ---- 1. System map orchestrated reveal --------------------- */
  const smap = document.querySelector('.sysmap');
  if (smap) {
    const conns = smap.querySelectorAll('.smap-conn path');
    const nodes = smap.querySelectorAll('.smap-node');
    const core = smap.querySelector('.smap-core');
    const pulses = smap.querySelector('.smap-pulses');

    const drawables = createDrawable(conns);

    // Hold everything hidden until the section is in view.
    utils.set(drawables, { draw: '0 0' });
    utils.set(nodes, { opacity: 0, translateY: 10 });
    utils.set(core, { opacity: 0, scale: 0.72 });
    if (pulses) utils.set(pulses, { opacity: 0 });

    let played = false;
    const play = () => {
      if (played) return;
      played = true;

      createTimeline({ defaults: { ease: 'outQuad' } })
        .add(core, {
          opacity: [0, 1],
          scale: [0.72, 1],
          duration: 760,
          ease: createSpring({ stiffness: 130, damping: 13 }),
        })
        .add(drawables, {
          draw: ['0 0', '0 1'],
          duration: 900,
          delay: stagger(85),
          ease: 'inOutQuad',
        }, 180)
        .add(nodes, {
          opacity: [0, 1],
          translateY: [10, 0],
          duration: 620,
          delay: stagger(70),
        }, '-=680')
        .add(pulses, { opacity: [0, 1], duration: 520 }, '-=160');
    };

    new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { play(); obs.disconnect(); }
      });
    }, { threshold: 0.3 }).observe(smap);
  }

  /* ---- 2. Hero halo living breath ---------------------------- */
  const halo = document.querySelector('.core-halo');
  if (halo) {
    animate(halo, {
      opacity: [0.42, 0.72],
      scale: [1, 1.06],
      duration: 3600,
      loop: true,
      alternate: true,
      ease: 'inOutSine',
    });
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
