/* ==========================================================
   Azen hero — "The Armored Core" v2 (Three.js r0.185)
   ----------------------------------------------------------
   A floating elongated-octagon package — gunmetal armor plate,
   machined rim and screws, gold leadframe teeth, glossy blue
   modules, iridescent die — alone in a black void over a soft
   blue glow pool. From the die, a GPU-driven plume of 6144
   tiny voxels erupts and settles on a ~10s sine pendulum:
   white-hot at the base, cooling through #4aa3ff to #0071e3,
   scattering and dissolving at the crown. Scroll feeds it —
   the camera dollies in, the plume's amplitude and pendulum
   speed rise. At rest it simmers; at scroll it rages.

   Procedural geometry + code-drawn CanvasTextures; the only
   file asset is a CC0 HDRI (/hdri/env.hdr) for lighting.
   No models, no video. The pipeline is ours.

   Progressive + safe (unchanged gates):
   - No WebGL / context loss  → CSS glow-ground stays visible
   - prefers-reduced-motion   → single frame, settled plume
   - scrolled past the hero   → render loop parks (battery)
   ========================================================== */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import {
  mulberry32, buildArmoredCore, buildEruption, buildGlowPool, buildPlumeLight,
  buildLid, buildArcs,
  GrainShader, applyHDREnvironment, boostEnvIntensity,
} from './chip/common.js';

const mount = document.getElementById('hero-3d');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const fail = () => { if (mount) mount.setAttribute('data-3d', 'off'); };

if (mount) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  } catch (e) { renderer = null; }

  if (!renderer || !renderer.getContext()) {
    fail();
  } else {
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(DPR);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.9;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    // no shadow map: the object floats in a void (no catcher plane) —
    // the budget goes to the 6144-voxel eruption instead.
    mount.appendChild(renderer.domElement);
    mount.setAttribute('data-3d', 'on');

    const BLUE = new THREE.Color('#0071e3');

    const scene = new THREE.Scene();
    scene.background = (() => {
      const c = document.createElement('canvas'); c.width = 2; c.height = 256;
      const ctx = c.getContext('2d');
      const g = ctx.createLinearGradient(0, 0, 0, 256);
      // retuned to the #020202 page family so the 4-way vignette blends seamlessly
      g.addColorStop(0, '#06080d'); g.addColorStop(0.55, '#040507'); g.addColorStop(1, '#020202');
      ctx.fillStyle = g; ctx.fillRect(0, 0, 2, 256);
      const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; return tex;
    })();
    scene.fog = new THREE.Fog(new THREE.Color('#040609'), 11, 26);

    // Camera — 3/4 hero angle on the floating core (brief §B.4:
    // keep INTRO→HERO positions, look at object centre ~y0.3).
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    // reference framing: the core fills the frame, the plume towers —
    // closer + lower than v2, gaze lifted to the curtain's mass centre.
    const HERO_POS = new THREE.Vector3(3.05, 1.85, 4.75);
    const INTRO_POS = new THREE.Vector3(4.2, 2.8, 6.9);
    const LOOK_BASE = new THREE.Vector3(0, 0.62, 0);
    const lookCur = LOOK_BASE.clone();
    camera.position.copy(reduceMotion ? HERO_POS : INTRO_POS);
    camera.lookAt(lookCur);

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    // HDRI lighting — async swap; RoomEnvironment above is the instant
    // first-paint fallback. Boosts hold the near-black + #0071e3 palette.
    applyHDREnvironment(renderer, scene, () => {
      boostEnvIntensity(core.metals, 3.2);
      boostEnvIntensity(core.bodies, 2.2);
      if (reduceMotion) composer.render();       // refresh the single static frame
    });

    // everything that floats / yaws / parallaxes lives on the rig
    const rig = new THREE.Group();
    scene.add(rig);

    /* ── 1. The armored core + eruption + glow pool ─────────── */
    const core = buildArmoredCore(rig, { maxAniso: renderer.capabilities.getMaxAnisotropy() });
    const eru = buildEruption(rig, { boardTop: core.boardTop });
    buildGlowPool(rig, { y: -0.85, size: 7.5 });
    // berco resting hero: CLOSED chip — brushed engraved lid over the board,
    // electric arcs crawling the seam. Lid lifts on scroll; eruption pours out.
    const lid = buildLid(rig, { boardTop: core.boardTop });
    const arcs = buildArcs(rig, { boardTop: core.boardTop });
    // the plume IS the key light when the system opens
    const plume = buildPlumeLight(rig, { boardTop: core.boardTop });
    if (reduceMotion) { plume.intensity = 2; arcs.update(1.7, 0.5); }

    /* ── 1b. Atmosphere — sparse blue dust in the void ──────── */
    const dotTex = (() => {
      const c = document.createElement('canvas'); c.width = c.height = 64;
      const ctx = c.getContext('2d');
      const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, 'rgba(255,255,255,1)');
      g.addColorStop(0.35, 'rgba(255,255,255,0.55)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64);
      const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; return tex;
    })();
    const rng = mulberry32(20260716);
    const DUST = 700;
    const dustPos = new Float32Array(DUST * 3);
    for (let i = 0; i < DUST; i++) {
      const r = 3.2 + rng() * 10.5, a = rng() * Math.PI * 2;
      dustPos[i * 3] = Math.cos(a) * r;
      dustPos[i * 3 + 1] = -0.6 + Math.pow(rng(), 1.7) * 5.2;
      dustPos[i * 3 + 2] = Math.sin(a) * r;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
      color: BLUE, map: dotTex, size: 0.055, sizeAttenuation: true,
      transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    scene.add(dust);

    /* ── 2. Light & post ─────────────────────────────────────── */
    scene.add(new THREE.HemisphereLight(0x9ec8ff, 0x0a1428, 0.4));
    const key = new THREE.DirectionalLight(0xeaf1ff, 1.4);   // soft top key
    key.position.set(4.5, 7.5, 4.5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(BLUE, 1.3);
    rim.position.set(-6, 2.5, -4);
    scene.add(rim);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    // subtle DOF — focus is re-aimed at the die every frame in the loop.
    const bokeh = new BokehPass(scene, camera, { focus: 6.8, aperture: 0.00035, maxblur: 0.008 });
    composer.addPass(bokeh);
    const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.65, 0.55, 0.7); // retuned for the plume
    composer.addPass(bloom);
    const grain = new ShaderPass(GrainShader);   // micro-grain, ≤0.035
    composer.addPass(grain);
    composer.addPass(new OutputPass());

    // reduced-motion designed still: settled plume at amp 0.4 (brief §B.5)
    if (reduceMotion) {
      eru.uniforms.uAmp.value = 0.4;
      eru.uniforms.uProgress.value = 0.08;
      eru.uniforms.uTime.value = 2.0;
      eru.uniforms.uOpacity.value = 1;
    }

    /* ── Sizing (unchanged guards) ───────────────────────────── */
    let zoomComp = 1; // narrow-aspect camera pull-back (QA: 390px cropped the chip)
    const applySize = () => {
      const w = Math.round(mount.clientWidth) || window.innerWidth;
      const h = Math.round(mount.clientHeight) || window.innerHeight;
      if (w < 2 || h < 2) return;
      camera.aspect = w / h; camera.updateProjectionMatrix(); camera.lookAt(lookCur);
      zoomComp = Math.min(1.8, Math.max(1, Math.pow((16 / 9) / (w / h), 0.35)));
      renderer.setSize(w, h, false); composer.setSize(w, h);
      if (reduceMotion) {                      // static frame stays crisp + framed
        camera.position.set(HERO_POS.x * zoomComp, HERO_POS.y, HERO_POS.z * zoomComp);
        camera.lookAt(lookCur);
        composer.render();
      }
    };
    new ResizeObserver(applySize).observe(mount);
    window.addEventListener('load', applySize);
    applySize();

    /* ── 3. Choreography ─────────────────────────────────────── */
    let yawTarget = 0, pitchTarget = 0;
    if (window.matchMedia('(hover: hover)').matches && !reduceMotion) {
      window.addEventListener('pointermove', (e) => {
        yawTarget = (e.clientX / window.innerWidth - 0.5) * 0.6;    // ±0.3 rad
        pitchTarget = (e.clientY / window.innerHeight - 0.5) * 0.2; // ±0.1 rad
      }, { passive: true });
    }
    let scrollP = 0;
    const onScroll = () => {
      const h = mount.clientHeight || window.innerHeight;
      if (!h) { scrollP = 0; return; } // 0-height init guard (QA: NaN poisons accumulators)
      scrollP = reduceMotion ? 0 : Math.max(0, Math.min(1, window.scrollY / h));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);
    const clock = new THREE.Clock();
    const basePos = new THREE.Vector3();
    const lookPlume = new THREE.Vector3();
    const focusV = new THREE.Vector3();   // reused — no per-frame allocation
    let running = false, t = 0, introT = reduceMotion ? 1.4 : 0, smYaw = 0, smPitch = 0;
    // pendulum state — phase accumulates so scroll speed-ups never pop
    let pendPhase = 0, pendP = reduceMotion ? 0.08 : 0;

    // one authored frame from current sim state (t/pendPhase/scrollP/…)
    const applyFrame = () => {
      const e = easeOutCubic(introT / 1.4);
      const p = scrollP;

      // idle: berco stillness — NO continuous spin, just a breathing drift
      // (their loop barely moves; the arcs are the life) + cursor parallax
      rig.rotation.y = 0.35 + smYaw + Math.sin(t * 0.22) * 0.05 + Math.sin(t * 0.13) * 0.03;
      rig.rotation.x = smPitch;
      rig.position.y = Math.sin(t * 0.5) * 0.035;

      // living materials
      core.dieMat.emissiveIntensity = 0.45 + Math.sin(t * 1.1) * 0.2;   // breathe

      // THE ERUPTION — sine ping-pong (~10s); scroll raises amplitude
      // ×(0.55+0.45p) and pendulum speed ×(1+0.6p). Simmer → rage.
      pendP = 0.5 - 0.5 * Math.cos(pendPhase * Math.PI * 2);
      eru.uniforms.uTime.value = t;
      eru.uniforms.uProgress.value = pendP;
      // REST = closed chip, arcs only (berco hero). SCROLL = the system
      // opens: lid lifts, the eruption pours out (berco sequence).
      eru.uniforms.uAmp.value = 0.08 + 0.92 * p;
      eru.uniforms.uOpacity.value = e * Math.min(1, 0.15 + p * 1.4);
      lid.group.position.y = easeOutCubic(p) * 0.55;
      arcs.update(t, (0.5 + 0.5 * p) * e);
      // plume practical light — the eruption lights the object as it opens
      const pr = pendP * eru.uniforms.uAmp.value;
      plume.intensity = 36 * pr * e;
      plume.position.set(0.12, core.boardTop + 0.45 + 1.6 * pr, 0.05);

      dust.rotation.y = t * 0.008;

      // camera: load-in ease, then scroll dolly toward the die
      // (x/z scaled by zoomComp so portrait screens keep the core framed)
      basePos.lerpVectors(INTRO_POS, HERO_POS, e);
      camera.position.set(basePos.x * zoomComp, basePos.y - 0.6 * p, (basePos.z - 2.2 * p) * zoomComp);
      lookPlume.set(0, 0.95, 0);           // gaze rises toward the plume mass
      lookCur.lerpVectors(LOOK_BASE, lookPlume, p);
      camera.lookAt(lookCur);

      bloom.strength = 0.65 + 0.2 * p;

      // visual-only post updates — reads choreography state, never writes it
      focusV.set(0, 0.3 + rig.position.y, 0);
      bokeh.uniforms.focus.value = camera.position.distanceTo(focusV);
      grain.uniforms.time.value = t;

      composer.render();
    };

    const loop = () => {
      if (!running) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      t += dt;
      if (introT < 1.4) introT = Math.min(1.4, introT + dt);
      smYaw += (yawTarget - smYaw) * 0.05;
      smPitch += (pitchTarget - smPitch) * 0.05;
      pendPhase += dt * (1 + 0.6 * scrollP) / 10;
      applyFrame();
      requestAnimationFrame(loop);
    };

    // debug handle v2 for QA — do not remove
    window.__azenChip = {
      get camZ() { return camera.position.z; },
      get plumeT() { return pendP; },
      get amp() { return eru.uniforms.uAmp.value; },
      get zoomComp() { return zoomComp; },
      get lightI() { return plume.intensity; },
      voxels: eru.count,
      // QA scrub — advance the sim by s seconds and render one real frame
      // (headless/hidden panes can't rely on rAF; state math is identical)
      step(s = 0.1) {
        t += s;
        introT = Math.min(1.4, introT + s);
        pendPhase += s * (1 + 0.6 * scrollP) / 10;
        applyFrame();
      },
    };

    if (reduceMotion) {
      // single designed still: hero framing, settled glowing lattice
      composer.render();
    } else {
      const play = () => { if (!running) { running = true; clock.getDelta(); requestAnimationFrame(loop); } };
      const pause = () => { running = false; };
      // camera intro starts on the loader's reveal event (fallback: 2s)
      let armed = false;
      const begin = () => { if (!armed) { armed = true; play(); } };
      new IntersectionObserver((es) => { es[0].isIntersecting ? (armed && play()) : pause(); }, { threshold: 0 }).observe(mount);
      if (window.__azenRevealed) begin();
      else {
        window.addEventListener('azen:reveal', begin, { once: true });
        setTimeout(begin, 2000);
      }
    }
  }
}
