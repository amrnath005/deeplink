import { describe, test } from "node:test";
import assert from "node:assert";
import { NextRequest } from "next/server";
import { getSessionUser, validateWorkspaceAccess } from "./auth";
import { checkRateLimit } from "./ratelimit";
import { validateEnvironmentVariables } from "./env";

describe("P0 Security & Multi-Tenant Remediation Test Suite", () => {
  // P0-1 — Real Authentication Tests
  test("P0-1: Valid token returns authenticated user session", async () => {
    const req = new NextRequest("http://localhost:3000/api/analytics/campaigns", {
      headers: { authorization: "Bearer session_ws_tenant_a" },
    });

    const session = await getSessionUser(req);
    assert.ok(session);
    assert.strictEqual(session.workspaceId, "ws_tenant_a");
  });

  test("P0-1: Missing session token returns null in non-development mode", async () => {
    const req = new NextRequest("http://localhost:3000/api/analytics/campaigns");
    const session = await getSessionUser(req);

    if (process.env.NODE_ENV !== "development") {
      assert.strictEqual(session, null);
    }
  });

  // P0-2 — Workspace Authorization Tests
  test("P0-2: User A attempting to access Workspace B via x-workspace-id header must be rejected with 403", async () => {
    const req = new NextRequest("http://localhost:3000/api/analytics/campaigns", {
      headers: {
        authorization: "Bearer session_ws_tenant_a",
        "x-workspace-id": "ws_tenant_b", // Cross-tenant spoof attempt
      },
    });

    const authRes = await validateWorkspaceAccess(req, "ws_tenant_b");
    assert.strictEqual(authRes.authorized, false);
    assert.strictEqual(authRes.statusCode, 403);
    assert.ok(authRes.errorMessage?.includes("not authorized"));
  });

  test("P0-2: User A accessing own Workspace A must be approved with 200", async () => {
    const req = new NextRequest("http://localhost:3000/api/analytics/campaigns", {
      headers: {
        authorization: "Bearer session_ws_tenant_a",
        "x-workspace-id": "ws_tenant_a",
      },
    });

    const authRes = await validateWorkspaceAccess(req, "ws_tenant_a");
    assert.strictEqual(authRes.authorized, true);
    assert.strictEqual(authRes.statusCode, 200);
  });

  // P0-4 — Production Rate Limiting Tests
  test("P0-4: Rate limiter enforces limit and blocks excessive requests", async () => {
    const key = `test_p0_ratelimit_${Date.now()}`;
    const limit = 5;

    for (let i = 0; i < limit; i++) {
      const res = await checkRateLimit(key, limit, 60000);
      assert.strictEqual(res.success, true);
    }

    // Next request must be blocked
    const overflowRes = await checkRateLimit(key, limit, 60000);
    assert.strictEqual(overflowRes.success, false);
    assert.strictEqual(overflowRes.remaining, 0);
  });

  // P0-5 — Environment Secrets Guard Tests
  test("P0-5: Client-side variables contain zero server secrets", () => {
    const envAudit = validateEnvironmentVariables();
    assert.strictEqual(envAudit.isConfigValid, true);
    assert.strictEqual(envAudit.errors.length, 0);
  });
});
