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
      
      {/* Dynamic Tactical Blobs */}
      <motion.div 
        animate={{ 
          x: [0, 50, 0], 
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[10%] left-[10%] w-[40%] h-[40%] bg-[#16DB65] rounded-full blur-[100px]" 
      />
      <motion.div 
        animate={{ 
          x: [0, -40, 0], 
          y: [0, 60, 0],
          scale: [1.1, 1, 1.1],
          opacity: [0.05, 0.15, 0.05]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[15%] right-[5%] w-[50%] h-[50%] bg-[#058C42] rounded-full blur-[120px]" 
      />

      {/* Subtle Grid Corner Accents */}
      <div className="absolute top-0 left-0 w-32 h-32 border-t border-l border-[#16DB65]/10 m-8" />
      <div className="absolute top-0 right-0 w-32 h-32 border-t border-r border-[#16DB65]/10 m-8" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-b border-l border-[#16DB65]/10 m-8" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-b border-r border-[#16DB65]/10 m-8" />
      
      {/* Glitch Particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: Math.random() * 100 + "%", 
            y: Math.random() * 100 + "%",
            opacity: 0 
          }}
          animate={{ 
            opacity: [0, 0.2, 0],
            scale: [0, 1, 0],
          }}
          transition={{ 
            duration: 2 + Math.random() * 3, 
            repeat: Infinity, 
            delay: Math.random() * 5 
          }}
          className="glow-particle w-1 h-1"
        />
      ))}
    </div>
  );
}
