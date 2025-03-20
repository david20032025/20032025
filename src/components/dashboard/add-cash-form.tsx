"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "../../../supabase/client";

interface AddCashFormProps {
  onSuccess: () => void;
}

export default function AddCashForm({ onSuccess }: AddCashFormProps) {
  const supabase = createClient();
  const [amount, setAmount] = useState<string>("");
  const [currency, setCurrency] = useState<string>("USD");
  const [interestRate, setInterestRate] = useState<string>("");
  const [autoAddInterest, setAutoAddInterest] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const currencies = [
    { code: "USD", name: "US Dollar" },
    { code: "EUR", name: "Euro" },
    { code: "GBP", name: "British Pound" },
    { code: "JPY", name: "Japanese Yen" },
    { code: "CAD", name: "Canadian Dollar" },
    { code: "AUD", name: "Australian Dollar" },
    { code: "CHF", name: "Swiss Franc" },
    { code: "CNY", name: "Chinese Yuan" },
    { code: "INR", name: "Indian Rupee" },
    { code: "BRL", name: "Brazilian Real" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate inputs
      const amountValue = parseFloat(amount);
      if (isNaN(amountValue) || amountValue <= 0) {
        throw new Error("Please enter a valid amount greater than zero");
      }

      let interestRateValue = 0;
      if (interestRate) {
        interestRateValue = parseFloat(interestRate);
        if (isNaN(interestRateValue) || interestRateValue < 0) {
          throw new Error("Please enter a valid interest rate");
        }
      }

      // Get the current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("You must be logged in to add assets");
      }

      // Get category ID for cash
      const { data: categoryData, error: categoryError } = await supabase
        .from("asset_categories")
        .select("id")
        .eq("slug", "cash")
        .single();

      if (categoryError) {
        console.error("Error getting cash category:", categoryError);
        throw new Error("Failed to get cash category");
      }

      // Add the cash asset
      const { error: insertError } = await supabase.from("assets").insert({
        name: `Cash (${currency})`,
        value: amountValue,
        description: `Cash in ${currency}`,
        location: "Bank Account",
        acquisition_date: new Date().toISOString(),
        acquisition_value: amountValue,
        category_id: categoryData.id,
        is_liability: false,
        user_id: user.id,
        metadata: {
          currency: currency,
          asset_type: "cash",
          interest_rate: interestRateValue,
          auto_add_interest: autoAddInterest,
          last_interest_date: autoAddInterest ? new Date().toISOString() : null,
        },
      });

      if (insertError) {
        console.error("Error adding cash asset:", insertError);
        throw new Error("Failed to add cash asset");
      }

      // Success - call the onSuccess callback
      onSuccess();
    } catch (err) {
      console.error("Error in add cash form:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          placeholder="1000.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="currency">Currency</Label>
        <Select value={currency} onValueChange={setCurrency}>
          <SelectTrigger id="currency">
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            {currencies.map((curr) => (
              <SelectItem key={curr.code} value={curr.code}>
                {curr.code} - {curr.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="interestRate">Interest Rate (% per year)</Label>
        <Input
          id="interestRate"
          type="number"
          step="0.01"
          placeholder="2.50"
          value={interestRate}
          onChange={(e) => setInterestRate(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Optional: Enter the annual interest rate for this cash deposit
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="autoAddInterest"
          checked={autoAddInterest}
          onCheckedChange={(checked) => setAutoAddInterest(checked as boolean)}
        />
        <Label
          htmlFor="autoAddInterest"
          className="text-sm font-normal cursor-pointer"
        >
          Automatically add interest at the end of each year
        </Label>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Adding..." : "Add Cash"}
      </Button>
    </form>
  );
}
