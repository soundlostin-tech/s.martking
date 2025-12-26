"use client";

import { motion } from "framer-motion";

export function GeometricBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
      {/* Top Right Circle */}
      <motion.div 
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 0.1, x: 0 }}
        className="absolute -top-20 -right-20 w-80 h-80 bg-jungle-teal rounded-full"
      />
      
      {/* Mid Left Square */}
      <motion.div 
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 0.05, x: 0 }}
        className="absolute top-1/3 -left-10 w-40 h-40 bg-sea-green rotate-12"
      />

      {/* Bottom Right Triangle */}
      <motion.div 
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 0.1, y: 0 }}
        className="absolute -bottom-20 right-10 w-60 h-60 bg-lemon-lime shape-triangle rotate-45"
      />

      {/* Center Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-radial-gradient from-yellow-green/5 to-transparent blur-[150px]" />
    </div>
  );
}
