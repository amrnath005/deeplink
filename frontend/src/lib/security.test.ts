import { describe, test } from "node:test";
import assert from "node:assert";
import { RepositoryV2 } from "./repository/store_v2";
import { validateDestinationUrl } from "./security";
import { checkWorkspaceUsageLimit, SUBSCRIPTION_PLANS } from "./billing";

describe("Multi-Tenant SaaS Security & Authorization Test Suite", () => {
  test("Tenant A must never access Tenant B links, clicks, campaigns, or conversions", async () => {
    await RepositoryV2.recordClickWithTelemetry("ws_tenant_a", "link_a", "alias_a", { id: "clk_tenant_a_1" });
    await RepositoryV2.recordClickWithTelemetry("ws_tenant_b", "link_b", "alias_b", { id: "clk_tenant_b_1" });

    const tenantALink = await RepositoryV2.getSingleLinkAnalytics("ws_tenant_a", "link_b");
    assert.strictEqual(tenantALink, null);

    const tenantBLink = await RepositoryV2.getSingleLinkAnalytics("ws_tenant_b", "link_a");
    assert.strictEqual(tenantBLink, null);
  });

  test("Destinations using disallowed protocols (javascript:, data:, file:) must be rejected", () => {
    assert.strictEqual(validateDestinationUrl("javascript:alert(1)").isValid, false);
    assert.strictEqual(validateDestinationUrl("data:text/html,<script>alert(1)</script>").isValid, false);
    assert.strictEqual(validateDestinationUrl("file:///etc/passwd").isValid, false);
    assert.strictEqual(validateDestinationUrl("https://youtube.com").isValid, true);
  });

  test("Free tier account exceeding 1,000 monthly clicks must be flagged as limit exceeded", () => {
    const freeStatusUnder = checkWorkspaceUsageLimit("ws_free_1", "free", 500);
    assert.strictEqual(freeStatusUnder.isLimitExceeded, false);
    assert.strictEqual(freeStatusUnder.usagePercentage, 50);

    const freeStatusOver = checkWorkspaceUsageLimit("ws_free_1", "free", 1010);
    assert.strictEqual(freeStatusOver.isLimitExceeded, true);
    assert.strictEqual(freeStatusOver.usagePercentage, 101);
  });

  test("Subscription tiers must be configuration-driven and match Free/Pro/Business limits", () => {
    assert.strictEqual(SUBSCRIPTION_PLANS.free.monthlyClickLimit, 1000);
    assert.strictEqual(SUBSCRIPTION_PLANS.pro.monthlyClickLimit, 100000);
    assert.strictEqual(SUBSCRIPTION_PLANS.business.monthlyClickLimit, 1000000);
  });
});
