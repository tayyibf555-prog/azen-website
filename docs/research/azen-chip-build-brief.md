# BUILD BRIEF — azen hero: fully-coded Three.js data chip
Overseer: Fable (session). Builder: subagent. Status: BINDING — deviations need overseer sign-off.

## 0. Non-negotiables
- 100% coded: procedural geometry + materials only. NO video, NO generated imagery, NO downloaded models/textures.
- Rewrite `src/hero3d.js` in place (module already loaded by index.html; mount is `<div id="hero-3d">`). You may add helper modules under `src/chip/` if it stays tidy.
- Keep every progressive gate that exists today: `data-3d="off"` on WebGL fail (CSS glow-ground fallback), reduced-motion → single static frame, render loop parks when hero off-screen (IntersectionObserver), sizing via ResizeObserver + window load, `pixelRatio ≤ 2`.
- Do NOT touch index.html, styles, or other sections. Do NOT commit — overseer commits after QA.
- Palette: ground navy-blacks (#04060e–#0c1424 family), ONE accent #0071e3 (bright variant #4aa3ff for emissive peaks). Gold pins allowed, desaturated cool (#b9a06a range). Nothing else.

## 1. The object — "the azen core"
Composition (target ~40–60 draw calls total):
1. **PCB plane** — large thin ground (~24×24 world units visible region), color #060c1c, roughness 0.4, metalness 0.55. Emissive circuit traces via a 2048² CanvasTexture you draw procedurally: Manhattan-routed lines + via dots radiating outward from the chip footprint, drawn in #0071e3 (and a few #4aa3ff highlights) on black; use as `emissiveMap` (emissive #0071e3, intensity ~1.4). Seeded RNG (mulberry32, fixed seed) so the routing is identical every load.
2. **Package** — RoundedBoxGeometry (`three/examples/jsm/geometries/RoundedBoxGeometry.js`) ≈ 2.3×0.28×2.3, radius 0.06. MeshPhysicalMaterial: color #0b0e15, roughness 0.42, metalness 0.35, clearcoat 0.6, clearcoatRoughness 0.25.
3. **Die** — inset rounded box ≈ 0.95×0.06×0.95 sitting proud of the package top. MeshPhysicalMaterial with `iridescence: 1, iridescenceIOR 1.6, roughness 0.12, metalness 0.9` plus faint emissive #0071e3 that *breathes* (intensity 0.25→0.65 sine).
4. **Pins** — InstancedMesh: 4 edges × 26 pins, small gold boxes (0.045×0.05×0.14), metalness 1, roughness 0.35, color cool gold.
5. **Data pulses** — ≤ 36 small additive-blended sprites/quads travelling along 6–10 precomputed trace polylines (reuse the canvas-trace path data), looping at varied speeds. This is the "alive" signal.
6. **Atmosphere** — sparse blue particle field (≤ 900 pts, additive, opacity ≤ 0.5), plus scene fog toward #06102a.

## 2. Light & post
- Env: `RoomEnvironment` via PMREM (already the pattern in the repo).
- Key directional (cool white ~#eaf1ff, ~1.4, casts PCFSoft shadows onto PCB, 2048 map, tight frustum), blue rim directional from back-left (#0071e3, ~1.3), low hemisphere (#9ec8ff/#0a1428, 0.4).
- ACES tone mapping, exposure 0.9. UnrealBloom (strength 0.5, radius 0.6, threshold 0.72) so ONLY traces/die/pulses bloom. Never blow out to white: verify the package still reads matte black.

## 3. Framing & choreography (the berco feel)
- Camera 3/4 low-ish hero angle: start ≈ pos(3.4, 2.2, 5.6) lookAt(0, 0.25, 0), FOV 38. Chip fills lower-right visual weight; headline (DOM, unchanged) sits over the left/центre — check the current hero text is centered: keep the chip slightly right-of-center and lower third so text stays clear.
- **Load-in (1.4s, once)**: camera eases from (4.6, 3.2, 8) → hero framing, ease-out cubic; traces' emissive fades 0→full in sync. No spin-up gimmicks.
- **Idle**: chip floats ±0.04 (slow sine), yaw oscillates ±3°, pulses run, die breathes.
- **Cursor**: pointer parallax — group yaw target ±0.3 rad, pitch ±0.1, lerp 0.05. `hover:hover` guard.
- **Scroll (p = scrollY / heroHeight, clamp 0–1)**: dolly toward the die (camera z −2.2·p, y −0.6·p, lookAt drifts to die center), pulse speed ×(1+1.5p), bloom strength +0.25·p, trace emissive +40%·p. At p ≥ 0.55, the package **lid lifts** 0.18 units (ease) revealing a glowing die-grid underneath (a 6×6 emissive instanced micro-grid) — "opening the system". Reverses cleanly on scroll-up. Reduced-motion: none of this, static frame.

## 4. Performance budget (hard)
- 60fps target desktop M-series; no per-frame allocations (reuse vectors), instancing for pins/grid, single canvas texture, bloom at default half-res, total JS ≤ ~12KB added.
- Loop parked off-screen + when `document.visibilityState === 'hidden'`? NO visibility gating beyond IntersectionObserver (embedded-pane lesson: visibility API misfires there) — keep IO-only parking exactly like current file.

## 5. Verification (builder must do before reporting)
Dev server: `npm run dev` in repo root if :5173 not already up (check `curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/`).
Probes via the shared browser pane (tab "seed") `javascript_tool`:
- `#hero-3d canvas` exists, sized to mount (±2px), `data-3d="on"`.
- Zero console errors.
- Programmatic checks: after `window.scrollTo(0, heroH*0.7)` + 300ms, camera z < initial (dolly active), lid lifted (expose a debug handle `window.__azenChip = { camZ:..., lidY:..., pulses:n }` for QA — keep it, QA agent uses it).
- Screenshot if the pane renders; if frames come back black, note it and rely on probes (known pane limitation).
Report back: what was built per section 1–3, probe results, any deviation requests.
