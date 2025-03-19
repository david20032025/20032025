import { NextResponse } from "next/server";
import { fetchMetalPrice } from "@/utils/metal-api";

// This is a server-side API route that proxies requests to the GoldAPI
// to avoid exposing the API key in client-side code
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const metal = searchParams.get("metal");
  const currency = searchParams.get("currency") || "USD";

  if (!metal) {
    return NextResponse.json(
      { error: "Metal parameter is required" },
      { status: 400 },
    );
  }

  try {
    // Validate metal parameter
    if (!["XAU", "XAG", "XPT", "XPD"].includes(metal)) {
      return NextResponse.json(
        {
          error: "Invalid metal parameter. Must be one of: XAU, XAG, XPT, XPD",
        },
        { status: 400 },
      );
    }

    // Fetch the price from the GoldAPI
    const priceData = await fetchMetalPrice(
      metal as "XAU" | "XAG" | "XPT" | "XPD",
      currency as "USD",
    );

    return NextResponse.json(priceData);
  } catch (error) {
    console.error("Error fetching metal price:", error);
    return NextResponse.json(
      { error: "Failed to fetch metal price" },
      { status: 500 },
    );
  }
}
