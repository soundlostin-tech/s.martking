"use client";

import { useCallback } from 'react';

export function useHaptics() {
  const triggerHaptic = useCallback((style: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light') => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      switch (style) {
        case 'light':
          window.navigator.vibrate(10);
          break;
        case 'medium':
          window.navigator.vibrate(20);
          break;
        case 'heavy':
          window.navigator.vibrate(40);
          break;
        case 'success':
          window.navigator.vibrate([10, 30, 10]);
          break;
        case 'warning':
          window.navigator.vibrate([20, 50]);
          break;
        case 'error':
          window.navigator.vibrate([50, 50, 50]);
          break;
        default:
          window.navigator.vibrate(10);
      }
    }
  }, []);

  return { triggerHaptic };
}
