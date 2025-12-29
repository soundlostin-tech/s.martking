"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const MESSAGES = [
  "FIGHTING",
  "WINNING",
  "COMPETING",
  "LOADING"
];

export function LoadingScreen() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 2500); // Change text every 2.5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-[#F5F5F5] flex flex-col items-center justify-center">
      <div className="unified-bg" />
      
      <div className="relative flex items-center justify-center scale-90 sm:scale-100">
        {/* Swirling Emerald Vortex */}
        <div className="vortex-container">
          <div className="vortex-ring vortex-ring-outer" />
          <div className="vortex-ring vortex-ring-middle" />
          <div className="vortex-ring vortex-ring-inner" />
          
          {/* Vortex Particles */}
          {[...Array(12)].map((_, i) => (
            <div 
              key={i}
              className="vortex-particle"
              style={{ 
                "--rotation": `${i * 30}deg`,
                animationDelay: `${i * 0.15}s`
              } as React.CSSProperties}
            />
          ))}
        </div>
      </div>

      <div className="mt-16 flex flex-col items-center gap-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={messageIndex}
            initial={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(4px)" }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="flex flex-col items-center"
          >
            <p className="text-[14px] font-heading font-bold text-[#1A1A1A] tracking-[0.3em] uppercase text-center">
              {MESSAGES[messageIndex]}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-2">
          {[0, 0.2, 0.4].map((delay) => (
            <div 
              key={delay}
              className="w-2 h-2 rounded-full bg-[#5FD3BC] bounce-dot" 
              style={{ animationDelay: `${delay}s` }} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}
