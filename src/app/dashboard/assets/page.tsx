import DashboardNavbar from "@/components/dashboard-navbar";
import Sidebar from "@/components/dashboard/sidebar";
import { createClient } from "../../../../supabase/server";
import { redirect } from "next/navigation";
import { SubscriptionCheck } from "@/components/subscription-check";
import AddAssetButton from "@/components/dashboard/add-asset-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Trash2 } from "lucide-react";
import { revalidatePath } from "next/cache";
import SyncAssetsButton from "@/components/dashboard/sync-assets-button";
import SyncSnapTradeAssets from "@/components/dashboard/sync-snaptrade-assets";
import dynamic from "next/dynamic";

// Dynamically import client components with no SSR
const BrokerAccountsList = dynamic(
  () => import("@/components/dashboard/broker-accounts-list"),
  { ssr: false },
);
const BrokerHoldingsList = dynamic(
  () => import("@/components/dashboard/broker-holdings-list"),
  { ssr: false },
);

export const dynamicParams = "force-dynamic";
export const revalidate = 0;

async function deleteAsset(formData: FormData) {
  "use server";

  const assetId = formData.get("assetId") as string;

  if (!assetId) {
    return;
  }

  const supabase = await createClient();

  // Delete the asset
  const { error } = await supabase.from("assets").delete().eq("id", assetId);

  if (error) {
    console.error("Error deleting asset:", error);
  }

  // Revalidate the page to show the updated list
  revalidatePath("/dashboard/assets");
}

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: {
    success?: string;
    error?: string;
    broker?: string;
    message?: string;
  };
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch user's assets
  const { data: assets } = await supabase
    .from("assets")
    .select("*, asset_categories(name, slug, icon)")
    .eq("is_liability", false);

  const showSuccessAlert = searchParams.success === "true";
  const showErrorAlert = searchParams.error === "true";
  const broker = searchParams.broker || "";
  const errorMessage = searchParams.message || "";

  return (
    <SubscriptionCheck>
      <DashboardNavbar />
      <div className="flex">
        <Sidebar />
        <main className="w-full bg-gray-50 min-h-screen pl-64">
          <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
            {/* SnapTrade Integration */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
              <BrokerAccountsList />
              <BrokerHoldingsList />
            </div>
            {/* Header Section with Sync Button */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h1 className="text-3xl font-bold">My Assets</h1>
              <div className="flex items-center gap-3">
                <SyncAssetsButton />
                <AddAssetButton />
                <div className="ml-2">
                  {/* @ts-expect-error Server Component */}
                  <SyncSnapTradeAssets />
                </div>
              </div>
            </header>

            {/* Success/Error Alerts */}
            {showSuccessAlert && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Success</AlertTitle>
                <AlertDescription className="text-green-700">
                  Your accounts have been successfully linked
                  {broker ? ` with ${broker}` : ""}. If your assets don't appear
                  below, click the "Sync Assets" button above.
                </AlertDescription>
              </Alert>
            )}

            {showErrorAlert && (
              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">Error</AlertTitle>
                <AlertDescription className="text-red-700">
                  {errorMessage ||
                    "There was a problem linking your accounts. Please try again or contact support."}
                </AlertDescription>
              </Alert>
            )}

            {/* Assets List */}
            <Card className="shadow-sm border-gray-200 overflow-hidden">
              <CardHeader className="from-blue-50 to-indigo-50 pb-4 bg-[#f0f0f0]">
                <CardTitle className="text-blue-800 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-briefcase"
                  >
                    <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                  All Assets
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {assets && assets.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead className="bg-muted/50 border-b">
                        <tr>
                          <th className="text-left p-3 font-medium text-sm">
                            Name
                          </th>
                          <th className="text-right p-3 font-medium text-sm">
                            Quantity
                          </th>
                          <th className="text-right p-3 font-medium text-sm">
                            Price per share
                          </th>
                          <th className="text-right p-3 font-medium text-sm">
                            Total Value
                          </th>
                          <th className="text-right p-3 font-medium text-sm">
                            Gain/Loss
                          </th>
                          <th className="text-right p-3 font-medium text-sm">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {assets.map((asset) => {
                          // Check if this is a stock asset
                          const isStock =
                            asset.metadata?.asset_type === "stock";
                          const stockMetadata = isStock ? asset.metadata : null;

                          // Calculate gain/loss if it's a stock
                          const gainLoss =
                            isStock && asset.acquisition_value
                              ? asset.value - asset.acquisition_value
                              : 0;

                          // Calculate percentage change
                          const percentChange =
                            isStock && asset.acquisition_value
                              ? ((asset.value - asset.acquisition_value) /
                                  asset.acquisition_value) *
                                100
                              : 0;

                          // Generate a fake identifier for stocks
                          const identifier = isStock
                            ? `USD${Math.floor(Math.random() * 900000000) + 100000000}`
                            : "";

                          // Convert USD to EUR (simplified conversion for demo)
                          const eurRate = 0.82;
                          const valueEUR = asset.value * eurRate;
                          const pricePerShareEUR = isStock
                            ? stockMetadata.price_per_share * eurRate
                            : 0;
                          const gainLossEUR = gainLoss * eurRate;

                          return (
                            <tr
                              key={asset.id}
                              className="hover:bg-muted/30 transition-colors"
                            >
                              <td className="p-3">
                                <div className="font-medium">{asset.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {asset.asset_categories?.name ||
                                    "Uncategorized"}
                                </div>
                              </td>
                              <td className="p-3 text-right">
                                {isStock
                                  ? stockMetadata.quantity.toLocaleString()
                                  : "-"}
                              </td>
                              <td className="p-3 text-right">
                                {isStock ? (
                                  <div>
                                    <div>€{pricePerShareEUR.toFixed(2)}</div>
                                    <div className="text-xs text-muted-foreground">
                                      $
                                      {stockMetadata.price_per_share.toFixed(2)}
                                    </div>
                                  </div>
                                ) : (
                                  "-"
                                )}
                              </td>
                              <td className="p-3 text-right font-medium">
                                <div>€{valueEUR.toFixed(2)}</div>
                                <div className="text-xs text-muted-foreground">
                                  ${asset.value.toFixed(2)}
                                </div>
                              </td>
                              <td className="p-3 text-right">
                                {isStock ? (
                                  <div
                                    className={
                                      gainLoss >= 0
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }
                                  >
                                    {gainLoss >= 0 ? "" : "-"}€
                                    {Math.abs(gainLossEUR).toFixed(2)}
                                  </div>
                                ) : (
                                  "-"
                                )}
                              </td>
                              <td className="p-3 text-right">
                                <form action={deleteAsset}>
                                  <input
                                    type="hidden"
                                    name="assetId"
                                    value={asset.id}
                                  />
                                  <button
                                    type="submit"
                                    className="text-red-500 hover:text-red-700 transition-colors p-1 rounded-full hover:bg-red-50"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="lucide lucide-trash-2"
                                    >
                                      <path d="M3 6h18" />
                                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                      <line x1="10" x2="10" y1="11" y2="17" />
                                      <line x1="14" x2="14" y1="11" y2="17" />
                                    </svg>
                                  </button>
                                </form>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 px-4 bg-gray-50">
                    <div className="inline-flex rounded-full bg-blue-100 p-4 mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-blue-600"
                      >
                        <rect
                          width="20"
                          height="14"
                          x="2"
                          y="7"
                          rx="2"
                          ry="2"
                        />
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                      </svg>
                    </div>
                    <p className="text-muted-foreground mb-2">
                      No assets found. Add your first asset to get started.
                    </p>
                    <button
                      onClick={() => {}}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 8v8" />
                        <path d="M8 12h8" />
                      </svg>
                      Add Asset
                    </button>
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
