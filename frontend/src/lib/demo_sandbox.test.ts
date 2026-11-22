import { describe, test } from "node:test";
import assert from "node:assert";
import {
  seedDemoWorkspace,
  resetDemoWorkspace,
  isDemoWorkspace,
  DEMO_WORKSPACE_ID,
} from "./demo_sandbox";
import { RepositoryV2 } from "./repository/store_v2";

describe("Demo Sandbox Environment & Isolation Test Suite", () => {
  test("isDemoWorkspace helper identifies demo workspace ID correctly", () => {
    assert.strictEqual(isDemoWorkspace(DEMO_WORKSPACE_ID), true);
    assert.strictEqual(isDemoWorkspace("ws_default"), false);
  });

  test("seedDemoWorkspace seeds demo workspace, campaigns, links, clicks, and conversions", async () => {
    const summary = await seedDemoWorkspace();
    assert.strictEqual(summary.workspaceId, DEMO_WORKSPACE_ID);
    assert.strictEqual(summary.isDemoIsolated, true);
    assert.ok(summary.campaignsCount >= 2);
    assert.ok(summary.linksCount >= 2);

    const demoCampaigns = await RepositoryV2.getCampaignsAnalytics(DEMO_WORKSPACE_ID);
    assert.ok(demoCampaigns.length >= 2);
  });

  test("Demo workspace data is completely isolated from ws_default workspace", async () => {
    const defaultCampaigns = await RepositoryV2.getCampaignsAnalytics("ws_default");
    const demoCampaigns = await RepositoryV2.getCampaignsAnalytics(DEMO_WORKSPACE_ID);

    // Ensure demo campaign IDs do not exist in ws_default
    const hasDemoInDefault = defaultCampaigns.some((c) => c.campaignId.includes("demo"));
    assert.strictEqual(hasDemoInDefault, false);
  });

  test("resetDemoWorkspace clears demo data and re-seeds cleanly", async () => {
    const summary = await resetDemoWorkspace();
    assert.strictEqual(summary.workspaceId, DEMO_WORKSPACE_ID);
    assert.ok(summary.clicksCount >= 3);
  });
});
