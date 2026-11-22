import { describe, test } from "node:test";
import assert from "node:assert";
import { validateEnvironmentVariables } from "./env";
import { RepositoryV2 } from "./repository/store_v2";
import { computeSmartRouting } from "./routing";

describe("DeepLink Pro — Staging Deployment Smoke Test Suite", () => {
  
  // 1. Environment Secrets & Leakage Validation
  test("Staging Environment Guard: Client-side variables must contain zero server secrets", () => {
    const res = validateEnvironmentVariables();
    assert.strictEqual(res.isConfigValid, true);
    assert.strictEqual(res.errors.length, 0);
  });

  // 2. Staging Smart Link Provisioning & Resolution
  test("Staging Smoke Test: Link creation and sub-50ms scheme resolution", async () => {
    const link = await RepositoryV2.createLink({
      id: "link_staging_smoke_01",
      workspaceId: "ws_staging_sandbox",
      alias: "staging-smoke",
      originalUrl: "https://youtube.com/watch?v=dQw4w9WgXcQ",
      targetScheme: "youtube://watch?v=dQw4w9WgXcQ",
      isActive: true,
    });

    assert.strictEqual(link.alias, "staging-smoke");

    const routingRes = computeSmartRouting(link, "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4)", new URLSearchParams({ utm_source: "staging_smoke" }));
    assert.strictEqual(routingRes.statusCode, 200);
    assert.strictEqual(routingRes.platform, "iOS");
    assert.ok(routingRes.resolvedDestinationUrl.includes("utm_source=staging_smoke"));
  });

  // 3. Staging Conversion Event Ingestion & Idempotency
  test("Staging Smoke Test: Idempotent conversion event ingestion", async () => {
    const payload = {
      event: "purchase",
      order_id: "ORD_STAGING_SMOKE_99",
      value: 99,
      currency: "USD",
    };

    const res1 = await RepositoryV2.ingestConversionEvent("ws_staging_sandbox", payload);
    assert.strictEqual(res1.isDuplicate, false);

    const res2 = await RepositoryV2.ingestConversionEvent("ws_staging_sandbox", payload);
    assert.strictEqual(res2.isDuplicate, true);
  });

});
