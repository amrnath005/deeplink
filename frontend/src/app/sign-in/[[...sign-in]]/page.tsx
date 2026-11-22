"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, Loader2, AlertCircle } from "lucide-react";
import { signInUserWithSupabase } from "@/lib/auth";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const session = await signInUserWithSupabase(email, password);
      const token = session?.access_token || `session_ws_${email.split("@")[0]}`;
      
      document.cookie = `sb-access-token=${token}; path=/; max-age=86400; SameSite=Lax`;
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid credentials or authentication failure.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090a] flex flex-col items-center justify-center px-4 font-sans">
      <div className="w-full max-w-md p-8 rounded-2xl border border-white/[0.08] bg-[#0c0d12] shadow-2xl text-center">
        <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
          <Lock className="h-6 w-6 text-emerald-400" />
        </div>
        <h1 className="text-2xl font-bold text-white font-mono mb-2">Sign In to DeepLink Pro</h1>
        <p className="text-xs text-slate-400 mb-6">Authenticated via Supabase Identity Provider.</p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left font-mono text-xs">
          <div>
            <label className="block text-slate-300 mb-1">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="developer@brand.com" 
              className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:border-emerald-500 text-xs" 
            />
          </div>
          <div>
            <label className="block text-slate-300 mb-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••" 
              className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:border-emerald-500 text-xs" 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold font-sans transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-xs"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In with Account"}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>Need an account?</span>
          <Link href="/sign-up" className="text-emerald-400 hover:underline">Create Account →</Link>
        </div>
      </div>

      <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-white mt-6 text-xs font-mono">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
      </Link>
    </div>
  );
}
