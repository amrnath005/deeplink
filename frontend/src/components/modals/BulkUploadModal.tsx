"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UploadCloud, FileText, Check, Loader2, AlertCircle, Download } from "lucide-react";

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BulkUploadModal({ isOpen, onClose, onSuccess }: BulkUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultCount, setResultCount] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setResultCount(null);
    }
  };

  const handleDownloadSample = () => {
    const sampleCsv = `originalUrl,alias\nhttps://youtube.com/watch?v=dQw4w9WgXcQ,demo-yt\nhttps://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT,demo-sp\nhttps://t.me/durov,demo-tg`;
    const blob = new Blob([sampleCsv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "deeplink_bulk_sample.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleProcessCsv = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
      const urls: { originalUrl: string; alias?: string }[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (i === 0 && (line.toLowerCase().includes("url") || line.toLowerCase().includes("link"))) {
          continue; // Skip CSV header
        }
        const parts = line.split(",");
        const targetUrl = parts[0]?.replace(/"/g, "").trim();
        const customAlias = parts[1]?.replace(/"/g, "").trim();

        if (targetUrl && (targetUrl.startsWith("http://") || targetUrl.startsWith("https://") || targetUrl.includes("."))) {
          urls.push({
            originalUrl: targetUrl.startsWith("http") ? targetUrl : `https://${targetUrl}`,
            alias: customAlias || undefined,
          });
        }
      }

      if (urls.length === 0) {
        setError("No valid URLs found in CSV. Expected format: originalUrl, alias");
        setLoading(false);
        return;
      }

      // Process batch items concurrently
      const results = await Promise.all(
        urls.map((item) =>
          fetch("/api/links", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item),
          })
        )
      );

      const successCount = results.filter((r) => r.ok).length;

      setResultCount(successCount);
      onSuccess();
      window.dispatchEvent(new Event("linkCreated"));
    } catch (err: any) {
      setError(err.message || "Failed to process CSV file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-sans">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md bg-[#0c0d12] rounded-3xl p-6 border border-white/[0.08] shadow-2xl">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/5 transition-colors">
            <X className="h-5 w-5" />
          </button>

          <div className="text-center mb-6">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <UploadCloud className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white font-sans">Bulk Link Creation</h3>
            <p className="text-xs text-slate-400 mt-1 font-sans">Upload a CSV file containing URLs (one per line) to generate batch smart links.</p>
          </div>

          <div className="mb-4">
            <label className="flex flex-col items-center justify-center h-36 border-2 border-dashed border-white/10 hover:border-emerald-500/50 rounded-2xl bg-white/[0.02] cursor-pointer transition-colors">
              <div className="flex flex-col items-center justify-center p-4 text-center">
                <FileText className="h-8 w-8 text-slate-400 mb-2" />
                <p className="text-sm font-medium text-white">{file ? file.name : "Click or drag CSV file here"}</p>
                <p className="text-xs text-slate-500 mt-1 font-mono">Format: originalUrl, alias</p>
              </div>
              <input type="file" accept=".csv,.txt" onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          {/* Sample CSV Download Helper */}
          <div className="mb-6 flex justify-end">
            <button
              onClick={handleDownloadSample}
              type="button"
              className="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 hover:underline"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Sample CSV Template</span>
            </button>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 text-xs rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-mono">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {resultCount !== null && (
            <div className="mb-4 flex items-center gap-2 p-3 text-xs rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono">
              <Check className="h-4 w-4 flex-shrink-0" />
              <span>Successfully created {resultCount} batch links!</span>
            </div>
          )}

          <div className="flex gap-3 font-sans">
            <button onClick={onClose} className="flex-1 h-12 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-medium transition-colors">
              Cancel
            </button>
            <button onClick={handleProcessCsv} disabled={!file || loading}
              className="flex-1 h-12 rounded-xl bg-emerald-500 text-black font-bold text-sm hover:bg-emerald-400 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Process CSV"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
