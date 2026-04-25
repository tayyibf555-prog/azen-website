// src/AzenHomePage.jsx
import React, { useEffect, useState, useRef } from "react";
import Navbar from "./components/Navbar";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Menu,
  ArrowRight,
  Play,
  Bot,
  Workflow,
  ShieldCheck,
  Sparkles,
  LineChart,
  Settings,
  MessageCircle,
  Clock,
  ChevronRight,
  Target,
  BarChart3,
  X,
} from "lucide-react";

/* ---------------------------
   Simple reveal-on-scroll
---------------------------- */
function Reveal({ children, delay = 0, y = 16, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px 0px" }}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ---------------------------
   Strategy timeline step
---------------------------- */
function StrategyStep({ index, title, desc, active }) {
  return (
    <div className="relative pl-14 pb-10 last:pb-0">
      {/* icon box */}
      <div className="absolute left-0 top-1.5 w-10 h-10 rounded-2xl bg-[#020817] border border-white/10 flex items-center justify-center shadow-[0_0_20px_rgba(56,189,248,0.2)]">
        {index === 1 && <Target className="w-4 h-4 text-cyan-300" />}
        {index === 2 && <LineChart className="w-4 h-4 text-cyan-300" />}
        {index === 3 && <Settings className="w-4 h-4 text-cyan-300" />}
      </div>

      {/* content */}
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-white/40">
          {index}) {active ? "In focus" : "Step"}
        </p>
        <h3 className="text-white font-semibold">{title}</h3>
        <p className="text-sm text-white/70 max-w-md">{desc}</p>
      </div>
    </div>
  );
}

/* ---------------------------
   Main page
---------------------------- */
// Module-level variable to track if intro has been shown in this "session" (persists during client-side nav, resets on refresh)
let sessionIntroShown = false;

export default function AzenHomePage() {
  const [intro, setIntro] = useState(() => !sessionIntroShown);

  // floating hero word cycle
  const heroWords = ["Audit", "Educate", "Develop"];
  const [heroIndex, setHeroIndex] = useState(0);


  useEffect(() => {
    const interval = setInterval(
      () => setHeroIndex((prev) => (prev + 1) % heroWords.length),
      2400
    );
    return () => clearInterval(interval);
  }, [heroWords.length]);

  // strategy timeline animation
  const strategyRef = useRef(null);
  const strategyInView = useInView(strategyRef, {
    once: true,
    margin: "-40% 0px",
  });

  useEffect(() => {
    // If intro is true, wait then turn it off and mark session variable
    if (intro) {
      const timer = setTimeout(() => {
        setIntro(false);
        sessionIntroShown = true;
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [intro]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-[#0a1b3f] text-white font-sans selection:bg-cyan-500/30">
      <AnimatePresence>
        {intro && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#020817]"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="font-semibold tracking-tight text-5xl md:text-6xl text-white"
            >
              azen
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NAVBAR */}
      <Navbar />

      {/* HERO SECTION - REBUILT FOR PREMIUM CENTRED LAYOUT */}
      <main className="relative z-10 w-full overflow-hidden">
        <section id="hero" className="pt-24 md:pt-32 pb-40 relative">
          <div className="mx-auto max-w-7xl px-4 md:px-8 grid grid-cols-12 gap-10 items-center">
            {/* text */}
            <div className="col-span-12 lg:col-span-7">
              <Reveal>
                <div className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70 mb-5">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Your Trusted AI Strategy Partner
                  </span>
                  <ChevronRight className="w-3 h-3 ml-2" />
                </div>
              </Reveal>

              <Reveal delay={0.05}>
                <h1 className="text-[40px] leading-tight md:text-6xl md:leading-[1.05] font-semibold tracking-tight">
                  AI doesn&apos;t fail. <span className="whitespace-nowrap">Strategy does.</span>
                  <br />
                  Success follows when you{" "}
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={heroWords[heroIndex]}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -16 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="relative text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-300 to-indigo-300 inline-block"
                    >
                      {heroWords[heroIndex]}
                    </motion.span>
                  </AnimatePresence>
                  .
                </h1>
              </Reveal>

              <Reveal delay={0.12}>
                <p className="mt-6 text-base md:text-lg text-white/75 max-w-xl">
                  Most AI projects fail because they&apos;re built blindly. Azen
                  starts with strategy — auditing your operations, educating
                  your team, and developing AI that actually fits your business.
                </p>
              </Reveal>

              <Reveal delay={0.18}>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <a href="https://calendly.com/tayyib-azen/30min"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-cyan-400 text-slate-950 px-6 py-3 text-sm font-semibold shadow-[0_18px_60px_rgba(34,211,238,0.35)] hover:scale-105 active:scale-95 transition-all duration-300 ring-2 ring-cyan-400/20 hover:ring-cyan-400/50"
                  >
                    Let&apos;s partner up
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </Reveal>
            </div>

            {/* Massive Centered Dashboard Mockup (overlapping next section) */}
            <div className="w-full mt-20 relative lg:-mb-64 md:-mb-40 -mb-24 z-20">
              <div className="absolute inset-x-8 top-1/4 bottom-0 bg-indigo-500/20 blur-[100px] pointer-events-none rounded-full" />
              <Reveal delay={0.15}>
                <HeroDashboardCard />
              </Reveal>
            </div>
          </div>
        </section >

        {/* TRUST MARQUEE */}
        < section className="relative bg-black/50 py-10 md:py-14 border-t border-b border-white/5 overflow-hidden z-10 lg:pt-52 md:pt-32 pt-20" >
          <div className="flex flex-col items-center">
            <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-6 drop-shadow-md">
              POWERING INNOVATIVE TEAMS WORLDWIDE
            </p>
            <div className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
              <ul className="flex items-center justify-center md:justify-start [&_li]:mx-8 [&_img]:max-w-none animate-[infinite-scroll_30s_linear_infinite]">
                {/* 1st set */}
                {["Acme Corp", "Quantum", "Echo", "Lumina", "Apex", "Veritas"].map((name, i) => (
                  <li key={`tr1-${i}`} className="text-xl md:text-2xl font-bold text-white/20 whitespace-nowrap">{name}</li>
                ))}
                {/* 2nd set for seamless loop */}
                {["Acme Corp", "Quantum", "Echo", "Lumina", "Apex", "Veritas"].map((name, i) => (
                  <li key={`tr2-${i}`} className="text-xl md:text-2xl font-bold text-white/20 whitespace-nowrap">{name}</li>
                ))}
              </ul>
            </div>

            <style jsx>{`
              @keyframes infinite-scroll {
                from { transform: translateX(0); }
                to { transform: translateX(-50%); }
              }
            `}</style>
          </div>
        </section >

        {/* STRATEGY-FIRST APPROACH + DASHBOARD */}
        < section
          id="how"
          className="relative bg-black/10 py-24 md:py-32"
        >
          <div className="mx-auto max-w-7xl px-4 md:px-8 grid grid-cols-12 gap-10 items-start">
            {/* timeline */}
            <div className="col-span-12 lg:col-span-5 lg:sticky lg:top-32 self-start" ref={strategyRef}>
              <Reveal>
                <p className="text-xs uppercase tracking-[0.25em] text-cyan-200 mb-3">
                  What is it we do?
                </p>
                <h2 className="text-3xl md:text-4xl font-semibold">
                  Our{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-indigo-300">
                    Strategy-First
                  </span>{" "}
                  approach broken down:
                </h2>
              </Reveal>

              <div className="relative mt-10">
                {/* vertical animated bar */}
                <motion.div
                  className="absolute left-4 top-3 w-[2px] rounded-full bg-gradient-to-b from-cyan-400 via-indigo-400 to-transparent"
                  style={{ transformOrigin: "top" }}
                  initial={{ scaleY: 0 }}
                  animate={strategyInView ? { scaleY: 1 } : { scaleY: 0 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                />

                <div className="space-y-6">
                  <StrategyStep
                    index={1}
                    active={strategyInView}
                    title="Auditing & Identification"
                    desc="We map your processes, channels, and data to identify where AI can drive the fastest and safest ROI — before anything is built."
                  />
                  <StrategyStep
                    index={2}
                    active={strategyInView}
                    title="Education & Strategy Alignment"
                    desc="We work with your team to shape an AI roadmap, align stakeholders, and de-risk projects with clear guardrails and KPIs."
                  />
                  <StrategyStep
                    index={3}
                    active={strategyInView}
                    title="Custom AI Development"
                    desc="Then we design, build and iterate AI receptionists, workflows and analytics tailored to your stack — and keep improving them."
                  />
                </div>
              </div>
            </div>

            {/* dashboard panel */}
            <div className="col-span-12 lg:col-span-7 relative">
              <div className="absolute inset-x-10 inset-y-10 bg-cyan-500/10 blur-[100px] pointer-events-none" />
              <Reveal delay={0.1}>
                <StrategyDashboardPanel />
              </Reveal>
            </div>
          </div>

          {/* stats strip */}
          <Reveal delay={0.22}>
            <div className="mx-auto max-w-5xl px-4 md:px-8 mt-16">
              <div className="rounded-3xl border border-white/10 bg-black/40 px-6 py-6 md:px-10 md:py-7 flex flex-col md:flex-row items-center justify-between gap-6 text-sm">
                <StatPill
                  value="82%"
                  label="of companies discover new AI opportunities within the first audit."
                />
                <div className="hidden md:block h-10 w-px bg-white/10" />
                <StatPill
                  value="41%"
                  label="average savings on AI development spend through due-diligence."
                />
                <div className="hidden md:block h-10 w-px bg-white/10" />
                <StatPill
                  value="4.7x"
                  label="higher ROI from AI projects using a strategy-first framework."
                />
              </div>
            </div>
          </Reveal>
        </section >

        {/* ROI SECTION – “What you get is clear ROI” */}
        < section
          id="resources"
          className="relative border-t border-white/10 bg-black/20 py-16 md:py-20"
        >
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <Reveal>
              <div className="flex flex-col items-center text-center">
                <div className="inline-flex items-center rounded-full border border-white/15 bg-black/60 px-4 py-1 text-xs text-white/70 mb-4">
                  What we deliver
                </div>
                <h2 className="text-3xl md:text-4xl font-semibold">
                  What you get is clear{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-indigo-400">
                    ROI
                  </span>
                </h2>
              </div>
            </Reveal>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
              <Reveal delay={0.05} className="h-full">
                <ROIBlock
                  title="Complete AI Opportunity Report"
                  desc="A clear breakdown of your processes showing exactly where AI can bring the strongest and fastest ROI."
                  bullets={[
                    "Map all workflows and bottlenecks",
                    "Spot high-leverage AI touchpoints",
                    "Estimate savings and uplift",
                  ]}
                />
              </Reveal>
              <Reveal delay={0.12} className="h-full">
                <ROIBlock
                  title="Adoption Blueprint"
                  desc="A practical roadmap that outlines how AI fits into your workflows and helps your team embrace it with ease."
                  bullets={[
                    "Team alignment & training",
                    "Workflow & rollout plan",
                    "Feedback loops & governance",
                  ]}
                />
              </Reveal>
              <Reveal delay={0.19} className="h-full">
                <ROIBlock
                  title="Custom Built AI Solutions"
                  desc="Tailored AI receptionists, automations and analytics designed around your stack — not a generic template."
                  bullets={[
                    "Plug into your tools & data",
                    "Human-in-the-loop controls",
                    "Ongoing optimisation & support",
                  ]}
                />
              </Reveal>
            </div>
          </div>
        </section >

        {/* BOOK A DEMO */}
        < section
          id="book"
          className="relative border-t border-white/10 bg-white/5/5 py-16 md:py-20"
        >
          <div className="mx-auto max-w-7xl px-4 md:px-8 grid grid-cols-12 gap-10 items-center">
            <div className="col-span-12 md:col-span-5">
              <Reveal>
                <p className="text-xs uppercase tracking-[0.25em] text-cyan-200 mb-3">
                  Schedule a strategy call
                </p>
                <h2 className="text-3xl font-semibold">
                  Free 30-minute AI audit call
                </h2>
              </Reveal>
              <Reveal delay={0.07}>
                <p className="mt-3 text-sm text-white/75">
                  Get a clear picture of where AI fits in your operations and
                  how it can drive real ROI. No jargon, no pressure — just a
                  practical conversation about your business.
                </p>
              </Reveal>
              <Reveal delay={0.12}>
                <ul className="mt-5 space-y-2 text-sm text-white/80">
                  <li className="flex gap-2">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-cyan-300" />
                    Your team is drowning in busywork and needs time back for
                    high-impact tasks.
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-cyan-300" />
                    You want AI systems handling repetitive work without hiring
                    more headcount.
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-cyan-300" />
                    You have ideas for automation but need help validating and
                    designing them.
                  </li>
                </ul>
              </Reveal>
            </div>

            <div className="col-span-12 md:col-span-7 flex items-center justify-center md:justify-end mt-8 md:mt-0">
              <Reveal delay={0.1}>
                <a
                  href="https://calendly.com/tayyib-azen/30min"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded-full bg-cyan-400 text-slate-950 px-10 py-5 text-lg font-bold shadow-[0_0_60px_rgba(34,211,238,0.3)] hover:scale-105 active:scale-95 transition-all duration-300 ring-4 ring-cyan-400/20 hover:ring-cyan-400/50"
                >
                  Book your Free Audit
                </a>
              </Reveal>
            </div>
          </div>
        </section >

        {/* SOLUTIONS */}
        < section
          id="solutions"
          className="relative border-t border-white/10 bg-black/25 py-16 md:py-20"
        >
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <Reveal>
              <h2 className="text-3xl font-semibold">Core solutions</h2>
              <p className="mt-2 text-white/70 max-w-2xl text-sm md:text-base">
                Deploy one or many Azen modules — each designed to plug into
                your stack and work together as a single, coherent system.
              </p>
            </Reveal>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
              <Reveal delay={0.05}>
                <SolutionCard
                  icon={<Bot className="w-5 h-5" />}
                  title="AI Receptionist"
                  desc="Natural-sounding AI handling inbound calls, WhatsApp, SMS and web chat — 24/7, fully trained on your business."
                  bullets={[
                    "Miss fewer calls & leads",
                    "Route smarter to your team",
                    "Multi-language support",
                  ]}
                />
              </Reveal>
              <Reveal delay={0.12}>
                <SolutionCard
                  icon={<Workflow className="w-5 h-5" />}
                  title="Task Automation"
                  desc="Automate admin, follow-ups and hand-offs across your tools so your people focus on work that actually matters."
                  bullets={[
                    "Visual workflow builder",
                    "Human-in-the-loop control",
                    "Detailed audit trail",
                  ]}
                />
              </Reveal>
              <Reveal delay={0.19}>
                <SolutionCard
                  icon={<ShieldCheck className="w-5 h-5" />}
                  title="AI Business Audit"
                  desc="A structured audit of your operations to uncover where AI will have the most impact — before you invest."
                  bullets={[
                    "Process & data mapping",
                    "Risk & compliance review",
                    "Prioritised AI roadmap",
                  ]}
                />
              </Reveal>
            </div>
          </div>
        </section >

        {/* REFERRALS SECTION */}
        < section
          id="referrals"
          className="relative border-t border-white/10 bg-black/35 py-16 md:py-20"
        >
          <div className="mx-auto max-w-5xl px-4 md:px-8">
            <Reveal>
              <h2 className="text-3xl font-semibold mb-4">Referrals</h2>
            </Reveal>
            <Reveal delay={0.06}>
              <p className="text-sm md:text-base text-white/75 mb-3">
                Love what Azen does? When you introduce us to another business
                and they move forward as a client, we agree a thank-you
                financial incentive with you during the referral conversation.
              </p>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="text-sm md:text-base text-white/70">
                Just email us your referral&apos;s details or mention them
                during onboarding, and we&apos;ll handle the rest while keeping
                you updated on how things progress.
              </p>
            </Reveal>
          </div>
        </section >

        {/* FAQ */}
        < section
          id="faq"
          className="relative border-t border-white/10 bg-black/30 py-16 md:py-20"
        >
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <Reveal>
              <h2 className="text-3xl font-semibold">
                Frequently asked questions
              </h2>
            </Reveal>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  q: "How long does it take to go live?",
                  a: "Most teams launch an initial receptionist or workflow within 2–4 weeks after the audit, depending on complexity.",
                },
                {
                  q: "Do you replace our existing tools?",
                  a: "Usually no. Azen is built to sit on top of your current CRMs, calendars and comms channels — not rip them out.",
                },
                {
                  q: "Is data secure and compliant?",
                  a: "We use encryption in transit & at rest, role-based access and detailed logging. We align to your compliance needs.",
                },
                {
                  q: "Can we bring our own models?",
                  a: "Yes. We can route to your preferred LLMs where it makes sense, while still giving you a unified experience.",
                },
              ].map((f) => (
                <Reveal key={f.q}>
                  <details className="rounded-2xl border border-white/12 bg-black/40 px-4 py-3 text-sm">
                    <summary className="cursor-pointer text-white/90">
                      {f.q}
                    </summary>
                    <p className="mt-2 text-white/70">{f.a}</p>
                  </details>
                </Reveal>
              ))}
            </div>
          </div>
        </section >

        {/* FULL BLEED TESTIMONIAL */}
        < section className="relative w-full bg-cyan-900/20 py-24 md:py-32 overflow-hidden flex items-center justify-center text-center" >
          <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
          <Reveal>
            <div className="max-w-4xl mx-auto px-6 relative z-10">
              <p className="text-2xl md:text-5xl font-light text-white leading-relaxed tracking-tight italic">
                &quot;Azen completely transformed how we handle inbound queries. Our team saves 20 hours a week, and our customers get instant answers at 2 AM. It&apos;s a game-changer.&quot;
              </p>
              <div className="mt-8 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-500 p-[2px]">
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-xl font-bold">
                    SJ
                  </div>
                </div>
                <h4 className="mt-4 font-semibold text-white">Sarah Jenkins</h4>
                <p className="text-sm text-white/50">Director of Operations, Lumina Corp</p>
              </div>
            </div>
          </Reveal>
        </section >

        {/* FOOTER */}
        < footer
          id="contact"
          className="relative border-t border-white/10 bg-black/40"
        >
          <div className="mx-auto max-w-7xl px-4 md:px-8 py-12 grid grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-4 space-y-3">
              <div className="flex items-center gap-2 text-xl font-semibold">
                azen <Sparkles className="w-4 h-4 text-cyan-300" />
              </div>
              <p className="text-sm text-white/70 max-w-sm">
                The Future Made Simple. AI receptionists, automations and
                analytics that elevate customer experience and operations.
              </p>
            </div>

            <div className="col-span-6 md:col-span-2 space-y-3">
              <h4 className="text-sm font-semibold text-white/80">Product</h4>
              <ul className="text-sm text-white/70 space-y-1.5">
                <li>
                  <a href="#solutions">AI Receptionist</a>
                </li>
                <li>
                  <a href="#solutions">Automation</a>
                </li>
                <li>
                  <a href="#how">Analytics & Strategy</a>
                </li>
              </ul>
            </div>

            <div className="col-span-6 md:col-span-2 space-y-3" id="cases">
              <h4 className="text-sm font-semibold text-white/80">Company</h4>
              <ul className="text-sm text-white/70 space-y-1.5">
                <li>
                  <a href="#hero">About</a>
                </li>
                <li>
                  <a href="https://calendly.com/tayyib-azen/30min" target="_blank" rel="noopener noreferrer">Work with us</a>
                </li>
                <li>
                  <a href="#resources">Case studies</a>
                </li>
                <li>
                  <a href="#referrals">Referrals</a>
                </li>
              </ul>
            </div>

            <div className="col-span-12 md:col-span-4 space-y-3">
              <h4 className="text-sm font-semibold text-white/80">
                Stay in the loop
              </h4>
              <p className="text-xs text-white/60">
                Get practical AI playbooks and case studies (no spam, just
                signal).
              </p>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex gap-2 mt-2"
              >
                <input
                  type="email"
                  placeholder="Work email"
                  className="w-full rounded-2xl bg-black/60 border border-white/15 px-4 py-2.5 text-sm outline-none focus:border-cyan-300 placeholder:text-white/40"
                />
                <button className="rounded-2xl bg-cyan-400 text-slate-950 px-4 py-2.5 text-sm font-semibold">
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          <div className="border-t border-white/10 py-4 text-center text-[11px] text-white/50">
            © {new Date().getFullYear()} Azen. All rights reserved.
          </div>
        </footer >
      </main >

    </div >
  );
}

/* ------------------------------------------------
   Smaller components used above
-------------------------------------------------- */

function HeroDashboardCard() {
  return (
    <div className="rounded-[26px] border border-white/10 bg-black/50 shadow-[0_24px_80px_rgba(15,23,42,0.8)] overflow-hidden">
      <div className="px-5 pt-4 pb-3 flex items-center justify-between text-xs text-white/60 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          Live dashboard
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5" />
          <span>Today</span>
        </div>
      </div>

      <div className="p-5 space-y-4 text-xs">
        {/* quick actions */}
        <div className="flex flex-wrap gap-3">
          {[
            "Create new automation",
            "Try latest receptionist model",
            "Train new workflow",
          ].map((label, i) => (
            <div
              key={label}
              className="flex-1 min-w-[180px] rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-950/90 px-4 py-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-cyan-400/15 flex items-center justify-center">
                  {i === 0 && <Workflow className="w-3.5 h-3.5 text-cyan-300" />}
                  {i === 1 && <Bot className="w-3.5 h-3.5 text-cyan-300" />}
                  {i === 2 && (
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-300" />
                  )}
                </div>
                <div>
                  <div className="text-[11px] text-white/70">{label}</div>
                  <div className="text-[10px] text-white/40">
                    Quick action · 30s
                  </div>
                </div>
              </div>
              <ChevronRight className="w-3 h-3 text-white/40" />
            </div>
          ))}
        </div>

        {/* actions row */}
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              title: "Calls handled",
              value: "318",
              tag: "+38%",
              accent: "bg-emerald-400/70",
            },
            {
              title: "No-shows prevented",
              value: "47",
              tag: "-21%",
              accent: "bg-cyan-400/70",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3"
            >
              <div className="flex items-center justify-between text-[11px] text-white/60 mb-2">
                <span>{card.title}</span>
                <span className="px-2 py-0.5 rounded-full bg-black/60 text-[10px]">
                  Live
                </span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-lg font-semibold">{card.value}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${card.accent} text-slate-950`}
                >
                  {card.tag}
                </span>
              </div>
              <div className="mt-2 h-8 rounded-md bg-gradient-to-tr from-slate-900 to-slate-800 overflow-hidden">
                <div className="w-full h-full flex items-end gap-1 px-1">
                  {Array.from({ length: 14 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-sm bg-gradient-to-t from-cyan-400/50 to-transparent"
                      style={{
                        height: `${30 + (i % 5) * 12}%`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* bottom row */}
        <div className="grid grid-cols-2 gap-3 text-[11px]">
          <div className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 flex items-center gap-3">
            <div className="w-7 h-7 rounded-xl bg-cyan-400/20 flex items-center justify-center">
              <MessageCircle className="w-3.5 h-3.5 text-cyan-300" />
            </div>
            <div>
              <div className="text-white/80">Inbox load</div>
              <div className="text-white/50">62% deflected by AI</div>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 flex items-center gap-3">
            <div className="w-7 h-7 rounded-xl bg-emerald-400/15 flex items-center justify-center">
              <BarChart3 className="w-3.5 h-3.5 text-emerald-300" />
            </div>
            <div>
              <div className="text-white/80">CSAT</div>
              <div className="text-white/50">4.8 / 5 from callers</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* dashboard in strategy section */
function StrategyDashboardPanel() {
  return (
    <div className="rounded-[30px] border border-white/10 bg-gradient-to-br from-slate-950/95 via-slate-950 to-slate-950/95 shadow-[0_30px_100px_rgba(15,23,42,0.9)] overflow-hidden">
      {/* top bar */}
      <div className="px-5 py-3 flex items-center justify-between text-xs text-white/60 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          azen / Strategy dashboard
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-300" />
          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
        </div>
      </div>

      <div className="p-5 space-y-5 text-xs">
        {/* actions row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              title: "Audit workflows",
              sub: "Map processes",
              label: "NEW",
            },
            {
              title: "Educate team",
              sub: "Playbooks & training",
              label: "LIVE",
            },
            {
              title: "Develop AI",
              sub: "Ship automations",
              label: "UPD",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-white/12 bg-gradient-to-br from-slate-900/90 to-slate-950 px-4 py-3 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80">{item.title}</span>
                <span className="px-2 py-0.5 rounded-full bg-black/60 text-[9px] text-cyan-200">
                  {item.label}
                </span>
              </div>
              <p className="text-[11px] text-white/55">{item.sub}</p>
              <div className="mt-3 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full w-2/3 bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400" />
              </div>
            </div>
          ))}
        </div>

        {/* analytics */}
        <div className="grid grid-cols-12 gap-4 items-start">
          <div className="col-span-12 md:col-span-7 rounded-2xl border border-white/12 bg-slate-950 px-4 py-3">
            <div className="flex items-center justify-between text-[11px] text-white/60 mb-2">
              <span>AI impact over last 30 days</span>
              <span className="px-2 py-0.5 rounded-full bg-black/60 text-[10px]">
                Automation rate
              </span>
            </div>
            <div className="mt-3 h-28 rounded-xl bg-gradient-to-b from-slate-900 via-slate-950 to-black overflow-hidden">
              <div className="w-full h-full flex items-end gap-1 px-2">
                {Array.from({ length: 18 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm bg-gradient-to-t from-cyan-400 via-sky-400 to-transparent"
                    style={{
                      height: `${30 + ((i * 13) % 60)}%`,
                      opacity: 0.3 + (i % 5) * 0.1,
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-white/60">
              <span>Time saved</span>
              <span className="text-emerald-300">+124 hrs / month</span>
            </div>
          </div>

          <div className="col-span-12 md:col-span-5 space-y-3">
            <div className="rounded-2xl border border-white/12 bg-slate-950 px-4 py-3">
              <div className="flex items-center justify-between text-[11px] text-white/60 mb-2">
                <span>Channels covered</span>
                <span>Live</span>
              </div>
              <div className="flex flex-wrap gap-2 text-[10px] text-white/75">
                {["Phone", "WhatsApp", "SMS", "Email", "Web chat"].map((c) => (
                  <span
                    key={c}
                    className="px-2 py-0.5 rounded-full bg-black/60 border border-white/10"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/12 bg-slate-950 px-4 py-3 text-[11px] text-white/70">
              <div className="flex items-center justify-between mb-2">
                <span>Escalations with context</span>
                <span className="text-emerald-300">92%+ CSAT</span>
              </div>
              <p className="text-white/60">
                Human agents only see the complex cases — with full summaries
                and call notes generated by Azen.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatPill({ value, label }) {
  return (
    <div className="flex items-center gap-3 text-left max-w-xs">
      <div className="text-3xl font-semibold text-white">
        {value}
        <span className="text-xl text-cyan-300 ml-0.5">
          {value.endsWith("x") ? "" : ""}
        </span>
      </div>
      <p className="text-xs text-white/70">{label}</p>
    </div>
  );
}

function ROIBlock({ title, desc, bullets }) {
  return (
    <div className="h-full rounded-3xl border border-white/12 bg-gradient-to-b from-slate-950/90 via-slate-950 to-black px-5 py-6 flex flex-col justify-between shadow-[0_20px_60px_rgba(15,23,42,0.8)]">
      <div>
        <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
        <p className="text-sm text-white/70 mb-4">{desc}</p>
      </div>
      <ul className="space-y-2 text-xs text-white/75">
        {bullets.map((b) => (
          <li key={b} className="flex gap-2">
            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-cyan-300" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SolutionCard({ icon, title, desc, bullets }) {
  return (
    <div className="rounded-3xl border border-white/12 bg-black/40 p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-2xl bg-cyan-400/15 flex items-center justify-center text-cyan-300">
            {icon}
          </div>
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <p className="text-sm text-white/70">{desc}</p>
      </div>
      <ul className="mt-4 space-y-2 text-xs text-white/75">
        {bullets.map((b) => (
          <li key={b} className="flex gap-2">
            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-cyan-300" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}