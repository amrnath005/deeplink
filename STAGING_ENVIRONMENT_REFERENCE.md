# 📄 DeepLink Pro V2 — Staging Environment Reference Guide

> **Purpose:** Authoritative reference for all environment variables used by DeepLink Pro V2 across Development, Staging, and Production deployments.  
> **Security Rule:** Never commit raw secret values to Git repositories.

---

## 1. ENVIRONMENT VARIABLES AUDIT MATRIX

| Variable Name | Type | Scope | Purpose | Config Platform | Contains Secret? |
| :--- | :---: | :---: | :--- | :---: | :---: |
| `NODE_ENV` | System | Server / Client | Runtime environment (`development`, `staging`, `production`) | Vercel | No |
| `NEXT_PUBLIC_APP_URL` | Public | Client | Base URL for application (`https://staging.deeplink.pro`) | Vercel | No |
| `NEXT_PUBLIC_API_URL` | Public | Client | Base API URL (`https://staging.deeplink.pro/api`) | Vercel | No |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Client / Server | Supabase project API gateway endpoint | Vercel / Supabase | No |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Client / Server | Supabase anonymous client API key | Vercel / Supabase | No |
| `SUPABASE_SERVICE_ROLE_KEY` | Private | Server Only | Supabase administrative backend access key | Vercel / Supabase | **YES** |
| `UPSTASH_REDIS_REST_URL` | Private | Server Only | Upstash Redis REST pipeline endpoint | Vercel / Upstash | No |
| `UPSTASH_REDIS_REST_TOKEN` | Private | Server Only | Upstash Redis REST authentication token | Vercel / Upstash | **YES** |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Public | Client / Server | Stripe publishable key (`pk_test_...`) | Vercel / Stripe | No |
| `STRIPE_SECRET_KEY` | Private | Server Only | Stripe backend secret API key (`sk_test_...`) | Vercel / Stripe | **YES** |
| `STRIPE_WEBHOOK_SECRET` | Private | Server Only | Stripe webhook signing secret (`whsec_test_...`) | Vercel / Stripe | **YES** |
| `RESEND_API_KEY` | Private | Server Only | Resend email transporter key (`re_test_...`) | Vercel / Resend | **YES** (Optional) |

---

## 2. DEPLOYMENT PLATFORM MAPPING

### Vercel Staging Configuration (Preview & Staging Environments):
- Configure all 12 variables in **Vercel Project Settings → Environment Variables** under the **Preview** and **Staging** targets.
- Mark `SUPABASE_SERVICE_ROLE_KEY`, `UPSTASH_REDIS_REST_TOKEN`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `RESEND_API_KEY` as **Sensitive / Encrypted Secrets**.

### Supabase Cloud Project Configuration:
- `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` generated in Supabase Project Settings → API.
- Apply database migrations via CLI:
  ```bash
  npx supabase db push --project-ref <staging-project-ref>
  ```

### Upstash Redis Configuration:
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` generated in Upstash Console → Database Details → REST API.

### Stripe Test Mode Configuration:
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (`pk_test_...`) and `STRIPE_SECRET_KEY` (`sk_test_...`) generated in Stripe Developers → API keys.
- `STRIPE_WEBHOOK_SECRET` (`whsec_test_...`) generated in Stripe Developers → Webhooks → Add Endpoint (`https://staging.deeplink.pro/api/stripe/webhook`).
