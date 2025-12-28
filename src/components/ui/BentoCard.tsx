"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "hero" | "pastel" | "dark" | "vibrant";
  pastelColor?: "mint" | "coral" | "lavender" | "peach" | "yellow";
  onClick?: () => void;
}

export function BentoCard({ 
  children, 
  className, 
  variant = "default",
  pastelColor = "mint",
  onClick 
}: BentoCardProps) {
    const pastelVariants = {
      mint: "bg-[#C6F6D5] text-[#22543D] border-[#9AE6B4]",
      coral: "bg-[#FED7D7] text-[#822727] border-[#FEB2B2]",
      lavender: "bg-[#E9D8FD] text-[#44337A] border-[#D6BCFA]",
      peach: "bg-[#FEEBC8] text-[#7B341E] border-[#FBD38D]",
      yellow: "bg-[#FEFCBF] text-[#744210] border-[#FAF089]",
    };

    const variantClasses = {
      default: "bg-white text-[#1A202C] border-slate-200",
      dark: "bg-[#1A202C] text-white border-none shadow-xl",
      vibrant: "bg-[#ECC94B] text-[#1A202C] border-none shadow-lg",
      hero: cn("shadow-lg border-2", pastelVariants[pastelColor]),
      pastel: cn("border shadow-sm", pastelVariants[pastelColor]),
    };


  return (
    <motion.div
      whileTap={onClick ? { scale: 0.97 } : undefined}
      onClick={onClick}
      suppressHydrationWarning
      className={cn(
        "bento-card",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </motion.div>
  );
}
