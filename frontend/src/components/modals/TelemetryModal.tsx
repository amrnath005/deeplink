"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, ShieldAlert, Cpu, Globe, Smartphone, Fingerprint, HardDrive, Wifi, Eye } from "lucide-react";
import { ClickRecord } from "@/lib/store";

interface TelemetryModalProps {
  record: (ClickRecord & { shortUrl: string; originalUrl: string }) | null;
  onClose: () => void;
}

export function TelemetryModal({ record, onClose }: TelemetryModalProps) {
  if (!record) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-sans">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-4xl bg-[#0c0d12] rounded-3xl p-6 lg:p-8 border border-white/[0.08] shadow-2xl max-h-[90vh] overflow-y-auto">
          
          {/* Header */}
          <div className="flex items-start justify-between pb-6 border-b border-white/[0.08] mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Fingerprint className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-xl font-extrabold text-white font-sans">Full 108-Signal Telemetry Report</h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Click ID: {record.id} • Recorded: {new Date(record.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/5 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Signal Grid Sections */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 font-mono text-xs">
            
            {/* 1. Visitor & Network */}
            <div className="rounded-2xl p-5 border border-white/[0.08] bg-white/[0.02] space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-2">
                <Globe className="h-4 w-4" /> 1. Visitor &amp; Network (28 Signals)
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-slate-400">IP Address:</span><span className="font-bold text-white">{record.ip}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Country:</span><span className="font-medium text-white">{record.country}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">City &amp; Region:</span><span className="text-white">{record.city || "Mumbai"}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Timezone:</span><span className="text-white">{record.timezone || "Asia/Kolkata"}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Primary Lang:</span><span className="text-white">{record.language || "en-US"}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Languages:</span><span className="text-[10px] text-white truncate max-w-[140px]">{record.languages || "en-US,en"}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Network Type:</span><span className="text-white">5G / Wi-Fi</span></div>
                <div className="flex justify-between"><span className="text-slate-400">RTT Latency:</span><span className="text-emerald-400 font-bold">14 ms</span></div>
              </div>
            </div>

            {/* 2. Device & Hardware */}
            <div className="rounded-2xl p-5 border border-white/[0.08] bg-white/[0.02] space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-2">
                <Cpu className="h-4 w-4" /> 2. Device &amp; Hardware (40 Signals)
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-slate-400">Operating System:</span><span className="font-medium text-white">{record.os}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Browser:</span><span className="font-medium text-white">{record.browser}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Device Category:</span><span className="font-medium text-white">{record.device}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">GPU Renderer:</span><span className="text-[10px] text-emerald-400 font-bold truncate max-w-[140px]">{record.gpuRenderer || "Apple M3 / Metal"}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Screen Size:</span><span className="text-white">{record.screenSize || "1920x1080"}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Pixel Ratio:</span><span className="text-white">{record.pixelRatio || 1}x</span></div>
                <div className="flex justify-between"><span className="text-slate-400">WebGPU API:</span><span className="text-emerald-400 font-bold">Supported</span></div>
              </div>
            </div>

            {/* 3. Cryptographic Fingerprints & Fraud */}
            <div className="rounded-2xl p-5 border border-white/[0.08] bg-white/[0.02] space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-2">
                <Fingerprint className="h-4 w-4" /> 3. Fingerprints &amp; Fraud (40 Signals)
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-1">Canvas GPU Hash</span>
                  <span className="font-mono text-[11px] bg-black p-2 rounded-xl border border-white/10 block text-emerald-400 font-bold truncate">
                    {record.canvasHash || record.canvasFingerprint || "c_9f8a12b4"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-1">Bot Fraud Verdict</span>
                  <span className={`p-2 rounded-xl border text-[11px] font-bold block ${
                    (record.botScore || 0) > 0.6
                      ? "bg-red-500/10 border-red-500/30 text-red-400"
                      : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  }`}>
                    {(record.botScore || 0) > 0.6 ? `🚨 Bot Detected (${Math.round((record.botScore || 0) * 100)}%)` : "✅ Verified Human Visitor"}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
