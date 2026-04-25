import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { cases } from "../data/caseStudies";
import Navbar from "../components/Navbar";

export default function CaseStudiesPage() {
    // Duplicate cases to create a seamless infinite loop
    const extendedCases = [...cases, ...cases, ...cases, ...cases];

    return (
        <div className="min-h-screen bg-gradient-to-tr from-black to-blue-900 text-white selection:bg-cyan-500/30 relative overflow-hidden">
            {/* Background gradients */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_30%_10%,rgba(0,215,192,0.18),transparent_60%),radial-gradient(50%_40%_at_75%_20%,rgba(0,108,255,0.15),transparent_60%)]" />

            <Navbar />

            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 60s linear infinite;
                }
                .animate-marquee:hover {
                    animation-play-state: paused;
                }
            `}</style>

            <main className="py-16 space-y-14 relative z-10">
                {/* Hero */}
                <section className="text-center max-w-3xl mx-auto px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-cyan-300 mb-5">
                            <TrendingUp className="w-3 h-3 mr-2" />
                            Proven Results
                        </div>
                        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-6">
                            See what's possible
                        </h1>
                        <p className="text-lg text-white/75 leading-relaxed">
                            Real businesses, real ROI. Discover how companies are using Azen to scale operations and improve customer experience.
                        </p>
                    </motion.div>
                </section>

                {/* Case Studies Carousel (Infinite Marquee) */}
                <section className="relative w-full overflow-hidden">
                    <div className="flex w-max gap-6 animate-marquee px-4">
                        {extendedCases.map((c, i) => (
                            <Link
                                key={i}
                                to={`/cases/${c.slug}`}
                                className="w-[85vw] md:w-[400px] shrink-0 rounded-2xl border border-white/10 bg-black/40 p-8 relative overflow-hidden group hover:border-white/20 transition-all cursor-pointer hover:scale-[1.02] flex flex-col"
                            >
                                {/* Logo Lockup - matching reference */}
                                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 mb-8 pb-8 border-b border-white/10">
                                    <div className="flex justify-end">
                                        <img src="/logos/azen.svg" alt="Azen" className="h-10 w-auto object-contain" />
                                    </div>
                                    <span className="text-white/40 text-2xl text-center">×</span>
                                    <div className="flex justify-start">
                                        {c.clientLogo ? (
                                            <img src={c.clientLogo} alt={c.title} className="h-20 w-auto object-contain" />
                                        ) : (
                                            <div className="flex items-center gap-2 text-white font-semibold text-base">
                                                {c.icon}
                                                <span className="whitespace-nowrap">{c.title}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Client label */}
                                <div className="text-sm font-medium text-purple-400 mb-2">Client</div>

                                {/* Case study title */}
                                <h3 className="text-xl font-normal text-white/90 mb-6">Client Case Study: <span className="whitespace-nowrap">{c.title}</span></h3>

                                <p className="text-white/60 text-sm mb-8 flex-1">{c.desc}</p>

                                <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-6">
                                    {c.stats.map((s, j) => (
                                        <div key={j}>
                                            <div className="text-lg font-semibold text-white">{s.value}</div>
                                            <div className="text-[10px] text-white/50 uppercase">{s.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section className="mx-auto max-w-7xl px-8">
                    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0b1836] to-black p-8 md:p-12 text-center">
                        <h2 className="text-2xl md:text-3xl font-semibold mb-4">Ready to write your success story?</h2>
                        <p className="text-white/70 max-w-2xl mx-auto mb-8">
                            Join the forward-thinking businesses that are scaling with Azen.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="https://calendly.com/tayyib-azen/30min" target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-cyan-400 text-[#062035] font-semibold hover:bg-cyan-300 transition-colors"
                            >
                                <Clock className="w-4 h-4" />
                                Book a Call
                            </a>
                            <Link
                                to="/"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-white/15 hover:bg-white/5 transition-colors"
                            >
                                Back to Home
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        </div >
    );
}
