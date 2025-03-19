"use client";

import { useEffect, useRef, useState } from "react";

export default function StatsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [counts, setCounts] = useState({ assets: 0, users: 0, uptime: 0 });

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
      const duration = 2000; // Animation duration in ms
      const interval = 20; // Update interval in ms

      const assetsTarget = 2;
      const usersTarget = 10000;
      const uptimeTarget = 99.9;

      const assetsIncrement = (assetsTarget / duration) * interval;
      const usersIncrement = (usersTarget / duration) * interval;
      const uptimeIncrement = (uptimeTarget / duration) * interval;

      const timer = setInterval(() => {
        setCounts((prev) => {
          const newAssets = Math.min(
            prev.assets + assetsIncrement,
            assetsTarget,
          );
          const newUsers = Math.min(prev.users + usersIncrement, usersTarget);
          const newUptime = Math.min(
            prev.uptime + uptimeIncrement,
            uptimeTarget,
          );

          if (
            newAssets === assetsTarget &&
            newUsers === usersTarget &&
            newUptime === uptimeTarget
          ) {
            clearInterval(timer);
          }

          return {
            assets: newAssets,
            users: newUsers,
            uptime: newUptime,
          };
        });
      }, interval);

      return () => clearInterval(timer);
    }
  }, [isVisible]);

  const formatNumber = (num: number) => {
    if (num >= 1) {
      return num.toFixed(1).replace(/\.0$/, "");
    }
    return num.toFixed(1);
  };

  return (
    <section
      ref={sectionRef}
      className="py-20 bg-white text-gray-900 relative overflow-hidden border-y border-gray-200"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        ></div>
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div
            className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <div className="text-4xl font-bold mb-2 text-primary">
              ${formatNumber(counts.assets)}B+
            </div>
            <div className="text-gray-600">Assets Tracked</div>
          </div>
          <div
            className={`transition-all duration-1000 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <div className="text-4xl font-bold mb-2 text-primary">
              {Math.round(counts.users).toLocaleString()}+
            </div>
            <div className="text-gray-600">Active Users</div>
          </div>
          <div
            className={`transition-all duration-1000 delay-600 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <div className="text-4xl font-bold mb-2 text-primary">
              {formatNumber(counts.uptime)}%
            </div>
            <div className="text-gray-600">Uptime Reliability</div>
          </div>
        </div>
      </div>
    </section>
  );
}
