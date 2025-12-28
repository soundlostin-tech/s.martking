"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Search, Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function TopHeader() {
  const { scrollY } = useScroll();
  
  // Create a smoother spring-based scroll value for premium feel
  const smoothY = useSpring(scrollY, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Transform values for scroll animations
  const headerHeight = useTransform(smoothY, [0, 80], ["76px", "62px"]);
  const headerPadding = useTransform(smoothY, [0, 80], ["16px", "10px"]);
  const logoScale = useTransform(smoothY, [0, 80], [1, 0.85]);
  const blurAmount = useTransform(smoothY, [0, 80], ["20px", "28px"]);
  const shadowOpacity = useTransform(smoothY, [0, 80], [0, 0.05]);
  
  // Background and Border dynamic colors
  const bgColor = useTransform(
    smoothY,
    [0, 80],
    ["rgba(244, 249, 249, 0.8)", "rgba(255, 255, 255, 0.92)"]
  );
  
  const borderColor = useTransform(
    smoothY,
    [0, 80],
    ["rgba(0, 0, 0, 0.04)", "rgba(0, 0, 0, 0.08)"]
  );

  const boxShadow = useTransform(
    shadowOpacity,
    (opacity) => `0 4px 24px rgba(0, 0, 0, ${opacity})`
  );

  const backdropFilter = useTransform(
    blurAmount,
    (blur) => `blur(${blur})`
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <motion.header 
      style={{ 
        height: headerHeight,
        paddingTop: headerPadding,
        paddingBottom: headerPadding,
        backgroundColor: bgColor,
        borderBottomColor: borderColor,
        boxShadow: boxShadow,
        backdropFilter: backdropFilter,
      }}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="sticky top-0 z-50 w-full flex items-center justify-between px-5 sm:px-8 border-b"
    >
        <motion.div 
          variants={itemVariants}
          className="flex items-center gap-3.5"
        >
          <motion.div 
            style={{ scale: logoScale }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-11 h-11 rounded-full bg-[#11130D] flex items-center justify-center text-white shadow-lg shadow-black/10 cursor-pointer"
          >
            <motion.svg 
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </motion.svg>
          </motion.div>
          
          <div className="flex flex-col">
            <motion.h1 
              className="text-xl font-black text-[#11130D] tracking-tight leading-none flex items-center gap-1"
            >
              Smartking&apos;s <span className="text-[#A0A0A0] font-bold">Arena</span>
            </motion.h1>
            <motion.p 
              className="text-[7px] font-bold text-[#A0A0A0] uppercase tracking-[0.3em] mt-1.5 leading-none"
            >
              Where Skill Meets Fortune
            </motion.p>
          </div>
        </motion.div>
        
        <motion.div 
          variants={itemVariants}
          className="flex items-center gap-3"
        >
          <motion.button 
            whileHover={{ 
              scale: 1.05, 
              backgroundColor: "rgba(255, 255, 255, 1)",
              boxShadow: "0 10px 20px rgba(0,0,0,0.06)"
            }}
            whileTap={{ scale: 0.95 }}
            className="w-11 h-11 rounded-full bg-white/60 border border-black/[0.03] flex items-center justify-center text-[#11130D] transition-shadow"
          >
            <Search size={18} strokeWidth={2.5} />
          </motion.button>
          
          <motion.button 
            whileHover={{ 
              scale: 1.05, 
              backgroundColor: "rgba(255, 255, 255, 1)",
              boxShadow: "0 10px 20px rgba(0,0,0,0.06)"
            }}
            whileTap={{ scale: 0.95 }}
            className="relative w-11 h-11 rounded-full bg-white/60 border border-black/[0.03] flex items-center justify-center text-[#11130D] transition-shadow"
          >
            <Bell size={18} strokeWidth={2.5} />
            <motion.span 
              animate={{ 
                scale: [1, 1.4, 1],
                opacity: [1, 0.6, 1]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="absolute top-[11px] right-[11px] w-2.5 h-2.5 bg-[#FFBFA3] rounded-full border-2 border-white" 
            />
          </motion.button>
        </motion.div>
    </motion.header>
  );
}
