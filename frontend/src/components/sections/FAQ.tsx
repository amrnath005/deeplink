"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

const faqs = [
  { question: "Do I need to create an account to test?", answer: "No. DeepLink Pro requires zero authentication for link generation and telemetry testing. Paste a URL, generate a smart link, and inspect live click streams immediately." },
  { question: "How fast are edge redirects?", answer: "Our edge-cached infrastructure delivers sub-20ms redirects globally with native iOS Universal Links and Android Intent URLs." },
  { question: "What native mobile app schemes are supported?", answer: "We support 16+ platforms out of the box including YouTube, Instagram, Spotify, Telegram, WhatsApp, LinkedIn, X (Twitter), Discord, Google Maps, Apple Maps, Play Store, and custom URI schemes." },
  { question: "Is bot detection & fraud scoring included?", answer: "Yes. Advanced heuristics distinguish human visitors from Googlebot, Meta crawlers, Slack unfurls, Headless Chrome, Selenium, TOR exit nodes, and proxy servers." },
  { question: "What digital telemetry signals are auto-detected?", answer: "Over 108 signals including real WAN IP, country/city node, timezone, multi-language list, OS version, browser version, Canvas 64-bit fingerprint, WebGL unmasked GPU, WebGPU, and storage flags." },
  { question: "Are native mobile SDKs available for deferred deep linking?", answer: "Yes. Native iOS Swift (`DeepLinkSDK.swift`) and Android Kotlin (`DeepLinkSDK.kt`) SDKs are available in our documentation at `/docs/sdks` for first-launch deferred deep link resolution." },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((f) => ({
      "@type": "Question",
      "name": f.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.answer,
      },
    })),
  };

  return (
    <section id="faq" className="relative py-28 lg:py-36 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <ScrollReveal className="text-center mb-16">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20 mb-4 inline-block">
            FREQUENTLY ASKED QUESTIONS
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white font-sans">
            Everything you need to <span className="text-gradient-emerald">know</span>
          </h2>
        </ScrollReveal>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <ScrollReveal key={i} delay={i * 0.05}>
              <div className="glass-card-linear rounded-2xl border border-white/[0.08] overflow-hidden">
                <button onClick={() => setOpenIndex(openIndex === i ? null : i)} className="flex w-full items-center justify-between p-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
                  <span className="font-semibold text-white text-base pr-4 font-sans">{faq.question}</span>
                  <motion.div animate={{ rotate: openIndex === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="h-5 w-5 text-slate-400 flex-shrink-0" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openIndex === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                      <p className="px-6 pb-6 text-sm text-slate-400 leading-relaxed font-sans">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
