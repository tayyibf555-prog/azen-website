/* ==========================================================
   Mindset panel — the armored core, sequence-video mirror
   ----------------------------------------------------------
   A second, tiny Three.js scene inside the sequence frame:
   the SAME armored octagon + voxel eruption as the hero
   (shared builders in src/chip/common.js), running the pure
   ~10s sine pendulum at FIXED amplitude 1 — berco's sequence
   video 1:1. No scroll or pointer dependencies. Slow ambient
   rotation, square crop, parked by an IntersectionObserver
   when off-screen. DPR ≤ 2. Own tiny renderer, ~13 draw
   calls, no post, no shadows.

   Progressive: no WebGL → mount keeps the CSS ground.
   Reduced motion → one static mid-eruption frame.
   ========================================================== */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  buildArmoredCore, buildEruption, buildGlowPool, buildPlumeLight,
  applyHDREnvironment, boostEnvIntensity,
} from './chip/common.js';

const mount = document.getElementById('chip-panel');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (mount) {
  let renderer = null;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'low-power' });
  } catch (e) { renderer = null; }

  if (renderer && renderer.getContext()) {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.9;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const BLUE = new THREE.Color('#0071e3');

    const scene = new THREE.Scene();
    scene.background = (() => {
      const c = document.createElement('canvas'); c.width = 2; c.height = 256;
      const ctx = c.getContext('2d');
      const g = ctx.createLinearGradient(0, 0, 0, 256);
      g.addColorStop(0, '#0a0d14'); g.addColorStop(0.55, '#050609'); g.addColorStop(1, '#020202');
      ctx.fillStyle = g; ctx.fillRect(0, 0, 2, 256);
      const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; return tex;
    })();
    scene.fog = new THREE.Fog(new THREE.Color('#040609'), 9, 20);

    // frames the full pendulum: lattice at rest → wave-curtain crest at peak
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 60);
    camera.position.set(3.9, 2.75, 6.2);
    camera.lookAt(0, 1.0, 0);

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    // HDRI env — async swap, RoomEnvironment above is the instant fallback.
    // Same boosts as the hero so both scenes read as one material world.
    applyHDREnvironment(renderer, scene, () => {
      boostEnvIntensity(core.metals, 3.2);
      boostEnvIntensity(core.bodies, 2.2);
      if (reduceMotion) renderer.render(scene, camera);   // refresh the static frame
    });

    const rig = new THREE.Group();
    scene.add(rig);

    /* The armored core + eruption + glow pool — hero builders verbatim. */
    const core = buildArmoredCore(rig, { maxAniso: renderer.capabilities.getMaxAnisotropy() });
    const eru = buildEruption(rig, { boardTop: core.boardTop });
    buildGlowPool(rig, { y: -0.8, size: 6.5 });
    const plume = buildPlumeLight(rig, { boardTop: core.boardTop });

    /* Lights — hero palette, no shadows. */
    scene.add(new THREE.HemisphereLight(0x9ec8ff, 0x0a1428, 0.4));
    const key = new THREE.DirectionalLight(0xeaf1ff, 1.4);
    key.position.set(4.5, 7.5, 4.5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(BLUE, 1.3);
    rim.position.set(-6, 2.5, -4);
    scene.add(rim);

    /* Square sizing from the frame column. */
    const applySize = () => {
      const w = Math.round(mount.clientWidth);
      const h = Math.round(mount.clientHeight) || w;
      if (w < 2 || h < 2) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      if (reduceMotion) renderer.render(scene, camera);
    };
    new ResizeObserver(applySize).observe(mount);
    applySize();

    /* The pendulum: sine erupt → settle, ~10s per full cycle, amp 1. */
    const CYCLE = 10;
    const applyPhase = (t) => {
      const pr = 0.5 - 0.5 * Math.cos((t * Math.PI * 2) / CYCLE);
      eru.uniforms.uTime.value = t;
      eru.uniforms.uProgress.value = pr;
      eru.uniforms.uAmp.value = 1;
      core.dieMat.emissiveIntensity = 0.45 + Math.sin(t * 1.1) * 0.2;
      // the eruption lights the object (reference behaviour)
      plume.intensity = 36 * pr;
      plume.position.set(0.12, core.boardTop + 0.45 + 1.6 * pr, 0.05);
      rig.rotation.y = 0.5 + t * (Math.PI * 2 / 40);   // slow ambient rotation
      rig.position.y = Math.sin(t * 0.5) * 0.03;
    };

    if (reduceMotion) {
      applyPhase(2.1); // designed still: plume mid-eruption over the core
      renderer.render(scene, camera);
    } else {
      const clock = new THREE.Clock();
      let running = false;
      let t = 0;
      const loop = () => {
        if (!running) return;
        t += Math.min(clock.getDelta(), 0.05);
        applyPhase(t);
        renderer.render(scene, camera);
        requestAnimationFrame(loop);
      };
      const play = () => { if (!running) { running = true; clock.getDelta(); requestAnimationFrame(loop); } };
      const pause = () => { running = false; };
      new IntersectionObserver((es) => { es[0].isIntersecting ? play() : pause(); }, { threshold: 0 }).observe(mount);
    }
  }
}
