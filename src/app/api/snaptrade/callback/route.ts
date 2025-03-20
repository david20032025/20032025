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

  // Get custom redirect path if provided
  let redirectPath =
    requestUrl.searchParams.get("redirect") || "/dashboard/assets";

  // If redirectPath is a full URL, extract just the path portion if it's from the same origin
  // Otherwise keep the full URL for external redirects
  if (redirectPath.startsWith("http")) {
    try {
      const redirectUrl = new URL(redirectPath);
      // If it's the same origin, just use the path
      if (redirectUrl.origin === requestUrl.origin) {
        redirectPath =
          redirectUrl.pathname + redirectUrl.search + redirectUrl.hash;
      }
      // Otherwise keep the full URL for external redirects
    } catch (e) {
      console.error("Error parsing redirect URL:", e);
      // Fall back to default if URL parsing fails
      redirectPath = "/dashboard/assets";
    }
  }

  console.log(`Redirect path from params: ${redirectPath}`);

  if (!userId) {
    // Get redirect path even if userId is missing
    const fallbackPath =
      requestUrl.searchParams.get("redirect") || "/dashboard/assets";
    console.log(`No userId found in callback, redirecting to ${fallbackPath}`);
    return NextResponse.redirect(
      new URL(`${fallbackPath}?error=missing_user_id`, requestUrl.origin),
    );
  }

  if (!success) {
    console.log("Success parameter is not true, redirecting with error");
    return NextResponse.redirect(
      new URL(
        `${redirectPath}?error=connection_failed&broker=${encodeURIComponent(brokerage)}`,
        requestUrl.origin,
      ),
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

    console.log(
      `Successfully processed callback, redirecting to ${redirectPath}`,
    );

    // Ensure we have the full URL with origin for relative paths
    // For absolute URLs, use them directly
    let fullRedirectUrl;
    if (redirectPath.startsWith("http")) {
      fullRedirectUrl = new URL(
        `${redirectPath}${redirectPath.includes("?") ? "&" : "?"}success=true&broker=${encodeURIComponent(brokerage)}`,
      );
    } else {
      fullRedirectUrl = new URL(
        `${redirectPath}?success=true&broker=${encodeURIComponent(brokerage)}`,
        requestUrl.origin,
      );
    }

    console.log(`Full redirect URL: ${fullRedirectUrl.toString()}`);

    // Redirect to specified page with success message
    return NextResponse.redirect(fullRedirectUrl);
  } catch (error) {
    console.error("Error processing SnapTrade callback:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    // Redirect with error to the specified path
    let errorRedirectUrl;
    if (redirectPath.startsWith("http")) {
      errorRedirectUrl = new URL(
        `${redirectPath}${redirectPath.includes("?") ? "&" : "?"}error=true&message=${encodeURIComponent(errorMessage)}`,
      );
    } else {
      errorRedirectUrl = new URL(
        `${redirectPath}?error=true&message=${encodeURIComponent(errorMessage)}`,
        requestUrl.origin,
      );
    }

    return NextResponse.redirect(errorRedirectUrl);
  }
}
