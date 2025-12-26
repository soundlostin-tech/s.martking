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
    <div className={`relative overflow-hidden bg-white px-6 pt-16 pb-24 ${className}`}>
      {/* Dynamic Geometric Background Shapes (Reference style) */}
      <div className="absolute top-10 right-[10%] w-32 h-32 bg-jungle-teal shape-circle opacity-10 animate-pulse" />
      <div className="absolute bottom-20 left-[5%] w-24 h-24 bg-lemon-lime shape-triangle rotate-12 opacity-10" />
      <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-sea-green shape-diamond opacity-5" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12 max-w-6xl mx-auto">
        <div className="flex-1 text-left space-y-6">
          <motion.h1 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-6xl md:text-8xl font-heading text-black leading-[0.9] tracking-tighter"
          >
            {title.split(" ").map((word, i) => (
              <span key={i} className="block">
                {word === "Design" || word === "Creativity" || word === "Arena" ? (
                  <span className="text-lemon-lime">{word}</span>
                ) : word}
              </span>
            ))}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-jungle-teal/60 font-medium max-w-md leading-relaxed"
          >
            {subtitle}
          </motion.p>
          
          {children && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {children}
            </motion.div>
          )}

          {/* Stats Badges (Reference style) */}
          <div className="flex items-center gap-8 pt-8">
            {[
              { label: "Courses", val: "300+", color: "text-lemon-lime" },
              { label: "Mentors", val: "50+", color: "text-sea-green" },
              { label: "Content", val: "1000+", color: "text-yellow" },
            ].map((stat, i) => (
              <div key={i} className="space-y-1">
                <p className={`text-2xl font-heading ${stat.color}`}>{stat.val}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-black/40">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Hero Geometric Composition (Reference style) */}
        <div className="flex-1 relative w-full aspect-square max-w-[500px]">
          <div className="grid grid-cols-2 grid-rows-2 gap-4 h-full">
            <motion.div 
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="bg-jungle-teal rounded-[2rem_2rem_0_2rem]" 
            />
            <motion.div 
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }}
              className="bg-sea-green shape-diamond m-8" 
            />
            <motion.div 
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}
              className="border-4 border-lemon-lime rounded-[0_2rem_2rem_2rem]" 
            />
            <motion.div 
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }}
              className="bg-lemon-lime shape-circle m-4" 
            />
          </div>
          {/* Floating elements */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-yellow-green/20 blur-3xl rounded-full" />
        </div>
      </div>
    </div>
  );
}

