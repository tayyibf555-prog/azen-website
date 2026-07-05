---
version: alpha
name: azen-design-system
description: "A near-black indigo-tinted canvas (oklch(0.06 0.012 260)) carrying a single committed accent: Apple-blue #0071e3, spent only on CTAs and punctuation beats. The system reads as industrial engineering: Archivo pushed to its Expanded width (font-stretch 125%) at weight 800, uppercase, for all display work — machined equipment-label energy — with a dimmed setup line / paper payoff line couplet and the blue full-stop as the recurring punctuation beat. Body runs Archivo normal-width 400-500; JetBrains Mono carries every annotation, stamp, and numeral. Surfaces are hairline-bordered panels on white/5, radius 1rem-2rem, with one glow treatment (terminal-glow) reserved for proof surfaces. Atmosphere comes from heavily dimmed indigo cinematic stills under gradient overlays, never decorative gradients. Motion: quiet 900ms-1s ease-out reveals plus two pinned scroll set pieces (horizontal work gallery, three-phase process)."

colors:
  canvas: "oklch(0.06 0.012 260)"      # --ink-deep, near-black tinted indigo
  surface-1: "oklch(0.10 0.012 260)"   # --ink
  surface-2: "oklch(0.16 0.012 260)"   # --ink-soft
  ink: "oklch(0.98 0.005 260)"         # --paper, warm white
  ink-muted: "#86868b"                 # --gray, Apple secondary gray
  accent: "#0071e3"                    # --indigo, the ONE chroma
  accent-hover: "#005bb5"              # --indigo-deep
  accent-drench: "oklch(0.30 0.18 260)" # --indigo-deep-bg, founder section ground
  hairline: "oklch(0.98 0.005 260 / 0.10)"        # --line
  hairline-strong: "oklch(0.98 0.005 260 / 0.20)" # --line-strong
  status-live: "#34d399"               # emerald, status dots only

color-strategy: >
  Committed-restrained hybrid: tinted near-black neutrals + one saturated blue
  under 10% of surface area, plus one drenched section (founder panel on
  accent-drench). Blue lands ONLY on primary CTAs, link hovers, and the
  closing-period punctuation beat. Emerald is reserved for live-status dots.
  No gradients as decoration; gradient overlays exist only to dim imagery.

typography:
  display-hero:
    fontFamily: Archivo (font-stretch 125%, uppercase, .display class)
    fontSize: clamp(3.2rem, 11vw, 11rem)
    fontWeight: 800
    lineHeight: 0.92
    letterSpacing: -0.015em
    note: dimmed setup line (white/35-45) then paper payoff line + blue period
  display-section:
    fontFamily: Archivo Expanded (.display)
    fontSize: clamp(2.2rem, 4.5-9vw, 8.5rem) per section scale
    fontWeight: 800
    lineHeight: 0.92-0.95
  headline:
    fontFamily: Archivo
    fontSize: 1.25rem-2rem
    fontWeight: 700
    letterSpacing: tracking-tight
  body:
    fontFamily: Archivo
    fontSize: 1rem-1.25rem
    fontWeight: 400-500
    lineHeight: 1.5
  mono-stamp:
    fontFamily: JetBrains Mono
    fontSize: 10-11px
    fontWeight: 400-500
    letterSpacing: 0.25em, uppercase
  mono-numeral:
    fontFamily: JetBrains Mono
    fontSize: 2.25rem-3rem
    fontWeight: 700
    fontVariant: tabular-nums

components:
  cta-primary: "Pill (rounded-full), bg #0071e3, paper text, px-8 py-3.5, bold; hover #005bb5"
  cta-ghost: "Pill, 1px white/20 border, transparent; hover white/10 fill"
  panel: "rounded-2xl, hairline border white/5, ink surface; terminal-glow treatment reserved for proof surfaces"
  eyebrow: "JetBrains Mono 10-11px uppercase tracking-[0.25em], numbered (01 / 02 /), accent or gray"
  case-card: "Browser-chrome frame: traffic-light dots + URL bar strip over the screenshot, on hairline-bordered card"
  status-dot: "2.5px emerald dot with animate-ping halo"

layout:
  max-width: "max-w-5xl content / max-w-6xl-7xl display sections"
  rhythm: "Generous py-24 to py-40 between acts; hairline border-white/5 rules as section handoffs"
  posture: "Centered hero; left-aligned staggered display couplets with per-line vw indents elsewhere; never a uniform centered stack"

imagery:
  policy: >
    Cinematic stills generated in-palette (deep indigo grounds, single blue
    glow), dimmed to 12-25% opacity under bg-gradient overlays. Texture you
    feel, not pictures you look at. Real photography only for the founder.
    Case studies always shown as real product screenshots, framed uniformly.

motion:
  reveals: "opacity 0→1 + translateY 10→0, 1000ms ease-out, IntersectionObserver-triggered"
  signature: "One scroll-driven moment per page (process section phase sequence); GSAP ScrollTrigger"
  micro: "150-250ms ease-out on hovers; marquee 80s linear; typing terminal 10s cycle"
  reduced-motion: "Global CSS gate kills everything; content must read complete with zero motion"
