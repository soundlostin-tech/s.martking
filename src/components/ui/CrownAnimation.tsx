"use client";

import { motion } from "framer-motion";

interface CrownAnimationProps {
  size?: number;
  className?: string;
}

export function CrownAnimation({ size = 120, className = "" }: CrownAnimationProps) {
  const gold = "#FFD24D";
  const dark = "#1F2937";
  const coral = "#FF6B6B";

  // Animation variants for the 1.6s loop
  const shard1Variants = {
    animate: {
      y: [20, 0, -20, -25, 0],
      x: [0, 0, -30, -35, 0],
      rotate: [0, 0, -45, -60, 0],
      scale: [1, 1, 0.9, 0.8, 1],
      transition: {
        duration: 1.6,
        repeat: Infinity,
        times: [0, 0.25, 0.35, 0.7, 1],
        ease: "easeInOut"
      }
    }
  };

  const shard2Variants = {
    animate: {
      y: [20, 0, -40, -45, 0],
      rotate: [0, 0, 180, 360, 0],
      scale: [1, 1, 1.2, 1.1, 1],
      transition: {
        duration: 1.6,
        repeat: Infinity,
        times: [0, 0.25, 0.35, 0.7, 1],
        ease: "easeInOut"
      }
    }
  };

  const shard3Variants = {
    animate: {
      y: [20, 0, -20, -25, 0],
      x: [0, 0, 30, 35, 0],
      rotate: [0, 0, 45, 60, 0],
      scale: [1, 1, 0.9, 0.8, 1],
      transition: {
        duration: 1.6,
        repeat: Infinity,
        times: [0, 0.25, 0.35, 0.7, 1],
        ease: "easeInOut"
      }
    }
  };

  const ringVariants = {
    animate: {
      scale: [0.8, 1, 1.2, 1, 0.8],
      opacity: [0.3, 0.6, 0.2, 0.4, 0.3],
      transition: {
        duration: 1.6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

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
        {/* Arena Ring */}
        <motion.ellipse
          cx="60"
          cy="100"
          rx="40"
          ry="10"
          fill={coral}
          variants={ringVariants}
          animate="animate"
          style={{ filter: "blur(8px)" }}
        />
        <motion.ellipse
          cx="60"
          cy="100"
          rx="30"
          ry="6"
          stroke={coral}
          strokeWidth="2"
          variants={ringVariants}
          animate="animate"
        />

        {/* Crown Shards */}
        <g style={{ filter: `drop-shadow(0 4px 8px ${dark}44)` }}>
          {/* Left Shard */}
          <motion.path
            d="M 40 85 L 20 50 L 50 65 L 40 85"
            fill={gold}
            stroke={dark}
            strokeWidth="2"
            strokeLinejoin="round"
            variants={shard1Variants}
            animate="animate"
          />
          
          {/* Right Shard */}
          <motion.path
            d="M 80 85 L 100 50 L 70 65 L 80 85"
            fill={gold}
            stroke={dark}
            strokeWidth="2"
            strokeLinejoin="round"
            variants={shard3Variants}
            animate="animate"
          />

          {/* Center Shard */}
          <motion.path
            d="M 50 65 L 60 25 L 70 65 L 50 65"
            fill={gold}
            stroke={dark}
            strokeWidth="4"
            strokeLinejoin="round"
            variants={shard2Variants}
            animate="animate"
          />
        </g>

        {/* Subtle Glow Layer */}
        <motion.g
          animate={{
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            times: [0.3, 0.4, 0.6],
          }}
        >
          <circle cx="60" cy="60" r="30" fill={gold} style={{ filter: "blur(20px)" }} />
        </motion.g>
      </svg>
    </div>
  );
}
