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
    <div className={`relative overflow-hidden bg-zinc-100 px-6 pt-20 pb-16 ${className}`}>
      {/* Subtle background detail */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-200/50 blur-[100px] rounded-full -mr-32 -mt-32" />
      
      <div className="relative z-10 flex flex-col gap-3 max-w-4xl mx-auto text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-heading text-black tracking-tight"
        >
          {title}
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg md:text-xl font-serif text-zinc-600 max-w-2xl mx-auto"
        >
          {subtitle}
        </motion.p>
        
        {children && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            {children}
          </motion.div>
        )}
      </div>
    </div>
  );
}
