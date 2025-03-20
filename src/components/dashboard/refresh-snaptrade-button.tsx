"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function RefreshSnapTradeButton({ userId }: { userId: string }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshSnapTradeData = async () => {
    setIsRefreshing(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/snaptrade/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to refresh SnapTrade data");
      }

      setMessage(
        `Successfully refreshed data for ${data.accounts} accounts. Please reload the page to see updated data.`,
      );
    } catch (err) {
      console.error("Error refreshing SnapTrade data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to refresh SnapTrade data",
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <Button
        onClick={refreshSnapTradeData}
        disabled={isRefreshing}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
        {isRefreshing ? "Refreshing..." : "Refresh SnapTrade Data"}
      </Button>

      {message && (
        <p className="text-sm text-green-600 mt-1 bg-green-50 p-2 rounded">
          {message}
        </p>
      )}

      {error && (
        <p className="text-sm text-red-600 mt-1 bg-red-50 p-2 rounded">
          {error}
        </p>
      )}
    </div>
  );
}
