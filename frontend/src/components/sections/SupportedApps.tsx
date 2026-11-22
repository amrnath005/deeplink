"use client";

import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { YouTubeLogo, SpotifyLogo, TelegramLogo, InstagramLogo, WhatsAppLogo, XLogo } from "@/components/icons/BrandLogos";

const apps = [
  { name: "YouTube", icon: YouTubeLogo, scheme: "vnd.youtube://" },
  { name: "Spotify", icon: SpotifyLogo, scheme: "spotify://" },
  { name: "Telegram", icon: TelegramLogo, scheme: "tg://" },
  { name: "Instagram", icon: InstagramLogo, scheme: "instagram://" },
  { name: "WhatsApp", icon: WhatsAppLogo, scheme: "whatsapp://" },
  { name: "X (Twitter)", icon: XLogo, scheme: "twitter://" },
];

export function SupportedApps() {
  const appList = [...apps, ...apps, ...apps, ...apps];
  return (
    <section id="apps" className="relative py-28 lg:py-36 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 mb-16">
        <ScrollReveal className="text-center">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20 mb-4 inline-block">
            NATIVE URI SCHEME REGISTRY
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white font-sans">
            Official deep-links into <span className="text-gradient-emerald">16+ native apps</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto font-sans">
            Sub-20ms URI scheme resolution bypasses in-app webview login barriers automatically.
          </p>
        </ScrollReveal>
      </div>

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#08090a] to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#08090a] to-transparent z-20 pointer-events-none" />
        
        <motion.div animate={{ x: [0, -1800] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="flex gap-6 w-max">
          {appList.map((app, i) => {
            const Icon = app.icon;
            return (
              <div key={`${app.name}-${i}`} className="glass-card-linear flex items-center gap-4 rounded-2xl px-6 py-4 border border-white/[0.08]">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-white/10 border border-white/10 shadow">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-sm font-bold block text-white font-sans">{app.name}</span>
                  <span className="text-[10px] font-mono text-emerald-400 block">{app.scheme}</span>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>

      <div className="mt-6 relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#08090a] to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#08090a] to-transparent z-20 pointer-events-none" />

        <motion.div animate={{ x: [-1800, 0] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="flex gap-6 w-max">
          {[...[...apps].reverse(), ...apps, ...apps, ...apps].map((app, i) => {
            const Icon = app.icon;
            return (
              <div key={`${app.name}-rev-${i}`} className="glass-card-linear flex items-center gap-4 rounded-2xl px-6 py-4 border border-white/[0.08]">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-white/10 border border-white/10 shadow">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-sm font-bold block text-white font-sans">{app.name}</span>
                  <span className="text-[10px] font-mono text-emerald-400 block">{app.scheme}</span>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
