"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "hero" | "pastel" | "dark" | "vibrant" | "glass" | "mint" | "peach" | "purple" | "blue" | "pink" | "yellow";
  pastelColor?: "yellow" | "mint" | "coral" | "lavender" | "peach" | "sky" | "rose" | "indigo" | "sage" | "salmon" | "lilac" | "blue" | "pink" | "purple";
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
    mint: "bg-[#D9F9E6]",
    coral: "bg-[#FFE4E6]",
    lavender: "bg-[#F3E8FF]",
    peach: "bg-[#FFD8B1]",
    sky: "bg-[#E0F2FE]",
    rose: "bg-[#FFE4E6]",
    indigo: "bg-[#E0E7FF]",
    sage: "bg-[#D9F9E6]",
    salmon: "bg-[#FFE4E6]",
    lilac: "bg-[#F3E8FF]",
    blue: "bg-[#B3E5FC]",
    pink: "bg-[#FFC0CB]",
    purple: "bg-[#DCD3FF]",
  };

  const variantClasses = {
    default: "bg-white text-[#1A1A1A]",
    dark: "bg-[#1A1A1A] text-white",
    vibrant: "bg-[#A8E6CF] text-[#1A1A1A]",
    glass: "bg-white/40 backdrop-blur-xl border border-white/40 text-[#1A1A1A]",
    hero: `${pastelVariants[pastelColor]} text-[#1A1A1A]`,
    pastel: `${pastelVariants[pastelColor]} text-[#1A1A1A]`,
    mint: "bg-[#D9F9E6] text-[#1A1A1A]",
    peach: "bg-[#FFD8B1] text-[#1A1A1A]",
    purple: "bg-[#DCD3FF] text-[#1A1A1A]",
    blue: "bg-[#B3E5FC] text-[#1A1A1A]",
    pink: "bg-[#FFC0CB] text-[#1A1A1A]",
    yellow: "bg-[#FEF3C7] text-[#1A1A1A]",
  };

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "rounded-[24px] p-6 shadow-sm border-none box-border transition-all duration-200",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </motion.div>
  );
}
