/* ==========================================================
   Azen hero — real-time WebGL 3D (Three.js r0.185)
   ----------------------------------------------------------
   A faceted "AI core" crystal rendered live: glass transmission
   material, glowing electric-blue edge seams, real environment
   reflections, bloom, and a drifting particle field. Rotates on
   its own and eases toward the cursor.

   Progressive + safe:
   - No WebGL / context loss  → poster image stays (canvas hidden)
   - prefers-reduced-motion   → one static frame, no loop
   - tab hidden / off-screen  → render loop parked (battery)
   ========================================================== */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

const mount = document.getElementById('hero-3d');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function fail() {
  // leave the poster image visible; mark so CSS can hide the (empty) canvas
  if (mount) mount.setAttribute('data-3d', 'off');
}

if (!mount) {
  // nothing to do
} else {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) {
    renderer = null;
  }

  if (!renderer || !renderer.getContext()) {
    fail();
  } else {
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(DPR);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);
    mount.setAttribute('data-3d', 'on');

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 5.4);

    // ── Environment (reflections) ────────────────────────────
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    // ── The core crystal ─────────────────────────────────────
    const BLUE = new THREE.Color('#0071e3');
    const geo = new THREE.IcosahedronGeometry(1.4, 0); // low-poly = sharp facets

    const glass = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#0b1020'),
      metalness: 0.1,
      roughness: 0.06,
      transmission: 0.92,
      thickness: 1.6,
      ior: 1.6,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      envMapIntensity: 1.2,
      transparent: true,
      flatShading: true,
    });
    const crystal = new THREE.Mesh(geo, glass);
    scene.add(crystal);

    // Glowing blue edge seams (these catch the bloom)
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(geo),
      new THREE.LineBasicMaterial({ color: BLUE, transparent: true, opacity: 0.9 })
    );
    crystal.add(edges);

    // Inner emissive shard for a soft glowing heart
    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.55, 0),
      new THREE.MeshBasicMaterial({ color: BLUE, transparent: true, opacity: 0.35 })
    );
    crystal.add(core);

    const group = new THREE.Group();
    group.add(crystal);
    scene.add(group);

    // ── Particle atmosphere ──────────────────────────────────
    const COUNT = 900;
    const pPos = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const r = 3 + Math.pow(i / COUNT, 0.5) * 7;
      const a = i * 2.399963; // golden angle
      pPos[i * 3] = Math.cos(a) * r * (0.4 + (i % 7) / 10);
      pPos[i * 3 + 1] = (((i * 97) % 100) / 100 - 0.5) * 9;
      pPos[i * 3 + 2] = Math.sin(a) * r * (0.4 + (i % 5) / 10) - 3;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const particles = new THREE.Points(
      pGeo,
      new THREE.PointsMaterial({
        color: BLUE, size: 0.035, sizeAttenuation: true,
        transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false,
      })
    );
    scene.add(particles);

    // ── Lights ───────────────────────────────────────────────
    scene.add(new THREE.HemisphereLight(0x88aaff, 0x05060c, 0.5));
    const key = new THREE.DirectionalLight(0xcfe0ff, 1.6);
    key.position.set(3, 4, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(BLUE, 2.2);
    rim.position.set(-4, -1, -3);
    scene.add(rim);
    const fill = new THREE.PointLight(BLUE, 6, 12);
    fill.position.set(0, 0, 2.5);
    scene.add(fill);

    // ── Post: bloom for the glow ─────────────────────────────
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.7, 0.5, 0.82);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());

    // ── Sizing ───────────────────────────────────────────────
    const resize = () => {
      const w = mount.clientWidth || window.innerWidth;
      const h = mount.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      composer.setSize(w, h);
    };
    resize();
    window.addEventListener('resize', resize);

    // ── Pointer parallax ─────────────────────────────────────
    const target = { x: 0, y: 0 };
    if (window.matchMedia('(hover: hover)').matches) {
      window.addEventListener('pointermove', (e) => {
        target.x = (e.clientY / window.innerHeight - 0.5) * 0.6;
        target.y = (e.clientX / window.innerWidth - 0.5) * 0.9;
      }, { passive: true });
    }

    // ── Loop (parked when hidden / off-screen) ───────────────
    const clock = new THREE.Clock();
    let onScreen = true;
    let rafId = null;

    const frame = () => {
      const t = clock.getElapsedTime();
      group.rotation.y += (target.y - group.rotation.y) * 0.05 + 0.0016;
      group.rotation.x += (target.x - group.rotation.x) * 0.05;
      group.position.y = Math.sin(t * 0.6) * 0.12;
      core.rotation.y = -t * 0.4;
      particles.rotation.y = t * 0.02;
      composer.render();
      rafId = requestAnimationFrame(frame);
    };

    const start = () => { if (rafId == null && onScreen && document.visibilityState === 'visible') { clock.start(); frame(); } };
    const stop = () => { if (rafId != null) { cancelAnimationFrame(rafId); rafId = null; clock.stop(); } };

    document.addEventListener('visibilitychange', () => (document.visibilityState === 'visible' ? start() : stop()));
    new IntersectionObserver((es) => { onScreen = es[0].isIntersecting; onScreen ? start() : stop(); }, { threshold: 0.01 }).observe(mount);

    renderer.domElement.addEventListener('webglcontextlost', (e) => { e.preventDefault(); stop(); fail(); });

    if (reduceMotion) {
      composer.render(); // single static frame
    } else {
      start();
    }
  }
}
