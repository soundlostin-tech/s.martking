"use client";

import { motion } from "framer-motion";
import { LogoAnimation } from "@/components/ui/LogoAnimation";
import { Search } from "lucide-react";

export function TopHeader() {
  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 px-5 flex items-center justify-between w-full bg-[#F8F6F0]/80 backdrop-blur-xl border-b border-black/[0.03]"
      style={{ 
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)',
        paddingBottom: '0.75rem'
      }}
    >
      <div className="flex items-center gap-3">
        <LogoAnimation size={36} />
        
        <div className="flex flex-col">
          <motion.h1 
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm font-heading text-[#1A1A1A] font-black tracking-[0.05em] leading-none uppercase flex items-center gap-1.5"
          >
            Smartking's
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-[#6B7280] font-bold"
            >
              Arena
            </motion.span>
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 0.6 }}
            className="flex items-center gap-1.5 mt-1"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[7px] font-black text-[#1A1A1A] uppercase tracking-widest">Server Live</span>
          </motion.div>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-9 h-9 rounded-xl bg-white/50 backdrop-blur-sm border border-black/[0.03] shadow-sm flex items-center justify-center text-[#1A1A1A]/40"
      >
        <Search size={16} strokeWidth={2.5} />
      </motion.button>
    </motion.header>
  );
}
