/* ==========================================================
   Mindset panel — simplified live chip scene (brief §2.8)
   ----------------------------------------------------------
   A second, tiny Three.js scene inside the sequence frame:
   the hero chip's material recipe, running an AUTOMATIC slow
   ping-pong of the lid-lift/reassemble cycle (~8s pendulum,
   sine). No scroll or pointer dependencies. Parked by an
   IntersectionObserver when off-screen. DPR ≤ 2. Own tiny
   renderer, < 20 draw calls (7 meshes, no post, no shadows).

   Progressive: no WebGL → mount keeps the CSS ground.
   Reduced motion → one static mid-lift frame.
   ========================================================== */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

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
    const BLUE_BRIGHT = new THREE.Color('#4aa3ff');

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

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 60);
    camera.position.set(3.1, 2.3, 5.0);
    camera.lookAt(0, 0.35, 0);

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    const rig = new THREE.Group();
    rig.rotation.y = 0.5; // designed 3/4 yaw
    scene.add(rig);

    /* Ground plane — plain dark PCB (no trace texture; keep it tiny). */
    const pcb = new THREE.Mesh(
      new THREE.PlaneGeometry(16, 16),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#07090f'), roughness: 0.4, metalness: 0.55, envMapIntensity: 0.5,
      })
    );
    pcb.rotation.x = -Math.PI / 2;
    rig.add(pcb);

    /* Lid group — package + die (the hero recipe, verbatim materials). */
    const lid = new THREE.Group();
    rig.add(lid);
    const pkg = new THREE.Mesh(
      new RoundedBoxGeometry(2.3, 0.28, 2.3, 4, 0.06),
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#0b0e15'), roughness: 0.42, metalness: 0.35,
        clearcoat: 0.6, clearcoatRoughness: 0.25, envMapIntensity: 0.7,
      })
    );
    pkg.position.y = 0.141;
    lid.add(pkg);
    const dieMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#151b28'), roughness: 0.12, metalness: 0.9,
      iridescence: 1, iridescenceIOR: 1.6,
      emissive: BLUE, emissiveIntensity: 0.45,
    });
    const die = new THREE.Mesh(new RoundedBoxGeometry(0.95, 0.06, 0.95, 3, 0.02), dieMat);
    die.position.y = 0.285;
    lid.add(die);

    /* Pins — 4 edges × 26, instanced cool gold (hero recipe). */
    const pins = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.045, 0.05, 0.14),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#b9a06a'), metalness: 1, roughness: 0.35, envMapIntensity: 0.9,
      }),
      104
    );
    {
      const m = new THREE.Matrix4();
      let k = 0;
      for (const [ox, oz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        for (let i = 0; i < 26; i++) {
          const lat = -1.125 + (i + 0.5) * (2.25 / 26);
          m.makeRotationY(ox !== 0 ? Math.PI / 2 : 0);
          m.setPosition(ox !== 0 ? ox * 1.205 : lat, 0.025, oz !== 0 ? oz * 1.205 : lat);
          pins.setMatrixAt(k++, m);
        }
      }
    }
    rig.add(pins);

    /* Substrate pad + 6×6 die-grid revealed by the lift (hero recipe). */
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

    /* The pendulum: sine lid-lift/reassemble, ~8s per full cycle. */
    const CYCLE = 8;
    const applyPhase = (t) => {
      const lift = 0.5 - 0.5 * Math.cos((t * Math.PI * 2) / CYCLE); // 0→1→0, sine
      lid.position.y = lift * 0.55;
      gridMat.emissiveIntensity = 2.4 * lift;
      dieMat.emissiveIntensity = 0.45 + Math.sin(t * 1.1) * 0.2;
      rig.rotation.y = 0.5 + Math.sin(t * 0.22) * 0.06;
      rig.position.y = Math.sin(t * 0.5) * 0.03;
    };

    if (reduceMotion) {
      applyPhase(CYCLE / 4); // designed still: lid half-lifted, grid glowing
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
