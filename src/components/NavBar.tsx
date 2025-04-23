"use client";

import { Clock, BarChart2, Ruler } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const NavBar = () => {
  const [activeItem, setActiveItem] = useState("Timer");

  const navItems = [
    { label: "Weight", icon: Ruler },
    { icon: BarChart2, label: "Fasts" },
    { icon: Clock, label: "Timer" },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 z-50 flex w-full justify-around border-t border-[var(--border)] bg-[var(--card)] py-3 md:hidden">
        {navItems.map((item) => (
          <div
            key={item.label}
            className={cn(
              "flex flex-col items-center",
              activeItem === item.label
                ? "text-[var(--primary)]"
                : "text-[var(--muted-foreground)]",
            )}
            onClick={() => setActiveItem(item.label)}
          >
            <item.icon className="h-5 w-5" />
            <span className="mt-1 text-xs">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Desktop Sidebar */}
      <div className="fixed top-0 left-0 z-50 hidden h-full w-16 flex-col items-center border-r border-[var(--border)] bg-[var(--card)] py-8 md:flex">
        {navItems.map((item) => (
          <div
            key={item.label}
            className={cn(
              "mb-8 flex flex-col items-center",
              activeItem === item.label
                ? "text-[var(--primary)]"
                : "text-[var(--muted-foreground)]",
            )}
            onClick={() => setActiveItem(item.label)}
          >
            <item.icon className="h-6 w-6" />
            <span className="mt-1 text-xs">{item.label}</span>
          </div>
        ))}
      </div>
    </>
  );
};
