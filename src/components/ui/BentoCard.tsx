"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
    variant?: "default" | "hero" | "pastel" | "dark" | "vibrant" | "glass";
    pastelColor?: "yellow" | "mint" | "coral" | "lavender" | "peach" | "sky" | "rose" | "indigo" | "sage" | "salmon" | "lilac";
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
      yellow: "bg-[#FEF08A]",
      mint: "bg-[#C6F6D5]",
      coral: "bg-[#FEE2E2]",
      lavender: "bg-[#E9D5FF]",
      peach: "bg-[#FED7AA]",
      sky: "bg-[#BAE6FD]",
      rose: "bg-[#FCE7F3]",
      indigo: "bg-[#E0E7FF]",
      sage: "bg-[#DCFCE7]",
      salmon: "bg-[#FECACA]",
      lilac: "bg-[#D8B4FE]",
    };
  
    const variantClasses = {
      default: "bg-white text-[#1A1A1A]",
      dark: "bg-[#1A1A1A] text-white",
      vibrant: "bg-[#5FD3BC] text-[#1A1A1A]",
      glass: "bg-white/40 backdrop-blur-xl border border-white/40 text-[#1A1A1A]",
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
