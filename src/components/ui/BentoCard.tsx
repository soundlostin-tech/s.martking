"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "hero" | "pastel" | "dark";
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
  const pastelVariants = {
    yellow: "bento-yellow",
    mint: "bento-mint",
    coral: "bento-coral",
    lavender: "bento-lavender",
    peach: "bento-peach",
  };

  const baseClasses = "bento-card";
  
  const variantClasses = {
    default: "",
    dark: "bento-dark",
    hero: `bento-hero ${pastelVariants[pastelColor]}`,
    pastel: pastelVariants[pastelColor],
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
