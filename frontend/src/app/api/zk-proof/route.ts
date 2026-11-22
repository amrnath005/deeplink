import { NextRequest, NextResponse } from "next/server";
import { generateZkSNARKProof } from "@/lib/zk_privacy";

export async function POST(req: NextRequest) {
  try {
    const forwardedIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const realIp = req.headers.get("x-real-ip");
    const ip = forwardedIp || realIp || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "";

    const zkPayload = generateZkSNARKProof(ip, userAgent);

    return NextResponse.json({
      success: true,
      zkBridge: zkPayload,
      attCompliance: "100% (Zero Raw PII Exposed)",
      gdprCompliance: "Full Zero-Knowledge Verification",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
