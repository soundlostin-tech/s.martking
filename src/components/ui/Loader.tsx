"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Zap } from "lucide-react";

interface FullScreenLoaderProps {
  isLoading: boolean;
  message?: string;
  subMessage?: string;
  debounceMs?: number;
}

export function FullScreenLoader({ 
  isLoading, 
  message = "Loading...", 
  subMessage,
  debounceMs = 250 
}: FullScreenLoaderProps) {
  const [showLoader, setShowLoader] = useState(false);
  const [delayedLoading, setDelayedLoading] = useState(false);

  useEffect(() => {
    let showTimer: NodeJS.Timeout;
    let hideTimer: NodeJS.Timeout;

    if (isLoading) {
      showTimer = setTimeout(() => {
        setDelayedLoading(true);
        setShowLoader(true);
      }, 800);
    } else {
      hideTimer = setTimeout(() => {
        setShowLoader(false);
        setDelayedLoading(false);
      }, debounceMs);
    }

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [isLoading, debounceMs]);

  return (
    <AnimatePresence>
      {showLoader && delayedLoading && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md flex items-center justify-center p-6"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white rounded-3xl p-8 max-w-xs w-full text-center shadow-2xl"
          >
            <div className="vortex-container mx-auto mb-6">
              <div className="vortex-ring vortex-ring-outer" />
              <div className="vortex-ring vortex-ring-middle" />
              <div className="vortex-ring vortex-ring-inner" />
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="vortex-particle"
                  style={{
                    '--rotation': `${i * 45}deg`,
                    animationDelay: `${i * 0.15}s`,
                  } as React.CSSProperties}
                />
              ))}
              <div className="absolute inset-0 flex items-center justify-center">
                <Zap size={28} className="text-[#5FD3BC] animate-pulse" />
              </div>
            </div>
            
            <h3 className="text-xl font-heading text-[#1A1A1A] font-bold mb-2">{message}</h3>
            {subMessage && (
              <p className="text-sm text-[#6B7280]">{subMessage}</p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface ButtonSpinnerProps {
  size?: number;
  className?: string;
}

export function ButtonSpinner({ size = 20, className = "" }: ButtonSpinnerProps) {
  return (
    <svg 
      className={`animate-spin ${className}`}
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
