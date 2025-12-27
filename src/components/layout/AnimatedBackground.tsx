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
      <div className="mesh-bg">
        <div className="scan-line" />
        
        {/* Dynamic Tactical Blobs - Optimized for Premium White Aesthetics */}
        <motion.div 
          animate={{ 
            x: [0, 60, 0], 
            y: [0, 40, 0],
            scale: [1, 1.1, 1],
            opacity: [0.05, 0.12, 0.05]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] left-[20%] w-[40%] h-[40%] bg-[#16DB65] rounded-full blur-[100px]" 
        />
        <motion.div 
          animate={{ 
            x: [0, -50, 0], 
            y: [0, 60, 0],
            scale: [1.1, 1, 1.1],
            opacity: [0.04, 0.1, 0.04]
          }}
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[15%] right-[15%] w-[50%] h-[50%] bg-[#058C42] rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            x: [-30, 30, -30], 
            y: [20, -20, 20],
            opacity: [0.03, 0.07, 0.03]
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[40%] right-[30%] w-[35%] h-[35%] bg-[#16DB65] rounded-full blur-[90px]" 
        />

        {/* Tactical Corner HUD Accents */}
        <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-slate-100/50 m-6 rounded-tl-xl" />
        <div className="absolute top-0 right-0 w-24 h-24 border-t-2 border-r-2 border-slate-100/50 m-6 rounded-tr-xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 border-b-2 border-l-2 border-slate-100/50 m-6 rounded-bl-xl" />
        <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-slate-100/50 m-6 rounded-br-xl" />
        
        {/* Glitch Particles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * 100 + "%", 
              y: Math.random() * 100 + "%",
              opacity: 0 
            }}
            animate={{ 
              opacity: [0, 0.2, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{ 
              duration: 4 + Math.random() * 6, 
              repeat: Infinity, 
              delay: Math.random() * 10 
            }}
            className="glow-particle w-1 h-1 bg-slate-200"
          />
        ))}
      </div>
    );
}
