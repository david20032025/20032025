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

interface BrokerSelectionProps {
  onBack: () => void;
  onSelect: (brokerId: string) => void;
}

export default function BrokerSelection({
  onBack,
  onSelect,
}: BrokerSelectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Broker categories
  const categories = [
    {
      id: "traditional",
      name: "Traditional Brokers",
      color: "bg-blue-100 text-blue-600 hover:bg-blue-200",
    },
    {
      id: "crypto",
      name: "Crypto Exchanges",
      color: "bg-purple-100 text-purple-600 hover:bg-purple-200",
    },
    {
      id: "other",
      name: "Other Platforms",
      color: "bg-green-100 text-green-600 hover:bg-green-200",
    },
  ];

  // Brokers by category
  const brokersByCategory: Record<
    string,
    Array<{ id: string; name: string; country: string }>
  > = {
    traditional: [
      { id: "ajbell", name: "AJ Bell", country: "UK" },
      { id: "bux", name: "BUX", country: "Netherlands" },
      { id: "commsec", name: "CommSec", country: "Australia" },
      { id: "alpaca", name: "Alpaca", country: "US" },
      { id: "chase", name: "Chase", country: "US" },
      { id: "etrade", name: "E*TRADE", country: "US" },
      { id: "fidelity", name: "Fidelity", country: "US" },
      { id: "ibkr", name: "Interactive Brokers", country: "US" },
      { id: "questrade", name: "Questrade", country: "Canada" },
      { id: "robinhood", name: "Robinhood", country: "US" },
      { id: "schwab", name: "Schwab", country: "US" },
      { id: "tradestation", name: "TradeStation", country: "US" },
      { id: "trading212", name: "Trading 212", country: "Netherlands" },
      { id: "vanguard", name: "Vanguard", country: "US" },
      { id: "wellsfargo", name: "Wells Fargo", country: "US" },
      { id: "wealthsimple", name: "Wealthsimple", country: "Canada" },
    ],
    crypto: [
      { id: "binance", name: "Binance", country: "Global" },
      { id: "coinbase", name: "Coinbase", country: "US" },
      { id: "kraken", name: "Kraken", country: "US" },
      { id: "unocoin", name: "Unocoin", country: "India" },
    ],
    other: [
      { id: "public", name: "Public", country: "US" },
      { id: "upstox", name: "Upstox", country: "India" },
      { id: "zerodha", name: "Zerodha", country: "India" },
    ],
  };

  const handleBrokerSelect = (brokerId: string) => {
    setIsLoading(true);
    try {
      // Call the onSelect callback with the selected broker ID
      onSelect(brokerId);
    } catch (error) {
      console.error("Error selecting broker:", error);
      setIsLoading(false);
    }
  };

  return (
    <>
      {!selectedCategory ? (
        <>
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Select Broker Type</DialogTitle>
                <DialogDescription>
                  Choose the type of broker you want to connect
                </DialogDescription>
              </div>
              <Button variant="outline" size="sm" onClick={onBack}>
                Back
              </Button>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`flex flex-col items-center justify-center p-6 rounded-lg border transition-colors ${category.color}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <span className="font-medium text-lg">{category.name}</span>
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
                  Select{" "}
                  {selectedCategory === "traditional"
                    ? "Broker"
                    : selectedCategory === "crypto"
                      ? "Exchange"
                      : "Platform"}
                </DialogTitle>
                <DialogDescription>
                  Choose your{" "}
                  {selectedCategory === "traditional"
                    ? "broker"
                    : selectedCategory === "crypto"
                      ? "exchange"
                      : "platform"}{" "}
                  to connect
                </DialogDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                Back to Categories
              </Button>
            </div>
          </DialogHeader>

          <div className="mt-6 max-h-[400px] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {brokersByCategory[selectedCategory].map((broker) => (
                <button
                  key={broker.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-primary hover:bg-gray-50 transition-colors"
                  onClick={() => handleBrokerSelect(broker.id)}
                  disabled={isLoading}
                >
                  <div className="text-left">
                    <div className="font-medium">{broker.name}</div>
                    <div className="text-sm text-gray-500">
                      {broker.country}
                    </div>
                  </div>
                  <div className="text-primary">
                    {isLoading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12h14"></path>
                        <path d="m12 5 7 7-7 7"></path>
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
