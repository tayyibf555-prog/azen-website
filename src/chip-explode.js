/* ==========================================================
   Mindset — exploded operating-stack, scroll-driven
   ----------------------------------------------------------
   The berco exploded-chip moment, custom coded: five rounded
   slab layers (lid / glass grid / blue core / frame / base)
   that separate vertically as the section scrolls, each one
   called out by a leader line + label naming the azen layer
   it stands for. Sticky stage, progress read from scroll —
   no scroll-jack, no pinning libraries, no Lenis.

   Labels are real DOM (readable); the canvas + SVG lines are
   decorative. Reduced motion: one static exploded frame with
   every label shown. No WebGL: copy + labels-as-list remain.
   ========================================================== */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { applyHDREnvironment, boostEnvIntensity } from './chip/common.js';

const wrapper = document.getElementById('mindset');
const stage = wrapper && wrapper.querySelector('.explode-stage');
const mount = document.getElementById('chip-explode');
const linesSvg = wrapper && wrapper.querySelector('.explode-lines');
const labelEls = wrapper ? Array.from(wrapper.querySelectorAll('.explode-label')) : [];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (v) => { const t = clamp01(v); return t * t * (3 - 2 * t); };

/* ── canvas texture helpers (self-contained) ─────────────── */
const brushedTex = (base, streak, v = 18) => {
  const c = document.createElement('canvas'); c.width = c.height = 512;
  const ctx = c.getContext('2d');
  ctx.fillStyle = base; ctx.fillRect(0, 0, 512, 512);
  ctx.globalAlpha = 0.14;
  for (let i = 0; i < 900; i++) {
    ctx.strokeStyle = Math.random() > 0.5 ? streak : '#000';
    const y = Math.random() * 512;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y + (Math.random() - 0.5) * v); ctx.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
};

const engravingTex = (text, px = 150) => {
  const c = document.createElement('canvas'); c.width = c.height = 1024;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 1024, 1024);
  ctx.font = `600 ${px}px Geist, "Hanken Grotesk", sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.shadowColor = '#eaf4ff'; ctx.shadowBlur = 34;
  ctx.fillStyle = '#f2f8ff';
  ctx.fillText(text, 512, 512);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

const dotGridTex = () => {
  const c = document.createElement('canvas'); c.width = c.height = 512;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, 512, 512);
  ctx.fillStyle = 'rgba(240,248,255,0.92)';
  const step = 512 / 26;
  for (let y = step / 2; y < 512; y += step) {
    for (let x = step / 2; x < 512; x += step) {
      ctx.beginPath(); ctx.arc(x, y, 1.7, 0, Math.PI * 2); ctx.fill();
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

/* ── rounded-slab geometry (big plan-view corners, tiny bevel) ── */
const slabGeo = (w, t, r, hole = 0) => {
  const shape = new THREE.Shape();
  const h = w / 2;
  shape.moveTo(-h + r, -h);
  shape.lineTo(h - r, -h); shape.absarc(h - r, -h + r, r, -Math.PI / 2, 0);
  shape.lineTo(h, h - r); shape.absarc(h - r, h - r, r, 0, Math.PI / 2);
  shape.lineTo(-h + r, h); shape.absarc(-h + r, h - r, r, Math.PI / 2, Math.PI);
  shape.lineTo(-h, -h + r); shape.absarc(-h + r, -h + r, r, Math.PI, Math.PI * 1.5);
  if (hole > 0) {
    const hh = hole / 2, hr = Math.min(r * 0.7, hh * 0.5);
    const path = new THREE.Path();
    path.moveTo(-hh + hr, -hh);
    path.lineTo(hh - hr, -hh); path.absarc(hh - hr, -hh + hr, hr, -Math.PI / 2, 0);
    path.lineTo(hh, hh - hr); path.absarc(hh - hr, hh - hr, hr, 0, Math.PI / 2);
    path.lineTo(-hh + hr, hh); path.absarc(-hh + hr, hh - hr, hr, Math.PI / 2, Math.PI);
    path.lineTo(-hh, -hh + hr); path.absarc(-hh + hr, -hh + hr, hr, Math.PI, Math.PI * 1.5);
    shape.holes.push(path);
  }
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: t, bevelEnabled: true, bevelThickness: 0.014, bevelSize: 0.014,
    bevelSegments: 2, curveSegments: 22,
  });
  geo.rotateX(-Math.PI / 2);         // extrude along +Y
  geo.translate(0, -t / 2, 0);       // centre on its own mid-plane
  return geo;
};

/* map a 0-1 canvas texture onto extrude-geometry shape units */
const fitShapeUV = (tex, w) => {
  tex.repeat.set(1 / w, 1 / w);
  tex.offset.set(0.5, 0.5);
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
};

if (mount && stage) {
  let renderer = null;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  } catch (e) { renderer = null; }

  if (renderer && renderer.getContext()) {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.95;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
    const camDir = new THREE.Vector3(2.9, 4.6, 3.9).normalize();
    /* distance fitted per-aspect so the full exploded stack stays framed
       from phones to ultrawide. The vertical budget is generous (3.1)
       because the risen lid sits nearer the elevated camera and projects
       larger than its at-lookAt size. A frustum offset then parks the
       object right-of-centre and slightly low, clear of the copy + nav. */
    const fitCamera = () => {
      const vHalf = THREE.MathUtils.degToRad(camera.fov / 2);
      const hHalf = Math.atan(Math.tan(vHalf) * camera.aspect);
      const dist = Math.max(3.1 / Math.tan(vHalf), 2.3 / Math.tan(hHalf));
      camera.position.copy(camDir).multiplyScalar(dist);
      camera.lookAt(0, 0.15, 0);
      const wide = camera.aspect > 1;
      const w = renderer.domElement.width, h = renderer.domElement.height;
      camera.setViewOffset(w, h, wide ? -w * 0.13 : -w * 0.02, -h * 0.055, w, h);
    };
    fitCamera();

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    const rig = new THREE.Group();
    rig.rotation.y = 0.64;
    scene.add(rig);

    /* ── the five layers, top → bottom ─────────────────────── */
    const metals = [];
    const layers = [];   // { group, rest, spread }

    const addLayer = (mesh, rest, spread) => {
      const g = new THREE.Group();
      g.add(mesh);
      g.position.y = rest;
      rig.add(g);
      layers.push({ group: g, rest, spread });
      return g;
    };

    // 1 · lid — brushed graphite, glowing azen. engraving
    const lidMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, metalness: 0.92, roughness: 0.36,
      map: fitShapeUV(brushedTex('#575c66', '#9aa1ac'), 2.6),
      emissive: 0xdcecff, emissiveIntensity: 1.35,
      emissiveMap: fitShapeUV(engravingTex('azen.'), 2.6),
    });
    metals.push(lidMat);
    addLayer(new THREE.Mesh(slabGeo(2.6, 0.15, 0.52), lidMat), 0.62, 1.32);

    // 2 · glass grid — clear pane + perforation dots
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xa8cde8, transparent: true, opacity: 0.22,
      roughness: 0.05, metalness: 0, clearcoat: 1,
      side: THREE.DoubleSide, depthWrite: false,
    });
    const glass = new THREE.Mesh(slabGeo(2.45, 0.07, 0.48), glassMat);
    glass.renderOrder = 3;
    const dots = new THREE.Mesh(
      new THREE.PlaneGeometry(2.1, 2.1),
      new THREE.MeshBasicMaterial({ map: dotGridTex(), transparent: true, opacity: 0.85, depthWrite: false }),
    );
    dots.rotation.x = -Math.PI / 2;
    dots.position.y = 0.05;
    dots.renderOrder = 4;
    glass.add(dots);
    addLayer(glass, 0.34, 0.78);

    // 3 · core — ice-blue glass block + dark badge disc
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0x2f8fff, roughness: 0.16, metalness: 0.1,
      clearcoat: 1, clearcoatRoughness: 0.08,
      emissive: 0x0a58c8, emissiveIntensity: 0.5,
    });
    const core = new THREE.Mesh(slabGeo(1.9, 0.24, 0.4), coreMat);
    const badge = new THREE.Mesh(
      new THREE.CylinderGeometry(0.58, 0.58, 0.05, 48),
      new THREE.MeshStandardMaterial({ color: 0x14171c, metalness: 0.85, roughness: 0.32 }),
    );
    badge.position.y = 0.14;
    const badgeText = new THREE.Mesh(
      new THREE.CircleGeometry(0.5, 48),
      new THREE.MeshBasicMaterial({ map: engravingTex('azen.', 118), transparent: true, opacity: 0.9, depthWrite: false }),
    );
    badgeText.rotation.x = -Math.PI / 2;
    badgeText.position.y = 0.17;
    core.add(badge, badgeText);
    addLayer(core, 0.06, 0.08);

    // 4 · frame — dark graphite ring
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x1c1f24, metalness: 0.82, roughness: 0.5,
    });
    metals.push(frameMat);
    addLayer(new THREE.Mesh(slabGeo(2.75, 0.12, 0.55, 2.05), frameMat), -0.22, -0.62);

    // 5 · base — brushed dark slab
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, metalness: 0.92, roughness: 0.34,
      map: fitShapeUV(brushedTex('#1b1e23', '#3a3f47'), 2.95),
    });
    metals.push(baseMat);
    addLayer(new THREE.Mesh(slabGeo(2.95, 0.17, 0.58), baseMat), -0.46, -1.02);

    applyHDREnvironment(renderer, scene, () => {
      boostEnvIntensity(metals, 2.6);
      if (reduceMotion) renderOnce();
    });

    /* lights — hero palette */
    scene.add(new THREE.HemisphereLight(0x9ec8ff, 0x0a1428, 0.42));
    const key = new THREE.DirectionalLight(0xeaf1ff, 1.5);
    key.position.set(4.5, 7.5, 4.5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(new THREE.Color('#0071e3'), 1.15);
    rim.position.set(-6, 2.5, -4);
    scene.add(rim);

    /* ── labels: anchors on alternating edges, staggered reveal ── */
    const NS = 'http://www.w3.org/2000/svg';
    const callouts = labelEls.map((el, i) => {
      const side = i % 2 === 0 ? 1 : -1;              // 0,2,4 right · 1,3 left
      const line = document.createElementNS(NS, 'line');
      line.setAttribute('stroke', 'rgba(255,255,255,0.45)');
      line.setAttribute('stroke-width', '1');
      const dot = document.createElementNS(NS, 'circle');
      dot.setAttribute('r', '2.4');
      dot.setAttribute('fill', '#fff');
      if (linesSvg) { linesSvg.appendChild(line); linesSvg.appendChild(dot); }
      return { el, side, line, dot, at: 0.3 + i * 0.09 };
    });

    const anchor = new THREE.Vector3();
    const placeCallouts = (p, w, h) => {
      callouts.forEach((c, i) => {
        const L = layers[i];
        if (!L) return;
        const o = smooth((p - c.at) / 0.12);
        c.el.style.opacity = o;
        c.line.setAttribute('opacity', o);
        c.dot.setAttribute('opacity', o);
        if (o <= 0.01) return;
        // edge point of this layer, world → screen
        anchor.set(c.side * 1.28, 0, c.side * -0.4);
        L.group.localToWorld(anchor);
        anchor.project(camera);
        const ax = (anchor.x * 0.5 + 0.5) * w;
        const ay = (-anchor.y * 0.5 + 0.5) * h;
        let lx = ax + c.side * Math.max(w * 0.055, 46);
        // keep the label fully on-stage: inside the edges, below the nav
        const lw = c.el.offsetWidth || 0;
        lx = c.side === 1 ? Math.min(lx, w - lw - 10) : Math.max(lx, lw + 10);
        const ly = Math.min(Math.max(ay, 96), h - 44);
        c.el.style.left = `${lx}px`;
        c.el.style.top = `${ly}px`;
        c.el.classList.toggle('is-left', c.side === -1);
        c.line.setAttribute('x1', ax); c.line.setAttribute('y1', ay);
        c.line.setAttribute('x2', lx + (c.side === -1 ? 2 : -2)); c.line.setAttribute('y2', ly);
        c.dot.setAttribute('cx', ax); c.dot.setAttribute('cy', ay);
      });
    };

    /* ── sizing ────────────────────────────────────────────── */
    let W = 2, H = 2;
    const applySize = () => {
      W = Math.round(stage.clientWidth);
      H = Math.round(stage.clientHeight) || W;
      if (W < 2 || H < 2) return;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H, false);
      fitCamera();
      if (linesSvg) linesSvg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      if (reduceMotion) renderOnce();
    };
    new ResizeObserver(applySize).observe(stage);
    applySize();

    /* ── explode state from scroll progress ────────────────── */
    const applyProgress = (p, t = 0) => {
      layers.forEach((L, i) => {
        const e = smooth((p - i * 0.055) / 0.72);
        L.group.position.y = L.rest + e * L.spread;
      });
      rig.rotation.y = 0.64 + p * 0.32;
      rig.position.y = Math.sin(t * 0.6) * 0.02;
      placeCallouts(p, W, H);
    };

    const progress = () => {
      const r = wrapper.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      return span > 0 ? clamp01(-r.top / span) : 0;
    };

    const renderOnce = () => { applyProgress(reduceMotion ? 0.74 : progress()); renderer.render(scene, camera); };

    if (reduceMotion) {
      renderOnce();
    } else {
      const clock = new THREE.Clock();
      let running = false;
      let t = 0;
      const loop = () => {
        if (!running) return;
        t += Math.min(clock.getDelta(), 0.05);
        applyProgress(progress(), t);
        renderer.render(scene, camera);
        requestAnimationFrame(loop);
      };
      const play = () => { if (!running) { running = true; clock.getDelta(); requestAnimationFrame(loop); } };
      const pause = () => { running = false; };
      new IntersectionObserver((es) => { es[0].isIntersecting ? play() : pause(); }, { threshold: 0 }).observe(wrapper);
    }

    window.__azenExplode = { layers: layers.length, progress };
  }
}
