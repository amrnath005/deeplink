/**
 * DeepLink Pro — Smart Routing Subsystem Core Engine
 * Handles platform detection, webview context detection, scheme resolution,
 * parameter preservation, click ID generation, latency timing, and security checks.
 */

import { validateDestinationUrl, mergeQueryParams } from "./security";

export interface LinkRoutingInput {
  alias: string;
  originalUrl: string;
  targetScheme?: string;
  fallbackUrl?: string;
  isActive?: boolean;
  expiresAt?: string;
  password?: string;
}

export interface SmartRoutingResult {
  statusCode: 200 | 400 | 403 | 404 | 410;
  errorMessage?: string;
  clickId: string;
  latencyMs: number;
  platform: "iOS" | "Android" | "Desktop";
  context: "Instagram" | "TikTok" | "Facebook" | "Snapchat" | "LinkedIn" | "Native Browser";
  resolvedDestinationUrl: string;
  appScheme?: string;
  fallbackUrl?: string;
  preservedParamsCount: number;
}

export function parsePlatformAndContext(userAgent: string): {
  platform: "iOS" | "Android" | "Desktop";
  context: "Instagram" | "TikTok" | "Facebook" | "Snapchat" | "LinkedIn" | "Native Browser";
} {
  const ua = userAgent || "";
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isAndroid = /Android/i.test(ua);
  const platform = isIOS ? "iOS" : isAndroid ? "Android" : "Desktop";

  const isInstagram = /Instagram/i.test(ua);
  const isTikTok = /musical_ly|ByteLocale|TikTok/i.test(ua);
  const isFacebook = /FBAV|FBAN/i.test(ua);
  const isSnapchat = /Snapchat/i.test(ua);
  const isLinkedIn = /LinkedInApp/i.test(ua);

  const context = isInstagram
    ? "Instagram"
    : isTikTok
    ? "TikTok"
    : isFacebook
    ? "Facebook"
    : isSnapchat
    ? "Snapchat"
    : isLinkedIn
    ? "LinkedIn"
    : "Native Browser";

  return { platform, context };
}

export function computeSmartRouting(
  link: LinkRoutingInput | null,
  userAgent: string,
  incomingSearchParams: URLSearchParams,
  providedPassword?: string
): SmartRoutingResult {
  const startTime = Date.now();
  const clickId = "clk_" + Math.random().toString(36).substring(2, 10);
  const { platform, context } = parsePlatformAndContext(userAgent);

  // 1. Link Existence Check (404)
  if (!link) {
    return {
      statusCode: 404,
      errorMessage: "Smart link not found",
      clickId,
      latencyMs: Date.now() - startTime,
      platform,
      context,
      resolvedDestinationUrl: "",
      preservedParamsCount: 0
    };
  }

  // 2. Disabled Status Check (403)
  if (link.isActive === false) {
    return {
      statusCode: 403,
      errorMessage: "Smart link disabled",
      clickId,
      latencyMs: Date.now() - startTime,
      platform,
      context,
      resolvedDestinationUrl: "",
      preservedParamsCount: 0
    };
  }

  // 3. Expiration Check (410)
  if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
    return {
      statusCode: 410,
      errorMessage: `Smart link expired on ${new Date(link.expiresAt).toISOString()}`,
      clickId,
      latencyMs: Date.now() - startTime,
      platform,
      context,
      resolvedDestinationUrl: "",
      preservedParamsCount: 0
    };
  }

  // 4. Password Protection Check
  if (link.password && providedPassword !== link.password) {
    return {
      statusCode: 403,
      errorMessage: "Incorrect or missing password for protected link",
      clickId,
      latencyMs: Date.now() - startTime,
      platform,
      context,
      resolvedDestinationUrl: "",
      preservedParamsCount: 0
    };
  }

  // 5. Open Redirect Protection & Destination Security Validation
  const validation = validateDestinationUrl(link.originalUrl);
  if (!validation.isValid || !validation.sanitizedUrl) {
    return {
      statusCode: 400,
      errorMessage: validation.error || "Malicious or invalid destination URL",
      clickId,
      latencyMs: Date.now() - startTime,
      platform,
      context,
      resolvedDestinationUrl: "",
      preservedParamsCount: 0
    };
  }

  // 6. Campaign Parameter Preservation
  const finalWebDestination = mergeQueryParams(validation.sanitizedUrl, incomingSearchParams);
  const preservedCount = Array.from(incomingSearchParams.keys()).filter((k) => k !== "pwd").length;

  // 7. Platform & Scheme Resolution
  let appScheme: string | undefined = link.targetScheme;
  let fallbackUrl: string | undefined = link.fallbackUrl || finalWebDestination;

  try {
    const targetUrl = new URL(finalWebDestination);
    const host = targetUrl.hostname.toLowerCase();
    const pathname = targetUrl.pathname;
    const search = targetUrl.search;

    if (!appScheme) {
      if (host.includes("youtube.com") || host.includes("youtu.be")) {
        const videoId = host.includes("youtu.be") ? pathname.slice(1) : targetUrl.searchParams.get("v");
        if (videoId) {
          appScheme = platform === "iOS" ? `youtube://watch?v=${videoId}` : platform === "Android" ? `vnd.youtube:${videoId}` : `youtube://watch?v=${videoId}`;
        }
      } else if (host.includes("spotify.com")) {
        const pathParts = pathname.split("/").filter(Boolean);
        if (pathParts.length >= 2) {
          appScheme = `spotify:${pathParts[0]}:${pathParts[1]}`;
        }
      } else if (host.includes("t.me") || host.includes("telegram.org")) {
        const username = pathname.slice(1);
        if (username) appScheme = `tg://resolve?domain=${username}`;
      } else if (host.includes("wa.me") || host.includes("whatsapp.com")) {
        appScheme = `whatsapp://send${search}`;
      }
    }

    // Android Intent Launcher for Webview / Android App Links
    if (platform === "Android") {
      if (context !== "Native Browser") {
        appScheme = `intent://${targetUrl.host}${targetUrl.pathname}${targetUrl.search}#Intent;scheme=https;package=com.android.chrome;end;`;
      }
    }
  } catch {}

  const latencyMs = Date.now() - startTime;

  return {
    statusCode: 200,
    clickId,
    latencyMs,
    platform,
    context,
    resolvedDestinationUrl: finalWebDestination,
    appScheme,
    fallbackUrl,
    preservedParamsCount: preservedCount
  };
}
