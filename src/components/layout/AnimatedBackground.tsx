"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function AnimatedBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#F8FAFC]">
        {/* Neutral subtle blob - top right */}
        <motion.div 
          animate={{ 
            x: [0, 30, 0], 
            y: [0, 20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -right-[20%] w-[60%] h-[60%] rounded-full blur-[100px] opacity-20"
          style={{ background: 'linear-gradient(135deg, #E2E8F0 0%, #CBD5E0 100%)' }}
        />
        
        {/* Neutral subtle blob - bottom left */}
        <motion.div 
          animate={{ 
            x: [0, -30, 0], 
            y: [0, 30, 0],
            scale: [1.1, 1, 1.1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-[20%] -left-[20%] w-[60%] h-[60%] rounded-full blur-[120px] opacity-15"
          style={{ background: 'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)' }}
        />


      {/* Accent blob - center */}
      <motion.div 
        animate={{ 
          x: [-20, 20, -20], 
          y: [10, -10, 10],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[30%] left-[40%] w-[40%] h-[40%] rounded-full blur-[80px] opacity-20"
        style={{ background: 'linear-gradient(135deg, #D4C7F5 0%, #F5D4C7 100%)' }}
      />
    </div>
  );
}
