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
      {/* SVG Filter for Liquid/Gooey effect */}
      <svg className="hidden">
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8" result="goo" />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

        <div className="absolute inset-0 filter blur-[120px]" style={{ filter: 'url(#goo) blur(120px)' }}>
          {/* Top Left - Light Lime/Yellow */}
          <div 
            className="absolute top-[-20%] left-[-10%] w-[100%] h-[100%] rounded-full opacity-40"
            style={{ 
              background: 'radial-gradient(circle at center, #D4FC79 0%, #E2FF00 40%, transparent 70%)',
              animation: 'gradientFlow 25s ease-in-out infinite',
              transform: 'translate3d(0,0,0)',
              willChange: 'transform'
            }}
          />

          {/* Top Right - Soft Blue/Lavender */}
          <div 
            className="absolute top-[-20%] right-[-10%] w-[90%] h-[90%] rounded-full opacity-30"
            style={{ 
              background: 'radial-gradient(circle at center, #BEE3F8 0%, #E9D8FD 40%, transparent 70%)',
              animation: 'gradientFlowReverse 30s ease-in-out infinite',
              transform: 'translate3d(0,0,0)',
              willChange: 'transform'
            }}
          />

          {/* Bottom Middle/Right - Very subtle accent */}
          <div 
            className="absolute bottom-[-20%] right-[10%] w-[80%] h-[80%] rounded-full opacity-20"
            style={{ 
              background: 'radial-gradient(circle at center, #E9D8FD 0%, #BEE3F8 30%, transparent 60%)',
              animation: 'gradientFlow 35s ease-in-out infinite alternate',
              transform: 'translate3d(0,0,0)',
              willChange: 'transform'
            }}
          />
        </div>

      {/* Noise Texture Overlay for premium feel */}
      <div 
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none" 
        style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/p6.png")' }} 
      />
    </div>
  );
}
