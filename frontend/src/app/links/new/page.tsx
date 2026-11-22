"use client";

import { useState } from "react";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { Link2, ArrowLeft, Check, Sparkles, AlertCircle, Copy, ExternalLink, Loader2 } from "lucide-react";

export default function NewLinkPage() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [expiresIn, setExpiresIn] = useState("");
  const [password, setPassword] = useState("");
  const [targetScheme, setTargetScheme] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdLink, setCreatedLink] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setCreatedLink(null);

    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalUrl,
          alias: alias || undefined,
          expiresIn: expiresIn || undefined,
          password: password || undefined,
          targetScheme: targetScheme || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCreatedLink(data.link);
      } else {
        setError(data.error || "Failed to create smart link");
      }
    } catch (err: any) {
      setError(err.message || "Network error submitting link");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!createdLink) return;
    const fullUrl = window.location.origin + (createdLink.shortUrl || `/${createdLink.alias}`);
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex min-h-screen bg-[#08090a] text-white font-sans">
      <DashboardNav />

      <div className="flex-1 p-8 overflow-y-auto max-w-4xl mx-auto">
        
        {/* Header */}
        <header className="flex items-center justify-between pb-6 mb-8 border-b border-white/[0.08]">
          <div>
            <a href="/links" className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white mb-2 transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Smart Links
            </a>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">Create New Smart Link</h1>
            <p className="text-xs text-slate-400 mt-1">Configure sub-50ms edge routing, mobile app schemes, and campaign tracking.</p>
          </div>
        </header>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 font-mono">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Card */}
        {createdLink ? (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 mb-8 font-mono text-xs space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Check className="h-5 w-5" /> Smart Link Created Successfully!
            </div>
            
            <div className="p-4 rounded-xl bg-black border border-white/10 flex items-center justify-between">
              <span className="text-sm font-bold text-emerald-400">
                {window.location.origin + (createdLink.shortUrl || `/${createdLink.alias}`)}
              </span>
              <div className="flex items-center gap-2">
                <button onClick={handleCopy} className="px-3 py-1.5 rounded-lg bg-emerald-500 text-black font-bold flex items-center gap-1 hover:bg-emerald-400 transition-colors">
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <a href="/links/new" onClick={() => setCreatedLink(null)} className="text-slate-400 hover:text-white underline">
                + Create Another Link
              </a>
              <a href="/links" className="text-emerald-400 hover:underline font-bold">
                View in Directory →
              </a>
            </div>
          </div>
        ) : (
          /* Create Form */
          <form onSubmit={handleSubmit} className="rounded-2xl border border-white/[0.08] bg-[#0c0d12] p-6 space-y-6 font-sans text-xs">
            
            <div>
              <label className="block text-slate-300 font-bold mb-2">
                Destination URL <span className="text-emerald-400">*</span>
              </label>
              <input
                type="url"
                required
                placeholder="https://youtube.com/watch?v=dQw4w9WgXcQ"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-white/10 bg-[#08090d] text-white placeholder-slate-500 font-mono text-xs focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Target web destination or YouTube/Spotify/Telegram/Instagram link.</span>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-slate-300 font-bold mb-2">Custom Short Alias (Optional)</label>
                <div className="flex items-center">
                  <span className="px-3 py-3 rounded-l-xl bg-white/5 border border-r-0 border-white/10 font-mono text-slate-400">
                    dplk.pro/
                  </span>
                  <input
                    type="text"
                    placeholder="summer-sale"
                    value={alias}
                    onChange={(e) => setAlias(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                    className="flex-1 h-11 px-4 rounded-r-xl border border-white/10 bg-[#08090d] text-white placeholder-slate-500 font-mono text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-2">Expiration Window</label>
                <select
                  value={expiresIn}
                  onChange={(e) => setExpiresIn(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-white/10 bg-[#08090d] text-white font-mono text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  <option value="">Never (Permanent Link)</option>
                  <option value="24">24 Hours</option>
                  <option value="168">7 Days</option>
                  <option value="720">30 Days</option>
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 pt-2 border-t border-white/[0.08]">
              <div>
                <label className="block text-slate-300 font-bold mb-2">Password Protection Gate (Optional)</label>
                <input
                  type="password"
                  placeholder="Leave empty for public link"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-white/10 bg-[#08090d] text-white placeholder-slate-500 font-mono text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-2">Custom App Scheme (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. myapp://promo/summer"
                  value={targetScheme}
                  onChange={(e) => setTargetScheme(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-white/10 bg-[#08090d] text-white placeholder-slate-500 font-mono text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.08] flex justify-end">
              <button
                type="submit"
                disabled={loading || !originalUrl}
                className="h-11 px-6 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition-colors shadow flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                <span>Create Smart Link</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
