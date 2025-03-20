"use client";

import { useState, useEffect } from "react";

export default function HandleSnapTradeConnection({
  userId,
  brokerId,
  onSuccess,
  onError,
}: {
  userId: string;
  brokerId: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}) {
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const connectToBroker = async () => {
      try {
        if (typeof window === "undefined") {
          console.log(
            "Window object not available, skipping broker connection",
          );
          return;
        }

        // Get the current URL for the redirect
        const origin = window.location.origin;
        // Set up callback URL with redirect to assets page
        const redirectUri = `${origin}/api/snaptrade/callback?redirect=${encodeURIComponent("/dashboard/assets")}`;

        console.log(`Setting up redirect URI: ${redirectUri}`);

        // Handle Interactive Brokers special case
        let brokerIdToUse = brokerId;
        if (
          brokerIdToUse &&
          (brokerIdToUse.toUpperCase() === "INTERACTIVE_BROKERS" ||
            brokerIdToUse.toUpperCase() === "IBKR")
        ) {
          // Skip broker ID completely for Interactive Brokers
          brokerIdToUse = null;
          console.log(
            "Interactive Brokers detected, omitting broker ID parameter",
          );
        }

        // Call the API to get the connection URL
        const response = await fetch("/api/snaptrade/connect", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            brokerId: brokerIdToUse,
            redirectUri,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to connect to broker");
        }

        // Redirect to the connection portal
        if (data.redirectUri) {
          console.log(`Redirecting to: ${data.redirectUri}`);
          // Use a small timeout to ensure logs are visible
          setTimeout(() => {
            window.location.href = data.redirectUri;
          }, 100);
        } else {
          throw new Error("No redirect URL returned");
        }
      } catch (err) {
        console.error("Error connecting to broker:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        setIsConnecting(false);
        onError(errorMessage);
      }
    };

    connectToBroker();
  }, [userId, brokerId, onSuccess, onError]);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-900">
      {isConnecting && !error && (
        <>
          <div className="h-12 w-12 rounded-full border-4 border-t-transparent border-primary animate-spin mb-4"></div>
          <p className="text-lg font-medium">Connecting to {brokerId}...</p>
          <p className="text-sm text-gray-500 mt-2">
            You will be redirected to securely connect your account.
          </p>
        </>
      )}

      {error && (
        <>
          <div className="rounded-full bg-red-100 p-3 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-red-500"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <p className="text-lg font-medium text-red-600">Connection Failed</p>
          <p className="text-sm text-gray-500 mt-2 text-center">{error}</p>
        </>
      )}
    </div>
  );
}
