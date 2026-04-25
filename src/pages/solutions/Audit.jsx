// src/pages/AuditPage.jsx
import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, FileText, ChartBar, Rocket, TrendingUp, Timer, Workflow, CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";

export default function AuditPage() {
  const deliverables = [
    "Current process + tooling map",
    "Data & policy review",
    "Top 10 automation opportunities",
    "90-day roadmap with owners",
    "Agent scripts & guardrails draft",
    "Metrics & monitoring plan",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-tr from-black to-blue-900 bg-fixed text-white selection:bg-cyan-500/30 font-sans">
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
              <ShieldCheck className="w-3 h-3 mr-2" />
              AI Business Audit
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-6">
              Find your highest ROI automations
            </h1>
            <p className="text-lg text-white/75 leading-relaxed">
              A fast, structured assessment to map your processes, identify bottlenecks, and create a safe rollout plan for AI.
            </p>
          </motion.div>
        </section>

        {/* Deliverables */}
        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 md:p-10">
          <h2 className="text-2xl font-semibold mb-6">What you get</h2>
          <ul className="grid md:grid-cols-2 gap-4">
            {deliverables.map((d, i) => (
              <motion.li
                key={d}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5"
              >
                <div className="w-8 h-8 rounded-lg bg-cyan-400/10 flex items-center justify-center text-cyan-300 flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-white/80">{d}</span>
              </motion.li>
            ))}
          </ul>
        </section>

        {/* Timeline */}
        <section className="grid md:grid-cols-3 gap-6">
          {[
            { t: "Week 1", d: "Discovery, data & policy intake, goals" },
            { t: "Week 2", d: "Workflow mapping, opportunity sizing" },
            { t: "Week 3", d: "Roadmap, guardrails, enablement plan" },
          ].map((s, i) => (
            <motion.div
              key={s.t}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-8 relative overflow-hidden group hover:border-white/20 transition-colors"
            >
              <div className="text-sm font-medium text-cyan-300 mb-2">{s.t}</div>
              <div className="text-lg font-semibold text-white/90">{s.d}</div>
            </motion.div>
          ))}
        </section>

        {/* Sample Audit Preview */}
        <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <div className="flex items-center gap-3 text-white/85 mb-6">
            <FileText className="text-cyan-300" /> <span className="font-semibold text-lg">Sample audit preview</span>
          </div>

          {/* Executive summary */}
          <div className="grid lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-[#0b1836] p-6">
              <h3 className="font-semibold text-cyan-100 mb-3">Executive summary</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                Your contact volume peaks 9–11am and 4–6pm, creating backlogs (avg. <span className="text-white/85 font-medium">14h</span> first response on email).
                We recommend launching an AI Receptionist for first-line handling of booking, triage and FAQs, plus targeted automations for reminders and CRM updates.
                This combination is projected to reduce missed calls by <span className="text-white/85 font-medium">70%+</span> within 30 days.
              </p>
            </div>

            {/* KPI cards */}
            <div className="grid sm:grid-cols-3 lg:grid-cols-1 gap-4">
              {[
                { k: "Missed Calls ↓", v: "–72%", icon: <TrendingUp className="w-4 h-4" /> },
                { k: "FRT (email) ↓", v: "–85%", icon: <Timer className="w-4 h-4" /> },
                { k: "CSAT ↑", v: "4.8/5", icon: <ChartBar className="w-4 h-4" /> },
              ].map((m) => (
                <div key={m.k} className="rounded-2xl border border-white/10 bg-[#0b1836] p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white/70 text-sm">{m.icon} {m.k}</div>
                  <div className="text-lg font-semibold">{m.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Opportunity table + Chart */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Table */}
            <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-[#0b1836] p-6">
              <div className="flex items-center gap-2 text-white/80 font-medium mb-4">
                <Workflow className="w-4 h-4 text-cyan-300" /> Top opportunities
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-white/60">
                    <tr>
                      <th className="py-2 pr-3 font-medium">Use case</th>
                      <th className="py-2 pr-3 font-medium">Current pain</th>
                      <th className="py-2 pr-3 font-medium">Recommendation</th>
                      <th className="py-2 font-medium">ROI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {[
                      { u: "Inbound calls", p: "Missed calls", r: "AI Receptionist", roi: "High" },
                      { u: "No-shows", p: "25% missed", r: "SMS reminders", roi: "High" },
                      { u: "CRM hygiene", p: "Notes missing", r: "Auto-sync", roi: "Medium" },
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 pr-3">{row.u}</td>
                        <td className="py-3 pr-3 text-white/70">{row.p}</td>
                        <td className="py-3 pr-3">{row.r}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-lg text-xs ${row.roi === "High" ? "bg-emerald-400/20 text-emerald-300" : "bg-cyan-400/20 text-cyan-300"}`}>
                            {row.roi}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Chart */}
            <div className="rounded-2xl border border-white/10 bg-[#0b1836] p-6 flex flex-col">
              <div className="text-white/80 font-medium flex items-center gap-2 mb-auto">
                <ChartBar className="w-4 h-4 text-cyan-300" /> Capacity gain
              </div>
              <div className="mt-4 h-32 rounded-lg bg-white/5 flex items-end gap-2 p-3">
                {[40, 55, 68, 72, 80].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t bg-gradient-to-t from-cyan-400/35 to-emerald-400/60"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <p className="text-xs text-white/60 mt-3 text-center">Weeks after launch →</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0b1836] to-black p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">Ready to uncover hidden ROI?</h2>
          <p className="text-white/70 max-w-2xl mx-auto mb-8">
            Get a clear, data-driven roadmap for your AI adoption.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://calendly.com/tayyib-azen/30min" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-cyan-400 text-[#062035] font-semibold hover:bg-cyan-300 transition-colors"
            >
              <Rocket className="w-4 h-4" />
              Book Your Audit
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