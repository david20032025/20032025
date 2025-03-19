"use client";

import { LucideIcon } from "lucide-react";

interface AssetCategoryIconProps {
  icon: LucideIcon;
}

export default function AssetCategoryIcon({
  icon: Icon,
}: AssetCategoryIconProps) {
  return (
    <div className="bg-blue-100 p-2 rounded-full">
      <Icon className="h-5 w-5 text-blue-600" />
    </div>
  );
}
