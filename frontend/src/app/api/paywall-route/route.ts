import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { deviceTier = "High-End (Apple M3 Max)" } = body;

    const isHighEnd = deviceTier.includes("Apple M3") || deviceTier.includes("RTX");
    const paywallTarget = isHighEnd ? "PRO_ULTIMATE_TIER ($299/yr)" : "STANDARD_TIER ($49/yr)";

    return NextResponse.json({
      success: true,
      deviceTier,
      dynamicPaywall: {
        paywallTarget,
        discountApplied: isHighEnd ? "10%" : "25%",
        expectedConversionLift: "+42%",
        reason: isHighEnd ? "High purchasing power hardware detected" : "Budget-friendly tier auto-routed"
      },
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
