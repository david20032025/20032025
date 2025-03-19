"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useRef, useState } from "react";

interface PortfolioChartProps {
  totalAssets?: number;
  totalLiabilities?: number;
  className?: string;
}

export default function PortfolioChart({
  totalAssets = 0,
  totalLiabilities = 0,
  className = "",
}: PortfolioChartProps) {
  const [timeframe, setTimeframe] = useState("1m");
  const [hoveredPoint, setHoveredPoint] = useState<{
    date: Date;
    value: number;
    x: number;
    y: number;
  } | null>(null);

  // Add support for more timeframes
  const timeframeMap = {
    "1d": 1,
    "7d": 7,
    "1m": 30,
    ytd: Math.floor(
      (new Date() - new Date(new Date().getFullYear(), 0, 1)) /
        (1000 * 60 * 60 * 24),
    ),
    "1y": 365,
    all: 730,
  };
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const netWorth = totalAssets - totalLiabilities;

  // Generate sample historical data based on current values
  const generateHistoricalData = () => {
    const now = new Date();
    const data = [];

    // Number of data points based on timeframe
    let days = timeframeMap[timeframe] || 30; // Use the timeframe map

    // Starting value (current net worth minus some growth)
    const startingValue = netWorth * 0.8;
    const growth = netWorth - startingValue;

    // Generate data points
    for (let i = 0; i <= days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (days - i));

      // Create a slightly random growth curve
      const progress = i / days;
      const randomFactor = 1 + (Math.random() * 0.1 - 0.05); // +/- 5%
      const value = startingValue + growth * progress * progress * randomFactor;

      data.push({
        date,
        value: Math.max(0, value),
      });
    }

    return data;
  };

  // Draw the chart
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Generate data
    const data = generateHistoricalData();
    if (data.length === 0) return;

    // Set canvas dimensions
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Find min and max values for scaling
    const values = data.map((d) => d.value);
    const maxValue = Math.max(...values) * 1.1; // Add 10% padding
    const minValue = Math.min(0, Math.min(...values) * 0.9); // Include zero

    // Calculate scaling factors
    const xScale = width / (data.length - 1);
    const yScale = height / (maxValue - minValue);

    // Draw axes
    ctx.strokeStyle = "#e5e7eb"; // Light gray
    ctx.lineWidth = 1;

    // Draw horizontal grid lines
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = height - i * (height / gridLines);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();

      // Add value labels
      const value = minValue + i * ((maxValue - minValue) / gridLines);
      ctx.fillStyle = "#9ca3af"; // Gray
      ctx.font = "10px Arial";
      ctx.textAlign = "left";
      ctx.fillText(
        new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: "EUR",
          maximumFractionDigits: 0,
        }).format(value),
        5,
        y - 5,
      );
    }

    // Draw the line
    ctx.beginPath();
    ctx.moveTo(0, height - (data[0].value - minValue) * yScale);

    for (let i = 1; i < data.length; i++) {
      const x = i * xScale;
      const y = height - (data[i].value - minValue) * yScale;
      ctx.lineTo(x, y);
    }

    // Style the line
    ctx.strokeStyle = "#000000"; // Black line as requested
    ctx.lineWidth = 2;
    ctx.stroke();

    // Fill area under the line
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fillStyle = "rgba(128, 128, 128, 0.1)"; // Light gray as requested
    ctx.fill();

    // Add date markers
    ctx.fillStyle = "#9ca3af"; // Gray
    ctx.font = "10px Arial";
    ctx.textAlign = "center";

    const dateMarkers = 6; // Number of date markers to show
    for (let i = 0; i <= dateMarkers; i++) {
      const index = Math.floor((i * (data.length - 1)) / dateMarkers);
      const x = index * xScale;
      const date = data[index].date;
      ctx.fillText(date.toLocaleDateString("fr-FR"), x, height - 5);
    }

    // Store the data and scaling for hover interactions
    canvas.dataset.chartData = JSON.stringify({
      data,
      xScale,
      yScale,
      minValue,
      height,
    });
  }, [timeframe, netWorth, totalAssets, totalLiabilities]);

  // Handle mouse movement for interactive tooltip
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Get chart data from dataset
      const chartDataStr = canvas.dataset.chartData;
      if (!chartDataStr) return;

      const chartData = JSON.parse(chartDataStr);
      const { data, xScale, yScale, minValue, height } = chartData;

      // Find the closest data point
      const index = Math.min(
        Math.max(0, Math.round(x / xScale)),
        data.length - 1,
      );
      const dataPoint = data[index];
      const pointY = height - (dataPoint.value - minValue) * yScale;

      setHoveredPoint({
        date: new Date(dataPoint.date),
        value: dataPoint.value,
        x: index * xScale,
        y: pointY,
      });
    };

    const handleMouseLeave = () => {
      setHoveredPoint(null);
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [timeframe]);

  // Calculate growth percentage
  const historicalData = generateHistoricalData();
  const startingValue = historicalData.length > 0 ? historicalData[0].value : 0;
  const growthAmount = netWorth - startingValue;
  const growthPercentage =
    startingValue > 0 ? (growthAmount / startingValue) * 100 : 0;

  return (
    <Card
      className={
        className +
        " h-full border-0 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
      }
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-semibold text-gray-800">
              Net Worth
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              {new Date().toLocaleDateString("fr-FR")}
            </p>
            <p className="text-3xl font-bold mt-2 text-gray-900">
              {new Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency: "EUR",
                maximumFractionDigits: 0,
              }).format(netWorth)}
            </p>
          </div>
          <Tabs
            defaultValue="1m"
            value={timeframe}
            onValueChange={setTimeframe}
            className="w-auto"
          >
            <TabsList className="grid grid-cols-6 w-[300px] bg-gray-100 p-1 rounded-lg">
              <TabsTrigger
                value="1d"
                className="rounded-md data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
              >
                1D
              </TabsTrigger>
              <TabsTrigger
                value="7d"
                className="rounded-md data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
              >
                7D
              </TabsTrigger>
              <TabsTrigger
                value="1m"
                className="rounded-md data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
              >
                1M
              </TabsTrigger>
              <TabsTrigger
                value="ytd"
                className="rounded-md data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
              >
                YTD
              </TabsTrigger>
              <TabsTrigger
                value="1y"
                className="rounded-md data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
              >
                1Y
              </TabsTrigger>
              <TabsTrigger
                value="all"
                className="rounded-md data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
              >
                ALL
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {netWorth > 0 ? (
          <>
            <div ref={chartContainerRef} className="relative">
              <canvas
                ref={canvasRef}
                width={1000}
                height={300}
                className="w-full h-auto"
              />
              {hoveredPoint && (
                <div
                  className="absolute pointer-events-none bg-white p-3 rounded-lg shadow-lg border border-gray-100 z-10"
                  style={{
                    left: `${hoveredPoint.x}px`,
                    top: `${hoveredPoint.y}px`,
                    transform: "translate(-50%, -100%)",
                  }}
                >
                  <div className="text-sm font-medium">
                    {hoveredPoint.date.toLocaleDateString("fr-FR")}
                  </div>
                  <div className="text-sm font-bold">
                    {new Intl.NumberFormat("fr-FR", {
                      style: "currency",
                      currency: "EUR",
                      maximumFractionDigits: 0,
                    }).format(hoveredPoint.value)}
                  </div>
                </div>
              )}
              {hoveredPoint && (
                <div
                  className="absolute pointer-events-none w-px h-full bg-gray-300 z-5"
                  style={{
                    left: `${hoveredPoint.x}px`,
                    top: "0",
                  }}
                ></div>
              )}
              {hoveredPoint && (
                <div
                  className="absolute pointer-events-none w-3 h-3 rounded-full bg-primary border-2 border-white z-10"
                  style={{
                    left: `${hoveredPoint.x}px`,
                    top: `${hoveredPoint.y}px`,
                    transform: "translate(-50%, -50%)",
                  }}
                ></div>
              )}
            </div>
            <div className="flex justify-between mt-6 text-sm pt-4 border-t border-gray-100">
              <div>
                <p className="text-gray-500 font-medium">Starting Value</p>
                <p className="font-semibold text-gray-800 mt-1">
                  {new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                    maximumFractionDigits: 0,
                  }).format(startingValue)}
                </p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Current Net Worth</p>
                <p className="font-semibold text-gray-800 mt-1">
                  {new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                    maximumFractionDigits: 0,
                  }).format(netWorth)}
                </p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Growth</p>
                <p
                  className={`font-semibold mt-1 ${growthAmount >= 0 ? "text-emerald-600" : "text-rose-600"}`}
                >
                  {growthAmount >= 0 ? "+" : ""}
                  {new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                    maximumFractionDigits: 0,
                  }).format(growthAmount)}{" "}
                  ({growthAmount >= 0 ? "+" : ""}
                  {growthPercentage.toFixed(1)}%)
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="h-[300px] w-full flex items-center justify-center bg-gray-50 rounded-md">
            <p className="text-muted-foreground text-sm">
              Add assets to see your net worth growth
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
