/* ==========================================================
   Azen hero — real-time WebGL "Neural Core" (Three.js r0.185)
   ----------------------------------------------------------
   A detailed AI structure living in an atmospheric world:
   a glowing core wrapped in an orbiting neural lattice (nodes
   + connections), floating over a grid ground that fades into
   deep-blue fog. Bloom glow, drifting motes, cursor orbit, and
   a scroll-driven camera that flies in as you descend.

   Progressive + safe:
   - No WebGL / context loss  → CSS glow-ground stays visible
   - prefers-reduced-motion   → gentle, no scroll fly-in
   - scrolled past the hero    → render loop parks (battery)
   ========================================================== */
import * as THREE from 'three';
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
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  } catch (e) { renderer = null; }

  if (!renderer || !renderer.getContext()) {
    fail();
  } else {
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(DPR);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.95;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);
    mount.setAttribute('data-3d', 'on');

    const BLUE = new THREE.Color('#0071e3');
    const BLUE_BRIGHT = new THREE.Color('#4aa3ff');
    const CYAN = new THREE.Color('#63c7ff');

    const scene = new THREE.Scene();
    // Deep-blue atmosphere that melts to near-black at the base
    scene.background = (() => {
      const c = document.createElement('canvas'); c.width = 2; c.height = 256;
      const g = c.getContext('2d').createLinearGradient(0, 0, 0, 256);
      g.addColorStop(0, '#0a1f4c'); g.addColorStop(0.45, '#0a1430'); g.addColorStop(1, '#04060e');
      const ctx = c.getContext('2d'); ctx.fillStyle = g; ctx.fillRect(0, 0, 2, 256);
      const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; return tex;
    })();
    scene.fog = new THREE.Fog(new THREE.Color('#08122c'), 8, 26);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    const CAM_START = new THREE.Vector3(0, 1.6, 10);
    const CAM_END = new THREE.Vector3(0, 0.2, 5.2);
    camera.position.copy(CAM_START);

    const world = new THREE.Group();
    scene.add(world);

    // ── Ground grid fading into fog ──────────────────────────
    const grid = new THREE.GridHelper(60, 60, new THREE.Color('#1c3b78'), new THREE.Color('#122a55'));
    grid.position.y = -3;
    grid.material.transparent = true;
    grid.material.opacity = 0.35;
    world.add(grid);

    // ── Central AI core ──────────────────────────────────────
    const coreGeo = new THREE.IcosahedronGeometry(1.15, 0);
    const core = new THREE.Mesh(coreGeo, new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#0a1836'), metalness: 0.35, roughness: 0.25,
      transmission: 0.35, thickness: 1.6, ior: 1.6, clearcoat: 1,
      emissive: new THREE.Color('#0b2a63'), emissiveIntensity: 0.7, flatShading: true, transparent: true,
    }));
    const coreEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(coreGeo),
      new THREE.LineBasicMaterial({ color: BLUE_BRIGHT, transparent: true, opacity: 0.95 })
    );
    core.add(coreEdges);
    const coreHeart = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.45, 0),
      new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.55 })
    );
    core.add(coreHeart);
    world.add(core);

    // ── Neural lattice: nodes on a fibonacci shell + links ───
    const N = 54;
    const nodes = [];
    const nodeGeo = new THREE.SphereGeometry(0.05, 12, 12);
    const nodeMat = new THREE.MeshBasicMaterial({ color: BLUE_BRIGHT });
    const lattice = new THREE.Group();
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const rad = Math.sqrt(1 - y * y);
      const theta = i * 2.399963;
      const R = 2.7 + (((i * 53) % 10) / 10) * 0.5;
      const v = new THREE.Vector3(Math.cos(theta) * rad, y, Math.sin(theta) * rad).multiplyScalar(R);
      const m = new THREE.Mesh(nodeGeo, nodeMat);
      m.position.copy(v);
      lattice.add(m);
      nodes.push(v);
    }
    // links between near neighbours
    const linkPos = [];
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        if (nodes[i].distanceTo(nodes[j]) < 1.7) {
          linkPos.push(nodes[i].x, nodes[i].y, nodes[i].z, nodes[j].x, nodes[j].y, nodes[j].z);
        }
      }
    }
    const linkGeo = new THREE.BufferGeometry();
    linkGeo.setAttribute('position', new THREE.Float32BufferAttribute(linkPos, 3));
    lattice.add(new THREE.LineSegments(linkGeo, new THREE.LineBasicMaterial({
      color: BLUE, transparent: true, opacity: 0.28,
    })));
    world.add(lattice);

    // ── Orbiting rings ───────────────────────────────────────
    const ringMat = new THREE.MeshBasicMaterial({ color: BLUE, transparent: true, opacity: 0.5 });
    const rings = [];
    for (let i = 0; i < 3; i++) {
      const r = new THREE.Mesh(new THREE.TorusGeometry(3.4 + i * 0.15, 0.012, 8, 120), ringMat);
      r.rotation.x = Math.PI / 2 + (i - 1) * 0.5;
      r.rotation.y = i * 0.6;
      rings.push(r); world.add(r);
    }

    // ── Drifting motes ───────────────────────────────────────
    const COUNT = 1400;
    const pPos = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const rr = 3 + Math.pow(i / COUNT, 0.5) * 12;
      const a = i * 2.399963;
      pPos[i * 3] = Math.cos(a) * rr * (0.5 + (i % 7) / 8);
      pPos[i * 3 + 1] = (((i * 97) % 100) / 100 - 0.5) * 12;
      pPos[i * 3 + 2] = Math.sin(a) * rr * (0.5 + (i % 5) / 8);
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const motes = new THREE.Points(pGeo, new THREE.PointsMaterial({
      color: CYAN, size: 0.03, sizeAttenuation: true, transparent: true,
      opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    world.add(motes);

    // ── Lights ───────────────────────────────────────────────
    scene.add(new THREE.HemisphereLight(0x9ec8ff, 0x060a18, 0.6));
    const key = new THREE.DirectionalLight(0xdfeaff, 1.2); key.position.set(4, 6, 6); scene.add(key);
    const rim = new THREE.DirectionalLight(BLUE, 2.0); rim.position.set(-5, -1, -4); scene.add(rim);
    const glow = new THREE.PointLight(BLUE_BRIGHT, 5, 16); glow.position.set(0, 0, 0); scene.add(glow);

    // ── Post: bloom ──────────────────────────────────────────
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.7, 0.55, 0.75);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());

    // ── Sizing ───────────────────────────────────────────────
    const applySize = () => {
      const w = Math.round(mount.clientWidth) || window.innerWidth;
      const h = Math.round(mount.clientHeight) || window.innerHeight;
      if (w < 2 || h < 2) return;
      camera.aspect = w / h; camera.updateProjectionMatrix();
      renderer.setSize(w, h, false); composer.setSize(w, h);
    };
    new ResizeObserver(applySize).observe(mount);
    window.addEventListener('load', applySize);
    applySize();

    // ── Cursor orbit ─────────────────────────────────────────
    const target = { x: 0, y: 0 };
    if (window.matchMedia('(hover: hover)').matches) {
      window.addEventListener('pointermove', (e) => {
        target.y = (e.clientX / window.innerWidth - 0.5) * 0.5;
        target.x = (e.clientY / window.innerHeight - 0.5) * 0.28;
      }, { passive: true });
    }

    // ── Scroll fly-in (0 = top, 1 = one viewport down) ───────
    let scrollP = 0;
    const onScroll = () => {
      const h = mount.clientHeight || window.innerHeight;
      scrollP = Math.max(0, Math.min(1, window.scrollY / h));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // ── Loop ─────────────────────────────────────────────────
    const clock = new THREE.Clock();
    let running = false;
    const loop = () => {
      if (!running) return;
      const t = clock.getElapsedTime();
      world.rotation.y += (target.y - world.rotation.y) * 0.045 + 0.0012;
      world.rotation.x += (target.x - world.rotation.x) * 0.045;
      core.rotation.y = t * 0.15;
      coreHeart.rotation.y = -t * 0.5; coreHeart.rotation.x = t * 0.3;
      lattice.rotation.y = -t * 0.05;
      rings[0].rotation.z = t * 0.1; rings[1].rotation.z = -t * 0.14; rings[2].rotation.x = t * 0.08;
      motes.rotation.y = t * 0.015;
      const pulse = 0.5 + Math.sin(t * 1.6) * 0.12;
      coreHeart.material.opacity = pulse;
      // scroll dolly: fly toward the core as you scroll into the page
      const e = reduceMotion ? 0 : scrollP;
      camera.position.lerpVectors(CAM_START, CAM_END, e);
      camera.lookAt(0, 0.2 - e * 0.2, 0);
      composer.render();
      requestAnimationFrame(loop);
    };
    const play = () => { if (!running) { running = true; requestAnimationFrame(loop); } };
    const pause = () => { running = false; };

    new IntersectionObserver((es) => { es[0].isIntersecting ? play() : pause(); }, { threshold: 0 }).observe(mount);
    play();
  }
}
