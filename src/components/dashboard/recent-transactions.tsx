import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface Transaction {
  id: string;
  type: "increase" | "decrease";
  name: string;
  category: string;
  date: string;
  amount: number;
}

interface RecentTransactionsProps {
  transactions?: Transaction[];
}

export default function RecentTransactions({
  transactions = [],
}: RecentTransactionsProps) {
  // Sample data if no transactions are provided
  const sampleTransactions: Transaction[] = [
    {
      id: "1",
      type: "increase",
      name: "Stock Market Gain",
      category: "Investments",
      date: "Today",
      amount: 1250,
    },
    {
      id: "2",
      type: "decrease",
      name: "Credit Card Payment",
      category: "Debt",
      date: "Yesterday",
      amount: 500,
    },
    {
      id: "3",
      type: "increase",
      name: "Rental Income",
      category: "Real Estate",
      date: "Jul 15, 2023",
      amount: 2000,
    },
    {
      id: "4",
      type: "decrease",
      name: "Property Tax",
      category: "Real Estate",
      date: "Jul 10, 2023",
      amount: 1800,
    },
  ];

  const displayTransactions =
    transactions.length > 0 ? transactions : sampleTransactions;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="border-0 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 bg-white">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-800">
          Recent Changes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {displayTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-full ${transaction.type === "increase" ? "bg-emerald-100" : "bg-rose-100"}`}
                >
                  {transaction.type === "increase" ? (
                    <ArrowUpRight
                      className={`h-4 w-4 ${transaction.type === "increase" ? "text-emerald-600" : "text-rose-600"}`}
                    />
                  ) : (
                    <ArrowDownRight
                      className={`h-4 w-4 ${transaction.type === "increase" ? "text-emerald-600" : "text-rose-600"}`}
                    />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-800">
                    {transaction.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {transaction.category} • {transaction.date}
                  </p>
                </div>
              </div>
              <div
                className={`font-medium ${transaction.type === "increase" ? "text-emerald-600" : "text-rose-600"}`}
              >
                {transaction.type === "increase" ? "+" : "-"}
                {formatCurrency(transaction.amount)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
