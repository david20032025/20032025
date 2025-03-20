import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import { getUserSecret, fetchSnapTradeAccounts } from "@/utils/snaptrade";
import { snaptrade } from "@/utils/snaptrade-sdk";

/**
 * API route to manually refresh SnapTrade data
 */
export async function POST(request: NextRequest) {
  try {
    // Get the user ID from the request
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // Get the user's Supabase session
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Check if the user is authenticated
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the user ID matches the authenticated user
    if (session.user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user's SnapTrade connection
    const { data: connection } = await supabase
      .from("broker_connections")
      .select("broker_data")
      .eq("user_id", userId)
      .eq("broker_id", "snaptrade")
      .maybeSingle();

    if (!connection) {
      return NextResponse.json(
        { error: "No SnapTrade connection found" },
        { status: 404 },
      );
    }

    const authorizationId = connection.broker_data?.authorization_id;

    if (!authorizationId) {
      return NextResponse.json(
        { error: "No authorization ID found" },
        { status: 404 },
      );
    }

    // Get the user secret
    const userSecret = await getUserSecret(userId);

    // Refresh the brokerage authorization
    await snaptrade.connections.refreshBrokerageAuthorization({
      authorizationId,
      userId,
      userSecret,
    });

    // Fetch updated accounts
    const accounts = await fetchSnapTradeAccounts(userId);

    // Delete existing assets for this user from SnapTrade
    await supabase
      .from("assets")
      .delete()
      .eq("user_id", userId)
      .eq("metadata->source", "snaptrade");

    // Get category ID for investments
    const { data: categoryData } = await supabase
      .from("asset_categories")
      .select("id")
      .eq("slug", "investments")
      .single();

    if (!categoryData) {
      return NextResponse.json(
        { error: "Investment category not found" },
        { status: 404 },
      );
    }

    // For each account, get the positions and balances
    for (const account of accounts) {
      // Get positions for the account
      const positionsResponse =
        await snaptrade.accountInformation.getUserAccountPositions({
          userId,
          userSecret,
          accountId: account.id,
        });

      if (positionsResponse.data) {
        // Process each position
        for (const position of positionsResponse.data) {
          if (!position.symbol) continue;

          // Calculate values
          const quantity = parseFloat(position.quantity || "0");
          const price = parseFloat(position.price || "0");
          const bookValue = parseFloat(position.bookValue || "0");
          const totalValue = quantity * price;

          // Insert the position as an asset
          await supabase.from("assets").insert({
            name: position.symbol.symbol || position.symbol,
            value: totalValue,
            description: `${quantity} shares of ${position.symbol.symbol || position.symbol}`,
            location: account.name || "SnapTrade",
            acquisition_date: new Date().toISOString(),
            acquisition_value: bookValue || totalValue,
            category_id: categoryData.id,
            is_liability: false,
            user_id: userId,
            metadata: {
              symbol: position.symbol.symbol || position.symbol,
              price_per_share: price,
              purchase_price: bookValue / quantity,
              quantity: quantity,
              currency: position.currency || "USD",
              asset_type: "stock",
              source: "snaptrade",
              account_id: account.id,
              account_name: account.name || "Investment Account",
              broker_name: account.brokerage?.name || "SnapTrade",
            },
          });
        }
      }

      // Get balances for the account
      const balancesResponse =
        await snaptrade.accountInformation.getUserAccountBalance({
          userId,
          userSecret,
          accountId: account.id,
        });

      if (balancesResponse.data) {
        // Process cash balances
        for (const balance of balancesResponse.data) {
          // Special handling for Interactive Brokers cash balances
          // Check if it's cash or if the amount is positive
          const isCash = balance.cash || balance.type === "CASH";
          const amount = parseFloat(balance.amount || "0");
          const brokerName = account.brokerage?.name || "";

          if (
            (isCash && amount > 0) ||
            (brokerName.toUpperCase().includes("INTERACTIVE") && amount > 0)
          ) {
            console.log(
              `Processing cash balance: ${amount} ${balance.currency}`,
            );

            // Insert the cash as an asset
            await supabase.from("assets").insert({
              name: `Cash (${balance.currency})`,
              value: amount,
              description: `Cash balance in ${account.name}`,
              location: account.name || "SnapTrade",
              acquisition_date: new Date().toISOString(),
              acquisition_value: amount,
              category_id: categoryData.id,
              is_liability: false,
              user_id: userId,
              metadata: {
                symbol: "CASH",
                price_per_share: amount,
                purchase_price: amount,
                quantity: 1,
                currency: balance.currency || "USD",
                asset_type: "cash",
                source: "snaptrade",
                account_id: account.id,
                account_name: account.name || "Investment Account",
                broker_name: account.brokerage?.name || "SnapTrade",
                balance_type: balance.type || "CASH",
              },
            });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "SnapTrade data refreshed successfully",
      accounts: accounts.length,
    });
  } catch (error) {
    console.error("Error refreshing SnapTrade data:", error);
    return NextResponse.json(
      { error: error.message || "Unknown error" },
      { status: 500 },
    );
  }
}
