import DashboardNavbar from "@/components/dashboard-navbar";
import Sidebar from "@/components/dashboard/sidebar";
import { createClient } from "../../../../supabase/server";
import { redirect } from "next/navigation";
import { SubscriptionCheck } from "@/components/subscription-check";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default async function GoalsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Sample goals data
  const goals = [
    {
      id: 1,
      name: "Retirement Fund",
      target: 1000000,
      current: 350000,
      deadline: "2045-01-01",
      progress: 35,
    },
    {
      id: 2,
      name: "Home Down Payment",
      target: 100000,
      current: 65000,
      deadline: "2025-06-30",
      progress: 65,
    },
    {
      id: 3,
      name: "Emergency Fund",
      target: 30000,
      current: 30000,
      deadline: "2023-12-31",
      progress: 100,
    },
  ];

  return (
    <SubscriptionCheck>
      <DashboardNavbar />
      <div className="flex">
        <Sidebar />
        <main className="w-full bg-gray-50 min-h-screen pl-64">
          <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold">My Financial Goals</h1>
                <p className="text-muted-foreground mt-1">
                  Track your progress towards important financial milestones
                </p>
              </div>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add New Goal
              </Button>
            </header>

            {/* Goals List */}
            <div className="grid grid-cols-1 gap-6">
              {goals.map((goal) => (
                <Card key={goal.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle>{goal.name}</CardTitle>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          Target:{" "}
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                            maximumFractionDigits: 0,
                          }).format(goal.target)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Deadline:{" "}
                          {new Date(goal.deadline).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                            maximumFractionDigits: 0,
                          }).format(goal.current)}
                        </span>
                        <span className="text-sm font-medium">
                          {goal.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${goal.progress === 100 ? "bg-green-600" : "bg-blue-600"}`}
                          style={{ width: `${goal.progress}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between">
                        <Button variant="outline" size="sm">
                          Update Progress
                        </Button>
                        <Button variant="ghost" size="sm">
                          Edit Goal
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </SubscriptionCheck>
  );
}
