/* ==========================================================
   Azen hero — "The Cairn" (Three.js r0.185)
   ----------------------------------------------------------
   A stack of balanced stones on a still plane. Calm, deliberate,
   load-bearing. As you scroll, the stones separate slightly and
   the light between them grows — revealing they're held together
   by light (the system, the agents). Cursor orbits it gently.

   Pure procedural geometry — no model. The pipeline is ours.

   Progressive + safe:
   - No WebGL / context loss  → CSS glow-ground stays visible
   - prefers-reduced-motion   → still, no scroll separation
   - scrolled past the hero    → render loop parks (battery)
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

// small seeded RNG so the cairn is designed, not random each load
const mulberry32 = (a) => () => {
  a |= 0; a = a + 0x6D2B79F5 | 0;
  let t = Math.imul(a ^ a >>> 15, 1 | a);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
};

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
    renderer.toneMappingExposure = 0.92;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);
    mount.setAttribute('data-3d', 'on');

    const BLUE = new THREE.Color('#0071e3');
    const BLUE_BRIGHT = new THREE.Color('#4aa3ff');

    const scene = new THREE.Scene();
    scene.background = (() => {
      const c = document.createElement('canvas'); c.width = 2; c.height = 256;
      const ctx = c.getContext('2d');
      const g = ctx.createLinearGradient(0, 0, 0, 256);
      g.addColorStop(0, '#0a1c44'); g.addColorStop(0.5, '#081130'); g.addColorStop(1, '#04060e');
      ctx.fillStyle = g; ctx.fillRect(0, 0, 2, 256);
      const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; return tex;
    })();
    scene.fog = new THREE.Fog(new THREE.Color('#06102a'), 11, 26);

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    const LOOK = new THREE.Vector3(0, 1.75, 0);
    camera.position.set(0, 1.7, 9.4);
    camera.lookAt(LOOK);

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    const cairn = new THREE.Group();
    scene.add(cairn);

    // ── Build the stones ─────────────────────────────────────
    const rng = mulberry32(20260714);
    const stoneDefs = [
      { r: 1.08, fy: 0.40 },
      { r: 0.82, fy: 0.50 },
      { r: 0.64, fy: 0.46 },
      { r: 0.74, fy: 0.40 },
      { r: 0.50, fy: 0.50 },
      { r: 0.33, fy: 0.54 },
    ];
    const makeStone = ({ r, fy }) => {
      const geo = new THREE.IcosahedronGeometry(r, 3);
      const pos = geo.attributes.position;
      const v = new THREE.Vector3();
      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i);
        v.multiplyScalar(1 + (rng() - 0.5) * 0.16);   // organic lumps
        pos.setXYZ(i, v.x, v.y, v.z);
      }
      geo.scale(1, fy, 1);                             // flatten → river stone
      geo.computeVertexNormals();
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#243447'), roughness: 0.85, metalness: 0.15, envMapIntensity: 0.5,
      });
      const m = new THREE.Mesh(geo, mat);
      m.castShadow = true; m.receiveShadow = true;
      m.userData.half = r * fy;                        // half-height
      return m;
    };

    const stones = stoneDefs.map(makeStone);
    // tight-stack Y positions (scroll separates them further)
    const GAP = 0.05;
    let cursorY = 0;
    stones.forEach((s) => {
      cursorY += s.userData.half;
      s.userData.baseY = cursorY;
      s.position.set((rng() - 0.5) * 0.05, cursorY, (rng() - 0.5) * 0.05);
      s.rotation.y = rng() * Math.PI;
      cairn.add(s);
      cursorY += s.userData.half + GAP;
    });

    // ── Light between the stones (the system holding it) ─────
    const gaps = [];
    for (let i = 1; i < stones.length; i++) {
      const rr = Math.min(stoneDefs[i - 1].r, stoneDefs[i].r) * 0.92;
      const disc = new THREE.Mesh(
        new THREE.CircleGeometry(rr, 40),
        new THREE.MeshBasicMaterial({ color: BLUE_BRIGHT, transparent: true, opacity: 0.15, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      disc.rotation.x = -Math.PI / 2;
      cairn.add(disc);
      const light = new THREE.PointLight(BLUE, 0.4, 2.4, 2);
      cairn.add(light);
      gaps.push({ disc, light, a: stones[i - 1], b: stones[i], rr });
    }

    // ── Still plane + glow pool ──────────────────────────────
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 60),
      new THREE.MeshStandardMaterial({ color: new THREE.Color('#060c1c'), roughness: 0.35, metalness: 0.6, envMapIntensity: 0.4 })
    );
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
    const shadowCatcher = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity: 0.5 }));
    shadowCatcher.rotation.x = -Math.PI / 2; shadowCatcher.position.y = 0.002; shadowCatcher.receiveShadow = true; scene.add(shadowCatcher);
    const pool = new THREE.Mesh(new THREE.CircleGeometry(2.6, 48),
      new THREE.MeshBasicMaterial({ color: BLUE, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false }));
    pool.rotation.x = -Math.PI / 2; pool.position.y = 0.01; scene.add(pool);

    // ── Lights ───────────────────────────────────────────────
    scene.add(new THREE.HemisphereLight(0x9ec8ff, 0x0a1428, 0.45));
    const key = new THREE.DirectionalLight(0xeaf1ff, 1.5);
    key.position.set(4, 9, 5); key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.near = 1; key.shadow.camera.far = 30;
    key.shadow.camera.left = -5; key.shadow.camera.right = 5;
    key.shadow.camera.top = 6; key.shadow.camera.bottom = -2;
    key.shadow.bias = -0.0004;
    scene.add(key);
    const rim = new THREE.DirectionalLight(BLUE, 1.4); rim.position.set(-6, 2, -4); scene.add(rim);

    // ── Post: bloom (light bands glow) ───────────────────────
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.55, 0.6, 0.7);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());

    // ── Sizing ───────────────────────────────────────────────
    const applySize = () => {
      const w = Math.round(mount.clientWidth) || window.innerWidth;
      const h = Math.round(mount.clientHeight) || window.innerHeight;
      if (w < 2 || h < 2) return;
      camera.aspect = w / h; camera.updateProjectionMatrix(); camera.lookAt(LOOK);
      renderer.setSize(w, h, false); composer.setSize(w, h);
    };
    new ResizeObserver(applySize).observe(mount);
    window.addEventListener('load', applySize);
    applySize();

    // ── Interaction: cursor orbit + scroll separation ────────
    const target = { x: 0, y: 0 };
    if (window.matchMedia('(hover: hover)').matches && !reduceMotion) {
      window.addEventListener('pointermove', (e) => {
        target.y = (e.clientX / window.innerWidth - 0.5) * 0.7;
        target.x = (e.clientY / window.innerHeight - 0.5) * 0.14;
      }, { passive: true });
    }
    let scrollP = 0;
    const onScroll = () => {
      const h = mount.clientHeight || window.innerHeight;
      scrollP = reduceMotion ? 0 : Math.max(0, Math.min(1, window.scrollY / h));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // ── Loop ─────────────────────────────────────────────────
    const clock = new THREE.Clock();
    let running = false;
    const tmp = new THREE.Vector3();
    const loop = () => {
      if (!running) return;
      const t = clock.getElapsedTime();
      const sep = scrollP * 0.34;                 // how far stones drift apart

      cairn.rotation.y += (target.y - cairn.rotation.y) * 0.05 + 0.0015;
      cairn.rotation.x += (target.x - cairn.rotation.x) * 0.05;
      cairn.position.y = Math.sin(t * 0.5) * 0.02;

      stones.forEach((s, i) => { s.position.y = s.userData.baseY + i * sep; });

      gaps.forEach((g, i) => {
        const midY = (g.a.position.y + g.a.userData.half + g.b.position.y - g.b.userData.half) / 2;
        g.disc.position.y = midY;
        g.light.position.set(0, midY, 0);
        const glow = 0.12 + scrollP * 0.85 + Math.sin(t * 1.4 + i) * 0.03;
        g.disc.material.opacity = glow;
        g.disc.scale.setScalar(1 + scrollP * 0.5);
        g.light.intensity = 0.3 + scrollP * 2.6;
      });
      pool.material.opacity = 0.1 + scrollP * 0.12;

      // gentle dolly in as you scroll
      camera.position.z = 9.4 - scrollP * 2.0;
      camera.lookAt(LOOK);

      composer.render();
      requestAnimationFrame(loop);
    };
    const play = () => { if (!running) { running = true; requestAnimationFrame(loop); } };
    const pause = () => { running = false; };

    new IntersectionObserver((es) => { es[0].isIntersecting ? play() : pause(); }, { threshold: 0 }).observe(mount);
    play();
  }
}
