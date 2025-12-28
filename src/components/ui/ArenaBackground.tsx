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
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-[#F8FAFC]">
      {/* Gentle Gradient Waves - Base Layer */}
      <motion.div
        className="absolute inset-0 opacity-[0.08]"
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%"],
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          background: "radial-gradient(circle at 50% 50%, #64748b 0%, transparent 50%), radial-gradient(circle at 100% 0%, #475569 0%, transparent 50%)",
          backgroundSize: "200% 200%",
        }}
      />

      {/* Floating Neutral Blobs - Subtly refined */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`blob-${i}`}
          className="absolute rounded-full blur-[100px] opacity-[0.12]"
          style={{
            background: i % 2 === 0 ? "#64748b" : "#475569",
            width: i === 0 ? "600px" : i === 1 ? "450px" : "350px",
            height: i === 0 ? "600px" : i === 1 ? "450px" : "350px",
            left: `${[5, 65, 30][i]}%`,
            top: `${[10, 45, 80][i]}%`,
          }}
          animate={{
            x: [0, 40, -40, 0],
            y: [0, -40, 40, 0],
            scale: [1, 1.05, 0.95, 1],
          }}
          transition={{
            duration: 25 + i * 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Slow Geometric Shapes - Minimal Outlines */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="absolute w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] border border-slate-400/[0.08] rounded-[120px]"
          animate={{ rotate: 360 }}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] border border-slate-500/[0.05] rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Subtle Floating Particles - Clean & Minimal */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-[2px] h-[2px] bg-slate-400/20 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -120, 0],
            opacity: [0, 0.4, 0],
            x: [0, Math.random() * 40 - 20, 0],
          }}
          transition={{
            duration: 15 + Math.random() * 20,
            repeat: Infinity,
            delay: Math.random() * 10,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Edge Vignette for Depth */}
      <div className="absolute inset-0 bg-radial-gradient(circle at 50% 50%, transparent 70%, rgba(248, 250, 252, 0.8) 100%)" />
      
      {/* Top and Bottom Fade to blend with Nav/Header */}
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#F8FAFC] to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-64 bg-gradient-to-t from-[#F8FAFC] via-[#F8FAFC]/80 to-transparent" />
    </div>
  );
};
