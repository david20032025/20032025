import DashboardNavbar from "@/components/dashboard-navbar";
import Sidebar from "@/components/dashboard/sidebar";
import { createClient } from "../../../../supabase/server";
import { redirect } from "next/navigation";
import { SubscriptionCheck } from "@/components/subscription-check";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function RevenuePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <SubscriptionCheck>
      <DashboardNavbar />
      <div className="flex">
        <Sidebar />
        <main className="w-full bg-gray-50 min-h-screen pl-64">
          <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
            {/* Header Section */}
            <header>
              <h1 className="text-3xl font-bold">Revenue Estimation</h1>
              <p className="text-muted-foreground mt-2">
                Track and estimate your passive income from various sources
              </p>
            </header>

            {/* Revenue Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Monthly Income</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">$1,250</p>
                  <p className="text-sm text-muted-foreground">
                    Estimated monthly passive income
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Annual Income</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">$15,000</p>
                  <p className="text-sm text-muted-foreground">
                    Projected annual passive income
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Yield</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">4.2%</p>
                  <p className="text-sm text-muted-foreground">
                    Average yield across all assets
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Income Sources */}
            <Card>
              <CardHeader>
                <CardTitle>Income Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {[
                    { name: "Dividend Stocks", amount: 450, percentage: 36 },
                    { name: "Rental Property", amount: 600, percentage: 48 },
                    { name: "Interest", amount: 200, percentage: 16 },
                  ].map((source, index) => (
                    <div
                      key={index}
                      className="py-4 flex justify-between items-center"
                    >
                      <div>
                        <h3 className="font-medium">{source.name}</h3>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{ width: `${source.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                          }).format(source.amount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {source.percentage}% of total
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SubscriptionCheck>
  );
}
