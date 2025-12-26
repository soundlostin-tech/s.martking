"use client";

import { motion } from "framer-motion";

interface HeroSectionProps {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
  className?: string;
}

export function HeroSection({ title, subtitle, children, className }: HeroSectionProps) {
  return (
    <div className={`relative overflow-hidden bg-white ${className}`}>
      {/* Dynamic Geometric Background Shapes (Reference style) */}
      <div className="absolute top-10 right-[10%] w-32 h-32 bg-jungle-teal shape-circle opacity-10 animate-pulse" />
      <div className="absolute bottom-20 left-[5%] w-24 h-24 bg-lemon-lime shape-triangle rotate-12 opacity-10" />
      <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-sea-green shape-diamond opacity-5" />

      {children && (
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          {children}
        </div>
      )}
    </div>
    );
}

