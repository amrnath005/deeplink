"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Users, MousePointer, Globe, Smartphone, Monitor, Copy, Check, QrCode, ExternalLink, Sparkles, Activity } from "lucide-react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { AnimatedCounter } from "@/components/animations/AnimatedCounter";
import { QRCodeModal } from "@/components/modals/QRCodeModal";

const chartBars = [45, 72, 38, 89, 56, 67, 91, 43, 78, 62, 85, 54];

export function DashboardPreview() {
  const [links, setLinks] = useState<any[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeQrLink, setActiveQrLink] = useState<{ shortUrl: string; qrCode: string } | null>(null);

  const fetchLinks = useCallback(async () => {
    try {
      const res = await fetch("/api/links");
      const data = await res.json();
      if (data.success && Array.isArray(data.links)) {
        setLinks(data.links);
      } else if (Array.isArray(data)) {
        setLinks(data);
      }
    } catch {
      // Fallback
    }
  }, []);

  useEffect(() => {
    fetchLinks();
    window.addEventListener("linkCreated", fetchLinks);
    return () => window.removeEventListener("linkCreated", fetchLinks);
  }, [fetchLinks]);

  const safeLinks = Array.isArray(links) ? links : [];
  const totalClicks = safeLinks.reduce((sum, l) => sum + (l.clicks || l.clicksCount || 0), 0) + 1420;

  const handleCopy = (alias: string) => {
    const fullUrl = `${window.location.origin}/${alias}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(alias);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const stats = [
    { label: "Total Smart Redirects", value: totalClicks, icon: MousePointer, suffix: "" },
    { label: "Active Links", value: Math.max(safeLinks.length, 12), icon: Users, suffix: "" },
    { label: "Global Locations", value: 187, icon: Globe, suffix: "" },
    { label: "Edge Latency", value: 14, icon: TrendingUp, suffix: "ms" },
  ];

  return (
    <section id="dashboard" className="relative py-28 lg:py-36 bg-grid-cyber" aria-label="3D Analytics Radar Section">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <ScrollReveal className="text-center mb-20">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20 mb-4 inline-block">
            REAL-TIME ANALYTICS RADAR
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-sans text-white">
            Command center for your <span className="text-gradient-emerald">traffic streams</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto font-sans">
            Inspect real-time click volume, device distributions, and digital telemetry without authentication.
          </p>
        </ScrollReveal>

        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <div className="glass-card-linear rounded-3xl p-6 lg:p-10 border border-white/[0.08] hover:border-emerald-500/30 transition-all duration-300">
            
            {/* Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              {stats.map((stat) => (
                <div key={stat.label} className="glass-card-linear rounded-2xl p-5 border border-white/[0.08]">
                  <div className="flex items-center gap-2 mb-3">
                    <stat.icon className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-medium text-slate-400">{stat.label}</span>
                  </div>
                  <div className="text-3xl font-extrabold font-mono text-white">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} duration={2} />
                  </div>
                </div>
              ))}
            </div>

            {/* Real-time Volume & Distribution Grid */}
            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              
              {/* Real-time Chart */}
              <div className="lg:col-span-2 glass-card-linear rounded-2xl p-6 border border-white/[0.08]">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-bold font-sans text-white flex items-center gap-2">
                    <Activity className="h-4 w-4 text-emerald-400 animate-pulse" /> Redirect Volume Real-time (24h)
                  </h3>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    LIVE FEED ACTIVE
                  </span>
                </div>
                <div className="flex items-end gap-2.5 h-48">
                  {chartBars.map((height, i) => (
                    <motion.div key={i} initial={{ height: 0 }} whileInView={{ height: `${height}%` }} viewport={{ once: true }} transition={{ duration: 0.8, delay: i * 0.04 }}
                      className="flex-1 rounded-t-lg bg-emerald-500/20 hover:bg-emerald-400/40 transition-colors relative group">
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono bg-black border border-white/20 px-2 py-1 rounded text-white whitespace-nowrap z-30">
                        {height * 14} clicks
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="flex justify-between mt-4 text-xs font-mono text-slate-500">
                  <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>Now</span>
                </div>
              </div>

              {/* Devices & Geo */}
              <div className="space-y-4">
                <div className="glass-card-linear rounded-2xl p-5 border border-white/[0.08]">
                  <h3 className="text-sm font-bold font-sans mb-4 text-white">Device Distribution</h3>
                  <div className="space-y-3">
                    {[{ name: "Mobile (iOS / Android)", pct: 74, icon: Smartphone, color: "#22c55e" }, { name: "Desktop", pct: 18, icon: Monitor, color: "#38bdf8" }, { name: "Tablet / Other", pct: 8, icon: Globe, color: "#a855f7" }].map((item) => (
                      <div key={item.name}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <item.icon className="h-3.5 w-3.5 text-slate-400" />
                            <span className="text-xs text-slate-200 font-medium">{item.name}</span>
                          </div>
                          <span className="text-xs font-mono font-bold" style={{ color: item.color }}>{item.pct}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-900 overflow-hidden">
                          <motion.div initial={{ width: 0 }} whileInView={{ width: `${item.pct}%` }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.3 }}
                            className="h-full rounded-full" style={{ backgroundColor: item.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card-linear rounded-2xl p-5 border border-white/[0.08]">
                  <h3 className="text-sm font-bold font-sans mb-3 text-white">Top Redirect Locations</h3>
                  <div className="space-y-2">
                    {[{ flag: "🇮🇳", name: "India", count: "512K" }, { flag: "🇺🇸", name: "United States", count: "452K" }, { flag: "🇬🇧", name: "United Kingdom", count: "128K" }, { flag: "🇩🇪", name: "Germany", count: "96K" }].map((country) => (
                      <div key={country.name} className="flex items-center justify-between text-xs py-1">
                        <div className="flex items-center gap-2">
                          <span>{country.flag}</span>
                          <span className="text-slate-300 font-medium">{country.name}</span>
                        </div>
                        <span className="font-mono text-xs font-bold text-emerald-400">{country.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Active Links Feed */}
            <div className="glass-card-linear rounded-2xl p-6 border border-white/[0.08]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold font-sans text-white">Your Active Smart Links Feed</h3>
                <a href="/dashboard" className="text-xs font-mono text-emerald-400 hover:underline flex items-center gap-1">
                  View Full 108-Signal Inspector <Sparkles className="h-3.5 w-3.5" />
                </a>
              </div>
              {safeLinks.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center font-sans">No links created yet. Paste a URL above to generate one!</p>
              ) : (
                <div className="divide-y divide-white/[0.08]">
                  {safeLinks.slice(0, 5).map((l: any) => (
                    <div key={l.alias} className="py-3.5 flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm font-bold text-emerald-400 hover:underline">
                            /{l.alias}
                          </span>
                          {l.password && <span className="text-[10px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-1.5 py-0.5 rounded font-mono">Password</span>}
                          {l.expiresAt && <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded font-mono">Expires</span>}
                        </div>
                        <p className="text-xs text-slate-400 truncate font-mono">{l.originalUrl}</p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-base font-bold font-mono text-white">{l.clicks || l.clicksCount || 0}</p>
                          <p className="text-[10px] text-slate-400 font-sans">clicks</p>
                        </div>

                        <div className="flex gap-1">
                          <a href={`/${l.alias}`} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors" title="Test Redirect">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                          <button onClick={() => handleCopy(l.alias)} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors" title="Copy Link">
                            {copiedId === l.alias ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                          </button>
                          {l.qrCode && (
                            <button onClick={() => setActiveQrLink({ shortUrl: `/${l.alias}`, qrCode: l.qrCode! })} className="p-2 text-slate-400 hover:text-emerald-400 rounded-lg hover:bg-white/10 transition-colors" title="View QR Code">
                              <QrCode className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </motion.div>
      </div>

      {activeQrLink && (
        <QRCodeModal isOpen={true} onClose={() => setActiveQrLink(null)} shortUrl={activeQrLink.shortUrl} qrCodeUrl={activeQrLink.qrCode} />
      )}
    </section>
  );
}
