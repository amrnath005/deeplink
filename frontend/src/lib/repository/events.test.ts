import { validateConversionInput } from "./entities";
import { RepositoryV2, generateIdempotencyKey } from "./store_v2";

describe("V2 Event Foundation & Idempotency Engine", () => {
  
  test("validateConversionInput should accept valid purchase event", () => {
    const payload = {
      event: "purchase",
      click_id: "clk_123",
      order_id: "ord_99812",
      value: 2499,
      currency: "INR"
    };

    const res = validateConversionInput(payload);
    expect(res.valid).toBe(true);
    expect(res.data?.event).toBe("purchase");
    expect(res.data?.value).toBe(2499);
    expect(res.data?.currency).toBe("INR");
  });

  test("validateConversionInput should reject payload missing event name", () => {
    const payload = {
      order_id: "ord_99812",
      value: 2499
    };

    const res = validateConversionInput(payload);
    expect(res.valid).toBe(false);
    expect(res.error).toContain("Event name is required");
  });

  test("generateIdempotencyKey should generate deterministic key for same order and event", () => {
    const key1 = generateIdempotencyKey("ws_default", "ORD_881", "purchase");
    const key2 = generateIdempotencyKey("ws_default", "ord_881", "PURCHASE");

    expect(key1).toBe(key2);
    expect(key1).toBe("idem_ws_default_ord_881_purchase");
  });

  test("RepositoryV2.ingestConversionEvent should enforce strict idempotency", async () => {
    const payload = {
      event: "purchase",
      order_id: "ord_idempotent_001",
      value: 1499,
      currency: "USD"
    };

    // First Ingestion
    const firstCall = await RepositoryV2.ingestConversionEvent("ws_test", payload);
    expect(firstCall.isDuplicate).toBe(false);
    expect(firstCall.conversion.id).toBeDefined();

    // Second Ingestion (Duplicate Order ID & Event)
    const secondCall = await RepositoryV2.ingestConversionEvent("ws_test", payload);
    expect(secondCall.isDuplicate).toBe(true);
    expect(secondCall.conversion.id).toBe(firstCall.conversion.id);
  });

  test("RepositoryV2.purgeExpiredTelemetry should purge short-lived telemetry", async () => {
    const count = await RepositoryV2.purgeExpiredTelemetry(14);
    expect(typeof count).toBe("number");
  });
});
