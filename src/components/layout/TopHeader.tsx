"use client";

import { motion } from "framer-motion";
import { Bell } from "lucide-react";

export function TopHeader() {
  return (
    <header 
      className="sticky top-0 z-50 px-4 flex items-center justify-between w-full bg-[#F8F6F0]/80 backdrop-blur-xl border-b border-black/[0.03]"
      style={{ 
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.5rem)',
        paddingBottom: '0.5rem'
      }}
    >
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-[#1A1A1A] flex items-center justify-center text-white shadow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <div className="flex flex-col">
          <h1 className="text-sm font-heading text-[#1A1A1A] font-black tracking-tight leading-none uppercase">
            Smartking's <span className="text-[#6B7280]">Arena</span>
          </h1>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-[#1A1A1A] shadow border border-black/[0.05]"
        >
          <Bell size={16} strokeWidth={3} />
        </motion.button>
      </div>
    </header>

  );
}
