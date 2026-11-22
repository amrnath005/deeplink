"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { TrendingUp, DollarSign, RefreshCw, Activity, Layers, AlertCircle, ShoppingBag } from "lucide-react";

export default function AnalyticsPage() {
  const [conversions, setConversions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/events");
      const data = await res.json();
      if (data.success) {
        setConversions(data.conversions || []);
      } else {
        setError(data.error || "Failed to load conversion events");
      }
    } catch (err: any) {
      setError(err.message || "Network error fetching conversion analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const totalConversions = conversions.length;
  const totalRevenue = conversions.reduce((sum, c) => sum + (c.value || 0), 0);
  const purchasesCount = conversions.filter((c) => c.eventName === "purchase").length;

  return (
    <div className="flex min-h-screen bg-[#08090a] text-white font-sans">
      <DashboardNav />

      <div className="flex-1 p-8 overflow-y-auto">
        
        {/* Header */}
        <header className="flex items-center justify-between pb-6 mb-8 border-b border-white/[0.08]">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">Conversion &amp; Attribution Analytics</h1>
            <p className="text-xs text-slate-400 mt-1">End-to-end campaign conversion events, attributed revenue, and Last Eligible Touch matching.</p>
          </div>

          <button onClick={fetchEvents} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-mono transition-colors">
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

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 font-mono text-xs">
          <div className="rounded-2xl p-6 border border-white/[0.08] bg-[#0c0d12]">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span>Total Conversions</span>
              <Activity className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">{loading ? "..." : totalConversions}</div>
          </div>

          <div className="rounded-2xl p-6 border border-white/[0.08] bg-[#0c0d12]">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span>Purchase Events</span>
              <ShoppingBag className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-400">{loading ? "..." : purchasesCount}</div>
          </div>

          <div className="rounded-2xl p-6 border border-white/[0.08] bg-[#0c0d12]">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span>Attributed Revenue</span>
              <DollarSign className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-400">{loading ? "..." : `$${totalRevenue.toLocaleString()}`}</div>
          </div>

          <div className="rounded-2xl p-6 border border-white/[0.08] bg-[#0c0d12]">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span>Attribution Model</span>
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-sm font-extrabold text-white">Last Eligible Touch</div>
          </div>
        </div>

        {/* Real Ingested Events Table */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d12] p-6">
          <h2 className="text-base font-bold text-white font-sans mb-4">Ingested Conversion Events Stream</h2>

          {loading ? (
            <div className="py-12 text-center text-xs font-mono text-slate-400">Loading conversion stream...</div>
          ) : conversions.length === 0 ? (
            <div className="py-12 text-center text-xs font-mono text-slate-400 space-y-2">
              <p>No conversion events ingested yet.</p>
              <p className="text-[11px] text-slate-500">Post conversion payloads to <code>POST /api/events</code> to track sales &amp; signups.</p>
            </div>
          ) : (
            <div className="overflow-x-auto font-mono text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-slate-400 border-b border-white/[0.08] text-[11px] uppercase">
                    <th className="pb-3 font-semibold">Timestamp</th>
                    <th className="pb-3 font-semibold">Event</th>
                    <th className="pb-3 font-semibold">Order ID</th>
                    <th className="pb-3 font-semibold">Value</th>
                    <th className="pb-3 font-semibold">Attributed Click ID</th>
                    <th className="pb-3 font-semibold text-right">Idempotency Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {conversions.map((c) => (
                    <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 text-slate-400">{new Date(c.timestamp).toLocaleString()}</td>
                      <td className="py-3 font-bold text-white uppercase">{c.eventName}</td>
                      <td className="py-3 text-slate-300 font-bold">{c.orderId || "N/A"}</td>
                      <td className="py-3 font-bold text-emerald-400">${c.value} {c.currency}</td>
                      <td className="py-3 text-slate-400">{c.clickId || "Direct Match"}</td>
                      <td className="py-3 text-right">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px]">
                          Enforced
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
