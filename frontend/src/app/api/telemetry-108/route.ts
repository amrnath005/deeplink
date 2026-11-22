import { NextResponse } from "next/server";
import { collect108TelemetrySignals } from "@/lib/fingerprint";

export async function GET() {
  const telemetry = await collect108TelemetrySignals();
  return NextResponse.json({
    success: true,
    totalSignalsCaptured: 108,
    telemetryMatrix: telemetry,
    timestamp: new Date().toISOString()
  });
}
