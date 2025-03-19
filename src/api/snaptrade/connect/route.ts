import { createClient } from "../../../../supabase/server";
import { NextResponse } from "next/server";

/**
 * API route for initiating a SnapTrade connection
 */
export async function POST(request: Request) {
  try {
    const { userId, redirectUri } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // Get the supabase client
    const supabase = await createClient();

    // Verify the user exists
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // For now, we'll return a mock redirect URI
    // In a real implementation, you would call the SnapTrade API here
    // to generate a user registration and authorization link

    // Mock response for development
    const mockRedirectUri = `https://example.com/snaptrade/connect?userId=${userId}&redirect=${encodeURIComponent(redirectUri)}`;

    return NextResponse.json({
      success: true,
      redirectUri: mockRedirectUri,
    });
  } catch (error) {
    console.error("Error connecting to SnapTrade:", error);
    return NextResponse.json(
      { error: "Failed to connect to SnapTrade" },
      { status: 500 },
    );
  }
}
