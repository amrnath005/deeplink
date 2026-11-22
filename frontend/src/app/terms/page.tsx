import Link from "next/link";
import { Scale, ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#08090a] text-slate-200 px-6 py-12 max-w-4xl mx-auto font-sans leading-relaxed">
      <Link href="/" className="inline-flex items-center gap-2 text-emerald-400 hover:underline mb-8 text-sm font-mono">
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>

      <div className="flex items-center gap-3 mb-6 border-b border-white/[0.08] pb-6">
        <Scale className="h-8 w-8 text-emerald-400" />
        <h1 className="text-3xl font-bold tracking-tight text-white font-mono">Terms of Service</h1>
      </div>

      <div className="space-y-6 text-sm text-slate-300">
        <p className="text-xs text-slate-500 font-mono">Effective Date: August 8, 2026 | Version 1.0</p>

        <section className="p-5 rounded-xl border border-white/[0.08] bg-[#0c0d12]">
          <h2 className="text-lg font-semibold text-white mb-2 font-mono">1. Acceptance of Terms</h2>
          <p>
            By accessing or using DeepLink Pro (`deeplink.pro`), you agree to be bound by these Terms of Service. If you do not agree, do not use the service.
          </p>
        </section>

        <section className="p-5 rounded-xl border border-white/[0.08] bg-[#0c0d12]">
          <h2 className="text-lg font-semibold text-white mb-2 font-mono">2. Prohibited Uses</h2>
          <p>
            You agree NOT to use DeepLink Pro to shorten URLs directing to malware, phishing sites, illegal content, or unauthorized automated spam networks. We reserve the right to immediately terminate accounts violating these rules.
          </p>
        </section>

        <section className="p-5 rounded-xl border border-white/[0.08] bg-[#0c0d12]">
          <h2 className="text-lg font-semibold text-white mb-2 font-mono">3. DMCA &amp; Abuse Reporting</h2>
          <p>
            To report copyright infringement or abusive links, submit a notice to <span className="text-emerald-400 font-mono">abuse@deeplink.pro</span>.
          </p>
        </section>
      </div>
    </div>
  );
}
