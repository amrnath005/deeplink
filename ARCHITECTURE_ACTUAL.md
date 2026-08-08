# 🏗️ DeepLink Pro — Actual System Architecture & Data Flow

> **Audit Type:** Technical Architecture Verification  
> **Target System:** DeepLink Pro V2  
> **Design Strategy:** 3 Core Pillars (Smart Routing • Traffic Quality • Attribution)

---

## 1. ACTUAL CURRENT ARCHITECTURE MATRIX

Unlike initial marketing documentation claiming 32 complex microservices, the actual production architecture is built as a **clean Next.js 16 App Router application**:

```
 ┌────────────────────────────────────────────────────────────────────────┐
 │                      Client Devices & Web Browsers                     │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │ HTTP / HTTPS
                                     ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │                     Next.js 16 App Router (Edge Engine)                │
 │  ┌───────────────────────┐ ┌───────────────────────┐ ┌──────────────┐  │
 │  │  Smart Routing        │ │  Traffic Quality      │ │ Attribution  │  │
 │  │  sub-50ms engine      │ │  Risk Scoring Model   │ │ Engine       │  │
 │  └───────────────────────┘ └───────────────────────┘ └──────────────┘  │
 └─────────┬─────────────────────────┬─────────────────────────┬──────────┘
           │                         │                         │
           ▼                         ▼                         ▼
 ┌───────────────────┐     ┌───────────────────┐     ┌───────────────────┐
 │ Supabase Postgres │     │ Upstash Redis     │     │ Stripe API        │
 │ Multi-tenant RLS  │     │ Sliding Window    │     │ Webhook Signatures│
 └───────────────────┘     └───────────────────┘     └───────────────────┘
```

* **Framework:** Next.js 16.3.0 (Turbopack, App Router)
* **Language:** TypeScript 5.x
* **Frontend:** TailwindCSS, React 19, Framer Motion, Lucide Icons, Recharts
* **Backend API Architecture:** Next.js Serverless Route Handlers (`src/app/api/...`)
* **Database:** Supabase PostgreSQL (11 core entities, multi-tenant RLS)
* **Cache & Rate Limiting:** Upstash Redis REST API (with in-memory sliding window fallback)
* **Authentication:** Next-Auth / Supabase JWT Cookie Sessions (`src/middleware.ts`)
* **Billing:** Stripe Node SDK (`src/lib/stripe.ts`), webhook HMAC-SHA256 verification
* **Email:** Resend API Transporter (`src/lib/resend.ts`)
* **Testing Infrastructure:** Node.js v24 Native Test Runner (`node:test`, `node:assert`, `npx tsx`)
* **Build System:** Turbopack production compiler (`npm run build`)

---

## 2. COMPLETE CUSTOMER JOURNEY DATA FLOW

Tracing a real customer click from shortlink creation through conversion revenue attribution:

```
[Link Creation] ──> [Database Record] ──> [Client Click GET /[alias]] 
                                                    │
 ┌──────────────────────────────────────────────────┴──────────────────────────────────┐
 │                                 Edge Resolution Engine                              │
 │  1. Open Redirect & Protocol Protection Check (lib/security.ts)                      │
 │  2. Query Parameter Preservation (utm_source, utm_medium, ref preserved)            │
 │  3. Platform Detection (iOS / Android / Desktop) & Webview Context                  │
 │  4. Click ID Generation (clk_...) & Latency Measurement                             │
 └──────────────────────────────────────────────────┬──────────────────────────────────┘
                                                    │
                                                    ▼
 ┌─────────────────────────────────────────────────────────────────────────────────────┐
 │                             Traffic Quality Subsystem                               │
 │  1. Evaluates 7 Audited Signals (Automation, Headless, Crawler UA, Rate, Proxy)     │
 │  2. Verified Search Crawler Safeguard Check (Googlebot/Bingbot -> low_risk)         │
 │  3. Risk Scoring (Low Risk: <0.4, Suspicious: 0.4-0.69, High Risk: >=0.7)            │
 └──────────────────────────────────────────────────┬──────────────────────────────────┘
                                                    │
                                                    ▼
 ┌─────────────────────────────────────────────────────────────────────────────────────┐
 │                           Platform App Launcher / HTML Gateway                      │
 │  1. Serves HTML Launcher with native app scheme (youtube://..., spotify:...)        │
 │  2. Android Intent Scheme for Android Webviews                                      │
 │  3. Fallback Web URL execution if app fails to launch in 1200ms                       │
 └──────────────────────────────────────────────────┬──────────────────────────────────┘
                                                    │
                                                    ▼
 ┌─────────────────────────────────────────────────────────────────────────────────────┐
 │                          Conversion Ingestion (POST /api/events)                    │
 │  1. Evaluates Idempotency Key: idem_${workspaceId}_${orderId}_${eventName}           │
 │  2. Last Eligible Touch Matching Engine (Matches click_id within 30 days)           │
 │  3. Normalizes Revenue to USD & Updates Campaign Analytics Dashboard                │
 └─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. SMART ROUTING DETAILED MECHANICS & WEBVIEW CLAIM TRUTH

### Webview Escape Claim Verification:
* **DOCUMENTATION CLAIM:** Marketing copy claims the system can forcibly escape every in-app webview (Instagram, TikTok, Facebook).
* **ACTUAL IMPLEMENTATION:** Source code in [`src/app/[alias]/route.ts`](file:///c:/Users/salte/deeplink-platform/frontend/src/app/[alias]/route.ts) and [`src/lib/routing.ts`](file:///c:/Users/salte/deeplink-platform/frontend/src/lib/routing.ts) detects in-app browser user agents (Instagram, TikTok, Facebook, Snapchat, LinkedIn) and generates platform-supported launchers (`intent://...#Intent;scheme=https;package=com.android.chrome;end;` for Android and custom app URI schemes for iOS) with a 1200ms graceful fallback web URL timeout.
* **VERDICT:** The code **detects and chooses appropriate platform launchers** rather than breaking browser security sandboxes. This is the correct, standard-compliant technical approach.

---

## 4. ROUTING EDGE CASE HANDLING

* **Invalid Links:** Returns HTTP 404 with custom error page.
* **Expired Links:** Returns HTTP 410 with timestamp expiration details.
* **Disabled Links:** Returns HTTP 403 status code.
* **Malicious URLs:** Returns HTTP 400 Open Redirect warning page.
* **Campaign Parameters:** Preserves all `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `ref`, and sub-ID parameters onto target URLs.
