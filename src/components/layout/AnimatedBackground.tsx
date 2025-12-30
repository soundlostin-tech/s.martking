"use client";

import React, { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";

export function AnimatedBackground() {
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<any[]>([]);
  const [streaks, setStreaks] = useState<any[]>([]);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
    // Generate particles only on the client
    const newParticles = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      size: Math.random() * 3 + 1,
      x: Math.random() * 100,
      y: Math.random() * 100,
      targetX: Math.random() * 20 - 10,
      targetY: Math.random() * -30 - 10,
      duration: Math.random() * 15 + 15,
      delay: Math.random() * 10,
      color: ["#A855F7", "#3B82F6", "#06B6D4"][Math.floor(Math.random() * 3)],
    }));
    setParticles(newParticles);

    // Generate light streaks
    const newStreaks = Array.from({ length: 5 }).map((_, i) => ({
      id: i,
      y: Math.random() * 100,
      width: Math.random() * 40 + 20,
      duration: Math.random() * 20 + 20,
      delay: Math.random() * 10,
      color: ["#A855F7", "#3B82F6", "#06B6D4"][Math.floor(Math.random() * 3)],
    }));
    setStreaks(newStreaks);
  }, []);

  if (!mounted) {
    return <div className="fixed inset-0 z-[-1] bg-[#020617]" />;
  }

  if (shouldReduceMotion) {
    return (
      <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#020617]">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: "radial-gradient(circle at 50% 50%, #1e1b4b 0%, #020617 100%)"
          }}
        />
        {/* Static faint particles */}
        {particles.slice(0, 15).map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full opacity-10 blur-[1px]"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.x}%`,
              top: `${p.y}%`,
              backgroundColor: p.color,
            }}
          />
        ))}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#020617] perspective-1000">
      {/* Background Gradient Base - Atmospheric Glow */}
      <motion.div 
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            "radial-gradient(circle at 10% 10%, #4c1d95 0%, transparent 50%), radial-gradient(circle at 90% 90%, #1e3a8a 0%, transparent 50%)",
            "radial-gradient(circle at 90% 10%, #1e3a8a 0%, transparent 50%), radial-gradient(circle at 10% 90%, #0e7490 0%, transparent 50%)",
            "radial-gradient(circle at 10% 10%, #4c1d95 0%, transparent 50%), radial-gradient(circle at 90% 90%, #1e3a8a 0%, transparent 50%)",
          ]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      />

      {/* Light Streaks - Horizontal Gliding Lines */}
      {streaks.map((s) => (
        <motion.div
          key={s.id}
          className="absolute h-[1px] opacity-10 blur-[1px] pointer-events-none"
          initial={{ x: "-100%", width: `${s.width}%` }}
          animate={{ x: "200%" }}
          transition={{
            duration: s.duration,
            repeat: Infinity,
            delay: s.delay,
            ease: "linear",
          }}
          style={{
            top: `${s.y}%`,
            background: `linear-gradient(90deg, transparent, ${s.color}, transparent)`,
          }}
        />
      ))}

      {/* Neon Waves Layer 1 (Purple/Blue) */}
      <motion.svg
        className="absolute bottom-[-10%] left-[-10%] w-[120%] h-[60%] opacity-20 pointer-events-none filter blur-[40px]"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        animate={{
          x: ["-1%", "1%", "-1%"],
          y: ["1%", "-1%", "1%"],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      >
        <path
          fill="#A855F7"
          d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,186.7C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
      </motion.svg>

      {/* Neon Waves Layer 2 (Cyan/Blue) */}
      <motion.svg
        className="absolute bottom-[-20%] left-[-5%] w-[110%] h-[50%] opacity-15 pointer-events-none filter blur-[30px]"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        animate={{
          x: ["1%", "-1%", "1%"],
          y: ["-2%", "2%", "-2%"],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      >
        <path
          fill="#06B6D4"
          d="M0,224L60,213.3C120,203,240,181,360,181.3C480,181,600,203,720,213.3C840,224,960,224,1080,208C1200,192,1320,160,1380,144L1440,128L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
        />
      </motion.svg>

      {/* Particle Sparks */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full blur-[1px]"
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.4, 0],
            scale: [0.5, 1, 0.5],
            x: [`${p.x}%`, `${p.x + p.targetX}%`],
            y: [`${p.y}%`, `${p.y + p.targetY}%`],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear",
          }}
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 10px ${p.color}`,
            left: `${p.x}%`,
            top: `${p.y}%`,
          }}
        />
      ))}

      {/* Central Vignette - Keeps center darker for readability */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.8)_100%)]" />
      
      {/* Edge Glow Corners */}
      <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-purple-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-blue-500/5 blur-[120px] pointer-events-none" />
      
      {/* Noise Texture Overlay for that "arena" grit */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
}
