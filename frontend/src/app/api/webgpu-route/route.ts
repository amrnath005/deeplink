import { NextRequest, NextResponse } from "next/server";
import { computeWebGpuHardwareHash } from "@/lib/webgpu_enclave";

export async function POST(req: NextRequest) {
  try {
    const userAgent = req.headers.get("user-agent") || "";
    const gpuSignature = computeWebGpuHardwareHash(userAgent);

    return NextResponse.json({
      success: true,
      webGpuSignature: gpuSignature,
      bypassInAppStorageWipe: true,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
