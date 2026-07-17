/* ==========================================================
   Shared chip v2 builders — hero (hero3d.js) + panel (chip-panel.js)
   ----------------------------------------------------------
   "The armored core" (eruption brief §B): a floating elongated
   octagonal package — gunmetal plate, machined rim, gold lead-
   frame teeth, glossy blue modules, iridescent die — crowned by
   a GPU-driven voxel eruption (≥6000 instanced cubes, positions
   computed entirely in the vertex shader from time/progress/amp
   uniforms; zero per-frame CPU matrix writes).

   Builders run once at init. All randomness is seeded so both
   scenes show the SAME designed object. HDRI helpers unchanged
   from v6.1.
   ========================================================== */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js';

/* Seeded RNG — shared across builders (deterministic object). */
export const mulberry32 = (a) => () => {
  a |= 0; a = a + 0x6D2B79F5 | 0;
  let t = Math.imul(a ^ a >>> 15, 1 | a);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
};

/* Palette law: all glow in the #0071e3 family. Gold pins. No teal. */
const GLOW = '#0071e3';

/* Elongated-octagon outline (chamfered shield), XY plane. */
const octagonShape = (hx, hy, c) => {
  const s = new THREE.Shape();
  s.moveTo(-hx + c, -hy); s.lineTo(hx - c, -hy); s.lineTo(hx, -hy + c);
  s.lineTo(hx, hy - c); s.lineTo(hx - c, hy); s.lineTo(-hx + c, hy);
  s.lineTo(-hx, hy - c); s.lineTo(-hx, -hy + c); s.closePath();
  return s;
};
const octagonPath = (hx, hy, c) => {
  const p = new THREE.Path();
  p.moveTo(-hx + c, -hy); p.lineTo(hx - c, -hy); p.lineTo(hx, -hy + c);
  p.lineTo(hx, hy - c); p.lineTo(hx - c, hy); p.lineTo(-hx + c, hy);
  p.lineTo(-hx, hy - c); p.lineTo(-hx, -hy + c); p.closePath();
  return p;
};

/* ── Inner-board texture (brief §B.2 — drawTraceBoard) ────────
   2048² canvas: dark #0a1220 base, FINE light Manhattan routing
   (#cfe4ff @ ~55% alpha — white/silver, NOT saturated blue),
   etched region rects, raised-platform fills, pad-dot rows.
   Used as map + emissiveMap (low #0071e3 emissive = alive). */
export const drawTraceBoard = ({ size = 2048, seed = 0xB0A2D, maxAniso = 8 } = {}) => {
  const rng = mulberry32(seed);
  const c = document.createElement('canvas'); c.width = c.height = size;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#0a1220'; ctx.fillRect(0, 0, size, size);
  ctx.lineCap = 'square'; ctx.lineJoin = 'miter';

  // faint centre energy — the die area breathes under the lattice
  {
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size * 0.24);
    g.addColorStop(0, 'rgba(0,113,227,0.16)');
    g.addColorStop(1, 'rgba(0,113,227,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, size, size);
  }

  // etched region rectangles + raised-platform fills
  for (let i = 0; i < 9; i++) {
    const w = size * (0.09 + rng() * 0.2), h = size * (0.07 + rng() * 0.16);
    const x = size * 0.06 + rng() * (size * 0.88 - w), y = size * 0.06 + rng() * (size * 0.88 - h);
    if (rng() < 0.45) { ctx.fillStyle = 'rgba(190,214,255,0.045)'; ctx.fillRect(x, y, w, h); }
    ctx.strokeStyle = 'rgba(198,222,255,0.10)'; ctx.lineWidth = 3;
    ctx.strokeRect(x, y, w, h);
    if (rng() < 0.5) { ctx.strokeStyle = 'rgba(198,222,255,0.06)'; ctx.strokeRect(x + 10, y + 10, w - 20, h - 20); }
  }

  // fine Manhattan routing — two passes (main + hairline)
  const route = (n, lw, alpha) => {
    ctx.strokeStyle = `rgba(207,228,255,${alpha})`;
    ctx.fillStyle = `rgba(207,228,255,${Math.min(1, alpha + 0.08)})`;
    ctx.lineWidth = lw;
    for (let i = 0; i < n; i++) {
      let x = size * (0.28 + rng() * 0.44), y = size * (0.28 + rng() * 0.44);
      ctx.beginPath(); ctx.moveTo(x, y);
      let horiz = rng() < 0.5;
      const dirX = x > size / 2 ? 1 : -1, dirY = y > size / 2 ? 1 : -1;
      const segs = 4 + Math.floor(rng() * 4);
      for (let s = 0; s < segs; s++) {
        const len = size * (0.03 + rng() * 0.13);
        if (horiz) x += dirX * len * (rng() < 0.82 ? 1 : -1);
        else y += dirY * len * (rng() < 0.82 ? 1 : -1);
        x = Math.max(size * 0.03, Math.min(size * 0.97, x));
        y = Math.max(size * 0.03, Math.min(size * 0.97, y));
        ctx.lineTo(x, y);
        horiz = !horiz;
      }
      ctx.stroke();
      ctx.beginPath(); ctx.arc(x, y, lw * 1.9, 0, Math.PI * 2); ctx.fill();
    }
  };
  route(120, 2.4, 0.55);   // main fine traces — ~1-2px on screen
  route(90, 1.2, 0.24);    // hairline underlayer

  // pad-dot rows along the long edges (leadframe echo)
  ctx.fillStyle = 'rgba(207,228,255,0.5)';
  for (const ey of [0.055, 0.945]) {
    for (let x = size * 0.08; x < size * 0.92; x += size * 0.0155) {
      ctx.beginPath(); ctx.arc(x, size * ey, 3.2, 0, Math.PI * 2); ctx.fill();
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(8, maxAniso);
  return tex;
};

/* ── The armored core (brief §A.1-4 / §B.2) ───────────────────
   Procedural, shared verbatim by hero + panel. 11 draw calls.
   Returns the group + material lists for the HDRI env boosts.
   Key heights: plate top 0.22, rim top ~0.295, board top 0.245. */
export const buildArmoredCore = (parent, { maxAniso = 8 } = {}) => {
  const group = new THREE.Group();
  const rng = mulberry32(0xC0DE5);

  /* materials */
  const gunmetal = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#161b22'), metalness: 0.85, roughness: 0.38,
    clearcoat: 0.3, clearcoatRoughness: 0.25, envMapIntensity: 0.9,
  });
  const notchMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#0c0f14'), metalness: 0.7, roughness: 0.5, envMapIntensity: 0.6,
  });
  const screwMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#39404d'), metalness: 1, roughness: 0.3, envMapIntensity: 1.1,
  });
  const grooveMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#05070a'), metalness: 0.3, roughness: 0.8, envMapIntensity: 0.4,
  });
  const pinMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#d2b678'), metalness: 1, roughness: 0.28, envMapIntensity: 1.0,
  });
  const boardTex = drawTraceBoard({ maxAniso });
  const boardMat = new THREE.MeshStandardMaterial({
    map: boardTex, color: new THREE.Color('#ffffff'), roughness: 0.45, metalness: 0.35,
    emissive: new THREE.Color(GLOW), emissiveMap: boardTex, emissiveIntensity: 0.8,
    envMapIntensity: 0.5,
  });
  const dieMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#151b28'), roughness: 0.12, metalness: 0.9,
    iridescence: 1, iridescenceIOR: 1.6,
    emissive: new THREE.Color(GLOW), emissiveIntensity: 0.45,
  });
  const moduleMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#0b3f8f'), metalness: 0.1, roughness: 0.3,
    clearcoat: 1, clearcoatRoughness: 0.12,
    emissive: new THREE.Color(GLOW), emissiveIntensity: 0.5, envMapIntensity: 0.8,
  });
  const moduleTopMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#103a75'), metalness: 0.2, roughness: 0.25,
    emissive: new THREE.Color('#2b8bff'), emissiveIntensity: 1.2,
  });
  const stripMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#0d2f5e'), metalness: 0.3, roughness: 0.3,
    emissive: new THREE.Color('#4aa3ff'), emissiveIntensity: 1.5,
  });

  /* 1. outer armored plate — elongated octagon, machined bevel */
  const plateGeo = new THREE.ExtrudeGeometry(octagonShape(1.9, 1.35, 0.52), {
    depth: 0.12, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.06, bevelSegments: 3,
  });
  plateGeo.rotateX(-Math.PI / 2);
  const plate = new THREE.Mesh(plateGeo, gunmetal);
  plate.position.y = 0.05;                  // occupies y 0 → 0.22
  group.add(plate);
  const PLATE_TOP = 0.22;

  /* 2. inner raised rim — octagonal ring (hole = board window) */
  const rimShape = octagonShape(1.62, 1.08, 0.42);
  rimShape.holes.push(octagonPath(1.36, 0.84, 0.32));
  const rimGeo = new THREE.ExtrudeGeometry(rimShape, {
    depth: 0.05, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2,
  });
  rimGeo.rotateX(-Math.PI / 2);
  const rim = new THREE.Mesh(rimGeo, gunmetal);
  rim.position.y = 0.225;                   // rim top ≈ 0.295
  group.add(rim);

  /* side notches — machined slots overlaid through the walls */
  const notches = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), notchMat, 4);
  {
    const m = new THREE.Matrix4();
    const put = (i, x, z, sx, sz) => { m.makeScale(sx, 0.1, sz); m.setPosition(x, 0.1, z); notches.setMatrixAt(i, m); };
    put(0, 1.86, 0, 0.14, 0.6); put(1, -1.86, 0, 0.14, 0.6);
    put(2, 0, 1.3, 0.8, 0.14); put(3, 0, -1.3, 0.8, 0.14);
  }
  group.add(notches);

  /* screws — 6 machined heads + crossed grooves */
  const screwPos = [[1.5, 0.97], [-1.5, 0.97], [1.5, -0.97], [-1.5, -0.97], [1.74, 0], [-1.74, 0]];
  const screws = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.052, 0.052, 0.03, 20), screwMat, 6);
  const grooves = new THREE.InstancedMesh(new THREE.BoxGeometry(0.078, 0.008, 0.016), grooveMat, 12);
  {
    const m = new THREE.Matrix4(); const q = new THREE.Quaternion(); const e = new THREE.Euler();
    const v = new THREE.Vector3(); const one = new THREE.Vector3(1, 1, 1);
    screwPos.forEach(([x, z], i) => {
      m.makeRotationY(rng() * Math.PI);
      m.setPosition(x, PLATE_TOP + 0.004, z);
      screws.setMatrixAt(i, m);
      const a = rng() * Math.PI;
      for (let g = 0; g < 2; g++) {
        e.set(0, a + g * Math.PI / 2, 0); q.setFromEuler(e); v.set(x, PLATE_TOP + 0.016, z);
        m.compose(v, q, one);
        grooves.setMatrixAt(i * 2 + g, m);
      }
    });
  }
  group.add(screws, grooves);

  /* 3. recessed inner board — fine light routing, alive */
  const board = new THREE.Mesh(new THREE.BoxGeometry(2.76, 0.05, 1.72), boardMat);
  board.position.y = 0.22;                  // top 0.245, recessed 0.05 under rim
  group.add(board);
  const BOARD_TOP = 0.245;

  /* perimeter leadframe teeth — 116 gold pins along the rim window */
  const pins = new THREE.InstancedMesh(new THREE.BoxGeometry(0.026, 0.024, 0.055), pinMat, 116);
  {
    const m = new THREE.Matrix4(); const q = new THREE.Quaternion(); const e = new THREE.Euler();
    const v = new THREE.Vector3(); const one = new THREE.Vector3(1, 1, 1);
    let k = 0;
    for (const sz of [1, -1]) {             // long rows (top + bottom, 36 each)
      for (let i = 0; i < 36; i++) {
        const x = -0.7 + (i + 0.5) * (1.4 / 36);
        e.set(-sz * 0.16, 0, 0); q.setFromEuler(e);
        v.set(x, BOARD_TOP + 0.013, sz * 0.78);
        m.compose(v, q, one); pins.setMatrixAt(k++, m);
      }
    }
    for (const sx of [1, -1]) {             // short rows (22 each)
      for (let i = 0; i < 22; i++) {
        const z = -0.5 + (i + 0.5) * (1.0 / 22);
        e.set(-sx * 0.16, Math.PI / 2, 0); q.setFromEuler(e);
        v.set(sx * 1.28, BOARD_TOP + 0.013, z);
        m.compose(v, q, one); pins.setMatrixAt(k++, m);
      }
    }
  }
  group.add(pins);

  /* 4. glossy blue modules + bright tops + connector strips */
  const modPos = [
    { x: -0.5, z: -0.6, ry: 0 }, { x: 0.3, z: -0.6, ry: 0 },
    { x: -0.32, z: 0.6, ry: 0 }, { x: 1.0, z: 0.08, ry: Math.PI / 2 },
  ];
  const modules = new THREE.InstancedMesh(new RoundedBoxGeometry(0.52, 0.1, 0.24, 2, 0.045), moduleMat, 4);
  const moduleTops = new THREE.InstancedMesh(new THREE.BoxGeometry(0.44, 0.012, 0.17), moduleTopMat, 4);
  {
    const m = new THREE.Matrix4(); const q = new THREE.Quaternion(); const e = new THREE.Euler();
    const v = new THREE.Vector3(); const one = new THREE.Vector3(1, 1, 1);
    modPos.forEach((p, i) => {
      e.set(0, p.ry, 0); q.setFromEuler(e);
      v.set(p.x, BOARD_TOP + 0.05, p.z); m.compose(v, q, one); modules.setMatrixAt(i, m);
      v.set(p.x, BOARD_TOP + 0.106, p.z); m.compose(v, q, one); moduleTops.setMatrixAt(i, m);
    });
  }
  const strips = new THREE.InstancedMesh(new THREE.BoxGeometry(0.5, 0.026, 0.062), stripMat, 2);
  {
    const m = new THREE.Matrix4();
    m.identity(); m.setPosition(0.55, BOARD_TOP + 0.013, 0.45); strips.setMatrixAt(0, m);
    m.makeRotationY(Math.PI / 2); m.setPosition(-1.0, BOARD_TOP + 0.013, -0.28); strips.setMatrixAt(1, m);
  }
  group.add(modules, moduleTops, strips);

  /* centre die — small iridescent crown (hero recipe) */
  const die = new THREE.Mesh(new RoundedBoxGeometry(0.5, 0.04, 0.5, 2, 0.012), dieMat);
  die.position.y = BOARD_TOP + 0.02;
  group.add(die);

  parent.add(group);
  return {
    group, dieMat, boardTop: BOARD_TOP, plateTop: PLATE_TOP,
    metals: [screwMat, pinMat, dieMat],
    bodies: [gunmetal, notchMat, grooveMat, boardMat, moduleMat, moduleTopMat, stripMat],
  };
};

/* ── THE ERUPTION (brief §B.3 — the star) ─────────────────────
   One InstancedBufferGeometry draw call: 6144 tiny cubes whose
   positions are a PURE FUNCTION of (uProgress, per-voxel seed)
   in the vertex shader — the ~10s sine ping-pong retraces the
   exact same curved path in reverse, so the collapse reads as
   settling, never rewind jank. Time only drives turbulence and
   flicker (monotonic — alive in both directions). CPU cost per
   frame: 4 uniform writes. At uProgress≈0 the voxels rest as a
   calm 48×32×4 glowing lattice over the die; as progress rises
   they take off centre-first (staggered smoothstep), rise along
   a +X-biased curved sheet, scatter, shrink and dissolve.
   Colour ramps white-hot → #4aa3ff → #0071e3 by path height.  */
export const buildEruption = (parent, { boardTop = 0.245, seed = 0xE59 } = {}) => {
  const NX = 48, NZ = 32, NL = 4;           // 6144 voxels
  const COUNT = NX * NZ * NL;
  const rng = mulberry32(seed);
  const origins = new Float32Array(COUNT * 3);
  const rands = new Float32Array(COUNT * 3);
  let k = 0;
  for (let ly = 0; ly < NL; ly++) {
    for (let ix = 0; ix < NX; ix++) {
      for (let iz = 0; iz < NZ; iz++) {
        const x = -0.8 + (ix + 0.5) * (1.6 / NX) + (rng() - 0.5) * 0.012;
        const z = -0.55 + (iz + 0.5) * (1.1 / NZ) + (rng() - 0.5) * 0.012;
        origins[k * 3] = x;
        origins[k * 3 + 1] = boardTop + 0.045 + ly * 0.03 + (rng() - 0.5) * 0.012;
        origins[k * 3 + 2] = z;
        const dN = Math.min(1, Math.hypot(x / 0.8, z / 0.55) / 1.42);
        rands[k * 3] = rng();                                    // seed
        rands[k * 3 + 1] = Math.max(0, Math.min(1, 0.55 * dN + 0.45 * rng() - ly * 0.02)) * 0.96; // stagger (centre first)
        rands[k * 3 + 2] = 0.75 + rng() * 0.7;                   // size variance
        k++;
      }
    }
  }

  const base = new THREE.BoxGeometry(0.022, 0.022, 0.022);
  const geo = new THREE.InstancedBufferGeometry();
  geo.index = base.index;
  geo.setAttribute('position', base.getAttribute('position'));
  geo.instanceCount = COUNT;
  geo.setAttribute('aOrigin', new THREE.InstancedBufferAttribute(origins, 3));
  geo.setAttribute('aRand', new THREE.InstancedBufferAttribute(rands, 3));

  const uniforms = {
    uTime: { value: 0 },
    uProgress: { value: 0 },
    uAmp: { value: 1 },
    uOpacity: { value: 1 },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */`
      uniform float uTime, uProgress, uAmp;
      attribute vec3 aOrigin;
      attribute vec3 aRand;
      varying float vLp;
      varying float vFlick;
      float h1(float n) { return fract(sin(n) * 43758.5453123); }
      void main() {
        float seed = aRand.x, s = aRand.y, szr = aRand.z;
        // staggered local progress — pure function of uProgress (reversible).
        // 0.82 remap: at pendulum peak a full column still stands (the
        // earliest voxels have dissolved, the perimeter still feeds it).
        float lp = smoothstep(s, s + 0.25, uProgress * 0.82);
        float hMax = (1.05 + 1.95 * seed) * uAmp;
        float rise = lp * (0.5 + 0.5 * lp);                    // accelerating ascent
        float a1 = h1(seed * 17.31) - 0.5;
        float a2 = h1(seed * 29.7) - 0.5;
        vec3 p = vec3(
          aOrigin.x * (1.0 + lp * 0.35)
            + (0.5 + 0.8 * seed) * lp * lp * 1.15 * uAmp        // +X curved-sheet drift
            + a1 * lp * lp * 1.9 * uAmp,                        // top scatter
          aOrigin.y + rise * hMax,
          aOrigin.z * (1.0 + lp * 0.55) + a2 * lp * lp * 1.5 * uAmp);
        // turbulence — time-forward, zero in the resting lattice
        float w = uTime * (1.4 + 2.2 * seed) + seed * 271.0;
        p += vec3(sin(w), sin(w * 1.31 + 1.7), cos(w * 0.83 + 4.2))
             * (lp * (0.05 + 0.10 * lp)) * uAmp;
        float sc = szr * (1.0 - 0.62 * lp * lp * lp);           // shrink near the top
        vLp = lp;
        vFlick = 0.8 + 0.25 * sin(uTime * (1.5 + 3.0 * seed) + seed * 40.0);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position * sc + p, 1.0);
      }`,
    fragmentShader: /* glsl */`
      uniform float uOpacity;
      varying float vLp;
      varying float vFlick;
      void main() {
        // resting lattice: calm dim #0071e3 family. In flight: white-hot
        // at the base -> #4aa3ff -> #0071e3 by height (linear-space).
        vec3 bed  = vec3(0.03, 0.21, 0.85);
        vec3 hot  = vec3(1.5, 1.7, 2.1);
        vec3 mid  = vec3(0.069, 0.366, 1.0) * 1.4;
        vec3 core = vec3(0.0, 0.165, 0.768);
        float e = smoothstep(0.01, 0.14, vLp);                  // bed -> flight energy
        vec3 col = mix(hot, mid, smoothstep(0.06, 0.45, vLp));
        col = mix(col, core, smoothstep(0.4, 0.95, vLp));
        col = mix(bed, col, e);
        float glow = mix(0.16, 1.0, e) * vFlick;                // 4 additive layers: keep the bed quiet
        float fade = 1.0 - smoothstep(0.72, 1.0, vLp);          // dissolve at the crown
        gl_FragColor = vec4(col * glow * fade * uOpacity, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;               // positions live in the shader
  mesh.renderOrder = 10;
  parent.add(mesh);
  return { mesh, uniforms, count: COUNT };
};

/* ── Void grounding (brief §B.1) — soft blue glow pool ──────── */
export const buildGlowPool = (parent, { y = -0.85, size = 7.5 } = {}) => {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, 'rgba(120,175,255,0.7)');
  g.addColorStop(0.25, 'rgba(0,113,227,0.5)');
  g.addColorStop(0.6, 'rgba(0,113,227,0.16)');
  g.addColorStop(1, 'rgba(0,113,227,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(size, size),
    new THREE.MeshBasicMaterial({
      map: tex, transparent: true, blending: THREE.AdditiveBlending,
      depthWrite: false, opacity: 0.8,
    })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = y;
  parent.add(mesh);
  return mesh;
};

/* ── Micro-grain shader (kept from v6.1) ──────────────────────
   Animated film grain, pixel-locked via gl_FragCoord (no uv
   scaling → no moiré). Runs after bloom, before OutputPass, so
   the noise is tonemapped with the frame. amount ≤ 0.035. */
export const GrainShader = {
  name: 'AzenGrainShader',
  uniforms: {
    tDiffuse: { value: null },
    time: { value: 0 },
    amount: { value: 0.03 },
  },
  vertexShader: /* glsl */`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,
  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse;
    uniform float time;
    uniform float amount;
    varying vec2 vUv;
    void main() {
      vec4 c = texture2D(tDiffuse, vUv);
      float t = mod(time, 100.0);
      float n = fract(sin(dot(gl_FragCoord.xy + vec2(t * 137.1, t * 291.7), vec2(12.9898, 78.233))) * 43758.5453);
      gl_FragColor = vec4(max(c.rgb + (n - 0.5) * 2.0 * amount, vec3(0.0)), c.a);
    }`,
};

/* ── HDRI environment (kept from v6.1) ────────────────────────
   One shared fetch/parse of /hdri/env.hdr (CC0 PolyHaven night)
   across scenes; each renderer runs its own PMREM. Callers keep
   RoomEnvironment as the instant fallback and swap when ready —
   first paint never waits. On failure the fallback simply stays
   (warn, not error). */
let hdrPromise = null;
const loadHDRTexture = () =>
  (hdrPromise ||= new HDRLoader().loadAsync('/hdri/env.hdr').then((t) => {
    t.mapping = THREE.EquirectangularReflectionMapping;
    return t;
  }));

export const applyHDREnvironment = (renderer, scene, onApplied) => {
  loadHDRTexture().then((tex) => {
    const pm = new THREE.PMREMGenerator(renderer);
    const env = pm.fromEquirectangular(tex).texture;
    pm.dispose();
    const old = scene.environment;
    scene.environment = env;
    if (old) old.dispose();
    if (onApplied) onApplied();
  }).catch((err) => {
    console.warn('[azen] HDRI env unavailable — RoomEnvironment fallback kept', err);
  });
};

/* Multiply envMapIntensity on a batch of materials — used after
   the HDRI swap to hold the scene's value range (the night HDRI
   is dimmer than RoomEnvironment; palette must not shift). */
export const boostEnvIntensity = (materials, factor) => {
  for (const mat of materials) mat.envMapIntensity *= factor;
};
