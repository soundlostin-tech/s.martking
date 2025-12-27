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
            x: [0, 80, 0], 
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
            opacity: [0.03, 0.08, 0.03]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[5%] left-[10%] w-[60%] h-[60%] bg-[#16DB65] rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            x: [0, -70, 0], 
            y: [0, 80, 0],
            scale: [1.2, 1, 1.2],
            opacity: [0.02, 0.06, 0.02]
          }}
          transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[10%] right-[5%] w-[70%] h-[70%] bg-[#058C42] rounded-full blur-[150px]" 
        />
        <motion.div 
          animate={{ 
            x: [-40, 40, -40], 
            y: [30, -30, 30],
            opacity: [0.01, 0.04, 0.01]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-[30%] right-[20%] w-[50%] h-[50%] bg-[#16DB65] rounded-full blur-[110px]" 
        />

        {/* Tactical Corner HUD Accents - More Subtle */}
        <div className="absolute top-0 left-0 w-32 h-32 border-t border-l border-slate-200/30 m-8 rounded-tl-2xl" />
        <div className="absolute top-0 right-0 w-32 h-32 border-t border-r border-slate-200/30 m-8 rounded-tr-2xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 border-b border-l border-slate-200/30 m-8 rounded-bl-2xl" />
        <div className="absolute bottom-0 right-0 w-32 h-32 border-b border-r border-slate-200/30 m-8 rounded-br-2xl" />
        
        {/* Floating Ambient Particles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * 100 + "%", 
              y: Math.random() * 100 + "%",
              opacity: 0,
              scale: Math.random() * 0.5 + 0.5
            }}
            animate={{ 
              opacity: [0, 0.15, 0],
              y: ["0%", "-5%", "0%"],
            }}
            transition={{ 
              duration: 10 + Math.random() * 10, 
              repeat: Infinity, 
              delay: Math.random() * 5 
            }}
            className="glow-particle w-1 h-1 bg-slate-300"
          />
        ))}
      </div>
    );
}
