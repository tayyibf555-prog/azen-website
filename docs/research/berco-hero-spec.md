# Berco hero — technique spec

Recon target: `https://berco-inc.com/` (Next.js App Router, build `bwkLV2WPJhOsSQhtrfdy5`).
Method: static analysis of the served HTML, the two CSS bundles (`f2a74b822e89f7a7.css`, `ef552e54642fd1b8.css`), and the app JS chunks (`app/page-cd7deae484d6f5ef.js`, `app/layout-04e132573f9ae819.js`, vendor chunks `89-*` = GSAP+Lenis, `c15bf2b0-*` = GSAP core, `336-*` = SplitText). Video metadata read from container headers via HTTP range requests only — no assets downloaded.

**Stack found:** React/Next.js + **GSAP** (core, **ScrollTrigger**, **SplitText**) + **Lenis** smooth scroll (react-lenis, default `lerp: 0.1`) + Embla (carousels, not hero). **No WebGL, no canvas, no Three.js, no Lottie, no scroll-scrubbing.** The chip is pre-rendered video, twice over: an intro→loop crossfade pair in the hero, and a forward/reversed ping-pong pair in a later "sequence" section. Two archaeology nuggets: an unused `.image-sequence-canvas` CSS class and a discarded `next/dynamic(..., {ssr:false})` import at module scope — they evidently prototyped a canvas image-sequence (and probably a heavier client component) and shipped plain `<video>` instead. Also `data-wf-ignore="true"` on the loop video — a Webflow-export remnant.

---

## 1. Hero layout map

Global: `body { background: #020202 }`, scrollbars hidden (`::-webkit-scrollbar{display:none}`), every `section { height: 100vh }` (mobile: `200vw`).

```
<body>
├─ .navigation                    fixed; top 2.5vh; left 10%; width 80%; height 4vw;
│                                 border-radius 25px; background rgba(255,255,255,.04);
│                                 border 1px rgba(255,255,255,.05); backdrop-filter blur(5px)
│   ├─ .navigation-left           "BERCO INC" (custom 'at' display font, 1vw)
│   ├─ .navigation-center         absolute-centered; links About/Brands/Services/Contact
│   │                             (.small-description 0.9vw; hover opacity .5, .25s)
│   └─ .navigation-right-button   white pill, radius 15px, "Hebrew" toggle
├─ .navigation-bottom             fixed bottom 2.5vh right 10vw; 3.5vw circle; glass;
│                                 opacity:0 initially (scroll-to-top, ScrollTrigger-gated)
├─ .loading-screen                fixed inset 0; z-index 9999; background #020202;
│                                 pointer-events:none; flex-center
│   └─ p.headline.gradient-text   "Berco Inc." — white shimmer gradient clipped to text
└─ section.hero#home              position:relative; height 100vh; margin-bottom 10vh
    ├─ .hero-absolute             absolute inset 0; flex center; z-index 0   ← VIDEO LAYER (behind text)
    │   └─ .hero-absolute-wrapper width 60%; height 60%; position:absolute   ← GSAP float target
    │       ├─ .top-fade          absolute; h 10vh; w 100%; z 1; gradient transparent→#020202 (up)
    │       ├─ .bottom-fade       absolute; h 10vh; w 100%; z 1; gradient (down)
    │       ├─ .left-fade         absolute; w 10vw; h 100%; z 1; gradient (left)
    │       ├─ .right-fade        absolute; w 10vw; h 100%; z 1; gradient (right)
    │       ├─ video .hero-absolute-image           /videos/clip.webm   (INTRO — no autoplay, no loop)
    │       └─ video .hero-absolute-image.opacity   /videos/clip4.webm  (LOOP — autoplay, loop, opacity:0)
    │           both: width/height 100%; object-fit:contain; position:absolute (stacked)
    └─ .hero-content              relative; z-index 1; padding 25vh 10vw 5vh; flex row; space-between
        ├─ .hero-content-left     width 57.5%; column; space-between
        │   ├─ .hero-content-left-top          column; gap 5vh
        │   │   ├─ h1.headline.white           4 lines, 3.5vw, Helvetica Neue Light 300,
        │   │   │                              line-height 100%; bold spans = Helvetica Medium
        │   │   └─ .hero-content-left-top-row  "Explore Our Solutions" + 2.5vw circle button
        │   │                                  (bg rgba(255,255,255,.075); hover→solid white,
        │   │                                   icon flips to black; .5s ease)
        │   └─ .hero-content-left-bottom       row; space-between; align-end
        │       ├─ p.description.grey          label (1vw, Inter, 50% white)
        │       └─ p.big-description.grey      2-line tagline (1.5vw, Inter 300)
        └─ .hero-content-right    width 42.5%; column; align-end; padding-top 40vh
            └─ .hero-content-right-content     column; gap 2.5vh
                ├─ .hero-content-right-box     pill: padding 2vh 2.5vw; radius 999px;
                │                              border 2px rgba(255,255,255,.1); label inside
                └─ p.big-description.grey      2-line tagline (1.5vw)
```

**Where the chip sits relative to the headline:** the video layer is a centered 60%×60% box *behind* the text (`z-index 0` vs `1`). With `object-fit: contain` the chip renders mid-viewport, reading through the deliberate whitespace between the left text column (57.5%) and the right column (which is pushed down `40vh`). The four fade divs vignette the video rectangle into the `#020202` page on all sides, so what the eye sees is a floating object, never a video box. Text color system: `.white` = #fff @ 97.5% opacity, `.grey` = #fff @ 50% opacity.

**Mobile (≤768px):** `.hero` becomes `height:195vw; overflow:hidden`; wrapper becomes `100% × 45%` with `padding-top:20vw` on the layer and `object-fit: cover`; the right column is `display:none`; H1 jumps to `7.5vw`; nav center links hidden.

---

## 2. Video inventory

All four served from `/videos/`, `Accept-Ranges: bytes`, no poster attributes anywhere (the loader + black background make posters unnecessary). Metadata from container headers (range requests):

| Clip | Usage | Element attrs | Codec | Resolution | Duration | Frames/keyframes | Size | ~Bitrate |
|---|---|---|---|---|---|---|---|---|
| `clip.webm` | Hero **intro**, plays once | `muted playsInline preload="auto" loop={false}` — **no autoplay**; started by JS | VP9 (+ vestigial Opus audio track) | **3840×2160** | **7.042 s** | — | 2,288,646 B (2.29 MB) | ≈2.6 Mbps |
| `clip4.webm` | Hero **ambient loop**, revealed at 7.8 s | `autoPlay muted playsInline loop preload="auto"` + class `opacity` (opacity:0) + `data-wf-ignore` | VP9 (+ Opus) | **1920×1080** | **4.511 s** | — | 502,643 B (0.50 MB) | ≈0.89 Mbps |
| `clip5.MP4` | Sequence section, **forward** leg | `autoPlay muted playsInline preload="auto"`, `style display:block` initially | H.264 (avc1) | **1280×1280** | **10.0 s** | 300 f @ 30 fps, **10 keyframes** (~1/s) | 2,880,486 B (2.88 MB) | ≈2.3 Mbps |
| `clip5-reversed.MP4` | Sequence section, **reverse** leg | `muted playsInline preload="auto"`, `style display:none` initially | H.264 (avc1) | **1280×1280** | **10.0 s** | 300 f @ 30 fps, **2 keyframes** | 1,010,476 B (1.01 MB) | ≈0.81 Mbps |

Production notes worth copying: the intro is mastered at 4K for the big first impression, but the infinite loop is only 1080p and half a megabyte — by reveal time the viewer's attention is on the text, and VP9 at ~0.9 Mbps on a mostly-dark frame is invisible quality loss. The reversed MP4 is literally the forward clip re-encoded backwards (same 300 frames), at lower bitrate and with only 2 IDR frames — fine, because it is only ever played linearly, never seeked. Total hero+sequence video budget: **6.7 MB**.

---

## 3. Playback logic

Three mechanisms, all dumb-simple and none scroll-coupled. No `playbackRate`, no `currentTime` scrubbing, no `requestVideoFrameCallback` anywhere in the app chunks (verified by grep; the only `currentTime` hit is inside Lenis's internal animation class).

### A. Hero = timed intro→loop crossfade (option "state swap", time-based)

Both videos are stacked. The loop (`clip4`) autoplays invisibly (opacity 0) from page load; the intro (`clip.webm`) is armed but not started. One effect runs on mount — evidence from `page-cd7deae484d6f5ef.js` (refs: `l`=loading screen, `f`=intro video, `v`=loop video):

```js
(0,a.useEffect)(()=>{
  c.ZP.fromTo(l.current,{opacity:1},{delay:.5,opacity:0,duration:.25,ease:"sine",
    onComplete:()=>{f.current.play()}}),
  c.ZP.fromTo(v.current,{opacity:0},{delay:7.8,opacity:1,duration:.1,ease:"none"})
},[])
```

- Loader fades out `0.5s → 0.75s`; **its `onComplete` starts the intro clip**.
- The loop video is revealed by a hardcoded `delay: 7.8` opacity tween of just **0.1 s**.
- The arithmetic is the whole trick: `0.75 s (loader exit) + 7.042 s (intro duration) = 7.79 s ≈ 7.8 s`. The intro's last frame holds (`loop:false`, no reset) and the already-playing loop covers it a frame later. There is **no `ended` listener in the hero** — pure clock choreography.
- Because the loop has been looping since t≈0, its phase at reveal is arbitrary (7.8 mod 4.511 ≈ 3.29 s in). The content must therefore be an ambient hover/rotation where *any* frame is an acceptable continuation of the intro's final pose; the 0.1 s fade eats the seam.

### B. Sequence section = forward/reversed ping-pong via `ended` events (the `-reversed` file)

DOM state `m` (React `useState(true)`) drives `display` on two stacked `<video>`s; refs `n`=forward, `d`=reversed, `u`=setState:

```js
(0,r.jsx)("video",{ref:n,src:"/videos/clip5.MP4",className:"sequence-content-video",
  style:{display:m?"block":"none"},autoPlay:!0,muted:!0,playsInline:!0,preload:"auto"}),
(0,r.jsx)("video",{ref:d,src:"/videos/clip5-reversed.MP4",className:"sequence-content-video",
  style:{display:m?"none":"block"},muted:!0,playsInline:!0,preload:"auto"})
```

```js
(0,a.useEffect)(()=>{
  let e=n.current,s=d.current,
      t=()=>{u(!1),s.play()},   // forward ended → show reversed, play it
      r=()=>{u(!0),e.play()};   // reversed ended → show forward, play it
  return e.addEventListener("ended",t),s.addEventListener("ended",r),
         ()=>{e.removeEventListener("ended",t),s.removeEventListener("ended",r)}
},[])
```

Forward plays (autoplay, even offscreen), `ended` fires → instant `display` swap + `.play()` on the reversed file, and back again, forever: a 20 s pendulum. The swap is seamless because frame 300 of the forward clip *is* frame 1 of the reversed clip. This is why a `-reversed` asset exists at all: **HTML5 video has no reliable negative `playbackRate`**, so reverse playback is faked with a second, backwards-encoded file. Each video's paused copy holds its own last frame, which equals the other's first frame — no flash, no seek.

### C. Live float on top of the baked video (why it doesn't feel like a video)

The whole 60%×60% wrapper is drifted procedurally, forever — GSAP as a rAF driver, ease "none":

```js
document.querySelectorAll(".hero-absolute-wrapper").forEach((e,s)=>{
  let t=5+.1*Math.random(),r=5+.1*Math.random(),i=3e3+2e3*Math.random();
  c.ZP.to(e,{duration:50,ease:"none",repeat:-1,onUpdate:()=>{
    let n=Math.sin(Date.now()/(1e3+100*s))*t,   // x: ±~5px, ~6.3s period
        a=Math.cos(Date.now()/(900+100*s))*r,   // y: ±~5px, ~5.7s period
        o=1*Math.sin(Date.now()/i);             // rotation: ±1°, 3–5s period
    c.ZP.set(e,{x:n,y:a,rotation:o})}})});
```

Lissajous-style drift (incommensurate x/y periods → non-repeating path) + ±1° rotation. This is the load-bearing illusion: the chip's *internal* motion is baked into pixels, but the element itself physically floats, so it never reads as a looping rectangle.

**Trigger summary:** hero = time (mount + fixed delays); sequence = `ended` events; nothing is hover-driven; scroll only gates *entrances* (ScrollTrigger `start:"top 95%"` fades) and the scroll-top pill (trigger `.hero`, `start:"center top"`, `onEnter`/`onLeaveBack` 0.5 s opacity tweens). Nav links scroll via Lenis `scrollTo(target,{offset:0,duration:2.5})`.

---

## 4. Motion & timing

**Preloader:** `.loading-screen` is a fixed, `pointer-events:none`, `z-index:9999`, `#020202` overlay — a brand flash, not a real loader (nothing gates on asset readiness; `preload="auto"` on 2.29 MB of intro is simply assumed to win the race). Its wordmark uses `.gradient-text`: `linear-gradient(90deg, rgba(255,255,255,.1), #fff, rgba(255,255,255,.1))`, `background-size:300% 100%`, clipped to text, with GSAP sliding `backgroundPosition` `"0% 0%" → "100% 100%"`, `duration:2, ease:"power1.inOut", yoyo:true, repeat:-1` (shimmer). Exit: opacity 1→0, `delay:.5, duration:.25, ease:"sine"`; `onComplete` starts the intro video. Overlay is never unmounted — just transparent and click-through.

**Hero text entrance choreography** (one effect, re-runs on language toggle; SplitText):
H1 container is `gsap.set(..., {opacity:1})` then its **chars** animate; everything else is whole-element opacity fades from the CSS-initial `.opacity{opacity:0;will-change:opacity}` state.

| t (s) | Element | Animation |
|---|---|---|
| 0.5–0.75 | loading screen | opacity 1→0, 0.25 s, sine |
| 0.5–1.25 | navigation bar | `yPercent:-150→0` + opacity 0→1, 0.75 s, sine (own 0.5 s delayed-call gate) |
| 0.6 | H1 headline | SplitText `type:"chars"`, per-char opacity 0→1, `stagger:.015`, 1.25 s, sine |
| 0.75 | intro video | `.play()` begins 7.042 s clip |
| 0.8 | bottom tagline | SplitText `type:"words"`, `stagger:.025`, 1.25 s, sine |
| 0.8 | "Explore" label | opacity, 1.25 s, sine |
| 0.8 | right pill box | opacity, **1.5 s**, sine |
| 0.9 | circle CTA button | opacity, 1.25 s, sine |
| 1.0 | left small label | opacity, 1.25 s, sine |
| 1.0 | right tagline | opacity, 1.5 s, sine |
| 1.1 / 1.2 | two spare refs (`g`,`b`) | tweens exist but refs are unattached — leftovers, GSAP just warns |
| 7.8 | loop video | opacity 0→1, **0.1 s**, ease "none" — the intro→loop cut |

**Tokens actually in use:** ease `"sine"` for every entrance; durations 1.25 s (text) / 1.5 s (right column) / 0.75 s (nav) / 0.5 s (scroll-pill, hovers at 0.25–0.5 s in CSS); staggers 0.015 (chars) / 0.025 (words); scroll-triggered sections reuse the identical recipe with `scrollTrigger:{start:"top 95%"}` and delayed `ScrollTrigger.refresh()` via `setTimeout(...,1)`. Language toggle re-runs entrances (`[e]` dep) with `SplitText.revert()` cleanup, and is debounced (enabled after 3 s, locked 3 s per click). Scroll feel: Lenis defaults (`lerp:.1`, `easing: t=>Math.min(1,1.001-Math.pow(2,-10*t))`), programmatic scrolls 2.5 s.

---

## 5. Replication recipe for azen

Goal: same technique on the azen static Vite site with **original** assets. Assume the hero object is azen's own render (chip, orb, whatever) produced in Blender/AE at 30 fps on a `#020202`-matching background.

1. **Master three original clips.**
   - `hero-intro` — 6–8 s one-shot "arrival" (object assembles/flies in, settles into a neutral hover pose). Master 4K if budget allows; target ≈2.5 Mbps VP9 (`ffmpeg -c:v libvpx-vp9 -b:v 2.5M -crf 32 -an`). Strip audio (`-an`) — Berco shipped dead Opus tracks; don't copy that mistake.
   - `hero-loop` — 4–5 s seamless ambient loop **of the same hover pose**, 1080p, ~0.9 Mbps. Design rule from §3A: any loop frame must be a plausible continuation of the intro's final frame (slow rotation/bob, no landmark events), because the reveal happens at an arbitrary loop phase.
   - `seq-fwd` — 10 s @ 30 fps square (1280×1280) for the mid-page card. Then encode the reverse **from the same frames**: `ffmpeg -i seq-fwd.mp4 -vf reverse -c:v libx264 -g 300 -crf 26 -movflags +faststart seq-rev.mp4`. Note `-g 300` (sparse keyframes) is safe — it's never seeked — and roughly halves the file, exactly matching Berco's 10-keyframe vs 2-keyframe split. Add `+faststart` so `moov` precedes `mdat` (Berco's MP4s stream fine; keep that property). Provide H.264 as the baseline (plays everywhere incl. iOS); WebM/VP9 optional `<source>` on top.

2. **Markup (vanilla, no framework needed):**
   ```html
   <section class="hero" id="home">
     <div class="hero-layer">                <!-- absolute inset-0, flex center, z-0 -->
       <div class="hero-float">              <!-- 60% x 60%, the JS float target -->
         <div class="fade fade-t"></div><div class="fade fade-b"></div>
         <div class="fade fade-l"></div><div class="fade fade-r"></div>
         <video class="hero-vid" id="introVid" src="/media/hero-intro.mp4"
                muted playsinline preload="auto"></video>
         <video class="hero-vid is-hidden" id="loopVid" src="/media/hero-loop.mp4"
                autoplay muted playsinline loop preload="auto"></video>
       </div>
     </div>
     <div class="hero-copy"> …H1 + CTA left col, pill + tagline right col… </div>  <!-- z-1 -->
   </section>
   ```
   CSS essentials: page `background:#020202`; `.hero{position:relative;height:100vh}`; `.hero-vid{position:absolute;inset:0;width:100%;height:100%;object-fit:contain}`; `.is-hidden{opacity:0}`; fades = 10vh/10vw linear-gradients to `#020202`, `z-index:1`, sitting between video (z-0 within wrapper) and page copy. Copy grid: left column ~57.5%, right column ~42.5% pushed down ~40vh so the object owns the center. Mobile ≤768px: wrapper `100% × 45%`, `object-fit:cover`, hide right column.

3. **Playback wiring — hero intro→loop (measure, don't hardcode):** Berco hardcodes `7.8`. Do it robustly with the same visual result:
   ```js
   const LOADER_EXIT = 750;                    // ms, matches loader timeline
   introVid.addEventListener('ended', () => { // instead of clock math
     loopVid.classList.remove('is-hidden');   // CSS: transition opacity .1s linear
   });
   loaderTimeline.eventCallback('onComplete', () => introVid.play());
   ```
   Keep the 0.1 s reveal — long enough to hide the seam, short enough to read as a cut. Keep the loop autoplaying from load (hidden) so the reveal costs zero decode ramp-up.

4. **Playback wiring — ping-pong section:** exact port of §3B:
   ```js
   fwd.addEventListener('ended', () => { fwd.style.display='none'; rev.style.display='block'; rev.play(); });
   rev.addEventListener('ended', () => { rev.style.display='none'; fwd.style.display='block'; fwd.play(); });
   ```
   Use `display` (not `visibility`/opacity) so the hidden element paints nothing; each paused video holds its last frame = the other's first frame, so the swap is invisible. Do **not** attempt `video.playbackRate = -1` or `currentTime` walking — that's the whole reason the second file exists.

5. **Procedural float (the secret sauce):** run a rAF loop (or GSAP ticker) on the wrapper:
   ```js
   const ax=5, ay=5, rp=3000+2000*Math.random();
   (function drift(){ const t=Date.now();
     el.style.transform=`translate(${Math.sin(t/1000)*ax}px, ${Math.cos(t/900)*ay}px)
                         rotate(${Math.sin(t/rp)}deg)`;
     requestAnimationFrame(drift); })();
   ```
   ±5 px, ±1°, incommensurate periods. Apply to the *wrapper*, never the video element (avoids restarting compositor layers) and add `will-change:transform`.

6. **Entrance choreography:** reuse Berco's proven curve set — everything `ease:"sine"`; loader shimmer = 300%-wide white gradient clipped to text, background-position yoyo 2 s; loader exit 0.5 s delay + 0.25 s fade; H1 chars stagger 0.015 from t=0.6 s; secondary elements opacity-fade in 1.25–1.5 s at 0.8/0.9/1.0/1.1 s; nav drops `yPercent:-150→0` over 0.75 s. On a no-GSAP budget: CSS `@keyframes` + `animation-delay` reproduces the fades; per-char stagger needs a tiny split utility or GSAP SplitText/SplitType.

7. **Where a Three.js interactive layer sits (azen upgrade path):** insert a `<canvas>` **between** the video wrapper and the copy — i.e. `.hero-layer` (video, z-0) → `canvas.hero-webgl` (absolute inset-0, `z-index:1`, `pointer-events:none`, transparent clear color) → `.hero-copy` (z-2). The video stays the cheap "hero object"; Three.js adds parallax particles/cursor-reactive glints above it without compositing cost on the video itself. If instead the 3D object *replaces* the video, keep the identical shell (60% wrapper + 4 fade divs + drift) and swap the inner element — the layout contract stays byte-identical. Mouse-parallax on the wrapper (lerped `translate` toward cursor) can layer on top of the sine drift by summing offsets.

8. **Pitfalls (each one observed or implied in the original):**
   - **iOS/low-power autoplay:** `muted + playsinline + autoplay` is mandatory on the loop; the intro is started from JS, which iOS allows only because it's muted. Add a safety: `introVid.play().catch(()=>{ loopVid.classList.remove('is-hidden') })` — if autoplay is refused (Low Power Mode), skip straight to the (also possibly frozen) loop and make sure its first frame is a good poster; optionally set `poster` attributes (Berco has none — their loader hides the gap).
   - **Don't gate on a bare timer under slow networks:** Berco's 7.8 s clock assumes the 2.29 MB intro buffered within 0.75 s. Using `ended` (step 3) makes the swap network-proof; if you keep the loader, exit it on `introVid.canplaythrough` OR a 1.5 s cap, whichever first.
   - **Reversed-clip encoding:** reversing re-orders frames so temporal compression works "backwards" — always re-encode (never remux), keep GOPs long for size but ensure the **first** frame is an IDR so playback starts instantly; verify start latency on iOS Safari where `display:none→block` + `play()` can cost a frame — preloading both (`preload="auto"`) hides it.
   - **`ended` reliability:** `ended` won't fire if the element is looping (`loop` attr must be absent on ping-pong videos) and can be swallowed if the tab is backgrounded mid-clip — add a `visibilitychange` handler that calls `.play()` on whichever leg is visible.
   - **Seek performance is irrelevant here — keep it that way:** the whole design avoids `currentTime` scrubbing (their abandoned `.image-sequence-canvas` class shows they tried the scrub route). If a scroll-scrub is ever wanted, use an image-sequence on canvas, not video seeking.
   - **Layer hygiene:** stacked 4K video + backdrop-filter nav + fades is compositor-heavy; keep fades as gradients (no blur), give videos `transform: translateZ(0)` only if flicker appears, and never animate `filter` on the video.
   - **Bandwidth budget:** Berco ships 6.7 MB of video with `preload="auto"` on all four. For azen, lazy-init the below-the-fold ping-pong pair with an IntersectionObserver (`preload="metadata"` until near viewport).
   - **Reduced motion:** wrap the drift and shimmer in `matchMedia('(prefers-reduced-motion: reduce)')` — show intro's final frame as a static image; Berco skips this, azen shouldn't.
   - **Object-fit trap on mobile:** switching `contain→cover` changes which pixels survive; author the square/portrait-safe area into the render (Berco solves it by re-cropping via `cover` on a 45%-tall wrapper).

**Font/type reference (for parity of feel, substitute azen's brand):** headlines Helvetica Neue Light (local OTF) at `3.5vw`/`line-height:100%` with Medium-weight bold spans; body Inter at `1vw`–`1.5vw`; text "grey" = 50%-opacity white on `#020202`; glass surfaces = `rgba(255,255,255,.04)` + 1px `rgba(255,255,255,.05)` border + `backdrop-filter:blur(5px)`.
