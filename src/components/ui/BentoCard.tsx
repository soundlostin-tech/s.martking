"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "hero" | "pastel" | "dark" | "vibrant" | "glass" | "mint" | "peach" | "purple" | "blue" | "pink" | "yellow" | "coral" | "orange" | "teal" | "lavender" | "cream";
    pastelColor?: "yellow" | "mint" | "coral" | "lavender" | "peach" | "sky" | "rose" | "indigo" | "sage" | "salmon" | "lilac" | "blue" | "pink" | "purple" | "teal" | "orange" | "cream";
    size?: "compact" | "default" | "spacious";
    onClick?: () => void;
  }
  
  export function BentoCard({ 
    children, 
    className, 
    variant = "default",
    pastelColor = "yellow",
    size = "default",
    onClick 
  }: BentoCardProps) {
    const pastelVariants = {
      yellow: "bg-[#F9E79F]",
      mint: "bg-[#4F9B8B] text-white",
      coral: "bg-[#F1948A] text-white",
      lavender: "bg-[#A4A4FF] text-white",
      peach: "bg-[#FDAB6D]",
      sky: "bg-[#EBF5FB]",
      rose: "bg-[#FDEDEC]",
      indigo: "bg-[#A4A4FF] text-white",
      sage: "bg-[#E8F6F3]",
      salmon: "bg-[#F1948A] text-white",
      lilac: "bg-[#F4ECF7]",
      blue: "bg-[#A8D8EA]",
      pink: "bg-[#F988A2] text-white",
      purple: "bg-[#A4A4FF] text-white",
      teal: "bg-[#4F9B8B] text-white",
      orange: "bg-[#FDAB6D]",
      cream: "bg-[#FFF9ED]",
    };
  
    const variantClasses = {
      default: "bg-white text-[#1A1A1A]",
      dark: "bg-[#1A1A1A] text-white",
      vibrant: "bg-[#4F9B8B] text-white",
      glass: "bg-white/40 backdrop-blur-xl border border-white/40 text-[#1A1A1A]",
      hero: `${pastelVariants[pastelColor]} text-[#1A1A1A]`,
      pastel: `${pastelVariants[pastelColor]} text-[#1A1A1A]`,
      mint: "bg-[#4F9B8B] text-white",
      peach: "bg-[#FDAB6D] text-[#1A1A1A]",
      purple: "bg-[#A4A4FF] text-white",
      blue: "bg-[#A8D8EA] text-[#1A1A1A]",
      pink: "bg-[#F988A2] text-white",
      yellow: "bg-[#F9E79F] text-[#1A1A1A]",
      coral: "bg-[#F1948A] text-white",
      orange: "bg-[#FDAB6D] text-[#1A1A1A]",
      teal: "bg-[#4F9B8B] text-white",
      lavender: "bg-[#A4A4FF] text-white",
      cream: "bg-[#FFF9ED] text-[#1A1A1A]",
    };

  const sizeClasses = {
    compact: "p-3 rounded-[16px] sm:p-4 sm:rounded-[20px]",
    default: "p-4 rounded-[20px] sm:p-5 sm:rounded-[24px]",
    spacious: "p-5 rounded-[24px] sm:p-6 sm:rounded-[28px]",
  };

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "shadow-sm border-none box-border transition-all duration-200",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </motion.div>
  );
}
