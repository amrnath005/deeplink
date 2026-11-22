import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "DeepLink Pro — Enterprise Smart Redirect Platform",
  description: "Sub-20ms edge-cached deep-link redirects into native iOS & Android apps. 108-signal telemetry, zero friction.",
  keywords: ["deeplink", "deferred deeplinking", "mobile app routing", "ios universal links", "android app links", "attribution MMP"],
  openGraph: {
    title: "DeepLink Pro — Enterprise Smart Redirect Platform",
    description: "Sub-20ms edge-cached deep-link redirects into native iOS & Android apps.",
    url: "https://deeplink.pro",
    siteName: "DeepLink Pro",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DeepLink Pro — Enterprise Smart Redirect Platform",
    description: "Sub-20ms edge-cached deep-link redirects into native iOS & Android apps.",
  },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#08090a" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark`} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-emerald-500/20 selection:text-white">
        {children}
      </body>
    </html>
  );
}
