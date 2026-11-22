"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3, Link2, PlusCircle, ShieldCheck, Target, TrendingUp, Settings, ArrowLeft, LogOut
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: BarChart3 },
  { href: "/links", label: "Smart Links", icon: Link2 },
  { href: "/links/new", label: "Create Link", icon: PlusCircle },
  { href: "/campaigns", label: "Campaigns", icon: Target },
  { href: "/traffic", label: "Traffic Quality", icon: ShieldCheck },
  { href: "/analytics", label: "Analytics & ROAS", icon: TrendingUp },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/sign-in");
  };

  return (
    <aside className="w-64 bg-[#090a0f] border-r border-white/[0.08] min-h-screen flex flex-col justify-between p-4 shrink-0 font-sans text-xs">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-3 py-3 mb-6 border-b border-white/[0.08]">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Link2 className="h-4 w-4" />
          </div>
          <div>
            <span className="text-sm font-extrabold text-white tracking-tight block">
              DeepLink<span className="text-emerald-400">.pro</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Campaign Intelligence</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-colors ${
                  isActive
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & Logout */}
      <div className="pt-4 border-t border-white/[0.08] px-3 space-y-2">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors text-[11px] font-mono py-1"
        >
          <LogOut className="h-3.5 w-3.5" /> Sign Out Session
        </button>
        <a href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-[11px]">
          <ArrowLeft className="h-3.5 w-3.5" /> Return to Website
        </a>
      </div>
    </aside>
  );
}
