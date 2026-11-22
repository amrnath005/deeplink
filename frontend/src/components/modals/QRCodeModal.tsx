"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Copy, Check } from "lucide-react";
import { useState } from "react";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortUrl: string;
  qrCodeUrl: string;
}

export function QRCodeModal({ isOpen, onClose, shortUrl, qrCodeUrl }: QRCodeModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    const fullUrl = window.location.origin + shortUrl;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `deeplink-qr-${shortUrl.replace("/", "")}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-sans">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-sm bg-[#0c0d12] rounded-3xl p-6 border border-white/[0.08] shadow-2xl text-center">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/5 transition-colors">
            <X className="h-5 w-5" />
          </button>

          <h3 className="text-lg font-bold text-white mb-1 font-sans">Vector QR Code</h3>
          <p className="text-xs text-slate-400 mb-6 font-sans">Scan with any mobile camera to launch target app scheme</p>

          <div className="mx-auto mb-6 p-4 rounded-2xl bg-white border border-white/10 inline-block shadow-inner">
            {/* Standard img tag for guaranteed QR API compatibility */}
            <img src={qrCodeUrl} alt="Vector QR Code" width={220} height={220} className="rounded-lg" />
          </div>

          <p className="font-mono text-xs text-emerald-400 mb-6 truncate font-bold">{shortUrl}</p>

          <div className="flex gap-3 font-mono text-xs">
            <button onClick={handleCopy} className="flex-1 h-11 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold transition-colors">
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy Link"}
            </button>
            <button onClick={handleDownload} className="flex-1 h-11 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition-colors shadow">
              <Download className="h-4 w-4" /> Download
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
