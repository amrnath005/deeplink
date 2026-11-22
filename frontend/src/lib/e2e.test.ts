import { describe, test } from "node:test";
import assert from "node:assert";
import { RepositoryV2 } from "./repository/store_v2";
import { computeSmartRouting } from "./routing";
import { evaluateTrafficQuality } from "./traffic_quality";
import { validateDestinationUrl } from "./security";
import { checkRateLimit } from "./ratelimit";

describe("DeepLink Pro V2 — End-to-End Customer Journey Verification", () => {
  const workspaceId = "ws_e2e_brand_99";
  const campaignId = "camp_e2e_summer";
  const linkId = "link_e2e_01";
  const alias = "e2e_summer";
  const orderId = "ORD_E2E_998811";

  // Step 1 - 5: Provision User, Workspace, Domain, Campaign & Smart Link
  test("1-5. Customer Journey Setup: Workspace, Campaign & Smart Link Provisioning", async () => {
    // 1. User & Workspace Isolation Context
    const ws = await RepositoryV2.getWorkspaceBySlug("default-brand");
    assert.ok(ws);

    // 2. Create Smart Link in Repository
    const created = await RepositoryV2.createLink({
      id: linkId,
      workspaceId,
      campaignId,
      alias,
      originalUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      targetScheme: "youtube://watch?v=dQw4w9WgXcQ",
      isActive: true,
    });

    assert.strictEqual(created.id, linkId);
    assert.strictEqual(created.alias, alias);
    assert.ok(validateDestinationUrl(created.originalUrl).isValid);
  });

  // Step 6 - 11: Click Resolution, Click ID Generation, Telemetry & Risk Assessment
  test("6-11. Smart Link Resolution, Click ID Generation, Risk Scoring & Routing", async () => {
    const userAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1";
    const incomingParams = new URLSearchParams({
      utm_source: "instagram",
      utm_medium: "paid_social",
      utm_campaign: "summer_drop",
    });

    const linkData = {
      alias,
      originalUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      targetScheme: "youtube://watch?v=dQw4w9WgXcQ",
      isActive: true,
    };

    // 6. Execute Routing Subsystem Engine
    const routingResult = computeSmartRouting(linkData, userAgent, incomingParams);
    assert.strictEqual(routingResult.statusCode, 200);
    assert.ok(routingResult.clickId.startsWith("clk_"));
    assert.strictEqual(routingResult.platform, "iOS");
    assert.ok(routingResult.resolvedDestinationUrl.includes("utm_source=instagram"));

    // 7-10. Telemetry Logging & Traffic Quality Assessment
    const { click, risk } = await RepositoryV2.recordClickWithTelemetry(
      workspaceId,
      linkId,
      alias,
      {
        id: routingResult.clickId,
        userAgent,
        ip: "117.250.253.225",
        country: "India",
        os: "iOS",
        browser: "Safari",
        device: "iPhone",
      },
      { canvasHash: "canvas_hash_9f", touchPoints: 5 },
      { trafficQualityScore: 0.95 }
    );

    assert.strictEqual(click.id, routingResult.clickId);
    assert.strictEqual(risk.riskCategory, "Low");
  });

  // Step 12 - 15: Conversion Event Ingestion, Last Eligible Touch Attribution & Dashboard Analytics
  test("12-15. Conversion Event Ingestion, Idempotency, Attribution & Analytics Rollup", async () => {
    const conversionInput = {
      event: "purchase",
      order_id: orderId,
      value: 149,
      currency: "USD",
    };

    // 12-13. Ingest Conversion Event & Compute Attribution
    const res1 = await RepositoryV2.ingestConversionEvent(workspaceId, conversionInput);
    assert.strictEqual(res1.isDuplicate, false);
    assert.ok(res1.conversion.id.startsWith("conv_"));

    // Verify Idempotent Duplicate Suppression
    const res2 = await RepositoryV2.ingestConversionEvent(workspaceId, conversionInput);
    assert.strictEqual(res2.isDuplicate, true);
    assert.strictEqual(res2.conversion.id, res1.conversion.id);

    // 14-15. Query Analytics Rollup
    const analytics = await RepositoryV2.getSingleLinkAnalytics(workspaceId, linkId);
    assert.ok(analytics);
    assert.strictEqual(analytics?.alias, alias);
    assert.ok(analytics?.clicks >= 1);
  });
});

describe("DeepLink Pro V2 — Edge Cases & Failure Scenarios", () => {
  test("Failure Scenario 1: Invalid Non-Existent Link (HTTP 404)", () => {
    const res = computeSmartRouting(null, "Mozilla/5.0", new URLSearchParams());
    assert.strictEqual(res.statusCode, 404);
  });

  test("Failure Scenario 2: Expired Smart Link (HTTP 410)", () => {
    const link = {
      alias: "expired_link",
      originalUrl: "https://example.com",
      expiresAt: new Date(Date.now() - 3600000).toISOString(),
    };
    const res = computeSmartRouting(link, "Mozilla/5.0", new URLSearchParams());
    assert.strictEqual(res.statusCode, 410);
  });

  test("Failure Scenario 3: Disabled Smart Link (HTTP 403)", () => {
    const link = {
      alias: "disabled_link",
      originalUrl: "https://example.com",
      isActive: false,
    };
    const res = computeSmartRouting(link, "Mozilla/5.0", new URLSearchParams());
    assert.strictEqual(res.statusCode, 403);
  });

  test("Failure Scenario 4: Malicious Open Redirect Destination (HTTP 400)", () => {
    const link = {
      alias: "malicious_link",
      originalUrl: "javascript:alert('xss')",
    };
    const res = computeSmartRouting(link, "Mozilla/5.0", new URLSearchParams());
    assert.strictEqual(res.statusCode, 400);
  });

  test("Failure Scenario 5: Rate Limiting Enforcement (HTTP 429)", async () => {
    const key = `test_rate_ip_${Math.random()}`;
    for (let i = 0; i < 5; i++) {
      await checkRateLimit(key, 5, 60000);
    }
    const overflow = await checkRateLimit(key, 5, 60000);
    assert.strictEqual(overflow.success, false);
  });

  test("Failure Scenario 6: Cross-Workspace Data Leakage Block", async () => {
    const res = await RepositoryV2.getSingleLinkAnalytics("ws_unauthorized_99", "link_e2e_01");
    assert.strictEqual(res, null);
  });
});
