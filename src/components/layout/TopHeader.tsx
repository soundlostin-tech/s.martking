"use client";

import { motion } from "framer-motion";
import { Search, Bell } from "lucide-react";

export function TopHeader() {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between w-full">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-lime-yellow flex items-center justify-center text-onyx shadow-sm">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <div className="flex flex-col">
          <h1 className="text-xl font-heading text-onyx font-black tracking-tight leading-none">
            Smartking's <span className="text-charcoal-brown">Arena</span>
          </h1>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-charcoal shadow-sm border border-black/[0.03]"
        >
          <Bell size={18} strokeWidth={2.5} />
          <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-lime-yellow rounded-full border-2 border-white" />
        </motion.button>
        <div className="w-10 h-10 rounded-full bg-silver overflow-hidden border-2 border-white shadow-sm">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Profile" className="w-full h-full object-cover" />
        </div>
      </div>
    </header>
  );
}
