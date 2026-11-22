"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { Target, RefreshCw, PlusCircle, AlertCircle } from "lucide-react";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analytics/campaigns");
      const data = await res.json();
      if (data.success) {
        setCampaigns(data.campaigns || []);
      } else {
        setError(data.error || "Failed to load campaigns");
      }
    } catch (err: any) {
      setError(err.message || "Network error fetching campaigns");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  return (
    <div className="flex min-h-screen bg-[#08090a] text-white font-sans">
      <DashboardNav />

      <div className="flex-1 p-8 overflow-y-auto">
        
        {/* Header */}
        <header className="flex items-center justify-between pb-6 mb-8 border-b border-white/[0.08]">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">Campaign Performance Directory</h1>
            <p className="text-xs text-slate-400 mt-1">Track traffic volume, quality scores, conversions, and attributed revenue by marketing campaign.</p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <button onClick={fetchCampaigns} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-mono transition-colors">
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-emerald-400" : ""}`} /> Refresh
            </button>
            <a href="/links/new" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition-colors shadow">
              <PlusCircle className="h-4 w-4" /> Create Campaign Link
            </a>
          </div>
        </header>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 font-mono">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Main Campaign Table */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d12] p-6">
          {loading ? (
            <div className="py-16 text-center text-xs font-mono text-slate-400 space-y-2">
              <RefreshCw className="h-6 w-6 animate-spin text-emerald-400 mx-auto" />
              <p>Loading campaign analytics...</p>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="py-16 text-center text-xs font-mono text-slate-400 space-y-4">
              <Target className="h-8 w-8 text-slate-500 mx-auto" />
              <p>No campaign performance records found.</p>
              <a href="/links/new" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition-colors">
                <PlusCircle className="h-4 w-4" /> Launch First Campaign
              </a>
            </div>
          ) : (
            <div className="overflow-x-auto font-mono text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-slate-400 border-b border-white/[0.08] text-[11px] uppercase">
                    <th className="pb-3 font-semibold">Campaign Name</th>
                    <th className="pb-3 font-semibold">UTM Source / Medium</th>
                    <th className="pb-3 font-semibold">Clicks</th>
                    <th className="pb-3 font-semibold">Traffic Quality</th>
                    <th className="pb-3 font-semibold">Conversions</th>
                    <th className="pb-3 font-semibold">Attributed Revenue</th>
                    <th className="pb-3 font-semibold text-right">Conversion Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {campaigns.map((c) => (
                    <tr key={c.campaignId} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 font-bold text-white text-sm">{c.campaignName}</td>
                      <td className="py-4 text-slate-400">
                        {c.utmSource || "direct"} / {c.utmMedium || "none"}
                      </td>
                      <td className="py-4 font-bold text-white">{c.clicks.toLocaleString()}</td>
                      <td className="py-4 text-emerald-400 font-bold">{Math.round(c.trafficQuality * 100)}%</td>
                      <td className="py-4 text-slate-300 font-bold">{c.conversions}</td>
                      <td className="py-4 text-emerald-400 font-bold">${c.revenue.toLocaleString()}</td>
                      <td className="py-4 text-right font-bold text-slate-200">
                        {Math.round(c.conversionRate * 1000) / 10}%
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
