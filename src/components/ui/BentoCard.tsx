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
      yellow: "from-[#FEF38B]/50 to-[#FEF38B]/10",
      mint: "from-[#CCF5E6]/50 to-[#CCF5E6]/10",
      coral: "from-[#FFD6D1]/50 to-[#FFD6D1]/10",
      lavender: "from-[#D0D1FF]/50 to-[#D0D1FF]/10",
      peach: "from-[#FFE3D1]/50 to-[#FFE3D1]/10",
    };

    const baseClasses = "rounded-[32px] p-5 transition-all duration-200";
    
    const variantClasses = {
      default: "bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/40 backdrop-blur-sm",
      hero: `bg-gradient-to-br ${pastelBg[pastelColor]} shadow-[0_12px_40px_rgba(0,0,0,0.05)] border border-white/60 backdrop-blur-md`,
      pastel: `bg-gradient-to-br ${pastelBg[pastelColor]} shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white/50 backdrop-blur-sm`,
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
