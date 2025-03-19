"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  BarChart4,
  PieChart,
  LineChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DarkHero() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="relative overflow-hidden bg-background pt-20">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/50 to-card opacity-70" />

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-20 w-80 h-80 bg-electric-blue/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-neon-green/5 rounded-full blur-3xl" />
      </div>

      <div className="relative pt-24 pb-32 sm:pt-32 sm:pb-40">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1
              className={`text-5xl sm:text-6xl font-bold mb-8 tracking-tight transition-all duration-1000 ${isVisible ? "opacity-100" : "opacity-0 translate-y-10"}`}
            >
              Maximize Your{" "}
              <span className="gradient-text font-extrabold">Investments</span>{" "}
              with Powerful Tools
            </h1>

            <p
              className={`text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed transition-all duration-1000 delay-300 ${isVisible ? "opacity-100" : "opacity-0 translate-y-10"}`}
            >
              Access real-time analytics, optimized portfolios, and expert
              advice with our intuitive wealth management platform.
            </p>

            <div
              className={`flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-1000 delay-500 ${isVisible ? "opacity-100" : "opacity-0 translate-y-10"}`}
            >
              <Link
                href="/sign-up"
                className="inline-flex items-center px-8 py-4 text-white bg-primary rounded-lg hover:bg-primary/90 transition-all text-lg font-medium group"
              >
                Get Started Free
                <ArrowUpRight className="ml-2 w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>

              <Link
                href="#pricing"
                className="inline-flex items-center px-8 py-4 text-foreground bg-secondary rounded-lg hover:bg-secondary/80 transition-all text-lg font-medium"
              >
                View Pricing
              </Link>
            </div>

            {/* Animated graph in background */}
            <div className="mt-16 relative h-40 mx-auto max-w-md">
              <svg
                className="w-full h-full animate-rise"
                viewBox="0 0 400 100"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient
                    id="graphGradient"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop
                      offset="0%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity="0.2"
                    />
                    <stop
                      offset="100%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity="0"
                    />
                  </linearGradient>
                </defs>
                <path
                  d="M0,100 L0,80 C20,70 40,90 60,75 C80,60 100,50 120,55 C140,60 160,80 180,70 C200,60 220,40 240,35 C260,30 280,40 300,30 C320,20 340,10 360,15 C380,20 400,30 400,25 L400,100 Z"
                  fill="url(#graphGradient)"
                />
                <path
                  d="M0,80 C20,70 40,90 60,75 C80,60 100,50 120,55 C140,60 160,80 180,70 C200,60 220,40 240,35 C260,30 280,40 300,30 C320,20 340,10 360,15 C380,20 400,30 400,25"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="1000"
                  strokeDashoffset="1000"
                  className="animate-draw"
                />
                <circle
                  cx="60"
                  cy="75"
                  r="4"
                  fill="hsl(var(--primary))"
                  className="animate-pulse-slow"
                />
                <circle
                  cx="180"
                  cy="70"
                  r="4"
                  fill="hsl(var(--primary))"
                  className="animate-pulse-slow"
                />
                <circle
                  cx="300"
                  cy="30"
                  r="4"
                  fill="hsl(var(--primary))"
                  className="animate-pulse-slow"
                />
                <circle
                  cx="400"
                  cy="25"
                  r="4"
                  fill="hsl(var(--primary))"
                  className="animate-pulse-slow"
                />
              </svg>
              <style jsx>{`
                @keyframes animate-draw {
                  to {
                    stroke-dashoffset: 0;
                  }
                }
                .animate-draw {
                  animation: animate-draw 2s ease-out forwards;
                }
              `}</style>
            </div>

            {/* Feature highlights */}
            <div
              className={`mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto transition-all duration-1000 delay-700 ${isVisible ? "opacity-100" : "opacity-0 translate-y-10"}`}
            >
              <div className="flex flex-col items-center p-6 bg-card rounded-xl shadow-sm hover:shadow-md transition-all hover:translate-y-[-5px] duration-300">
                <PieChart className="w-10 h-10 text-primary mb-3" />
                <h3 className="font-semibold mb-1">Asset Allocation</h3>
                <p className="text-sm text-muted-foreground">
                  Visualize your portfolio distribution
                </p>
              </div>
              <div className="flex flex-col items-center p-6 bg-card rounded-xl shadow-sm hover:shadow-md transition-all hover:translate-y-[-5px] duration-300">
                <BarChart4 className="w-10 h-10 text-primary mb-3" />
                <h3 className="font-semibold mb-1">Net Worth Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor your complete financial picture
                </p>
              </div>
              <div className="flex flex-col items-center p-6 bg-card rounded-xl shadow-sm hover:shadow-md transition-all hover:translate-y-[-5px] duration-300">
                <LineChart className="w-10 h-10 text-primary mb-3" />
                <h3 className="font-semibold mb-1">Performance Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Track growth across all investments
                </p>
              </div>
            </div>

            <div
              className={`mt-12 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-muted-foreground transition-all duration-1000 delay-1000 ${isVisible ? "opacity-100" : "opacity-0"}`}
            >
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-neon-green" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-neon-green" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-neon-green" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
