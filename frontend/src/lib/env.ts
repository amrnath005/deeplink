/**
 * DeepLink Pro — Staging & Production Environment Secret Guard
 * Validates environment separation, key formatting, and secret leakage prevention.
 */

export interface EnvValidationResult {
  isConfigValid: boolean;
  environment: string;
  errors: string[];
  warnings: string[];
}

export function validateEnvironmentVariables(): EnvValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const env = process.env.NODE_ENV || "development";

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const stripePub = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
  const stripeSecret = process.env.STRIPE_SECRET_KEY || "";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  // 1. Client-Side Secret Leakage Prevention Check
  Object.keys(process.env).forEach((key) => {
    if (key.startsWith("NEXT_PUBLIC_")) {
      const val = process.env[key] || "";
      if (val.startsWith("sk_live_") || val.startsWith("sk_test_") || val.startsWith("whsec_")) {
        errors.push(`CRITICAL SECURITY FAILURE: Client variable '${key}' contains a server secret!`);
      }
    }
  });

  // 2. Environment Key Type Checks
  if (env === "staging") {
    if (stripeSecret.startsWith("sk_live_")) {
      errors.push("STAGING SECURITY FAILURE: Production Stripe live key ('sk_live_') used in staging environment!");
    }
    if (!appUrl.includes("staging") && !appUrl.includes("localhost")) {
      warnings.push(`Staging APP_URL '${appUrl}' does not match expected staging domain pattern.`);
    }
  }

  return {
    isConfigValid: errors.length === 0,
    environment: env,
    errors,
    warnings,
  };
}
