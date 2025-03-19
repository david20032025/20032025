"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  TrendingUp,
  Target,
  CreditCard,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";
import { useState } from "react";

export default function SidebarClient() {
  const pathname = usePathname();
  const [portfolioOpen, setPortfolioOpen] = useState(false);

  const isActive = (path: string) => {
    return pathname === path;
  };

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: "Portfolio",
      icon: <Briefcase className="h-5 w-5" />,
      hasChildren: true,
      children: [
        {
          title: "Assets",
          href: "/dashboard/assets",
          icon: <Briefcase className="h-4 w-4" />,
        },
        {
          title: "Debts",
          href: "/dashboard/debts",
          icon: <CreditCard className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "Revenue Estimation",
      href: "/dashboard/revenue",
      icon: <TrendingUp className="h-5 w-5" />,
    },
    {
      title: "My Goals",
      href: "/dashboard/goals",
      icon: <Target className="h-5 w-5" />,
    },
  ];

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex-shrink-0 fixed left-0 top-0 pt-16">
      <h4 className="font-semibold tracking-tight sticky flex text-2xl justify-center items-start">
        {" "}
        QEEM
      </h4>
      <div className="flex flex-col h-full overflow-y-auto py-6 px-4">
        <nav className="space-y-1">
          {navItems.map((item, index) => {
            if (item.hasChildren) {
              return (
                <div key={index} className="space-y-1">
                  <button
                    onClick={() => setPortfolioOpen(!portfolioOpen)}
                    className={cn(
                      "flex items-center w-full px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors",
                      portfolioOpen ? "text-blue-600" : "text-gray-700",
                    )}
                  >
                    <span className="flex items-center">
                      {item.icon}
                      <span className="ml-3">{item.title}</span>
                    </span>
                    <span className="ml-auto">
                      {portfolioOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </span>
                  </button>
                  {portfolioOpen && (
                    <div className="pl-10 space-y-1">
                      {item.children?.map((child, childIndex) => (
                        <Link
                          key={childIndex}
                          href={child.href}
                          className={cn(
                            "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors",
                            isActive(child.href)
                              ? "text-blue-600 bg-blue-50"
                              : "text-gray-700",
                          )}
                        >
                          {child.icon}
                          <span className="ml-3">{child.title}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors",
                  isActive(item.href)
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700",
                )}
              >
                {item.icon}
                <span className="ml-3">{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
