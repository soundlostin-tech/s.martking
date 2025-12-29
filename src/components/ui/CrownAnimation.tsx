"use client";

import { motion } from "framer-motion";

interface CrownAnimationProps {
  size?: number;
  className?: string;
}

export function CrownAnimation({ size = 120, className = "" }: CrownAnimationProps) {
  // Timing variables (matching the 1.6s loop requirement)
  const DURATION = 1.6;
  const RISE_END = 0.6 / DURATION;
  const BURST_START = 0.6 / DURATION;
  const ROTATE_END = 1.2 / DURATION;
  const SETTLE_START = 1.2 / DURATION;

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
        {/* Glow Filter */}
        <defs>
          <filter id="crown-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <radialGradient id="ring-gradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFE6A7" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FFD24D" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Arena Ring (Glowing base) */}
        <motion.ellipse
          cx="60"
          cy="95"
          rx="40"
          ry="10"
          fill="url(#ring-gradient)"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: [0, 0.6, 0.4, 0.6, 0],
            scale: [0.5, 1.1, 1, 1.1, 0.5],
          }}
          transition={{
            duration: DURATION,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Shadow under crown */}
        <motion.ellipse
          cx="60"
          cy="95"
          rx="25"
          ry="6"
          fill="#1F2937"
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0.2, 0.1, 0.2, 0],
            scale: [0.5, 1, 0.8, 1, 0.5],
          }}
          transition={{
            duration: DURATION,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* The Crown Shards */}
        <g filter="url(#crown-glow)">
          {/* Shard 1 (Left) */}
          <motion.path
            d="M 35 85 L 15 45 L 55 65 Z"
            fill="#FFD24D"
            stroke="#1F2937"
            strokeWidth="2"
            strokeLinejoin="round"
            animate={{
              x: [0, 0, -20, -10, 0],
              y: [40, 0, -10, -5, 0],
              rotate: [0, 0, -45, -20, 0],
              scale: [0.8, 1, 1.2, 1.1, 1],
              opacity: [0, 1, 1, 1, 1],
            }}
            transition={{
              duration: DURATION,
              repeat: Infinity,
              times: [0, RISE_END, BURST_START + 0.1, ROTATE_END, 1],
              ease: "circOut",
            }}
          />

          {/* Shard 2 (Center) */}
          <motion.path
            d="M 55 65 L 60 25 L 65 65 Z"
            fill="#FFD24D"
            stroke="#1F2937"
            strokeWidth="2"
            strokeLinejoin="round"
            animate={{
              x: [0, 0, 0, 0, 0],
              y: [40, 0, -20, -10, 0],
              rotate: [0, 0, 180, 360, 360],
              scale: [0.8, 1, 1.3, 1.1, 1],
              opacity: [0, 1, 1, 1, 1],
            }}
            transition={{
              duration: DURATION,
              repeat: Infinity,
              times: [0, RISE_END, BURST_START + 0.1, ROTATE_END, 1],
              ease: "circOut",
            }}
          />

          {/* Shard 3 (Right) */}
          <motion.path
            d="M 65 65 L 105 45 L 85 85 Z"
            fill="#FFD24D"
            stroke="#1F2937"
            strokeWidth="2"
            strokeLinejoin="round"
            animate={{
              x: [0, 0, 20, 10, 0],
              y: [40, 0, -10, -5, 0],
              rotate: [0, 0, 45, 20, 0],
              scale: [0.8, 1, 1.2, 1.1, 1],
              opacity: [0, 1, 1, 1, 1],
            }}
            transition={{
              duration: DURATION,
              repeat: Infinity,
              times: [0, RISE_END, BURST_START + 0.1, ROTATE_END, 1],
              ease: "circOut",
            }}
          />

          {/* Subtle Red Highlight Accent */}
          <motion.path
            d="M 55 65 L 60 45 L 65 65 Z"
            fill="#FF6B6B"
            opacity="0.6"
            animate={{
              opacity: [0, 0.6, 0.8, 0],
              scale: [0.5, 1, 1.5, 2],
            }}
            transition={{
              duration: DURATION,
              repeat: Infinity,
              times: [BURST_START, BURST_START + 0.1, BURST_START + 0.2, BURST_START + 0.3],
            }}
          />
        </g>
      </svg>
    </div>
  );
}
