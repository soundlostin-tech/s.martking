"use client";

import { cn } from "@/lib/utils";

type StatusBadgeVariant = "live" | "pending" | "completed" | "failed" | "upcoming";

interface StatusBadgeProps {
  variant: StatusBadgeVariant;
  children?: React.ReactNode;
  className?: string;
}

const variantStyles: Record<StatusBadgeVariant, string> = {
  live: "bg-[#D7FD03] text-[#11130D]",
  pending: "bg-[#F5D68A] text-[#7A5C00]",
  completed: "bg-[#868935]/20 text-[#868935]",
  failed: "bg-[#F5A8A8] text-[#8A2020]",
  upcoming: "bg-[#E8E9EC] text-[#4A4B48]",
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
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
        variantStyles[variant],
        className
      )}
    >
      {variant === "live" && (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      )}
      {children || variantLabels[variant]}
    </span>
  );
}
