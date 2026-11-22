import { NextResponse } from "next/server";

export async function GET() {
  const manifest = [
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: "com.deeplink.pro",
        sha256_cert_fingerprints: [
          "14:6D:E9:01:07:52:43:2A:FE:EF:66:E8:4A:22:98:81:42:04:12:15:A2:4B:91:30:19:22:10:44:88:51:99:32"
        ]
      }
    }
  ];

  return new NextResponse(JSON.stringify(manifest, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600, s-maxage=86400"
    }
  });
}
