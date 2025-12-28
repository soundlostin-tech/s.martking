"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Power } from "lucide-react";
import { cn } from "@/lib/utils";

interface VintageTVProps {
  streamUrl?: string;
  isOn?: boolean;
  onToggle?: (isOn: boolean) => void;
  title?: string;
}

export function VintageTV({ streamUrl, isOn = false, onToggle, title }: VintageTVProps) {
  const [volume, setVolume] = useState(50);
  const [channelOn, setChannelOn] = useState(isOn);
  const [isRotatingCH, setIsRotatingCH] = useState(false);

  useEffect(() => {
    setChannelOn(isOn);
  }, [isOn]);

  const handleChannelToggle = () => {
    setIsRotatingCH(true);
    const newState = !channelOn;
    setTimeout(() => {
      setChannelOn(newState);
      onToggle?.(newState);
      setIsRotatingCH(false);
    }, 200);
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      {/* TV Casing */}
      <div className="relative bg-onyx rounded-[32px] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.2)] border-4 border-carbon-black overflow-hidden">
        {/* Screen Bezel */}
        <div className="relative aspect-video bg-carbon-black rounded-[20px] overflow-hidden border-[8px] border-charcoal-brown/20 shadow-inner">
          <AnimatePresence mode="wait">
            {channelOn && streamUrl ? (
              <motion.div
                key="on"
                initial={{ opacity: 0, scale: 0, filter: "brightness(2)" }}
                animate={{ opacity: 1, scale: 1, filter: "brightness(1)" }}
                exit={{ opacity: 0, scale: 1.1, filter: "brightness(2) blur(10px)" }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="absolute inset-0"
              >
                <iframe
                  src={streamUrl}
                  className="w-full h-full"
                  allow="autoplay; encrypted-media"
                />
                {/* CRT Effects */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%] opacity-20" />
                <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]" />
              </motion.div>
            ) : (
              <motion.div
                key="off"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-[#1a1a1a]"
              >
                {/* Static Noise / Pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://media.giphy.com/media/oEI9uWUicKgR6L5fX0/giphy.gif')] bg-cover" />
                <div className="relative z-10 flex flex-col items-center gap-4">
                  <div className="px-4 py-2 bg-charcoal-brown/20 rounded-xl border border-white/5 backdrop-blur-sm">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] text-center">NO SIGNAL</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-white/10 animate-pulse" />
                    <div className="w-2 h-2 rounded-full bg-white/10 animate-pulse delay-75" />
                    <div className="w-2 h-2 rounded-full bg-white/10 animate-pulse delay-150" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Control Strip */}
        <div className="mt-6 flex items-center justify-between px-2">
          {/* Brand & LED */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">SMARTKING'S</span>
              <div className="flex items-center gap-2">
                <motion.div 
                  animate={channelOn ? { 
                    backgroundColor: "#D7FD03",
                    boxShadow: "0 0 12px rgba(215,253,3,0.8)",
                    scale: [1, 1.2, 1]
                  } : { 
                    backgroundColor: "#ff4444",
                    boxShadow: "0 0 4px rgba(255,68,68,0.3)",
                    scale: 1
                  }}
                  transition={channelOn ? { repeat: Infinity, duration: 2 } : {}}
                  className="w-2 h-2 rounded-full"
                />
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-tighter">
                  {channelOn ? 'ON AIR' : 'OFF'}
                </span>
              </div>
            </div>
          </div>

          {/* Knobs */}
          <div className="flex items-center gap-6">
            {/* CH Knob */}
            <div className="flex flex-col items-center gap-1">
              <motion.button
                animate={{ rotate: isRotatingCH ? (channelOn ? 0 : 45) : (channelOn ? 45 : 0) }}
                onClick={handleChannelToggle}
                className="w-12 h-12 rounded-full bg-charcoal-brown border-4 border-carbon-black shadow-lg flex items-center justify-center relative active:scale-95 transition-transform"
              >
                <div className="absolute top-1 w-1 h-3 bg-white/20 rounded-full" />
                <Power size={14} className={cn("text-white/40", channelOn && "text-lime-yellow")} />
              </motion.button>
              <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">CH</span>
            </div>

            {/* VOL Knob */}
            <div className="flex flex-col items-center gap-1">
              <motion.div
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                onDrag={(e, info) => {
                  const delta = info.delta.y;
                  setVolume(prev => Math.max(0, Math.min(100, prev - delta)));
                }}
                animate={{ rotate: (volume / 100) * 270 - 135 }}
                className="w-12 h-12 rounded-full bg-charcoal-brown border-4 border-carbon-black shadow-lg flex items-center justify-center relative cursor-ns-resize"
              >
                <div className="absolute top-1 w-1 h-3 bg-white/20 rounded-full" />
                <Volume2 size={14} className="text-white/40" />
              </motion.div>
              <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">VOL</span>
            </div>
          </div>
        </div>
        
        {/* Speaker Grille Detail */}
        <div className="absolute -right-4 bottom-12 w-8 flex flex-col gap-1 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-0.5 bg-white rounded-full" />
          ))}
        </div>
      </div>
      
      {/* Volume Tooltip */}
      <AnimatePresence>
        {volume !== 50 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 text-center"
          >
            <span className="px-3 py-1 bg-white rounded-full text-[10px] font-bold text-onyx shadow-sm border border-black/5 uppercase tracking-widest">
              Volume: {Math.round(volume)}%
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
