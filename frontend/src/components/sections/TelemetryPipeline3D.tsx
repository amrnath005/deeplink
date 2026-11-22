"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Cpu, ShieldCheck, Zap, HardDrive, Play, ArrowRight, CheckCircle2, Fingerprint, Activity } from "lucide-react";
import { Card3D } from "@/components/animations/Card3D";

const pipelineSteps = [
  {
    id: 1,
    title: "1. Edge Ingestion & GeoIP",
    icon: Globe,
    color: "#38bdf8", // Sky blue
    metrics: ["Client WAN IP", "Country / City Node", "Timezone & Multi-Lang", "RTT Latency Timer"],
    description: "Sub-20ms edge node captures HTTP headers, client IP, multi-language list, and geographic node.",
  },
  {
    id: 2,
    title: "2. 52-Signal Hardware Scan",
    icon: Cpu,
    color: "#10b981", // Emerald
    metrics: ["64-Bit Canvas FP", "WebGL Unmasked GPU", "Audio Oscillator Hash", "WebGPU & Storage Flags"],
    description: "Asynchronous client engine extracts non-invasive browser capabilities, screen viewport, CPU threads & RAM.",
  },
  {
    id: 3,
    title: "3. AI Bot & Risk Scoring",
    icon: ShieldCheck,
    color: "#f59e0b", // Amber
    metrics: ["25+ Bot Classifier", "Proxy / TOR Node Check", "Risk Score (0.0-1.0)", "Click Deduplication"],
    description: "Machine-learning heuristics classify human visitors vs crawlers, proxy nodes, and automated scrapers.",
  },
  {
    id: 4,
    title: "4. Native App Scheme Launch",
    icon: Zap,
    color: "#a855f7", // Purple
    metrics: ["iOS Universal Links", "Android Intent URLs", "Sub-1s Web Fallback", "Custom Scheme Builder"],
    description: "Instant URI scheme invocation bypasses broken in-app webviews and launches target native mobile apps.",
  },
  {
    id: 5,
    title: "5. Redis Event Bus Storage",
    icon: HardDrive,
    color: "#ec4899", // Pink
    metrics: ["Redis Stream Queue", "Async ClickHouse Writes", "WebSocket Real-time Broadcast", "Export CSV/JSON"],
    description: "Events are queued into Redis Streams and persisted into ClickHouse columnar storage for real-time dashboards.",
  },
];

export function TelemetryPipeline3D() {
  const [activeStep, setActiveStep] = useState(1);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!autoPlay) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev % pipelineSteps.length) + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, [autoPlay]);

  const stepData = pipelineSteps.find((s) => s.id === activeStep) || pipelineSteps[0];

  return (
    <section className="relative py-32 lg:py-44 bg-grid-cyber overflow-hidden" aria-label="3D Telemetry Processing Pipeline">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-20">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20 mb-4 inline-block">
            BEHIND THE SCENES ENGINE
          </span>
          <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight font-display text-white">
            What happens in <span className="text-gradient-emerald">sub-20 milliseconds</span>
          </h2>
          <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto font-sans">
            Trace the 3D data processing pipeline from initial link click to native app launching and real-time event bus storage.
          </p>
        </div>

        {/* 3D Interactive Pipeline Grid */}
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          
          {/* Left: 5 Step Nodes List */}
          <div className="lg:col-span-5 space-y-4">
            {pipelineSteps.map((step) => {
              const isActive = step.id === activeStep;
              const Icon = step.icon;
              return (
                <div
                  key={step.id}
                  onClick={() => { setActiveStep(step.id); setAutoPlay(false); }}
                  className={`cursor-pointer rounded-2xl p-5 border transition-all duration-300 ${
                    isActive
                      ? "bg-slate-900/80 border-emerald-500/50 shadow-[0_10px_30px_rgba(16,185,129,0.15)] scale-[1.02]"
                      : "bg-slate-950/40 border-border/60 opacity-70 hover:opacity-100 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl font-mono text-sm font-bold shadow" style={{ backgroundColor: `${step.color}20`, color: step.color }}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white font-display">{step.title}</h3>
                        <p className="text-xs text-slate-400 font-mono truncate max-w-[220px]">{step.metrics[0]}</p>
                      </div>
                    </div>
                    {isActive && (
                      <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: 3D Animated Processing Hologram Card */}
          <div className="lg:col-span-7">
            <Card3D depth={14} className="glass-3d laser-border-3d p-8 lg:p-10 shadow-2xl relative overflow-hidden">
              
              {/* Holographic Header Bar */}
              <div className="flex items-center justify-between pb-6 border-b border-border mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl shadow font-mono font-bold" style={{ backgroundColor: `${stepData.color}20`, color: stepData.color }}>
                    <stepData.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-white font-display">{stepData.title}</h3>
                    <span className="text-xs font-mono text-slate-400">Step {stepData.id} of 5 • Active Stage</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => setAutoPlay(!autoPlay)} className="px-3 py-1.5 rounded-full text-xs font-mono border border-border bg-surface text-slate-300 hover:text-white">
                    {autoPlay ? "Pause 3D Loop" : "Play 3D Loop"}
                  </button>
                </div>
              </div>

              {/* Step Description */}
              <p className="text-sm text-slate-300 leading-relaxed font-sans mb-8">
                {stepData.description}
              </p>

              {/* 3D Signals Collected Badge Grid */}
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {stepData.metrics.map((metric, idx) => (
                  <div key={metric} className="glass-card-3d rounded-xl p-4 border border-border flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                    <span className="text-xs font-mono text-slate-200 font-semibold">{metric}</span>
                  </div>
                ))}
              </div>

              {/* 3D Animated Processing Flow Visualization */}
              <div className="rounded-2xl border border-border/80 bg-slate-950/80 p-6 font-mono text-xs relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-emerald-400 animate-pulse" /> Live Telemetry Packet Flow
                  </span>
                  <span className="text-emerald-400 font-bold">14.2ms Processing Time</span>
                </div>

                {/* Animated Packet Pipeline Bars */}
                <div className="space-y-3">
                  {pipelineSteps.map((s) => {
                    const isPassed = s.id <= activeStep;
                    return (
                      <div key={s.id} className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className={isPassed ? "text-slate-200 font-bold" : "text-slate-600"}>{s.title}</span>
                          <span className={isPassed ? "text-emerald-400 font-bold" : "text-slate-600"}>{isPassed ? "PASSED" : "QUEUED"}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-900 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: isPassed ? "100%" : "0%" }}
                            transition={{ duration: 0.6 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: s.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </Card3D>
          </div>

        </div>

      </div>
    </section>
  );
}
