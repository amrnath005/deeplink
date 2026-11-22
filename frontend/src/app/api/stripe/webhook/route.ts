import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase, isSupabaseConfigured } from "@/lib/db";
import { sendUpgradeEmail } from "@/lib/email";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder_key");

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");
    const isProdOrStaging = process.env.NODE_ENV === "production" || process.env.NODE_ENV === "staging";
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: Stripe.Event;

    // Fail-Closed Webhook Verification Safeguard for Production & Staging
    if (isProdOrStaging) {
      if (!webhookSecret) {
        console.error("[Security Blocker Alert] STRIPE_WEBHOOK_SECRET missing in production/staging!");
        return NextResponse.json(
          { error: "Configuration Error: STRIPE_WEBHOOK_SECRET is required in production/staging." },
          { status: 500 }
        );
      }

      if (!sig) {
        return NextResponse.json(
          { error: "Signature Failure: Missing stripe-signature HTTP header." },
          { status: 400 }
        );
      }

      try {
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
      } catch (err: any) {
        return NextResponse.json(
          { error: `Webhook Signature Verification Failed: ${err.message}` },
          { status: 400 }
        );
      }
    } else {
      // Development Local Testing Fallback
      if (webhookSecret && sig) {
        try {
          event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
        } catch (err: any) {
          return NextResponse.json(
            { error: `Webhook Signature Verification Failed: ${err.message}` },
            { status: 400 }
          );
        }
      } else {
        try {
          event = JSON.parse(body) as Stripe.Event;
        } catch {
          return NextResponse.json({ error: "Malformed JSON payload" }, { status: 400 });
        }
      }
    }

    // Process Validated Event Types
    if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated") {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId || "user_demo";

      if (isSupabaseConfigured()) {
        await supabase.from("users").upsert({
          clerk_id: userId,
          subscription_status: "pro",
          subscription_id: subscription.id,
          updated_at: new Date().toISOString()
        });
      }

      await sendUpgradeEmail({
        to: subscription.metadata?.email || "customer@example.com",
        name: subscription.metadata?.name || "DeepLink Pro Customer",
        planName: "Pro Tier"
      });

      console.log(`[Stripe Webhook Verified] Upgraded user ${userId} to PRO tier & sent email confirmation`);
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId || "user_demo";

      if (isSupabaseConfigured()) {
        await supabase.from("users").update({
          subscription_status: "free",
          updated_at: new Date().toISOString()
        }).eq("clerk_id", userId);
      }
      console.log(`[Stripe Webhook Verified] Downgraded user ${userId} to FREE tier`);
    }

    return NextResponse.json({ received: true, id: event.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
