"use client";

import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface PillButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
}

export function PillButton({ className, variant = "primary", ...props }: PillButtonProps) {
  const variants = {
    primary: "bg-black text-white hover:bg-zinc-800 shadow-xl",
    secondary: "bg-zinc-200 text-black hover:bg-zinc-300",
    outline: "bg-transparent border border-black/10 text-black hover:bg-black/5",
    ghost: "bg-transparent text-black hover:bg-black/5",
  };

  return (
    <button
      className={cn(
        "px-8 py-4 rounded-full font-serif font-bold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
