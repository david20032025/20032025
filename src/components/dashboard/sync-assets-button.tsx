"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { RefreshCw } from "lucide-react";

export default function SyncAssetsButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "success" | "error" | "partial"
  >("idle");
  const [message, setMessage] = useState<string>("");

  const syncAssets = async () => {
    setIsLoading(true);
    setStatus("idle");
    setMessage("");

    try {
      const response = await fetch("/api/snaptrade/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to sync assets");
      }

      // Check if we have a partial sync
      if (data.syncStatus === "partial") {
        setStatus("partial");
        setMessage(
          data.syncMessage ||
            "Some data could not be synced. Try again in a few minutes.",
        );
        // Still reload to show what we have
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setStatus("success");
        // Reload the page to show updated assets
        window.location.reload();
      }
    } catch (error) {
      console.error("Error syncing assets:", error);
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Unknown error occurred",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      <Button
        onClick={syncAssets}
        disabled={isLoading}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        {isLoading ? "Syncing..." : "Sync Assets"}
      </Button>

      {status === "partial" && message && (
        <p className="text-xs text-amber-600 mt-1">{message}</p>
      )}

      {status === "error" && message && (
        <p className="text-xs text-red-600 mt-1">{message}</p>
      )}
    </div>
  );
}
