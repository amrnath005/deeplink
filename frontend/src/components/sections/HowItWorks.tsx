"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link2, Cpu, ArrowRight, BarChart3 } from "lucide-react";

const steps = [
  { icon: Link2, title: "Paste Destination URL", description: "Drop in any web link — YouTube, Spotify, Telegram, or custom deep-link scheme." },
  { icon: Cpu, title: "Edge Scheme Engine", description: "Our engine detects the target platform and constructs sub-20ms iOS & Android native scheme launchers." },
  { icon: ArrowRight, title: "Sub-20ms User Routing", description: "Bypasses broken in-app webviews and launches the target native mobile app instantly." },
  { icon: BarChart3, title: "108-Signal Telemetry Logged", description: "Captures hardware capabilities, real WAN IP, OS version, and bot risk scores into ClickHouse & Supabase." },
];

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="how-it-works" className="relative py-28 lg:py-36 font-sans">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-20">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20 mb-4 inline-block">
            EDGE ROUTING WORKFLOW
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white font-sans">
            How edge deep-linking <span className="text-gradient-emerald">works</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto font-sans">Four simple steps from URL to native app. Zero integration required.</p>
        </motion.div>

        <div ref={ref} className="relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 hidden lg:block">
            <motion.div initial={{ height: 0 }} animate={isInView ? { height: "100%" } : {}} transition={{ duration: 1.5, delay: 0.3, ease: "easeInOut" }} className="w-full bg-gradient-to-b from-emerald-500/50 via-emerald-500/20 to-transparent" />
          </div>

          <div className="space-y-12 lg:space-y-20">
            {steps.map((step, i) => (
              <motion.div key={step.title} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: i * 0.15 }}
                className={`relative flex flex-col lg:flex-row items-center gap-8 lg:gap-16 ${i % 2 === 1 ? "lg:flex-row-reverse" : ""}`}>
                <div className="flex-1 text-center lg:text-left">
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-mono font-semibold text-emerald-400 mb-3 border border-emerald-500/20">
                    Step {i + 1}
                  </span>
                  <h3 className="text-xl font-bold mb-2 text-white font-sans">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto lg:mx-0 font-sans">{step.description}</p>
                </div>
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0f1015] border border-white/10 shadow-2xl">
                  <step.icon className="h-7 w-7 text-emerald-400" />
                </div>
                <div className="flex-1 hidden lg:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
