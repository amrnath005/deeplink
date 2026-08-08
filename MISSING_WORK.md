# 📋 DeepLink Pro — Missing Work & Technical Roadmap

> **Classification Matrix:** P0 (Pre-Traffic) • P1 (Pre-Paid Customers) • P2 (Short-Term) • P3 (Long-Term) • NOT NEEDED

---

## 1. CLASSIFIED MISSING WORK

### 🔴 P0 — Must Fix Before External Traffic
* **NONE.** All core functionality across Smart Routing, Traffic Quality, Attribution, Data Foundation, Dashboard, and Security Headers is verified.

---

### 🟡 P1 — Must Fix Before Paid Customers
1. **Live Production Redis Cluster Sync:** Connect Upstash Redis REST API (`UPSTASH_REDIS_REST_URL`) in deployment environment for distributed rate limiting across multi-region edge instances.
2. **Reverse DNS Crawler Verification:** Add optional reverse DNS lookup to `isVerifiedCrawler` to complement User-Agent string verification for Googlebot/Bingbot.

---

### 🔵 P2 — Important Short-Term Enhancements
1. **Automated Dynamic Exchange Rates:** Replace fixed currency exchange rates (`INR: 0.012`, `EUR: 1.09`) with an automated daily API sync (e.g. OpenExchangeRates).
2. **Supabase Migration CI Test Script:** Automated CI script to run `npx supabase db push` against temporary staging containers during pull request builds.

---

### 🟢 P3 — Long-Term Strategic Features
1. **Multi-Touch Attribution Models:** Expose First Touch and Linear attribution options in campaign analytics UI alongside Last Eligible Touch.
2. **Shopify & WooCommerce One-Click Webhook Plugins:** Pre-built webhooks for e-commerce platforms to post conversion events to `/api/events` automatically.

---

### ❌ NOT NEEDED — Do Not Build
1. ❌ **In-App Mobile SDKs:** Do not build native iOS/Android SDKs. DeepLink Pro is positioned for mobile web & campaign click routing without heavy SDK integration.
2. ❌ **ZK Cryptographic Proofs:** Do not build ZK-SNARK proof systems for link clicks. Unnecessary overhead for e-commerce marketing intelligence.
3. ❌ **WebGPU Hardware Routing:** Do not build WebGPU browser acceleration routes for URL redirects. Standard HTTP edge handlers provide superior performance.
