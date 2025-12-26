"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

interface Story {
  id: string;
  media_url: string;
  media_type: 'image' | 'video';
  caption?: string;
  created_at: string;
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

export function StoryViewer({ stories, initialIndex, isOpen, onClose }: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setProgress(0);
    }
  }, [isOpen, initialIndex]);

  useEffect(() => {
    if (!isOpen) return;

    const duration = 5000; // 5 seconds per story
    const interval = 50; // Update every 50ms
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
  }, [isOpen, currentIndex]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
    }
  };

  if (!isOpen || stories.length === 0) return null;

  const currentStory = stories[currentIndex];

  return (
    <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[100] bg-background/95 flex items-center justify-center p-4 backdrop-blur-md"
          >
            <div className="relative w-full max-w-md bg-white overflow-hidden rounded-[40px] shadow-2xl border border-primary/5">
              {/* Progress Bars */}

            <div className="absolute top-4 left-4 right-4 z-20 flex gap-1.5">
              {stories.map((_, index) => (
                <div key={index} className="h-1 flex-1 bg-primary/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-secondary transition-all duration-50"
                    style={{ 
                      width: index === currentIndex ? `${progress}%` : index < currentIndex ? '100%' : '0%' 
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Header */}
            <div className="absolute top-8 left-4 right-4 z-20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl border-2 border-secondary/20 overflow-hidden bg-primary/5">
                    {currentStory.user.avatar_url ? (
                    <img src={currentStory.user.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary font-bold">
                      {currentStory.user.full_name[0]}
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-primary font-bold text-sm">{currentStory.user.full_name}</span>
                  <span className="text-[10px] text-primary/40 font-bold uppercase tracking-widest">LIVE NOW</span>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-2xl bg-primary/5 hover:bg-primary/10 text-primary/60 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

              {/* Content */}
              <div className="w-full flex items-center justify-center bg-primary/5 min-h-[60vh]">
                {currentStory.media_type === 'image' ? (
                  <img 
                    src={currentStory.media_url} 
                    alt={currentStory.caption} 
                    className="w-full h-auto max-h-[70vh] object-contain block"
                  />
                ) : (
                  <video 
                    src={currentStory.media_url} 
                    autoPlay 
                    muted 
                    playsInline 
                    loop
                    className="w-full h-auto max-h-[70vh] object-contain block"
                  />
                )}
              </div>


            {/* Caption */}
            {currentStory.caption && (
              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-white via-white/90 to-transparent text-center">
                <p className="text-primary text-xl font-serif italic">{currentStory.caption}</p>
              </div>
            )}

            {/* Navigation Controls */}
            <div className="absolute inset-0 z-10 flex">
              <div className="w-1/3 h-full cursor-pointer" onClick={handlePrev} />
              <div className="w-2/3 h-full cursor-pointer" onClick={handleNext} />
            </div>

            {/* Desktop Navigation Buttons */}
            <div className="hidden md:flex absolute inset-y-0 -left-20 items-center">
              <button 
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="p-4 rounded-3xl bg-white border border-primary/5 shadow-xl text-primary/40 hover:text-secondary disabled:opacity-0 transition-all"
              >
                <ChevronLeft size={24} />
              </button>
            </div>
            <div className="hidden md:flex absolute inset-y-0 -right-20 items-center">
              <button 
                onClick={handleNext}
                disabled={currentIndex === stories.length - 1}
                className="p-4 rounded-3xl bg-white border border-primary/5 shadow-xl text-primary/40 hover:text-secondary disabled:opacity-0 transition-all"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        </motion.div>
    </AnimatePresence>
  );
}
