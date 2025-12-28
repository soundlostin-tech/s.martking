"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Search, Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function TopHeader() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  // Transform values for scroll animations
  const headerHeight = useTransform(scrollY, [0, 50], ["76px", "64px"]);
  const headerPadding = useTransform(scrollY, [0, 50], ["16px", "12px"]);
  const borderOpacity = useTransform(scrollY, [0, 50], [0.04, 0.1]);
  const logoScale = useTransform(scrollY, [0, 50], [1, 0.9]);

  useEffect(() => {
    const updateScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", updateScroll);
    return () => window.removeEventListener("scroll", updateScroll);
  }, []);

  return (
    <motion.header 
      style={{ 
        height: headerHeight,
        paddingTop: headerPadding,
        paddingBottom: headerPadding,
        borderBottomColor: `rgba(0, 0, 0, ${borderOpacity.get()})`
      }}
      className={cn(
        "sticky top-0 z-40 w-full flex items-center justify-between px-5 sm:px-8 transition-colors duration-300 border-b",
        isScrolled 
          ? "bg-white/90 backdrop-blur-2xl shadow-sm" 
          : "bg-[#F4F9F9]/80 backdrop-blur-xl"
      )}
    >
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex items-center gap-3.5"
        >
          <motion.div 
            style={{ scale: logoScale }}
            className="w-11 h-11 rounded-full bg-[#11130D] flex items-center justify-center text-white shadow-lg shadow-black/10"
          >
            <motion.svg 
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </motion.svg>
          </motion.div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-[#11130D] tracking-tight leading-none flex items-center gap-1">
              Smartking&apos;s <span className="text-[#A0A0A0] font-bold">Arena</span>
            </h1>
            <p className="text-[7px] font-bold text-[#A0A0A0] uppercase tracking-[0.3em] mt-1.5 leading-none">
              Where Skill Meets Fortune
            </p>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex items-center gap-3"
        >
          <motion.button 
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 1)" }}
            whileTap={{ scale: 0.95 }}
            className="w-11 h-11 rounded-full bg-white/80 border border-black/[0.05] shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center justify-center text-[#11130D] transition-all"
          >
            <Search size={18} strokeWidth={2.5} />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 1)" }}
            whileTap={{ scale: 0.95 }}
            className="relative w-11 h-11 rounded-full bg-white/80 border border-black/[0.05] shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center justify-center text-[#11130D] transition-all"
          >
            <Bell size={18} strokeWidth={2.5} />
            <motion.span 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [1, 0.8, 1]
              }}
              transition={{ 
                duration: 2, 
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
