import { NextRequest, NextResponse } from "next/server";
import { RepositoryV2 } from "@/lib/repository/store_v2";
import { validateWorkspaceAccess } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const authResult = await validateWorkspaceAccess(req);

    if (!authResult.authorized) {
      return NextResponse.json(
        { success: false, error: authResult.errorMessage },
        { status: authResult.statusCode }
      );
    }

    const workspaceId = authResult.session!.workspaceId;
    const campaigns = await RepositoryV2.getCampaignsAnalytics(workspaceId);

    return NextResponse.json({
      success: true,
      count: campaigns.length,
      campaigns,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
