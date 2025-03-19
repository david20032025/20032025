"use client";

import { useEffect, useRef, useState } from "react";
import PricingCard from "@/components/pricing-card";

export default function PricingSection({
  plans,
  user,
}: {
  plans: any;
  user: any;
}) {
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

  return (
    <section
      ref={sectionRef}
      id="pricing"
      className="py-24 bg-card relative overflow-hidden"
    >
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-neon-green/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-16">
          <h2
            className={`text-3xl font-bold mb-4 transition-all duration-700 ${isVisible ? "opacity-100" : "opacity-0 translate-y-10"}`}
          >
            Simple, Transparent Pricing
          </h2>
          <p
            className={`text-muted-foreground max-w-2xl mx-auto transition-all duration-700 delay-300 ${isVisible ? "opacity-100" : "opacity-0 translate-y-10"}`}
          >
            Choose the perfect plan for your financial journey. No hidden fees.
          </p>
        </div>
        <div
          className={`grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto transition-all duration-1000 ${isVisible ? "opacity-100" : "opacity-0 translate-y-10"}`}
        >
          {plans?.map((item: any, index: number) => (
            <div
              key={item.id}
              className="transition-all duration-500"
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              <PricingCard item={item} user={user} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
