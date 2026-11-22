/**
 * DeepLink Pro — Redirect Security & Open Redirect Protection
 * Ensures no arbitrary external redirects or malicious script injection protocols can be executed.
 */

const ALLOWED_PROTOCOLS = new Set([
  "http:",
  "https:",
  "mailto:",
  "tel:",
  "vnd.youtube:",
  "youtube:",
  "spotify:",
  "tg:",
  "instagram:",
  "twitter:",
  "whatsapp:"
]);

export interface URLValidationResult {
  isValid: boolean;
  sanitizedUrl?: string;
  error?: string;
}

export function validateDestinationUrl(urlStr: string): URLValidationResult {
  if (!urlStr || typeof urlStr !== "string") {
    return { isValid: false, error: "Destination URL is required" };
  }

  let cleanUrl = urlStr.trim();
  
  // Auto-prefix http if missing scheme
  if (!/^([a-z0-9+\-.]+):/i.test(cleanUrl)) {
    cleanUrl = `https://${cleanUrl}`;
  }

  try {
    const parsed = new URL(cleanUrl);

    // Block dangerous protocols like javascript:, data:, vbscript:, file:
    if (!ALLOWED_PROTOCOLS.has(parsed.protocol.toLowerCase())) {
      return {
        isValid: false,
        error: `Protocol '${parsed.protocol}' is disallowed for security reasons`
      };
    }

    // Block localhost / IP loopback exploitation if in production
    const host = parsed.hostname.toLowerCase();
    if (process.env.NODE_ENV === "production") {
      if (host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0" || host === "::1") {
        return { isValid: false, error: "Loopback IP addresses are disallowed" };
      }
    }

    return { isValid: true, sanitizedUrl: parsed.toString() };
  } catch {
    return { isValid: false, error: "Invalid URL syntax" };
  }
}

/**
 * Merge query parameters from incoming shortlink request onto target destination URL.
 * Preserves all utm_*, ref, sub_id, and custom tracking parameters.
 */
export function mergeQueryParams(targetUrlStr: string, incomingParams: URLSearchParams): string {
  try {
    const targetUrl = new URL(targetUrlStr);
    
    incomingParams.forEach((value, key) => {
      // Do not overwrite internal shortlink keys like pwd
      if (key !== "pwd") {
        targetUrl.searchParams.set(key, value);
      }
    });

    return targetUrl.toString();
  } catch {
    return targetUrlStr;
  }
}
