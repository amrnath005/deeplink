"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { ShieldCheck, ShieldAlert, AlertTriangle, RefreshCw, Eye, CheckCircle2, AlertCircle } from "lucide-react";
import { TelemetryModal } from "@/components/modals/TelemetryModal";

export default function TrafficPage() {
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);

  const fetchLinks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/links");
      const data = await res.json();
      if (data.success) {
        setLinks(data.links || []);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load traffic quality logs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  // Aggregate Traffic Quality Breakdown
  let humanCount = 0;
  let suspiciousCount = 0;
  let highRiskCount = 0;
  const clickRecords: any[] = [];

  links.forEach((link) => {
    if (link.clickRecords) {
      link.clickRecords.forEach((rec: any) => {
        clickRecords.push({
          ...rec,
          shortUrl: link.shortUrl || `/${link.alias}`,
          originalUrl: link.originalUrl,
        });

        const score = rec.botScore || 0;
        if (score >= 0.7) highRiskCount++;
        else if (score >= 0.4) suspiciousCount++;
        else humanCount++;
      });
    }
  });

  const totalClicks = humanCount + suspiciousCount + highRiskCount || 1;
  const humanPct = Math.round((humanCount / totalClicks) * 100);
  const suspiciousPct = Math.round((suspiciousCount / totalClicks) * 100);
  const highRiskPct = Math.round((highRiskCount / totalClicks) * 100);

  return (
    <div className="flex min-h-screen bg-[#08090a] text-white font-sans">
      <DashboardNav />

      <div className="flex-1 p-8 overflow-y-auto">
        
        {/* Header */}
        <header className="flex items-center justify-between pb-6 mb-8 border-b border-white/[0.08]">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">Traffic Quality &amp; Risk Scoring</h1>
            <p className="text-xs text-slate-400 mt-1">Audit audited device signals, risk reason codes, and configurable pixel suppression actions.</p>
          </div>

          <button onClick={fetchLinks} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-mono transition-colors">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-emerald-400" : ""}`} /> Refresh
          </button>
        </header>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 font-mono">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 3 Traffic Quality Breakdown Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 font-mono text-xs">
          
          <div className="rounded-2xl p-6 border border-emerald-500/30 bg-emerald-500/5">
            <div className="flex items-center justify-between text-slate-300 mb-2">
              <span className="font-bold text-emerald-400">1. Human / Low Risk</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">{humanCount} <span className="text-sm font-normal text-slate-400">({humanPct}%)</span></div>
            <span className="text-[10px] text-slate-400 mt-1 block">Normal user-agent &amp; device signals</span>
          </div>

          <div className="rounded-2xl p-6 border border-yellow-500/30 bg-yellow-500/5">
            <div className="flex items-center justify-between text-slate-300 mb-2">
              <span className="font-bold text-yellow-400">2. Suspicious Traffic</span>
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">{suspiciousCount} <span className="text-sm font-normal text-slate-400">({suspiciousPct}%)</span></div>
            <span className="text-[10px] text-slate-400 mt-1 block">Proxy headers or burst request rate</span>
          </div>

          <div className="rounded-2xl p-6 border border-red-500/30 bg-red-500/5">
            <div className="flex items-center justify-between text-slate-300 mb-2">
              <span className="font-bold text-red-400">3. High Risk Automation</span>
              <ShieldAlert className="h-4 w-4 text-red-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">{highRiskCount} <span className="text-sm font-normal text-slate-400">({highRiskPct}%)</span></div>
            <span className="text-[10px] text-slate-400 mt-1 block">Headless Chrome / WebDriver scripts</span>
          </div>

        </div>

        {/* Audited Signals Log Table */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d12] p-6">
          <h2 className="text-base font-bold text-white font-sans mb-4">Traffic Risk Evaluation Log</h2>

          {loading ? (
            <div className="py-12 text-center text-xs font-mono text-slate-400">Loading traffic logs...</div>
          ) : clickRecords.length === 0 ? (
            <div className="py-12 text-center text-xs font-mono text-slate-400 space-y-2">
              <p>No click logs recorded yet. Visit smart links to generate real traffic logs.</p>
            </div>
          ) : (
            <div className="overflow-x-auto font-mono text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-slate-400 border-b border-white/[0.08] text-[11px] uppercase">
                    <th className="pb-3 font-semibold">Timestamp</th>
                    <th className="pb-3 font-semibold">IP Address</th>
                    <th className="pb-3 font-semibold">Shortlink</th>
                    <th className="pb-3 font-semibold">Risk Classification</th>
                    <th className="pb-3 font-semibold">Detected Reason</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {clickRecords.map((rec) => {
                    const score = rec.botScore || 0;
                    const isHigh = score >= 0.7;
                    const isSus = score >= 0.4 && score < 0.7;

                    return (
                      <tr key={rec.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 text-slate-400">{new Date(rec.timestamp).toLocaleTimeString()}</td>
                        <td className="py-3 font-bold text-white">{rec.ip}</td>
                        <td className="py-3 text-emerald-400 font-bold">{rec.shortUrl}</td>
                        <td className="py-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            isHigh
                              ? "bg-red-500/10 border-red-500/30 text-red-400"
                              : isSus
                              ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          }`}>
                            {isHigh ? "High Risk" : isSus ? "Suspicious" : "Low Risk"} ({Math.round(score * 100)}%)
                          </span>
                        </td>
                        <td className="py-3 text-slate-300">{rec.botLabel || "None"}</td>
                        <td className="py-3 text-right">
                          <button onClick={() => setSelectedRecord(rec)} className="px-3 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-black font-bold transition-all">
                            Inspect Signals
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Telemetry Modal */}
      <TelemetryModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />
    </div>
  );
}
