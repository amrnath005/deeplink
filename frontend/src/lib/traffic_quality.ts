/**
 * DeepLink Pro — Traffic Quality Subsystem Core Engine
 * Data Minimization & Privacy-Aware Risk Scoring Model
 * Evaluates audited signals, calculates confidence, returns classification & reason codes.
 */

export type TrafficRiskClassification = "low_risk" | "suspicious" | "high_risk";
export type RecommendedAction = "log_only" | "suppress_attribution_pixel" | "block_redirect";

export interface TrafficSignalInput {
  userAgent?: string;
  ip?: string;
  headers?: Record<string, string | undefined>;
  requestRatePerMin?: number;
  webdriverActive?: boolean;
  headlessDetected?: boolean;
  canvasHash?: string;
  viewportWidth?: number;
  viewportHeight?: number;
  screenWidth?: number;
  screenHeight?: number;
}

export interface TrafficQualityConfig {
  lowRiskThreshold: number; // Default 0.40
  suspiciousThreshold: number; // Default 0.70
  allowVerifiedCrawlers: boolean; // Safeguard for Googlebot/Bingbot
  defaultAction: RecommendedAction;
  actionOnHighRisk: RecommendedAction;
  weights: Record<string, number>;
}

export const DEFAULT_TRAFFIC_CONFIG: TrafficQualityConfig = {
  lowRiskThreshold: 0.40,
  suspiciousThreshold: 0.70,
  allowVerifiedCrawlers: true,
  defaultAction: "log_only",
  actionOnHighRisk: "suppress_attribution_pixel",
  weights: {
    automation_signature: 0.45,
    headless_browser: 0.35,
    known_crawler: 0.30,
    abnormal_request_rate: 0.35,
    proxy_or_vpn: 0.25,
    header_inconsistency: 0.15,
    screen_geometry_anomaly: 0.15,
  },
};

export interface TrafficQualityResult {
  score: number; // 0.00 (Human) to 1.00 (High Risk)
  classification: TrafficRiskClassification;
  confidence: number; // 0.00 to 1.00
  reasons: string[];
  recommended_action: RecommendedAction;
}

export function evaluateTrafficQuality(
  input: TrafficSignalInput,
  customConfig?: Partial<TrafficQualityConfig>
): TrafficQualityResult {
  const config: TrafficQualityConfig = { ...DEFAULT_TRAFFIC_CONFIG, ...customConfig };
  const ua = input.userAgent || "";
  const reasons: string[] = [];
  let evaluatedSignalCount = 0;
  const totalAuditedSignals = 7;

  // 1. Check Verified Crawlers (Googlebot, Bingbot)
  const isVerifiedCrawler = /Googlebot|bingbot|DuckDuckBot|Baiduspider|YandexBot/i.test(ua);
  if (isVerifiedCrawler) {
    evaluatedSignalCount += 1;
    if (config.allowVerifiedCrawlers) {
      return {
        score: 0.05,
        classification: "low_risk",
        confidence: 0.95,
        reasons: ["verified_search_crawler"],
        recommended_action: "log_only",
      };
    } else {
      reasons.push("known_crawler");
    }
  }

  // 2. Automation Signature Check (webdriver, puppeteer, selenium)
  evaluatedSignalCount += 1;
  const isAutomation =
    input.webdriverActive ||
    /HeadlessChrome|Puppeteer|Selenium|PhantomJS|Nightmare/i.test(ua);
  if (isAutomation) {
    reasons.push("automation_signature");
  }

  // 3. Headless Browser Check
  evaluatedSignalCount += 1;
  const isHeadless =
    input.headlessDetected ||
    /HeadlessChrome/i.test(ua) ||
    (input.viewportWidth === 0 && input.viewportHeight === 0);
  if (isHeadless && !reasons.includes("automation_signature")) {
    reasons.push("headless_browser");
  }

  // 4. Abnormal Request Rate Check (> 100 req/min)
  evaluatedSignalCount += 1;
  if (input.requestRatePerMin && input.requestRatePerMin > 100) {
    reasons.push("abnormal_request_rate");
  }

  // 5. Proxy / VPN Header Check
  evaluatedSignalCount += 1;
  const headers = input.headers || {};
  const hasProxyHeaders = Boolean(
    headers["via"] ||
      headers["x-proxy-id"] ||
      headers["x-tor-exit-node"] ||
      headers["forwarded"]
  );
  if (hasProxyHeaders) {
    reasons.push("proxy_or_vpn");
  }

  // 6. Header Inconsistency Check (Missing Accept-Language or Accept)
  evaluatedSignalCount += 1;
  const hasAcceptLang = Boolean(headers["accept-language"] || headers["Accept-Language"]);
  const hasAccept = Boolean(headers["accept"] || headers["Accept"]);
  if (!hasAcceptLang && !hasAccept && ua.length > 0) {
    reasons.push("header_inconsistency");
  }

  // 7. Screen Geometry Anomaly
  evaluatedSignalCount += 1;
  if (
    input.screenWidth !== undefined &&
    input.viewportWidth !== undefined &&
    (input.screenWidth === 0 || input.viewportWidth > input.screenWidth + 50)
  ) {
    reasons.push("screen_geometry_anomaly");
  }

  // Calculate Weighted Risk Score
  let rawScore = 0;
  reasons.forEach((reason) => {
    rawScore += config.weights[reason] || 0.15;
  });

  const score = Math.min(Math.max(Math.round(rawScore * 100) / 100, 0.0), 1.0);
  const confidence = Math.round((evaluatedSignalCount / totalAuditedSignals) * 100) / 100;

  // Determine Classification
  let classification: TrafficRiskClassification = "low_risk";
  if (score >= config.suspiciousThreshold) {
    classification = "high_risk";
  } else if (score >= config.lowRiskThreshold) {
    classification = "suspicious";
  }

  // Determine Recommended Action (Never automatically block purely on score > 0.65 unless configured)
  const recommended_action: RecommendedAction =
    classification === "high_risk" ? config.actionOnHighRisk : config.defaultAction;

  return {
    score,
    classification,
    confidence,
    reasons,
    recommended_action,
  };
}
