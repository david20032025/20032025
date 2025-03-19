"use client";

import { useEffect, useRef, useState } from "react";
import { ChartPieIcon, LineChart, Shield, BarChart4 } from "lucide-react";

export default function ServiceBenefits() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

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

  const benefits = [
    {
      icon: <ChartPieIcon className="w-8 h-8" />,
      title: "Real-Time Analytics",
      description:
        "Track your investments live with powerful visualization tools",
      delay: 0,
    },
    {
      icon: <LineChart className="w-8 h-8" />,
      title: "Optimized Portfolios",
      description: "Investment strategies tailored to your financial goals",
      delay: 200,
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Maximum Security",
      description: "Enterprise-grade encryption protects your data and assets",
      delay: 400,
    },
    {
      icon: <BarChart4 className="w-8 h-8" />,
      title: "Insightful Reports",
      description: "Comprehensive analysis of your financial performance",
      delay: 600,
    },
  ];

  return (
    <section ref={sectionRef} id="features" className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2
            className={`text-3xl font-bold mb-4 text-gray-900 transition-all duration-700 ${isVisible ? "opacity-100" : "opacity-0 translate-y-10"}`}
          >
            Powerful Investment Tools
          </h2>
          <p
            className={`text-gray-600 max-w-2xl mx-auto transition-all duration-700 delay-300 ${isVisible ? "opacity-100" : "opacity-0 translate-y-10"}`}
          >
            Our platform provides everything you need to make informed
            investment decisions
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className={`p-6 bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition-all duration-500 hover:translate-y-[-5px] ${isVisible ? "opacity-100" : "opacity-0 translate-y-10"}`}
              style={{ transitionDelay: `${benefit.delay}ms` }}
            >
              <div className="text-primary mb-4 bg-gray-100 p-4 rounded-lg inline-block">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                {benefit.title}
              </h3>
              <p className="text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
