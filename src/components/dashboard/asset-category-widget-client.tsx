"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  ArrowUpRight,
  DollarSign,
  Landmark,
  Home,
  Coins,
  CreditCard,
  Database,
} from "lucide-react";

interface AssetCategoryWidgetClientProps {
  title: string;
  iconName:
    | "DollarSign"
    | "Landmark"
    | "Home"
    | "Coins"
    | "CreditCard"
    | "Database";
  totalValue: number;
  changePercentage?: number;
  assetCount: number;
}

export default function AssetCategoryWidgetClient({
  title = "Category",
  iconName,
  totalValue = 0,
  changePercentage = 0,
  assetCount = 0,
}: AssetCategoryWidgetClientProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const isPositiveChange = changePercentage >= 0;

  // Map icon names to their components
  const getIcon = () => {
    switch (iconName) {
      case "DollarSign":
        return <DollarSign className="h-5 w-5 text-primary" />;
      case "Landmark":
        return <Landmark className="h-5 w-5 text-primary" />;
      case "Home":
        return <Home className="h-5 w-5 text-primary" />;
      case "Coins":
        return <Coins className="h-5 w-5 text-primary" />;
      case "CreditCard":
        return <CreditCard className="h-5 w-5 text-primary" />;
      case "Database":
        return <Database className="h-5 w-5 text-primary" />;
      default:
        return <DollarSign className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <Card className="bg-white hover:shadow-lg transition-all duration-300 border-0 rounded-xl">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2.5 rounded-full">{getIcon()}</div>
            <CardTitle className="text-lg font-medium text-gray-800">
              {title}
            </CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {}}
            className="rounded-lg border border-gray-200 hover:bg-primary/5 hover:text-primary transition-all duration-200"
          >
            <PlusCircle className="h-4 w-4 mr-1.5" />
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <h3 className="text-2xl font-bold text-gray-900">
            {formatCurrency(totalValue)}
          </h3>

          {changePercentage !== 0 && (
            <div
              className={`flex items-center ${isPositiveChange ? "text-emerald-600" : "text-rose-600"} font-medium`}
            >
              {isPositiveChange ? (
                <ArrowUpRight className="h-4 w-4 mr-1.5" />
              ) : (
                <ArrowUpRight className="h-4 w-4 mr-1.5 transform rotate-90" />
              )}
              <span className="text-sm">
                {Math.abs(changePercentage).toFixed(1)}% this month
              </span>
            </div>
          )}

          <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-100">
            <span className="text-sm text-gray-500 font-medium">
              {assetCount} {assetCount === 1 ? "asset" : "assets"}
            </span>
            <Button
              variant="link"
              size="sm"
              onClick={() => {}}
              className="p-0 h-auto text-primary hover:text-primary/80 font-medium"
            >
              View details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
