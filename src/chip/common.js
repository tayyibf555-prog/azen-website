/* ==========================================================
   Shared chip builders — hero (hero3d.js) + panel (chip-panel.js)
   ----------------------------------------------------------
   Visual-fidelity helpers only (detail-pass brief §2). Nothing
   in here drives animation: builders run once at init and the
   HDRI swap is a one-shot async upgrade. All randomness uses
   self-contained seeded RNGs so the hero's primary RNG stream
   (traces → pulse phases/speeds → dust) is never perturbed.
   ========================================================== */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js';

/* Seeded RNG — identical algorithm to the hero's inline copy. */
export const mulberry32 = (a) => () => {
  a |= 0; a = a + 0x6D2B79F5 | 0;
  let t = Math.imul(a ^ a >>> 15, 1 | a);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
};

const EDGES = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const WORLD = 28; // PCB world size the trace canvas maps onto (hero constant)

/* ── Trace routing (panel use) ────────────────────────────────
   Byte-identical port of the hero's Manhattan escape-trace
   generator so the panel shows the SAME designed routing. The
   hero keeps its own inline copy (its RNG stream is frozen). */
export const generateTraces = (seed = 20260716) => {
  const rng = mulberry32(seed);
  const traces = [];
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
  return traces;
};

/* ── Trace texture v2 (brief d + f) ───────────────────────────
   Draw order: solder-mask dot grid → fine secondary routing →
   main traces (identical widths/colors to v1, scaled to the
   new resolution) → radial AO punch-out under the footprint so
   the glow fades where the package sits (contact grounding).
   The main traces' polylines come in unchanged, so the 8 pulse
   lanes' world positions cannot shift. */
export const buildTraceTexture = (traces, { size = 3072, maxAniso = 8, fineSeed = 0xF17E5 } = {}) => {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const ctx = c.getContext('2d');
  const s = size / 2048;                       // line-width scale vs the v1 canvas
  const px = (w) => (w / WORLD + 0.5) * size;  // world x/z → canvas px
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, size, size);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';

  // solder-mask dot grid — very low alpha surface texture (pattern-tiled)
  {
    const step = Math.round(size / 128);       // ≈0.22 world spacing
    const tile = document.createElement('canvas'); tile.width = tile.height = step;
    const tctx = tile.getContext('2d');
    tctx.fillStyle = '#3b82d9';
    tctx.beginPath(); tctx.arc(step / 2, step / 2, 1.25 * s, 0, Math.PI * 2); tctx.fill();
    ctx.globalAlpha = 0.05;
    ctx.fillStyle = ctx.createPattern(tile, 'repeat');
    ctx.fillRect(0, 0, size, size);
    ctx.globalAlpha = 1;
  }

  // fine secondary routing — thinner, dimmer, denser (own RNG)
  {
    const frng = mulberry32(fineSeed);
    ctx.globalAlpha = 0.34;
    ctx.strokeStyle = '#0b57ad'; ctx.fillStyle = '#0b57ad';
    ctx.lineWidth = 1.7 * s;
    for (const [ox, oz] of EDGES) {
      for (let i = 0; i < 40; i++) {
        const lat = -1.35 + (i + 0.5) * (2.7 / 40) + (frng() - 0.5) * 0.02;
        let x = ox !== 0 ? ox * 1.5 : lat;
        let z = oz !== 0 ? oz * 1.5 : lat;
        ctx.beginPath(); ctx.moveTo(px(x), px(z));
        let outward = true;
        const segs = 4 + Math.floor(frng() * 4);
        for (let sg = 0; sg < segs; sg++) {
          if (outward) {
            const len = 0.4 + frng() * 1.3;
            x += ox * len; z += oz * len;
          } else {
            const len = (0.1 + frng() * 0.45) * (frng() < 0.5 ? -1 : 1);
            if (ox !== 0) z += len; else x += len;
          }
          x = Math.max(-13.5, Math.min(13.5, x));
          z = Math.max(-13.5, Math.min(13.5, z));
          ctx.lineTo(px(x), px(z));
          outward = !outward;
        }
        ctx.stroke();
        ctx.beginPath(); ctx.arc(px(x), px(z), 1.6 * s, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  // main traces — v1 recipe verbatim, widths scaled to resolution
  for (const tr of traces) {
    const col = tr.bright ? '#4aa3ff' : '#0071e3';
    ctx.strokeStyle = col; ctx.fillStyle = col;
    ctx.lineWidth = (tr.wide ? 5 : 3) * s;
    ctx.beginPath();
    ctx.moveTo(px(tr.pts[0]), px(tr.pts[1]));
    for (let i = 2; i < tr.pts.length; i += 2) ctx.lineTo(px(tr.pts[i]), px(tr.pts[i + 1]));
    ctx.stroke();
    const n = tr.pts.length;
    ctx.beginPath();
    ctx.arc(px(tr.pts[n - 2]), px(tr.pts[n - 1]), (tr.wide ? 7 : 4.5) * s, 0, Math.PI * 2);
    ctx.fill();
  }

  // contact AO — erase emission under/around the package footprint
  {
    const k = size / WORLD, mid = size / 2;
    const g = ctx.createRadialGradient(mid, mid, 1.3 * k, mid, mid, 2.75 * k);
    g.addColorStop(0, 'rgba(0,0,0,0.85)');
    g.addColorStop(0.45, 'rgba(0,0,0,0.45)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    ctx.globalCompositeOperation = 'source-over';
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(8, maxAniso);
  return tex;
};

/* ── Contact-shadow aoMap (brief f) ───────────────────────────
   Small radial occlusion map for the PCB so ambient/env light
   falls off under the package — the chip sits INTO the board.
   texture.channel defaults to 0, so it samples the plane's uv. */
export const buildAoMap = () => {
  const size = 256;
  const c = document.createElement('canvas'); c.width = c.height = size;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, size, size);
  const k = size / WORLD, mid = size / 2;
  const g = ctx.createRadialGradient(mid, mid, 0.9 * k, mid, mid, 5.5 * k);
  g.addColorStop(0, 'rgba(0,0,0,0.55)');
  g.addColorStop(0.35, 'rgba(0,0,0,0.32)');
  g.addColorStop(0.7, 'rgba(0,0,0,0.12)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
};

/* ── Package detail (brief b) ─────────────────────────────────
   Chamfered heat-spreader stack on the package top (inset plate
   + smaller raised center — a stepped mesa the die crowns) and
   a thin substrate lip around the base. Everything is added to
   the lid GROUP so the lift animation carries it. Machined-
   metal material gives the chamfers their edge highlight. */
export const buildPackageDetail = (lid, { shadows = true } = {}) => {
  const metalMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#232a36'), metalness: 0.9, roughness: 0.26,
    clearcoat: 0.4, clearcoatRoughness: 0.2, envMapIntensity: 1.15,
  });
  const lipMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#0e1524'), roughness: 0.5, metalness: 0.35, envMapIntensity: 0.6,
  });
  const spreader = new THREE.Mesh(new RoundedBoxGeometry(1.86, 0.05, 1.86, 3, 0.022), metalMat);
  spreader.position.y = 0.268;   // embedded in the pkg top (0.281), rises 0.012 proud
  const center = new THREE.Mesh(new RoundedBoxGeometry(1.26, 0.045, 1.26, 3, 0.02), metalMat);
  center.position.y = 0.2805;    // top 0.303 — the die (top 0.315) stays the crown
  const lip = new THREE.Mesh(new RoundedBoxGeometry(2.36, 0.05, 2.36, 2, 0.02), lipMat);
  lip.position.y = 0.027;        // thin substrate edge just proud of the pkg base
  for (const m of [spreader, center, lip]) {
    m.castShadow = shadows; m.receiveShadow = shadows;
    lid.add(m);
  }
  return { spreader, center, lip, metalMat, lipMat };
};

/* ── Board population (brief c) ───────────────────────────────
   ~120 instanced SMD passives (dark bodies + metallic end caps)
   and 6 larger shielded inductors. Seeded placement with a
   keep-out zone under the package/pins, minimum spacing, and —
   when the hero passes its pulse lanes — clearance from the 8
   pulse polylines so sprites never pop through component boxes.
   3 draw calls total. */
export const buildSMDs = (parent, { seed = 0xA5EED1, lanes = null, maxR = 9, shadows = true } = {}) => {
  const rng = mulberry32(seed);
  const segDist2 = (qx, qz, ax, az, bx, bz) => {
    const abx = bx - ax, abz = bz - az;
    const t = Math.max(0, Math.min(1, ((qx - ax) * abx + (qz - az) * abz) / (abx * abx + abz * abz || 1)));
    const dx = qx - (ax + abx * t), dz = qz - (az + abz * t);
    return dx * dx + dz * dz;
  };
  const laneDist2 = (x, z) => {
    if (!lanes) return Infinity;
    let best = Infinity;
    for (const L of lanes) {
      const p = L.pts;
      for (let i = 0; i + 3 < p.length; i += 2) {
        const d = segDist2(x, z, p[i], p[i + 1], p[i + 2], p[i + 3]);
        if (d < best) best = d;
      }
    }
    return best;
  };

  const bodies = [];
  let guard = 0;
  while (bodies.length < 120 && guard++ < 6000) {
    const r = 2.15 + Math.pow(rng(), 1.7) * (maxR - 2.15);
    const a = rng() * Math.PI * 2;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    const rot = rng() < 0.5 ? 0 : Math.PI / 2;
    if (Math.abs(x) < 1.95 && Math.abs(z) < 1.95) continue;   // package + pin keep-out
    if (laneDist2(x, z) < 0.24 * 0.24) continue;              // pulse-lane clearance
    let ok = true;
    for (const b of bodies) {
      const dx = b.x - x, dz = b.z - z;
      if (dx * dx + dz * dz < 0.09) { ok = false; break; }    // min spacing 0.3
    }
    if (ok) bodies.push({ x, z, rot });
  }

  const inductors = [];
  guard = 0;
  while (inductors.length < 6 && guard++ < 1200) {
    const r = 2.7 + Math.pow(rng(), 1.4) * Math.min(3.4, maxR - 2.7);
    const a = rng() * Math.PI * 2;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (Math.abs(x) < 2.2 && Math.abs(z) < 2.2) continue;
    if (laneDist2(x, z) < 0.42 * 0.42) continue;
    let ok = true;
    for (const b of bodies) {
      const dx = b.x - x, dz = b.z - z;
      if (dx * dx + dz * dz < 0.22) { ok = false; break; }
    }
    for (const q of inductors) {
      const dx = q.x - x, dz = q.z - z;
      if (dx * dx + dz * dz < 1.44) { ok = false; break; }
    }
    if (ok) inductors.push({ x, z, rot: rng() < 0.5 ? 0 : Math.PI / 2 });
  }

  const bodyMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#10151f'), roughness: 0.55, metalness: 0.25, envMapIntensity: 0.6,
  });
  const capMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#93a4b6'), metalness: 1, roughness: 0.32, envMapIntensity: 0.9,
  });
  const indMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#0c1017'), roughness: 0.38, metalness: 0.55, envMapIntensity: 0.7,
  });

  const m = new THREE.Matrix4();
  const bodyMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(0.12, 0.048, 0.068), bodyMat, bodies.length);
  const capMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(0.03, 0.052, 0.072), capMat, bodies.length * 2);
  bodies.forEach((b, i) => {
    m.makeRotationY(b.rot);
    m.setPosition(b.x, 0.024, b.z);
    bodyMesh.setMatrixAt(i, m);
    const ox = Math.cos(b.rot) * 0.054, oz = -Math.sin(b.rot) * 0.054;
    m.setPosition(b.x + ox, 0.026, b.z + oz); capMesh.setMatrixAt(i * 2, m);
    m.setPosition(b.x - ox, 0.026, b.z - oz); capMesh.setMatrixAt(i * 2 + 1, m);
  });
  const indMesh = new THREE.InstancedMesh(new RoundedBoxGeometry(0.3, 0.16, 0.3, 2, 0.03), indMat, inductors.length);
  inductors.forEach((q, i) => {
    m.makeRotationY(q.rot);
    m.setPosition(q.x, 0.08, q.z);
    indMesh.setMatrixAt(i, m);
  });

  bodyMesh.castShadow = shadows; bodyMesh.receiveShadow = shadows;
  capMesh.receiveShadow = shadows;                 // caps don't cast (negligible)
  indMesh.castShadow = shadows; indMesh.receiveShadow = shadows;
  parent.add(bodyMesh, capMesh, indMesh);
  return { bodyMesh, capMesh, indMesh, bodyMat, capMat, indMat };
};

/* ── Micro-grain shader (brief g) ─────────────────────────────
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

/* ── HDRI environment (brief a) ───────────────────────────────
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
