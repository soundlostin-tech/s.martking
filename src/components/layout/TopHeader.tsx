"use client";

import { motion } from "framer-motion";
import { Search, Bell, Menu } from "lucide-react";

export function TopHeader() {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border px-6 py-4 flex items-center justify-between">
      <div className="flex flex-col">
        <h1 className="text-xl font-heading text-primary font-bold tracking-tight leading-none">
          Smartking's
        </h1>
        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">
          The Arena Awaits
        </p>
      </div>
      
      <div className="flex items-center gap-3">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center text-primary border border-border hover:bg-muted/80 transition-colors"
        >
          <Search size={18} />
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.9 }}
          className="relative w-10 h-10 rounded-2xl bg-muted flex items-center justify-center text-primary border border-border hover:bg-muted/80 transition-colors"
        >
          <Bell size={18} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-accent rounded-full border-2 border-background shadow-sm" />
        </motion.button>
      </div>
    </header>
  );
}
