"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, useAnimation, PanInfo } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useHaptics } from '@/hooks/useHaptics';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const controls = useAnimation();
  const { triggerHaptic } = useHaptics();

  const handlePan = useCallback((_event: any, info: PanInfo) => {
    if (window.scrollY > 0 || isRefreshing) return;
    
    const distance = Math.max(0, info.offset.y);
    setPullDistance(distance);
    
    if (distance > 80) {
      // Could trigger a visual hint here
    }
  }, [isRefreshing]);

  const handlePanEnd = useCallback(async (_event: any, info: PanInfo) => {
    if (window.scrollY > 0 || isRefreshing) {
      setPullDistance(0);
      return;
    }

    if (info.offset.y > 80) {
      setIsRefreshing(true);
      triggerHaptic('medium');
      await onRefresh();
      setIsRefreshing(false);
      triggerHaptic('success');
    }
    setPullDistance(0);
  }, [isRefreshing, onRefresh, triggerHaptic]);

  return (
    <div className="relative w-full">
      <motion.div
        className="absolute top-0 left-0 right-0 flex justify-center py-4 pointer-events-none"
        style={{ opacity: isRefreshing ? 1 : Math.min(pullDistance / 80, 1) }}
      >
        <div className="bg-white/90 backdrop-blur-md p-2 rounded-full shadow-lg border border-slate-200">
          <Loader2 
            className={`w-6 h-6 text-onyx ${isRefreshing ? 'animate-spin' : ''}`} 
            style={{ transform: `rotate(${pullDistance * 2}deg)` }}
          />
        </div>
      </motion.div>
      
      <motion.div
        onPan={handlePan}
        onPanEnd={handlePanEnd}
        animate={{ y: isRefreshing ? 60 : Math.min(pullDistance, 100) }}
        transition={isRefreshing ? { type: "spring", stiffness: 300, damping: 30 } : { type: "tween", duration: 0 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
