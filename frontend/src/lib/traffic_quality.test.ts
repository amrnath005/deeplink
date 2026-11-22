import { describe, test } from "node:test";
import assert from "node:assert";
import { evaluateTrafficQuality } from "./traffic_quality";

describe("Traffic Quality Subsystem Scoring Engine Tests", () => {
  test("Verified human browser should be classified as low_risk", () => {
    const res = evaluateTrafficQuality({
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/605.1.15 Safari/605.1.15",
      headers: {
        "accept-language": "en-US,en;q=0.9",
        accept: "text/html,application/xhtml+xml",
      },
      requestRatePerMin: 5,
      webdriverActive: false,
      viewportWidth: 1440,
      screenWidth: 1440,
    });

    assert.strictEqual(res.classification, "low_risk");
    assert.ok(res.score < 0.4);
    assert.ok(res.confidence >= 0.8);
    assert.strictEqual(res.reasons.length, 0);
    assert.strictEqual(res.recommended_action, "log_only");
  });

  test("Verified Googlebot crawler should trigger allowlist safeguard and return low_risk", () => {
    const res = evaluateTrafficQuality({
      userAgent: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    });

    assert.strictEqual(res.classification, "low_risk");
    assert.strictEqual(res.score, 0.05);
    assert.ok(res.reasons.includes("verified_search_crawler"));
    assert.strictEqual(res.recommended_action, "log_only");
  });

  test("Proxy headers and abnormal request rate should be classified as suspicious when standard headers are present", () => {
    const res = evaluateTrafficQuality({
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0",
      headers: {
        via: "1.1 squid-proxy",
        "accept-language": "en-US,en;q=0.9",
        accept: "text/html",
      },
      requestRatePerMin: 120,
    });

    assert.strictEqual(res.classification, "suspicious");
    assert.ok(res.score >= 0.4 && res.score < 0.7);
    assert.ok(res.reasons.includes("proxy_or_vpn"));
    assert.ok(res.reasons.includes("abnormal_request_rate"));
  });

  test("Headless automation bot should be classified as high_risk", () => {
    const res = evaluateTrafficQuality({
      userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 HeadlessChrome/124.0.0.0",
      webdriverActive: true,
      headlessDetected: true,
      requestRatePerMin: 350,
      viewportWidth: 0,
      viewportHeight: 0,
    });

    assert.strictEqual(res.classification, "high_risk");
    assert.ok(res.score >= 0.7);
    assert.ok(res.reasons.includes("automation_signature"));
    assert.ok(res.reasons.includes("abnormal_request_rate"));
    assert.strictEqual(res.recommended_action, "suppress_attribution_pixel");
  });

  test("Custom thresholds and actions should be respected", () => {
    const res = evaluateTrafficQuality(
      {
        userAgent: "Mozilla/5.0 (X11; Linux x86_64) HeadlessChrome/124.0.0.0",
        webdriverActive: true,
      },
      {
        lowRiskThreshold: 0.2,
        suspiciousThreshold: 0.5,
        actionOnHighRisk: "block_redirect",
      }
    );

    assert.strictEqual(res.classification, "high_risk");
    assert.strictEqual(res.recommended_action, "block_redirect");
  });
});
