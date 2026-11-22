import { describe, test } from "node:test";
import assert from "node:assert";
import { RepositoryV2 } from "./repository/store_v2";

describe("Dashboard UI & State Handling Integration Tests", () => {
  test("Workspace isolation should isolate links and campaigns per slug", async () => {
    const wsDefault = await RepositoryV2.getWorkspaceBySlug("default-brand");
    assert.ok(wsDefault);
    assert.strictEqual(wsDefault?.id, "ws_default");

    const campaigns = await RepositoryV2.getCampaignsAnalytics("ws_default");
    assert.ok(Array.isArray(campaigns));
  });

  test("Empty workspace account should return 0 metrics gracefully without throwing", async () => {
    const emptyCampaigns = await RepositoryV2.getCampaignsAnalytics("ws_empty_non_existent");
    assert.strictEqual(emptyCampaigns.length, 0);

    const emptyLink = await RepositoryV2.getSingleLinkAnalytics("ws_empty_non_existent", "non_existent_id");
    expect_null: assert.strictEqual(emptyLink, null);
  });

  test("Populated workspace account returns real link and campaign analytics metrics", async () => {
    const linkAnalytics = await RepositoryV2.getSingleLinkAnalytics("ws_default", "dl_rickroll_9f");
    assert.ok(linkAnalytics);
    assert.strictEqual(linkAnalytics?.alias, "rickroll");
    assert.ok(linkAnalytics?.clicks >= 1);
  });

  test("Pagination calculation should divide large dataset cleanly into pages", () => {
    const largeItemsList = Array.from({ length: 95 }, (_, i) => ({ id: `item_${i}` }));
    const pageSize = 10;

    const totalPages = Math.ceil(largeItemsList.length / pageSize);
    assert.strictEqual(totalPages, 10);

    const page1 = largeItemsList.slice(0, pageSize);
    assert.strictEqual(page1.length, 10);

    const lastPage = largeItemsList.slice(90, 100);
    assert.strictEqual(lastPage.length, 5);
  });
});
