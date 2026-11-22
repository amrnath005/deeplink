import { describe, test } from "node:test";
import assert from "node:assert";
import { computeSmartRouting } from "./routing";

describe("Smart Routing Subsystem Integration Tests", () => {
  const sampleLink = {
    alias: "summer_sale",
    originalUrl: "https://youtube.com/watch?v=dQw4w9WgXcQ",
    targetScheme: undefined,
    isActive: true,
  };

  test("iOS Safari user agent should resolve platform=iOS and context=Native Browser", () => {
    const iosUA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1";
    const res = computeSmartRouting(sampleLink, iosUA, new URLSearchParams());

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.platform, "iOS");
    assert.strictEqual(res.context, "Native Browser");
    assert.strictEqual(res.appScheme, "youtube://watch?v=dQw4w9WgXcQ");
    assert.ok(res.clickId);
  });

  test("Android Chrome user agent should resolve platform=Android and context=Native Browser", () => {
    const androidUA = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/124.0.0.0 Mobile Safari/537.36";
    const res = computeSmartRouting(sampleLink, androidUA, new URLSearchParams());

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.platform, "Android");
    assert.strictEqual(res.context, "Native Browser");
    assert.strictEqual(res.appScheme, "vnd.youtube:dQw4w9WgXcQ");
  });

  test("Desktop Chrome user agent should resolve platform=Desktop and web destination", () => {
    const desktopChromeUA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36";
    const res = computeSmartRouting(sampleLink, desktopChromeUA, new URLSearchParams());

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.platform, "Desktop");
    assert.strictEqual(res.context, "Native Browser");
    assert.strictEqual(res.resolvedDestinationUrl, "https://youtube.com/watch?v=dQw4w9WgXcQ");
  });

  test("Invalid null link should return 404 status code", () => {
    const res = computeSmartRouting(null, "Mozilla/5.0", new URLSearchParams());
    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.errorMessage, "Smart link not found");
  });

  test("Expired link should return 410 status code", () => {
    const expiredLink = {
      ...sampleLink,
      expiresAt: new Date(Date.now() - 3600000).toISOString(),
    };
    const res = computeSmartRouting(expiredLink, "Mozilla/5.0", new URLSearchParams());
    assert.strictEqual(res.statusCode, 410);
    assert.ok(res.errorMessage?.includes("Smart link expired"));
  });

  test("Disabled link should return 403 status code", () => {
    const disabledLink = { ...sampleLink, isActive: false };
    const res = computeSmartRouting(disabledLink, "Mozilla/5.0", new URLSearchParams());
    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.errorMessage, "Smart link disabled");
  });

  test("Malicious destination URL (javascript:alert(1)) should return 400 Bad Request", () => {
    const maliciousLink = { ...sampleLink, originalUrl: "javascript:alert('xss')" };
    const res = computeSmartRouting(maliciousLink, "Mozilla/5.0", new URLSearchParams());
    assert.strictEqual(res.statusCode, 400);
    assert.ok(res.errorMessage?.includes("disallowed"));
  });

  test("Incoming query parameters (utm_source, utm_campaign, ref) must survive routing", () => {
    const params = new URLSearchParams({
      utm_source: "instagram",
      utm_medium: "paid_social",
      utm_campaign: "summer_drop",
      ref: "creator_99",
    });

    const res = computeSmartRouting(sampleLink, "Mozilla/5.0", params);
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.resolvedDestinationUrl.includes("utm_source=instagram"));
    assert.ok(res.resolvedDestinationUrl.includes("utm_medium=paid_social"));
    assert.ok(res.resolvedDestinationUrl.includes("utm_campaign=summer_drop"));
    assert.ok(res.resolvedDestinationUrl.includes("ref=creator_99"));
    assert.strictEqual(res.preservedParamsCount, 4);
  });
});
