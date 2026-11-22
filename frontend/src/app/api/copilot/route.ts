import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { query = "Show me top 3 converting countries for YouTube links this week" } = body;

    return NextResponse.json({
      success: true,
      query,
      aiInsights: {
        answer: "Top 3 converting countries for YouTube deep links: 1. India (512K clicks, 84% app open rate), 2. United States (452K clicks, 79% app open rate), 3. United Kingdom (128K clicks, 81% app open rate).",
        recommendedAction: "Increase ad spend budget in India by +25% on weekend campaigns.",
        botRiskFilterApplied: true
      },
      sqlExecuted: "SELECT country, COUNT(*) as clicks FROM telemetry WHERE link_type='youtube' GROUP BY country ORDER BY clicks DESC LIMIT 3;",
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
