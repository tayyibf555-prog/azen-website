import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, ArrowRight } from "lucide-react";

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <header className="relative z-40">
            <div className="mx-auto max-w-7xl px-4 md:px-8 pt-5">
                <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5/80 backdrop-blur-xl px-4 md:px-6 py-3">
                    {/* logo + tagline */}
                    <div className="flex items-center gap-3">
                        <Link to="/" className="font-semibold tracking-tight text-2xl text-white">azen</Link>
                        <span className="hidden sm:inline-block text-xs text-cyan-200/85 border-l border-white/15 pl-3">
                            The Future Made Simple.
                        </span>
                    </div>

                    {/* desktop nav */}
                    <nav className="hidden lg:flex items-center gap-8 text-sm text-white/80">
                        <a href="/#how" className="hover:text-white">
                            How it Works
                        </a>
                        <a href="/#solutions" className="hover:text-white">
                            Solutions
                        </a>
                        <a href="/#resources" className="hover:text-white">
                            Resources
                        </a>
                        <Link to="/cases" className="hover:text-white">
                            Case Studies
                        </Link>
                        <a href="https://calendly.com/tayyib-azen/30min" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                            Book a Call
                        </a>
                        <Link to="/referrals" className="hover:text-white">
                            Referrals
                        </Link>
                        <a href="/#faq" className="hover:text-white">
                            FAQ
                        </a>
                        <a href="/#contact" className="hover:text-white">
                            Contact
                        </a>
                        <a
                            href="https://calendly.com/tayyib-azen/30min"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium text-cyan-100 group"
                        >
                            <span className="absolute inset-0 rounded-full border border-cyan-300/40 group-hover:border-cyan-300 transition-colors" />
                            <span className="relative flex items-center gap-2">
                                Book a Call
                                <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                        </a>
                    </nav>

                    {/* mobile menu button */}
                    <button
                        className="lg:hidden inline-flex items-center justify-center rounded-full border border-white/15 p-2 text-white"
                        onClick={() => setMobileOpen((v) => !v)}
                        aria-label="Toggle navigation"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                </div>

                {/* mobile menu */}
                <AnimatePresence>
                    {mobileOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="mt-3 lg:hidden rounded-2xl border border-white/10 bg-[#02091f]/95 backdrop-blur-xl p-4 space-y-2 text-sm z-50 relative"
                        >
                            {[
                                ["How it Works", "/#how"],
                                ["Solutions", "/#solutions"],
                                ["Resources", "/#resources"],
                            ].map(([label, href]) => (
                                <a
                                    key={href}
                                    href={href}
                                    onClick={() => setMobileOpen(false)}
                                    className="block py-1 text-white/80"
                                >
                                    {label}
                                </a>
                            ))}
                            <Link
                                to="/cases"
                                onClick={() => setMobileOpen(false)}
                                className="block py-1 text-white/80"
                            >
                                Case Studies
                            </Link>
                            {[
                                ["Book a Call", "https://calendly.com/tayyib-azen/30min"],
                                ["Referrals", "/referrals"],
                                ["FAQ", "/#faq"],
                                ["Contact", "/#contact"],
                            ].map(([label, href]) =>
                                href.startsWith("/#") || href.startsWith("http") ? (
                                    <a
                                        key={href}
                                        href={href}
                                        target={href.startsWith("http") ? "_blank" : undefined}
                                        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                                        onClick={() => setMobileOpen(false)}
                                        className="block py-1 text-white/80"
                                    >
                                        {label}
                                    </a>
                                ) : (
                                    <Link
                                        key={href}
                                        to={href}
                                        onClick={() => setMobileOpen(false)}
                                        className="block py-1 text-white/80"
                                    >
                                        {label}
                                    </Link>
                                )
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </header>
    );
}
