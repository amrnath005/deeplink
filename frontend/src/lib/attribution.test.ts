import { describe, test } from "node:test";
import assert from "node:assert";
import {
  computeLastEligibleTouchAttribution,
  normalizeCurrencyToUsd,
} from "./attribution";
import { Click, ConversionEvent, Link, RiskAssessment } from "./repository/entities";
import { RepositoryV2 } from "./repository/store_v2";

describe("Campaign Attribution Subsystem Test Suite", () => {
  test("normalizeCurrencyToUsd should correctly convert INR and EUR to USD", () => {
    assert.strictEqual(normalizeCurrencyToUsd(100, "USD"), 100);
    assert.strictEqual(normalizeCurrencyToUsd(1000, "INR"), 12.0);
    assert.strictEqual(normalizeCurrencyToUsd(100, "EUR"), 109);
  });

  test("Duplicate purchase order_id must be suppressed idempotently", async () => {
    const payload = {
      event: "purchase",
      order_id: "ORD_IDEM_9901",
      value: 2499,
      currency: "INR",
    };

    const res1 = await RepositoryV2.ingestConversionEvent("ws_attr_test", payload);
    assert.strictEqual(res1.isDuplicate, false);

    const res2 = await RepositoryV2.ingestConversionEvent("ws_attr_test", payload);
    assert.strictEqual(res2.isDuplicate, true);
    assert.strictEqual(res2.conversion.id, res1.conversion.id);
  });

  test("Last Eligible Touch should match recent non-high-risk click within 30 days", () => {
    const now = Date.now();
    const clicks: Click[] = [
      {
        id: "clk_old",
        workspaceId: "ws_demo",
        linkId: "link_summer",
        alias: "summer",
        ip: "127.0.0.1",
        country: "India",
        os: "iOS",
        browser: "Mobile Safari",
        device: "iPhone",
        timestamp: new Date(now - 1000 * 60 * 60 * 24 * 5).toISOString(),
      },
      {
        id: "clk_recent",
        workspaceId: "ws_demo",
        linkId: "link_summer",
        alias: "summer",
        ip: "127.0.0.1",
        country: "India",
        os: "iOS",
        browser: "Mobile Safari",
        device: "iPhone",
        timestamp: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
      },
    ];

    const conversion: ConversionEvent = {
      id: "conv_p1",
      workspaceId: "ws_demo",
      linkId: "link_summer",
      eventName: "purchase",
      orderId: "ORD_P1",
      value: 100,
      currency: "USD",
      idempotencyKey: "idem_ws_demo_ord_p1_purchase",
      timestamp: new Date(now).toISOString(),
    };

    const riskMap = new Map<string, RiskAssessment>();
    const linksMap = new Map<string, Link>([
      ["link_summer", { id: "link_summer", workspaceId: "ws_demo", campaignId: "camp_s2026", alias: "summer", originalUrl: "https://example.com", shortUrl: "/summer", isActive: true, createdAt: new Date().toISOString() }],
    ]);

    const attribution = computeLastEligibleTouchAttribution(conversion, clicks, riskMap, linksMap);
    assert.ok(attribution);
    assert.strictEqual(attribution?.clickId, "clk_recent");
    assert.strictEqual(attribution?.campaignId, "camp_s2026");
    assert.strictEqual(attribution?.attributedRevenue, 100);
  });

  test("Missing click_id should gracefully match to most recent eligible click", () => {
    const now = Date.now();
    const clicks: Click[] = [
      {
        id: "clk_fallback",
        workspaceId: "ws_demo",
        linkId: "link_sale",
        alias: "sale",
        ip: "127.0.0.1",
        country: "India",
        os: "Android",
        browser: "Chrome",
        device: "Android Phone",
        timestamp: new Date(now - 1000 * 60 * 30).toISOString(),
      },
    ];

    const conversion: ConversionEvent = {
      id: "conv_no_click",
      workspaceId: "ws_demo",
      eventName: "signup",
      value: 0,
      currency: "USD",
      idempotencyKey: "idem_ws_demo_signup_123",
      timestamp: new Date(now).toISOString(),
    };

    const attribution = computeLastEligibleTouchAttribution(conversion, clicks, new Map(), new Map());
    assert.ok(attribution);
    assert.strictEqual(attribution?.clickId, "clk_fallback");
  });

  test("Expired click outside 30-day attribution window should not be attributed", () => {
    const now = Date.now();
    const oldClick: Click[] = [
      {
        id: "clk_expired_35d",
        workspaceId: "ws_demo",
        linkId: "link_old",
        alias: "old",
        ip: "127.0.0.1",
        country: "India",
        os: "Desktop",
        browser: "Chrome",
        device: "Desktop",
        timestamp: new Date(now - 1000 * 60 * 60 * 24 * 35).toISOString(),
      },
    ];

    const conversion: ConversionEvent = {
      id: "conv_late",
      workspaceId: "ws_demo",
      eventName: "purchase",
      orderId: "ORD_LATE",
      value: 500,
      currency: "USD",
      idempotencyKey: "idem_ws_demo_ord_late_purchase",
      timestamp: new Date(now).toISOString(),
    };

    const attribution = computeLastEligibleTouchAttribution(conversion, oldClick, new Map(), new Map());
    assert.strictEqual(attribution, null);
  });

  test("High Risk suspicious click must be skipped in Last Eligible Touch", () => {
    const now = Date.now();
    const clicks: Click[] = [
      {
        id: "clk_bot",
        workspaceId: "ws_demo",
        linkId: "link_target",
        alias: "target",
        ip: "10.0.0.1",
        country: "US",
        os: "Linux",
        browser: "HeadlessChrome",
        device: "Desktop",
        timestamp: new Date(now - 1000 * 60 * 5).toISOString(),
      },
      {
        id: "clk_human_earlier",
        workspaceId: "ws_demo",
        linkId: "link_target",
        alias: "target",
        ip: "117.250.253.225",
        country: "India",
        os: "iOS",
        browser: "Mobile Safari",
        device: "iPhone",
        timestamp: new Date(now - 1000 * 60 * 60).toISOString(),
      },
    ];

    const riskMap = new Map<string, RiskAssessment>([
      ["clk_bot", { id: "risk_bot", clickId: "clk_bot", trafficQualityScore: 0.1, riskCategory: "High", suspiciousSignals: ["automation_signature"], createdAt: new Date(now).toISOString() }],
      ["clk_human_earlier", { id: "risk_human", clickId: "clk_human_earlier", trafficQualityScore: 0.95, riskCategory: "Low", suspiciousSignals: [], createdAt: new Date(now).toISOString() }],
    ]);

    const conversion: ConversionEvent = {
      id: "conv_clean",
      workspaceId: "ws_demo",
      linkId: "link_target",
      eventName: "purchase",
      orderId: "ORD_CLEAN",
      value: 75,
      currency: "USD",
      idempotencyKey: "idem_ws_demo_ord_clean_purchase",
      timestamp: new Date(now).toISOString(),
    };

    const attribution = computeLastEligibleTouchAttribution(conversion, clicks, riskMap, new Map());
    assert.ok(attribution);
    assert.strictEqual(attribution?.clickId, "clk_human_earlier");
  });
});
