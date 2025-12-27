"use client";

import { motion } from "framer-motion";
import { Search, Bell } from "lucide-react";

export function TopHeader() {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border px-4 sm:px-6 header-height flex items-center justify-between w-full">
      <div className="flex flex-col">
        <h1 className="text-xl sm:text-2xl font-heading text-primary font-bold tracking-tight leading-none">
          Smartking's
        </h1>
        <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] sm:tracking-[0.25em] mt-1">
          The Arena Awaits
        </p>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-3">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-muted flex items-center justify-center text-primary border border-border active:bg-muted/80 transition-colors touch-target"
        >
          <Search size={20} />
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.9 }}
          className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-muted flex items-center justify-center text-primary border border-border active:bg-muted/80 transition-colors touch-target"
        >
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-accent rounded-full border-2 border-background" />
        </motion.button>
      </div>
    </header>
  );
}
