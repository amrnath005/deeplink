"use client";

import { useState } from "react";
import { ArrowLeft, Smartphone, Copy, Check, Download, ShieldCheck, Code, Zap } from "lucide-react";

export default function SDKDocsPage() {
  const [copiedSwift, setCopiedSwift] = useState(false);
  const [copiedKotlin, setCopiedKotlin] = useState(false);

  const swiftCode = `// Configure DeepLink Pro SDK in AppDelegate.swift or App.swift
import DeepLinkSDK

@main
struct MyApp: App {
    init() {
        DeepLinkSDK.shared.configure(
            apiKey: "dlp_live_your_api_key",
            serverUrl: "https://api.deeplinkpro.com"
        )
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .onAppear {
                    DeepLinkSDK.shared.checkDeferredDeepLink { params, error in
                        if let params = params {
                            print("Received deferred link params: \\(params)")
                        }
                    }
                }
        }
    }
}`;

  const kotlinCode = `// Configure DeepLink Pro SDK in MainActivity.kt or Application Class
import com.deeplinkpro.sdk.DeepLinkSDK

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        DeepLinkSDK.instance.configure(
            apiKey = "dlp_live_your_api_key",
            serverUrl = "https://api.deeplinkpro.com"
        )

        DeepLinkSDK.instance.checkDeferredDeepLink(this) { json ->
            if (json != null) {
                val targetUrl = json.optString("original_url")
                Log.d("DeepLinkSDK", "Matched Deferred Deep Link: $targetUrl")
            }
        }
    }
}`;

  return (
    <div className="min-h-screen bg-background text-foreground py-10 px-6 lg:px-12">
      <header className="mx-auto max-w-5xl mb-10 pb-6 border-b border-border">
        <div className="flex items-center gap-3 mb-2">
          <a href="/" className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface hover:bg-surface-elevated transition-colors text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </a>
          <h1 className="text-3xl font-bold tracking-tight">Native Mobile SDKs (iOS & Android)</h1>
        </div>
        <p className="text-sm text-muted-foreground">Mobile Measurement Partner (MMP) & Deferred Deep Linking integration guides</p>
      </header>

      <main className="mx-auto max-w-5xl space-y-10">
        {/* iOS Swift SDK */}
        <section className="glass rounded-3xl p-8 border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                <Smartphone className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="text-xl font-bold">iOS Native Swift SDK (`DeepLinkSDK.swift`)</h3>
                <p className="text-xs text-muted-foreground">Deferred Deep Link matching & post-install parameter retrieval</p>
              </div>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(swiftCode); setCopiedSwift(true); setTimeout(() => setCopiedSwift(false), 2000); }}
              className="flex items-center gap-2 h-10 px-4 rounded-xl border border-border bg-surface hover:bg-surface-elevated text-xs font-semibold transition-colors">
              {copiedSwift ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />} Copy Swift Code
            </button>
          </div>
          <pre className="p-4 rounded-2xl bg-black/80 border border-border text-xs font-mono text-emerald-400 overflow-x-auto">
            {swiftCode}
          </pre>
        </section>

        {/* Android Kotlin SDK */}
        <section className="glass rounded-3xl p-8 border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                <Code className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Android Native Kotlin SDK (`DeepLinkSDK.kt`)</h3>
                <p className="text-xs text-muted-foreground">Google Play Install Referrer & Android Deferred Deep Link matching</p>
              </div>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(kotlinCode); setCopiedKotlin(true); setTimeout(() => setCopiedKotlin(false), 2000); }}
              className="flex items-center gap-2 h-10 px-4 rounded-xl border border-border bg-surface hover:bg-surface-elevated text-xs font-semibold transition-colors">
              {copiedKotlin ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />} Copy Kotlin Code
            </button>
          </div>
          <pre className="p-4 rounded-2xl bg-black/80 border border-border text-xs font-mono text-blue-400 overflow-x-auto">
            {kotlinCode}
          </pre>
        </section>
      </main>
    </div>
  );
}
