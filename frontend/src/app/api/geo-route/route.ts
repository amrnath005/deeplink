import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { alias = "amazon-deal", countryCode = "IN", geoRoutes = {} } = body;

    const defaultRoutes: Record<string, string> = {
      IN: "https://amazon.in/dp/B0CX2B4W12",
      US: "https://amazon.com/dp/B0CX2B4W12",
      UK: "https://amazon.co.uk/dp/B0CX2B4W12",
      CA: "https://amazon.ca/dp/B0CX2B4W12",
      DE: "https://amazon.de/dp/B0CX2B4W12",
      FALLBACK: "https://amazon.com/dp/B0CX2B4W12"
    };

    const routesMap = Object.keys(geoRoutes).length > 0 ? geoRoutes : defaultRoutes;
    const resolvedUrl = routesMap[countryCode.toUpperCase()] || routesMap["FALLBACK"] || routesMap["US"];

    return NextResponse.json({
      success: true,
      alias,
      detectedCountry: countryCode.toUpperCase(),
      resolvedDestination: resolvedUrl,
      availableGeoNodes: Object.keys(routesMap),
      isFallbackTriggered: !routesMap[countryCode.toUpperCase()],
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
