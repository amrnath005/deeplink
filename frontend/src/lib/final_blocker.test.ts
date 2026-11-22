import { describe, test } from "node:test";
import assert from "node:assert";
import { NextRequest } from "next/server";
import { getSessionUser } from "./auth";

describe("Final P0 Security Blocker Remediation Test Suite", () => {
  // BLOCKER 1 — Authentication & Token Isolation
  test("Auth: Valid token in dev environment returns session", async () => {
    const req = new NextRequest("http://localhost:3000/api/analytics/campaigns", {
      headers: { authorization: "Bearer session_ws_tenant_dev" },
    });

    const session = await getSessionUser(req);
    assert.ok(session);
    assert.strictEqual(session.workspaceId, "ws_tenant_dev");
  });

  test("Auth Isolation: Crafted session_ws_* token in STAGING environment MUST FAIL (return null)", async () => {
    const originalEnv = process.env.NODE_ENV;
    try {
      (process.env as any).NODE_ENV = "staging";

      const req = new NextRequest("http://localhost:3000/api/analytics/campaigns", {
        headers: { authorization: "Bearer session_ws_fake_token" },
      });

      const session = await getSessionUser(req);
      assert.strictEqual(session, null); // MUST FAIL
    } finally {
      (process.env as any).NODE_ENV = originalEnv;
    }
  });

  test("Auth Isolation: Crafted session_ws_* token in PRODUCTION environment MUST FAIL (return null)", async () => {
    const originalEnv = process.env.NODE_ENV;
    try {
      (process.env as any).NODE_ENV = "production";

      const req = new NextRequest("http://localhost:3000/api/analytics/campaigns", {
        headers: { authorization: "Bearer session_ws_hacker_token" },
      });

      const session = await getSessionUser(req);
      assert.strictEqual(session, null); // MUST FAIL
    } finally {
      (process.env as any).NODE_ENV = originalEnv;
    }
  });

  // BLOCKER 2 — Stripe Webhook Fail-Closed Behavior
  test("Stripe Webhook Isolation: Missing signature in STAGING environment MUST FAIL", async () => {
    const req = new NextRequest("http://localhost:3000/api/stripe/webhook", {
      method: "POST",
      body: JSON.stringify({ id: "evt_test_123", type: "customer.subscription.created" }),
    });

    const originalEnv = process.env.NODE_ENV;
    try {
      (process.env as any).NODE_ENV = "staging";
      process.env.STRIPE_WEBHOOK_SECRET = "whsec_staging_test_secret";

      const routeModule = await import("../app/api/stripe/webhook/route");
      const res = await routeModule.POST(req as any);
      assert.strictEqual(res.status, 400);

      const json = await res.json();
      assert.ok(json.error.includes("Signature Failure"));
    } finally {
      (process.env as any).NODE_ENV = originalEnv;
    }
  });

  test("Stripe Webhook Isolation: Missing secret in PRODUCTION environment MUST FAIL", async () => {
    const req = new NextRequest("http://localhost:3000/api/stripe/webhook", {
      method: "POST",
      headers: { "stripe-signature": "t=123,v1=fakesig" },
      body: JSON.stringify({ id: "evt_test_123" }),
    });

    const originalEnv = process.env.NODE_ENV;
    const originalSecret = process.env.STRIPE_WEBHOOK_SECRET;
    try {
      (process.env as any).NODE_ENV = "production";
      delete process.env.STRIPE_WEBHOOK_SECRET;

      const routeModule = await import("../app/api/stripe/webhook/route");
      const res = await routeModule.POST(req as any);
      assert.strictEqual(res.status, 500);

      const json = await res.json();
      assert.ok(json.error.includes("STRIPE_WEBHOOK_SECRET is required"));
    } finally {
      (process.env as any).NODE_ENV = originalEnv;
      process.env.STRIPE_WEBHOOK_SECRET = originalSecret;
    }
  });
});
