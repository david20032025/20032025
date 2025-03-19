import { DollarSign, Landmark, Home, Coins, CreditCard } from "lucide-react";
import AssetCategoryWidget from "./asset-category-widget";

interface AssetCategoryServerProps {
  title: string;
  iconName: "DollarSign" | "Landmark" | "Home" | "Coins" | "CreditCard";
  totalValue: number;
  changePercentage?: number;
  assetCount: number;
  onAddAsset: () => void;
  onViewDetails: () => void;
}

export default function AssetCategoryServer({
  title,
  iconName,
  totalValue,
  changePercentage,
  assetCount,
  onAddAsset,
  onViewDetails,
}: AssetCategoryServerProps) {
  // Map icon names to their components
  const getIcon = () => {
    switch (iconName) {
      case "DollarSign":
        return DollarSign;
      case "Landmark":
        return Landmark;
      case "Home":
        return Home;
      case "Coins":
        return Coins;
      case "CreditCard":
        return CreditCard;
      default:
        return DollarSign;
    }
  };

  // Get the icon component
  const IconComponent = getIcon();

  return (
    <AssetCategoryWidget
      title={title}
      icon={IconComponent}
      totalValue={totalValue}
      changePercentage={changePercentage}
      assetCount={assetCount}
      onAddAsset={onAddAsset}
      onViewDetails={onViewDetails}
    />
  );
}
