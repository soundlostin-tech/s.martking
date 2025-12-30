"use client";

import React, { useMemo, useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";

export function AnimatedBackground() {
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<any[]>([]);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
    // Generate particles only on the client
    const newParticles = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      size: Math.random() * 4 + 2,
      x: Math.random() * 100,
      y: Math.random() * 100,
      targetX: Math.random() * 10 - 5,
      duration: Math.random() * 10 + 15,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  if (!mounted) {
    return (
      <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#0f172a]">
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            background: "radial-gradient(circle at 50% 50%, #111827 0%, #0f172a 100%)"
          }}
        />
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] opacity-12" />
        <div className="absolute inset-0 pointer-events-none bg-[#0f172a] opacity-12" />
      </div>
    );
  }

  if (shouldReduceMotion) {
    return (
      <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#0f172a]">
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            background: "radial-gradient(circle at 50% 50%, #111827 0%, #0f172a 100%)"
          }}
        />
        {/* Static faint particles */}
        {particles.slice(0, 10).map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-[#FFD24D] opacity-10"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.x}%`,
              top: `${p.y}%`,
            }}
          />
        ))}
        {/* Subtle Vignette */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] opacity-12" />
        <div className="absolute inset-0 pointer-events-none bg-[#0f172a] opacity-12" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#0f172a] perspective-1000">
      {/* Background Gradient Base */}
      <motion.div 
        className="absolute inset-0"
        animate={{
          background: [
            "radial-gradient(circle at 20% 30%, #111827 0%, #0f172a 100%)",
            "radial-gradient(circle at 80% 70%, #111827 0%, #0f172a 100%)",
            "radial-gradient(circle at 20% 30%, #111827 0%, #0f172a 100%)",
          ]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      />

      {/* Midground Wave Layer 1 */}
      <motion.svg
        className="absolute bottom-[-10%] left-[-10%] w-[120%] h-[60%] opacity-20 pointer-events-none"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        animate={{
          x: ["-2%", "2%", "-2%"],
          y: ["1%", "-1%", "1%"],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      >
        <path
          fill="#FFD24D"
          fillOpacity="0.3"
          d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,186.7C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
      </motion.svg>

      {/* Foreground Wave Layer 2 */}
      <motion.svg
        className="absolute bottom-[-20%] left-[-5%] w-[110%] h-[50%] opacity-15 pointer-events-none"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        animate={{
          x: ["1%", "-1%", "1%"],
          y: ["-2%", "2%", "-2%"],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      >
        <path
          fill="#FF7A18"
          fillOpacity="0.4"
          d="M0,224L60,213.3C120,203,240,181,360,181.3C480,181,600,203,720,213.3C840,224,960,224,1080,208C1200,192,1320,160,1380,144L1440,128L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
        />
      </motion.svg>

      {/* Floating Particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-[#FFD24D] blur-[1px]"
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0.1, 0.4, 0.1],
            x: [`${p.x}%`, `${p.x + p.targetX}%`],
            y: [`${p.y}%`, `${p.y - 20}%`],
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
            left: `${p.x}%`,
            top: `${p.y}%`,
          }}
        />
      ))}

      {/* Central Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)] opacity-12" />
      
      {/* Global Dimming Overlay to ensure legibility (0.12 opacity as requested) */}
      <div className="absolute inset-0 pointer-events-none bg-[#0f172a] opacity-12" />
    </div>
  );
}
