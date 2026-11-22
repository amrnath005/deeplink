import { NextRequest, NextResponse } from "next/server";
import { validateConversionInput } from "@/lib/repository/entities";
import { RepositoryV2 } from "@/lib/repository/store_v2";
import { checkRateLimit } from "@/lib/ratelimit";
import { validateWorkspaceAccess } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    
    // Rate Limiting: Max 200 event ingestions per minute per IP
    const rateCheck = await checkRateLimit(`events_${ip}`, 200, 60000);
    if (!rateCheck.success) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded. Maximum 200 event ingestions per minute." },
        { status: 429 }
      );
    }

    // P0-2 Workspace Authorization Guard
    const authResult = await validateWorkspaceAccess(req);
    if (!authResult.authorized) {
      return NextResponse.json(
        { success: false, error: authResult.errorMessage },
        { status: authResult.statusCode }
      );
    }

    const workspaceId = authResult.session!.workspaceId;

    // Parse and Validate Input Body
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON request body" }, { status: 400 });
    }

    const validation = validateConversionInput(body);
    if (!validation.valid || !validation.data) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
    }

    // Ingest Conversion Event via Repository (Strict Idempotency)
    const result = await RepositoryV2.ingestConversionEvent(workspaceId, validation.data);

    if (result.isDuplicate) {
      return NextResponse.json(
        {
          success: true,
          message: "Conversion event already ingested (Duplicate order_id & event combination suppressed)",
          is_duplicate: true,
          conversion: result.conversion
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Conversion event successfully ingested and attributed",
        is_duplicate: false,
        conversion: result.conversion,
        attribution: result.attribution
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process conversion event" },
      { status: 500 }
    );
  }
}

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
    const conversions = await RepositoryV2.getConversionsByWorkspace(workspaceId);
    return NextResponse.json({ success: true, count: conversions.length, conversions });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
