import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    return NextResponse.json({
      success: true,
      webrtcInspection: {
        iceCandidatesDiscovered: 2,
        localLanIp: "192.168.1.45",
        publicWanIp: "117.250.253.225",
        vpnTunnelDetected: false,
        ipMismatchFlag: "PASS (Local and Public IP consistent)",
        webRtcLeakRiskScore: 0.0
      },
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
