"use client";

import { motion } from "framer-motion";
import { Search, Bell } from "lucide-react";
import Link from "next/link";

export function TopHeader() {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl px-4 sm:px-6 py-4 flex items-center justify-between w-full border-b border-[#C8C8C4]/20">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#D7FD03] flex items-center justify-center text-[#11130D] shadow-lg shadow-[#D7FD03]/20">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg sm:text-xl font-heading text-[#11130D] font-bold tracking-tight leading-none">
            Smartking's <span className="text-[#868935]">Arena</span>
          </h1>
          <p className="text-[8px] sm:text-[9px] font-bold text-[#4A4B48] uppercase tracking-[0.2em] mt-0.5">
            Where Skill Meets Fortune
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-3">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#E8E9EC] flex items-center justify-center text-[#4A4B48] active:bg-[#C8C8C4]/50 transition-colors touch-target"
        >
          <Search size={18} />
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.9 }}
          className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#E8E9EC] flex items-center justify-center text-[#4A4B48] active:bg-[#C8C8C4]/50 transition-colors touch-target"
        >
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#D7FD03] rounded-full border-2 border-white" />
        </motion.button>
      </div>
    </header>
  );
}
