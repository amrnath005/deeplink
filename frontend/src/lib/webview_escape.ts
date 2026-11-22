/**
 * DeepLink Pro — In-App Browser Escape Engine
 * Detects Instagram, TikTok, Facebook, Snapchat, LinkedIn in-app webviews
 * and executes intent/scheme breakouts to force open native apps or Safari/Chrome.
 */

export interface WebviewEscapeResult {
  isInAppWebview: boolean;
  detectedApp?: "Instagram" | "TikTok" | "Facebook" | "Snapchat" | "LinkedIn" | "Other";
  escapeScheme?: string;
}

export function detectAndBuildEscapeScheme(urlStr: string, userAgent: string): WebviewEscapeResult {
  const ua = userAgent || "";
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isAndroid = /Android/i.test(ua);

  // In-App Browser UA Patterns
  const isInstagram = /Instagram/i.test(ua);
  const isTikTok = /musical_ly|ByteLocale|TikTok/i.test(ua);
  const isFacebook = /FBAV|FBAN/i.test(ua);
  const isSnapchat = /Snapchat/i.test(ua);
  const isLinkedIn = /LinkedInApp/i.test(ua);

  const isInAppWebview = isInstagram || isTikTok || isFacebook || isSnapchat || isLinkedIn;

  if (!isInAppWebview) {
    return { isInAppWebview: false };
  }

  const detectedApp = isInstagram
    ? "Instagram"
    : isTikTok
    ? "TikTok"
    : isFacebook
    ? "Facebook"
    : isSnapchat
    ? "Snapchat"
    : "LinkedIn";

  try {
    const targetUrl = new URL(urlStr);
    const host = targetUrl.hostname.toLowerCase();

    // Android Intent Escape: Forces Android Chrome or target native app directly
    if (isAndroid) {
      const intentScheme = `intent://${targetUrl.host}${targetUrl.pathname}${targetUrl.search}#Intent;scheme=https;package=com.android.chrome;end;`;
      return { isInAppWebview: true, detectedApp, escapeScheme: intentScheme };
    }

    // iOS Webview Breakout for YouTube / Spotify / Telegram / General URLs
    if (isIOS) {
      if (host.includes("youtube.com") || host.includes("youtu.be")) {
        const videoId = host.includes("youtu.be") ? targetUrl.pathname.slice(1) : targetUrl.searchParams.get("v");
        if (videoId) return { isInAppWebview: true, detectedApp, escapeScheme: `youtube://watch?v=${videoId}` };
      } else if (host.includes("spotify.com")) {
        const pathParts = targetUrl.pathname.split("/").filter(Boolean);
        if (pathParts.length >= 2) {
          return { isInAppWebview: true, detectedApp, escapeScheme: `spotify:${pathParts[0]}:${pathParts[1]}` };
        }
      } else if (host.includes("t.me") || host.includes("telegram.org")) {
        const username = targetUrl.pathname.slice(1);
        return { isInAppWebview: true, detectedApp, escapeScheme: `tg://resolve?domain=${username}` };
      }
    }
  } catch {}

  return { isInAppWebview: true, detectedApp };
}
