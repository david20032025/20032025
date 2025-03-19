import { NextResponse } from "next/server";
import { handleSnapTradeCallback } from "@/utils/snaptrade";
import { createClient } from "@/supabase/server";

// Set cache control headers to prevent caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  console.log("SnapTrade callback received with URL:", requestUrl.toString());

  // Log all query parameters for debugging
  requestUrl.searchParams.forEach((value, key) => {
    console.log(`Query param: ${key} = ${value}`);
  });

  const userId = requestUrl.searchParams.get("userId");
  const success = requestUrl.searchParams.get("success") === "true";
  const brokerage = requestUrl.searchParams.get("brokerage") || "unknown";
  const authorizationId =
    requestUrl.searchParams.get("authorizationId") || "unknown";

  if (!userId) {
    console.log("No userId found in callback, redirecting to assets page");
    return NextResponse.redirect(
      new URL("/dashboard/assets?error=missing_user_id", requestUrl.origin),
    );
  }

  if (!success) {
    console.log("Success parameter is not true, redirecting with error");
    return NextResponse.redirect(
      new URL("/dashboard/assets?error=connection_failed", requestUrl.origin),
    );
  }

  try {
    console.log("Creating Supabase client for user verification");
    const supabase = await createClient();

    // Get the current user to verify they match the userId from SnapTrade
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("Error getting user:", userError);
      throw new Error(`Auth error: ${userError.message}`);
    }

    if (!user) {
      console.error("No authenticated user found");
      throw new Error("No authenticated user");
    }

    if (user.id !== userId) {
      console.error("User mismatch:", {
        authUserId: user.id,
        callbackUserId: userId,
      });
      throw new Error("User mismatch");
    }

    // Handle the callback
    await handleSnapTradeCallback(userId, authorizationId, brokerage);

    console.log("Successfully processed callback, redirecting to assets page");
    // Redirect to assets page with success message
    return NextResponse.redirect(
      new URL("/dashboard/assets?success=true", requestUrl.origin),
    );
  } catch (error) {
    console.error("Error processing SnapTrade callback:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    // Redirect with error
    return NextResponse.redirect(
      new URL(
        `/dashboard/assets?error=true&message=${encodeURIComponent(errorMessage)}`,
        requestUrl.origin,
      ),
    );
  }
}
