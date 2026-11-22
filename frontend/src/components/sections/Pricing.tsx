"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, Zap, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

const plans = [
  {
    name: "Developer",
    priceMonthly: 0,
    priceAnnual: 0,
    priceId: "free",
    description: "Perfect for testing native deep links and small side projects.",
    features: [
      "1,000 smart redirects / mo",
      "Sub-20ms edge resolution",
      "Basic device & OS analytics",
      "Standard QR code generation",
      "Community support",
    ],
    cta: "Start Free",
    popular: false,
    badge: "Free Forever",
  },
  {
    name: "Pro Growth",
    priceMonthly: 29,
    priceAnnual: 24,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || "price_pro_monthly",
    description: "Built for scaling creators, apps, and performance marketing teams.",
    features: [
      "100,000 smart redirects / mo",
      "108-Signal telemetry collector",
      "Custom branded domains",
      "Bot detection & fraud scoring",
      "Zero-knowledge password gates",
      "Bulk CSV link generation",
      "Priority edge node routing",
    ],
    cta: "Upgrade to Pro",
    popular: true,
    badge: "Most Popular",
  },
  {
    name: "Enterprise SLA",
    priceMonthly: 299,
    priceAnnual: 249,
    priceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID || "price_enterprise_monthly",
    description: "Dedicated infrastructure, 99.999% SLA, and custom MMP integrations.",
    features: [
      "10,000,000+ redirects / mo",
      "Dedicated multi-region edge nodes",
      "99.999% uptime SLA guarantee",
      "Custom Swift & Kotlin SDK build",
      "Raw ClickHouse SQL stream access",
      "Dedicated account engineer",
      "Custom SOC2 audit compliance",
    ],
    cta: "Contact Enterprise",
    popular: false,
    badge: "Dedicated Nodes",
  },
];

export function Pricing() {
  const [annual, setAnnual] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleCheckout = async (plan: typeof plans[0]) => {
    if (plan.priceId === "free") {
      window.location.href = "/sign-up";
      return;
    }

    setLoadingPlan(plan.name);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: plan.priceId,
          plan: plan.name.toLowerCase(),
          userId: "user_demo",
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        window.location.href = "/dashboard";
      }
    } catch {
      window.location.href = "/dashboard";
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <section id="pricing" className="relative py-28 lg:py-36 font-sans" aria-label="Pricing Plans Section">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        
        {/* Section Header */}
        <ScrollReveal className="text-center mb-16">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20 mb-4 inline-block">
            TRANSPARENT PRICING
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white font-sans">
            Scale your deep links <span className="text-gradient-emerald">without limits</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto font-sans">
            Start for free with zero credit card required. Upgrade as your mobile app traffic grows.
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-[#0f1015] p-1.5 text-xs font-mono">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-2 rounded-full transition-all ${!annual ? "bg-emerald-500 text-black font-bold shadow" : "text-slate-400 hover:text-white"}`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-2 rounded-full transition-all flex items-center gap-1.5 ${annual ? "bg-emerald-500 text-black font-bold shadow" : "text-slate-400 hover:text-white"}`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] bg-emerald-400/20 text-emerald-300 px-1.5 py-0.5 rounded-full font-bold">Save 20%</span>
            </button>
          </div>
        </ScrollReveal>

        {/* Pricing Cards Grid */}
        <div className="grid gap-8 lg:grid-cols-3 items-stretch">
          {plans.map((plan, i) => {
            const price = annual ? plan.priceAnnual : plan.priceMonthly;
            const isPopular = plan.popular;

            return (
              <ScrollReveal key={plan.name} delay={i * 0.08}>
                <div
                  className={`relative rounded-3xl p-8 transition-all duration-300 flex flex-col justify-between h-full ${
                    isPopular
                      ? "bg-[#11161d] border-2 border-emerald-500/80 shadow-[0_0_50px_rgba(34,197,94,0.15)] scale-[1.02]"
                      : "glass-card-linear border border-white/[0.08] hover:border-white/20 bg-[#0d0e14]/90"
                  }`}
                >
                  {/* Badge */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                      {plan.name}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-3 py-1 rounded-full border ${
                        isPopular
                          ? "bg-emerald-500 text-black border-emerald-400 shadow-sm"
                          : "bg-white/5 text-slate-400 border-white/10"
                      }`}
                    >
                      {plan.badge}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl sm:text-5xl font-extrabold text-white font-sans">${price}</span>
                      <span className="text-sm font-mono text-slate-400">/ month</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">{plan.description}</p>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3 mb-8 pt-6 border-t border-white/[0.08]">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-3 text-xs sm:text-sm text-slate-300 font-sans">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                          <Check className="h-3 w-3" />
                        </div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleCheckout(plan)}
                    disabled={loadingPlan === plan.name}
                    className={`w-full h-12 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                      isPopular
                        ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20 active:scale-95"
                        : "bg-white/10 hover:bg-white/15 text-white border border-white/10 active:scale-95"
                    }`}
                  >
                    {loadingPlan === plan.name ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <span>{plan.cta}</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Enterprise Trust Footnote */}
        <div className="mt-16 text-center text-xs font-mono text-slate-400 flex items-center justify-center gap-6 flex-wrap">
          <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-400" /> Cancel anytime with 1-click</span>
          <span className="text-white/20">•</span>
          <span className="flex items-center gap-1.5"><Zap className="h-4 w-4 text-emerald-400" /> Sub-20ms SLA Guarantee</span>
          <span className="text-white/20">•</span>
          <span className="flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-emerald-400" /> Instant activation</span>
        </div>

      </div>
    </section>
  );
}
