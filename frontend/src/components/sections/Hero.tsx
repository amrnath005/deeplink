"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck, Cpu, Globe, Lock } from "lucide-react";
import { YouTubeLogo, SpotifyLogo, TelegramLogo } from "@/components/icons/BrandLogos";
import { HeroCodeInspector } from "@/components/sections/HeroCodeInspector";

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden font-sans">
      
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 text-center flex flex-col items-center">
        
        {/* Badge */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-mono text-emerald-400 mb-8">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Sub-20ms Edge Engine • 108 Telemetry Signals</span>
        </motion.div>

        {/* Headline */}
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto max-w-4xl text-5xl sm:text-7xl font-extrabold tracking-tight leading-[1.08] text-white font-sans">
          Teleport users straight into <span className="text-gradient-emerald">native mobile apps</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-slate-300 leading-relaxed font-normal font-sans">
          Route visitors straight into YouTube, Spotify, Instagram, and Telegram. Bypass broken in-app webviews with auto-telemetry and sub-20ms edge latency.
        </motion.p>

        {/* Enterprise Trust Badges */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Zero-Cookie Telemetry</span>
          <span className="text-white/20">•</span>
          <span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-emerald-400" /> GDPR &amp; CCPA Compliant</span>
          <span className="text-white/20">•</span>
          <span className="flex items-center gap-1.5"><Cpu className="h-3.5 w-3.5 text-emerald-400" /> Redis &amp; PostgreSQL Sync</span>
          <span className="text-white/20">•</span>
          <span className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5 text-emerald-400" /> Sub-20ms Global Routing</span>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4 z-20">
          <button onClick={() => document.getElementById("generate")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-emerald-500 px-6 text-sm font-bold text-black transition-all hover:bg-emerald-400 active:scale-95 shadow-md">
            <span>Create Smart Link</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <button onClick={() => window.location.href = "/dashboard"}
            className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-6 text-sm font-medium text-white transition-all hover:bg-white/[0.08] active:scale-95">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span>View 108 Telemetry Radar</span>
          </button>
        </motion.div>

        {/* Static Linear-Style macOS App UI Preview Window */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 w-full max-w-5xl rounded-2xl border border-white/10 bg-[#0f1015]/80 p-4 sm:p-6 shadow-2xl backdrop-blur-2xl text-left">
          
          {/* macOS Title Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
              <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
              <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
            </div>
            <span className="text-xs font-mono text-slate-400">DeepLink Pro — Native App Scheme Engine</span>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
              Official Scheme Resolution
            </span>
          </div>

          {/* Static App Window Cards with Official SVG Logos */}
          <div className="grid md:grid-cols-3 gap-4">
            
            {/* Official YouTube App Card */}
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 hover:border-red-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 border border-white/10 shadow">
                  <YouTubeLogo className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">YouTube App</h4>
                  <span className="text-[10px] font-mono text-red-400">vnd.youtube://</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400">Bypasses embedded webview and launches native YouTube player.</p>
            </div>

            {/* Official Spotify App Card */}
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 hover:border-emerald-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 border border-white/10 shadow">
                  <SpotifyLogo className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Spotify App</h4>
                  <span className="text-[10px] font-mono text-emerald-400">spotify:track:...</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400">Direct track, album, and playlist player auto-launch on iOS &amp; Android.</p>
            </div>

            {/* Official Telegram App Card */}
            <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4 hover:border-sky-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 border border-white/10 shadow">
                  <TelegramLogo className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Telegram App</h4>
                  <span className="text-[10px] font-mono text-sky-400">tg://resolve?domain=</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400">Instant channel join flow opening Telegram messenger directly.</p>
            </div>

          </div>

          <div className="mt-4 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> 108 Telemetry Signals Auto-Captured
            </span>
            <span className="text-emerald-400">Sub-20ms Edge Resolution</span>
          </div>

        </motion.div>

        {/* Vercel / GitHub / n8n Enterprise Code & Pipeline Inspector */}
        <HeroCodeInspector />

      </div>
    </section>
  );
}
