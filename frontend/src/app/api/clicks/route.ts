import { NextResponse } from "next/server";
import { getRecentClicks } from "@/lib/store";

export async function GET() {
  try {
    const clicks = await getRecentClicks();
    return NextResponse.json({ success: true, clicks });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
