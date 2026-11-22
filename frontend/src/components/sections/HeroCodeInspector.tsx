"use client";

import { useState } from "react";
import { Terminal, Copy, Check, ArrowRight } from "lucide-react";

const codeExamples = {
  curlApi: `// 1. Create Smart Deep Link (POST /api/links)
curl -X POST https://deeplink.pro/api/links \\
  -H "Authorization: Bearer dlp_live_9f8a12b4c6e8" \\
  -H "Content-Type: application/json" \\
  -d '{
    "originalUrl": "https://youtube.com/watch?v=dQw4w9WgXcQ",
    "alias": "launch-promo",
    "expiresIn": "7d",
    "password": "optional_secure_gate"
  }'`,

  swiftIos: `// 2. iOS Native Swift SDK (Universal Link Auto-Resolution)
import DeepLinkPro

@main
struct MobileApp: App {
  var body: some Scene {
    WindowGroup {
      ContentView()
        .onOpenURL { url in
          DeepLinkPro.shared.resolve(url) { result in
            switch result {
            case .success(let target):
                print("Direct app navigation:", target.deepLinkScheme)
            case .failure(let error):
                print("Fallback execution:", error)
            }
          }
        }
    }
  }
}`,

  kotlinAndroid: `// 3. Android Kotlin Intent Resolver & Deferred Deep Link
import com.deeplinkpro.sdk.DeepLinkEngine

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        DeepLinkEngine.init(this, "dlp_live_9f8a12b4c6e8")
        DeepLinkEngine.fetchDeferredLink { linkData ->
            linkData?.let { data ->
                navigateToProduct(data.targetScheme, data.telemetryId)
            }
        }
    }
}`,

  telemetryPayload: `// 4. 108-Signal Zero-Cookie Telemetry Response (GET /api/telemetry-108)
{
  "status": "CAPTURED",
  "edgeLatencyMs": 14.2,
  "telemetry108": {
    "ip": "117.250.253.225",
    "country": "India",
    "gpuRenderer": "Apple M3 / NVIDIA RTX 4090",
    "canvasHash": "c_9f8a12b4",
    "rttLatencyMs": 18,
    "botScore": 0.0,
    "botLabel": "human"
  }
}`,

  nodeRest: `// 5. Node.js Enterprise Webhook & Analytics Event Stream
import { DeepLinkClient } from "@deeplinkpro/sdk";

const client = new DeepLinkClient({ apiKey: process.env.DEEPLINK_API_KEY });

const link = await client.links.create({
  originalUrl: "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT",
  alias: "playlist-drop"
});

console.log("Sub-20ms Smart Link Live:", link.shortUrl);`,
};

export function HeroCodeInspector() {
  const [activeTab, setActiveTab] = useState<"curlApi" | "swiftIos" | "kotlinAndroid" | "telemetryPayload" | "nodeRest">("curlApi");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(codeExamples[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto mt-16 rounded-2xl border border-white/[0.08] bg-[#0c0d12] overflow-hidden shadow-2xl text-left font-mono text-xs">
      
      {/* Vercel / GitHub Style Terminal Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-[#12131a] border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
            <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
            <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto">
            {[
              { id: "curlApi", label: "⚡ cURL REST API" },
              { id: "swiftIos", label: "🍎 iOS Swift SDK" },
              { id: "kotlinAndroid", label: "🤖 Android Kotlin" },
              { id: "telemetryPayload", label: "🔬 108-Signal JSON" },
              { id: "nodeRest", label: "🟢 Node.js SDK" },
            ].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1 rounded-lg transition-colors font-mono text-xs whitespace-nowrap ${
                  activeTab === tab.id ? "bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30" : "text-slate-400 hover:text-white"
                }`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 transition-colors self-end sm:self-auto">
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          <span>{copied ? "Copied" : "Copy Code"}</span>
        </button>
      </div>

      {/* Code Area */}
      <div className="p-5 overflow-x-auto bg-[#08090d] text-slate-200 leading-relaxed font-mono">
        <pre className="text-emerald-400/90">{codeExamples[activeTab]}</pre>
      </div>

      {/* Breakthrough Pipeline Footer */}
      <div className="flex items-center justify-between px-5 py-2.5 bg-[#101118] border-t border-white/[0.08] text-[11px] text-slate-400">
        <span className="flex items-center gap-2">
          <Terminal className="h-3.5 w-3.5 text-emerald-400" />
          <span>Native Pipeline: <strong className="text-white">Edge Resolution</strong> ──&gt; <strong className="text-white">Universal Links</strong> ──&gt; <strong className="text-white">108-Signal Telemetry</strong> ──&gt; <strong className="text-white">Zero Friction</strong></span>
        </span>
        <a href="/docs/sdks" className="text-emerald-400 hover:underline flex items-center gap-1">
          SDK Specs <ArrowRight className="h-3 w-3" />
        </a>
      </div>

    </div>
  );
}
