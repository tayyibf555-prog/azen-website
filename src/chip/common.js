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
    color: new THREE.Color('#e8cd92'), metalness: 1, roughness: 0.26, envMapIntensity: 1.4,
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

  /* perimeter leadframe teeth — chunky DOUBLE gold ladders (berco) */
  const pins = new THREE.InstancedMesh(new THREE.BoxGeometry(0.048, 0.06, 0.07), pinMat, 116);
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
  /* v3 — "the wave curtain" (overseer hand-build, reference-matched):
     256 CLUSTERS × 48 voxels = 12288. Clusters ride a diagonal RIDGE
     across the die and rise as a dense curtain whose crest FOLDS OVER
     like a breaking wave; voxels cluster into chunky clumps that break
     apart near the crown. A hot CORE column (center clusters) reads as
     a solid white-hot mass. Everything is still a pure function of
     (uProgress, seeds) — the pendulum reverses as true settling. */
  const NC = 256, PER = 48;
  const COUNT = NC * PER;
  const rng = mulberry32(seed);

  // ridge frame (matches the reference's diagonal sheet)
  const AX = 0.9435, AZ = 0.3314;           // ridge dir  A = norm(1, .35)
  const NXd = -0.3314, NZd = 0.9435;        // ridge norm N

  const beds = new Float32Array(COUNT * 3);   // resting-bed position
  const clus = new Float32Array(COUNT * 4);   // cluSeed, u, cluH, coreW
  const locs = new Float32Array(COUNT * 4);   // along, up, normal, sizeVar
  const rnds = new Float32Array(COUNT * 2);   // voxelSeed, stagger
  const g2 = () => (rng() + rng() - 1);       // cheap gaussian-ish
  let k = 0;
  for (let c = 0; c < NC; c++) {
    const cs = rng();
    const r = rng() * 2 - 1;
    const u = Math.sign(r) * Math.pow(Math.abs(r), 1.8) * 0.9;   // dense CENTRE (pow>1 pulls in)
    const coreW = Math.max(0, 1 - Math.abs(u) / 0.32);           // hot core band
    const cluH = 0.5 + 0.5 * rng();
    // stagger is NOISE-driven (not |u|): the base stays fed across the whole
    // ridge at peak — one contiguous glowing seam, not end-feet
    const baseStag = Math.min(0.9, Math.max(0, 0.08 + rng() * 0.66 - coreW * 0.06));
    for (let i = 0; i < PER; i++) {
      const la = g2() * 0.30, lu = (rng() + rng()) * 0.5, ln = g2() * 0.13;
      beds[k * 3]     = AX * u * 0.95 + AX * la * 0.9 + NXd * ln * 1.7;
      beds[k * 3 + 1] = boardTop + 0.04 + lu * (0.09 + 0.11 * coreW);
      beds[k * 3 + 2] = AZ * u * 0.95 + AZ * la * 0.9 + NZd * ln * 1.7;
      clus[k * 4] = cs; clus[k * 4 + 1] = u; clus[k * 4 + 2] = cluH; clus[k * 4 + 3] = coreW;
      locs[k * 4] = la; locs[k * 4 + 1] = lu * 0.34; locs[k * 4 + 2] = ln;
      locs[k * 4 + 3] = (0.55 + rng() * 1.75) * (1 + coreW * 0.45);
      rnds[k * 2] = rng();
      // wide stagger → the column stays FED at peak (standing curtain,
      // not a hollow middle): late starters are still mid-flight at p=1.
      rnds[k * 2 + 1] = Math.max(0, Math.min(0.97, baseStag + (rng() - 0.35) * 0.3));
      k++;
    }
  }

  const base = new THREE.BoxGeometry(0.032, 0.032, 0.032);
  const geo = new THREE.InstancedBufferGeometry();
  geo.index = base.index;
  geo.setAttribute('position', base.getAttribute('position'));
  geo.instanceCount = COUNT;
  geo.setAttribute('aBed', new THREE.InstancedBufferAttribute(beds, 3));
  geo.setAttribute('aClu', new THREE.InstancedBufferAttribute(clus, 4));
  geo.setAttribute('aLoc', new THREE.InstancedBufferAttribute(locs, 4));
  geo.setAttribute('aRnd', new THREE.InstancedBufferAttribute(rnds, 2));

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
      attribute vec3 aBed;
      attribute vec4 aClu;   // cluSeed, u, cluH, coreW
      attribute vec4 aLoc;   // along, up, normal, sizeVar
      attribute vec2 aRnd;   // voxelSeed, stagger
      varying float vLp;
      varying float vCore;
      varying float vFlake;
      varying float vFlick;
      const vec3 A = vec3(0.9435, 0.0, 0.3314);
      const vec3 N = vec3(-0.3314, 0.0, 0.9435);
      float h1(float n) { return fract(sin(n) * 43758.5453123); }
      void main() {
        float cs = aClu.x, u = aClu.y, cluH = aClu.z, coreW = aClu.w;
        float seed = aRnd.x, s = aRnd.y, szr = aLoc.w;
        // staggered local progress — reversible pure function of uProgress
        float lp = smoothstep(s, s + 0.22, uProgress * 0.8);
        // ascent: fast rise, easing off as the crest folds
        float cf = smoothstep(0.55, 1.0, lp);                 // crest factor
        float rise = (lp * lp * (3.0 - 2.0 * lp)) * (1.0 - 0.22 * cf);
        float H = (1.7 + 1.5 * cluH) * uAmp;                  // up to ~3.2 world
        // the wave: cluster path = ridge seat + fold-over + slight widen
        // ONE fold direction — a single breaking crest, not two torn sheets
        float fold = cf * cf * (0.8 + 0.6 * cs) * 1.0 * uAmp;
        // CONVERGE toward ridge-centre as it climbs — one curtain, not twin
        // towers (the old +u "widen" split the ends apart)
        float widen = -u * lp * 0.32 * uAmp;   // converge, but keep body texture
        vec3 p = aBed
          + A * widen
          + N * fold
          + vec3(0.0, rise * H, 0.0);
        // clumps break apart near the crown (local offsets grow)
        float breakK = 1.0 + lp * lp * (1.7 + 1.4 * h1(cs * 13.7));
        vec3 loc = A * aLoc.x * 0.9 + vec3(0.0, aLoc.y, 0.0) + N * aLoc.z * 1.7;
        p += loc * (breakK - 1.0);
        // crown scatter — flakes leave the sheet (core stays coherent)
        float scat = cf * cf * (1.0 - coreW * 0.7) * 1.5 * uAmp;
        p += vec3(h1(seed * 17.31) - 0.5, (h1(seed * 23.9) - 0.5) * 0.6, h1(seed * 29.7) - 0.5) * scat;
        // turbulence — time-forward churn, calm in the bed, calmer in core
        float w = uTime * (1.3 + 2.1 * seed) + seed * 271.0;
        p += vec3(sin(w), sin(w * 1.31 + 1.7), cos(w * 0.83 + 4.2))
             * (lp * (0.05 + 0.11 * lp)) * uAmp * (1.0 - 0.55 * coreW);
        float sc = szr * (1.0 - 0.5 * lp * lp * lp);
        vLp = lp; vCore = coreW;
        vFlake = step(0.55, h1(seed * 7.7));   // flakes dissolve; body persists
        vFlick = 0.82 + 0.22 * sin(uTime * (1.5 + 3.0 * seed) + seed * 40.0);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position * sc + p, 1.0);
      }`,
    fragmentShader: /* glsl */`
      uniform float uOpacity;
      varying float vLp;
      varying float vCore;
      varying float vFlake;
      varying float vFlick;
      void main() {
        // bed: calm dim blue. Flight: white-hot base -> #4aa3ff -> #0071e3.
        // The core column stays hotter for longer (the solid glowing mass).
        vec3 bed  = vec3(0.03, 0.21, 0.85);
        vec3 hot  = vec3(1.25, 1.55, 1.95);   // white-hot, leaning cool
        vec3 mid  = vec3(0.069, 0.366, 1.0) * 1.5;
        vec3 outr = vec3(0.0, 0.165, 0.768) * 1.35;
        float e = smoothstep(0.01, 0.12, vLp);
        vec3 col = mix(hot, mid, smoothstep(0.05, 0.5, vLp * (1.0 - 0.35 * vCore)));
        col = mix(col, outr, smoothstep(0.55, 1.0, vLp * (1.0 - 0.3 * vCore)));
        col = mix(bed, col, e);
        // additive stack discipline: the standing body must SUM to bright,
        // not each voxel alone (v3.1 blowout fix)
        float glow = mix(0.15, 0.5, e) * vFlick * (1.0 + 0.45 * vCore);
        // only FLAKES dissolve at the crown; the curtain body + core stand
        float dis = smoothstep(0.7, 1.0, vLp) * mix(0.22, 1.0, vFlake) * (1.0 - 0.6 * vCore);
        float fade = 1.0 - dis;
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

/* ── Plume practical light ─────────────────────────────────────
   The reference's eruption ILLUMINATES the object — the plume is
   the key light. Callers drive intensity/height from pendulum
   progress each frame: intensity ≈ 55·progress·amp, y rises
   with the column. Cheap fake GI, huge realism return. */
export const buildPlumeLight = (parent, { boardTop = 0.245 } = {}) => {
  const light = new THREE.PointLight(new THREE.Color('#4aa3ff'), 0, 12, 2);
  light.position.set(0.12, boardTop + 0.5, 0.05);
  parent.add(light);
  return light;
};

/* ── The lid — brushed spun-steel, "azen." engraved ───────────
   Berco's resting hero is a CLOSED chip: a big radial-brushed
   metal lid on a stepped pedestal. Canvas texture: spun-brush
   concentric arcs + engraved wordmark (dark inset + light lip). */
const drawLidTexture = (size = 1024) => {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const ctx = c.getContext('2d');
  const cx = size / 2, cy = size / 2;
  ctx.fillStyle = '#b9bfc7'; ctx.fillRect(0, 0, size, size);
  // spun brush: hundreds of faint concentric arcs, alpha-noised
  const rr = mulberry32(0x51D);
  for (let i = 0; i < 900; i++) {
    const rad = rr() * size * 0.72;
    const a0 = rr() * Math.PI * 2, a1 = a0 + 0.25 + rr() * 1.6;
    ctx.strokeStyle = `rgba(${rr() < 0.5 ? '255,255,255' : '40,46,56'},${0.02 + rr() * 0.05})`;
    ctx.lineWidth = 0.6 + rr() * 1.4;
    ctx.beginPath(); ctx.arc(cx, cy, rad, a0, a1); ctx.stroke();
  }
  // radial shading: bright ring at 1/3, darker rim
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.7);
  g.addColorStop(0, 'rgba(255,255,255,0.10)');
  g.addColorStop(0.33, 'rgba(255,255,255,0.16)');
  g.addColorStop(0.7, 'rgba(30,34,42,0.18)');
  g.addColorStop(1, 'rgba(10,12,16,0.32)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, size, size);
  // engraved wordmark — dark inset with a light bottom lip
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `600 ${size * 0.11}px 'Hanken Grotesk', Helvetica, sans-serif`;
  ctx.fillStyle = 'rgba(235,240,246,0.5)';
  ctx.fillText('azen.', cx, cy + size * 0.004);   // light lip below
  ctx.fillStyle = 'rgba(24,28,36,0.78)';
  ctx.fillText('azen.', cx, cy - size * 0.002);   // dark inset
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
};

export const buildLid = (parent, { boardTop = 0.245 } = {}) => {
  const lid = new THREE.Group();
  // TALL layered stack (berco: armor → deck → pedestal steps → thick lid)
  const pedMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#12161d'), metalness: 0.85, roughness: 0.4,
    clearcoat: 0.4, clearcoatRoughness: 0.3, envMapIntensity: 2.0,
  });
  const step1 = new THREE.Mesh(new RoundedBoxGeometry(2.15, 0.1, 2.15, 3, 0.03), pedMat);
  step1.position.y = boardTop + 0.06;
  const step2 = new THREE.Mesh(new RoundedBoxGeometry(2.0, 0.14, 2.0, 3, 0.03), pedMat);
  step2.position.y = boardTop + 0.17;
  lid.add(step1, step2);
  const lidTex = drawLidTexture();
  const plateMat = new THREE.MeshPhysicalMaterial({
    map: lidTex, metalness: 1, roughness: 0.22,
    clearcoat: 0.6, clearcoatRoughness: 0.15, envMapIntensity: 3.4,
    // faint self-read: brush pattern + engraving stay visible at grazing
    // angles under the dim night HDRI (berco's lid always reads bright)
    emissive: new THREE.Color('#9aa4b2'), emissiveMap: lidTex, emissiveIntensity: 0.16,
  });
  const plate = new THREE.Mesh(new RoundedBoxGeometry(1.86, 0.14, 1.86, 4, 0.06), plateMat);
  plate.position.y = boardTop + 0.31;
  lid.add(plate);
  parent.add(lid);
  return { group: lid, plateMat, mats: [pedMat, plateMat], restY: 0 };
};

/* ── Seam arcs — the living electricity ───────────────────────
   ~10 jagged polylines crawling the pedestal seam, regenerated
   stochastically (each arc lives 60-200ms). Additive, blue-white.
   update(t, intensity) each frame; a flickering point light rides
   the most recent arc. CPU cost: occasional 12-point regen. */
export const buildArcs = (parent, { boardTop = 0.245, half = 1.06 } = {}) => {
  const group = new THREE.Group();
  const N = 10;
  const arcs = [];
  const rnd = mulberry32(0xA2C);
  const perim = (u) => {           // u∈[0,1) → xz on square path + outward normal
    const s = Math.floor(u * 4), f = (u * 4) % 1, a = half;
    if (s === 0) return { x: -a + 2 * a * f, z: a, nx: 0, nz: 1 };
    if (s === 1) return { x: a, z: a - 2 * a * f, nx: 1, nz: 0 };
    if (s === 2) return { x: a - 2 * a * f, z: -a, nx: 0, nz: -1 };
    return { x: -a, z: -a + 2 * a * f, nx: -1, nz: 0 };
  };
  const seamY = boardTop + 0.1;
  const light = new THREE.PointLight(new THREE.Color('#9fd0ff'), 0, 4, 2);
  light.position.set(0, seamY, half);
  group.add(light);
  for (let i = 0; i < N; i++) {
    const P = 12;
    const pos = new Float32Array(P * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.LineBasicMaterial({
      color: new THREE.Color(i % 3 === 0 ? '#e6f2ff' : '#4aa3ff'),
      transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const line = new THREE.Line(geo, mat);
    group.add(line);
    arcs.push({ line, pos, geo, age: 1e3, life: 0, P });
  }
  const regen = (a) => {
    // cluster at a hot corner (berco: arcs concentrate front-left) — 70%
    const u0 = rnd() < 0.7 ? 0.58 + rnd() * 0.2 : rnd();
    const span = 0.03 + rnd() * 0.09;        // fraction of perimeter
    for (let j = 0; j < a.P; j++) {
      const f = j / (a.P - 1);
      const q = perim((u0 + span * f) % 1);
      const wig = (j > 0 && j < a.P - 1) ? 1 : 0; // pinned ends
      a.pos[j * 3]     = q.x + q.nx * (rnd() - 0.3) * 0.09 * wig;
      a.pos[j * 3 + 1] = seamY + (rnd() - 0.5) * 0.11 * wig;
      a.pos[j * 3 + 2] = q.z + q.nz * (rnd() - 0.3) * 0.09 * wig;
    }
    a.geo.attributes.position.needsUpdate = true;
    a.age = 0;
    a.life = 0.06 + rnd() * 0.14;
    return a;
  };
  let dtAcc = 0, lastT = 0;
  const update = (t, intensity) => {
    const dt = Math.min(Math.max(t - lastT, 0), 0.1); lastT = t; dtAcc += dt;
    let lit = 0;
    for (const a of arcs) {
      a.age += dt;
      if (a.age > a.life) {
        // stochastic rebirth — denser when intensity is high
        if (rnd() < 0.28 + 0.5 * intensity) {
          regen(a);
          if (!lit) { light.position.set(a.pos[18], seamY, a.pos[20]); lit = 1; }
        } else { a.line.material.opacity = 0; continue; }
      }
      const k = 1 - a.age / a.life;
      a.line.material.opacity = intensity * (0.35 + 0.65 * k) * (0.7 + 0.3 * Math.sin(t * 60 + a.life * 97));
    }
    light.intensity = intensity * (2.2 + 2.4 * Math.abs(Math.sin(t * 23)));
  };
  parent.add(group);
  return { group, update, light };
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
    amount: { value: 0.018 },
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
