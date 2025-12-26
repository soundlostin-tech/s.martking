"use client";

import { motion } from "framer-motion";

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 bg-[#f0f0f0] overflow-hidden">
      <motion.div 
        animate={{ 
          rotate: [0, 360],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] border border-ink-blue/5 rounded-[40%] pointer-events-none"
      />
      <motion.div 
        animate={{ 
          rotate: [360, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-[20%] -left-[10%] w-[70%] h-[70%] border border-ink-blue/5 rounded-[30%] pointer-events-none"
      />
    </div>
  );
}
