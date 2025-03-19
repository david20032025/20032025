"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchCarPrice } from "@/utils/car-api";
import { createClient } from "../../../supabase/client";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CarSearchProps {
  onCarSelectData?: string;
}

export default function CarSearch({ onCarSelectData }: CarSearchProps) {
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState("");

  // Dropdown states
  const [makeOptions, setMakeOptions] = useState<string[]>([]);
  const [modelOptions, setModelOptions] = useState<string[]>([]);
  const [yearOptions, setYearOptions] = useState<string[]>([]);
  const [showMakeDropdown, setShowMakeDropdown] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);

  // Refs for dropdown containers
  const makeDropdownRef = useRef<HTMLDivElement>(null);
  const modelDropdownRef = useRef<HTMLDivElement>(null);
  const yearDropdownRef = useRef<HTMLDivElement>(null);

  // Car data
  const makes = [
    "Toyota",
    "Honda",
    "Ford",
    "Chevrolet",
    "BMW",
    "Mercedes",
    "Audi",
    "Tesla",
    "Volkswagen",
    "Hyundai",
    "Kia",
    "Nissan",
    "Subaru",
    "Mazda",
    "Lexus",
  ];

  const modelsByMake: Record<string, string[]> = {
    Toyota: ["Camry", "Corolla", "RAV4", "Highlander", "Tacoma", "Prius"],
    Honda: ["Civic", "Accord", "CR-V", "Pilot", "Odyssey", "Fit"],
    Ford: ["F-150", "Mustang", "Explorer", "Escape", "Edge", "Bronco"],
    Chevrolet: [
      "Silverado",
      "Equinox",
      "Tahoe",
      "Malibu",
      "Camaro",
      "Suburban",
    ],
    BMW: ["3 Series", "5 Series", "X3", "X5", "7 Series", "i4"],
    Mercedes: ["C-Class", "E-Class", "S-Class", "GLC", "GLE", "A-Class"],
    Audi: ["A4", "A6", "Q5", "Q7", "e-tron", "A3"],
    Tesla: ["Model 3", "Model Y", "Model S", "Model X", "Cybertruck"],
    Volkswagen: ["Golf", "Jetta", "Tiguan", "Atlas", "ID.4", "Passat"],
    Hyundai: ["Elantra", "Tucson", "Santa Fe", "Sonata", "Kona", "Palisade"],
    Kia: ["Forte", "Sportage", "Telluride", "Sorento", "Soul", "Seltos"],
    Nissan: ["Altima", "Rogue", "Sentra", "Pathfinder", "Murano", "Kicks"],
    Subaru: ["Outback", "Forester", "Crosstrek", "Impreza", "Ascent", "Legacy"],
    Mazda: ["CX-5", "Mazda3", "CX-9", "CX-30", "MX-5 Miata", "Mazda6"],
    Lexus: ["RX", "ES", "NX", "IS", "GX", "UX"],
  };

  // Generate years (last 20 years)
  const generateYears = () => {
    const years = [];
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 20; i++) {
      years.push((currentYear - i).toString());
    }
    return years;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResults(null);

    try {
      const data = await fetchCarPrice(make, model, year);
      setResults(data);
    } catch (err) {
      setError("Failed to fetch car price. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToPortfolio = async () => {
    if (!results) return;

    setLoading(true);
    try {
      const supabase = createClient();

      // Get category ID for cars
      const { data: categoryData } = await supabase
        .from("asset_categories")
        .select("id")
        .eq("slug", "investments")
        .single();

      if (!categoryData) {
        throw new Error("Category not found");
      }

      // Format the car name
      const carName = `${year} ${make} ${model}`;
      const carValue = results.averagePrice || 0;

      // Insert the asset
      const { error } = await supabase.from("assets").insert({
        name: carName,
        value: carValue,
        description: `Vehicle: ${year} ${make} ${model}`,
        category_id: categoryData.id,
        is_liability: false,
        acquisition_date: new Date().toISOString(),
        acquisition_value: carValue,
        metadata: {
          make,
          model,
          year,
          price_per_share: carValue,
          quantity: 1,
          asset_type: "vehicle",
          total_listings: results.totalListings || 0,
        },
      });

      if (error) throw error;

      // Instead of calling a callback function, we can dispatch a custom event
      if (typeof window !== "undefined") {
        const event = new CustomEvent("carSelected", {
          detail: {
            car: { make, model, year, price: carValue },
            value: carValue,
            data: onCarSelectData,
          },
        });
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.error("Error adding car to portfolio:", error);
      setError("Failed to add car to portfolio. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Filter options based on input
  useEffect(() => {
    if (make.trim() !== "") {
      const filtered = makes.filter((item) =>
        item.toLowerCase().includes(make.toLowerCase()),
      );
      setMakeOptions(filtered);
      setShowMakeDropdown(filtered.length > 0);
    } else {
      setMakeOptions(makes);
      setShowMakeDropdown(false);
    }
  }, [make]);

  useEffect(() => {
    if (make && model.trim() !== "") {
      const models = modelsByMake[make] || [];
      const filtered = models.filter((item) =>
        item.toLowerCase().includes(model.toLowerCase()),
      );
      setModelOptions(filtered);
      setShowModelDropdown(filtered.length > 0);
    } else if (make) {
      setModelOptions(modelsByMake[make] || []);
      setShowModelDropdown(false);
    } else {
      setModelOptions([]);
      setShowModelDropdown(false);
    }
  }, [make, model]);

  useEffect(() => {
    if (year.trim() !== "") {
      const years = generateYears();
      const filtered = years.filter((item) => item.includes(year));
      setYearOptions(filtered);
      setShowYearDropdown(filtered.length > 0);
    } else {
      setYearOptions(generateYears());
      setShowYearDropdown(false);
    }
  }, [year]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        makeDropdownRef.current &&
        !makeDropdownRef.current.contains(event.target as Node)
      ) {
        setShowMakeDropdown(false);
      }
      if (
        modelDropdownRef.current &&
        !modelDropdownRef.current.contains(event.target as Node)
      ) {
        setShowModelDropdown(false);
      }
      if (
        yearDropdownRef.current &&
        !yearDropdownRef.current.contains(event.target as Node)
      ) {
        setShowYearDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2" ref={makeDropdownRef}>
            <Label htmlFor="make">Make</Label>
            <div className="relative">
              <Input
                id="make"
                placeholder="e.g. Toyota"
                value={make}
                onChange={(e) => setMake(e.target.value)}
                onFocus={() => setShowMakeDropdown(make.trim() !== "" || true)}
                required
                className="w-full"
              />
              <button
                type="button"
                onClick={() => setShowMakeDropdown(!showMakeDropdown)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                <ChevronsUpDown className="h-4 w-4 text-gray-500" />
              </button>

              {showMakeDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
                  {makeOptions.length > 0 ? (
                    makeOptions.map((option, index) => (
                      <div
                        key={index}
                        className={cn(
                          "px-3 py-2 cursor-pointer hover:bg-gray-100",
                          make === option && "bg-primary/10 font-medium",
                        )}
                        onClick={() => {
                          setMake(option);
                          setShowMakeDropdown(false);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          {option}
                          {make === option && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-gray-500">No results</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2" ref={modelDropdownRef}>
            <Label htmlFor="model">Model</Label>
            <div className="relative">
              <Input
                id="model"
                placeholder="e.g. Camry"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                onFocus={() =>
                  make && setShowModelDropdown(model.trim() !== "" || true)
                }
                required
                disabled={!make}
                className="w-full"
              />
              <button
                type="button"
                onClick={() => make && setShowModelDropdown(!showModelDropdown)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                disabled={!make}
              >
                <ChevronsUpDown className="h-4 w-4 text-gray-500" />
              </button>

              {showModelDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
                  {modelOptions.length > 0 ? (
                    modelOptions.map((option, index) => (
                      <div
                        key={index}
                        className={cn(
                          "px-3 py-2 cursor-pointer hover:bg-gray-100",
                          model === option && "bg-primary/10 font-medium",
                        )}
                        onClick={() => {
                          setModel(option);
                          setShowModelDropdown(false);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          {option}
                          {model === option && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-gray-500">No results</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2" ref={yearDropdownRef}>
            <Label htmlFor="year">Year</Label>
            <div className="relative">
              <Input
                id="year"
                placeholder="e.g. 2020"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                onFocus={() => setShowYearDropdown(year.trim() !== "" || true)}
                required
                disabled={!make || !model}
                className="w-full"
              />
              <button
                type="button"
                onClick={() =>
                  make && model && setShowYearDropdown(!showYearDropdown)
                }
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                disabled={!make || !model}
              >
                <ChevronsUpDown className="h-4 w-4 text-gray-500" />
              </button>

              {showYearDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
                  {yearOptions.length > 0 ? (
                    yearOptions.map((option, index) => (
                      <div
                        key={index}
                        className={cn(
                          "px-3 py-2 cursor-pointer hover:bg-gray-100",
                          year === option && "bg-primary/10 font-medium",
                        )}
                        onClick={() => {
                          setYear(option);
                          setShowYearDropdown(false);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          {option}
                          {year === option && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-gray-500">No results</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>
      </form>

      {error && <div className="text-red-500">{error}</div>}

      {results && (
        <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
          <h3 className="text-lg font-medium">
            {year} {make} {model}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Average Price</p>
              <p className="text-xl font-bold">
                $
                {results.averagePrice?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }) || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Available Listings</p>
              <p className="text-xl font-bold">{results.totalListings || 0}</p>
            </div>
          </div>

          {results.listings && results.listings.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Sample Listings</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {results.listings.map((listing: any, index: number) => (
                  <div
                    key={index}
                    className="text-sm p-2 bg-white rounded border"
                  >
                    <div className="flex justify-between">
                      <span>
                        {listing.build?.year} {listing.build?.make}{" "}
                        {listing.build?.model} {listing.build?.trim}
                      </span>
                      <span className="font-medium">
                        ${listing.price?.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {listing.miles
                        ? `${listing.miles.toLocaleString()} miles`
                        : ""}
                      {listing.dealer?.city && listing.dealer?.state
                        ? ` • ${listing.dealer.city}, ${listing.dealer.state}`
                        : ""}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <Button onClick={handleAddToPortfolio} disabled={loading}>
              {loading ? "Adding..." : "Add to Portfolio"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
