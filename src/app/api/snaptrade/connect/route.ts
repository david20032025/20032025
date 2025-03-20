import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import { deleteSnapTradeConnection } from "@/utils/snaptrade";

// Set cache control headers to prevent caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const connectionId = url.searchParams.get("connectionId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    if (!connectionId) {
      return NextResponse.json(
        { error: "Connection ID is required" },
        { status: 400 },
      );
    }

    // Verify the user is authenticated
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("Error getting user:", userError);
      return NextResponse.json(
        { error: `Auth error: ${userError.message}` },
        { status: 401 },
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 },
      );
    }

    if (user.id !== userId) {
      return NextResponse.json({ error: "User ID mismatch" }, { status: 403 });
    }

    // Delete the connection from SnapTrade
    await deleteSnapTradeConnection(userId, connectionId);

    // Delete the connection from the database
    const { error: deleteError } = await supabase
      .from("broker_connections")
      .delete()
      .eq("user_id", userId)
      .eq("connection_id", connectionId);

    if (deleteError) {
      console.error("Error deleting connection from database:", deleteError);
      return NextResponse.json(
        { error: `Database error: ${deleteError.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting SnapTrade connection:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
