import SummaryHeader from "./summary-header";

interface SummaryServerProps {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  changePercentage: number;
}

export default function SummaryServer(props: SummaryServerProps) {
  return <SummaryHeader {...props} />;
}
