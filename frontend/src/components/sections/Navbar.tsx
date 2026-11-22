"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Link2, Menu, X, ArrowRight, ChevronDown, Zap, ShieldCheck, BarChart3, Code2, Layers, Search, Sparkles
} from "lucide-react";
import { EnginePlaygroundModal } from "@/components/modals/EnginePlaygroundModal";

const productMegaMenu = [
  {
    icon: Zap,
    title: "Sub-20ms Edge Redirects",
    desc: "Global edge resolution into native mobile app schemes.",
    href: "#features",
  },
  {
    icon: Sparkles,
    title: "108-Signal Telemetry Radar",
    desc: "Zero-cookie hardware, GPU, and network entropy inspection.",
    href: "#dashboard",
  },
  {
    icon: Layers,
    title: "App Scheme Registry",
    desc: "Support for YouTube, Spotify, Telegram, Instagram & custom URIs.",
    href: "#apps",
  },
  {
    icon: Code2,
    title: "Mobile SDKs & REST API",
    desc: "Swift, Kotlin, cURL, and Python integrations.",
    href: "/docs/sdks",
  },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [playgroundOpen, setPlaygroundOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToGenerate = () => {
    document.getElementById("generate")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }} animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "py-3 bg-[#08090a]/85 backdrop-blur-2xl border-b border-white/[0.08]" : "py-5 bg-transparent"}`}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex items-center justify-between">
            
            {/* Logo + Status Indicator */}
            <div className="flex items-center gap-4">
              <a href="/" className="flex items-center gap-2.5 group">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Link2 className="h-4 w-4" />
                </div>
                <span className="text-base font-bold tracking-tight text-white font-sans">
                  DeepLink<span className="text-emerald-400">.pro</span>
                </span>
              </a>

              <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-emerald-400/90 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Operational (14ms Edge)</span>
              </div>
            </div>

            {/* Nav Links Pill with Mega Menu Dropdown */}
            <div className="hidden md:flex items-center gap-1 rounded-full border border-white/[0.08] bg-[#0f1015]/80 px-4 py-1.5 backdrop-blur-2xl relative font-sans text-xs">
              
              {/* Product Mega Menu Trigger */}
              <div
                className="relative"
                onMouseEnter={() => setMegaOpen(true)}
                onMouseLeave={() => setMegaOpen(false)}
              >
                <button className="flex items-center gap-1 px-3.5 py-1.5 text-slate-300 hover:text-white transition-colors font-medium">
                  <span>Product</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${megaOpen ? "rotate-180 text-emerald-400" : ""}`} />
                </button>

                {/* Dropdown Card */}
                <AnimatePresence>
                  {megaOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 w-80 rounded-2xl border border-white/10 bg-[#0c0d12] p-3 shadow-2xl backdrop-blur-2xl font-sans"
                    >
                      <div className="space-y-1">
                        {productMegaMenu.map((item) => {
                          const Icon = item.icon;
                          return (
                            <a
                              key={item.title}
                              href={item.href}
                              className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors group"
                            >
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:border-emerald-500/40 shrink-0">
                                <Icon className="h-4 w-4" />
                              </div>
                              <div>
                                <div className="font-bold text-white group-hover:text-emerald-400 transition-colors text-xs">
                                  {item.title}
                                </div>
                                <div className="text-[11px] text-slate-400 leading-tight mt-0.5 font-sans">
                                  {item.desc}
                                </div>
                              </div>
                            </a>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={() => setPlaygroundOpen(true)}
                className="px-3.5 py-1.5 font-medium text-emerald-400 hover:text-white transition-colors flex items-center gap-1"
              >
                <span>Engine Playground</span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-mono px-1.5 py-0.5 rounded-full font-bold">LIVE DEMO</span>
              </button>

              <a href="#pricing" className="px-3.5 py-1.5 font-medium text-slate-300 hover:text-white transition-colors">
                Pricing
              </a>

              <a href="/dashboard" className="px-3.5 py-1.5 font-medium text-slate-300 hover:text-white transition-colors">
                Dashboard
              </a>

              <a href="/docs/sdks" className="px-3.5 py-1.5 font-medium text-slate-300 hover:text-white transition-colors font-mono">
                SDKs
              </a>
            </div>

            {/* Action CTAs */}
            <div className="hidden md:flex items-center gap-3">
              <a
                href="/app"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold hover:bg-emerald-500 hover:text-black transition-all"
              >
                <span>⚡ Mobile App (No Login)</span>
              </a>
              <a href="/dashboard" className="text-xs font-mono text-slate-300 hover:text-white transition-colors">
                Dashboard
              </a>
              <button onClick={scrollToGenerate}
                aria-label="Create smart link button"
                className="inline-flex h-9 items-center gap-2 rounded-xl bg-emerald-500 px-4 text-xs font-bold text-black transition-all hover:bg-emerald-400 active:scale-95 shadow-md">
                <span>Create Link</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <button className="md:hidden p-2 text-slate-400 hover:text-white" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle navigation menu">
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-16 z-40 bg-[#08090a] border-b border-white/10 md:hidden font-sans">
            <div className="flex flex-col gap-1.5 p-6">
              <a
                href="/app"
                className="px-4 py-3 text-sm text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between hover:bg-emerald-500/20 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                <span>⚡ Open Mobile App (No Login)</span>
                <span>→</span>
              </a>
              <a href="#features" className="px-4 py-3 text-sm text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-colors" onClick={() => setMobileOpen(false)}>Features</a>
              <button onClick={() => { setMobileOpen(false); setPlaygroundOpen(true); }} className="px-4 py-3 text-sm text-emerald-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors font-bold text-left">
                Engine Playground ⚡ (Live Demo)
              </button>
              <a href="#pricing" className="px-4 py-3 text-sm text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-colors" onClick={() => setMobileOpen(false)}>Pricing</a>
              <a href="/dashboard" className="px-4 py-3 text-sm text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-colors" onClick={() => setMobileOpen(false)}>Dashboard</a>
              <a href="/docs/sdks" className="px-4 py-3 text-sm text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-colors" onClick={() => setMobileOpen(false)}>SDK Docs</a>
              <a href="/sign-in" className="px-4 py-3 text-sm text-emerald-400 hover:text-white font-mono rounded-lg hover:bg-white/5 transition-colors" onClick={() => setMobileOpen(false)}>
                Sign In →
              </a>
              <button onClick={() => { setMobileOpen(false); scrollToGenerate(); }} className="mt-2 h-11 rounded-xl bg-emerald-500 text-black font-semibold text-sm">Create Link</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Engine Playground Modal */}
      <EnginePlaygroundModal isOpen={playgroundOpen} onClose={() => setPlaygroundOpen(false)} />
    </>
  );
}
