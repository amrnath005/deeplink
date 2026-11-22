import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { alias = "ab-test-link", variants = [] } = body;

    // Default variants fallback if none provided
    const activeVariants = variants.length > 0 ? variants : [
      { name: "Variant A (Checkout Page 1)", url: "https://store.com/checkout-a", weight: 50 },
      { name: "Variant B (Checkout Page 2)", url: "https://store.com/checkout-b", weight: 50 }
    ];

    // Weighted random selection algorithm
    const totalWeight = activeVariants.reduce((sum: number, v: any) => sum + (v.weight || 50), 0);
    let random = Math.random() * totalWeight;

    let selectedVariant = activeVariants[0];
    for (const variant of activeVariants) {
      if (random < (variant.weight || 50)) {
        selectedVariant = variant;
        break;
      }
      random -= (variant.weight || 50);
    }

    return NextResponse.json({
      success: true,
      alias,
      totalVariants: activeVariants.length,
      selectedVariant: {
        name: selectedVariant.name,
        targetUrl: selectedVariant.url,
        weight: selectedVariant.weight || 50,
      },
      splitRatio: activeVariants.map((v: any) => `${v.name}: ${v.weight}%`).join(" | "),
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
