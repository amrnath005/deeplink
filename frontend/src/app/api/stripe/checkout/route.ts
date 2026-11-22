import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder_key";
const stripe = new Stripe(stripeSecretKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { priceId, plan = "pro", userId = "user_demo" } = body;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Demo / Production Session Creator
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({
        success: true,
        mode: "DEMO_STRIPE_SESSION",
        url: `${appUrl}/dashboard?upgraded=true&plan=${plan}`,
        message: "Stripe API key not set. Simulating instant Pro upgrade checkout redirect."
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId || process.env.STRIPE_PRO_PRICE_ID, quantity: 1 }],
      success_url: `${appUrl}/dashboard?upgraded=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/dashboard?cancelled=true`,
      metadata: { userId, plan },
    });

    return NextResponse.json({ success: true, url: session.url });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
