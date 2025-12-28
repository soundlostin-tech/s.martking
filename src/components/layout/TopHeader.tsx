"use client";

import { motion } from "framer-motion";
import { Search, Bell } from "lucide-react";
import Link from "next/link";

export function TopHeader() {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl px-4 sm:px-6 py-4 flex items-center justify-between w-full border-b border-muted/50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-foreground flex items-center justify-center text-white shadow-lg shadow-foreground/20">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg sm:text-xl font-heading text-foreground font-bold tracking-tight leading-none">
            Smartking's <span className="text-muted-foreground italic">Arena</span>
          </h1>
          <p className="text-[8px] sm:text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-0.5">
            Where Skill Meets Fortune
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-3">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-muted flex items-center justify-center text-foreground hover:bg-muted/80 transition-colors touch-target"
        >
          <Search size={18} />
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.9 }}
          className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-muted flex items-center justify-center text-foreground hover:bg-muted/80 transition-colors touch-target"
        >
          <Bell size={18} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
        </motion.button>
      </div>
    </header>
  );
}
