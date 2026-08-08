# 🧪 DeepLink Pro — Staging Deployment Guide & Operational Runbook

> **Environment Target:** STAGING (`staging.deeplink.pro`)  
> **Production Disclaimer:** Do **NOT** call staging production-ready. Staging uses test mode sandboxes and simulated traffic buffers.

---

## 1. ENVIRONMENT VARIABLES AUDIT & SEPARATION

DeepLink Pro strictly separates environment credentials across 3 distinct tiers:

| Environment Variable | Local (`.env.local`) | Staging (`.env.staging`) | Production (`.env.production`) |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | `development` | `staging` | `production` |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | `https://staging.deeplink.pro` | `https://deeplink.pro` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` | `pk_test_staging...` | `pk_live_...` |
| `STRIPE_SECRET_KEY` | `sk_test_...` | `sk_test_staging...` | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_test_...` | `whsec_test_staging...` | `whsec_live_...` |
| `RESEND_API_KEY` | `re_test_local...` | `re_test_staging...` | `re_live_...` |
| `SUPABASE_URL` | `http://127.0.0.1:54321` | `https://staging-proj.supabase.co` | `https://prod-proj.supabase.co` |
| `UPSTASH_REDIS_REST_URL` | Local In-Memory | `https://staging-redis.upstash.io` | `https://prod-redis.upstash.io` |

### Security Rules Enforced:
1. `NEXT_PUBLIC_` variables must **NEVER** contain server secrets (`STRIPE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`).
2. Staging MUST use `sk_test_...` Stripe keys. Production `sk_live_...` keys are strictly prohibited in staging.

---

## 2. DATABASE MIGRATION PROCEDURE

Staging database migrations are reproducible and executed via Supabase CLI:

```bash
# 1. Link Supabase Staging Project
npx supabase link --project-ref staging-proj-id

# 2. Apply V2 Event Foundation Migration
npx supabase db push
```

**Migration Files:**
* `supabase/migrations/20260808000000_v2_event_foundation.sql` (Creates 11 core entities, indexes, and RLS policies).

---

## 3. STAGING DEPLOYMENT STEPS

### Vercel / Cloud Deployment:
1. Set Environment Variables in platform dashboard under **Staging / Preview** environment using `.env.staging` values.
2. Trigger deployment build:
   ```bash
   git push origin staging
   ```

### Docker / Standalone Container Deployment:
```bash
docker build -t deeplink-platform-staging:latest .
docker run -p 3000:3000 --env-file .env.staging deeplink-platform-staging:latest
```

---

## 4. AUTOMATED STAGING SMOKE TESTS

Execute the automated staging smoke test runner post-deployment:

```bash
npx tsx --test src/lib/staging_smoke.test.ts
```

### Verified Smoke Test Matrix:
- ✅ **Secret Leakage Guard:** `validateEnvironmentVariables()` confirms no server secrets are exposed to client JavaScript bundles.
- ✅ **Smart Link Resolution:** `computeSmartRouting` resolves platform schemes and preserves `utm_*` query parameters.
- ✅ **Idempotent Ingestion:** `POST /api/events` ingests purchase events and idempotently suppresses duplicates.

---

## 5. ROLLBACK PROCEDURE

If a staging deployment exhibits regression or build failures:

1. **Vercel Instant Rollback:** Select previous successful deployment ID in Vercel UI and click *Promote to Staging*.
2. **Docker Container Rollback:**
   ```bash
   docker stop deeplink-staging
   docker run -p 3000:3000 deeplink-platform-staging:previous-commit-id
   ```
3. **Database Schema Rollback:**
   ```bash
   npx supabase migration repair --status reverted 20260808000000_v2_event_foundation.sql
   ```

---

## 6. KNOWN STAGING LIMITATIONS

* **Rate Limiting:** Staging uses local edge in-memory buffers fallback when Upstash Redis is disconnected.
* **Email Transporter:** Email verification and magic links use Resend sandbox mode (`re_test_...`). Emails are delivered to developer sandboxes.
* **Stripe Webhook:** Uses Stripe CLI local listener or Vercel preview URLs.
