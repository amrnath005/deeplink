import { NextRequest, NextResponse } from "next/server";
import { evaluateTrafficQuality, TrafficSignalInput } from "@/lib/traffic_quality";

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {}

    const userAgent = req.headers.get("user-agent") || "";
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

    const headers: Record<string, string | undefined> = {
      via: req.headers.get("via") || undefined,
      "x-proxy-id": req.headers.get("x-proxy-id") || undefined,
      "x-tor-exit-node": req.headers.get("x-tor-exit-node") || undefined,
      "accept-language": req.headers.get("accept-language") || undefined,
      accept: req.headers.get("accept") || undefined,
    };

    const signalInput: TrafficSignalInput = {
      userAgent,
      ip,
      headers,
      requestRatePerMin: body.requestRatePerMin || 1,
      webdriverActive: body.webdriverActive || false,
      headlessDetected: body.headlessDetected || false,
      viewportWidth: body.viewportWidth,
      viewportHeight: body.viewportHeight,
      screenWidth: body.screenWidth,
      screenHeight: body.screenHeight,
    };

    // Execute Traffic Quality Scoring Model
    const result = evaluateTrafficQuality(signalInput, {
      lowRiskThreshold: body.lowRiskThreshold || 0.40,
      suspiciousThreshold: body.suspiciousThreshold || 0.70,
      actionOnHighRisk: body.actionOnHighRisk || "suppress_attribution_pixel",
    });

    return NextResponse.json({
      success: true,
      score: result.score,
      classification: result.classification,
      confidence: result.confidence,
      reasons: result.reasons,
      recommended_action: result.recommended_action,
      metrics: {
        linkId: body.linkId || "link_demo_9f8a",
        cpcCostUsd: body.cpcCost || 2.50,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
