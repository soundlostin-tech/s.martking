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
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 bg-off-white">
      {/* Top Right - Yellow/Mint Glow */}
      <motion.div 
        animate={{ 
          x: [0, 40, 0], 
          y: [0, -20, 0],
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-[10%] -right-[10%] w-[80%] h-[80%] rounded-full blur-[100px]"
        style={{ background: 'radial-gradient(circle, #FEFCBF 0%, #C6F6D5 100%)' }}
      />
      
      {/* Bottom Right - Purple/Lavender Glow */}
      <motion.div 
        animate={{ 
          x: [0, -30, 0], 
          y: [0, 40, 0],
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-[15%] -right-[10%] w-[70%] h-[70%] rounded-full blur-[120px]"
        style={{ background: 'radial-gradient(circle, #E9D8FD 0%, #BEE3F8 100%)' }}
      />

      {/* Top Left - Subtle Mint Glow */}
      <motion.div 
        animate={{ 
          x: [-20, 20, -20], 
          y: [10, -10, 10],
          scale: [0.9, 1.1, 0.9],
          opacity: [0.2, 0.35, 0.2],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-[5%] -left-[10%] w-[60%] h-[60%] rounded-full blur-[90px]"
        style={{ background: 'radial-gradient(circle, #C6F6D5 0%, #FEFCBF 100%)' }}
      />

      {/* Center/Middle - Very faint Sky Blue */}
      <motion.div 
        animate={{ 
          x: [30, -30, 30], 
          y: [-20, 20, -20],
          opacity: [0.1, 0.25, 0.1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[30%] left-[20%] w-[60%] h-[60%] rounded-full blur-[140px]"
        style={{ background: 'radial-gradient(circle, #BEE3F8 0%, transparent 80%)' }}
      />

      {/* Noise/Texture Overlay (Optional but adds premium feel) */}
      <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none" 
           style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/p6.png")' }} />
    </div>
  );
}
