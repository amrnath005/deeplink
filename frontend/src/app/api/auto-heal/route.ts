import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { alias, originalUrl, fallbackUrl } = body;

    let isBroken = false;
    let statusCode = 200;

    try {
      const ping = await fetch(originalUrl, { method: "HEAD", redirect: "follow" });
      statusCode = ping.status;
      if (ping.status >= 400) {
        isBroken = true;
      }
    } catch {
      isBroken = true;
      statusCode = 503;
    }

    const autoHealedUrl = isBroken ? (fallbackUrl || "https://deeplink.pro/fallback-store") : originalUrl;

    return NextResponse.json({
      success: true,
      alias: alias || "demo-link",
      originalUrl,
      statusCode,
      isHealed: isBroken,
      resolvedDestination: autoHealedUrl,
      healedReason: isBroken ? `Original destination failed with HTTP ${statusCode}. Auto-routed to backup fabric.` : "Link healthy",
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
