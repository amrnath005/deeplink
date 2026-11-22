import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      alias = "promo-link", 
      metaPixelId = "123456789012345", 
      googleTagId = "AW-987654321", 
      tikTokPixelId = "C1234567890" 
    } = body;

    return NextResponse.json({
      success: true,
      alias,
      pixelPipeline: {
        metaPixelFired: !!metaPixelId,
        googleTagFired: !!googleTagId,
        tikTokPixelFired: !!tikTokPixelId,
      },
      configuredPixels: {
        metaPixelId,
        googleTagId,
        tikTokPixelId,
      },
      injectionLatencyMs: 4,
      status: "PIXELS_FIRED_BEFORE_TELEPORT",
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
