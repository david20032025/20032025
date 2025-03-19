// Follow this setup guide to integrate the Deno runtime and Supabase functions in your project:
// https://docs.deno.com/runtime/manual/getting_started/setup

// This is a simple CORS proxy to help with API requests that might be blocked by CORS

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { url, method, headers, body } = await req.json();

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
      responseData = { text: responseText };
    }

    // Return the response with CORS headers
    return new Response(
      JSON.stringify({
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("Error in CORS proxy:", error);

    return new Response(
      JSON.stringify({
        error: error.message || "Unknown error occurred",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});
