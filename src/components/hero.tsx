import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  BarChart4,
  PieChart,
  LineChart,
} from "lucide-react";

export default function Hero() {
  return (
    <div className="relative overflow-hidden bg-white">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 opacity-70" />

      <div className="relative pt-24 pb-32 sm:pt-32 sm:pb-40">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-8 tracking-tight">
              Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Complete
              </span>{" "}
              Financial Dashboard
            </h1>

            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Track all your assets in one place. Get insights into your net
              worth, asset allocation, and financial performance with our
              powerful wealth management platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center px-8 py-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
              >
                Get Started Free
                <ArrowUpRight className="ml-2 w-5 h-5" />
              </Link>

              <Link
                href="#pricing"
                className="inline-flex items-center px-8 py-4 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-lg font-medium"
              >
                View Pricing
              </Link>
            </div>

            {/* Feature highlights */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm">
                <PieChart className="w-10 h-10 text-blue-500 mb-3" />
                <h3 className="font-semibold mb-1">Asset Allocation</h3>
                <p className="text-sm text-gray-600">
                  Visualize your portfolio distribution
                </p>
              </div>
              <div className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm">
                <BarChart4 className="w-10 h-10 text-blue-500 mb-3" />
                <h3 className="font-semibold mb-1">Net Worth Tracking</h3>
                <p className="text-sm text-gray-600">
                  Monitor your complete financial picture
                </p>
              </div>
              <div className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm">
                <LineChart className="w-10 h-10 text-blue-500 mb-3" />
                <h3 className="font-semibold mb-1">Performance Analysis</h3>
                <p className="text-sm text-gray-600">
                  Track growth across all investments
                </p>
              </div>
            </div>

            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
