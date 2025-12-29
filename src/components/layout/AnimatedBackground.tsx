"use client";

import { useEffect, useState } from "react";

export function AnimatedBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 bg-transparent">
      {/* Background Flow Layer 1: Vivid Yellow-Green */}
      <div 
        className="absolute -top-[20%] -right-[10%] w-[120%] h-[120%] rounded-full blur-[140px] opacity-60 bg-gradient-flow-1"
        style={{ 
          background: 'radial-gradient(circle at center, #D4FC79 0%, #E2FF00 50%, transparent 70%)',
          transform: 'translate3d(0,0,0)' 
        }}
      />

      {/* Background Flow Layer 2: Vivid Purple-Lavender */}
      <div 
        className="absolute -bottom-[20%] -left-[10%] w-[110%] h-[110%] rounded-full blur-[160px] opacity-60 bg-gradient-flow-2"
        style={{ 
          background: 'radial-gradient(circle at center, #9F7AEA 0%, #BEE3F8 50%, transparent 70%)',
          transform: 'translate3d(0,0,0)'
        }}
      />

      {/* Background Flow Layer 3: Accent Mint/Sky */}
      <div 
        className="absolute top-[20%] left-[10%] w-[90%] h-[90%] rounded-full blur-[150px] opacity-50 bg-gradient-flow-3"
        style={{ 
          background: 'radial-gradient(circle at center, #48BB78 0%, #4299E1 60%, transparent 80%)',
          transform: 'translate3d(0,0,0)'
        }}
      />

      {/* Depth Layer 4: Floating Blobs (Small & Fast) */}
      <div 
        className="absolute top-[40%] right-[20%] w-[40%] h-[40%] rounded-full blur-[100px] opacity-20 bg-gradient-flow-1"
        style={{ 
          background: 'radial-gradient(circle at center, #ECC94B 0%, transparent 70%)',
          animationDuration: '12s'
        }}
      />

      {/* Noise Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" 
        style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/p6.png")' }} 
      />
    </div>
  );
}
