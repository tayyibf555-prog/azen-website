---
version: alpha
name: azen-design-system
description: "Engineered dark. A near-black indigo-tinted ground (oklch(0.06 0.012 260)) carrying soft radial indigo washes and one CSS light beam in the hero (Grok company-page register) — zero generated imagery. Paper text, and the one committed blue #0071e3 landing on CTAs, punctuation beats, and mono-label arrows. Display work is Hanken Grotesk extrabold, sentence case, -0.02em, in the thin/bold couplet signature (Geist Light setup line / Hanken payoff + blue full-stop). JetBrains Mono carries the engineering register: bracketed eyebrows ([ 01 / Shipped systems ]), corner-ticked stat cards (Spade register), chrome bars, counters. Set pieces: pinned horizontal work gallery (Koto), three-phase process pin with outlined ghost numeral (FLORA), founder split with full-colour framed portrait (Programa), and a single centred blue-glow CTA climax (Antimetal). Motion: boot intro, staggered hero lines, count-ups, quiet 1s ease-out reveals — one signature scroll moment per stretch."

colors:
  ground: "oklch(0.985 0.006 255)"      # paper
  ground-soft: "oklch(0.955 0.010 255)" # recessed panels
  ink-deep: "oklch(0.13 0.030 260)"     # headline ink navy
  ink: "oklch(0.18 0.030 260)"          # body ink
  accent: "#0071e3"                     # the ONE blue
  accent-hover: "#005bb5"
  accent-drench: "oklch(0.44 0.19 258)" # drenched section ground
  accent-eyebrow: "oklch(0.47 0.17 255)" # indigo-bright: AA at 11px on paper
  hairline: "oklch(0.18 0.03 260 / 0.12)"
  grid-line: "oklch(0.55 0.16 255 / 0.28)" # drafting grid
  paper: "oklch(0.985 0.003 260)"       # text ON blue grounds
  gray: "#6e6e73"                        # secondary text, AA on paper
  status-live: "#059669"                 # emerald-600 on paper

color-strategy: >
  Committed light: paper ground structured by the ink-blue drafting grid,
  ink-navy text, one saturated blue on CTAs / rules / punctuation beats,
  and two fully drenched blue sections (Founder, Final CTA) where text
  flips to paper and primary buttons flip to white-on-blue. Emerald is
  reserved for live-status dots. No decorative gradients.

typography:
  display-hero:
    fontFamily: Schibsted Grotesk (weight 800, sentence case, .display class)
    fontSize: clamp(3.2rem, 11vw, 11rem)
    fontWeight: 800
    lineHeight: 0.92
    letterSpacing: -0.015em
    note: dimmed setup line (ink/40) then ink-deep payoff line + blue period
  display-section:
    fontFamily: Schibsted Grotesk (.display)
    fontSize: clamp(2.2rem, 4.5-9vw, 8.5rem) per section scale
    fontWeight: 800
    lineHeight: 0.92-0.95
  headline:
    fontFamily: Schibsted Grotesk
    fontSize: 1.25rem-2rem
    fontWeight: 700
    letterSpacing: tracking-tight
  body:
    fontFamily: Schibsted Grotesk
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
    Texture comes from the CSS drafting grid, not imagery. Dark appears only
    as framed objects on the paper ground: dashboard screenshots inside
    browser-chrome frames, the brand film in its panel. Real photography
    only for the founder (full colour). The dark atmosphere stills from the
    previous direction remain in public/atmosphere/ but are unused.

motion:
  reveals: "opacity 0→1 + translateY 10→0, 1000ms ease-out, IntersectionObserver-triggered"
  signature: "One scroll-driven moment per page (process section phase sequence); GSAP ScrollTrigger"
  micro: "150-250ms ease-out on hovers; marquee 80s linear; typing terminal 10s cycle"
  reduced-motion: "Global CSS gate kills everything; content must read complete with zero motion"
