"use client";

import { useState } from "react";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { Settings, Globe, Key, Webhook, Check, Copy, HardDrive } from "lucide-react";

export default function SettingsPage() {
  const [domain, setDomain] = useState("dplk.pro");
  const [webhookUrl, setWebhookUrl] = useState("https://api.brandstore.com/webhooks/deeplink");
  const [apiKey] = useState("dlk_live_9f8a12b4901823749201");
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="flex min-h-screen bg-[#08090a] text-white font-sans">
      <DashboardNav />

      <div className="flex-1 p-8 overflow-y-auto max-w-4xl mx-auto">
        
        {/* Header */}
        <header className="flex items-center justify-between pb-6 mb-8 border-b border-white/[0.08]">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">Workspace &amp; Domain Settings</h1>
            <p className="text-xs text-slate-400 mt-1">Manage multi-tenancy workspace isolation, custom short domains, API keys, and conversion webhooks.</p>
          </div>
        </header>

        {saved && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 font-mono">
            <Check className="h-4 w-4 shrink-0" />
            <span>Workspace settings updated successfully.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6 text-xs font-sans">
          
          {/* Section 1: Workspace Info */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d12] p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-emerald-400" /> Workspace Information
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Workspace ID</label>
                <input
                  type="text"
                  disabled
                  value="ws_default"
                  className="w-full h-10 px-3.5 rounded-xl border border-white/10 bg-white/5 text-slate-400 font-mono text-xs cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Workspace Name</label>
                <input
                  type="text"
                  defaultValue="Default Brand Workspace"
                  className="w-full h-10 px-3.5 rounded-xl border border-white/10 bg-[#08090d] text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Custom Branded Domain */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d12] p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Globe className="h-4 w-4 text-emerald-400" /> Custom Short Domain
            </h2>
            <div>
              <label className="block text-slate-300 font-bold mb-1">Brand Domain</label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-white/10 bg-[#08090d] text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Point your CNAME record to <code>cname.vercel-dns.com</code> to activate sub-50ms SSL routing.</span>
            </div>
          </div>

          {/* Section 3: REST API Keys */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d12] p-6 space-y-4 font-mono">
            <h2 className="text-base font-bold text-white font-sans flex items-center gap-2">
              <Key className="h-4 w-4 text-emerald-400" /> REST API Secret Key
            </h2>
            <div className="flex items-center gap-2">
              <input
                type="text"
                disabled
                value={apiKey}
                className="flex-1 h-10 px-3.5 rounded-xl border border-white/10 bg-white/5 text-emerald-400 text-xs font-mono"
              />
              <button
                type="button"
                onClick={handleCopyKey}
                className="h-10 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? "Copied" : "Copy Key"}</span>
              </button>
            </div>
          </div>

          {/* Section 4: Webhooks Integration */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d12] p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Webhook className="h-4 w-4 text-emerald-400" /> Conversion Event Webhooks
            </h2>
            <div>
              <label className="block text-slate-300 font-bold mb-1">Webhook Endpoint URL</label>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-white/10 bg-[#08090d] text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">DeepLink Pro dispatches HTTP POST payloads to this URL when conversion events occur.</span>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="h-11 px-6 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition-colors shadow"
            >
              Save Workspace Settings
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
