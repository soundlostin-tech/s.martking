"use client";

import { motion } from "framer-motion";
import { Search, Bell } from "lucide-react";

export function TopHeader() {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border px-4 sm:px-6 header-height flex items-center justify-between">
      <div className="flex flex-col pt-safe">
        <h1 className="text-lg sm:text-xl font-heading text-primary font-bold tracking-tight leading-none">
          Smartking's
        </h1>
        <p className="text-[8px] sm:text-[9px] font-bold text-muted-foreground uppercase tracking-[0.15em] sm:tracking-[0.2em] mt-0.5">
          The Arena Awaits
        </p>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-3">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          className="w-10 h-10 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-muted flex items-center justify-center text-primary border border-border active:bg-muted/80 transition-colors touch-target"
        >
          <Search size={18} />
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.9 }}
          className="relative w-10 h-10 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-muted flex items-center justify-center text-primary border border-border active:bg-muted/80 transition-colors touch-target"
        >
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full border-2 border-background" />
        </motion.button>
      </div>
    </header>
  );
}
