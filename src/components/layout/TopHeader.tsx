"use client";

import { motion } from "framer-motion";
import { Search, Bell, Menu } from "lucide-react";

export function TopHeader() {
  return (
    <header className="sticky top-0 z-50 bg-seashell-50/80 backdrop-blur-xl border-b border-shadow-grey-200 px-6 py-4 flex items-center justify-between">
      <div className="flex flex-col">
        <h1 className="text-xl font-heading text-strawberry-red-500 font-bold tracking-tight leading-none">
          Smartking's
        </h1>
        <p className="text-[9px] font-bold text-shadow-grey-500 uppercase tracking-[0.2em] mt-1">
          The Arena Awaits
        </p>
      </div>
      
      <div className="flex items-center gap-3">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          className="w-10 h-10 rounded-full bg-seashell-100 flex items-center justify-center text-shadow-grey-500 border border-shadow-grey-200"
        >
          <Search size={20} />
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.9 }}
          className="relative w-10 h-10 rounded-full bg-seashell-100 flex items-center justify-center text-shadow-grey-500 border border-shadow-grey-200"
        >
          <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-tangerine-dream-400 rounded-full border-2 border-seashell-50" />
        </motion.button>
      </div>
    </header>
  );
}
