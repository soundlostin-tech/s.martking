"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Story {
  id: string;
  media_url: string;
  media_type: string;
  caption?: string;
  created_at: string;
}

interface StoryViewerProps {
  stories: Story[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export function StoryViewer({ stories, initialIndex = 0, isOpen, onClose }: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const duration = 5000; // 5 seconds per story

  useEffect(() => {
    if (!isOpen || isPaused) return;

    const interval = 50;
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex, isPaused, isOpen]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
    }
  };

  if (!isOpen) return null;

  const currentStory = stories[currentIndex];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black flex items-center justify-center"
      >
        <div className="relative w-full max-w-lg aspect-[9/16] bg-[#1A1A1A] overflow-hidden md:rounded-[40px] shadow-2xl">
          {/* Progress Bars */}
          <div className="absolute top-6 left-6 right-6 z-30 flex gap-2">
            {stories.map((_, i) => (
              <div key={i} className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-100 ease-linear"
                  style={{ 
                    width: i === currentIndex ? `${progress}%` : i < currentIndex ? "100%" : "0%" 
                  }}
                />
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="absolute top-12 left-6 right-6 z-30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center overflow-hidden">
                <img src="/logo.png" alt="Arena" className="w-6 h-6 object-contain" />
              </div>
              <div>
                <p className="text-[10px] font-black text-white uppercase tracking-widest">ARENA LOG</p>
                <p className="text-[8px] font-bold text-white/60 uppercase tracking-[0.2em]">MISSION INTEL</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white"
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white"
              >
                <X size={20} strokeWidth={3} />
              </button>
            </div>
          </div>

          {/* Media */}
          <div 
            className="w-full h-full relative"
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
            onMouseDown={() => setIsPaused(true)}
            onMouseUp={() => setIsPaused(false)}
          >
            {currentStory.media_type === "video" ? (
              <video
                src={currentStory.media_url}
                autoPlay
                muted={isMuted}
                playsInline
                className="w-full h-full object-cover"
                onEnded={handleNext}
              />
            ) : (
              <img
                src={currentStory.media_url}
                alt=""
                className="w-full h-full object-cover"
              />
            )}

            {/* Tap areas for navigation */}
            <div className="absolute inset-0 flex">
              <div className="flex-1 h-full cursor-pointer" onClick={handlePrev} />
              <div className="flex-1 h-full cursor-pointer" onClick={handleNext} />
            </div>

            {/* Caption */}
            {currentStory.caption && (
              <div className="absolute bottom-12 left-6 right-6 z-30">
                <div className="bg-black/40 backdrop-blur-xl p-6 rounded-[24px] border border-white/10">
                  <p className="text-white text-sm font-bold leading-relaxed italic">
                    "{currentStory.caption}"
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
