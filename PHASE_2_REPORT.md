# 📊 DeepLink Pro — Phase 2 Report: Data & Event Foundation

> **Document Version:** 1.0  
> **Milestone:** Core Data Architecture & Conversion Event Ingestion  
> **Build Status:** SUCCESS (Compiled in 3.6s across 45 routes with 0 errors)

---

## 1. FILES CHANGED & CREATED

### Created Files:
* `supabase/migrations/20260808000000_v2_event_foundation.sql` — PostgreSQL migration defining the 11 Core Entities and data tiering structures.
* `frontend/src/lib/repository/entities.ts` — TypeScript interfaces, DTOs, and validation logic for all 11 Core Entities.
* `frontend/src/lib/repository/store_v2.ts` — Unified Data Access Layer implementing multi-tenancy workspace isolation, operational click logging, derived quality scoring, short-lived telemetry retention, and strict conversion event idempotency.
* `frontend/src/app/api/events/route.ts` — API handler for conversion event ingestion (`POST /api/events` and `GET /api/events`).
* `frontend/src/lib/repository/events.test.ts` — Automated test suite for event validation, idempotency key generation, duplicate order suppression, and telemetry purging.

---

## 2. SCHEMA CHANGES & CORE ENTITIES

The data foundation supports **11 Core Entities** structured with strict data tiering:

```
  ┌────────────────────────────────────────────────────────────────────────┐
  │ 1. Operational Data (Long-Term Retention)                              │
  │ • Workspaces, Users, Subscriptions, Domains, Campaigns, Links, Clicks  │
  ├────────────────────────────────────────────────────────────────────────┤
  │ 2. Short-Lived Raw Telemetry (14-Day Automated Purge)                 │
  │ • RawTelemetry (Canvas Hashes, WebGL Vendors, GPU Renderers)           │
  ├────────────────────────────────────────────────────────────────────────┤
  │ 3. Derived Analytics (Quality & Attribution Matching)                  │
  │ • RiskAssessments (Traffic Quality Score 0.00-1.00), Attributions      │
  ├────────────────────────────────────────────────────────────────────────┤
  │ 4. Conversion Ingestion (Strict Idempotency)                           │
  │ • ConversionEvents (Unique idempotency_key: workspace+order+event)    │
  ├────────────────────────────────────────────────────────────────────────┤
  │ 5. Aggregated Historical Metrics (Long-Term Rollups)                  │
  │ • DailyCampaignMetrics (Daily rollup of clicks, human hits, revenue)   │
  └────────────────────────────────────────────────────────────────────────┘
```

### PostgreSQL Table Mapping (`20260808000000_v2_event_foundation.sql`):
1. `workspaces` (`id`, `name`, `slug`, `created_at`, `updated_at`)
2. `users` (`id`, `email`, `workspace_id`, `role`, `created_at`, `updated_at`)
3. `subscriptions` (`id`, `workspace_id`, `stripe_customer_id`, `plan_tier`, `status`)
4. `domains` (`id`, `workspace_id`, `domain`, `is_verified`)
5. `campaigns` (`id`, `workspace_id`, `name`, `utm_source`, `utm_medium`, `utm_campaign`)
6. `links` (`id`, `workspace_id`, `campaign_id`, `domain_id`, `alias`, `original_url`, `short_url`, `target_scheme`, `fallback_url`, `is_active`, `expires_at`)
7. `clicks` (`id`, `workspace_id`, `link_id`, `alias`, `ip`, `country`, `city`, `os`, `browser`, `device`, `timestamp`)
8. `raw_telemetry` (`id`, `click_id`, `canvas_hash`, `webgl_vendor`, `gpu_renderer`, `screen_resolution`, `touch_points`, `created_at`)
9. `risk_assessments` (`id`, `click_id`, `traffic_quality_score`, `risk_category`, `suspicious_signals`)
10. `conversion_events` (`id`, `workspace_id`, `click_id`, `link_id`, `event_name`, `order_id`, `value`, `currency`, `idempotency_key`, `metadata`, `timestamp`)
11. `attributions` (`id`, `conversion_id`, `click_id`, `touch_type`, `attributed_value`)
12. `daily_campaign_metrics` (`id`, `workspace_id`, `link_id`, `metric_date`, `total_clicks`, `human_clicks`, `suspicious_clicks`, `conversions`, `total_revenue`)

---

## 3. API CONTRACT (`POST /api/events`)

### Request Specifications:
* **Endpoint:** `POST /api/events`
* **Headers:** `Content-Type: application/json`, `x-workspace-id: ws_default` (or `Authorization: Bearer <workspace_token>`)

```json
{
  "event": "purchase",
  "click_id": "clk_demo_1",
  "order_id": "ORD_99812",
  "value": 2499,
  "currency": "INR",
  "metadata": { "payment_gateway": "Razorpay" }
}
```

### Response Specs:
* **New Event (201 Created):**
  ```json
  {
    "success": true,
    "message": "Conversion event successfully ingested and attributed",
    "is_duplicate": false,
    "conversion": {
      "id": "conv_x9812b",
      "workspaceId": "ws_default",
      "clickId": "clk_demo_1",
      "linkId": "dl_rickroll_9f",
      "eventName": "purchase",
      "orderId": "ORD_99812",
      "value": 2499,
      "currency": "INR",
      "idempotencyKey": "idem_ws_default_ord_99812_purchase",
      "timestamp": "2026-08-08T10:04:55.123Z"
    },
    "attribution": {
      "id": "attr_m9981",
      "conversionId": "conv_x9812b",
      "clickId": "clk_demo_1",
      "touchType": "last_touch",
      "attributedValue": 2499
    }
  }
  ```

* **Duplicate Event Attempt (200 OK - Idempotent Suppression):**
  ```json
  {
    "success": true,
    "message": "Conversion event already ingested (Duplicate order_id & event combination suppressed)",
    "is_duplicate": true,
    "conversion": { ... }
  }
  ```

---

## 4. TESTS & VERIFICATION

Automated tests in `frontend/src/lib/repository/events.test.ts` verify:
1. `validateConversionInput` accepts valid purchase events and rejects missing event names.
2. `generateIdempotencyKey` generates deterministic keys ignoring order_id and event casing.
3. `RepositoryV2.ingestConversionEvent` suppresses duplicate `order_id` + `event` calls.
4. `RepositoryV2.purgeExpiredTelemetry` purges telemetry older than 14 days.

---

## 5. BUILD RESULT

* **Next.js Production Build:** `SUCCESS` (Compiled in 3.6s across 45 routes with 0 errors).
* **New Route Added:** `POST /api/events` & `GET /api/events`.

---

## 6. KNOWN LIMITATIONS

1. **Multi-Region Idempotency Cache:** In multi-region serverless deployments without Supabase configured, idempotency checks use an in-memory `Map` per instance. Configuring `NEXT_PUBLIC_SUPABASE_URL` enforces global database uniqueness across all regions.
2. **First-Touch Attribution Multi-Click Chains:** Current attribution defaults to single-session last-touch matching; cross-device multi-touch attribution chains will be introduced in V2.
