import DashboardNavbar from "@/components/dashboard-navbar";
import Sidebar from "@/components/dashboard/sidebar";
import { createClient } from "../../../../supabase/server";
import { redirect } from "next/navigation";
import { SubscriptionCheck } from "@/components/subscription-check";
import AddAssetButton from "@/components/dashboard/add-asset-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DebtsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch user's liabilities
  const { data: liabilities } = await supabase
    .from("assets")
    .select("*, asset_categories(name, slug, icon)")
    .eq("is_liability", true);

  return (
    <SubscriptionCheck>
      <DashboardNavbar />
      <div className="flex">
        <Sidebar />
        <main className="w-full bg-gray-50 min-h-screen pl-64">
          <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h1 className="text-3xl font-bold">My Debts</h1>
              <AddAssetButton />
            </header>

            {/* Liabilities List */}
            <Card>
              <CardHeader>
                <CardTitle>All Liabilities</CardTitle>
              </CardHeader>
              <CardContent>
                {liabilities && liabilities.length > 0 ? (
                  <div className="divide-y">
                    {liabilities.map((liability) => (
                      <div
                        key={liability.id}
                        className="py-4 flex justify-between items-center"
                      >
                        <div>
                          <h3 className="font-medium">{liability.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {liability.asset_categories?.name ||
                              "Uncategorized"}{" "}
                            • {liability.location || "No lender"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-red-600">
                            {new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: "USD",
                              maximumFractionDigits: 0,
                            }).format(liability.value)}
                          </p>
                          {liability.acquisition_value && (
                            <p className="text-xs text-muted-foreground">
                              Original amount:{" "}
                              {new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: "USD",
                                maximumFractionDigits: 0,
                              }).format(liability.acquisition_value)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No liabilities found. You're debt-free!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SubscriptionCheck>
  );
}
