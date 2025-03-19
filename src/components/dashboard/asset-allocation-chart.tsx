"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AssetAllocationTreemap from "./asset-allocation-treemap";

interface AssetAllocationChartProps {
  assets?: any[] | null;
  className?: string;
}

export default function AssetAllocationChart({
  assets = [],
  className = "",
}: AssetAllocationChartProps) {
  // Process assets into categories for the treemap
  const processAssetData = () => {
    if (!assets || assets.length === 0) return [];

    // Group assets by category
    const categories: Record<string, number> = {};

    assets.forEach((asset) => {
      if (asset.is_liability) return; // Skip liabilities

      const categoryName = asset.asset_categories?.name || "Other";
      if (!categories[categoryName]) {
        categories[categoryName] = 0;
      }
      categories[categoryName] += asset.value || 0;
    });

    // Define colors for categories
    const categoryColors: Record<string, string> = {
      Cash: "#8ab4f8", // Light blue
      Investments: "#673ab7", // Purple
      "Real Estate": "#e91e63", // Pink/Red
      Cryptocurrency: "#5e35b1", // Deep purple
      "Precious Metals": "#8ab4f8", // Light blue
      Stocks: "#673ab7", // Purple
      "Stocks & Funds": "#673ab7", // Purple
      Other: "#ff9800", // Orange
    };

    // Convert to array format for treemap
    return Object.entries(categories).map(([category, value]) => ({
      category,
      value,
      color: categoryColors[category] || "#ff9800", // Default to orange if no color defined
    }));
  };

  const assetData = processAssetData();

  return (
    <Card
      className={
        className +
        " flex flex-col h-full border-0 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
      }
    >
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold text-gray-800">
            Distribution
          </CardTitle>
          <div className="flex gap-2">
            <button className="p-2 bg-gray-100 rounded-md hover:bg-primary/10 hover:text-primary transition-all duration-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </button>
            <button className="p-2 bg-gray-100 rounded-md hover:bg-primary/10 hover:text-primary transition-all duration-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="8"></circle>
                <path d="M12 12v-8"></path>
                <path d="M12 12 16 16"></path>
              </svg>
            </button>
            <button className="p-2 bg-gray-100 rounded-md hover:bg-primary/10 hover:text-primary transition-all duration-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 20v-6"></path>
                <path d="M6 20V10"></path>
                <path d="M18 20V4"></path>
              </svg>
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <AssetAllocationTreemap assetData={assetData} />
      </CardContent>
    </Card>
  );
}
