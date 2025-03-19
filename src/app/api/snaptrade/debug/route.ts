import { NextResponse } from "next/server";

// Set cache control headers to prevent caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    // Check if environment variables are set
    const clientId = process.env.NEXT_PUBLIC_SNAPTRADE_CLIENT_ID;
    const consumerKey = process.env.NEXT_PUBLIC_SNAPTRADE_CONSUMER_KEY;

    return NextResponse.json(
      {
        status: "ok",
        environment: {
          clientId: clientId ? "Set" : "Not set",
          consumerKey: consumerKey ? "Set" : "Not set",
        },
        message:
          "SnapTrade integration is being reimplemented. Environment variables check only.",
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    );
  } catch (error) {
    console.error("Error checking environment variables:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { error: errorMessage },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, max-age=0, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    );
  }
}
