"use client";

import { motion } from "framer-motion";
import { Zap, BarChart3, Smartphone, Shield, Globe, Clock, Lock, QrCode, Layers, Code2 } from "lucide-react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

const features = [
  { icon: Zap, title: "Sub-20ms Edge Redirects", description: "Edge-cached redirects route visitors into target native mobile apps faster than a single frame." },
  { icon: BarChart3, title: "108-Signal Telemetry", description: "Auto-detect Canvas & WebGL fingerprints, WebGPU, real WAN IP, OS versions, and storage capabilities." },
  { icon: Smartphone, title: "Native App Scheme Engine", description: "Automatically trigger native iOS Universal Links and Android Intents with 1s fallback launchers." },
  { icon: Shield, title: "25+ Bot Detection Rules", description: "Advanced heuristics distinguish real human visitors from crawlers, headless browsers, and automation bots." },
  { icon: Globe, title: "Mobile Measurement (MMP)", description: "First-launch deferred deep link resolution powered by native Swift and Kotlin MMP SDKs." },
  { icon: Clock, title: "Expiration Controls", description: "Set links to expire automatically after a specified time, click threshold, or calendar date." },
  { icon: Lock, title: "Password Security Gates", description: "Protect sensitive destination URLs with encrypted, zero-knowledge password protection gates." },
  { icon: QrCode, title: "High-Res Vector QR Codes", description: "Generate beautiful, print-ready vector QR codes for digital & print marketing campaigns." },
  { icon: Layers, title: "Drag & Drop Bulk Creation", description: "Batch generate thousands of shortlinks simultaneously via CSV file upload or REST API." },
  { icon: Code2, title: "Enterprise REST & SDKs", description: "Full-featured API with Redis Streams event bus, Webhook event subscriptions, and rate limiting." },
];

export function Features() {
  return (
    <section id="features" className="relative py-28 lg:py-36" aria-label="Enterprise Features Section">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        
        {/* Section Header */}
        <ScrollReveal className="text-center mb-20">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20 mb-4 inline-block">
            ENTERPRISE ARCHITECTURE
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white font-sans">
            Built for extreme <span className="text-gradient-emerald">speed &amp; precision</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto font-sans">
            Every feature engineered to maximize mobile app conversion rates and capture comprehensive digital telemetry.
          </p>
        </ScrollReveal>

        {/* Feature Cards Grid — Zero Glare Glow */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <ScrollReveal key={feature.title} delay={i * 0.04}>
              <div className="glass-card-linear group rounded-2xl p-7 border border-white/[0.08] hover:border-emerald-500/40 hover:bg-[#12141e]/80 transition-all duration-300 h-full flex flex-col justify-between">
                <div>
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:border-emerald-500/40 transition-colors">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold tracking-tight text-white font-sans group-hover:text-emerald-400 transition-colors">{feature.title}</h3>
                  <p className="text-xs sm:text-sm leading-relaxed text-slate-400 font-sans">{feature.description}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

      </div>
    </section>
  );
}
