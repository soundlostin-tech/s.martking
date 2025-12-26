import React from 'react';

interface PaperWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function PaperWrapper({ children, className = "" }: PaperWrapperProps) {
  return (
    <div className="paper-container flex items-center justify-center min-h-screen w-full">
      <div className={`paper-card ${className}`}>
        {children}
      </div>
    </div>
  );
}
