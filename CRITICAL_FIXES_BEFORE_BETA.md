# 🛠️ DeepLink Pro — Critical Fixes Before Beta

> **Audit Type:** Targeted Technical Claims & Pre-Beta Readiness Review  
> **Rule:** Includes ONLY genuinely necessary fixes. No new features or unnecessary refactoring.

---

## 1. CRITICAL SECURITY FIXES

### 1. Bind API Authorization to Workspace Context (P1)
* **Issue:** REST API routes (`src/app/api/analytics/...`, `src/app/api/events`) extract workspace ID from the `x-workspace-id` request header. An unauthenticated or unauthorized client could supply arbitrary workspace IDs in request headers.
* **Fix:** Validate that the authenticated user's session token or Bearer API key possesses explicit access permissions for the requested `x-workspace-id` before serving workspace analytics.

### 2. Connect Authoritative Redis Rate-Limiter (P1)
* **Issue:** `src/lib/ratelimit.ts` uses an in-memory `Map` for sliding window rate limiting. Memory is isolated per serverless instance, allowing rate-limit bypass across multiple container instances.
* **Fix:** Connect the Upstash Redis REST client (`UPSTASH_REDIS_REST_URL` & `UPSTASH_REDIS_REST_TOKEN`) in `src/lib/ratelimit.ts` to enforce authoritative distributed rate limiting across multi-region edge deployments.

---

## 2. SYSTEM STABILITY FIXES

### 3. Move Hardcoded 1200ms Launcher Timeout to Config (P2)
* **Issue:** In `src/app/[alias]/route.ts`, the fallback timeout (`1200ms`) is hardcoded in client-side HTML launcher script strings.
* **Fix:** Move the timeout constant into `src/lib/routing.ts` configuration options so link owners can adjust timeout thresholds based on mobile app launch latency requirements.

### 4. Automated Daily FX Exchange Rate Feed (P2)
* **Issue:** Revenue normalization in `src/lib/attribution.ts` relies on a static exchange rate mapping table (`INR: 0.012`, `EUR: 1.09`).
* **Fix:** Add an automated daily cron job or light API fetch (e.g. OpenExchangeRates API) to refresh `CURRENCY_RATES` values dynamically.
