"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface LogoAnimationProps {
  size?: number;
  className?: string;
}

export function LogoAnimation({ size = 36, className = "" }: LogoAnimationProps) {
  const [isMounted, setIsMounted] = useState(false);
  const DURATION = 2;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div 
        className={`relative flex items-center justify-center overflow-hidden rounded-xl bg-[#1A1A1A] shadow-lg ${className}`}
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
        {/* Glow Background */}
        <motion.div
          className="absolute inset-0 rounded-full bg-yellow-400/20 blur-xl"
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
        >
          <defs>
            <linearGradient id="logo-gold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFE6A7" />
              <stop offset="50%" stopColor="#FFD24D" />
              <stop offset="100%" stopColor="#E6B800" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Crown */}
            <motion.path
              d="M30 35 L35 25 L50 30 L65 25 L70 35 Z"
              fill="url(#logo-gold)"
              stroke="#1A1A1A"
              strokeWidth="2"
              strokeLinejoin="round"
              animate={{
                y: [0, -2, 0],
              }}
              transition={{
                duration: DURATION,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            {/* Jewel in Crown */}
            <motion.circle
              cx="50"
              cy="28"
              r="2.5"
              fill="#FF4B4B"
              animate={{
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Stylized 'e/S' character */}
            <motion.path
              d="M35 50 C35 40, 65 40, 65 50 C65 60, 35 60, 35 75 C35 85, 65 85, 65 75"
              stroke="url(#logo-gold)"
              strokeWidth="8"
              strokeLinecap="round"
              fill="none"
              filter="url(#glow)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 1.5,
                ease: "easeInOut",
              }}
            />
            
            {/* Inner line for depth */}
            <motion.path
              d="M35 50 C35 40, 65 40, 65 50 C65 60, 35 60, 35 75 C35 85, 65 85, 65 75"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeOpacity="0.3"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 1.5,
                ease: "easeInOut",
                delay: 0.2
              }}
            />
          </motion.g>
        </svg>

        {/* Shining light sweep across the whole thing */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent z-20 pointer-events-none"
          animate={{
            x: ["-100%", "200%"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>
    </motion.div>

  );
}
