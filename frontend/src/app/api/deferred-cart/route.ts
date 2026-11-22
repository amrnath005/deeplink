import { NextRequest, NextResponse } from "next/server";
import { getRecentClicks } from "@/lib/store";

export async function GET(req: NextRequest) {
  try {
    const forwardedIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const realIp = req.headers.get("x-real-ip");
    const clientIp = forwardedIp || realIp || "127.0.0.1";

    const userAgent = req.headers.get("user-agent") || "";
    const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
    const isAndroid = /Android/i.test(userAgent);

    const recentClicks = await getRecentClicks();

    // Match click by IP & OS platform within 2-hour attribution window
    const now = Date.now();
    const matchedClick = recentClicks.find((click) => {
      const isIpMatch = click.ip === clientIp || clientIp === "127.0.0.1";
      const clickTime = new Date(click.timestamp).getTime();
      const isWithinWindow = now - clickTime < 2 * 60 * 60 * 1000;
      return isIpMatch && isWithinWindow;
    });

    if (!matchedClick) {
      return NextResponse.json({
        success: false,
        message: "No pending deferred deep link found for this device.",
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      deferredLink: {
        alias: matchedClick.alias,
        timestamp: matchedClick.timestamp,
        ip: matchedClick.ip,
        country: matchedClick.country,
        device: matchedClick.device,
        cartItems: [
          { sku: "SKU_PROMO_992", title: "Smart DeepLink License", quantity: 1, price: 29.00 }
        ],
        promoCode: "AUTOCART2026",
        affiliateId: "aff_top_creator",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
