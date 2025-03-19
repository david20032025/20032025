"use client";

import { useEffect, useRef, useState } from "react";

export default function PerformanceGraph() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        const interval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 100) {
              clearInterval(interval);
              return 100;
            }
            return prev + 1;
          });
        }, 20);
        return () => clearInterval(interval);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  // Sample data points for the graph
  const generatePath = () => {
    const points = [];
    let x = 0;
    let y = 80;

    // Starting point
    points.push(`M0,${y}`);

    // Generate curve points
    for (let i = 1; i <= 10; i++) {
      x = i * 40;
      // Create a slightly upward trend with some randomness
      y = Math.max(10, Math.min(90, y - (Math.random() * 15 - 7) - 3));
      points.push(`L${x},${y}`);
    }

    return points.join(" ");
  };

  const pathData = generatePath();
  const milestones = [
    { x: 120, y: 65, label: "+15%", month: "3 Months" },
    { x: 240, y: 55, label: "+28%", month: "6 Months" },
    { x: 360, y: 40, label: "+42%", month: "9 Months" },
  ];

  return (
    <section
      ref={sectionRef}
      id="performance"
      className="py-24 bg-background relative overflow-hidden"
    >
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -right-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-20 w-64 h-64 bg-neon-green/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-16">
          <h2
            className={`text-3xl font-bold mb-4 transition-all duration-700 ${isVisible ? "opacity-100" : "opacity-0 translate-y-10"}`}
          >
            Maximize Your Investment Growth
          </h2>
          <p
            className={`text-muted-foreground max-w-2xl mx-auto transition-all duration-700 delay-300 ${isVisible ? "opacity-100" : "opacity-0 translate-y-10"}`}
          >
            Our platform has helped investors achieve consistent returns through
            optimized portfolio strategies
          </p>
        </div>

        <div
          className={`max-w-4xl mx-auto bg-card rounded-xl shadow-lg p-6 md:p-8 transition-all duration-1000 ${isVisible ? "opacity-100" : "opacity-0 translate-y-10"}`}
        >
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-semibold">Portfolio Performance</h3>
              <div className="text-primary font-semibold">+42% YTD</div>
            </div>
            <div className="flex space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
                <span>Your Portfolio</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-muted-foreground mr-2"></div>
                <span>Market Average</span>
              </div>
            </div>
          </div>

          {/* Graph */}
          <div className="relative h-64 w-full">
            <svg
              className="w-full h-full"
              viewBox="0 0 400 100"
              preserveAspectRatio="none"
            >
              {/* Grid lines */}
              <line
                x1="0"
                y1="0"
                x2="400"
                y2="0"
                stroke="hsl(var(--border))"
                strokeWidth="0.5"
              />
              <line
                x1="0"
                y1="25"
                x2="400"
                y2="25"
                stroke="hsl(var(--border))"
                strokeWidth="0.5"
              />
              <line
                x1="0"
                y1="50"
                x2="400"
                y2="50"
                stroke="hsl(var(--border))"
                strokeWidth="0.5"
              />
              <line
                x1="0"
                y1="75"
                x2="400"
                y2="75"
                stroke="hsl(var(--border))"
                strokeWidth="0.5"
              />
              <line
                x1="0"
                y1="100"
                x2="400"
                y2="100"
                stroke="hsl(var(--border))"
                strokeWidth="0.5"
              />

              <line
                x1="0"
                y1="0"
                x2="0"
                y2="100"
                stroke="hsl(var(--border))"
                strokeWidth="0.5"
              />
              <line
                x1="100"
                y1="0"
                x2="100"
                y2="100"
                stroke="hsl(var(--border))"
                strokeWidth="0.5"
              />
              <line
                x1="200"
                y1="0"
                x2="200"
                y2="100"
                stroke="hsl(var(--border))"
                strokeWidth="0.5"
              />
              <line
                x1="300"
                y1="0"
                x2="300"
                y2="100"
                stroke="hsl(var(--border))"
                strokeWidth="0.5"
              />
              <line
                x1="400"
                y1="0"
                x2="400"
                y2="100"
                stroke="hsl(var(--border))"
                strokeWidth="0.5"
              />

              {/* Market average line */}
              <path
                d="M0,70 L400,60"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth="1.5"
                strokeDasharray="5,5"
                fill="none"
                strokeLinecap="round"
                style={{
                  strokeDashoffset: isVisible ? 0 : 1000,
                  transition: "stroke-dashoffset 2s ease-out",
                }}
              />

              {/* Portfolio performance area */}
              <defs>
                <linearGradient
                  id="areaGradient"
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
                <clipPath id="graphClip">
                  <rect
                    x="0"
                    y="0"
                    width={400 * (progress / 100)}
                    height="100"
                  />
                </clipPath>
              </defs>

              {/* Area under the curve */}
              <path
                d={`${pathData} L400,100 L0,100 Z`}
                fill="url(#areaGradient)"
                clipPath="url(#graphClip)"
              />

              {/* Main curve line */}
              <path
                d={pathData}
                stroke="hsl(var(--primary))"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                clipPath="url(#graphClip)"
              />

              {/* Milestone points */}
              {milestones.map((milestone, index) => (
                <g key={index} clipPath="url(#graphClip)">
                  <circle
                    cx={milestone.x}
                    cy={milestone.y}
                    r="4"
                    fill="hsl(var(--card))"
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                  />
                  <text
                    x={milestone.x}
                    y={milestone.y - 10}
                    textAnchor="middle"
                    fill="hsl(var(--primary))"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    {milestone.label}
                  </text>
                  <text
                    x={milestone.x}
                    y={milestone.y + 20}
                    textAnchor="middle"
                    fill="hsl(var(--muted-foreground))"
                    fontSize="8"
                  >
                    {milestone.month}
                  </text>
                </g>
              ))}
            </svg>

            {/* X-axis labels */}
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <div>Jan</div>
              <div>Mar</div>
              <div>Jun</div>
              <div>Sep</div>
              <div>Dec</div>
            </div>
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { label: "Annual Return", value: "24.8%" },
              { label: "Volatility", value: "12.3%" },
              { label: "Sharpe Ratio", value: "1.86" },
              { label: "Max Drawdown", value: "8.2%" },
            ].map((metric, index) => (
              <div key={index} className="bg-secondary/30 p-4 rounded-lg">
                <div className="text-muted-foreground text-sm">
                  {metric.label}
                </div>
                <div className="text-xl font-semibold mt-1">{metric.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
