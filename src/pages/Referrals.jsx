import React from "react";
import { motion } from "framer-motion";
import { Users, Gift, ArrowRight, CheckCircle2, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function ReferralsPage() {
    return (
        <div className="min-h-screen text-white bg-gradient-to-tr from-black to-blue-900 selection:bg-cyan-500/30 relative">
            {/* Background gradients */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_30%_10%,rgba(0,215,192,0.18),transparent_60%),radial-gradient(50%_40%_at_75%_20%,rgba(0,108,255,0.15),transparent_60%)]" />

            <Navbar />

            <main className="mx-auto max-w-7xl px-8 py-16 space-y-14 relative z-10">
                {/* Hero */}
                <section className="text-center max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-cyan-300 mb-5">
                            <Users className="w-3 h-3 mr-2" />
                            Partner Program
                        </div>
                        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-6">
                            Grow with Azen
                        </h1>
                        <p className="text-lg text-white/75 leading-relaxed">
                            Love what Azen does? Introduce us to businesses that need AI automation.
                            When they become a client, we share the success with you.
                        </p>
                    </motion.div>
                </section>

                {/* How it works */}
                <section className="grid md:grid-cols-3 gap-6">
                    {[
                        {
                            icon: <Mail className="w-6 h-6" />,
                            title: "1. Make an Intro",
                            desc: "Email us connecting your contact with our team, or mention them during your onboarding."
                        },
                        {
                            icon: <CheckCircle2 className="w-6 h-6" />,
                            title: "2. We Close the Deal",
                            desc: "We'll handle the audit, strategy, and implementation. You don't need to sell anything."
                        },
                        {
                            icon: <Gift className="w-6 h-6" />,
                            title: "3. You Get Paid",
                            desc: "Once they sign up, you receive a referral fee as a thank you for the partnership."
                        }
                    ].map((step, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="rounded-2xl border border-white/10 bg-white/5 p-8 relative overflow-hidden group hover:border-white/20 transition-colors"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl font-bold leading-none select-none">
                                {i + 1}
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-cyan-400/10 flex items-center justify-center text-cyan-300 mb-6">
                                {step.icon}
                            </div>
                            <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                            <p className="text-white/70">{step.desc}</p>
                        </motion.div>
                    ))}
                </section>

                {/* CTA */}
                <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0b1836] to-black p-8 md:p-12 text-center">
                    <h2 className="text-2xl md:text-3xl font-semibold mb-4">Ready to refer someone?</h2>
                    <p className="text-white/70 max-w-2xl mx-auto mb-8">
                        Simply send an email to our partnership team with the details of the company you'd like to refer.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="mailto:partners@azen.ai?subject=New%20Referral%20Introduction"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-cyan-400 text-[#062035] font-semibold hover:bg-cyan-300 transition-colors"
                        >
                            <Mail className="w-4 h-4" />
                            Send Introduction
                        </a>
                        <Link
                            to="/"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-white/15 hover:bg-white/5 transition-colors"
                        >
                            Back to Home
                        </Link>
                    </div>
                </section>
            </main>
        </div>
    );
}
