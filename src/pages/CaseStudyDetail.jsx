import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { cases } from "../data/caseStudies";
import Navbar from "../components/Navbar";
import { ArrowLeft, Clock, TrendingUp, CheckCircle2, Quote, ArrowRight } from "lucide-react";
import { motion, useInView, useSpring, useTransform } from "framer-motion";


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

function StatCard({ label, value, delay = 0 }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    // Parse numeric value if possible for counting animation
    const numericValue = parseFloat(value.replace(/[^0-9.]/g, ''));
    const isPercentage = value.includes('%');
    const prefix = value.startsWith('+') || value.startsWith('<') ? value.charAt(0) : '';
    const suffix = value.includes('/mo') ? '/mo' : (value.includes('/wk') ? '/wk' : (value.includes('h') ? 'h' : (value.includes('%') ? '%' : (value.includes('m') && !value.includes('/mo') ? 'm' : (value.includes('k') ? 'k' : '')))));

    // Spring for smooth counting
    const springValue = useSpring(0, { stiffness: 60, damping: 20, duration: 2000 });
    const displayValue = useTransform(springValue, (current) => {
        if (isNaN(numericValue)) return value; // Fallback for non-numeric
        return `${prefix}${Math.floor(current)}${suffix}`;
    });

    useEffect(() => {
        if (isInView && !isNaN(numericValue)) {
            springValue.set(numericValue);
        }
    }, [isInView, numericValue, springValue]);

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, delay }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center relative overflow-hidden group"
        >
            {/* Animated Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10">
                <div className="text-4xl font-bold text-white mb-2 flex justify-center items-center h-12">
                    {isNaN(numericValue) ? (
                        <span>{value}</span>
                    ) : (
                        <motion.span>{displayValue}</motion.span>
                    )}
                </div>
                <div className="text-sm text-white/50 uppercase tracking-wider">{label}</div>

                {/* Visual Bar Indicator */}
                <div className="mt-4 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
                        initial={{ width: 0 }}
                        animate={isInView ? { width: isPercentage ? `${Math.min(numericValue, 100)}%` : "100%" } : { width: 0 }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: delay + 0.2 }}
                    />
                </div>
            </div>
        </motion.div>
    );
}

function ReadNextCard({ caseStudy }) {
    return (
        <Link to={`/cases/${caseStudy.slug}`} className="group block h-full">
            <div className="h-full bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:border-cyan-400/50 transition-all duration-300 flex flex-col">
                <div className="h-48 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020817] to-transparent opacity-60 z-10" />
                    {caseStudy.heroImage ? (
                        <img
                            src={caseStudy.heroImage}
                            alt={caseStudy.title}
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-cyan-900/20 to-blue-900/20 flex items-center justify-center">
                            <span className="text-white/20 text-4xl font-bold">Azen</span>
                        </div>
                    )}
                    <div className="absolute top-4 left-4 z-20">
                        <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-xs border border-white/10 text-white/80">
                            {caseStudy.industry}
                        </span>
                    </div>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                        {caseStudy.title}
                    </h3>
                    <p className="text-white/60 text-sm line-clamp-2 mb-6 flex-grow">
                        {caseStudy.desc}
                    </p>

                    <div className="flex items-center text-cyan-400 text-sm font-medium mt-auto group-hover:translate-x-1 transition-transform">
                        Read Case Study <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default function CaseStudyDetail() {
    const { slug } = useParams();
    const caseStudy = cases.find(c => c.slug === slug);

    if (!caseStudy) {
        return (
            <div className="min-h-screen bg-gradient-to-tr from-black to-blue-900 bg-fixed text-white selection:bg-cyan-500/30 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">Case Study Not Found</h1>
                    <Link to="/cases" className="text-cyan-400 hover:underline">Back to Case Studies</Link>
                </div>
            </div>
        );
    }

    // Filter other cases for "Read Next" (randomize or just take next 2)
    const otherCases = cases.filter(c => c.slug !== slug).slice(0, 2);

    // Fallback for cases that haven't been updated with the new content structure yet
    const content = caseStudy.content || {
        overview: caseStudy.details,
        challenge: "Content coming soon...",
        solution: "Content coming soon...",
        implementation: [],
        results: "Content coming soon...",
        quote: null
    };

    return (
        <div className="min-h-screen text-white bg-gradient-to-tr from-black to-blue-900 bg-fixed relative overflow-hidden font-sans">
            {/* Background gradients */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_30%_10%,rgba(0,215,192,0.1),transparent_60%),radial-gradient(50%_40%_at_75%_20%,rgba(0,108,255,0.1),transparent_60%)]" />

            {/* Navigation */}
            <nav className="absolute top-0 left-0 w-full p-8 z-50">
                <Link to="/cases" className="inline-flex items-center text-white/50 hover:text-white transition-colors">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Case Studies
                </Link>
            </nav>

            <main className="relative z-10 pb-24">
                {/* Hero Section */}
                <section className="relative w-full flex flex-col items-center justify-center pt-24 pb-16 px-4">
                    <div className="relative z-10 text-center max-w-5xl mx-auto space-y-12">
                        <Reveal>
                            <div className="space-y-6">
                                <div className="text-cyan-400 font-medium tracking-wide uppercase text-sm">Case Study | Azen</div>

                                <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight max-w-4xl mx-auto">
                                    {caseStudy.desc}
                                </h1>
                            </div>
                        </Reveal>

                        {/* Banner Image */}
                        {caseStudy.heroImage && (
                            <Reveal delay={0.1}>
                                <div className="w-full max-w-3xl mx-auto rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                                    <img
                                        src={caseStudy.heroImage}
                                        alt="Case Study Banner"
                                        className="w-full h-auto object-cover"
                                    />
                                </div>
                            </Reveal>
                        )}

                        <Reveal delay={0.2}>
                            <div className="text-white/50 text-sm">
                                By Azen Team
                            </div>
                        </Reveal>
                    </div>
                </section>

                {/* Content Section */}
                <section className="max-w-4xl mx-auto px-8 space-y-20">

                    {/* Overview */}
                    <Reveal>
                        <div className="space-y-6">
                            <h2 className="text-2xl font-semibold text-white">Overview</h2>
                            <p className="text-lg text-white/70 leading-relaxed">
                                {content.overview}
                            </p>
                        </div>
                    </Reveal>

                    {/* Stats Grid - Now Animated */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {caseStudy.stats.map((s, i) => (
                            <StatCard key={i} label={s.label} value={s.value} delay={i * 0.1} />
                        ))}
                    </div>

                    {/* Challenge & Solution */}
                    <div className="grid md:grid-cols-2 gap-12">
                        <Reveal>
                            <div className="space-y-6">
                                <h2 className="text-2xl font-semibold text-white">The Challenge</h2>
                                <p className="text-white/70 leading-relaxed">
                                    {content.challenge}
                                </p>
                            </div>
                        </Reveal>
                        <Reveal delay={0.1}>
                            <div className="space-y-6">
                                <h2 className="text-2xl font-semibold text-white">The Solution</h2>
                                <p className="text-white/70 leading-relaxed">
                                    {content.solution}
                                </p>
                            </div>
                        </Reveal>
                    </div>

                    {/* Implementation Steps */}
                    {content.implementation && content.implementation.length > 0 && (
                        <Reveal>
                            <div className="space-y-8">
                                <h2 className="text-2xl font-semibold text-white">Key Implementation Steps</h2>
                                <div className="grid gap-6">
                                    {content.implementation.map((step, i) => (
                                        <div key={i} className="flex gap-4 p-6 rounded-2xl bg-white/5 border border-white/10">
                                            <div className="shrink-0 mt-1">
                                                <CheckCircle2 className="w-6 h-6 text-cyan-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                                                <p className="text-white/70">{step.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Reveal>
                    )}

                    {/* Results & Quote */}
                    <Reveal>
                        <div className="space-y-12">
                            <div className="space-y-6">
                                <h2 className="text-2xl font-semibold text-white">Transformational Results</h2>
                                <p className="text-lg text-white/70 leading-relaxed">
                                    {content.results}
                                </p>
                            </div>

                            {content.quote && (
                                <div className="relative p-10 rounded-3xl bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-white/10">
                                    <Quote className="absolute top-8 left-8 w-8 h-8 text-cyan-400/30" />
                                    <blockquote className="relative z-10 text-center space-y-6">
                                        <p className="text-2xl font-medium text-white leading-relaxed">
                                            "{content.quote.text}"
                                        </p>
                                        <footer className="text-cyan-400 font-semibold tracking-wide">
                                            — {content.quote.author}
                                        </footer>
                                    </blockquote>
                                </div>
                            )}
                        </div>
                    </Reveal>

                </section>

                {/* Read Next Section */}
                {otherCases.length > 0 && (
                    <section className="max-w-6xl mx-auto px-8 mt-24">
                        <Reveal>
                            <div className="flex items-center justify-between mb-10">
                                <h2 className="text-2xl font-semibold text-white">Read Next</h2>
                                <Link to="/cases" className="text-white/50 hover:text-white text-sm flex items-center transition-colors">
                                    View all <ArrowRight className="w-4 h-4 ml-1" />
                                </Link>
                            </div>
                        </Reveal>

                        <div className="grid md:grid-cols-2 gap-8">
                            {otherCases.map((c, i) => (
                                <Reveal key={c.slug} delay={i * 0.1}>
                                    <ReadNextCard caseStudy={c} />
                                </Reveal>
                            ))}
                        </div>
                    </section>
                )}

                {/* CTA */}
                <section className="mt-24 mx-auto max-w-5xl px-8">
                    <Reveal>
                        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0b1836] to-black p-12 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />

                            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to achieve similar results?</h2>
                            <p className="text-white/70 max-w-2xl mx-auto mb-10 text-lg">
                                Join {caseStudy.title} and other forward-thinking businesses scaling with Azen.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <a
                                    href="https://calendly.com/tayyib-azen/30min" target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-cyan-400 text-[#062035] font-bold hover:bg-cyan-300 transition-colors shadow-lg shadow-cyan-900/20"
                                >
                                    <Clock className="w-5 h-5" />
                                    Book a Call
                                </a>
                            </div>
                        </div>
                    </Reveal>
                </section>
            </main>
        </div>
    );
}
