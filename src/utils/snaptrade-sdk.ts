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

// List of officially supported SnapTrade brokers
// Note: Only include brokers that are confirmed to work with the SnapTrade API
export const SUPPORTED_BROKERS = [
  "ALPACA",
  "FIDELITY",
  "QUESTRADE",
  "ROBINHOOD",
  "TRADIER",
  "TRADING_212",
  "TRADESTATION",
  "VANGUARD",
];

// Mapping from display IDs to SnapTrade broker IDs
export const BROKER_ID_MAPPING: Record<string, string> = {
  alpaca: "ALPACA",
  fidelity: "FIDELITY",
  ibkr: "IBKR", // Interactive Brokers mapping
  interactive_brokers: "IBKR", // Alternative mapping
  questrade: "QUESTRADE",
  robinhood: "ROBINHOOD",
  tradier: "TRADIER",
  trading212: "TRADING_212",
  tradestation: "TRADESTATION",
  vanguard: "VANGUARD",
};

// Mapping for common broker ID variations to standardized SnapTrade broker IDs
export const BROKER_ID_STANDARDIZATION: Record<string, string> = {
  INTERACTIVE_BROKERS: "IBKR",
};

export { snaptrade };
