import { NextRequest, NextResponse } from "next/server";
import { exportToCsvString } from "@/lib/store";

export async function GET(req: NextRequest) {
  try {
    const { linksCsv, clicksCsv } = exportToCsvString();
    const type = req.nextUrl.searchParams.get("type") || "clicks";

    const content = type === "links" ? linksCsv : clicksCsv;
    const filename = type === "links" ? "deeplink_links.csv" : "deeplink_clicks.csv";

    return new Response(content, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache"
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
