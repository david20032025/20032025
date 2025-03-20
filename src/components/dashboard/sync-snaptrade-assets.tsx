"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { createClient } from "../../../supabase/client";

export default function SyncSnapTradeAssets() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleSync = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get the current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("User not authenticated");
        setIsLoading(false);
        return;
      }

      // Call the sync endpoint
      const response = await fetch(`/api/snaptrade/sync?userId=${user.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to sync assets");
      }

      // Refresh the page to show the updated assets
      window.location.reload();
    } catch (err) {
      console.error("Error syncing assets:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to sync assets. Please try again later.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSync}
      disabled={isLoading}
      className="flex items-center gap-2"
    >
      {isLoading ? (
        <RefreshCw className="h-4 w-4 animate-spin" />
      ) : (
        <RefreshCw className="h-4 w-4" />
      )}
      Sync SnapTrade
    </Button>
  );
}
