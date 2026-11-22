import { NextResponse } from "next/server";

export async function GET() {
  const manifest = {
    applinks: {
      apps: [],
      details: [
        {
          appID: "TEAMID.com.deeplink.pro",
          paths: ["*", "/[alias]", "/link/*"]
        }
      ]
    },
    webcredentials: {
      apps: ["TEAMID.com.deeplink.pro"]
    }
  };

  return new NextResponse(JSON.stringify(manifest, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600, s-maxage=86400"
    }
  });
}
