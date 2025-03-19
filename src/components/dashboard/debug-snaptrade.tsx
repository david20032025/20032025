"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DebugSnapTrade() {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [envVars, setEnvVars] = useState<{
    clientId: string;
    consumerKey: string;
  } | null>(null);

  const checkStatus = async () => {
    setLoading(true);
    setStatus(null);
    setError(null);

    try {
      const response = await fetch("/api/snaptrade/debug", {
        method: "GET",
        headers: {
          "Cache-Control": "no-store",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setStatus(
          data.message || "SnapTrade integration is being reimplemented.",
        );
        if (data.environment) {
          setEnvVars(data.environment);
        }
      } else {
        setError(data.error || "Unknown error occurred");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>SnapTrade Integration Debug</CardTitle>
        <CardDescription>
          Check the status of your SnapTrade integration and environment
          variables
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="status">
          <TabsList className="mb-4">
            <TabsTrigger value="status">Status</TabsTrigger>
            <TabsTrigger value="environment">Environment</TabsTrigger>
          </TabsList>

          <TabsContent value="status">
            <div className="space-y-4">
              <div className="p-4 border rounded-md bg-gray-50">
                <h3 className="font-medium mb-2">API Status</h3>
                {status && (
                  <div className="p-3 bg-green-50 text-green-700 rounded-md">
                    {status}
                  </div>
                )}
                {error && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-md">
                    Error: {error}
                  </div>
                )}
                {!status && !error && !loading && (
                  <div className="text-gray-500">
                    Click the button below to check the SnapTrade API status
                  </div>
                )}
                {loading && (
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
                    <span>Checking status...</span>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="environment">
            <div className="space-y-4">
              <div className="p-4 border rounded-md bg-gray-50">
                <h3 className="font-medium mb-2">Environment Variables</h3>
                {envVars ? (
                  <div className="space-y-2">
                    <div className="flex justify-between p-2 bg-white rounded border">
                      <span className="font-mono">
                        NEXT_PUBLIC_SNAPTRADE_CLIENT_ID
                      </span>
                      <span
                        className={
                          envVars.clientId === "Set"
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {envVars.clientId}
                      </span>
                    </div>
                    <div className="flex justify-between p-2 bg-white rounded border">
                      <span className="font-mono">
                        NEXT_PUBLIC_SNAPTRADE_CONSUMER_KEY
                      </span>
                      <span
                        className={
                          envVars.consumerKey === "Set"
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {envVars.consumerKey}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500">
                    Click the button below to check environment variables
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button onClick={checkStatus} disabled={loading}>
          {loading ? "Checking..." : "Check SnapTrade Status"}
        </Button>
      </CardFooter>
    </Card>
  );
}
