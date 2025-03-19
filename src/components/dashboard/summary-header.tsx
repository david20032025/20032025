"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import SummaryIconServer from "./summary-icon-server";

interface SummaryHeaderProps {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  changePercentage: number;
}

export default function SummaryHeader({
  netWorth = 0,
  totalAssets = 0,
  totalLiabilities = 0,
  changePercentage = 0,
}: SummaryHeaderProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const isPositiveChange = changePercentage >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Net Worth Card */}
      <Card className="bg-white">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-muted-foreground mb-1 flex font-black">
                Net Worth
              </p>
              <h2 className="text-3xl font-bold text-[#0f0f0f]">
                {formatCurrency(netWorth)}
              </h2>
              <div
                className={`flex items-center mt-2 ${isPositiveChange ? "text-green-600" : "text-red-600"}`}
              >
                {isPositiveChange ? (
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                )}
                <span className="text-sm font-medium">
                  {Math.abs(changePercentage).toFixed(2)}%
                </span>
                <span className="text-xs text-muted-foreground ml-1">
                  from last month
                </span>
              </div>
            </div>
            <SummaryIconServer
              iconName="DollarSign"
              bgColor="bg-blue-100"
              iconColor="text-blue-600"
            />
          </div>
        </CardContent>
      </Card>
      {/* Assets Card */}
      <Card className="bg-white">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Total Assets
              </p>
              <h2 className="text-3xl font-bold">
                {formatCurrency(totalAssets)}
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                {totalLiabilities > 0
                  ? `Liabilities: ${formatCurrency(totalLiabilities)}`
                  : "No liabilities"}
              </p>
            </div>
            <SummaryIconServer
              iconName="TrendingUp"
              bgColor="bg-green-100"
              iconColor="text-green-600"
            />
          </div>
        </CardContent>
      </Card>
      {/* Allocation Card */}
      <Card className="bg-white">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Asset Allocation
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm">Cash (25%)</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm">Investments (40%)</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span className="text-sm">Real Estate (35%)</span>
              </div>
            </div>
            <SummaryIconServer
              iconName="PieChart"
              bgColor="bg-purple-100"
              iconColor="text-purple-600"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
