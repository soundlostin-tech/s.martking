"use client";

import { cn } from "@/lib/utils";

type StatusBadgeVariant = "live" | "pending" | "completed" | "failed" | "upcoming";

interface StatusBadgeProps {
  variant: StatusBadgeVariant;
  children?: React.ReactNode;
  className?: string;
}

const variantClasses: Record<StatusBadgeVariant, string> = {
  live: "badge-live",
  pending: "badge-pending",
  completed: "badge-completed",
  failed: "badge-failed",
  upcoming: "badge-yellow",
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
        variant === "upcoming" ? "bg-pastel-yellow text-onyx" : "",
        className
      )}
    >
      {variant === "live" && (
        <span className="w-2 h-2 rounded-full bg-onyx animate-pulse" />
      )}
      {children || variantLabels[variant]}
    </span>
  );
}
