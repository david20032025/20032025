// Debug SnapTrade API Edge Function
// This function helps diagnose issues with the SnapTrade API

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
    // Get SnapTrade credentials from environment variables
    const clientId = Deno.env.get("NEXT_PUBLIC_SNAPTRADE_CLIENT_ID") || "";
    const consumerKey =
      Deno.env.get("NEXT_PUBLIC_SNAPTRADE_CONSUMER_KEY") || "";

    if (!clientId || !consumerKey) {
      return new Response(
        JSON.stringify({
          error:
            "SnapTrade credentials not configured in environment variables",
          clientIdPresent: !!clientId,
          consumerKeyPresent: !!consumerKey,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        },
      );
    }

    // Return a simple status message during reimplementation
    return new Response(
      JSON.stringify({
        status: "ok",
        message:
          "SnapTrade integration is being reimplemented. This is a placeholder edge function.",
        environment: {
          clientIdPresent: !!clientId,
          consumerKeyPresent: !!consumerKey,
        },
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    // General error handling
    return new Response(
      JSON.stringify({
        error: `Error in debug function: ${error.message}`,
        stack: error.stack,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
