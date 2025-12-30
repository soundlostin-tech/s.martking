"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "hero" | "pastel" | "dark" | "vibrant" | "glass" | "mint" | "peach" | "purple" | "blue" | "pink" | "yellow" | "coral" | "orange" | "teal" | "lavender";
  pastelColor?: "yellow" | "mint" | "coral" | "lavender" | "peach" | "sky" | "rose" | "indigo" | "sage" | "salmon" | "lilac" | "blue" | "pink" | "purple" | "teal" | "orange";
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
    yellow: "bg-[#F5E6A3]",
    mint: "bg-[#A8E6CF]",
    coral: "bg-[#F5A78E]",
    lavender: "bg-[#E8D4F0]",
    peach: "bg-[#FFCDB2]",
    sky: "bg-[#D4EDFC]",
    rose: "bg-[#FFE0E6]",
    indigo: "bg-[#C9B6E4]",
    sage: "bg-[#D4F5E4]",
    salmon: "bg-[#F5A78E]",
    lilac: "bg-[#E8D4F0]",
    blue: "bg-[#A8D8EA]",
    pink: "bg-[#FFB6C1]",
    purple: "bg-[#C9B6E4]",
    teal: "bg-[#7FDBCA]",
    orange: "bg-[#FFB347]",
  };

  const variantClasses = {
    default: "bg-white text-[#1A1A1A]",
    dark: "bg-[#1A1A1A] text-white",
    vibrant: "bg-[#6EBF8B] text-[#1A1A1A]",
    glass: "bg-white/40 backdrop-blur-xl border border-white/40 text-[#1A1A1A]",
    hero: `${pastelVariants[pastelColor]} text-[#1A1A1A]`,
    pastel: `${pastelVariants[pastelColor]} text-[#1A1A1A]`,
    mint: "bg-[#A8E6CF] text-[#1A1A1A]",
    peach: "bg-[#FFCDB2] text-[#1A1A1A]",
    purple: "bg-[#C9B6E4] text-[#1A1A1A]",
    blue: "bg-[#A8D8EA] text-[#1A1A1A]",
    pink: "bg-[#FFB6C1] text-[#1A1A1A]",
    yellow: "bg-[#F5E6A3] text-[#1A1A1A]",
    coral: "bg-[#F5A78E] text-[#1A1A1A]",
    orange: "bg-[#FFB347] text-[#1A1A1A]",
    teal: "bg-[#7FDBCA] text-[#1A1A1A]",
    lavender: "bg-[#E8D4F0] text-[#1A1A1A]",
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
