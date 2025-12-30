"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";

interface Story {
  id: string;
  media_url: string;
  media_type: 'image' | 'video';
  caption?: string;
  created_at: string;
  expires_at: string;
  user: {
    full_name: string;
    avatar_url: string;
  };
}

interface StoryViewerProps {
  stories: Story[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

function formatTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return "1d ago";
}

export function StoryViewer({ stories, initialIndex, isOpen, onClose }: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setProgress(0);
      setImageLoaded(false);
    }
  }, [isOpen, initialIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
      setImageLoaded(false);
    } else {
      onClose();
    }
  }, [currentIndex, stories.length, onClose]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
      setImageLoaded(false);
    }
  }, [currentIndex]);

  useEffect(() => {
    if (!isOpen || isPaused) return;

    const currentStory = stories[currentIndex];
    if (!currentStory) return;

    if (currentStory.media_type === 'image' && !imageLoaded) return;

    const duration = currentStory.media_type === 'video' ? 15000 : 5000;
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
  }, [isOpen, currentIndex, isPaused, imageLoaded, stories, handleNext]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  if (!isOpen || stories.length === 0) return null;

  const currentStory = stories[currentIndex];

  if (!currentStory) {
    onClose();
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
      >
        <div className="relative w-full max-w-md h-full max-h-[90vh] bg-[#1A1A1A] overflow-hidden rounded-none sm:rounded-[40px] shadow-2xl">
          <div className="absolute top-4 left-4 right-4 z-20 flex gap-1.5">
            {stories.map((_, index) => (
              <div key={index} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-50 ease-linear"
                  style={{ 
                    width: index === currentIndex ? `${progress}%` : index < currentIndex ? '100%' : '0%' 
                  }}
                />
              </div>
            ))}
          </div>

          <div className="absolute top-8 left-4 right-4 z-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-[#5FD3BC] overflow-hidden bg-white/10">
                {currentStory.user?.avatar_url ? (
                  <img src={currentStory.user.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold">
                    {currentStory.user?.full_name?.[0] || "?"}
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold text-sm">{currentStory.user?.full_name || "User"}</span>
                <span className="text-[10px] text-white/60 font-medium flex items-center gap-1">
                  <Clock size={10} />
                  {formatTimeAgo(currentStory.created_at)}
                </span>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div 
            className="w-full h-full flex items-center justify-center bg-black"
            onMouseDown={() => setIsPaused(true)}
            onMouseUp={() => setIsPaused(false)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            {currentStory.media_type === 'video' ? (
              <video 
                ref={videoRef}
                key={currentStory.id}
                src={currentStory.media_url} 
                autoPlay 
                muted 
                playsInline 
                className="w-full h-full object-contain"
                onLoadedData={() => setImageLoaded(true)}
              />
            ) : (
              <img 
                key={currentStory.id}
                src={currentStory.media_url} 
                alt={currentStory.caption || "Story"} 
                className="w-full h-full object-contain"
                onLoad={() => setImageLoaded(true)}
              />
            )}
          </div>

          {currentStory.caption && (
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
              <p className="text-white text-base font-medium text-center">{currentStory.caption}</p>
            </div>
          )}

          <div className="absolute inset-0 z-10 flex pointer-events-none">
            <div 
              className="w-1/3 h-full cursor-pointer pointer-events-auto" 
              onClick={handlePrev} 
            />
            <div className="w-1/3 h-full" />
            <div 
              className="w-1/3 h-full cursor-pointer pointer-events-auto" 
              onClick={handleNext} 
            />
          </div>

          <div className="hidden md:flex absolute inset-y-0 left-2 items-center z-30">
            <button 
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-0 transition-all"
            >
              <ChevronLeft size={24} />
            </button>
          </div>
          <div className="hidden md:flex absolute inset-y-0 right-2 items-center z-30">
            <button 
              onClick={handleNext}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
