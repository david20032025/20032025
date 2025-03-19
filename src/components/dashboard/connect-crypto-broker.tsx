"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "../../../supabase/client";

interface ConnectCryptoBrokerProps {
  onBack: () => void;
  userId: string;
}

export default function ConnectCryptoBroker({
  onBack,
  userId,
}: ConnectCryptoBrokerProps) {
  const supabase = createClient();
  const [selectedBroker, setSelectedBroker] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const brokers = [
    {
      id: "kraken",
      name: "Kraken",
      logo: "https://api.dicebear.com/7.x/avataaars/svg?seed=kraken",
      color: "bg-purple-100 text-purple-600 hover:bg-purple-200",
    },
    {
      id: "binance",
      name: "Binance",
      logo: "https://api.dicebear.com/7.x/avataaars/svg?seed=binance",
      color: "bg-yellow-100 text-yellow-600 hover:bg-yellow-200",
    },
    {
      id: "coinbase",
      name: "Coinbase",
      logo: "https://api.dicebear.com/7.x/avataaars/svg?seed=coinbase",
      color: "bg-blue-100 text-blue-600 hover:bg-blue-200",
    },
  ];

  const handleBrokerSelect = (brokerId: string) => {
    setSelectedBroker(brokerId);
    setError(null);
  };

  const handleConnect = async () => {
    if (!apiKey || !apiSecret) {
      setError("API Key and API Secret are required");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Call the edge function to connect to the broker
      const { data, error } = await supabase.functions.invoke(
        "connect-broker",
        {
          body: {
            brokerId: selectedBroker,
            apiKey,
            apiSecret,
            userId,
          },
        },
      );

      if (error) throw new Error(error.message);

      // Refresh the page to show the newly connected broker
      window.location.href = "/dashboard/assets";
    } catch (err) {
      console.error("Error connecting to broker:", err);
      setError(
        err instanceof Error ? err.message : "Failed to connect to broker",
      );
      setIsConnecting(false);
    }
  };

  return (
    <>
      {!selectedBroker ? (
        <>
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Select Crypto Exchange</DialogTitle>
                <DialogDescription>
                  Choose a crypto exchange to connect your accounts
                </DialogDescription>
              </div>
              <Button variant="outline" size="sm" onClick={onBack}>
                Back
              </Button>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 mt-6">
            {brokers.map((broker) => (
              <button
                key={broker.id}
                className={`flex items-center p-6 rounded-lg border transition-colors ${broker.color}`}
                onClick={() => handleBrokerSelect(broker.id)}
              >
                <div className="p-3 rounded-full bg-white mr-4">
                  <img
                    src={broker.logo}
                    alt={broker.name}
                    className="h-6 w-6"
                  />
                </div>
                <div className="text-left">
                  <div className="font-medium text-lg">{broker.name}</div>
                </div>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>
                  Connect to{" "}
                  {brokers.find((b) => b.id === selectedBroker)?.name}
                </DialogTitle>
                <DialogDescription>
                  Enter your API credentials to connect your account
                </DialogDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedBroker(null)}
              >
                Back to Exchanges
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API Key"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiSecret">API Secret</Label>
              <Input
                id="apiSecret"
                type="password"
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                placeholder="Enter your API Secret"
              />
            </div>

            {error && <div className="text-sm text-red-500 mt-2">{error}</div>}

            <Button
              className="w-full"
              onClick={handleConnect}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Connecting...
                </>
              ) : (
                "Connect"
              )}
            </Button>
          </div>
        </>
      )}
    </>
  );
}
