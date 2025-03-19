// Metal API utility functions

const API_KEY = "goldapi-k5asm8bkaaim-io";
const API_BASE_URL = "https://www.goldapi.io/api";

type MetalSymbol = "XAU" | "XAG" | "XPT" | "XPD";
type Currency = "USD";

interface MetalPrice {
  price: number;
  currency: Currency;
  timestamp: number;
  metal: MetalSymbol;
}

/**
 * Fetches the current price of a metal from GoldAPI.io
 * @param metal The metal symbol (XAU, XAG, XPT, XPD)
 * @param currency The currency code (USD)
 * @returns Promise with the metal price data
 */
export async function fetchMetalPrice(
  metal: MetalSymbol,
  currency: Currency = "USD",
): Promise<MetalPrice> {
  try {
    const response = await fetch(`${API_BASE_URL}/${metal}/${currency}`, {
      method: "GET",
      headers: {
        "x-access-token": API_KEY,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      price: data.price,
      currency: currency,
      timestamp: data.timestamp,
      metal: metal,
    };
  } catch (error) {
    console.error("Error fetching metal price:", error);
    throw error;
  }
}

/**
 * Get the metal symbol for the GoldAPI based on the metal type
 * @param metalType The metal type (gold, silver, platinum, palladium)
 * @returns The metal symbol for the API
 */
export function getMetalSymbol(metalType: string): MetalSymbol {
  switch (metalType) {
    case "gold":
      return "XAU";
    case "silver":
      return "XAG";
    case "platinum":
      return "XPT";
    case "palladium":
      return "XPD";
    default:
      throw new Error(`Unsupported metal type: ${metalType}`);
  }
}
