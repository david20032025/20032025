"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "../../../supabase/client";
import { RefreshCw, AlertCircle, TrendingUp, TrendingDown } from "lucide-react";

interface Holding {
  symbol: string;
  name: string;
  quantity: number;
  pricePerShare: number;
  totalValue: number;
  gainLoss: number;
  purchasePrice: number;
  accountId: string;
  accountName: string;
  brokerName: string;
  currency: string;
}

export default function BrokerHoldingsList({
  accountId,
}: {
  accountId?: string;
}) {
  const supabase = createClient();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAndHoldings = async () => {
      try {
        // Get the current user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setError("User not authenticated");
          setLoading(false);
          return;
        }

        setUserId(user.id);

        // Fetch holdings
        await fetchHoldings(user.id);
      } catch (err) {
        console.error("Error fetching user and holdings:", err);
        setError("Failed to load holdings. Please try again later.");
        setLoading(false);
      }
    };

    fetchUserAndHoldings();
  }, [supabase.auth, accountId]);

  const fetchHoldings = async (userId: string) => {
    setLoading(true);
    setError(null);

    try {
      const url = accountId
        ? `/api/snaptrade/holdings?userId=${userId}&accountId=${accountId}`
        : `/api/snaptrade/holdings?userId=${userId}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch holdings");
      }

      setHoldings(data.holdings || []);
    } catch (err) {
      console.error("Error fetching holdings:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load holdings. Please try again later.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (userId) {
      fetchHoldings(userId);
    }
  };

  const formatCurrency = (value: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "percent",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value / 100);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Investment Holdings</CardTitle>
          <CardDescription>
            {accountId
              ? "Holdings in this account"
              : "Your investment holdings across all accounts"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Investment Holdings</CardTitle>
          <CardDescription>
            {accountId
              ? "Holdings in this account"
              : "Your investment holdings across all accounts"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
            <p className="text-red-500 font-medium">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={handleRefresh}
            >
              <RefreshCw className="h-4 w-4 mr-2" /> Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate total portfolio value
  const totalValue = holdings.reduce(
    (sum, holding) => sum + holding.totalValue,
    0,
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Investment Holdings</CardTitle>
          <CardDescription>
            {accountId
              ? "Holdings in this account"
              : "Your investment holdings across all accounts"}
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {holdings.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No holdings found.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => (window.location.href = "/dashboard/assets")}
            >
              Add Investments
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-sm text-gray-500 mb-1">
                Total Portfolio Value
              </h3>
              <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
            </div>

            <div className="space-y-4">
              {holdings.map((holding, index) => (
                <div
                  key={`${holding.symbol}-${holding.accountId}-${index}`}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">{holding.name}</h3>
                      <div className="text-sm text-muted-foreground flex items-center">
                        <span className="font-mono mr-2">{holding.symbol}</span>
                        <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">
                          {holding.accountName}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {formatCurrency(holding.totalValue, holding.currency)}
                      </div>
                      <div
                        className={`text-sm flex items-center ${holding.gainLoss >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {holding.gainLoss >= 0 ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {formatCurrency(holding.gainLoss, holding.currency)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3 text-sm">
                    <div>
                      <div className="text-gray-500">Quantity</div>
                      <div>{holding.quantity.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Price</div>
                      <div>
                        {formatCurrency(
                          holding.pricePerShare,
                          holding.currency,
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Cost Basis</div>
                      <div>
                        {formatCurrency(
                          holding.purchasePrice,
                          holding.currency,
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => (window.location.href = "/dashboard/assets")}
        >
          Manage Investments
        </Button>
      </CardFooter>
    </Card>
  );
}
