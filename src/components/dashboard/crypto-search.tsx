"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import { createClient } from "../../../supabase/client";

interface Crypto {
  symbol: string;
  name: string;
  price: number;
}

interface CryptoSearchProps {
  onCryptoSelect: (crypto: Crypto, quantity: number) => void;
}

export default function CryptoSearch({ onCryptoSelect }: CryptoSearchProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Crypto[]>([]);
  const [selectedCrypto, setSelectedCrypto] = useState<Crypto | null>(null);
  const [quantity, setQuantity] = useState<number>(0);
  const [totalValue, setTotalValue] = useState<number>(0);
  const [showDropdown, setShowDropdown] = useState(false);

  // Function to search for cryptocurrencies in real-time
  const searchCryptos = async (query: string) => {
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
        { symbol: "BTC", name: "Bitcoin", price: 65432.18 },
        { symbol: "ETH", name: "Ethereum", price: 3456.78 },
        { symbol: "SOL", name: "Solana", price: 142.35 },
        { symbol: "ADA", name: "Cardano", price: 0.45 },
        { symbol: "DOT", name: "Polkadot", price: 6.78 },
        { symbol: "DOGE", name: "Dogecoin", price: 0.12 },
        { symbol: "XRP", name: "Ripple", price: 0.56 },
        { symbol: "AVAX", name: "Avalanche", price: 34.56 },
        { symbol: "LINK", name: "Chainlink", price: 14.32 },
        { symbol: "MATIC", name: "Polygon", price: 0.67 },
      ].filter(
        (crypto) =>
          crypto.symbol.toLowerCase().includes(query.toLowerCase()) ||
          crypto.name.toLowerCase().includes(query.toLowerCase()),
      );

      // Simulate API delay
      setTimeout(() => {
        setSearchResults(mockResults);
        setIsSearching(false);
      }, 300);

      // Actual API call would look something like this:
      /*
      const response = await fetch(
        `https://api.example.com/crypto/search?apiKey=kHtpR7fKT_eFyPw0ixpCnUe_gZiRcce&query=${query}`
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
      console.error("Error searching cryptocurrencies:", error);
      setIsSearching(false);
    }
  };

  // Handle input change with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Debounce the API call
    const handler = setTimeout(() => {
      searchCryptos(value);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  };

  // Handle crypto selection
  const handleCryptoSelect = (crypto: Crypto) => {
    setSelectedCrypto(crypto);
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

  // Update total value when quantity or selected crypto changes
  useEffect(() => {
    if (selectedCrypto && quantity) {
      setTotalValue(selectedCrypto.price * quantity);
    } else {
      setTotalValue(0);
    }
  }, [selectedCrypto, quantity]);

  // Handle form submission
  const handleSubmit = async () => {
    if (selectedCrypto && quantity > 0) {
      try {
        const supabase = createClient();

        // Get the current user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          throw new Error("User not authenticated");
        }

        // Get category ID for cryptocurrency
        const { data: categoryData } = await supabase
          .from("asset_categories")
          .select("id")
          .eq("slug", "cryptocurrency")
          .single();

        if (!categoryData) {
          throw new Error("Category not found");
        }

        // Calculate values
        const totalValue = selectedCrypto.price * quantity;

        // Insert the crypto as an asset
        const { error } = await supabase.from("assets").insert({
          name: selectedCrypto.name,
          value: totalValue,
          description: `${quantity} ${selectedCrypto.symbol}`,
          location: "Crypto Wallet",
          acquisition_date: new Date().toISOString(),
          acquisition_value: totalValue,
          category_id: categoryData.id,
          is_liability: false,
          user_id: user.id,
          metadata: {
            symbol: selectedCrypto.symbol,
            price_per_unit: selectedCrypto.price,
            quantity: quantity,
            currency: "USD",
            asset_type: "cryptocurrency",
          },
        });

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }

        // Call the callback to close the dialog
        onCryptoSelect(selectedCrypto, quantity);
      } catch (error) {
        console.error("Error adding cryptocurrency to portfolio:", error);
        alert("Failed to add cryptocurrency to portfolio. Please try again.");
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
              placeholder="Search by cryptocurrency name or ticker symbol"
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
                  searchCryptos(searchQuery);
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
              {searchResults.map((crypto) => (
                <div
                  key={crypto.symbol}
                  className="p-2 hover:bg-muted/50 cursor-pointer flex justify-between items-center"
                  onClick={() => {
                    handleCryptoSelect(crypto);
                    setShowDropdown(false);
                    setSearchQuery(`${crypto.symbol} - ${crypto.name}`);
                  }}
                >
                  <div>
                    <div className="font-medium">{crypto.symbol}</div>
                    <div className="text-sm text-muted-foreground truncate">
                      {crypto.name}
                    </div>
                  </div>
                  <div className="text-right font-medium">
                    ${crypto.price.toFixed(2)}
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

      {/* Selected crypto details */}
      {selectedCrypto && (
        <div className="border rounded-md p-4 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-lg">{selectedCrypto.name}</h3>
              <p className="text-sm text-muted-foreground">
                {selectedCrypto.symbol}
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium">${selectedCrypto.price.toFixed(2)}</p>
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
                step="any"
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
              disabled={!selectedCrypto || quantity <= 0}
            >
              Add to Portfolio
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
