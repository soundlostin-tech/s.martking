"use client";

import { motion } from "framer-motion";
import { Search, Bell } from "lucide-react";

export function TopHeader() {
  return (
    <header className="sticky top-0 z-40 bg-[#F4F9F9]/80 backdrop-blur-xl px-5 sm:px-8 py-4 flex items-center justify-between w-full border-b border-black/[0.04]">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-full bg-[#11130D] flex items-center justify-center text-white shadow-md">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-[#11130D] tracking-tight leading-none">
              Smartking&apos;s <span className="text-[#A0A0A0] font-bold">Arena</span>
            </h1>
            <p className="text-[7px] font-bold text-[#A0A0A0] uppercase tracking-[0.3em] mt-1.5 leading-none">
              Where Skill Meets Fortune
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            className="w-11 h-11 rounded-full bg-white border border-black/[0.03] shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center justify-center text-[#11130D] active:bg-silver/50 transition-colors"
          >
            <Search size={18} strokeWidth={2.5} />
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            className="relative w-11 h-11 rounded-full bg-white border border-black/[0.03] shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center justify-center text-[#11130D] active:bg-silver/50 transition-colors"
          >
            <Bell size={18} strokeWidth={2.5} />
            <span className="absolute top-[11px] right-[11px] w-2.5 h-2.5 bg-[#FFBFA3] rounded-full border-2 border-white" />
          </motion.button>
        </div>
    </header>
  );
}
