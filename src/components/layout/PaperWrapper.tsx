import React from 'react';
import { motion } from 'framer-motion';

interface PaperWrapperProps {
  children: React.ReactNode;
  className?: string;
  showNav?: boolean;
}

export function PaperWrapper({ children, className = "" }: PaperWrapperProps) {
  return (
    <div className="paper-container">
      <motion.div 
        initial={{ opacity: 0, rotate: 0, scale: 0.9 }}
        animate={{ opacity: 1, rotate: -2, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`paper-card ${className} flex flex-col`}
      >
        <div className="flex-1 overflow-y-auto no-scrollbar pr-4">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
