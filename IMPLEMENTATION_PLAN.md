# 🛠️ DeepLink Pro — Product V2 Implementation Plan

> **Document Version:** 2.0  
> **Target Platform:** Mobile Campaign Intelligence Platform  
> **Execution Directives:** Independently Executable Phases • Zero Unvalidated Marketing Claims • Strict 3-Pillar Focus

---

## 📋 PHASE SUMMARY OVERVIEW

```
  ┌────────────────────────────────────────────────────────────────────────┐
  │ PHASE 1: UI Realignment & Unverified Claim Cleanup                     │
  │ • Align Navbar, Hero, Features, Pricing, & FAQ to the 3 Core Pillars   │
  │ • Remove unproven claims (+35%, $15k saved, 108 signals headline)      │
  └───────────────────────────────────┬────────────────────────────────────┘
                                      │
                                      ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │ PHASE 2: Core V1 Smart Routing & Mobile App Scheme Refinement          │
  │ • Standardize sub-50ms edge routing engine & Universal Links           │
  │ • Consolidate webview escape scheme launchers                          │
  └───────────────────────────────────┬────────────────────────────────────┘
                                      │
                                      ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │ PHASE 3: Traffic Quality Scoring Engine & API Standardization          │
  │ • Standardize traffic quality score (0.00 - 1.00) in store & API       │
  │ • Update Dashboard Fraud/Quality tab with factual risk metrics         │
  └───────────────────────────────────┬────────────────────────────────────┘
                                      │
                                      ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │ PHASE 4: Conversion Event Ingestion & Attribution Engine               │
  │ • Build POST /api/events conversion ingestion endpoint                 │
  │ • Connect campaign click tokens to purchase/signup events             │
  └───────────────────────────────────┬────────────────────────────────────┘
                                      │
                                      ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │ PHASE 5: Visual Analytics & Dashboard 3-Pillar Alignment               │
  │ • Restructure /dashboard around Smart Routing, Quality & Attribution   │
  │ • Add Conversion Rate & ROAS Campaign Analytics Cards                  │
  └───────────────────────────────────┬────────────────────────────────────┘
                                      │
                                      ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │ PHASE 6: Integration Testing, Build Verification & V1 Readiness        │
  │ • Automated API route integration tests & Next.js production build    │
  └────────────────────────────────────────────────────────────────────────┘
```

---

## 🔹 PHASE 1: UI Realignment & Unverified Claim Cleanup

### Objective
Re-align landing page UI copy, headers, trust badges, and feature lists to the **Mobile Campaign Intelligence Platform** strategy and its 3 Pillars (**Smart Routing**, **Traffic Quality**, **Attribution**). Remove unproven claims (`+35-50% conversion`, `$15k-$25k savings`, `108 signals` as headline, `Proves Human`, `99.999% SLA`).

### Files Affected
* `frontend/src/components/sections/Hero.tsx`
* `frontend/src/components/sections/Navbar.tsx`
* `frontend/src/components/sections/Features.tsx`
* `frontend/src/components/sections/Pricing.tsx`
* `frontend/src/components/sections/FAQ.tsx`
* `frontend/src/components/modals/EnginePlaygroundModal.tsx`

### Dependencies
None.

### Database Changes
None.

### APIs
None.

### UI Changes
* **Hero.tsx:** Update headline to *"Route Every Mobile Campaign Click Correctly & Identify Traffic Quality"*. Update trust badges to: `Sub-50ms Edge Resolution`, `Webview Escape Launcher`, `Traffic Quality Risk Scoring`, `Conversion Attribution`.
* **Navbar.tsx:** Re-organize Product Mega-Menu around 3 Pillars: **Smart Routing**, **Traffic Quality**, **Attribution**.
* **Features.tsx:** Group 10 core features under the 3 primary pillars.
* **Pricing.tsx:** Update tier feature bullet points to highlight V1 Core features (Campaign Routing, Traffic Quality, Conversion Ingestion).
* **FAQ.tsx:** Update FAQ questions to focus on mobile campaign routing, webview breakout, traffic quality scoring, and attribution webhooks.

### Tests
* Run `npm run build` in `frontend/` to verify zero JSX or TypeScript errors.

### Acceptance Criteria
1. No instances of unproven claims (`+35%`, `$15k saved`, `108 signals headline`, `99.999% SLA`) appear on landing page or pricing cards.
2. Navbar and Hero copy clearly articulate the **Mobile Campaign Intelligence Platform** promise.
3. Next.js production build succeeds with exit code 0.

### Rollback Strategy
Git revert commit for Phase 1 files.

---

## 🔹 PHASE 2: Core V1 Smart Routing & Mobile App Scheme Refinement

### Objective
Refine and verify the sub-50ms edge routing engine (`[alias]/route.ts`), webview escape scheme launchers (`lib/webview_escape.ts`), and dynamic QR code generation to ensure 100% reliable mobile campaign traffic resolution.

### Files Affected
* `frontend/src/app/[alias]/route.ts`
* `frontend/src/lib/webview_escape.ts`
* `frontend/src/components/modals/QRCodeModal.tsx`
* `frontend/src/lib/store.ts`

### Dependencies
Phase 1 complete.

### Database Changes
None.

### APIs
* `GET /[alias]` — Evaluates User-Agent, logs click event, and serves sub-50ms HTML app scheme launcher.

### UI Changes
* Ensure `QRCodeModal.tsx` renders vector QR codes using local `canvas`/`svg` generation with clean download actions.

### Tests
* Test redirection responses for simulated User-Agents (`Instagram`, `TikTok`, `FBAV`, `Mobile Safari`, `Android Chrome`, `Headless Chrome`).

### Acceptance Criteria
1. `GET /[alias]` returns HTTP 200 HTML launcher with target deep-link scheme (`vnd.youtube://`, `spotify://`, `tg://`, `instagram://`, `googlechrome://`).
2. Fallback redirect handles missing or expired aliases gracefully with 404 status.
3. Next.js production build succeeds with exit code 0.

### Rollback Strategy
Git revert commit for Phase 2 files.

---

## 🔹 PHASE 3: Traffic Quality Scoring Engine & API Standardization

### Objective
Standardize traffic quality risk scoring (`0.00` = Verified Human to `1.00` = High Suspicious Bot Risk) across the store engine (`lib/store.ts`) and API routes (`/api/guard`, `/api/links`). Replace opaque claims with clear risk metrics.

### Files Affected
* `frontend/src/lib/store.ts`
* `frontend/src/app/api/guard/route.ts`
* `frontend/src/components/modals/TelemetryModal.tsx`

### Dependencies
Phase 2 complete.

### Database Changes
* Ensure `ClickRecord` model in `store.ts` includes `trafficQualityScore: number` (0.00 to 1.00), `riskCategory: 'Low' | 'Medium' | 'High'`, and `suspiciousSignals: string[]`.

### APIs
* `POST /api/guard` — Accepts click metadata and returns `trafficQualityScore`, `riskCategory`, and `isSuspicious`.

### UI Changes
* **TelemetryModal.tsx:** Update modal header to *"Traffic Quality & Device Telemetry Report"*. Display Traffic Quality Score and identified risk signals clearly.

### Tests
* Send sample JSON payloads to `/api/guard` with bot user-agents and verify `trafficQualityScore > 0.65` and `riskCategory: "High"`.

### Acceptance Criteria
1. `/api/guard` returns standardized JSON payload containing `trafficQualityScore` and `riskCategory`.
2. Telemetry modal displays factual traffic quality metrics without unverified claims.
3. Next.js production build succeeds with exit code 0.

### Rollback Strategy
Git revert commit for Phase 3 files.

---

## 🔹 PHASE 4: Conversion Event Ingestion & Attribution Engine

### Objective
Build the **Conversion Event Ingestion API (`POST /api/events`)** to allow D2C e-commerce stores to send purchase, checkout, and lead conversion events back to DeepLink Pro, linking them to original campaign click tokens.

### Files Affected
* `frontend/src/app/api/events/route.ts` **[NEW]**
* `frontend/src/lib/store.ts`
* `frontend/src/types/index.ts`

### Dependencies
Phase 3 complete.

### Database Changes
* Add `ConversionEvent` interface to `store.ts`:
  ```typescript
  export interface ConversionEvent {
    id: string;
    alias: string;
    clickId?: string;
    eventType: "purchase" | "add_to_cart" | "signup" | "lead";
    revenue?: number;
    currency?: string;
    orderId?: string;
    timestamp: string;
  }
  ```

### APIs
* `POST /api/events` — Ingests conversion events with payload `{ alias, clickId, eventType, revenue, currency, orderId }`.
* `POST /api/webhooks` — Dispatches conversion events to configured external customer webhooks.

### UI Changes
None.

### Tests
* Post a sample purchase event to `POST /api/events` and verify successful attribution to the corresponding link alias.

### Acceptance Criteria
1. `POST /api/events` validates payload and returns `201 Created` with attributed conversion record.
2. In-memory store and Supabase sync correctly retain conversion events.
3. Next.js production build succeeds with exit code 0.

### Rollback Strategy
Delete `frontend/src/app/api/events/route.ts` and revert `store.ts`.

---

## 🔹 PHASE 5: Visual Analytics & Dashboard 3-Pillar Alignment

### Objective
Restructure the `/dashboard` page around the 3 Product Pillars (**Smart Routing Traffic**, **Traffic Quality Scoring**, **Conversion Attribution**), adding conversion rate metrics and campaign performance summaries.

### Files Affected
* `frontend/src/app/dashboard/page.tsx`

### Dependencies
Phase 4 complete.

### Database Changes
None.

### APIs
* `GET /api/links` — Expanded to include conversion event counts and calculated conversion rates per link.

### UI Changes
* **Metric Cards:** Update top dashboard cards to:
  1. **Total Campaign Redirect Hits**
  2. **Avg Traffic Quality Score** (e.g. `94.2% Human`)
  3. **Total Attributed Conversions**
  4. **Total Attributed Revenue ($)**
* **Tabs:** Restructure dashboard tabs:
  - `Smart Links & Routing`
  - `Traffic Quality & Fraud Risk`
  - `Conversion Attribution & ROAS`
  - `Visual Performance Charts 📊`
  - `Data Export`

### Tests
* Verify dashboard tab navigation, chart rendering, and CSV/JSON export actions in browser.

### Acceptance Criteria
1. Dashboard clearly reflects the 3 core product pillars.
2. Conversion rate and attributed revenue metrics render accurately.
3. Next.js production build succeeds with exit code 0.

### Rollback Strategy
Git revert commit for `dashboard/page.tsx`.

---

## 🔹 PHASE 6: Integration Testing, Build Verification & V1 Readiness

### Objective
Run comprehensive production build verifications and API integration tests to confirm V1 readiness of the **Mobile Campaign Intelligence Platform**.

### Files Affected
* `frontend/package.json`
* All V1 API route handlers and page components.

### Dependencies
Phases 1-5 complete.

### Database Changes
None.

### APIs
All 30 Next.js API routes verified.

### UI Changes
None.

### Tests
* Run `npm run build` in `frontend/` to confirm zero build or type errors.
* Verify all 44 Next.js routes compile statically or dynamically as expected.

### Acceptance Criteria
1. `npm run build` completes in `< 5s` with 0 warnings or errors.
2. Server boots on `http://localhost:3000` with 100% functional 3-pillar campaign workflows.

### Rollback Strategy
N/A (Final verification phase).
