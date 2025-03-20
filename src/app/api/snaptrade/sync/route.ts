import { NextResponse } from "next/server";
import {
  fetchSnapTradeAccounts,
  fetchSnapTradeHoldings,
} from "@/utils/snaptrade";
import { createClient } from "@/supabase/server";

// Set cache control headers to prevent caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    // Create Supabase client
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("Error getting user:", userError);
      return NextResponse.json(
        { error: "Authentication error" },
        { status: 401 },
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 },
      );
    }

    // Get accounts
    let accounts = [];
    let holdings = [];
    let syncStatus = "success";
    let syncMessage = "Data synchronized successfully";

    try {
      accounts = await fetchSnapTradeAccounts(user.id);
    } catch (accountsError) {
      console.error("Error fetching accounts:", accountsError);
      syncStatus = "partial";
      syncMessage = "Could not fetch all account information";
      // Provide empty accounts array to prevent undefined errors
      accounts = [];
    }

    // Get holdings for all accounts
    try {
      holdings = await fetchSnapTradeHoldings(user.id);
    } catch (holdingsError) {
      console.error("Error fetching holdings:", holdingsError);
      syncStatus = "partial";
      syncMessage = "Could not fetch all holdings information";
      // Provide empty holdings array to prevent undefined errors
      holdings = [];
    }

    return NextResponse.json({
      success: true,
      syncStatus,
      syncMessage,
      accounts,
      holdings,
    });
  } catch (error) {
    console.error("Error syncing SnapTrade data:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        error: errorMessage,
        success: false,
        syncStatus: "failed",
        syncMessage: errorMessage,
        accounts: [],
        holdings: [],
      },
      { status: 500 },
    );
  }
}
