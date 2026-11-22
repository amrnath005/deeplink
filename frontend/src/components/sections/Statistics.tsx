"use client";

import { motion } from "framer-motion";
import { AnimatedCounter } from "@/components/animations/AnimatedCounter";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

const metrics = [
  { value: 100, suffix: "K+", label: "Sub-20ms redirects / min" },
  { value: 14, suffix: "ms", label: "Average edge latency" },
  { value: 108, suffix: " Signals", label: "Hardware & telemetry signals auto-captured" },
  { value: 99.999, suffix: "%", label: "Global uptime SLA", decimals: 3 },
];

export function Statistics() {
  return (
    <section className="relative py-28 border-y border-white/[0.08] bg-[#090a0f]/60 font-sans" aria-label="Key Performance Statistics Section">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 text-center">
          {metrics.map((metric, i) => (
            <ScrollReveal key={metric.label} delay={i * 0.08}>
              <motion.div whileHover={{ scale: 1.02 }} className="p-4">
                <div className="text-4xl lg:text-5xl font-extrabold text-gradient-emerald font-mono mb-2">
                  <AnimatedCounter value={metric.value} suffix={metric.suffix} decimals={metric.decimals || 0} duration={2.0} />
                </div>
                <p className="text-xs sm:text-sm text-slate-400 font-sans leading-normal">{metric.label}</p>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
