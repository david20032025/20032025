"use client";

import { useEffect, useRef, useState } from "react";
import { DollarSign, Landmark, Home, Coins, CreditCard } from "lucide-react";

export default function AssetCategories() {
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

  const categories = [
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: "Cash",
      description: "Bank accounts, savings, and liquid assets",
      delay: 0,
    },
    {
      icon: <Landmark className="w-8 h-8" />,
      title: "Investments",
      description: "Stocks, bonds, ETFs, and mutual funds",
      delay: 100,
    },
    {
      icon: <Home className="w-8 h-8" />,
      title: "Real Estate",
      description: "Properties, mortgages, and REITs",
      delay: 200,
    },
    {
      icon: <Coins className="w-8 h-8" />,
      title: "Cryptocurrency",
      description: "Bitcoin, Ethereum, and other digital assets",
      delay: 300,
    },
    {
      icon: <CreditCard className="w-8 h-8" />,
      title: "Debt",
      description: "Credit cards, loans, and liabilities",
      delay: 400,
    },
  ];

  return (
    <section ref={sectionRef} className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2
            className={`text-3xl font-bold mb-4 text-gray-900 transition-all duration-700 ${isVisible ? "opacity-100" : "opacity-0 translate-y-10"}`}
          >
            Track All Your Assets
          </h2>
          <p
            className={`text-gray-600 max-w-2xl mx-auto transition-all duration-700 delay-300 ${isVisible ? "opacity-100" : "opacity-0 translate-y-10"}`}
          >
            Our comprehensive platform supports all major asset classes in one
            unified dashboard
          </p>
        </div>

        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-8">
          {categories.map((category, index) => (
            <div
              key={index}
              className={`p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-500 text-center hover:translate-y-[-5px] ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
              style={{ transitionDelay: `${category.delay}ms` }}
            >
              <div className="text-primary mb-4 flex justify-center">
                <div className="bg-gray-100 p-4 rounded-full">
                  {category.icon}
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                {category.title}
              </h3>
              <p className="text-gray-600 text-sm">{category.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
