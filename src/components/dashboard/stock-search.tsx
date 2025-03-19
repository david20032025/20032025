"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import { createClient } from "../../../supabase/client";

interface Stock {
  symbol: string;
  name: string;
  price: number;
}

interface StockSearchProps {
  onStockSelect: (stock: Stock, quantity: number) => void;
}

export default function StockSearch({ onStockSelect }: StockSearchProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Stock[]>([]);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [quantity, setQuantity] = useState<number>(0);
  const [totalValue, setTotalValue] = useState<number>(0);
  const [showDropdown, setShowDropdown] = useState(false);

  // Function to search for stocks in real-time
  const searchStocks = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    setShowDropdown(true);

    try {
      // In a real implementation, this would call the API
      // For demo purposes, we'll simulate a response
      const mockResults = [
        { symbol: "AAPL", name: "Apple Inc.", price: 175.34 },
        { symbol: "MSFT", name: "Microsoft Corporation", price: 325.76 },
        { symbol: "GOOGL", name: "Alphabet Inc.", price: 142.89 },
        { symbol: "AMZN", name: "Amazon.com Inc.", price: 178.12 },
        { symbol: "META", name: "Meta Platforms Inc.", price: 485.39 },
        { symbol: "TSLA", name: "Tesla, Inc.", price: 237.49 },
        { symbol: "NVDA", name: "NVIDIA Corporation", price: 116.32 },
        { symbol: "JPM", name: "JPMorgan Chase & Co.", price: 198.73 },
        { symbol: "V", name: "Visa Inc.", price: 276.45 },
        { symbol: "JNJ", name: "Johnson & Johnson", price: 152.64 },
      ].filter(
        (stock) =>
          stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
          stock.name.toLowerCase().includes(query.toLowerCase()),
      );

      // Simulate API delay
      setTimeout(() => {
        setSearchResults(mockResults);
        setIsSearching(false);
      }, 300);

      // Actual API call would look something like this:
      /*
      const response = await fetch(
        `https://api.example.com/stocks/search?apiKey=kHtpR7fKT_eFyPw0ixpCnUe_gZiRcce&query=${query}`
      );
      const data = await response.json();
      setSearchResults(data.results.map(item => ({
        symbol: item.symbol,
        name: item.name,
        price: item.price || 0
      })));
      setIsSearching(false);
      */
    } catch (error) {
      console.error("Error searching stocks:", error);
      setIsSearching(false);
    }
  };

  // Handle input change with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Debounce the API call
    const handler = setTimeout(() => {
      searchStocks(value);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  };

  // Handle stock selection
  const handleStockSelect = (stock: Stock) => {
    setSelectedStock(stock);
    setQuantity(1); // Default quantity
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Update total value when quantity or selected stock changes
  useEffect(() => {
    if (selectedStock && quantity) {
      setTotalValue(selectedStock.price * quantity);
    } else {
      setTotalValue(0);
    }
  }, [selectedStock, quantity]);

  // Handle form submission
  const handleSubmit = async () => {
    if (selectedStock && quantity > 0) {
      try {
        const supabase = createClient();

        // Get the current user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          throw new Error("User not authenticated");
        }

        // Get category ID for investments
        const { data: categoryData } = await supabase
          .from("asset_categories")
          .select("id")
          .eq("slug", "investments")
          .single();

        if (!categoryData) {
          throw new Error("Category not found");
        }

        // Calculate values
        const totalValue = selectedStock.price * quantity;

        // Insert the stock as an asset
        const { error } = await supabase.from("assets").insert({
          name: selectedStock.name,
          value: totalValue,
          description: `${quantity} shares of ${selectedStock.symbol}`,
          location: "Stock Market",
          acquisition_date: new Date().toISOString(),
          acquisition_value: totalValue,
          category_id: categoryData.id,
          is_liability: false,
          user_id: user.id,
          metadata: {
            symbol: selectedStock.symbol,
            price_per_share: selectedStock.price,
            quantity: quantity,
            currency: "USD",
            asset_type: "stock",
          },
        });

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }

        // Call the callback to close the dialog
        onStockSelect(selectedStock, quantity);
      } catch (error) {
        console.error("Error adding stock to portfolio:", error);
        alert("Failed to add stock to portfolio. Please try again.");
      }
    }
  };

  return (
    <div className="space-y-6" ref={dropdownRef}>
      {/* Search section */}
      <div className="space-y-4">
        <div className="relative">
          <div className="flex gap-2">
            <Input
              placeholder="Search by company name or ticker symbol"
              value={searchQuery}
              onChange={handleInputChange}
              className="flex-1"
            />
            {isSearching && (
              <div className="absolute right-12 top-3">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
            <Button
              onClick={() => {
                if (searchResults.length > 0) {
                  setShowDropdown(!showDropdown);
                } else if (searchQuery.trim()) {
                  searchStocks(searchQuery);
                }
              }}
              disabled={isSearching}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {/* Dropdown search results */}
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
              {searchResults.map((stock) => (
                <div
                  key={stock.symbol}
                  className="p-2 hover:bg-muted/50 cursor-pointer flex justify-between items-center"
                  onClick={() => {
                    handleStockSelect(stock);
                    setShowDropdown(false);
                    setSearchQuery(`${stock.symbol} - ${stock.name}`);
                  }}
                >
                  <div>
                    <div className="font-medium">{stock.symbol}</div>
                    <div className="text-sm text-muted-foreground truncate">
                      {stock.name}
                    </div>
                  </div>
                  <div className="text-right font-medium">
                    ${stock.price.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No results message */}
          {showDropdown &&
            searchQuery &&
            !isSearching &&
            searchResults.length === 0 && (
              <div className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow-lg p-4 text-center text-muted-foreground">
                No results found for "{searchQuery}"
              </div>
            )}
        </div>
      </div>

      {/* Selected stock details */}
      {selectedStock && (
        <div className="border rounded-md p-4 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-lg">{selectedStock.name}</h3>
              <p className="text-sm text-muted-foreground">
                {selectedStock.symbol}
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium">${selectedStock.price.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Current Price</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="quantity" className="text-sm font-medium">
                Quantity
              </label>
              <Input
                id="quantity"
                type="number"
                min="0"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Total Value</label>
              <div className="h-10 px-3 py-2 rounded-md border bg-muted/50 flex items-center">
                <span className="font-medium">${totalValue.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={!selectedStock || quantity <= 0}
            >
              Add to Portfolio
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
