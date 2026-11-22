import Link from "next/link";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#08090a] text-slate-200 px-6 py-12 max-w-4xl mx-auto font-sans leading-relaxed">
      <Link href="/" className="inline-flex items-center gap-2 text-emerald-400 hover:underline mb-8 text-sm font-mono">
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>

      <div className="flex items-center gap-3 mb-6 border-b border-white/[0.08] pb-6">
        <ShieldCheck className="h-8 w-8 text-emerald-400" />
        <h1 className="text-3xl font-bold tracking-tight text-white font-mono">Privacy Policy &amp; Data Protection</h1>
      </div>

      <div className="space-y-6 text-sm text-slate-300">
        <p className="text-xs text-slate-500 font-mono">Effective Date: August 8, 2026 | Version 1.0 (GDPR &amp; CCPA Compliant)</p>

        <section className="p-5 rounded-xl border border-white/[0.08] bg-[#0c0d12]">
          <h2 className="text-lg font-semibold text-white mb-2 font-mono">1. Information We Collect</h2>
          <p>
            DeepLink Pro processes anonymized hardware signals and public network telemetry solely for link routing, bot fraud prevention, and performance attribution.
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-400 text-xs font-mono">
            <li>Public WAN IP address &amp; GeoIP city/country nodes</li>
            <li>Canvas 64-bit hardware hash &amp; WebGL GPU renderer string</li>
            <li>AudioContext oscillator frequency response hashes</li>
            <li>System font enumeration metrics</li>
          </ul>
        </section>

        <section className="p-5 rounded-xl border border-white/[0.08] bg-[#0c0d12]">
          <h2 className="text-lg font-semibold text-white mb-2 font-mono">2. Purpose of Processing</h2>
          <p>
            We process telemetry signals strictly to execute sub-20ms OS kernel app redirects, detect automated proxy click-spam networks, and auto-heal broken 404 destination links. We do NOT sell or share private user browsing histories with third-party data brokers.
          </p>
        </section>

        <section className="p-5 rounded-xl border border-white/[0.08] bg-[#0c0d12]">
          <h2 className="text-lg font-semibold text-white mb-2 font-mono">3. GDPR &amp; CCPA Rights</h2>
          <p>
            European Economic Area (EEA) and California residents have the right to request deletion of telemetry records associated with their IP address by contacting our compliance officer at <span className="text-emerald-400 font-mono">privacy@deeplink.pro</span>.
          </p>
        </section>
      </div>
    </div>
  );
}
