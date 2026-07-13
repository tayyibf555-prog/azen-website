/* ==========================================================
   Azen hero — real-time WebGL 3D (Three.js r0.185)
   ----------------------------------------------------------
   A faceted "AI core" crystal: dark reflective glass body, a
   soft blue heart and bright blue edge seams that catch the
   bloom, real environment reflections, and a drifting particle
   field. Rotates on its own and eases toward the cursor.

   Progressive + safe:
   - No WebGL / context loss  → CSS glow-ground stays visible
   - prefers-reduced-motion   → one static frame, no loop
   - scrolled off-screen      → render loop parks (battery)
   ========================================================== */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

const mount = document.getElementById('hero-3d');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const fail = () => { if (mount) mount.setAttribute('data-3d', 'off'); };

if (mount) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) { renderer = null; }

  if (!renderer || !renderer.getContext()) {
    fail();
  } else {
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(DPR);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.72;              // restrained — no blow-out
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);              // transparent → CSS ground shows through
    mount.appendChild(renderer.domElement);
    mount.setAttribute('data-3d', 'on');

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 7);                     // pulled back → contained object

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    const BLUE = new THREE.Color('#0071e3');
    const BLUE_BRIGHT = new THREE.Color('#4aa3ff');

    // ── Core crystal — dark reflective glass, blue glow ──────
    const geo = new THREE.IcosahedronGeometry(1.3, 0); // sharp low-poly facets
    const glass = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#080f22'),
      metalness: 0.3,
      roughness: 0.22,
      transmission: 0.4,
      thickness: 2.0,
      ior: 1.7,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
      envMapIntensity: 0.7,
      emissive: new THREE.Color('#08163a'),
      emissiveIntensity: 0.32,
      transparent: true,
      flatShading: true,
    });
    const crystal = new THREE.Mesh(geo, glass);

    // Bright edge seams — the glow (catches bloom)
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(geo),
      new THREE.LineBasicMaterial({ color: BLUE_BRIGHT, transparent: true, opacity: 0.95 })
    );
    crystal.add(edges);

    // Soft glowing heart
    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.5, 0),
      new THREE.MeshBasicMaterial({ color: BLUE, transparent: true, opacity: 0.4 })
    );
    crystal.add(core);

    const group = new THREE.Group();
    group.add(crystal);
    scene.add(group);

    // ── Particle atmosphere ──────────────────────────────────
    const COUNT = 1100;
    const pPos = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const r = 3.5 + Math.pow(i / COUNT, 0.5) * 9;
      const a = i * 2.399963;
      pPos[i * 3] = Math.cos(a) * r * (0.5 + (i % 7) / 9);
      pPos[i * 3 + 1] = (((i * 97) % 100) / 100 - 0.5) * 11;
      pPos[i * 3 + 2] = Math.sin(a) * r * (0.5 + (i % 5) / 9) - 4;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
      color: BLUE, size: 0.03, sizeAttenuation: true,
      transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    scene.add(particles);

    // ── Lights (gentle) ──────────────────────────────────────
    scene.add(new THREE.HemisphereLight(0x88aaff, 0x05060c, 0.35));
    const key = new THREE.DirectionalLight(0xcfe0ff, 0.9);
    key.position.set(3, 4, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(BLUE, 1.6);
    rim.position.set(-4, -1, -3);
    scene.add(rim);
    const fillLight = new THREE.PointLight(BLUE_BRIGHT, 3, 12);
    fillLight.position.set(0, 0, 3);
    scene.add(fillLight);

    // ── Post: subtle bloom (only bright edges glow) ──────────
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.55, 0.5, 0.8);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());

    // ── Sizing via ResizeObserver (robust to late layout) ────
    const applySize = () => {
      const w = Math.round(mount.clientWidth) || window.innerWidth;
      const h = Math.round(mount.clientHeight) || window.innerHeight;
      if (w < 2 || h < 2) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      composer.setSize(w, h);
      if (!running && reduceMotion) composer.render();
    };
    new ResizeObserver(applySize).observe(mount);
    window.addEventListener('load', applySize);

    // ── Pointer parallax ─────────────────────────────────────
    const target = { x: 0, y: 0 };
    if (window.matchMedia('(hover: hover)').matches) {
      window.addEventListener('pointermove', (e) => {
        target.x = (e.clientY / window.innerHeight - 0.5) * 0.5;
        target.y = (e.clientX / window.innerWidth - 0.5) * 0.85;
      }, { passive: true });
    }

    // ── Robust loop: starts now, parks only when off-screen ──
    const clock = new THREE.Clock();
    let running = false;
    const loop = () => {
      if (!running) return;
      const t = clock.getElapsedTime();
      group.rotation.y += (target.y - group.rotation.y) * 0.05 + 0.0016;
      group.rotation.x += (target.x - group.rotation.x) * 0.05;
      group.position.y = Math.sin(t * 0.6) * 0.1;
      core.rotation.y = -t * 0.45;
      core.rotation.x = t * 0.2;
      particles.rotation.y = t * 0.02;
      composer.render();
      requestAnimationFrame(loop);
    };
    const play = () => { if (!running) { running = true; requestAnimationFrame(loop); } };
    const pause = () => { running = false; };

    applySize();
    new IntersectionObserver((es) => { es[0].isIntersecting ? play() : pause(); }, { threshold: 0 }).observe(mount);

    if (reduceMotion) composer.render();
    else play();
  }
}
