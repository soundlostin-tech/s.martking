"use client";

import { motion } from "framer-motion";
import { LogoAnimation } from "@/components/ui/LogoAnimation";
import { Search } from "lucide-react";

export function TopHeader() {
  const containerVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <motion.header 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="sticky top-0 z-50 px-5 flex items-center justify-between w-full bg-[#F8F6F0]/80 backdrop-blur-xl border-b border-black/[0.03] overflow-hidden"
      style={{ 
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)',
        paddingBottom: '0.75rem'
      }}
    >
      {/* Subtle Grain Texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />

      <div className="flex items-center gap-4 relative z-10">
        <motion.div variants={itemVariants}>
          <LogoAnimation size={40} />
        </motion.div>
        
        <div className="flex flex-col">
          <motion.h1 
            variants={itemVariants}
            className="text-sm font-heading text-[#1A1A1A] font-black tracking-[0.08em] leading-none uppercase flex items-center gap-1.5"
          >
            Smartking's
            <span className="text-[#6B7280] font-bold">Arena</span>
          </motion.h1>
          <motion.div 
            variants={itemVariants}
            className="flex items-center gap-2 mt-1.5"
          >
            <div className="relative">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping opacity-75" />
            </div>
            <span className="text-[8px] font-black text-[#1A1A1A]/40 uppercase tracking-[0.15em]">Server Live</span>
          </motion.div>
        </div>
      </div>

      <motion.div variants={itemVariants} className="relative z-10">
        <motion.button
          whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.8)" }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 rounded-2xl bg-white/40 backdrop-blur-md border border-black/[0.05] shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)] flex items-center justify-center text-[#1A1A1A]/60 transition-colors"
        >
          <Search size={18} strokeWidth={2.5} />
        </motion.button>
      </motion.div>
    </motion.header>
  );
}
