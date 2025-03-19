"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FinalCTA() {
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
      className="py-20 bg-white relative overflow-hidden border-t border-gray-200"
    >
      <div className="container mx-auto px-4 text-center relative">
        <div
          className={`max-w-3xl mx-auto transition-all duration-1000 ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
            Ready to Transform Your Investments?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of investors who trust our platform to manage their
            complete financial portfolio.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white group"
              >
                Start Your Free Trial
                <ArrowUpRight className="ml-2 w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Button>
            </Link>
            <Link href="#pricing">
              <Button
                size="lg"
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10"
              >
                View Pricing Plans
              </Button>
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-5 gap-6 text-sm">
            {[
              "Time-Saving Tools",
              "Maximized Returns",
              "Bank-Grade Security",
              "24/7 Access",
              "Expert Support",
            ].map((benefit, index) => (
              <div
                key={index}
                className="bg-gray-50 p-3 rounded-lg shadow-sm text-gray-700"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {benefit}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
