import { DollarSign, TrendingUp, PieChart } from "lucide-react";
import SummaryIcon from "./summary-icon";

interface SummaryIconServerProps {
  iconName: "DollarSign" | "TrendingUp" | "PieChart";
  bgColor: string;
  iconColor: string;
}

export default function SummaryIconServer({
  iconName,
  bgColor,
  iconColor,
}: SummaryIconServerProps) {
  // Get the icon component based on name
  const getIcon = () => {
    switch (iconName) {
      case "DollarSign":
        return DollarSign;
      case "TrendingUp":
        return TrendingUp;
      case "PieChart":
        return PieChart;
      default:
        return DollarSign;
    }
  };

  // Get the icon component
  const IconComponent = getIcon();

  return (
    <SummaryIcon icon={IconComponent} bgColor={bgColor} iconColor={iconColor} />
  );
}
