"use client";

import { motion } from "framer-motion";
import { Search, Bell } from "lucide-react";

export function TopHeader() {
  return (
    <header 
      className="sticky top-0 z-40 px-6 flex items-center justify-between w-full bg-[#F8F6F0]/80 backdrop-blur-md border-b border-black/[0.03]"
      style={{ 
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1rem)',
        paddingBottom: '1rem'
      }}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-electric-blue flex items-center justify-center text-onyx shadow-sm">
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

        </motion.button>
      </div>
    </header>
  );
}
