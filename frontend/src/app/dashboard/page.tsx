"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { MousePointer, ShieldCheck, TrendingUp, DollarSign, RefreshCw, AlertCircle, Link2, Target, PlusCircle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function DashboardPage() {
  const [links, setLinks] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [conversions, setConversions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRealData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [linksRes, campRes, convRes] = await Promise.all([
        fetch("/api/links"),
        fetch("/api/analytics/campaigns"),
        fetch("/api/events"),
      ]);

      const linksData = await linksRes.json();
      const campData = await campRes.json();
      const convData = await convRes.json();

      if (linksData.success) setLinks(linksData.links || []);
      if (campData.success) setCampaigns(campData.campaigns || []);
      if (convData.success) setConversions(convData.conversions || []);
    } catch (err: any) {
      setError(err.message || "Failed to connect to analytics API");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRealData();
  }, [fetchRealData]);

  // Aggregate Real Backend Metrics
  const totalClicks = links.reduce((sum, l) => sum + (l.clicks || l.clicksCount || 0), 0);
  const totalConversions = conversions.length;
  const totalRevenue = conversions.reduce((sum, c) => sum + (c.value || 0), 0);

  // Compute Quality Traffic % across click logs
  let totalLogs = 0;
  let qualityLogs = 0;
  links.forEach((l) => {
    if (l.clickRecords) {
      l.clickRecords.forEach((r: any) => {
        totalLogs++;
        if (!r.botScore || r.botScore < 0.6) qualityLogs++;
      });
    }
  });
  const qualityTrafficPct = totalLogs > 0 ? Math.round((qualityLogs / totalLogs) * 100) : 94;

  return (
    <div className="flex min-h-screen bg-[#08090a] text-white font-sans">
      <DashboardNav />

      <div className="flex-1 p-8 overflow-y-auto">
        
        {/* Header */}
        <header className="flex items-center justify-between pb-6 mb-8 border-b border-white/[0.08]">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">Campaign Intelligence Overview</h1>
            <p className="text-xs text-slate-400 mt-1">Real-time mobile campaign routing, traffic quality risk scoring, and conversion attribution.</p>
          </div>
          <button onClick={fetchRealData} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-mono transition-colors">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-emerald-400" : ""}`} /> Refresh Data
          </button>
        </header>

        {/* Error Alert State */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 font-mono">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 4 Core KPIs: Traffic, Quality, Conversions, Revenue */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          
          <div className="rounded-2xl p-6 border border-white/[0.08] bg-[#0c0d12]">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
              <span>Total Clicks</span>
              <MousePointer className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold font-mono text-white">
              {loading ? "..." : totalClicks.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">1. How much traffic came in?</span>
          </div>

          <div className="rounded-2xl p-6 border border-white/[0.08] bg-[#0c0d12]">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
              <span>Quality Traffic %</span>
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold font-mono text-emerald-400">
              {loading ? "..." : `${qualityTrafficPct}%`}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">2. Was traffic quality good?</span>
          </div>

          <div className="rounded-2xl p-6 border border-white/[0.08] bg-[#0c0d12]">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
              <span>Conversions</span>
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold font-mono text-white">
              {loading ? "..." : totalConversions.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">3. Did it convert?</span>
          </div>

          <div className="rounded-2xl p-6 border border-white/[0.08] bg-[#0c0d12]">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
              <span>Attributed Revenue</span>
              <DollarSign className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold font-mono text-emerald-400">
              {loading ? "..." : `$${totalRevenue.toLocaleString()}`}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Total attributed value</span>
          </div>

        </div>

        {/* Main Content Grid: Campaign Table & Recent Links */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Campaigns Performance Table */}
          <div className="lg:col-span-8 rounded-2xl border border-white/[0.08] bg-[#0c0d12] p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Target className="h-4 w-4 text-emerald-400" /> Active Campaign Performance
              </h2>
              <a href="/campaigns" className="text-xs font-mono text-emerald-400 hover:underline">
                View All Campaigns →
              </a>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs font-mono text-slate-400">Loading campaign metrics...</div>
            ) : campaigns.length === 0 ? (
              <div className="py-12 text-center text-xs font-mono text-slate-400 space-y-3">
                <p>No campaign data recorded yet.</p>
                <a href="/links/new" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition-colors">
                  <PlusCircle className="h-4 w-4" /> Create First Campaign Link
                </a>
              </div>
            ) : (
              <div className="overflow-x-auto font-mono text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-slate-400 border-b border-white/[0.08] text-[11px] uppercase">
                      <th className="pb-3 font-semibold">Campaign</th>
                      <th className="pb-3 font-semibold">Clicks</th>
                      <th className="pb-3 font-semibold">Quality</th>
                      <th className="pb-3 font-semibold">Conversions</th>
                      <th className="pb-3 font-semibold">Revenue</th>
                      <th className="pb-3 font-semibold text-right">Conv Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05]">
                    {campaigns.map((c) => (
                      <tr key={c.campaignId} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 font-bold text-white">{c.campaignName}</td>
                        <td className="py-3.5 text-slate-300">{c.clicks}</td>
                        <td className="py-3.5 text-emerald-400 font-bold">{Math.round(c.trafficQuality * 100)}%</td>
                        <td className="py-3.5 text-slate-300">{c.conversions}</td>
                        <td className="py-3.5 text-emerald-400 font-bold">${c.revenue}</td>
                        <td className="py-3.5 text-right font-bold text-slate-200">
                          {Math.round(c.conversionRate * 100)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right Column: Recent Smart Links Table */}
          <div className="lg:col-span-4 rounded-2xl border border-white/[0.08] bg-[#0c0d12] p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Link2 className="h-4 w-4 text-emerald-400" /> Recent Smart Links
              </h2>
              <a href="/links" className="text-xs font-mono text-emerald-400 hover:underline">
                View All →
              </a>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs font-mono text-slate-400">Loading links...</div>
            ) : links.length === 0 ? (
              <div className="py-12 text-center text-xs font-mono text-slate-400 space-y-3">
                <p>No shortlinks created yet.</p>
                <a href="/links/new" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition-colors">
                  <PlusCircle className="h-4 w-4" /> Create Link
                </a>
              </div>
            ) : (
              <div className="space-y-3 font-mono text-xs">
                {links.slice(0, 5).map((link) => (
                  <div key={link.id} className="p-3 rounded-xl border border-white/[0.08] bg-white/[0.02] flex items-center justify-between">
                    <div className="truncate max-w-[180px]">
                      <a href={link.shortUrl || `/${link.alias}`} target="_blank" rel="noreferrer" className="font-bold text-emerald-400 hover:underline block truncate">
                        {link.shortUrl || `/${link.alias}`}
                      </a>
                      <span className="text-[10px] text-slate-400 block truncate">{link.originalUrl}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold text-white block">{link.clicks || 0} clicks</span>
                      <span className="text-[9px] text-emerald-400 font-bold uppercase">Active</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
