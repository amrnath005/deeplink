import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { alias = "unreleased-game-2026", deviceOs = "iOS" } = body;

    return NextResponse.json({
      success: true,
      alias,
      preRegistrationTriggered: {
        targetOs: deviceOs,
        appStoreUrl: deviceOs === "iOS" ? "https://apps.apple.com/app/id123456789" : "https://play.google.com/store/apps/details?id=com.game",
        autoSubscribeNotification: true,
        preRegisterConversionLift: "+180%"
      },
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
