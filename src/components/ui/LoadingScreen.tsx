"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { CrownAnimation } from "./CrownAnimation";

const MESSAGES = [
  "PREPARING ARENA",
  "SUMMONING CHAMPIONS",
  "SHARPENING BLADES",
  "SMARTKING'S ARENA"
];

export function LoadingScreen() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 2000); // Change text every 2 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-[#F5F5F5] flex flex-col items-center justify-center">
      <div className="unified-bg" />
      
      <div className="relative flex flex-col items-center justify-center scale-90 sm:scale-100">
        <CrownAnimation size={180} />
        
        <div className="mt-12 flex flex-col items-center gap-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={messageIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex flex-col items-center"
            >
              <p className="text-[12px] font-heading font-bold text-[#1A1A1A] tracking-[0.4em] uppercase text-center">
                {MESSAGES[messageIndex]}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="flex gap-1.5">
            {[0, 0.1, 0.2].map((delay) => (
              <motion.div 
                key={delay}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay,
                }}
                className="w-1.5 h-1.5 rounded-full bg-[#FFD24D]" 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
