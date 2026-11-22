"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ShieldCheck, Cpu, Bot, Zap, Lock, ShoppingCart, RefreshCw, CheckCircle2, Loader2, Sparkles, Terminal, KeyRound
} from "lucide-react";

interface EnginePlaygroundModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const innovationDemos = [
  {
    id: "inAppEscape",
    icon: Zap,
    title: "1. In-App Webview Escape",
    subtitle: "+35% Conversion Lift",
    description: "Bypasses Instagram & TikTok slow webviews. Forces Safari/Chrome or target native app.",
    actionText: "Test Webview Breakout",
    endpoint: "/api/links",
    samplePayload: { userAgent: "Instagram 315.0.0.28.109" },
  },
  {
    id: "autoCart",
    icon: ShoppingCart,
    title: "2. Deferred Auto-Cart Transfer",
    subtitle: "85% Cart Abandonment Fix",
    description: "Passes SKUs, cart items & promo codes through App Store install to pre-fill app checkout.",
    actionText: "Test Auto-Cart Transfer",
    endpoint: "/api/deferred-cart",
    samplePayload: {},
  },
  {
    id: "adGuard",
    icon: ShieldCheck,
    title: "3. Ad-Click Bot Fraud Shield",
    subtitle: "Saves $15,000+/mo PPC Spend",
    description: "Sub-20ms 108-signal bot scoring blocks attribution pixels and pauses fraud campaigns.",
    actionText: "Test Bot Fraud Shield",
    endpoint: "/api/guard",
    samplePayload: { botScoreInput: 0.85, cpcCost: 3.50 },
  },
  {
    id: "affiliateDedup",
    icon: RefreshCw,
    title: "4. Affiliate Payout Deduplicator",
    subtitle: "Zero Double Payouts",
    description: "Single-source-of-truth ledger assigning revenue to only 1 true last-touch affiliate.",
    actionText: "Test Payout Deduplication",
    endpoint: "/api/dedup-affiliate",
    samplePayload: { orderId: "ord_99218", orderTotal: 149.99, affiliateIdClaimed: "aff_influencer_1" },
  },
  {
    id: "selfHeal",
    icon: RefreshCw,
    title: "5. Self-Healing 404 Fabric",
    subtitle: "Zero Dead QR Codes",
    description: "Background pings detect destination 404s and auto-reroute to backup storefronts.",
    actionText: "Test 404 Self-Healing",
    endpoint: "/api/auto-heal",
    samplePayload: { originalUrl: "https://deeplink.pro/broken-endpoint", fallbackUrl: "https://deeplink.pro/backup-store" },
  },
  {
    id: "zkPrivacy",
    icon: Lock,
    title: "6. ZK-SNARK Privacy Proofs",
    subtitle: "100% Apple ATT Compliant",
    description: "Generates zero-knowledge proofs verifying human clicks without exposing raw IP or hardware IDs.",
    actionText: "Generate ZK Proof",
    endpoint: "/api/zk-proof",
    samplePayload: {},
  },
  {
    id: "webGpu",
    icon: Cpu,
    title: "7. WebGPU Shader Enclave",
    subtitle: "64-Bit Noise Signature",
    description: "Executes WebGPU matrix shaders to bypass in-app storage wipes on iOS & Android.",
    actionText: "Compute WebGPU Hash",
    endpoint: "/api/webgpu-route",
    samplePayload: {},
  },
  {
    id: "aiAgent",
    icon: Bot,
    title: "8. AI Agent Commerce Protocol",
    subtitle: "Agent-to-Agent Handshake",
    description: "Programmatic JSON-LD checkout protocol for OpenAI Operator & Google Jarvis shopping agents.",
    actionText: "Test Agent Negotiator",
    endpoint: "/api/agent-negotiate",
    samplePayload: { alias: "nike-air-max" },
  },
  {
    id: "passkeyGate",
    icon: KeyRound,
    title: "9. Biometric Passkey Link Gate",
    subtitle: "100% Scalper Bot Protection",
    description: "Prompts FaceID/TouchID biometrics before launching high-value sneaker drops or tickets.",
    actionText: "Prompt Passkey Challenge",
    endpoint: "/api/passkey-link",
    samplePayload: { alias: "vip-drop-2026", biometricVerified: true },
  },
];

export function EnginePlaygroundModal({ isOpen, onClose }: EnginePlaygroundModalProps) {
  const [activeDemo, setActiveDemo] = useState(innovationDemos[0]);
  const [loading, setLoading] = useState(false);
  const [responseOutput, setResponseOutput] = useState<any>(null);

  if (!isOpen) return null;

  const handleRunDemo = async (demo: typeof innovationDemos[0]) => {
    setActiveDemo(demo);
    setLoading(true);
    setResponseOutput(null);

    try {
      const res = await fetch(demo.endpoint, {
        method: demo.endpoint === "/api/deferred-cart" ? "GET" : "POST",
        headers: { "Content-Type": "application/json" },
        body: demo.endpoint === "/api/deferred-cart" ? undefined : JSON.stringify(demo.samplePayload),
      });

      const data = await res.json();
      setResponseOutput(data);
    } catch (err: any) {
      setResponseOutput({ error: err.message || "Failed to execute engine" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-sans">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-5xl max-h-[90vh] bg-[#0c0d12] rounded-3xl p-6 border border-white/[0.08] shadow-2xl overflow-y-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white font-sans">Unprecedented Engine Playground</h2>
                <p className="text-xs text-slate-400">Test sub-20ms edge API engines live in your browser</p>
              </div>
            </div>

            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/5 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* 2-Column Layout */}
          <div className="grid lg:grid-cols-12 gap-6 items-start">
            
            {/* Left: 9 Innovation Demo Buttons */}
            <div className="lg:col-span-6 grid gap-2.5 sm:grid-cols-2 max-h-[500px] overflow-y-auto pr-1">
              {innovationDemos.map((demo) => {
                const Icon = demo.icon;
                const isSelected = activeDemo.id === demo.id;

                return (
                  <button
                    key={demo.id}
                    onClick={() => handleRunDemo(demo)}
                    className={`text-left p-3.5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? "bg-emerald-500/10 border-emerald-500/80 shadow-[0_0_20px_rgba(34,197,94,0.15)]"
                        : "bg-white/[0.02] border-white/[0.08] hover:border-white/20 hover:bg-white/5"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                          {demo.subtitle}
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-white font-sans mb-1">{demo.title}</h3>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-sans line-clamp-2">{demo.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right: Live Terminal JSON Inspector */}
            <div className="lg:col-span-6 rounded-2xl border border-white/[0.08] bg-[#08090d] overflow-hidden shadow-2xl font-mono text-xs">
              <div className="flex items-center justify-between px-4 py-3 bg-[#12131a] border-b border-white/[0.08]">
                <div className="flex items-center gap-2 truncate">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
                  <span className="ml-2 text-slate-300 font-bold truncate">{activeDemo.title}</span>
                </div>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {activeDemo.endpoint}
                </span>
              </div>

              <div className="p-3 border-b border-white/[0.08] bg-[#090a0f] flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Endpoint: <strong className="text-white">{activeDemo.endpoint}</strong></span>
                <button
                  onClick={() => handleRunDemo(activeDemo)}
                  disabled={loading}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                  <span>{activeDemo.actionText}</span>
                </button>
              </div>

              <div className="p-4 bg-[#08090d] h-[340px] overflow-auto text-slate-200 leading-relaxed font-mono">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
                    <span>Executing sub-20ms edge engine...</span>
                  </div>
                ) : responseOutput ? (
                  <pre className="text-emerald-400/90 text-[11px] leading-normal">
                    {JSON.stringify(responseOutput, null, 2)}
                  </pre>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2 text-center p-4">
                    <Terminal className="h-6 w-6 text-slate-500" />
                    <span>Click <strong>"{activeDemo.actionText}"</strong> to test live JSON payloads</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between px-4 py-2 bg-[#101118] border-t border-white/[0.08] text-[10px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Sub-20ms SLA
                </span>
                <span className="text-emerald-400">Zero-Cookie Telemetry</span>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
