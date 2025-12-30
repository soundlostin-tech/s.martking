"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface LogoAnimationProps {
  size?: number;
  className?: string;
}

export function LogoAnimation({ size = 36, className = "" }: LogoAnimationProps) {
  const [isMounted, setIsMounted] = useState(false);
  const DURATION = 2.5;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div 
        className={`relative flex items-center justify-center overflow-hidden rounded-xl bg-transparent ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <motion.div 
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Glow Background - Dynamic size based on 'size' prop */}
        <motion.div
          className="absolute inset-[-20%] rounded-full bg-yellow-400/30 blur-xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: DURATION,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full relative z-10"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="logo-gold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFE6A7" />
              <stop offset="50%" stopColor="#FFD24D" />
              <stop offset="100%" stopColor="#E6B800" />
            </linearGradient>
            <filter id="glow-logo" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          <motion.g
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Stylized 'e/S' character - Larger and more prominent */}
            <motion.path
              d="M25 45 C25 28, 75 28, 75 45 C75 62, 25 62, 25 85 C25 102, 75 102, 75 85"
              stroke="url(#logo-gold)"
              strokeWidth="12"
              strokeLinecap="round"
              fill="none"
              filter="url(#glow-logo)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 1.8,
                ease: "easeInOut",
              }}
            />
            
            {/* Crown - Positioned better relative to the character */}
            <motion.g
              animate={{
                y: [0, -4, 0],
              }}
              transition={{
                duration: DURATION,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <path
                d="M28 28 L35 15 L50 22 L65 15 L72 28 Z"
                fill="url(#logo-gold)"
                stroke="#1A1A1A"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              {/* Jewel in Crown */}
              <motion.circle
                cx="50"
                cy="18"
                r="3.5"
                fill="#FF4B4B"
                stroke="#1A1A1A"
                strokeWidth="1"
                animate={{
                  opacity: [0.8, 1, 0.8],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.g>

            {/* Inner highlights for depth */}
            <motion.path
              d="M28 45 C28 32, 72 32, 72 45 C72 60, 28 60, 28 85 C28 98, 72 98, 72 85"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeOpacity="0.4"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 1.8,
                ease: "easeInOut",
                delay: 0.3
              }}
            />
          </motion.g>
        </svg>

        {/* Shining light sweep */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent z-20 pointer-events-none"
          initial={{ x: "-100%" }}
          animate={{ x: "200%" }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5
          }}
        />
      </div>
    </motion.div>
  );
}
