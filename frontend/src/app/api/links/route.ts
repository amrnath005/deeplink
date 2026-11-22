import { NextRequest, NextResponse } from "next/server";
import { createLink, getAllLinks } from "@/lib/store";
import { checkRateLimit } from "@/lib/ratelimit";
import { validateWorkspaceAccess } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const authResult = await validateWorkspaceAccess(req);
  if (!authResult.authorized) {
    return NextResponse.json(
      { success: false, error: authResult.errorMessage },
      { status: authResult.statusCode }
    );
  }

  const links = await getAllLinks();
  return NextResponse.json({ success: true, links });
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const rateCheck = await checkRateLimit(ip, 100, 60000);

    if (!rateCheck.success) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded. Maximum 100 link creations per minute." },
        { status: 429 }
      );
    }

    const authResult = await validateWorkspaceAccess(req);
    if (!authResult.authorized) {
      return NextResponse.json(
        { success: false, error: authResult.errorMessage },
        { status: authResult.statusCode }
      );
    }

    const body = await req.json();
    const { originalUrl, alias, expiresIn, password } = body;

    if (!originalUrl || typeof originalUrl !== "string") {
      return NextResponse.json({ success: false, error: "Original URL is required" }, { status: 400 });
    }

    let targetUrl = originalUrl.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
    }

    // Validate URL format
    try {
      new URL(targetUrl);
    } catch {
      return NextResponse.json({ success: false, error: "Invalid URL format" }, { status: 400 });
    }

    const host = req.headers.get("host") || "localhost:3000";
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const baseUrl = `${protocol}://${host}`;

    let expiresAt: string | undefined = undefined;
    if (expiresIn) {
      const hours = parseInt(expiresIn, 10);
      if (!isNaN(hours)) {
        expiresAt = new Date(Date.now() + hours * 3600 * 1000).toISOString();
      }
    }

    const link = await createLink({
      originalUrl: targetUrl,
      alias: alias || undefined,
      expiresAt,
      password: password || undefined,
      baseUrl,
    });

    return NextResponse.json({ success: true, link });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Failed to create link" }, { status: 400 });
  }
}
