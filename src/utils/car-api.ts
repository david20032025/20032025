// MarketCheck API integration for vehicle pricing

export async function fetchCarPrice(make: string, model: string, year: string) {
  try {
    // Call our server-side API route to avoid exposing API key in client
    const response = await fetch(
      `/api/car-prices?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&year=${encodeURIComponent(year)}`,
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching car price:", error);
    throw error;
  }
}
