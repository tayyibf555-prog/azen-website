import React from "react";
import { motion } from "framer-motion";
import { PhoneCall, CalendarCheck, Route, ShieldCheck, ArrowRight, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";

export default function ReceptionistPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-blue-900 text-white selection:bg-cyan-500/30 font-sans">
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
              <PhoneCall className="w-3 h-3 mr-2" />
              AI Receptionist
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-6">
              Never miss a call again
            </h1>
            <p className="text-lg text-white/75 leading-relaxed">
              Answer calls, qualify leads, route to the right person, and book appointments 24/7 — all in your brand's natural voice.
            </p>
          </motion.div>
        </section>

        {/* Feature trio */}
        <section className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: <PhoneCall className="w-6 h-6" />,
              t: "Answers & Qualifies",
              d: "Natural voice conversations in 20+ languages with strict policy guardrails."
            },
            {
              icon: <Route className="w-6 h-6" />,
              t: "Routes & Escalates",
              d: "Smart rules to route complex queries to humans or specific departments instantly."
            },
            {
              icon: <CalendarCheck className="w-6 h-6" />,
              t: "Books & Reminds",
              d: "Real-time calendar integration to book meetings and send SMS/email reminders."
            },
          ].map((f, i) => (
            <motion.div
              key={f.t}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-8 relative overflow-hidden group hover:border-white/20 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-cyan-400/10 flex items-center justify-center text-cyan-300 mb-6">
                {f.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{f.t}</h3>
              <p className="text-white/70">{f.d}</p>
            </motion.div>
          ))}
        </section>

        {/* Mini call flow demo */}
        <section className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
            <p className="text-white/80 font-medium mb-6">What a call looks like</p>
            <div className="space-y-6">
              {/* Incoming */}
              <div className="relative rounded-xl border border-white/10 bg-[#131a2f]/80 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <PhoneCall className="w-5 h-5 text-white/60" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-white/60">Incoming Call</div>
                    <div className="font-semibold">Customer</div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
                      <PhoneCall className="w-5 h-5 text-red-400 rotate-[135deg]" />
                    </div>
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                      <PhoneCall className="w-5 h-5 text-emerald-400" />
                    </div>
                  </div>
                </div>
              </div>
              {/* Answered */}
              <div className="relative rounded-xl border border-white/10 bg-[#131a2f]/80 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-400/20 flex items-center justify-center text-cyan-300 font-semibold">
                    A
                  </div>
                  <div className="text-white/85">
                    <span className="text-white/70">Answered by </span>
                    <span className="text-cyan-300 font-semibold">Ava</span>
                  </div>
                  <div className="ml-auto flex items-end gap-1 h-6">
                    {[...Array(4)].map((_, i) => (
                      <motion.span
                        key={i}
                        className="w-1 rounded bg-cyan-300/90"
                        initial={{ height: 6 }}
                        animate={{ height: [6, 16, 10, 18][i % 4] }}
                        transition={{ repeat: Infinity, repeatType: "reverse", duration: 0.6 + i * 0.1 }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Proof strip */}
          <div className="grid gap-4">
            {[
              { k: "Missed calls", v: "–72%" },
              { k: "First response time", v: "–85%" },
              { k: "CSAT", v: "4.8/5" },
            ].map((m, i) => (
              <motion.div
                key={m.k}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 flex items-center justify-between"
              >
                <div className="text-white/60">{m.k}</div>
                <div className="text-2xl font-semibold text-white">{m.v}</div>
              </motion.div>
            ))}
            <div className="flex gap-2 mt-2 px-2">
              <ShieldCheck className="text-cyan-300 w-5 h-5" />
              <span className="text-white/70 text-sm">Guardrails, audit logs, human-in-the-loop when needed.</span>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0b1836] to-black p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">Ready to automate your calls?</h2>
          <p className="text-white/70 max-w-2xl mx-auto mb-8">
            Book a demo to hear our receptionists in action and see how they fit your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://calendly.com/tayyib-azen/30min" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-cyan-400 text-[#062035] font-semibold hover:bg-cyan-300 transition-colors"
            >
              <CalendarCheck className="w-4 h-4" />
              Book a Call
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