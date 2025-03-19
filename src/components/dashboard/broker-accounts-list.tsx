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
import { RefreshCw, ExternalLink, AlertCircle } from "lucide-react";

interface BrokerAccount {
  id: string;
  name: string;
  number?: string;
  type?: string;
  brokerage?: {
    id: string;
    name: string;
  };
}

export default function BrokerAccountsList() {
  const supabase = createClient();
  const [accounts, setAccounts] = useState<BrokerAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAndAccounts = async () => {
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

        // Fetch accounts
        await fetchAccounts(user.id);
      } catch (err) {
        console.error("Error fetching user and accounts:", err);
        setError("Failed to load accounts. Please try again later.");
        setLoading(false);
      }
    };

    fetchUserAndAccounts();
  }, [supabase.auth]);

  const fetchAccounts = async (userId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/snaptrade/accounts?userId=${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch accounts");
      }

      setAccounts(data.accounts || []);
    } catch (err) {
      console.error("Error fetching accounts:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load accounts. Please try again later.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (userId) {
      fetchAccounts(userId);
    }
  };

  const handleAddAccount = () => {
    // Open the add asset dialog with the link accounts option
    // This would typically be handled by a global state or context
    // For now, we'll just redirect to the assets page
    window.location.href = "/dashboard/assets";
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
          <CardDescription>Your linked investment accounts</CardDescription>
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
          <CardTitle>Connected Accounts</CardTitle>
          <CardDescription>Your linked investment accounts</CardDescription>
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Connected Accounts</CardTitle>
          <CardDescription>Your linked investment accounts</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {accounts.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No accounts connected yet.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={handleAddAccount}
            >
              Connect an Account
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div>
                  <h3 className="font-medium">{account.name}</h3>
                  <div className="text-sm text-muted-foreground">
                    {account.brokerage?.name || "Investment Account"}
                    {account.number && ` • ${account.number}`}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="text-blue-600"
                >
                  <a href={`/dashboard/assets?accountId=${account.id}`}>
                    <ExternalLink className="h-4 w-4 mr-1" /> View
                  </a>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={handleAddAccount}>
          Connect Another Account
        </Button>
      </CardFooter>
    </Card>
  );
}
