import { NextRequest, NextResponse } from "next/server";
import { negotiateAgentCommerce } from "@/lib/agent_commerce";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { alias = "nike-air-max" } = body;
    const userAgent = req.headers.get("user-agent") || "OpenAI Operator Agent";

    const handshake = negotiateAgentCommerce(alias, userAgent);

    return NextResponse.json({
      success: true,
      aiAgentHandshake: handshake,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
