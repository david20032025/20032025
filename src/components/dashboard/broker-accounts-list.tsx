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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { createClient } from "../../../supabase/client";
import { RefreshCw, ExternalLink, AlertCircle, Trash2 } from "lucide-react";
import RefreshSnapTradeButton from "./refresh-snaptrade-button";

interface BrokerAccount {
  id: string;
  name: string;
  number?: string;
  type?: string;
  brokerage?: {
    id: string;
    name: string;
  };
  connection_id?: string;
}

export default function BrokerAccountsList() {
  const supabase = createClient();
  const [accounts, setAccounts] = useState<BrokerAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<BrokerAccount | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDeleteAccount = async (account: BrokerAccount) => {
    if (!userId) return;

    setIsDeleting(true);
    try {
      // Delete the connection from SnapTrade
      const response = await fetch(
        `/api/snaptrade/connect?userId=${userId}&connectionId=${account.connection_id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete connection");
      }

      // Refresh the accounts list
      await fetchAccounts(userId);
      setDeletingAccount(null);
    } catch (err) {
      console.error("Error deleting account:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete account. Please try again later.",
      );
    } finally {
      setIsDeleting(false);
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
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" /> Try Again
              </Button>
              {userId && <RefreshSnapTradeButton userId={userId} />}
            </div>
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
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
          {userId && <RefreshSnapTradeButton userId={userId} />}
        </div>
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
                <div className="flex items-center gap-2">
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
                  <AlertDialog
                    open={deletingAccount?.id === account.id}
                    onOpenChange={(open) => !open && setDeletingAccount(null)}
                  >
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={() => setDeletingAccount(account)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Connection</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete the connection to{" "}
                          {account.name}? This will remove all data associated
                          with this account.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={(e) => {
                            e.preventDefault();
                            handleDeleteAccount(account);
                          }}
                          className="bg-red-600 hover:bg-red-700"
                          disabled={isDeleting}
                        >
                          {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
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
