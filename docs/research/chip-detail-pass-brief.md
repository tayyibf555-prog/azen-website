# BUILD BRIEF — chip visual-fidelity pass (animation frozen)
Overseer: Fable. Builder: subagent. BINDING.

## 0. The one hard rule
**The animation and choreography are FROZEN.** Zero changes to: intro camera ease (1.4s, INTRO_POS→HERO_POS), idle float/yaw values, cursor-parallax targets/lerp, scroll mapping (dolly z−2.2p y−0.6p, lookAt drift, lid lift 0.18 @ p≥0.55, pulse speedup, bloom ramp base+0.25p), pulse lane logic, zoomComp, `window.__azenChip`, all progressive gates (fail/reduced-motion/IO parking/ResizeObserver/DPR≤2), and chip-panel.js's ping-pong timing. If a visual upgrade would require touching any of these, DON'T — flag it instead. Numbers may only change where this brief explicitly says so.

## 1. Goal
Close the realism gap to an offline render while staying 100% real-time, procedural, and interactive. No video, no image textures except the CC0 HDRI below, no downloaded models.

## 2. Upgrades (hero scene `src/hero3d.js`; share with `src/chip-panel.js` via extracted builders in `src/chip/common.js` — extraction must be behavior-neutral)
a. **HDRI lighting**: load `/hdri/env.hdr` (already at public/hdri/env.hdr, CC0 PolyHaven night HDRI) via RGBELoader + PMREM, replacing RoomEnvironment. Keep the palette: if too dim/warm, correct with envMapIntensity per-material and the existing lights — do NOT shift the scene away from near-black + #0071e3. Load async with RoomEnvironment as the instant fallback so first paint never waits.
b. **Package detail**: chamfered heat-spreader plate on top of the package (inset rounded box + smaller raised center), thin substrate lip around the base, subtle edge highlight. Keep the lid GROUP structure — new parts that belong to the lid go INSIDE `lid` so the lift animation carries them.
c. **Board population**: instanced SMD components around the chip on the PCB — ~120 tiny capacitors/resistors (2-3 InstancedMesh draws: dark bodies + lighter caps), seeded placement (mulberry32, keep-out zone under package/pins), a few larger inductor blocks. They receive shadows.
d. **Trace texture v2**: raise canvas to 3072² if perf allows; add a second finer trace layer (thinner, dimmer, denser Manhattan routing) + solder-mask dot grid at very low alpha for surface texture; keep the SAME 8 pulse lanes' polylines untouched (pulse positions must not shift).
e. **Depth of field**: BokehPass (three examples) — SUBTLE: focus tracked to the die world-position projected each frame (cheap: fixed focus distance recomputed from camera↔die distance), aperture small so only far PCB edges soften. Must hold 60fps desktop; if it can't, ship without DOF and flag.
f. **Contact grounding**: radial dark AO gradient baked into the trace canvas under the package footprint + slightly stronger shadow opacity, so the chip sits INTO the board.
g. **Micro-grain**: film-grain via a tiny ShaderPass (animated noise, opacity ≤0.035) AFTER bloom. Skip if any moiré/perf issue; flag.
h. Panel scene (`chip-panel.js`) inherits b/c/d via common builders; its simpler post stays (no DOF there).

## 3. Budget & verify
- 60fps target desktop; total draw calls ≤ 45/scene; no per-frame allocations; DPR≤2 unchanged.
- Verify exactly like the previous chip QA (probes via browser pane, tab "seed", http://localhost:5173): `__azenChip` values UNCHANGED at rest and at p=0.7 (camZ 4.06±0.1 desktop, lidY 0.1267±0.005), zero console errors, screenshot if pane renders. Diff-check: `git diff src/hero3d.js` must show NO changes inside the loop's choreography math (additions around it are fine).
- Files allowed: src/hero3d.js, src/chip-panel.js, src/chip/common.js (new). NOTHING else. No commits. Report ≤30 lines: upgrades landed, perf numbers, flags.
