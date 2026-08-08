# 🔒 DeepLink Pro — Multi-Tenant SaaS Security Review

> **Document Version:** 2.0  
> **Subsystem:** Platform Security & Multi-Tenancy Architecture  
> **SLA Disclaimer:** DeepLink Pro operates high-reliability infrastructure tiering. Enterprise SLAs are currently unannounced and undergoing validation.

---

## 1. THREAT MODEL & ATTACK SURFACE

DeepLink Pro maps potential threat vectors across 4 key attack surfaces:

1. **Redirect Vulnerabilities & Open Redirects:** Malicious actors submitting shortlinks pointing to phishing destinations, `javascript:` execution scripts, or internal loopback IP ranges (`127.0.0.1`, `10.0.0.0/8`).
2. **Cross-Tenant Data Exposure:** Malicious authenticated users forging `x-workspace-id` or link IDs to access another brand's clicks, telemetry, campaigns, or revenue attributions.
3. **Webhook Spoofing & Replay Attacks:** Unauthenticated actors sending fake purchase conversion payloads to `/api/events` or forging Stripe checkout webhooks.
4. **Volumetric Denial of Service (DoS):** Automated botnets generating high-frequency request bursts to shortlinks or conversion endpoints to exhaust database capacity or exceed plan limits.

---

## 2. AUTHENTICATION & AUTHORIZATION MODEL

* **Authentication:** Next-Auth / Supabase JWT session tokens with encrypted cookie state.
* **Workspace Isolation:** Every database table (`workspaces`, `users`, `domains`, `campaigns`, `links`, `clicks`, `conversion_events`, `attributions`) mandates `workspace_id` foreign keys and Row-Level Security (RLS) policies.
* **Role-Based Access Control (RBAC):**
  - **`Owner`:** Full administrative control, billing management, domain ownership transfers, API key secret rotation.
  - **`Admin`:** Create/edit links, campaigns, custom domain bindings, view conversion analytics.
  - **`Member`:** Read-only access to campaign performance metrics and click logs.
* **API Key Authorization:** REST API endpoints enforce `Authorization: Bearer dlk_live_...` headers linked strictly to a single workspace context.

---

## 3. OPEN REDIRECT & SSRF PROTECTION

All destination URLs undergo strict validation in [`lib/security.ts`](file:///c:/Users/salte/deeplink-platform/frontend/src/lib/security.ts) before link creation and before HTTP 302/307 redirects:

* **Disallowed Protocols:** `javascript:`, `data:`, `file:`, `vbscript:`, `blob:`.
* **Allowed Schemes:** `http:`, `https:`, `mailto:`, `tel:`, and registered app schemes (`vnd.youtube:`, `spotify:`, `tg:`, `instagram:`, `whatsapp:`, `twitter:`).
* **Loopback & Private Subnet Blocking:** Rejects `localhost`, `127.0.0.1`, `0.0.0.0`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16` in production environments.

---

## 4. SUBSCRIPTION TIERS & USAGE METERING

Subscription tiers are strictly configuration-driven in [`lib/billing.ts`](file:///c:/Users/salte/deeplink-platform/frontend/src/lib/billing.ts):

| Tier | Monthly Clicks | Custom Domains | Attribution Window | Team Members | Monthly Price |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Free** | 1,000 | ❌ | 14 Days | 1 | $0 |
| **Pro** | 100,000 | ✅ | 30 Days | 5 | $49 |
| **Business** | 1,000,000 | ✅ | 90 Days | 25 | $199 |

* **Usage Enforcement:** When a workspace exceeds its monthly click quota, incoming shortlink clicks trigger warning banners or rate-limit responses rather than silent data corruption.

---

## 5. WEBHOOK SIGNATURE VERIFICATION

* **Stripe Webhooks:** Verifies `Stripe-Signature` headers using HMAC-SHA256 and production webhook secret keys before processing subscription events.
* **Conversion Ingestion (`POST /api/events`):** Enforces strict idempotency keys (`idem_${workspaceId}_${orderId}_${eventName}`) to prevent duplicate event submission or double-revenue counting.

---

## 6. RATE LIMITING & ABUSE PREVENTION

* **IP Sliding Window Rate Limiting:** Enforces maximum 100 requests per minute per IP address on public shortlink resolution routes (`/[alias]`).
* **HTTP Security Headers:** Injected globally in `next.config.ts`:
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`

---

## 7. PRIVACY & DATA RETENTION STRATEGY

* **14-Day Telemetry Purge:** Raw hardware and browser signal buffers are automatically purged after 14 days.
* **Data Minimization:** No battery API, font enumeration, or audio oscillator tracking vectors are stored.
* **GDPR Compliance:** Operational click logs retain IP addresses in hashed or truncated formats.
