import { Snaptrade } from "snaptrade-typescript-sdk";

// Initialize the SnapTrade SDK with environment variables
let snaptrade: Snaptrade | null = null;

// Initialize the SDK only on the server side
if (typeof window === "undefined") {
  const clientId = process.env.NEXT_PUBLIC_SNAPTRADE_CLIENT_ID;
  const consumerKey = process.env.NEXT_PUBLIC_SNAPTRADE_CONSUMER_KEY;

  if (!clientId || !consumerKey) {
    console.error("SnapTrade API credentials not configured");
  } else {
    snaptrade = new Snaptrade({
      clientId,
      consumerKey,
      // Add additional configuration to ensure proper handling
      apiUrl: "https://api.snaptrade.com/api/v1",
    });
  }
}

export { snaptrade };
