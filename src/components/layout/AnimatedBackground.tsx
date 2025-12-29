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

      <div className="absolute inset-0 filter blur-[80px]" style={{ filter: 'url(#goo) blur(80px)' }}>
        {/* Yellow-Green Wave */}
        <div 
          className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] rounded-full opacity-70"
          style={{ 
            background: 'radial-gradient(circle at center, #E2FF00 0%, #D4FC79 50%, transparent 70%)',
            animation: 'gradientFlow 20s ease-in-out infinite',
            transform: 'translate3d(0,0,0)',
            willChange: 'transform'
          }}
        />

        {/* Purple Wave */}
        <div 
          className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[80%] rounded-full opacity-70"
          style={{ 
            background: 'radial-gradient(circle at center, #9F7AEA 0%, #BEE3F8 50%, transparent 70%)',
            animation: 'gradientFlowReverse 25s ease-in-out infinite',
            transform: 'translate3d(0,0,0)',
            willChange: 'transform'
          }}
        />

        {/* Green/Teal Wave */}
        <div 
          className="absolute top-[20%] right-[10%] w-[60%] h-[60%] rounded-full opacity-60"
          style={{ 
            background: 'radial-gradient(circle at center, #48BB78 0%, #4299E1 60%, transparent 80%)',
            animation: 'gradientFlow 30s ease-in-out infinite alternate',
            transform: 'translate3d(0,0,0)',
            willChange: 'transform'
          }}
        />

        {/* Soft Pink/Peach Accent */}
        <div 
          className="absolute bottom-[20%] left-[10%] w-[50%] h-[50%] rounded-full opacity-50"
          style={{ 
            background: 'radial-gradient(circle at center, #F56565 0%, #ED8936 50%, transparent 70%)',
            animation: 'gradientFlowReverse 22s ease-in-out infinite',
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
