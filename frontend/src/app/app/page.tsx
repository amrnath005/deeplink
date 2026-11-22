"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Zap,
  Link2,
  BarChart3,
  HardDrive,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  RefreshCw,
  Search,
  Sparkles,
  Smartphone,
  Laptop,
  Tablet,
  Globe,
  ShieldCheck,
  Download,
  Share2,
  AlertCircle,
  Play,
  ArrowRight,
  Plus
} from "lucide-react";
import { QRCodeModal } from "@/components/modals/QRCodeModal";

interface LinkItem {
  id: string;
  alias: string;
  originalUrl: string;
  shortUrl: string;
  targetScheme?: string;
  clicks: number;
  clicksCount?: number;
  qrCode?: string;
  createdAt: string;
}

interface ClickItem {
  id: string;
  alias: string;
  timestamp: string;
  ip: string;
  country: string;
  city: string;
  device: string;
  os: string;
  browser: string;
  botScore: number;
  riskScore?: number;
}

const PRESETS = [
  { name: "YouTube", icon: "🔴", placeholder: "https://www.youtube.com/watch?v=...", schemePrefix: "vnd.youtube://" },
  { name: "Spotify", icon: "🟢", placeholder: "https://open.spotify.com/track/...", schemePrefix: "spotify:" },
  { name: "Instagram", icon: "🟣", placeholder: "https://www.instagram.com/p/...", schemePrefix: "instagram://" },
  { name: "X / Twitter", icon: "🔵", placeholder: "https://x.com/username/status/...", schemePrefix: "twitter://" },
  { name: "Reddit", icon: "🟠", placeholder: "https://www.reddit.com/r/...", schemePrefix: "reddit://" },
  { name: "Amazon", icon: "📦", placeholder: "https://www.amazon.com/dp/...", schemePrefix: "com.amazon.mobile.shopping://" },
  { name: "Any Web Link", icon: "🌐", placeholder: "https://your-website.com/offer", schemePrefix: "" }
];

export default function MobileAppPage() {
  const [activeTab, setActiveTab] = useState<"generator" | "links" | "clicks" | "storage">("generator");
  
  // Generator State
  const [targetUrl, setTargetUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [selectedPreset, setSelectedPreset] = useState("Any Web Link");
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [createdResult, setCreatedResult] = useState<LinkItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Data State
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [clicks, setClicks] = useState<ClickItem[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // QR Modal
  const [qrModal, setQrModal] = useState<{ shortUrl: string; qrCodeUrl: string } | null>(null);

  // Fetch all existing links and clicks
  const loadData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [linksRes, clicksRes] = await Promise.all([
        fetch("/api/links"),
        fetch("/api/clicks")
      ]);
      const linksJson = await linksRes.json();
      if (linksJson.success) setLinks(linksJson.links || []);

      if (clicksRes.ok) {
        const clicksJson = await clicksRes.json();
        if (clicksJson.success) setClicks(clicksJson.clicks || []);
      }
    } catch (e) {
      console.warn("Failed to load initial data", e);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Handle Preset Selection
  const applyPreset = (presetName: string) => {
    setSelectedPreset(presetName);
    const p = PRESETS.find(item => item.name === presetName);
    if (p && !targetUrl) {
      setTargetUrl("");
    }
  };

  // Generate Smart Link
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl.trim()) {
      setGenError("Please paste or type a valid destination URL");
      return;
    }

    setGenerating(true);
    setGenError(null);

    try {
      const host = window.location.host;
      const protocol = window.location.protocol;
      const baseUrl = `${protocol}//${host}`;

      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalUrl: targetUrl.trim(),
          alias: customAlias.trim() || undefined,
          baseUrl
        })
      });

      const data = await res.json();
      if (data.success && data.link) {
        setCreatedResult(data.link);
        setTargetUrl("");
        setCustomAlias("");
        loadData();
      } else {
        setGenError(data.error || "Failed to generate link");
      }
    } catch (err: any) {
      setGenError(err.message || "Network error generating link");
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredLinks = useMemo(() => {
    if (!searchQuery) return links;
    return links.filter(l =>
      l.alias.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.originalUrl.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [links, searchQuery]);

  const totalClicks = links.reduce((sum, l) => sum + (l.clicks || l.clicksCount || 0), 0);

  return (
    <div className="min-h-screen bg-[#07080a] text-slate-100 flex flex-col font-sans pb-24 selection:bg-emerald-500/30">
      
      {/* Top Mobile Bar / Status Header */}
      <header className="sticky top-0 z-40 bg-[#0c0d12]/90 backdrop-blur-md border-b border-white/[0.08] px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-black font-black text-sm">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-white text-base tracking-tight">DeepLink Pro</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  VIP MOD
                </span>
              </div>
              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                UNLOCKED • ZERO LOGIN • DISK PERSISTED
              </p>
            </div>
          </div>

          <button
            onClick={loadData}
            title="Refresh Data"
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-slate-300 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loadingData ? "animate-spin text-emerald-400" : ""}`} />
          </button>
        </div>

        {/* Quick Glance Stats Strip */}
        <div className="max-w-md mx-auto grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-white/[0.04]">
          <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg px-2.5 py-1.5 text-center">
            <div className="text-[10px] text-slate-400 uppercase font-medium">Links</div>
            <div className="text-sm font-bold text-white">{links.length}</div>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg px-2.5 py-1.5 text-center">
            <div className="text-[10px] text-slate-400 uppercase font-medium">Total Clicks</div>
            <div className="text-sm font-bold text-emerald-400">{totalClicks}</div>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg px-2.5 py-1.5 text-center">
            <div className="text-[10px] text-slate-400 uppercase font-medium">Traffic Safety</div>
            <div className="text-sm font-bold text-teal-300">99.2%</div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 pt-4">

        {/* ================= TAB 1: GENERATOR ================= */}
        {activeTab === "generator" && (
          <div className="space-y-4">
            
            {/* Presets Slider */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
                Target Platform Presets
              </label>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => applyPreset(p.name)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                      selectedPreset === p.name
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/20"
                        : "bg-white/[0.03] text-slate-300 border-white/[0.06] hover:bg-white/[0.06]"
                    }`}
                  >
                    <span>{p.icon}</span>
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Input Card Form */}
            <form onSubmit={handleGenerate} className="bg-[#0e1017] rounded-2xl p-4 border border-white/[0.08] shadow-xl space-y-3.5">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Destination URL
                  </label>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const clip = await navigator.clipboard.readText();
                        if (clip) setTargetUrl(clip);
                      } catch {}
                    }}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold"
                  >
                    Paste from Clipboard
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder={PRESETS.find(p => p.name === selectedPreset)?.placeholder || "https://..."}
                    className="w-full bg-[#141721] border border-white/[0.1] rounded-xl px-3.5 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 block">
                  Custom Slug / Alias <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <div className="flex items-center bg-[#141721] border border-white/[0.1] rounded-xl px-3 text-sm text-slate-400 focus-within:border-emerald-500">
                  <span className="text-xs select-none text-slate-500">/</span>
                  <input
                    type="text"
                    value={customAlias}
                    onChange={(e) => setCustomAlias(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ""))}
                    placeholder="my-cool-link"
                    className="w-full bg-transparent border-0 px-1 py-3 text-sm text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              {genError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{genError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={generating}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-extrabold text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all hover:brightness-110 disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>ENGINEERING SMART LINK...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 fill-black" />
                    <span>GENERATE INSTANT DEEP LINK</span>
                  </>
                )}
              </button>
            </form>

            {/* Generated Success Card */}
            {createdResult && (
              <div className="bg-gradient-to-b from-[#111c18] to-[#0e1017] rounded-2xl p-4 border border-emerald-500/30 shadow-2xl space-y-3 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
                    <Sparkles className="h-3.5 w-3.5" />
                    Smart Link Ready
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    /{createdResult.alias}
                  </span>
                </div>

                {/* The Link Pill */}
                <div className="p-3 bg-black/40 rounded-xl border border-white/[0.08] flex items-center justify-between gap-2">
                  <div className="truncate font-mono text-xs text-white">
                    {typeof window !== "undefined" ? window.location.origin : ""}{createdResult.shortUrl || `/${createdResult.alias}`}
                  </div>
                  <button
                    onClick={() => {
                      const fullUrl = `${window.location.origin}${createdResult.shortUrl || `/${createdResult.alias}`}`;
                      copyToClipboard(fullUrl, "created");
                    }}
                    className="p-2 rounded-lg bg-emerald-500 text-black font-bold shrink-0 hover:bg-emerald-400 transition-colors"
                  >
                    {copiedId === "created" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>

                {/* Action Buttons Row */}
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={createdResult.shortUrl || `/${createdResult.alias}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-semibold text-slate-200 transition-colors"
                  >
                    <Play className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Test / Open</span>
                  </a>

                  <button
                    onClick={() => {
                      setQrModal({
                        shortUrl: createdResult.shortUrl || `/${createdResult.alias}`,
                        qrCodeUrl: createdResult.qrCode || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(window.location.origin + (createdResult.shortUrl || `/${createdResult.alias}`))}`
                      });
                    }}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-semibold text-slate-200 transition-colors"
                  >
                    <QrCode className="h-3.5 w-3.5 text-teal-400" />
                    <span>View QR Code</span>
                  </button>
                </div>
              </div>
            )}

            {/* Quick Helper Banner */}
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-start gap-3">
              <div className="h-7 w-7 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400">
                <Smartphone className="h-4 w-4" />
              </div>
              <div className="text-xs text-slate-300">
                <p className="font-semibold text-white mb-0.5">Mobile App-Breakout Active</p>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  When tapped from Reddit, X, Instagram or TikTok, your smart links will automatically break out of the in-app browser directly into the native app.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* ================= TAB 2: MY LINKS ================= */}
        {activeTab === "links" && (
          <div className="space-y-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your links..."
                className="w-full bg-[#0e1017] border border-white/[0.08] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {filteredLinks.length === 0 ? (
              <div className="text-center py-12 px-4 bg-[#0e1017] rounded-2xl border border-white/[0.05]">
                <Link2 className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-white">No links found</h4>
                <p className="text-xs text-slate-500 mt-1 mb-4">You have not generated any links matching this search.</p>
                <button
                  onClick={() => setActiveTab("generator")}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-black text-xs font-bold"
                >
                  Generate Your First Link
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredLinks.map((link) => {
                  const fullUrl = typeof window !== "undefined" ? `${window.location.origin}${link.shortUrl || `/${link.alias}`}` : `/${link.alias}`;
                  return (
                    <div
                      key={link.id || link.alias}
                      className="bg-[#0e1017] border border-white/[0.07] rounded-2xl p-3.5 hover:border-white/[0.15] transition-all space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-bold text-emerald-400">/{link.alias}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate max-w-[240px] mt-0.5">
                            {link.originalUrl}
                          </p>
                        </div>
                        <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold shrink-0">
                          {link.clicks || link.clicksCount || 0} clicks
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
                        <span className="text-[10px] text-slate-500">
                          {new Date(link.createdAt).toLocaleDateString()}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => copyToClipboard(fullUrl, link.id || link.alias)}
                            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 transition-colors"
                            title="Copy Smart Link"
                          >
                            {copiedId === (link.id || link.alias) ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>

                          <button
                            onClick={() => {
                              setQrModal({
                                shortUrl: link.shortUrl || `/${link.alias}`,
                                qrCodeUrl: link.qrCode || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(fullUrl)}`
                              });
                            }}
                            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 transition-colors"
                            title="View QR Code"
                          >
                            <QrCode className="h-3.5 w-3.5" />
                          </button>

                          <a
                            href={link.shortUrl || `/${link.alias}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                            title="Test Link"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: LIVE CLICKS ================= */}
        {activeTab === "clicks" && (
          <div className="space-y-3">
            {/* Click Breakdown Device Summary */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-[#0e1017] border border-white/[0.06] rounded-xl p-2.5 text-center">
                <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 mb-0.5">
                  <Smartphone className="h-3 w-3 text-emerald-400" />
                  <span>Mobile</span>
                </div>
                <div className="text-base font-black text-white">
                  {clicks.filter(c => c.device?.toLowerCase().includes("mobile") || c.device?.toLowerCase().includes("phone") || c.device?.toLowerCase().includes("iphone") || c.os === "iOS" || c.os === "Android").length}
                </div>
              </div>

              <div className="bg-[#0e1017] border border-white/[0.06] rounded-xl p-2.5 text-center">
                <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 mb-0.5">
                  <Laptop className="h-3 w-3 text-blue-400" />
                  <span>Laptop / PC</span>
                </div>
                <div className="text-base font-black text-white">
                  {clicks.filter(c => c.device?.toLowerCase().includes("desktop") || c.device?.toLowerCase().includes("laptop") || c.device?.toLowerCase().includes("pc") || c.os?.toLowerCase().includes("windows") || c.os?.toLowerCase().includes("mac")).length}
                </div>
              </div>

              <div className="bg-[#0e1017] border border-white/[0.06] rounded-xl p-2.5 text-center">
                <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 mb-0.5">
                  <Globe className="h-3 w-3 text-teal-400" />
                  <span>In-App Web</span>
                </div>
                <div className="text-base font-black text-white">
                  {clicks.filter(c => c.browser?.toLowerCase().includes("app") || c.browser?.toLowerCase().includes("instagram") || c.browser?.toLowerCase().includes("reddit") || c.browser?.toLowerCase().includes("twitter") || c.browser?.toLowerCase().includes("tiktok")).length}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Live Click Feed ({clicks.length})
              </span>
              <button
                onClick={loadData}
                className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1"
              >
                <RefreshCw className={`h-3 w-3 ${loadingData ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>

            {clicks.length === 0 ? (
              <div className="text-center py-12 px-4 bg-[#0e1017] rounded-2xl border border-white/[0.05]">
                <BarChart3 className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-white">No clicks recorded yet</h4>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Share your smart link or click "Test / Open" on a link to see real-time clicks appear here.
                </p>
                <button
                  onClick={() => setActiveTab("generator")}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-black text-xs font-bold"
                >
                  Create or Test a Link
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {clicks.slice(0, 40).map((click) => {
                  const isHuman = !click.botScore || click.botScore < 0.4;
                  const isMobile = click.device?.toLowerCase().includes("mobile") || click.device?.toLowerCase().includes("phone") || click.device?.toLowerCase().includes("iphone") || click.os === "iOS" || click.os === "Android";
                  const isTablet = click.device?.toLowerCase().includes("tablet") || click.device?.toLowerCase().includes("ipad");

                  return (
                    <div
                      key={click.id}
                      className="bg-[#0e1017] border border-white/[0.07] rounded-2xl p-3.5 space-y-2 hover:border-white/[0.15] transition-all"
                    >
                      {/* Top Row: Device Icon + Link + Risk Pill */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className={`h-7 w-7 rounded-xl flex items-center justify-center shrink-0 border ${
                            isMobile
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                              : isTablet
                              ? "bg-purple-500/10 border-purple-500/30 text-purple-400"
                              : "bg-blue-500/10 border-blue-500/30 text-blue-400"
                          }`}>
                            {isMobile ? <Smartphone className="h-3.5 w-3.5" /> : isTablet ? <Tablet className="h-3.5 w-3.5" /> : <Laptop className="h-3.5 w-3.5" />}
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-white text-xs">/{click.alias}</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/[0.05] border border-white/[0.08] text-slate-300 font-medium">
                                {click.device || (isMobile ? "Mobile Phone" : "Laptop / PC")}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-sans">
                              {click.os} • {click.browser || "Browser"}
                            </div>
                          </div>
                        </div>

                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                          isHuman
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/25"
                        }`}>
                          {isHuman ? "Human 🟢" : "Bot 🤖"}
                        </span>
                      </div>

                      {/* Bottom Row: Location, IP, and Exact Time */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1.5 border-t border-white/[0.04]">
                        <div className="flex items-center gap-1 truncate max-w-[200px]">
                          <span>📍</span>
                          <span className="text-slate-300 font-medium">{click.city || "Local"}, {click.country || "Device"}</span>
                          <span className="text-slate-500 text-[10px]">({click.ip})</span>
                        </div>

                        <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                          {new Date(click.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 4: STORAGE & EXPORT ================= */}
        {activeTab === "storage" && (
          <div className="space-y-4">
            
            {/* Storage Status Card */}
            <div className="bg-[#0e1017] rounded-2xl p-4 border border-white/[0.08] shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <HardDrive className="h-4 w-4" />
                <span>Local Permanent Storage Active</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                All your links, clicks, and analytics are permanently written to your computer's hard disk:
              </p>

              <div className="p-2.5 bg-black/50 rounded-xl border border-white/[0.06] font-mono text-[11px] text-slate-300 break-all">
                frontend/data/deeplink_local_db.json
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>No cloud account or Supabase project required. Your data survives server reboots permanently.</span>
              </div>
            </div>

            {/* Excel / CSV Exports */}
            <div className="bg-[#0e1017] rounded-2xl p-4 border border-white/[0.08] shadow-xl space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Download to Microsoft Excel / CSV
              </h4>
              <p className="text-xs text-slate-400">
                Export your current data into a clean spreadsheet to open in Excel or Google Sheets.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  href="/api/export?type=clicks"
                  download
                  className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-bold text-white transition-colors"
                >
                  <Download className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Download Clicks</span>
                </a>

                <a
                  href="/api/export?type=links"
                  download
                  className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-bold text-white transition-colors"
                >
                  <Download className="h-3.5 w-3.5 text-teal-400" />
                  <span>Download Links</span>
                </a>
              </div>
            </div>

            {/* Add to Mobile Phone Instructions */}
            <div className="bg-[#0e1017] rounded-2xl p-4 border border-white/[0.08] shadow-xl space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-teal-400 uppercase tracking-wider">
                <Smartphone className="h-4 w-4" />
                <span>Use as Native App (Mod APK Style)</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                You can install this directly onto your iPhone or Android phone as a standalone app with no browser address bar:
              </p>

              <div className="text-[11px] text-slate-400 space-y-1.5 pl-2 border-l-2 border-emerald-500/40">
                <p>1. Open <strong className="text-white">http://172.17.3.133:3000/app</strong> in Chrome or Safari on your phone.</p>
                <p>2. Tap the browser menu (<strong className="text-white">Share</strong> on iPhone or <strong className="text-white">⋮</strong> on Android).</p>
                <p>3. Tap <strong className="text-emerald-400">"Add to Home Screen"</strong> or <strong className="text-emerald-400">"Install App"</strong>.</p>
                <p>4. It launches fullscreen like an installed native app!</p>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Floating Mobile Bottom Navigation Dock */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0c0d12]/95 backdrop-blur-xl border-t border-white/[0.08] py-2 px-6">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-2">
          
          <button
            onClick={() => setActiveTab("generator")}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
              activeTab === "generator" ? "text-emerald-400 font-bold" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Zap className={`h-5 w-5 mb-0.5 ${activeTab === "generator" ? "fill-emerald-400" : ""}`} />
            <span className="text-[10px]">Generator</span>
          </button>

          <button
            onClick={() => setActiveTab("links")}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all relative ${
              activeTab === "links" ? "text-emerald-400 font-bold" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Link2 className="h-5 w-5 mb-0.5" />
            <span className="text-[10px]">My Links</span>
            {links.length > 0 && (
              <span className="absolute top-1 right-5 h-2 w-2 rounded-full bg-emerald-400"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("clicks")}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
              activeTab === "clicks" ? "text-emerald-400 font-bold" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <BarChart3 className="h-5 w-5 mb-0.5" />
            <span className="text-[10px]">Clicks</span>
          </button>

          <button
            onClick={() => setActiveTab("storage")}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
              activeTab === "storage" ? "text-emerald-400 font-bold" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <HardDrive className="h-5 w-5 mb-0.5" />
            <span className="text-[10px]">Storage</span>
          </button>

        </div>
      </nav>

      {/* Vector QR Modal */}
      {qrModal && (
        <QRCodeModal
          isOpen={true}
          onClose={() => setQrModal(null)}
          shortUrl={qrModal.shortUrl}
          qrCodeUrl={qrModal.qrCodeUrl}
        />
      )}

    </div>
  );
}
