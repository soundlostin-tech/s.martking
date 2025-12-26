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
    <div className={`relative overflow-hidden bg-background px-6 pt-24 pb-20 ${className}`}>
      {/* Subtle background detail */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-mustard/20 blur-[120px] rounded-full -mr-40 -mt-40" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-dark-goldenrod/10 blur-[100px] rounded-full -ml-32 -mb-32" />
      
      <div className="relative z-10 flex flex-col gap-4 max-w-4xl mx-auto text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-heading text-foreground tracking-tighter uppercase"
        >
          {title}
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg md:text-xl font-serif text-muted-foreground italic max-w-2xl mx-auto"
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
