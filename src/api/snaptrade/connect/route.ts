import { createClient } from "../../../../supabase/server";
import { NextResponse } from "next/server";
import { snapTradeClient } from "../../../utils/snaptrade";
import { deleteSnapTradeConnection } from "../../../utils/snaptrade";

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

    // Call the SnapTrade API to generate a user registration and authorization link
    const response = await snapTradeClient.generateUserRegistrationLink({
      userId: userId.toString(),
      redirectUri:
        redirectUri ||
        process.env.NEXT_PUBLIC_APP_URL + "/dashboard/investments",
    });

    return NextResponse.json({
      success: true,
      redirectUri: response.redirectUri,
    });
  } catch (error) {
    console.error("Error connecting to SnapTrade:", error);
    return NextResponse.json(
      { error: "Failed to connect to SnapTrade" },
      { status: 500 },
    );
  }
}

/**
 * API route for deleting a SnapTrade connection
 */
export async function DELETE(request: Request) {
  try {
    const { userId, authorizationId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    if (!authorizationId) {
      return NextResponse.json(
        { error: "Authorization ID is required" },
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

    // Delete the connection from SnapTrade
    await deleteSnapTradeConnection(userId, authorizationId);

    // Update the broker_connections table to mark the connection as inactive
    // We're using the broker_data JSONB field which contains the authorization_id
    const { error: updateError } = await supabase
      .from("broker_connections")
      .update({
        is_active: false,
        broker_data: supabase.rpc("jsonb_set", {
          jsonb: supabase.raw("broker_data"),
          path: "{disconnected_at}",
          value: JSON.stringify(new Date().toISOString()),
        }),
      })
      .eq("user_id", userId)
      .eq("broker_id", "snaptrade")
      .filter("broker_data->>'authorization_id'", "eq", authorizationId);

    if (updateError) {
      console.error("Error updating broker connection:", updateError);
      return NextResponse.json(
        { error: "Failed to update broker connection" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "SnapTrade connection deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting SnapTrade connection:", error);
    return NextResponse.json(
      { error: "Failed to delete SnapTrade connection" },
      { status: 500 },
    );
  }
}
