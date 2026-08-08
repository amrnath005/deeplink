# 🎮 DeepLink Pro — Controlled Demo Sandbox Environment

> **Document Version:** 2.0  
> **Subsystem:** Isolated Demo Sandbox & DEMO_MODE Safeguards  
> **Data Isolation Rule:** Demo workspace data (`ws_demo_sandbox`) is strictly isolated and can **NEVER** pollute real customer production metrics.

---

## 1. DEMO SANDBOX ARCHITECTURE & SAFEGUARDS

DeepLink Pro provides a controlled, pre-seeded **Demo Sandbox Environment** designed for sales demonstrations, investor presentations, and integration testing without polluting live production analytics.

### `DEMO_MODE` Safeguards:
1. **Workspace ID Isolation:** Demo datasets belong exclusively to workspace ID `ws_demo_sandbox` (slug: `demo-sandbox`).
2. **Database Scoping:** All queries enforce `workspace_id = 'ws_demo_sandbox'`. No aggregation script includes demo IDs when querying customer production data.
3. **Data Tagging:** All demo clicks, links, and conversion events carry explicit metadata tags: `isDemo: true`.

---

## 2. PRE-SEEDED DEMO DATASET

Running the seed script provisions the following controlled sandbox dataset:

* **Demo Campaigns (2):**
  - `Summer D2C Promo 2026` (`utm_source=instagram`, `utm_medium=paid_social`)
  - `TikTok Creator Flash Sale` (`utm_source=tiktok`, `utm_medium=creator_influencer`)
* **Demo Smart Links (2):**
  - `/demo-summer` → `https://youtube.com/watch?v=dQw4w9WgXcQ` (`youtube://...`)
  - `/demo-tiktok` → `https://spotify.com/album/4aawaye9218` (`spotify:...`)
* **Example Traffic Logs (3):**
  - `clk_demo_human_1`: Low Risk Human (iOS Mobile Safari, Score: `0.95`, `Low` Risk)
  - `clk_demo_proxy_2`: Suspicious Traffic (Germany Proxy IP, Score: `0.55`, `Medium` Risk)
  - `clk_demo_bot_3`: High Risk Automation (Headless Chrome Script, Score: `0.10`, `High` Risk)
* **Example Conversion Events (2):**
  - `purchase`: `$249 USD` attributed to `clk_demo_human_1` via Last Eligible Touch.
  - `signup`: `$0 USD` attributed to `clk_demo_human_1`.

---

## 3. DEMONSTRATION WORKFLOW (STEP-BY-STEP)

You can demonstrate the complete 7-stage campaign intelligence lifecycle using the pre-seeded demo environment:

```
Campaign ➔ Smart Link ➔ Click ➔ Traffic Quality ➔ Conversion ➔ Attribution ➔ Revenue Analytics
```

1. **Campaign & Link View:** Open `/campaigns` or `/links` with header `x-workspace-id: ws_demo_sandbox`.
2. **Click Execution:** Visit `/demo-summer` in your browser. Notice sub-50ms edge resolution, platform scheme detection, and query parameter preservation.
3. **Traffic Quality Inspection:** Open `/traffic` to inspect the 7 audited signals and risk score breakdown (Human vs. Suspicious vs. High Risk).
4. **Conversion Event Ingestion:** Send a sample purchase event:
   ```bash
   curl -X POST http://localhost:3000/api/events \
     -H "Content-Type: application/json" \
     -H "x-workspace-id: ws_demo_sandbox" \
     -d '{
       "event": "purchase",
       "order_id": "ORD_DEMO_LIVE_001",
       "value": 199,
       "currency": "USD"
     }'
   ```
5. **Attribution & Dashboard Rollup:** Open `/dashboard` and `/analytics` to view real-time attributed revenue and conversion rate updates.

---

## 4. RESET INSTRUCTIONS

To reset or re-seed the Demo Sandbox Environment back to its initial clean state:

### Option A: HTTP POST Endpoint
```bash
curl -X POST http://localhost:3000/api/demo/reset
```

### Option B: Node Test Runner Script
```bash
npx tsx -e "import { resetDemoWorkspace } from './src/lib/demo_sandbox'; resetDemoWorkspace().then(console.log);"
```
