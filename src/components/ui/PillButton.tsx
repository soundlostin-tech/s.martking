"use client";

import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface PillButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
}

export function PillButton({ className, variant = "primary", ...props }: PillButtonProps) {
  const variants = {
    primary: "bg-lime-yellow text-black hover:bg-lemon-lime shadow-md",
    secondary: "bg-onyx text-white hover:bg-carbon-black",
    outline: "bg-transparent border border-black text-black hover:bg-stone-200",
  };

  return (
    <button
      className={cn(
        "px-6 py-3 rounded-full font-serif font-medium transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
