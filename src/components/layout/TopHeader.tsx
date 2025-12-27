"use client";

import { motion } from "framer-motion";
import { Search, Bell, Globe } from "lucide-react";

export function TopHeader() {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border px-4 sm:px-6 header-height flex items-center justify-between w-full">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-dark-emerald flex items-center justify-center text-white shadow-lg shadow-dark-emerald/20">
          <Globe size={22} strokeWidth={2.5} />
        </div>
        <div className="flex flex-col">
          <h1 className="text-xl sm:text-2xl font-heading text-foreground font-bold tracking-tight leading-none">
            Smartking's <span className="text-dark-emerald">Arena</span>
          </h1>
          <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] sm:tracking-[0.25em] mt-0.5">
            The Arena Awaits
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-3">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-jet-black flex items-center justify-center text-dark-emerald border border-emerald-depths active:bg-jet-black/80 transition-colors touch-target shadow-sm"
        >
          <Search size={20} />
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.9 }}
          className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-jet-black flex items-center justify-center text-dark-emerald border border-emerald-depths active:bg-jet-black/80 transition-colors touch-target shadow-sm"
        >
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-dark-emerald rounded-full border-2 border-jet-black" />
        </motion.button>
      </div>
    </header>
  );
}
