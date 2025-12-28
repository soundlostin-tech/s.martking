"use client";

import { useState, useEffect } from "react";
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
      {/* TV Casing - Onyx/Carbon-black gradient with 28px radius */}
      <div className="relative bg-gradient-to-br from-onyx to-carbon-black rounded-[28px] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.3)] border-4 border-onyx/20 overflow-hidden">
        
        {/* Screen Area - 16:9 inset with 8px bezel */}
        <div className="relative aspect-video bg-[#0a0a0a] rounded-[20px] overflow-hidden border-[8px] border-charcoal-brown/10 shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]">
          <AnimatePresence mode="wait">
            {channelOn && streamUrl ? (
              <motion.div
                key="on"
                initial={{ opacity: 0, scale: 0.9, filter: "brightness(2) blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "brightness(1) blur(0px)" }}
                exit={{ opacity: 0, scale: 1.1, filter: "brightness(2) blur(20px)" }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className="absolute inset-0"
              >
                <iframe
                  src={streamUrl}
                  className="w-full h-full"
                  allow="autoplay; encrypted-media"
                />
                {/* CRT & Scanline Effects */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%] opacity-30" />
                <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_80px_rgba(0,0,0,0.6)]" />
                <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
              </motion.div>
            ) : (
              <motion.div
                key="off"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-[#111111]"
              >
                {/* NO SIGNAL Pattern */}
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://media.giphy.com/media/oEI9uWUicKgR6L5fX0/giphy.gif')] bg-cover mix-blend-screen" />
                <div className="relative z-10 flex flex-col items-center gap-6">
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-6 py-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md"
                  >
                    <p className="text-[12px] font-black text-white/40 uppercase tracking-[0.5em] text-center">NO SIGNAL</p>
                  </motion.div>
                  <div className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/10 animate-pulse" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white/10 animate-pulse delay-75" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white/10 animate-pulse delay-150" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Lower Control Section */}
        <div className="mt-8 flex items-end justify-between px-3">
          
          {/* LED & Branding (Left) */}
          <div className="flex flex-col gap-4 pb-2">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-white/10 uppercase tracking-[0.3em] mb-1">ARENA-VISUAL</span>
              <div className="flex items-center gap-3">
                <motion.div 
                  animate={channelOn ? { 
                    backgroundColor: "#D7FD03",
                    boxShadow: "0 0 15px rgba(215,253,3,0.6)",
                    scale: [1, 1.25, 1]
                  } : { 
                    backgroundColor: "#FF3B30",
                    boxShadow: "0 0 5px rgba(255,59,48,0.2)",
                    scale: 1
                  }}
                  transition={channelOn ? { repeat: Infinity, duration: 1.5, ease: "easeInOut" } : {}}
                  className="w-2.5 h-2.5 rounded-full shadow-inner"
                />
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-widest transition-colors",
                  channelOn ? "text-lime-yellow" : "text-white/20"
                )}>
                  {channelOn ? 'ON AIR' : 'OFFLINE'}
                </span>
              </div>
            </div>
          </div>

          {/* Interaction Knobs (Center-Right) */}
          <div className="flex items-center gap-8 bg-black/20 p-4 rounded-[24px] border border-white/5">
            {/* CH Knob (Left side of control cluster) */}
            <div className="flex flex-col items-center gap-2">
              <motion.button
                animate={{ rotate: isRotatingCH ? (channelOn ? 0 : 45) : (channelOn ? 45 : 0) }}
                onClick={handleChannelToggle}
                className="w-14 h-14 rounded-full bg-gradient-to-b from-charcoal-brown to-onyx border-[6px] border-carbon-black shadow-[0_10px_20px_rgba(0,0,0,0.4)] flex items-center justify-center relative active:scale-90 transition-all hover:brightness-110"
              >
                <div className="absolute top-1 w-1 h-3 bg-white/10 rounded-full" />
                <Power size={18} className={cn("transition-colors", channelOn ? "text-lime-yellow" : "text-white/20")} strokeWidth={3} />
              </motion.button>
              <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">CH</span>
            </div>

            {/* VOL Knob (Right side of control cluster) */}
            <div className="flex flex-col items-center gap-2">
              <motion.div
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                onDrag={(e, info) => {
                  const delta = info.delta.y;
                  setVolume(prev => Math.max(0, Math.min(100, prev - delta)));
                }}
                animate={{ rotate: (volume / 100) * 270 - 135 }}
                className="w-14 h-14 rounded-full bg-gradient-to-b from-charcoal-brown to-onyx border-[6px] border-carbon-black shadow-[0_10px_20px_rgba(0,0,0,0.4)] flex items-center justify-center relative cursor-ns-resize hover:brightness-110"
              >
                <div className="absolute top-1 w-1 h-3 bg-white/10 rounded-full" />
                <Volume2 size={18} className="text-white/20" strokeWidth={3} />
              </motion.div>
              <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">VOL</span>
            </div>
          </div>
          
          {/* Speaker Grille Detail (Far Right) */}
          <div className="flex flex-col gap-1.5 opacity-20 pr-1 pb-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-0.5 w-6 bg-white rounded-full" />
            ))}
          </div>
        </div>
      </div>
      
      {/* Volume Feedback */}
      <AnimatePresence>
        {volume !== 50 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 text-center"
          >
            <span className="px-4 py-2 bg-onyx text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl border border-white/5">
              Level: {Math.round(volume)}%
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
