"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, Copy, Check, QrCode, Clock, Lock, Sparkles, Loader2, AlertCircle, UploadCloud, ArrowRight, Layers } from "lucide-react";
import { QRCodeModal } from "@/components/modals/QRCodeModal";
import { BulkUploadModal } from "@/components/modals/BulkUploadModal";
import { BulkUtmQrModal } from "@/components/modals/BulkUtmQrModal";
import { YouTubeLogo, SpotifyLogo, TelegramLogo, InstagramLogo, WhatsAppLogo, XLogo } from "@/components/icons/BrandLogos";
import { cn } from "@/lib/utils";

const presets = [
  { name: "YouTube", url: "https://youtube.com/watch?v=dQw4w9WgXcQ", icon: YouTubeLogo },
  { name: "Spotify", url: "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT", icon: SpotifyLogo },
  { name: "Telegram", url: "https://t.me/durov", icon: TelegramLogo },
  { name: "Instagram", url: "https://instagram.com/instagram", icon: InstagramLogo },
  { name: "WhatsApp", url: "https://wa.me/15551234567", icon: WhatsAppLogo },
  { name: "X (Twitter)", url: "https://x.com/x", icon: XLogo },
];

export function LinkGenerator() {
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [expiresIn, setExpiresIn] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [generatedLink, setGeneratedLink] = useState<{
    shortUrl: string;
    fullUrl: string;
    qrCode: string;
  } | null>(null);

  const [copied, setCopied] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showUtmModal, setShowUtmModal] = useState(false);

  const handleGenerate = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);

    try {
      let targetUrl = url.trim();
      if (!/^https?:\/\//i.test(targetUrl)) {
        targetUrl = `https://${targetUrl}`;
      }

      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalUrl: targetUrl,
          alias: alias || undefined,
          expiresIn: expiresIn || undefined,
          password: password || undefined,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Failed to generate link");
        setLoading(false);
        return;
      }

      const fullUrl = `${window.location.origin}${data.link.shortUrl}`;
      setGeneratedLink({
        shortUrl: data.link.shortUrl,
        fullUrl,
        qrCode: data.link.qrCode,
      });

      window.dispatchEvent(new Event("linkCreated"));
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink.fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="generate" className="relative py-28 lg:py-36 font-sans" aria-label="Smart Link Generator Section">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          
          {/* Ultra-Clean Linear Dark Glass Card */}
          <div className="glass-card-linear rounded-3xl p-8 lg:p-12 border border-white/[0.08] hover:border-emerald-500/30 transition-all duration-300">
            
            {/* Generator Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight text-white font-sans">Create Smart Deep Link</h2>
                  <p className="text-xs sm:text-sm text-slate-400 font-sans">Sub-20ms edge latency auto-routing to native mobile apps</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => setShowUtmModal(true)}
                  aria-label="Generate UTM campaign batch"
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-semibold rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors min-h-[44px]">
                  <Layers className="h-4 w-4" /> Multi-UTM
                </button>
                <button onClick={() => setShowBulkModal(true)}
                  aria-label="Upload CSV for bulk link creation"
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-semibold rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 transition-colors min-h-[44px]">
                  <UploadCloud className="h-4 w-4" /> Bulk CSV
                </button>
              </div>
            </div>

            {/* 1-Tap Demo Preset Pills */}
            <div className="mb-6">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-2">Try 1-Tap Demo Presets</span>
              <div className="flex flex-wrap gap-2">
                {presets.map((preset) => {
                  const Icon = preset.icon;
                  return (
                    <button key={preset.name} onClick={() => setUrl(preset.url)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-all">
                      <Icon className="h-3.5 w-3.5" />
                      <span>{preset.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Input Form */}
            <div className="flex flex-col gap-5">
              <div className="relative">
                <Link2 className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://youtube.com/watch?v=... or spotify.com"
                  aria-label="Enter destination URL"
                  className="h-16 w-full rounded-2xl border border-white/10 bg-[#08090d] pl-12 pr-4 font-mono text-white placeholder:text-slate-500 focus:border-emerald-500/60 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 transition-all text-sm sm:text-base min-h-[44px]" />
              </div>

              <AnimatePresence>
                {showAdvanced && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                    <div className="grid gap-4 pt-2 sm:grid-cols-3">
                      <div className="relative">
                        <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input type="text" value={alias} onChange={(e) => setAlias(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} placeholder="custom-alias"
                          aria-label="Custom link alias"
                          className="h-12 w-full rounded-xl border border-white/10 bg-[#08090d] pl-9 pr-3 text-xs font-mono text-white placeholder:text-slate-500 focus:border-emerald-500/60 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 transition-all min-h-[44px]" />
                      </div>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <select value={expiresIn} onChange={(e) => setExpiresIn(e.target.value)}
                          aria-label="Expiration duration"
                          className="h-12 w-full rounded-xl border border-white/10 bg-[#08090d] pl-9 pr-3 text-xs font-mono text-white focus:border-emerald-500/60 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 transition-all appearance-none min-h-[44px]">
                          <option value="">Never expires</option>
                          <option value="1">1 hour</option>
                          <option value="24">24 hours</option>
                          <option value="168">7 days</option>
                          <option value="720">30 days</option>
                        </select>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (optional)"
                          aria-label="Password protection"
                          className="h-12 w-full rounded-xl border border-white/10 bg-[#08090d] pl-9 pr-3 text-xs font-mono text-white placeholder:text-slate-500 focus:border-emerald-500/60 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 transition-all min-h-[44px]" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <div className="flex items-center gap-2 p-4 text-xs font-mono rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 mt-2">
                <button onClick={handleGenerate} disabled={!url.trim() || loading}
                  aria-label="Generate smart link button"
                  className={cn("flex-1 h-14 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2 min-h-[44px] focus-visible:ring-2 focus-visible:ring-emerald-500", url.trim() && !loading ? "bg-emerald-500 text-black hover:bg-emerald-400 active:scale-95 shadow-md" : "bg-white/5 text-slate-500 cursor-not-allowed")}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Generate Smart Link"}
                </button>
                <button onClick={() => setShowAdvanced(!showAdvanced)}
                  aria-label="Toggle advanced settings options"
                  className="h-14 px-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono font-medium text-slate-300 transition-all min-h-[44px] focus-visible:ring-2 focus-visible:ring-emerald-500">
                  {showAdvanced ? "Hide Advanced" : "Advanced"}
                </button>
              </div>
            </div>

            {/* Generated Link Result Display Card */}
            <AnimatePresence>
              {generatedLink && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                  className="mt-8 pt-8 border-t border-white/[0.08] font-mono">
                  <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="truncate w-full">
                      <span className="text-[10px] text-emerald-400 uppercase tracking-wider block mb-1">Active Smart Deep Link</span>
                      <a href={generatedLink.fullUrl} target="_blank" rel="noreferrer" className="text-sm sm:text-base font-bold text-white hover:text-emerald-400 transition-colors underline truncate">
                        {generatedLink.fullUrl}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button onClick={handleCopy}
                        aria-label="Copy shortlink to clipboard"
                        className="flex-1 sm:flex-none h-11 px-4 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2">
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        <span>{copied ? "Copied!" : "Copy"}</span>
                      </button>
                      <button onClick={() => setShowQrModal(true)}
                        aria-label="Open QR code modal"
                        className="h-11 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium text-xs transition-colors flex items-center justify-center gap-2">
                        <QrCode className="h-4 w-4 text-emerald-400" />
                        <span>QR Code</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Account Sign Up CTA Sub-banner */}
            <div className="mt-8 pt-6 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono text-slate-400 flex-wrap gap-2">
              <span>Want click history &amp; 108-signal telemetry streams?</span>
              <a href="/sign-up" className="text-emerald-400 hover:underline flex items-center gap-1 font-bold">
                <span>Create Free Account (10K Clicks/mo)</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>

          </div>
        </motion.div>
      </div>

      <QRCodeModal isOpen={showQrModal} onClose={() => setShowQrModal(false)} qrCodeUrl={generatedLink?.qrCode || ""} shortUrl={generatedLink?.shortUrl || ""} />
      <BulkUploadModal isOpen={showBulkModal} onClose={() => setShowBulkModal(false)} onSuccess={() => {}} />
      <BulkUtmQrModal isOpen={showUtmModal} onClose={() => setShowUtmModal(false)} />
    </section>
  );
}
