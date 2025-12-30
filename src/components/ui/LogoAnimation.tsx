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
          className="absolute inset-[-20%] rounded-full bg-yellow-400/20 blur-2xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
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
            
            <linearGradient id="crown-gold-rich" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFF2CC" />
              <stop offset="40%" stopColor="#FFD966" />
              <stop offset="60%" stopColor="#F1C232" />
              <stop offset="100%" stopColor="#BF9000" />
            </linearGradient>

            <radialGradient id="jewel-gradient" cx="35%" cy="35%" r="50%">
              <stop offset="0%" stopColor="#FF9999" />
              <stop offset="70%" stopColor="#E60000" />
              <stop offset="100%" stopColor="#800000" />
            </radialGradient>

            <filter id="glow-logo" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>

            <filter id="crown-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="1" shadowOpacity="0.3"/>
            </filter>
          </defs>

          <motion.g
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Stylized 'e/S' character */}
            <motion.path
              d="M25 48 C25 31, 75 31, 75 48 C75 65, 25 65, 25 88 C25 105, 75 105, 75 88"
              stroke="url(#logo-gold)"
              strokeWidth="11"
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
            
            {/* Crown - More realistic shape and styling */}
            <motion.g
              filter="url(#crown-shadow)"
              animate={{
                y: [0, -5, 0],
                rotate: [0, -1, 1, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <path
                d="M32 32 L68 32 L75 18 L60 25 L50 10 L40 25 L25 18 Z"
                fill="url(#crown-gold-rich)"
                stroke="#1A1A1A"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              
              {/* Jewel with 3D effect */}
              <motion.circle
                cx="50"
                cy="10"
                r="4.5"
                fill="url(#jewel-gradient)"
                stroke="#1A1A1A"
                strokeWidth="1.5"
                animate={{
                  filter: ["brightness(1)", "brightness(1.3)", "brightness(1)"],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              
              {/* Detail lines on crown for "real life" feel */}
              <path 
                d="M40 25 L43 32 M60 25 L57 32 M50 20 L50 32" 
                stroke="#1A1A1A" 
                strokeWidth="1" 
                strokeOpacity="0.2"
              />
            </motion.g>

            {/* Inner highlights for depth */}
            <motion.path
              d="M28 48 C28 35, 72 35, 72 48 C72 63, 28 63, 28 88 C28 101, 72 101, 72 88"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeOpacity="0.3"
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
          className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent z-20 pointer-events-none"
          initial={{ x: "-150%" }}
          animate={{ x: "250%" }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>
    </motion.div>
  );
}
