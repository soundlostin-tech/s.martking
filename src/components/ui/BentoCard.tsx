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
    mint: "bento-pastel-mint",
    coral: "bento-pastel-coral",
    lavender: "bento-pastel-lavender",
    peach: "bento-pastel-peach",
    yellow: "bento-pastel-yellow",
  };

  const variantClasses = {
    default: "bg-white text-charcoal-brown",
    dark: "bento-dark",
    vibrant: "bento-vibrant shadow-[0_8px_32px_rgba(215,253,3,0.2)]",
    hero: cn("shadow-[0_12px_48px_rgba(0,0,0,0.06)]", pastelVariants[pastelColor]),
    pastel: pastelVariants[pastelColor],
  };

  return (
    <motion.div
      whileTap={onClick ? { scale: 0.97 } : undefined}
      onClick={onClick}
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
