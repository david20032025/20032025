"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AssetAllocationTreemapProps {
  assetData: {
    category: string;
    value: number;
    color: string;
  }[];
  className?: string;
}

export default function AssetAllocationTreemap({
  assetData = [],
  className = "",
}: AssetAllocationTreemapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Calculate total value of all assets
  const totalValue = assetData.reduce((sum, asset) => sum + asset.value, 0);

  // Draw the treemap
  useEffect(() => {
    if (!canvasRef.current || assetData.length === 0 || totalValue === 0)
      return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Sort data by value (descending)
    const sortedData = [...assetData].sort((a, b) => b.value - a.value);

    // Function to draw a rectangle with text
    const drawRect = (
      x: number,
      y: number,
      w: number,
      h: number,
      asset: (typeof assetData)[0],
    ) => {
      // Draw rectangle
      ctx.fillStyle = asset.color;
      ctx.fillRect(x, y, w, h);

      // Draw border
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);

      // Only draw text if rectangle is big enough
      if (w > 80 && h > 60) {
        const percentage = ((asset.value / totalValue) * 100).toFixed(0);
        const formattedValue = new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: "EUR",
          maximumFractionDigits: 0,
        }).format(asset.value);

        const text = `${formattedValue}\n${asset.category} • ${percentage}%`;

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 14px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Draw multiline text
        const lines = text.split("\n");
        const lineHeight = 20;

        if (lines.length > 1 && w > 120 && h > 80) {
          lines.forEach((line, i) => {
            const yPos =
              y +
              h / 2 -
              ((lines.length - 1) * lineHeight) / 2 +
              i * lineHeight;
            ctx.fillText(line, x + w / 2, yPos);
          });
        } else {
          // Measure text width for single line fallback
          const singleLineText = `${asset.category} • ${percentage}%`;
          const textWidth = ctx.measureText(singleLineText).width;

          // If text fits, draw it
          if (textWidth < w - 10) {
            ctx.fillText(singleLineText, x + w / 2, y + h / 2);
          } else {
            // Try with smaller font
            ctx.font = "bold 12px Arial";
            const smallerTextWidth = ctx.measureText(singleLineText).width;

            if (smallerTextWidth < w - 10) {
              ctx.fillText(singleLineText, x + w / 2, y + h / 2);
            } else if (w > 40 && h > 30) {
              // Just show percentage if even smaller
              const shortText = `${percentage}%`;
              ctx.fillText(shortText, x + w / 2, y + h / 2);
            }
          }
        }
      } else if (w > 40 && h > 30) {
        // For smaller rectangles, just show percentage
        const percentage = ((asset.value / totalValue) * 100).toFixed(0);
        const shortText = `${percentage}%`;

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(shortText, x + w / 2, y + h / 2);
      }
    };

    // Simple treemap layout algorithm
    const layoutTreemap = (
      data: typeof assetData,
      x: number,
      y: number,
      width: number,
      height: number,
    ) => {
      if (data.length === 0) return;
      if (data.length === 1) {
        drawRect(x, y, width, height, data[0]);
        return;
      }

      // Determine split direction (horizontal or vertical)
      const splitHorizontal = width > height;

      // Calculate total value for this subset
      const subsetTotal = data.reduce((sum, item) => sum + item.value, 0);

      // Initialize position variables
      let currentX = x;
      let currentY = y;
      let remainingWidth = width;
      let remainingHeight = height;

      // Process each item
      for (let i = 0; i < data.length - 1; i++) {
        const item = data[i];
        const ratio = item.value / subsetTotal;

        if (splitHorizontal) {
          // Split horizontally
          const itemWidth = Math.floor(width * ratio);
          drawRect(currentX, currentY, itemWidth, height, item);
          currentX += itemWidth;
          remainingWidth -= itemWidth;
        } else {
          // Split vertically
          const itemHeight = Math.floor(height * ratio);
          drawRect(currentX, currentY, width, itemHeight, item);
          currentY += itemHeight;
          remainingHeight -= itemHeight;
        }
      }

      // Last item takes remaining space
      drawRect(
        currentX,
        currentY,
        remainingWidth,
        remainingHeight,
        data[data.length - 1],
      );
    };

    // Start layout
    layoutTreemap(sortedData, 0, 0, width, height);
  }, [assetData, totalValue]);

  return (
    <>
      {assetData.length > 0 ? (
        <div className="space-y-4">
          <canvas
            ref={canvasRef}
            width={600}
            height={400}
            className="w-full h-auto"
          />
          <div className="grid grid-cols-2 gap-2">
            {assetData.map((asset, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: asset.color }}
                />
                <span className="text-sm">
                  {asset.category} (
                  {((asset.value / totalValue) * 100).toFixed(0)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="h-[300px] w-full flex items-center justify-center bg-gray-50 rounded-md">
          <p className="text-muted-foreground text-sm">
            No asset data available
          </p>
        </div>
      )}
    </>
  );
}
