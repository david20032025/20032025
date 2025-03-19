import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as crypto from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { brokerId, apiKey, apiSecret, userId } = await req.json();

    if (!brokerId || !apiKey || !apiSecret || !userId) {
      throw new Error("Missing required parameters");
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Handle different brokers
    let brokerData;

    if (brokerId === "kraken") {
      brokerData = await connectToKraken(apiKey, apiSecret);
    } else {
      // For other brokers, we'll implement later
      throw new Error(`Connection to ${brokerId} is not implemented yet`);
    }

    // Encrypt API credentials before storing
    // In a real app, you'd use a proper encryption method
    // This is a simplified example
    const encryptedSecret = await encryptSecret(apiSecret);

    // Store the connection in the database
    const { error: insertError } = await supabase
      .from("broker_connections")
      .insert({
        user_id: userId,
        broker_id: brokerId,
        api_key: apiKey,
        api_secret_encrypted: encryptedSecret,
        broker_data: brokerData,
        is_active: true,
      });

    if (insertError) throw new Error(insertError.message);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Successfully connected to broker",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    );
  }
});

async function connectToKraken(apiKey: string, apiSecret: string) {
  // Generate nonce (timestamp in milliseconds)
  const nonce = Date.now().toString();

  // Path for the API request
  const path = "/0/private/Balance";

  // Create the message to sign
  const message = nonce + "nonce=" + nonce;

  // Decode the API secret from base64
  const secretKeyUint8 = base64ToUint8Array(apiSecret);

  // Create the signature
  const messageUint8 = new TextEncoder().encode(message);
  const pathUint8 = new TextEncoder().encode(path);

  // SHA-256 hash of the path and the message
  const hashedPath = await crypto.subtle.digest("SHA-256", pathUint8);

  // Combine the hashed path with the message
  const combinedMessage = new Uint8Array(
    hashedPath.byteLength + messageUint8.byteLength,
  );
  combinedMessage.set(new Uint8Array(hashedPath), 0);
  combinedMessage.set(messageUint8, hashedPath.byteLength);

  // Create HMAC-SHA-512 signature
  const key = await crypto.subtle.importKey(
    "raw",
    secretKeyUint8,
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", key, combinedMessage);
  const signatureBase64 = uint8ArrayToBase64(new Uint8Array(signature));

  // Make the API request to Kraken
  const response = await fetch("https://api.kraken.com" + path, {
    method: "POST",
    headers: {
      "API-Key": apiKey,
      "API-Sign": signatureBase64,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "nonce=" + nonce,
  });

  const data = await response.json();

  if (data.error && data.error.length > 0) {
    throw new Error(data.error[0]);
  }

  return data.result;
}

// Helper function to convert base64 to Uint8Array
function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Helper function to convert Uint8Array to base64
function uint8ArrayToBase64(array: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < array.length; i++) {
    binary += String.fromCharCode(array[i]);
  }
  return btoa(binary);
}

// Simple encryption function (for demonstration purposes)
// In a real app, use a proper encryption library
async function encryptSecret(secret: string): Promise<string> {
  // This is a placeholder. In a real app, use proper encryption
  // For example, you might encrypt with a server-side key using AES
  const encoder = new TextEncoder();
  const data = encoder.encode(secret);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
