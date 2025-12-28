"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "hero" | "pastel";
  pastelColor?: "yellow" | "mint" | "coral" | "lavender" | "peach";
  onClick?: () => void;
}

export function BentoCard({ 
  children, 
  className, 
  variant = "default",
  pastelColor = "yellow",
  onClick 
}: BentoCardProps) {
  const pastelBg = {
    yellow: "from-[#F5F3C7]/40 to-white",
    mint: "from-[#C7F5E3]/40 to-white",
    coral: "from-[#F5D4C7]/40 to-white",
    lavender: "from-[#D4C7F5]/40 to-white",
    peach: "from-[#F5E3C7]/40 to-white",
  };

  const baseClasses = "rounded-[28px] p-5 transition-all duration-150";
  
  const variantClasses = {
    default: "bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-[#C8C8C4]/20",
    hero: `bg-gradient-to-br ${pastelBg[pastelColor]} shadow-[0_4px_32px_rgba(0,0,0,0.08)] border border-[#D7FD03]/20`,
    pastel: `bg-gradient-to-br ${pastelBg[pastelColor]} shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-[#C8C8C4]/20`,
  };

  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={cn(baseClasses, variantClasses[variant], className)}
    >
      {children}
    </motion.div>
  );
}
