"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Download, Check, Loader2, Link2, QrCode } from "lucide-react";

interface BulkUtmQrModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BulkUtmQrModal({ isOpen, onClose }: BulkUtmQrModalProps) {
  const [baseUrl, setBaseUrl] = useState("https://yourbrand.com/promo");
  const [campaign, setCampaign] = useState("summer-sale-2026");
  const [sources, setSources] = useState("instagram,tiktok,youtube,email,billboard");
  const [loading, setLoading] = useState(false);
  const [generatedBatch, setGeneratedBatch] = useState<
    { source: string; utmUrl: string; shortUrl: string; qrUrl: string }[] | null
  >(null);

  if (!isOpen) return null;

  const handleGenerateCampaign = async () => {
    if (!baseUrl.trim()) return;
    setLoading(true);

    try {
      const sourceList = sources.split(",").map((s) => s.trim()).filter(Boolean);
      const batch: { source: string; utmUrl: string; shortUrl: string; qrUrl: string }[] = [];

      for (const source of sourceList) {
        const utmUrl = `${baseUrl}?utm_source=${encodeURIComponent(source)}&utm_medium=social&utm_campaign=${encodeURIComponent(campaign)}`;
        const alias = `${campaign}-${source}`;

        const res = await fetch("/api/links", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            originalUrl: utmUrl,
            alias,
          }),
        });

        const data = await res.json();
        const shortUrl = data.success ? `${window.location.origin}${data.link.shortUrl}` : `${window.location.origin}/${alias}`;
        const qrUrl = data.link?.qrCode || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(shortUrl)}`;

        batch.push({ source, utmUrl, shortUrl, qrUrl });
      }

      setGeneratedBatch(batch);
      window.dispatchEvent(new Event("linkCreated"));
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = () => {
    if (!generatedBatch) return;
    const header = "source,shortUrl,originalUtmUrl,qrCodeUrl\n";
    const rows = generatedBatch.map((b) => `"${b.source}","${b.shortUrl}","${b.utmUrl}","${b.qrUrl}"`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `campaign_${campaign}_export.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-sans">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg bg-[#0c0d12] rounded-3xl p-6 border border-white/[0.08] shadow-2xl">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/5 transition-colors">
            <X className="h-5 w-5" />
          </button>

          <div className="text-center mb-6">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white font-sans">Instant UTM &amp; Vector QR Generator</h3>
            <p className="text-xs text-slate-400 mt-1 font-sans">Saves 25+ marketing hours. Generate multi-channel shortlinks and QR codes in 1 click.</p>
          </div>

          <div className="space-y-4 text-xs font-mono mb-6">
            <div>
              <label className="block text-slate-300 mb-1">Destination URL</label>
              <input type="url" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-emerald-500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 mb-1">Campaign Name</label>
                <input type="text" value={campaign} onChange={(e) => setCampaign(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Channels (comma separated)</label>
                <input type="text" value={sources} onChange={(e) => setSources(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-emerald-500" />
              </div>
            </div>
          </div>

          {generatedBatch && (
            <div className="mb-6 p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-2 max-h-48 overflow-y-auto font-mono text-[11px]">
              <div className="flex items-center justify-between text-emerald-400 font-bold mb-2">
                <span>Generated {generatedBatch.length} Channel Links</span>
                <button onClick={handleExportCsv} className="inline-flex items-center gap-1 text-xs text-white hover:underline bg-emerald-500/20 px-2 py-1 rounded">
                  <Download className="h-3 w-3 text-emerald-400" /> Export CSV
                </button>
              </div>
              {generatedBatch.map((b) => (
                <div key={b.source} className="flex items-center justify-between gap-2 py-1 border-t border-white/5">
                  <span className="text-slate-300 font-bold uppercase">{b.source}</span>
                  <a href={b.shortUrl} target="_blank" rel="noreferrer" className="text-emerald-400 truncate hover:underline">
                    {b.shortUrl}
                  </a>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 font-sans">
            <button onClick={onClose} className="flex-1 h-12 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-medium transition-colors">
              Close
            </button>
            <button onClick={handleGenerateCampaign} disabled={loading}
              className="flex-1 h-12 rounded-xl bg-emerald-500 text-black font-bold text-sm hover:bg-emerald-400 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate Campaign Links"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
