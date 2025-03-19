// SnapTrade Callback Proxy Edge Function
// This function handles callbacks from SnapTrade to avoid HTTP 405 errors

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const params = url.searchParams;

    // Log all parameters for debugging
    console.log("Received callback with params:");
    for (const [key, value] of params.entries()) {
      console.log(`${key}: ${value}`);
    }

    const userId = params.get("userId");
    const success = params.get("success");
    const brokerage = params.get("brokerage");
    const authorizationId = params.get("authorizationId");
    const accountId = params.get("accountId");

    if (!userId) {
      throw new Error("No userId found in callback");
    }

    // Redirect to the Next.js callback endpoint with all parameters
    // This avoids the HTTP 405 error by ensuring we use GET method
    const redirectUrl =
      `${url.origin}/api/snaptrade/callback?` +
      `userId=${encodeURIComponent(userId || "")}&` +
      `success=${encodeURIComponent(success || "true")}&` +
      `brokerage=${encodeURIComponent(brokerage || "")}&` +
      `authorizationId=${encodeURIComponent(authorizationId || "")}&` +
      `accountId=${encodeURIComponent(accountId || "")}`;

    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        Location: redirectUrl,
      },
    });
  } catch (error) {
    console.error("Error in SnapTrade callback proxy:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    // Redirect with error
    const url = new URL(req.url);
    const redirectUrl = `${url.origin}/dashboard/assets?error=true&message=${encodeURIComponent(errorMessage)}`;

    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        Location: redirectUrl,
      },
    });
  }
});
