"use client";

import { Link2 } from "lucide-react";
import { FaGithub, FaTwitter } from "react-icons/fa";

const links = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "App Registry", href: "#apps" },
    { label: "108-Signal Telemetry", href: "#dashboard" },
    { label: "Native Mobile SDKs", href: "/docs/sdks" },
  ],
  Resources: [
    { label: "Documentation", href: "/docs/sdks" },
    { label: "Full Dashboard", href: "/dashboard" },
    { label: "REST API Engine", href: "/docs/sdks" },
    { label: "Privacy Policy", href: "/privacy" },
  ],
  Company: [
    { label: "About Platform", href: "/" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Security & Trust", href: "/privacy" },
    { label: "Sign In", href: "/sign-in" },
  ],
};

export function Footer() {
  return (
    <footer className="relative border-t border-border bg-[#050608] pt-20 pb-12 font-sans" aria-label="Global Footer">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-5 mb-16">
          
          {/* Brand Info */}
          <div className="lg:col-span-2">
            <a href="/" className="flex items-center gap-3 mb-4 group" aria-label="DeepLink Pro Home">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 glow-emerald-lg">
                <Link2 className="h-5 w-5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight font-display text-white">
                DeepLink<span className="text-emerald-400">.pro</span>
              </span>
            </a>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Sub-20ms edge-cached deep-link routing into native iOS &amp; Android apps. Complete 108-signal auto-telemetry, bot scoring, and deferred deep-linking.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub Repository" className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-slate-400 hover:text-white hover:border-emerald-500/40 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500">
                <FaGithub className="h-4 w-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter Feed" className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-slate-400 hover:text-white hover:border-emerald-500/40 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500">
                <FaTwitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Nav Categories */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-4">{category}</h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.label}>
                    <a href={item.href} className="text-sm text-slate-400 hover:text-emerald-400 transition-colors focus-visible:outline-none focus-visible:underline">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-border/60">
          <p className="text-xs text-slate-500">&copy; {new Date().getFullYear()} DeepLink Pro Platform. All rights reserved.</p>
          <p className="text-xs font-mono text-emerald-400">Status: Edge Nodes Operational (Sub-20ms)</p>
        </div>
      </div>
    </footer>
  );
}
