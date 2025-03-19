"use client";

import { useEffect, useRef, useState } from "react";
import { Quote } from "lucide-react";

export default function Testimonials() {
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

  const testimonials = [
    {
      quote:
        "Real-time analytics helped me make informed decisions. A must-have tool for any serious investor.",
      name: "Pierre D.",
      title: "Entrepreneur",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=pierre",
      delay: 0,
    },
    {
      quote:
        "The security and ease of use are top-notch. My clients love the detailed reports I can provide them.",
      name: "Sophie R.",
      title: "Wealth Manager",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sophie",
      delay: 200,
    },
    {
      quote:
        "I've tried many investment platforms, but this one stands out with its intuitive interface and powerful analytics.",
      name: "Michael T.",
      title: "Day Trader",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
      delay: 400,
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="testimonials"
      className="py-24 bg-gray-50 relative overflow-hidden"
    >
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-16">
          <h2
            className={`text-3xl font-bold mb-4 text-gray-900 transition-all duration-700 ${isVisible ? "opacity-100" : "opacity-0 translate-y-10"}`}
          >
            What Our Clients Say
          </h2>
          <p
            className={`text-gray-600 max-w-2xl mx-auto transition-all duration-700 delay-300 ${isVisible ? "opacity-100" : "opacity-0 translate-y-10"}`}
          >
            Join thousands of investors who trust our platform to manage their
            financial portfolio
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
              style={{ transitionDelay: `${testimonial.delay}ms` }}
            >
              <Quote className="text-primary/70 w-10 h-10 mb-4" />
              <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4 bg-gray-100">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {testimonial.title}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
