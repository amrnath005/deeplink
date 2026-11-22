"use client";

import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

const testimonials = [
  { name: "Sarah Chen", role: "Head of Growth", company: "Linear", quote: "DeepLink Pro cut our app install attribution latency by 80%. The analytics granularity is unmatched." },
  { name: "Marcus Johnson", role: "Engineering Lead", company: "Vercel", quote: "We replaced three tools with DeepLink Pro. The sub-20ms redirects and built-in bot detection are game changers." },
  { name: "Elena Rodriguez", role: "Product Manager", company: "Stripe", quote: "Zero auth, immediate value. Our marketing team creates smart links without engineering support." },
];

export function Testimonials() {
  return (
    <section className="relative py-32 lg:py-40">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <ScrollReveal className="text-center mb-20">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Trusted by <span className="text-gradient-accent">fast teams</span></h2>
        </ScrollReveal>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <ScrollReveal key={t.name} delay={i * 0.1}>
              <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="rounded-2xl border border-border bg-surface/50 p-8 backdrop-blur-sm">
                <div className="mb-6">
                  {[...Array(5)].map((_, i) => <span key={i} className="text-accent text-sm">★</span>)}
                </div>
                <p className="text-foreground leading-relaxed mb-8">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center text-sm font-bold text-accent">{t.name[0]}</div>
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role} at {t.company}</p>
                  </div>
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
