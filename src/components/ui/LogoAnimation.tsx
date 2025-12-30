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
      className={`relative flex items-center justify-center overflow-hidden rounded-xl bg-[#1A1A1A] shadow-lg ${className}`}
      style={{ width: size, height: size }}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full p-2"
      >
        <defs>
          <linearGradient id="logo-crest-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE6A7" />
            <stop offset="50%" stopColor="#FFD24D" />
            <stop offset="100%" stopColor="#E6B800" />
          </linearGradient>
          
          <filter id="logo-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <motion.g
          filter="url(#logo-glow)"
          animate={{
            y: [0, -3, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: DURATION,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Main Logo Icon (Simplified Layers) */}
          <motion.path
            d="M 50 25 L 20 40 L 50 55 L 80 40 Z"
            fill="url(#logo-crest-gradient)"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: DURATION, repeat: Infinity }}
          />
          <motion.path
            d="M 20 55 L 50 70 L 80 55"
            stroke="url(#logo-crest-gradient)"
            strokeWidth="6"
            strokeLinecap="round"
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: DURATION, repeat: Infinity, delay: 0.2 }}
          />
          <motion.path
            d="M 20 70 L 50 85 L 80 70"
            stroke="url(#logo-crest-gradient)"
            strokeWidth="6"
            strokeLinecap="round"
            animate={{ opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: DURATION, repeat: Infinity, delay: 0.4 }}
          />
        </motion.g>
      </svg>
      
      {/* Absolute overlay for the shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
        animate={{
          left: ["-100%", "200%"],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
        }}
        style={{ pointerEvents: 'none' }}
      />
    </motion.div>
  );
}
