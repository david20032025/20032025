import { NextResponse } from "next/server";

// This is a simple CORS proxy to help with API requests that might be blocked by CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

export async function POST(request: Request) {
  // Handle CORS preflight requests
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { url, method, headers, body } = await request.json();

    if (!url) {
      throw new Error("URL is required");
    }

    console.log(`Proxying request to: ${url}`);

    // Forward the request to the target URL
    const requestInit: RequestInit = {
      method: method || "GET",
      headers: headers || {},
    };

    // Add body if it exists and method is not GET or HEAD
    if (body && method && !["GET", "HEAD"].includes(method.toUpperCase())) {
      requestInit.body = typeof body === "string" ? body : JSON.stringify(body);
    }

    const response = await fetch(url, requestInit);

    // Get the response body as text
    const responseText = await response.text();

    // Try to parse as JSON, fall back to text if it fails
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      // If we received HTML instead of JSON, provide a more helpful error
      if (
        responseText.trim().startsWith("<!DOCTYPE") ||
        responseText.trim().startsWith("<html")
      ) {
        console.error(
          "Received HTML instead of JSON:",
          responseText.substring(0, 200),
        );
        responseData = {
          error:
            "Received HTML response instead of JSON. The API endpoint may be incorrect or returning an error page.",
          html_preview: responseText.substring(0, 500),
          status: 502, // Set a bad gateway status to indicate upstream issue
        };
      } else {
        console.error("Received non-JSON, non-HTML response:", responseText);
        responseData = {
          text: responseText,
          error: "Received non-JSON response from API",
          raw_response: responseText.substring(0, 1000),
        };
      }
    }

    // Return the response with CORS headers
    return NextResponse.json(
      {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData,
      },
      {
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.error("Error in CORS proxy:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
}
