"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Search, Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function TopHeader() {
  const { scrollYProgress, scrollY } = useScroll();
  
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const smoothY = useSpring(scrollY, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const headerHeight = useTransform(smoothY, [0, 80], ["80px", "68px"]);
  const headerPadding = useTransform(smoothY, [0, 80], ["20px", "12px"]);
  const logoScale = useTransform(smoothY, [0, 80], [1, 0.9]);
  const blurAmount = useTransform(smoothY, [0, 80], ["0px", "16px"]);
  const shadowOpacity = useTransform(smoothY, [0, 80], [0, 0.06]);
  
  const bgColor = useTransform(
    smoothY,
    [0, 80],
    ["rgba(248, 249, 250, 0)", "rgba(255, 255, 255, 0.95)"]
  );
  
  const borderColor = useTransform(
    smoothY,
    [0, 80],
    ["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.05)"]
  );

  const boxShadow = useTransform(
    shadowOpacity,
    (opacity) => `0 4px 20px -4px rgba(0, 0, 0, ${opacity})`
  );

  const backdropFilter = useTransform(
    blurAmount,
    (blur) => `blur(${blur}) saturate(180%)`
  );

  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.1,
        delayChildren: 0.2,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <>
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
        className="fixed top-0 left-0 right-0 z-[100] w-full flex items-center justify-between px-6 sm:px-10 border-b"
      >
        <motion.div 
          variants={itemVariants}
          className="flex items-center gap-4"
        >
          <motion.div 
            style={{ scale: logoScale }}
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="group relative w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2D3436] to-[#4A5568] flex items-center justify-center text-white shadow-lg cursor-pointer overflow-hidden"
          >
            <motion.div 
              className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent"
              animate={{ 
                x: ["-100%", "100%"],
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "linear",
                repeatDelay: 3
              }}
            />
            <motion.svg 
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6 z-10"
            >
              <circle cx="12" cy="12" r="10" opacity="0.3" />
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" strokeDasharray="2 2" />
              <path d="M12 2v20M2 12h20" strokeLinecap="round" />
            </motion.svg>
          </motion.div>
          
          <div className="flex flex-col">
            <motion.h1 
              className="text-xl font-black text-[#2D3436] tracking-tight leading-none flex items-center gap-1.5"
            >
              Smartking&apos;s 
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#636E72] to-[#95A5A6] font-black">
                Arena
              </span>
            </motion.h1>
            <motion.div className="flex items-center gap-1.5 mt-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A8E6CF] animate-pulse" />
              <p className="text-[8px] font-bold text-[#95A5A6] uppercase tracking-[0.25em] leading-none">
                Elite Competition
              </p>
            </motion.div>
          </div>
        </motion.div>
        
        <motion.div 
          variants={itemVariants}
          className="flex items-center gap-3"
        >
          <motion.div className="hidden md:flex items-center gap-1 mr-4">
            <div className="px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#FFB8B8] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#636E72]">2.4k Live</span>
            </div>
          </motion.div>

          <motion.button 
            whileHover={{ 
              scale: 1.05, 
              backgroundColor: "rgba(255, 255, 255, 1)",
              y: -2
            }}
            whileTap={{ scale: 0.95 }}
            className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-[#2D3436] shadow-sm transition-all duration-300"
          >
            <Search size={20} strokeWidth={2} />
          </motion.button>
          
          <motion.button 
            whileHover={{ 
              scale: 1.05, 
              backgroundColor: "rgba(255, 255, 255, 1)",
              y: -2
            }}
            whileTap={{ scale: 0.95 }}
            className="relative w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-[#2D3436] shadow-sm transition-all duration-300"
          >
            <Bell size={20} strokeWidth={2} />
            <span className="absolute top-3.5 right-3.5 w-2.5 h-2.5 bg-[#FFB8B8] rounded-full border-2 border-white shadow-sm" />
            <motion.span 
              animate={{ 
                scale: [1, 1.8, 1],
                opacity: [0.5, 0, 0.5]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeOut" 
              }}
              className="absolute top-3.5 right-3.5 w-2.5 h-2.5 bg-[#FFB8B8] rounded-full" 
            />
          </motion.button>

          </motion.div>

        {/* Scroll Progress Indicator */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#C3AED6] via-[#AED9E0] to-[#A8E6CF] origin-left"
          style={{ scaleX }}
        />
      </motion.header>
      
      <div className="h-[80px]" />
    </>
  );
}
