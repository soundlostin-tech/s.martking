"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export const ArenaBackground = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-background">
      {/* Floating Neutral Blobs */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={`blob-${i}`}
          className="absolute rounded-full mix-blend-multiply opacity-[0.12] blur-[120px]"
          style={{
            background: i % 2 === 0 ? "#64748b" : "#475569",
            width: i === 0 ? "500px" : i === 1 ? "400px" : "300px",
            height: i === 0 ? "500px" : i === 1 ? "400px" : "300px",
            left: `${[10, 70, 40, -10, 80][i]}%`,
            top: `${[5, 40, 75, 20, 85][i]}%`,
          }}
          animate={{
            x: [0, Math.random() * 60 - 30, 0],
            y: [0, Math.random() * 60 - 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20 + i * 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Geometric Accents - Slow Rotating Outlines */}
      <motion.div
        className="absolute top-[15%] right-[-5%] w-[450px] h-[450px] border border-slate-600/[0.05] rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute bottom-[10%] left-[-10%] w-[400px] h-[400px] border border-slate-500/[0.05] rounded-[60px]"
        animate={{ rotate: -360 }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
      />

      {/* Floating Particle Dots */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-1 h-1 bg-slate-400/20 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: 10 + Math.random() * 15,
            repeat: Infinity,
            delay: Math.random() * 10,
            ease: "linear",
          }}
        />
      ))}

      {/* Subtle Gradient Fade for Content Readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background opacity-40" />
    </div>
  );
};
