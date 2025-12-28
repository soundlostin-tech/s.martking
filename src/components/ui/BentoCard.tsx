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
    mint: "bg-[#E8F5E9] text-[#2D3436]",
    coral: "bg-[#FFEBEE] text-[#2D3436]",
    lavender: "bg-[#EDE7F6] text-[#2D3436]",
    peach: "bg-[#FFF3E0] text-[#2D3436]",
    yellow: "bg-[#FFF8E1] text-[#2D3436]",
  };

    const variantClasses = {
      default: "bg-white text-[#2D3436] border border-gray-100",
      dark: "bg-[#2D3436] text-white border-none shadow-lg",
      vibrant: "bg-[#FFF8E1] text-[#2D3436] border-none shadow-md",
      hero: cn("shadow-md border-none", pastelVariants[pastelColor]),
      pastel: cn("border-none", pastelVariants[pastelColor]),
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
