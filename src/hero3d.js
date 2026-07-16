/* ==========================================================
   Azen hero — "The Azen Core" (Three.js r0.185)
   ----------------------------------------------------------
   A matte-black data chip seated on a navy PCB whose circuit
   traces glow #0071e3. Data pulses travel the traces; the die
   breathes. As you scroll, the camera dollies toward the die,
   the traces brighten, and past 55% the package lid lifts —
   revealing a glowing 6×6 die-grid underneath. Opening the
   system.

   100% procedural — geometry + CanvasTexture drawn in code.
   No models, no images, no video. The pipeline is ours.

   Progressive + safe (unchanged gates):
   - No WebGL / context loss  → CSS glow-ground stays visible
   - prefers-reduced-motion   → single static frame
   - scrolled past the hero   → render loop parks (battery)
   ========================================================== */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

const mount = document.getElementById('hero-3d');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const fail = () => { if (mount) mount.setAttribute('data-3d', 'off'); };

// small seeded RNG so the routing is designed, not random each load
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
    renderer.toneMappingExposure = 0.9;
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
      g.addColorStop(0, '#0c1424'); g.addColorStop(0.55, '#081020'); g.addColorStop(1, '#04060e');
      ctx.fillStyle = g; ctx.fillRect(0, 0, 2, 256);
      const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; return tex;
    })();
    scene.fog = new THREE.Fog(new THREE.Color('#06102a'), 11, 26);

    // Camera — 3/4 low hero angle. The look target sits up-left of the
    // chip in screen space so the chip carries the lower-right visual
    // weight (hero copy is corner-anchored; centre-right stays clear).
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    const HERO_POS = new THREE.Vector3(3.4, 2.2, 5.6);
    const INTRO_POS = new THREE.Vector3(4.6, 3.2, 8);
    const LOOK_BASE = new THREE.Vector3(-0.6, 0.7, 0.2);
    const lookCur = LOOK_BASE.clone();
    camera.position.copy(reduceMotion ? HERO_POS : INTRO_POS);
    camera.lookAt(lookCur);

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    // everything that floats / parallaxes lives on the rig
    const rig = new THREE.Group();
    scene.add(rig);

    /* ── 1. PCB plane + procedural circuit traces ─────────────
       Manhattan-routed escape traces radiate from the chip
       footprint. Drawn once into a 2048² canvas (emissiveMap);
       a subset of the same polylines is kept for data pulses. */
    const rng = mulberry32(20260716);
    const PCB = 28;               // plane size; detailed region ≈ 24×24
    const TEX = 2048;
    const traces = [];
    const EDGES = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    for (const [ox, oz] of EDGES) {
      for (let i = 0; i < 22; i++) {
        const lat = -1.08 + (i + 0.5) * (2.16 / 22) + (rng() - 0.5) * 0.03;
        let x = ox !== 0 ? ox * 1.42 : lat;
        let z = oz !== 0 ? oz * 1.42 : lat;
        const pts = [x, z];
        let outward = true;
        const segs = 3 + Math.floor(rng() * 4);
        for (let s = 0; s < segs; s++) {
          if (outward) {
            const len = 0.7 + rng() * 2.1;
            x += ox * len; z += oz * len;
          } else {
            const len = (0.18 + rng() * 0.75) * (rng() < 0.5 ? -1 : 1);
            if (ox !== 0) z += len; else x += len;
          }
          x = Math.max(-13, Math.min(13, x));
          z = Math.max(-13, Math.min(13, z));
          pts.push(x, z);
          outward = !outward;
        }
        traces.push({ pts, bright: rng() < 0.16, wide: rng() < 0.14 });
      }
    }
    const traceTex = (() => {
      const c = document.createElement('canvas'); c.width = c.height = TEX;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, TEX, TEX);
      const px = (w) => (w / PCB + 0.5) * TEX;      // world x/z → canvas px
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for (const tr of traces) {
        const col = tr.bright ? '#4aa3ff' : '#0071e3';
        ctx.strokeStyle = col; ctx.fillStyle = col;
        ctx.lineWidth = tr.wide ? 5 : 3;
        ctx.beginPath();
        ctx.moveTo(px(tr.pts[0]), px(tr.pts[1]));
        for (let i = 2; i < tr.pts.length; i += 2) ctx.lineTo(px(tr.pts[i]), px(tr.pts[i + 1]));
        ctx.stroke();
        const n = tr.pts.length;
        ctx.beginPath();
        ctx.arc(px(tr.pts[n - 2]), px(tr.pts[n - 1]), tr.wide ? 7 : 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      return tex;
    })();
    const pcbMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#060c1c'), roughness: 0.4, metalness: 0.55,
      emissive: BLUE, emissiveMap: traceTex, emissiveIntensity: reduceMotion ? 1.4 : 0,
      envMapIntensity: 0.5,
    });
    const pcb = new THREE.Mesh(new THREE.PlaneGeometry(PCB, PCB), pcbMat);
    pcb.rotation.x = -Math.PI / 2;
    pcb.receiveShadow = true;
    rig.add(pcb);

    /* ── 1b. Package lid + die (the lid lifts on scroll) ────── */
    const lid = new THREE.Group();
    rig.add(lid);
    const pkg = new THREE.Mesh(
      new RoundedBoxGeometry(2.3, 0.28, 2.3, 4, 0.06),
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#0b0e15'), roughness: 0.42, metalness: 0.35,
        clearcoat: 0.6, clearcoatRoughness: 0.25, envMapIntensity: 0.7,
      })
    );
    pkg.position.y = 0.141;                    // bottom rests just above PCB
    pkg.castShadow = true; pkg.receiveShadow = true;
    lid.add(pkg);
    const dieMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#151b28'), roughness: 0.12, metalness: 0.9,
      iridescence: 1, iridescenceIOR: 1.6,
      emissive: BLUE, emissiveIntensity: 0.45,
    });
    const die = new THREE.Mesh(new RoundedBoxGeometry(0.95, 0.06, 0.95, 3, 0.02), dieMat);
    die.position.y = 0.285;                    // inset, sitting proud of the top
    die.castShadow = true;
    lid.add(die);

    /* ── 1c. Pins — 4 edges × 26, instanced cool gold ───────── */
    const pinMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#b9a06a'), metalness: 1, roughness: 0.35, envMapIntensity: 0.9,
    });
    const pins = new THREE.InstancedMesh(new THREE.BoxGeometry(0.045, 0.05, 0.14), pinMat, 104);
    {
      const m = new THREE.Matrix4();
      let k = 0;
      for (const [ox, oz] of EDGES) {
        for (let i = 0; i < 26; i++) {
          const lat = -1.125 + (i + 0.5) * (2.25 / 26);
          m.makeRotationY(ox !== 0 ? Math.PI / 2 : 0);
          m.setPosition(ox !== 0 ? ox * 1.205 : lat, 0.025, oz !== 0 ? oz * 1.205 : lat);
          pins.setMatrixAt(k++, m);
        }
      }
    }
    pins.castShadow = true; pins.receiveShadow = true;
    rig.add(pins);

    /* ── 1d. Under the lid: substrate pad + 6×6 die-grid ────── */
    const pad = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.03, 2.2),
      new THREE.MeshStandardMaterial({ color: new THREE.Color('#0a0f1a'), roughness: 0.5, metalness: 0.4 })
    );
    pad.position.y = 0.015;
    rig.add(pad);
    const gridMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#0a1224'), roughness: 0.3, metalness: 0.6,
      emissive: BLUE_BRIGHT, emissiveIntensity: 0,
    });
    const grid = new THREE.InstancedMesh(new THREE.BoxGeometry(0.22, 0.035, 0.22), gridMat, 36);
    {
      const m = new THREE.Matrix4();
      let k = 0;
      for (let gx = 0; gx < 6; gx++) for (let gz = 0; gz < 6; gz++) {
        m.makeTranslation(-0.7917 + gx * 0.3167, 0.0475, -0.7917 + gz * 0.3167);
        grid.setMatrixAt(k++, m);
      }
    }
    rig.add(grid);

    /* ── 1e. Data pulses along the traces ─────────────────────
       36 additive sprites on 8 of the routed polylines (2 per
       edge), looping at varied speeds. Scroll accelerates them. */
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
    const lanes = [];
    for (let e = 0; e < 4; e++) {
      for (const off of [5, 16]) {
        const src = traces[e * 22 + off].pts;
        const pts = []; const cum = [0];
        pts.push(src[0], src[1]);
        for (let i = 2; i < src.length; i += 2) {
          const dx = src[i] - pts[pts.length - 2], dz = src[i + 1] - pts[pts.length - 1];
          const len = Math.hypot(dx, dz);
          if (len < 0.01) continue;
          pts.push(src[i], src[i + 1]);
          cum.push(cum[cum.length - 1] + len);
        }
        lanes.push({ pts: new Float32Array(pts), cum: new Float32Array(cum), total: cum[cum.length - 1] });
      }
    }
    const PULSES = 36;
    const pulsePos = new Float32Array(PULSES * 3);
    const pulsePhase = new Float32Array(PULSES);
    const pulseSpeed = new Float32Array(PULSES);
    const pulseLane = new Uint8Array(PULSES);
    for (let i = 0; i < PULSES; i++) {
      pulseLane[i] = i % lanes.length;
      pulsePhase[i] = (i / PULSES + rng() * 0.3) % 1;
      pulseSpeed[i] = 0.45 + rng() * 0.85;      // world units / s
      pulsePos[i * 3 + 1] = 0.03;
    }
    const placePulses = () => {
      for (let i = 0; i < PULSES; i++) {
        const L = lanes[pulseLane[i]];
        const d = pulsePhase[i] * L.total;
        let j = 0;
        while (j < L.cum.length - 2 && L.cum[j + 1] < d) j++;
        const f = (d - L.cum[j]) / (L.cum[j + 1] - L.cum[j]);
        const k = 2 * j;
        pulsePos[i * 3] = L.pts[k] + (L.pts[k + 2] - L.pts[k]) * f;
        pulsePos[i * 3 + 2] = L.pts[k + 1] + (L.pts[k + 3] - L.pts[k + 1]) * f;
      }
    };
    placePulses();
    const pulseGeo = new THREE.BufferGeometry();
    const pulseAttr = new THREE.BufferAttribute(pulsePos, 3);
    pulseGeo.setAttribute('position', pulseAttr);
    const pulses = new THREE.Points(pulseGeo, new THREE.PointsMaterial({
      color: BLUE_BRIGHT, map: dotTex, size: 0.14, sizeAttenuation: true,
      transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    pulses.frustumCulled = false;
    rig.add(pulses);

    /* ── 1f. Atmosphere — sparse blue dust ──────────────────── */
    const DUST = 700;
    const dustPos = new Float32Array(DUST * 3);
    for (let i = 0; i < DUST; i++) {
      const r = 3.2 + rng() * 10.5, a = rng() * Math.PI * 2;
      dustPos[i * 3] = Math.cos(a) * r;
      dustPos[i * 3 + 1] = 0.15 + Math.pow(rng(), 1.7) * 5.2;
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
    const key = new THREE.DirectionalLight(0xeaf1ff, 1.4);
    key.position.set(4.5, 7.5, 4.5);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.near = 1; key.shadow.camera.far = 20;
    key.shadow.camera.left = -3.4; key.shadow.camera.right = 3.4;
    key.shadow.camera.top = 3.4; key.shadow.camera.bottom = -3.4;
    key.shadow.bias = -0.0004;
    scene.add(key);
    const rim = new THREE.DirectionalLight(BLUE, 1.3);
    rim.position.set(-6, 2.5, -4);
    scene.add(rim);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.5, 0.6, 0.72);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());

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
      if (!h) { scrollP = 0; return; } // 0-height init guard (QA: NaN poisons pulse accumulators)
      scrollP = reduceMotion ? 0 : Math.max(0, Math.min(1, window.scrollY / h));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // debug handle for QA — do not remove
    window.__azenChip = {
      get camZ() { return camera.position.z; },
      get lidY() { return lid.position.y; },
      get zoomComp() { return zoomComp; },
      pulses: PULSES,
    };

    const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);
    const clock = new THREE.Clock();
    const basePos = new THREE.Vector3();
    const lookDie = new THREE.Vector3();
    let running = false, t = 0, introT = reduceMotion ? 1.4 : 0, smYaw = 0, smPitch = 0;

    const loop = () => {
      if (!running) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      t += dt;
      if (introT < 1.4) introT = Math.min(1.4, introT + dt);
      const e = easeOutCubic(introT / 1.4);
      const p = scrollP;

      // idle: float, slow yaw sway, cursor parallax
      smYaw += (yawTarget - smYaw) * 0.05;
      smPitch += (pitchTarget - smPitch) * 0.05;
      rig.rotation.y = smYaw + Math.sin(t * 0.22) * 0.052;  // ±3°
      rig.rotation.x = smPitch;
      rig.position.y = Math.sin(t * 0.5) * 0.04;

      // living materials
      dieMat.emissiveIntensity = 0.45 + Math.sin(t * 1.1) * 0.2;   // breathe .25→.65
      pcbMat.emissiveIntensity = 1.4 * e * (1 + 0.4 * p);          // intro fade + scroll boost

      // lid lift past p=0.55 — reveals the die-grid ("opening the system")
      const lt = easeOutCubic(Math.max(0, Math.min(1, (p - 0.55) / 0.45)));
      lid.position.y = lt * 0.18;
      gridMat.emissiveIntensity = 2.4 * lt;

      // data pulses (scroll accelerates)
      const speedF = 1 + 1.5 * p;
      for (let i = 0; i < PULSES; i++) {
        const L = lanes[pulseLane[i]];
        pulsePhase[i] = (pulsePhase[i] + dt * pulseSpeed[i] * speedF / L.total) % 1;
      }
      placePulses();
      pulseAttr.needsUpdate = true;

      dust.rotation.y = t * 0.008;

      // camera: load-in ease, then scroll dolly toward the die
      // (x/z scaled by zoomComp so portrait screens keep the chip framed)
      basePos.lerpVectors(INTRO_POS, HERO_POS, e);
      camera.position.set(basePos.x * zoomComp, basePos.y - 0.6 * p, (basePos.z - 2.2 * p) * zoomComp);
      lookDie.set(0, 0.31 + lid.position.y, 0);
      lookCur.lerpVectors(LOOK_BASE, lookDie, p);
      camera.lookAt(lookCur);

      bloom.strength = 0.5 + 0.25 * p;

      composer.render();
      requestAnimationFrame(loop);
    };

    if (reduceMotion) {
      // single designed still: hero framing, traces on, lid closed
      composer.render();
    } else {
      const play = () => { if (!running) { running = true; clock.getDelta(); requestAnimationFrame(loop); } };
      const pause = () => { running = false; };
      new IntersectionObserver((es) => { es[0].isIntersecting ? play() : pause(); }, { threshold: 0 }).observe(mount);
      play();
    }
  }
}
