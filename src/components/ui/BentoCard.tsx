"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "hero" | "pastel" | "dark" | "vibrant";
  pastelColor?: "yellow" | "mint" | "coral" | "lavender" | "peach" | "sky";
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
    sky: "bento-sky",
  };

  const baseClasses = "bento-card";
  
      const variantClasses = {
        default: "",
        dark: "bento-dark",
        vibrant: "bg-pastel-lavender text-onyx border-none shadow-[0_8px_32px_rgba(212,181,255,0.2)]",
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
