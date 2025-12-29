"use client";

import { motion } from "framer-motion";

interface ArenaLoaderProps {
  size?: number;
  className?: string;
}

export function ArenaLoader({ size = 120, className = "" }: ArenaLoaderProps) {
  const DURATION = 1.6;
  
  const RING_PULSE_END = 0.45 / DURATION;
  const CREST_RISE_END = 0.8 / DURATION;
  const FLASH_END = 1.1 / DURATION;
  const SETTLE_END = 1.0;

  return (
    <div 
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <radialGradient id="arena-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFE6A7" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#FFD24D" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FFD24D" stopOpacity="0" />
          </radialGradient>
          
          <radialGradient id="ring-inner" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFD24D" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#FFD24D" stopOpacity="0.1" />
          </radialGradient>

          <linearGradient id="crest-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE6A7" />
            <stop offset="50%" stopColor="#FFD24D" />
            <stop offset="100%" stopColor="#E6B800" />
          </linearGradient>

          <linearGradient id="crown-highlight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>

          <filter id="glow-filter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="flash-filter" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Stage 1: Arena Ring Pulse (0–0.45s) */}
        <motion.ellipse
          cx="60"
          cy="95"
          rx="45"
          ry="12"
          fill="url(#arena-glow)"
          animate={{
            opacity: [0, 0.8, 0.5, 0.6, 0.4, 0.5, 0],
            scale: [0.6, 1.2, 1, 1.05, 0.98, 1.02, 0.6],
          }}
          transition={{
            duration: DURATION,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, RING_PULSE_END, CREST_RISE_END, FLASH_END, 0.85, 0.95, 1],
          }}
        />

        {/* Ring ripple effect */}
        <motion.ellipse
          cx="60"
          cy="95"
          rx="35"
          ry="8"
          fill="none"
          stroke="#FFD24D"
          strokeWidth="1.5"
          strokeOpacity="0.4"
          animate={{
            scale: [0.5, 1.3, 1.5],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: DURATION * 0.5,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />

        {/* Secondary ripple */}
        <motion.ellipse
          cx="60"
          cy="95"
          rx="35"
          ry="8"
          fill="none"
          stroke="#FFE6A7"
          strokeWidth="1"
          strokeOpacity="0.3"
          animate={{
            scale: [0.5, 1.4, 1.6],
            opacity: [0, 0.4, 0],
          }}
          transition={{
            duration: DURATION * 0.5,
            repeat: Infinity,
            ease: "easeOut",
            delay: 0.15,
          }}
        />

        {/* Stage 2 & 3: Warrior Crest (S + Crown) */}
        <motion.g
          filter="url(#glow-filter)"
          animate={{
            y: [30, 0, -8, -2, 0, 1, 0],
            scale: [0.7, 1, 1.1, 0.95, 1, 1.02, 0.98],
            opacity: [0, 1, 1, 1, 1, 1, 1],
          }}
          transition={{
            duration: DURATION,
            repeat: Infinity,
            times: [0, RING_PULSE_END, CREST_RISE_END, FLASH_END, 0.85, 0.92, 1],
            ease: [0.34, 1.56, 0.64, 1],
          }}
        >
          {/* Stylized S Shape */}
          <motion.path
            d="M 45 70 
               C 45 60, 55 55, 60 55 
               C 70 55, 75 60, 75 65 
               C 75 70, 65 72, 60 72 
               C 50 72, 45 77, 45 82 
               C 45 88, 55 92, 65 92 
               C 70 92, 75 90, 75 85"
            fill="none"
            stroke="url(#crest-gradient)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Bevel highlight on S */}
          <motion.path
            d="M 47 69 
               C 47 61, 56 57, 60 57 
               C 68 57, 73 61, 73 65"
            fill="none"
            stroke="url(#crown-highlight)"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Mini Crown on top */}
          <motion.g>
            {/* Crown base */}
            <motion.path
              d="M 50 50 L 50 45 L 55 48 L 60 42 L 65 48 L 70 45 L 70 50 Z"
              fill="url(#crest-gradient)"
              stroke="#1F2937"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            
            {/* Crown highlight */}
            <motion.path
              d="M 52 48 L 55 46 L 60 44 L 65 46 L 68 48"
              fill="none"
              stroke="url(#crown-highlight)"
              strokeWidth="1"
              strokeLinecap="round"
            />

            {/* Center jewel */}
            <motion.circle
              cx="60"
              cy="47"
              r="2"
              fill="#FF6B6B"
            />
          </motion.g>
        </motion.g>

        {/* Flash burst effect (at 0.8s) */}
        <motion.circle
          cx="60"
          cy="65"
          r="20"
          fill="#FFE6A7"
          filter="url(#flash-filter)"
          animate={{
            scale: [0, 1.5, 2.5],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 0.3,
            repeat: Infinity,
            repeatDelay: DURATION - 0.3,
            delay: DURATION * CREST_RISE_END,
            ease: "easeOut",
          }}
        />

        {/* Red accent flash */}
        <motion.circle
          cx="60"
          cy="65"
          r="10"
          fill="#FF6B6B"
          animate={{
            scale: [0, 1, 1.8],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: 0.25,
            repeat: Infinity,
            repeatDelay: DURATION - 0.25,
            delay: DURATION * CREST_RISE_END + 0.05,
            ease: "easeOut",
          }}
        />
      </svg>
    </div>
  );
}
