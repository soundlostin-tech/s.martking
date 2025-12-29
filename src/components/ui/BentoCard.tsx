"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "hero" | "pastel" | "dark" | "vibrant";
  pastelColor?: "yellow" | "mint" | "coral" | "lavender" | "peach" | "sky" | "rose" | "indigo" | "sage";
  onClick?: () => void;
}

export function BentoCard({ 
  children, 
  className, 
  variant = "default",
  pastelColor = "yellow",
  onClick 
}: BentoCardProps) {
  const pastelVariants = {
    yellow: "bg-[#FEF3C7]",
    mint: "bg-[#D1FAE5]",
    coral: "bg-[#FEE2E2]",
    lavender: "bg-[#EDE9FE]",
    peach: "bg-[#FFEDD5]",
    sky: "bg-[#E0F2FE]",
    rose: "bg-[#FCE7F3]",
    indigo: "bg-[#E0E7FF]",
    sage: "bg-[#DCFCE7]",
  };

  const variantClasses = {
    default: "bg-white text-[#1A1A1A]",
    dark: "bg-[#1A1A1A] text-white",
    vibrant: "bg-[#5FD3BC] text-[#1A1A1A]",
    hero: `${pastelVariants[pastelColor]} text-[#1A1A1A]`,
    pastel: `${pastelVariants[pastelColor]} text-[#1A1A1A]`,
  };

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "rounded-lg p-4 shadow-[2px_8px_16px_rgba(0,0,0,0.06)] border-none box-border transition-shadow duration-150 hover:shadow-[4px_12px_24px_rgba(0,0,0,0.12)]",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </motion.div>
  );
}
