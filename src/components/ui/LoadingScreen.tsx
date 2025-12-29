"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const MESSAGES = [
  "ENTERING ARENA...",
  "LOADING TOURNAMENT...",
  "SCANNING MATCHES...",
  "READYING WARRIORS...",
  "CALCULATING ODDS...",
  "SYNCING BATTLE DATA..."
];

export function LoadingScreen() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-[#F5F5F5] flex flex-col items-center justify-center">
      <div className="unified-bg" />
      
      <div className="relative flex items-center justify-center">
        {/* Central Ring */}
        <div className="loading-ring" />
        
        {/* Orbiting Particles */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="loading-particle orbiting" />
          <div className="loading-particle orbiting" />
          <div className="loading-particle orbiting" />
          <div className="loading-particle orbiting" />
        </div>
      </div>

      <div className="mt-12 flex flex-col items-center gap-4">
        <AnimatePresence mode="wait">
          <motion.p
            key={messageIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-[12px] font-bold text-[#1A1A1A] tracking-[0.2em] uppercase text-center"
          >
            {MESSAGES[messageIndex]}
          </motion.p>
        </AnimatePresence>

        <div className="flex gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#5FD3BC] bounce-dot" style={{ animationDelay: "0s" }} />
          <div className="w-1.5 h-1.5 rounded-full bg-[#5FD3BC] bounce-dot" style={{ animationDelay: "0.2s" }} />
          <div className="w-1.5 h-1.5 rounded-full bg-[#5FD3BC] bounce-dot" style={{ animationDelay: "0.4s" }} />
        </div>
      </div>
    </div>
  );
}
