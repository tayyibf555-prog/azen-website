# SPEC + BUILD BRIEF — chip v2: "the armored core" (berco-frame match)
Overseer: Fable. BINDING. Supersedes the lid-lift design; the previous "animation frozen" rule is LIFTED by user directive — the eruption IS the new animation.

## A. Reference-frame analysis (overseer's read of berco's render)
The object floats alone in a black void (NO infinite PCB plane — delete ours):
1. **Armored plate**: elongated OCTAGONAL package (like a chamfered shield), dark gunmetal (#1a1e24-ish), stepped/machined edges — outer chamfer ring, inner raised rim, side notches. 4+ visible screws (cross/torx heads) near corners.
2. **Perimeter pins**: dense rows of gold/bronze leadframe teeth along the inner rim edges (top+bottom rows most visible; ~30-40 per long edge, small boxes with a slight L-profile feel).
3. **Inner board**: recessed dark blue-graphite surface carrying FINE LIGHT traces (white/silver Manhattan routing, not saturated blue), etched region rectangles, a few raised platforms; a small silver/iridescent die at center.
4. **Blue modules**: 3-5 glossy electric-blue rounded blocks (RAM-stick-like) along the inner edges + short cyan connector strips; they read as lit acrylic (clearcoat, slight emissive).
5. **THE ERUPTION**: from the die, a plume of thousands of TINY CUBES (voxels) surges upward in a curved sheet — dense/white-hot at the base, cooling to cyan, scattering and dissolving at the top. It casts cyan light onto the board below. In berco's sequence video this is a ~10s pendulum: erupt → peak → reverse-settle back into the board, seamlessly ping-ponging.
6. **Grade**: black void bg, soft top key, metal chamfer speculars, mild DOF, glow from the plume as practical light. Palette for AZEN: keep gunmetal+gold, but ALL glow in our blue family (#0071e3 core → #4aa3ff → near-white hot center). No teal/cyan drift.

## B. Build (rewrite the object in src/hero3d.js + src/chip/common.js; panel reuses it)
1. **Scene**: object floats on black-void gradient (existing bg/fog fine). DELETE the 28×28 PCB plane, SMD field, and lid/lid-lift mechanics. Ground the object with a soft blue glow pool + faint reflection (mirror-cloned object at low opacity OR a radial glow sprite — cheap option allowed).
2. **Object build** (procedural, shared builder in common.js):
   - Octagon plate via ExtrudeGeometry (elongated octagon Shape, bevel enabled) + inner raised rim (second smaller extrude) + notches (two side cutouts via shape holes or overlay boxes). MeshPhysicalMaterial gunmetal: color #161b22, metalness .85, roughness .38, clearcoat .3.
   - Screws: instanced small cylinders (+ cross groove via tiny boxes or normal-ish trick), 6 instances at corners.
   - Pin rows: instanced gold teeth (~120) along the 4 inner rim edges (reuse pin material, slightly brighter).
   - Inner board: inset plane/box with canvas texture — dark #0a1220 base, FINE 1-2px light traces (#cfe4ff at ~55% alpha) + etched rects + pad dots (new drawTraceBoard() in common.js; 2048²). Slight emissive #0071e3 tint at low intensity so it's alive.
   - Modules: 4 rounded glossy blue blocks (clearcoat 1, color #0b3f8f, emissive #0071e3 @ .5, brighter tops) + 2 thin connector strips. Center die: small iridescent box (reuse dieMat recipe).
3. **THE ERUPTION (the star — spend the effort here)**:
   - InstancedMesh of ≥6000 tiny cubes (size ~0.02-0.035, slight size variance). GPU-driven: per-instance attributes (seed, radial offset, phase) + custom onBeforeCompile or ShaderMaterial patch so the VERTEX SHADER computes each voxel's position from a single time+progress uniform — zero per-frame CPU matrix writes.
   - Motion field: voxels originate across the die/board center area; rise along a curved sheet (bias +X drift like the frame), turbulence via cheap hash noise in shader; lifetime mapped to progress; at the top they scatter + shrink/fade. Color ramp by height/energy: near-white core → #4aa3ff → #0071e3, driven in shader; additive blending, bloom catches it.
   - **Pendulum**: progress = smooth ping-pong (sine) over ~10s — erupt to peak, reverse-settle into a flat voxel bed that visually "becomes" the board center (settled state = thin glowing lattice on the die). Seamless, no pops.
4. **Choreography (new contract)**:
   - Intro: same 1.4s camera ease pattern on `azen:reveal` (keep INTRO→HERO positions; retarget lookAt to object center ~y0.3). Idle: slow object yaw (full slow rotation like their ambient, ~40s/rev) + float ±0.04 + cursor parallax (same lerp .05 targets).
   - Scroll p (0→1 over hero height): dolly in (same z−2.2p feel), plume AMPLITUDE ×(0.55+0.45p) and pendulum speed ×(1+0.6p) — at rest it simmers, at scroll it rages. No lid logic.
   - Panel (chip-panel.js): same object + eruption at FIXED amplitude 1, pendulum 10s, no scroll/pointer input, square crop, parked offscreen. This mirrors berco's sequence video 1:1.
   - Debug handle v2: `window.__azenChip = { get camZ, get plumeT (0..1 pendulum), get amp, voxels: N }` — document rest/scroll expectations in your report for the new QA baseline.
5. **Keep**: all progressive gates (fail→data-3d off, reduced-motion single frame w/ settled plume at amp .4, IO parking, ResizeObserver, DPR≤2, zoomComp), HDRI env pipeline from v6.1, bloom chain (may retune strength ~.65/.55/.7 for the plume), DOF (focus to die), grain. Palette law: #0071e3 family only for glow; gold pins; no teal.
6. **Perf budget**: ≥6000 voxels + object ≤ 30 draw calls total; 60fps at DPR 2 (report frame deltas). No per-frame allocations; the voxel system must be O(1) CPU per frame.
7. **Files**: src/hero3d.js, src/chip-panel.js, src/chip/common.js only. No commits. Verify like prior passes (probes; screenshot forces a frame even when pane hidden). Report ≤30 lines: A-fidelity checklist vs §A items 1-6, new debug baseline numbers, perf deltas, flags.
