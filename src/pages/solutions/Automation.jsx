import React from "react";
import { motion } from "framer-motion";
import { Workflow, ArrowRight, Zap, CheckSquare, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";

export default function Automation() {
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
              <Workflow className="w-3 h-3 mr-2" />
              Task Automation
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-6">
              Put your busywork on autopilot
            </h1>
            <p className="text-lg text-white/75 leading-relaxed">
              Automate tickets, approvals, data entry, and hand-offs with a visual workflow builder.
              Free your team to focus on high-impact work.
            </p>
          </motion.div>
        </section>

        {/* Features */}
        <section className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: <Zap className="w-6 h-6" />,
              title: "Instant Triggers",
              desc: "Start workflows from emails, forms, webhooks, or schedule them to run automatically."
            },
            {
              icon: <CheckSquare className="w-6 h-6" />,
              title: "Human-in-the-loop",
              desc: "Pause for approval or input when needed, then continue processing automatically."
            },
            {
              icon: <Clock className="w-6 h-6" />,
              title: "Audit Trails",
              desc: "Full visibility into every step executed, with detailed logs for compliance and debugging."
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-8 relative overflow-hidden group hover:border-white/20 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-cyan-400/10 flex items-center justify-center text-cyan-300 mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-white/70">{feature.desc}</p>
            </motion.div>
          ))}
        </section>

        {/* CTA */}
        <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0b1836] to-black p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">Start automating today</h2>
          <p className="text-white/70 max-w-2xl mx-auto mb-8">
            See how much time you can save. Let's map out your first workflow together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://calendly.com/tayyib-azen/30min" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-cyan-400 text-[#062035] font-semibold hover:bg-cyan-300 transition-colors"
            >
              <Workflow className="w-4 h-4" />
              Book Strategy Call
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
