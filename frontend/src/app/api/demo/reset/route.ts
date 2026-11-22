import { NextRequest, NextResponse } from "next/server";
import { resetDemoWorkspace, seedDemoWorkspace } from "@/lib/demo_sandbox";

export async function POST(req: NextRequest) {
  try {
    const summary = await resetDemoWorkspace();
    return NextResponse.json({
      success: true,
      message: "Demo Sandbox Workspace successfully reset and re-seeded.",
      summary,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const summary = await seedDemoWorkspace();
    return NextResponse.json({
      success: true,
      message: "Demo Sandbox Workspace status retrieved.",
      summary,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
