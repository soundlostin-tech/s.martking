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
      light: "card-premium text-foreground",
      dark: "bg-primary text-primary-foreground shadow-lg border-primary/10",
      highlight: "bg-secondary text-secondary-foreground shadow-lg border-secondary/10",
    };

  return (
    <div
      className={cn(
        "relative p-6 rounded-[32px] border transition-all overflow-hidden group",
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
        <p className={cn("text-[10px] font-bold uppercase tracking-[0.2em]", 
          variant === "light" ? "text-muted-foreground" : "text-primary-foreground/70")}>
          {title}
        </p>
        {showIcon && (
          <div className={cn(
            "p-2 rounded-xl",
            variant === "light" ? "bg-muted" : "bg-white/10"
          )}>
            <ArrowUpRight size={18} />
          </div>
        )}
      </div>

      <h2 className="text-3xl font-heading mb-1">{value}</h2>
      
      {subtext && (
        <p className={cn("text-[11px] font-bold opacity-70 uppercase tracking-wider", 
          variant === "light" ? "text-muted-foreground" : "text-primary-foreground/60")}>
          {subtext}
        </p>
      )}

      {trend && (
        <div className="mt-4 flex items-center gap-2">
          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/20 text-accent")}>{trend}</span>
          <span className="text-[9px] font-bold opacity-50 uppercase tracking-widest">Growth</span>
        </div>
      )}
    </div>
  );
}
