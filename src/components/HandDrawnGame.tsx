import React from 'react';

export const HandDrawnGrid = () => (
  <svg viewBox="0 0 300 300" className="w-full h-full">
    <path 
      d="M 100 20 L 105 280" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="4" 
      strokeLinecap="round"
      className="animate-dash"
      style={{ strokeDasharray: 300, strokeDashoffset: 300 }}
    />
    <path 
      d="M 200 15 L 195 285" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="4" 
      strokeLinecap="round"
      className="animate-dash"
      style={{ strokeDasharray: 300, strokeDashoffset: 300, animationDelay: '0.2s' }}
    />
    <path 
      d="M 20 100 L 280 105" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="4" 
      strokeLinecap="round"
      className="animate-dash"
      style={{ strokeDasharray: 300, strokeDashoffset: 300, animationDelay: '0.4s' }}
    />
    <path 
      d="M 15 200 L 285 195" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="4" 
      strokeLinecap="round"
      className="animate-dash"
      style={{ strokeDasharray: 300, strokeDashoffset: 300, animationDelay: '0.6s' }}
    />
  </svg>
);

export const HandDrawnX = ({ delay = 0 }: { delay?: number }) => (
  <svg viewBox="0 0 100 100" className="w-full h-full p-4">
    <path 
      d="M 20 20 L 80 80" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="8" 
      strokeLinecap="round"
      className="animate-dash"
      style={{ strokeDasharray: 100, strokeDashoffset: 100, animationDelay: `${delay}s` }}
    />
    <path 
      d="M 80 20 L 20 80" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="8" 
      strokeLinecap="round"
      className="animate-dash"
      style={{ strokeDasharray: 100, strokeDashoffset: 100, animationDelay: `${delay + 0.2}s` }}
    />
  </svg>
);

export const HandDrawnO = ({ delay = 0 }: { delay?: number }) => (
  <svg viewBox="0 0 100 100" className="w-full h-full p-4">
    <circle 
      cx="50" cy="50" r="35" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="8" 
      strokeLinecap="round"
      className="animate-dash"
      style={{ strokeDasharray: 220, strokeDashoffset: 220, animationDelay: `${delay}s` }}
    />
  </svg>
);
