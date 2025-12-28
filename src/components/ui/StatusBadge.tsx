"use client";

import { cn } from "@/lib/utils";

type StatusBadgeVariant = "live" | "pending" | "completed" | "failed" | "upcoming";

interface StatusBadgeProps {
  variant: StatusBadgeVariant;
  children?: React.ReactNode;
  className?: string;
}

const variantClasses: Record<StatusBadgeVariant, string> = {
  live: "bg-[#FFF8E1] text-[#2D3436]",
  pending: "bg-[#FFF3CD] text-[#2D3436]",
  completed: "bg-gray-100 text-[#636E72]",
  failed: "bg-[#FFEBEE] text-[#C62828]",
  upcoming: "bg-[#E3F2FD] text-[#2D3436]",
};

const variantLabels: Record<StatusBadgeVariant, string> = {
  live: "LIVE",
  pending: "PENDING",
  completed: "COMPLETED",
  failed: "FAILED",
  upcoming: "UPCOMING",
};

export function StatusBadge({ variant, children, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm transition-all",
        variantClasses[variant],
        className
      )}
    >
      {variant === "live" && (
        <span className="w-2 h-2 rounded-full bg-[#2D3436] animate-pulse" />
      )}
      {children || variantLabels[variant]}
    </span>
  );
}
