"use client";

import { LucideIcon } from "lucide-react";

interface SummaryIconProps {
  icon: LucideIcon;
  bgColor: string;
  iconColor: string;
}

export default function SummaryIcon({
  icon: Icon,
  bgColor,
  iconColor,
}: SummaryIconProps) {
  return (
    <div className={`${bgColor} p-2 rounded-full`}>
      <Icon className={`h-6 w-6 ${iconColor}`} />
    </div>
  );
}
