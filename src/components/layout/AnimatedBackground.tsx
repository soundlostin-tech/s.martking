"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function AnimatedBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="mesh-bg">
      <motion.div 
        animate={{ 
          x: [0, 100, 0], 
          y: [0, 50, 0],
          scale: [1, 1.3, 1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-primary/30 rounded-full blur-[120px] animate-blob" 
      />
      <motion.div 
        animate={{ 
          x: [0, -80, 0], 
          y: [0, 100, 0],
          scale: [1.3, 1, 1.3]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[80%] bg-accent/30 rounded-full blur-[120px] animate-blob" 
      />
      <motion.div 
        animate={{ 
          x: [0, 50, 0], 
          y: [0, -50, 0],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute top-[20%] right-[10%] w-[50%] h-[50%] bg-secondary/20 rounded-full blur-[100px] animate-blob" 
      />
    </div>
  );
}
