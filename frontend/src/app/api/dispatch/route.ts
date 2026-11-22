import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { alias = "welcome-offer", targetUser = "user_9f8a", appOpened = true } = body;

    return NextResponse.json({
      success: true,
      alias,
      targetUser,
      webhookDispatched: {
        customerIo: "SENT_WELCOME_EMAIL_SEQUENCE",
        klaviyo: "RECORDED_DEEP_LINK_CONVERSION",
        brazePushNotification: "SENT_IN_APP_DISCOUNT_POPUP"
      },
      dispatchLatencyMs: 6,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
