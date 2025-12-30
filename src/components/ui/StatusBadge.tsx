"use client";

import { cn } from "@/lib/utils";

type StatusBadgeVariant = "live" | "pending" | "completed" | "failed" | "upcoming";

interface StatusBadgeProps {
  variant: StatusBadgeVariant;
  children?: React.ReactNode;
  className?: string;
}

const variantClasses: Record<StatusBadgeVariant, string> = {
  live: "bg-[#C6F6D5] text-[#1A1A1A]",
  pending: "bg-[#FEF08A] text-[#1A1A1A]",
  completed: "bg-[#DCFCE7] text-[#1A1A1A]",
  failed: "bg-[#FECACA] text-[#1A1A1A]",
  upcoming: "bg-[#BAE6FD] text-[#1A1A1A]",
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
        "inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide h-[20px]",
        variantClasses[variant],
        className
      )}
    >
      {variant === "live" && (
        <span className="w-2 h-2 rounded-full bg-[#1A1A1A] animate-pulse" />
      )}
      {children || variantLabels[variant]}
    </span>
  );
}
