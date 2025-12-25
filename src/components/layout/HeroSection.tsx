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
    <div className={`relative overflow-hidden rounded-b-[32px] hero-gradient px-6 pt-16 pb-12 shadow-lg ${className}`}>
      {/* Animated Neon Blobs */}
      <div className="neon-glow bg-lime-yellow w-64 h-64 -top-20 -right-20" />
      <div className="neon-glow bg-olive w-48 h-48 bottom-0 -left-20" />
      <div className="neon-glow bg-lemon-lime w-32 h-32 top-20 left-10" />

      <div className="relative z-10 flex flex-col gap-2">
        <h1 className="text-[36px] leading-tight text-white font-heading">
          {title}
        </h1>
        <p className="text-[20px] text-alabaster-grey/80">
          {subtitle}
        </p>
        
        {children && (
          <div className="mt-8">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
