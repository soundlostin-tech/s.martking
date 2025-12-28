"use client";

import { motion } from "framer-motion";

export function GeometricBackground() {
    return (
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-white">
        {/* Top Right Circle */}
        <motion.div 
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 0.15, x: 0 }}
          className="absolute -top-20 -right-20 w-80 h-80 bg-slate-200 rounded-full"
        />
        
        {/* Mid Left Square */}
        <motion.div 
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 0.1, x: 0 }}
          className="absolute top-1/3 -left-10 w-40 h-40 bg-slate-100 rotate-12"
        />
  
        {/* Bottom Right Triangle */}
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 0.15, y: 0 }}
          className="absolute -bottom-20 right-10 w-60 h-60 bg-slate-200 shape-triangle rotate-45"
        />
  
        {/* Center Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-radial-gradient from-slate-200/5 to-transparent blur-[150px]" />
      </div>
    );

}
