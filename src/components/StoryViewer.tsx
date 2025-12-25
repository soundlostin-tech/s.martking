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
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
        >
          <div className="relative w-full max-w-md bg-zinc-900 overflow-hidden rounded-3xl shadow-2xl">
            {/* Progress Bars */}

          <div className="absolute top-4 left-4 right-4 z-20 flex gap-1">
            {stories.map((_, index) => (
              <div key={index} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-50"
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
              <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-zinc-800">
                {currentStory.user.avatar_url ? (
                  <img src={currentStory.user.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold">
                    {currentStory.user.full_name[0]}
                  </div>
                )}
              </div>
              <span className="text-white font-bold text-sm shadow-sm">{currentStory.user.full_name}</span>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

            {/* Content */}
            <div className="w-full flex items-center justify-center bg-zinc-900">
              {currentStory.media_type === 'image' ? (
                <img 
                  src={currentStory.media_url} 
                  alt={currentStory.caption} 
                  className="w-full h-auto max-h-[80vh] object-contain block"
                />
              ) : (
                <video 
                  src={currentStory.media_url} 
                  autoPlay 
                  muted 
                  playsInline 
                  loop
                  className="w-full h-auto max-h-[80vh] object-contain block"
                />
              )}
            </div>


          {/* Caption */}
          {currentStory.caption && (
            <div className="absolute bottom-12 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-center">
              <p className="text-white text-lg font-serif">{currentStory.caption}</p>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="absolute inset-0 z-10 flex">
            <div className="w-1/2 h-full cursor-pointer" onClick={handlePrev} />
            <div className="w-1/2 h-full cursor-pointer" onClick={handleNext} />
          </div>

          {/* Desktop Navigation Buttons */}
          <div className="hidden md:flex absolute inset-y-0 -left-16 items-center">
            <button 
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-0 transition-all"
            >
              <ChevronLeft size={32} />
            </button>
          </div>
          <div className="hidden md:flex absolute inset-y-0 -right-16 items-center">
            <button 
              onClick={handleNext}
              disabled={currentIndex === stories.length - 1}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-0 transition-all"
            >
              <ChevronRight size={32} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
