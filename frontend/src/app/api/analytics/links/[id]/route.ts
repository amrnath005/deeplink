import { NextRequest, NextResponse } from "next/server";
import { RepositoryV2 } from "@/lib/repository/store_v2";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const workspaceId = req.headers.get("x-workspace-id") || "ws_default";
    const linkAnalytics = await RepositoryV2.getSingleLinkAnalytics(workspaceId, id);

    if (!linkAnalytics) {
      return NextResponse.json({ success: false, error: `Link '${id}' not found` }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      link: linkAnalytics,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
