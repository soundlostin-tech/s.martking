"use client";

import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

interface AnalyticsCardProps {
  title: string;
  value: string;
  subtext?: string;
  trend?: string;
  variant?: "light" | "dark" | "highlight";
  className?: string;
  showIcon?: boolean;
}

export function AnalyticsCard({
  title,
  value,
  subtext,
  trend,
  variant = "light",
  className,
  showIcon = true,
}: AnalyticsCardProps) {
  const variants = {
    light: "bg-alabaster-grey-2 text-onyx border-stone-200",
    dark: "bg-onyx/20 text-white border-white/10 glass shadow-lg",
    highlight: "bg-gradient-to-br from-lime-yellow to-lemon-lime text-onyx shadow-lg",
  };

  return (
    <div
      className={cn(
        "relative p-6 rounded-[24px] border transition-all overflow-hidden group",
        variants[variant],
        className
      )}
    >
      {variant === "highlight" && (
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle cx="90" cy="10" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="90" cy="10" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="90" cy="10" r="20" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </svg>
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <p className={cn("text-sm opacity-80 uppercase tracking-wider font-medium", variant === "highlight" ? "text-onyx/60" : "text-stone-500")}>
          {title}
        </p>
        {showIcon && (
          <div className={cn(
            "p-2 rounded-full",
            variant === "light" ? "bg-stone-100" : "bg-white/10"
          )}>
            <ArrowUpRight size={18} />
          </div>
        )}
      </div>

      <h2 className="text-3xl font-heading mb-1">{value}</h2>
      
      {subtext && (
        <p className={cn("text-sm opacity-70", variant === "highlight" ? "text-onyx/60" : "text-stone-500")}>
          {subtext}
        </p>
      )}

      {trend && (
        <div className="mt-4 flex items-center gap-1">
          <span className="text-xs font-bold text-olive">{trend}</span>
          <span className="text-xs opacity-50">vs last month</span>
        </div>
      )}
    </div>
  );
}
