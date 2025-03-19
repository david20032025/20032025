"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "../../../supabase/client";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Info, RefreshCw } from "lucide-react";
import { fetchMetalPrice, getMetalSymbol } from "@/utils/metal-api";

interface AddMetalFormProps {
  onSuccess?: () => void;
}

export default function AddMetalForm({ onSuccess }: AddMetalFormProps) {
  const supabase = createClient();
  const router = useRouter();

  // Form state
  const [metalType, setMetalType] = useState("");
  const [unit, setUnit] = useState("ounce");
  const [quantity, setQuantity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [totalValue, setTotalValue] = useState<number | null>(null);
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Metal options
  const metalOptions = [
    { value: "gold", label: "Gold (XAU)", price: 1900 },
    { value: "silver", label: "Silver (XAG)", price: 23 },
    { value: "palladium", label: "Palladium (XPD)", price: 950 },
    { value: "platinum", label: "Platinum (XPT)", price: 900 },
  ];

  // Conversion rate
  const OUNCE_TO_GRAM = 31.1035;

  // Fetch price from API
  const fetchPrice = async () => {
    if (!metalType) return;

    setIsLoadingPrice(true);
    setError(null);

    try {
      // Get the metal symbol for the API
      const symbol = getMetalSymbol(metalType);

      // Fetch the current price
      const priceData = await fetchMetalPrice(symbol);

      // Set the price based on the unit
      const pricePerOunce = priceData.price;
      const pricePerUnit =
        unit === "gram" ? pricePerOunce / OUNCE_TO_GRAM : pricePerOunce;

      setCurrentPrice(pricePerUnit);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching metal price:", err);
      setError("Failed to fetch current price. Using fallback price.");

      // Fallback to static prices if API fails
      const selectedMetal = metalOptions.find((m) => m.value === metalType);
      if (selectedMetal) {
        const pricePerOunce = selectedMetal.price;
        const pricePerUnit =
          unit === "gram" ? pricePerOunce / OUNCE_TO_GRAM : pricePerOunce;
        setCurrentPrice(pricePerUnit);
      }
    } finally {
      setIsLoadingPrice(false);
    }
  };

  // Update price when metal type or unit changes
  useEffect(() => {
    if (metalType) {
      fetchPrice();
    }
  }, [metalType, unit]);

  // Calculate total value when quantity or price changes
  useEffect(() => {
    if (currentPrice && quantity) {
      const numericQuantity = parseFloat(quantity);
      if (!isNaN(numericQuantity) && numericQuantity > 0) {
        setTotalValue(numericQuantity * currentPrice);
      } else {
        setTotalValue(null);
      }
    } else {
      setTotalValue(null);
    }
  }, [quantity, currentPrice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!metalType) {
      setError("Please select a metal type");
      return;
    }

    if (!quantity || parseFloat(quantity) <= 0) {
      setError("Please enter a valid quantity");
      return;
    }

    if (!totalValue) {
      setError("Unable to calculate total value");
      return;
    }

    setIsSubmitting(true);

    try {
      // Get the current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Get the category ID for precious metals
      const { data: categoryData, error: categoryError } = await supabase
        .from("asset_categories")
        .select("id")
        .eq("slug", "precious-metals")
        .single();

      if (categoryError) throw new Error("Failed to get category");

      // Format the metal name for display
      const selectedMetal = metalOptions.find((m) => m.value === metalType);
      const metalName = selectedMetal
        ? selectedMetal.label.split(" ")[0]
        : metalType;

      // Insert the asset
      const { error: insertError } = await supabase.from("assets").insert({
        name: `${metalName}`,
        value: totalValue,
        description: `${quantity} ${unit}${parseFloat(quantity) !== 1 ? "s" : ""} of ${metalName}`,
        location: "Physical",
        acquisition_date: new Date().toISOString(),
        acquisition_value: totalValue,
        category_id: categoryData.id,
        is_liability: false,
        user_id: user.id,
        metadata: {
          metal_type: metalType,
          quantity: parseFloat(quantity),
          unit: unit,
          price_per_unit: currentPrice,
          price_per_share: currentPrice, // Added for compatibility with the assets page display
          currency: "USD",
          asset_type: "precious_metal",
        },
      });

      if (insertError) throw new Error(insertError.message);

      // Success
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/dashboard/assets");
        router.refresh();
      }
    } catch (err) {
      console.error("Error adding metal:", err);
      setError(err instanceof Error ? err.message : "Failed to add metal");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Convert between units for display
  const getConvertedValue = () => {
    if (!quantity || isNaN(parseFloat(quantity))) return null;

    const numericQuantity = parseFloat(quantity);
    if (unit === "gram") {
      return (numericQuantity / OUNCE_TO_GRAM).toFixed(4) + " ounces";
    } else {
      return (numericQuantity * OUNCE_TO_GRAM).toFixed(2) + " grams";
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Step 1: Select Metal Type */}
      <div className="space-y-2">
        <Label htmlFor="metalType">Step 1: Select the type of metal</Label>
        <Select value={metalType} onValueChange={setMetalType}>
          <SelectTrigger id="metalType" className="w-full">
            <SelectValue placeholder="Select a metal" />
          </SelectTrigger>
          <SelectContent>
            {metalOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!metalType && (
          <p className="text-sm text-amber-600">
            Please select a metal to proceed.
          </p>
        )}
      </div>

      {/* Step 2: Choose Unit */}
      {metalType && (
        <div className="space-y-2">
          <Label>Step 2: Choose the unit</Label>
          <RadioGroup
            value={unit}
            onValueChange={setUnit}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="ounce" id="ounce" />
              <Label htmlFor="ounce">Ounce</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="gram" id="gram" />
              <Label htmlFor="gram">Gram</Label>
            </div>
          </RadioGroup>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <Info className="h-4 w-4 mr-1" />
            <span>1 ounce = 31.1035 grams</span>
          </div>
        </div>
      )}

      {/* Step 3: Enter Quantity */}
      {metalType && (
        <div className="space-y-2">
          <Label htmlFor="quantity">Step 3: Enter the quantity</Label>
          <Input
            id="quantity"
            type="number"
            step="0.01"
            min="0.01"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder={`Enter quantity in ${unit}s`}
          />
          {quantity && parseFloat(quantity) > 0 && (
            <p className="text-sm text-gray-500">
              Equivalent to: {getConvertedValue()}
            </p>
          )}
          {quantity && parseFloat(quantity) <= 0 && (
            <p className="text-sm text-red-500">
              Please enter a valid quantity.
            </p>
          )}
        </div>
      )}

      {/* Step 4: Display Current Price */}
      {metalType && quantity && parseFloat(quantity) > 0 && currentPrice && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>Step 4: Current Price</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={fetchPrice}
              disabled={isLoadingPrice}
              className="h-8"
            >
              <RefreshCw
                className={`h-4 w-4 mr-1 ${isLoadingPrice ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
          <div className="p-4 bg-gray-50 rounded-md">
            <p className="font-medium">
              {
                metalOptions
                  .find((m) => m.value === metalType)
                  ?.label.split(" ")[0]
              }{" "}
              price ({unit}):
              {formatCurrency(currentPrice)}/{unit}
            </p>
            <div className="flex justify-between items-center mt-1">
              <p className="text-sm text-gray-500">
                {lastUpdated
                  ? `Last updated: ${lastUpdated.toLocaleTimeString()}`
                  : "Using live market data"}
              </p>
              {isLoadingPrice && (
                <p className="text-sm text-blue-500">Updating price...</p>
              )}
            </div>
            {error && <p className="text-sm text-amber-600 mt-1">{error}</p>}
          </div>
        </div>
      )}

      {/* Step 5: Summary */}
      {metalType && quantity && parseFloat(quantity) > 0 && totalValue && (
        <div className="space-y-2">
          <Label>Step 5: Summary</Label>
          <div className="p-4 bg-gray-50 rounded-md space-y-2">
            <div className="flex justify-between">
              <span>Selected Metal:</span>
              <span className="font-medium">
                {metalOptions.find((m) => m.value === metalType)?.label}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Quantity:</span>
              <span className="font-medium">
                {quantity} {unit}
                {parseFloat(quantity) !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Price per {unit}:</span>
              <span className="font-medium">
                {formatCurrency(currentPrice)}
              </span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
              <span>Total Value:</span>
              <span className="font-medium">{formatCurrency(totalValue)}</span>
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button
        type="submit"
        className="w-full"
        disabled={
          !metalType ||
          !quantity ||
          parseFloat(quantity) <= 0 ||
          !totalValue ||
          isSubmitting
        }
      >
        {isSubmitting ? (
          <>
            <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Adding to Portfolio...
          </>
        ) : (
          "Add to Portfolio"
        )}
      </Button>
    </form>
  );
}
