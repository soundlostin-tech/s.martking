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
      
      {/* Dynamic Tactical Blobs - Optimized for White Background */}
      <motion.div 
        animate={{ 
          x: [0, 40, 0], 
          y: [0, 20, 0],
          scale: [1, 1.05, 1],
          opacity: [0.03, 0.08, 0.03]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[5%] left-[15%] w-[45%] h-[45%] bg-[#16DB65] rounded-full blur-[120px]" 
      />
      <motion.div 
        animate={{ 
          x: [0, -30, 0], 
          y: [0, 40, 0],
          scale: [1.05, 1, 1.05],
          opacity: [0.02, 0.06, 0.02]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[20%] right-[10%] w-[55%] h-[55%] bg-[#058C42] rounded-full blur-[140px]" 
      />

      {/* Subtle Grid Corner Accents - Lightened for White BG */}
      <div className="absolute top-0 left-0 w-32 h-32 border-t border-l border-slate-200 m-8" />
      <div className="absolute top-0 right-0 w-32 h-32 border-t border-r border-slate-200 m-8" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-b border-l border-slate-200 m-8" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-b border-r border-slate-200 m-8" />
      
      {/* Glitch Particles - Softened */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: Math.random() * 100 + "%", 
            y: Math.random() * 100 + "%",
            opacity: 0 
          }}
          animate={{ 
            opacity: [0, 0.15, 0],
            scale: [0, 1.2, 0],
          }}
          transition={{ 
            duration: 3 + Math.random() * 4, 
            repeat: Infinity, 
            delay: Math.random() * 8 
          }}
          className="glow-particle w-1 h-1 bg-slate-300"
        />
      ))}
    </div>
  );
}
