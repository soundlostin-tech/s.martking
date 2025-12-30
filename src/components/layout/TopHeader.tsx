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
      hidden: { opacity: 0, scale: 0.95 },
      visible: { 
        opacity: 1,
        scale: 1,
        transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
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

      <div className="flex items-center gap-3 relative z-10">
        <motion.div variants={itemVariants} className="flex-shrink-0">
          <LogoAnimation size={42} />
        </motion.div>
        
            <div className="flex flex-col justify-center">
              <motion.h1 
                variants={itemVariants}
                className="text-xl font-heading font-black leading-[0.9] uppercase flex gap-x-[1.5px]"
              >
                {["S", "m", "a", "r", "t", "k", "i", "n", "g", "'", "s"].map((char, i) => (
                  <span key={i} className="text-[#D4AF37]">{char}</span>
                ))}
              </motion.h1>
              <motion.span 
                variants={itemVariants}
                className="text-[8px] font-black text-[#6B7280] uppercase tracking-[0.05em] mt-0.5"
              >
                SAID HAMARE ZAMANE MEIN......
              </motion.span>
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
