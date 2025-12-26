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
      {children && (
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          {children}
        </div>
      )}
    </div>
    );
}

