"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2 } from "lucide-react";

interface VintageTVProps {
  streamUrl?: string;
  isOn?: boolean;
  onToggle?: (isOn: boolean) => void;
  title?: string;
}

export function VintageTV({ streamUrl, isOn = false, onToggle, title }: VintageTVProps) {
  const [volume, setVolume] = useState(50);
  const [channelOn, setChannelOn] = useState(isOn);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    setChannelOn(isOn);
  }, [isOn]);

  const handleChannelToggle = () => {
    const newState = !channelOn;
    setChannelOn(newState);
    onToggle?.(newState);
  };

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const newVolume = Math.max(0, Math.min(100, 100 - (y / rect.height) * 100));
    setVolume(newVolume);
  };

  return (
    <div className="vintage-tv w-full max-w-md mx-auto">
      {/* Antennas */}
      <div className="flex justify-center gap-16 mb-2">
        <div className="w-1 h-16 bg-gradient-to-t from-[#6B5344] to-[#4A3A2A] rounded-full transform -rotate-12 origin-bottom" />
        <div className="w-1 h-16 bg-gradient-to-t from-[#6B5344] to-[#4A3A2A] rounded-full transform rotate-12 origin-bottom" />
      </div>

      {/* TV Cabinet */}
      <div className="relative bg-gradient-to-b from-[#8B7355] via-[#7A6349] to-[#6B5344] rounded-[28px] p-4 shadow-2xl border-4 border-[#5A4334]">
        {/* Golden Trim */}
        <div className="absolute inset-3 rounded-[24px] border border-[#C4A87C]/30 pointer-events-none" />
        
        {/* Screen Area */}
        <div className="vintage-tv-screen aspect-video rounded-[16px] overflow-hidden relative bg-black mb-4">
          <AnimatePresence mode="wait">
            {channelOn && streamUrl ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0"
              >
                <iframe
                  src={streamUrl}
                  className="w-full h-full"
                  allow="autoplay; encrypted-media"
                />
                {/* Scanlines overlay */}
                <div className="scanlines absolute inset-0 pointer-events-none" />
                {/* CRT Glass reflection */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center"
              >
                {/* Static noise */}
                <div className="tv-static absolute inset-0 opacity-30" />
                <div className="scanlines absolute inset-0 pointer-events-none" />
                
                {/* No Signal text */}
                <div className="relative z-10 text-center">
                  <p className="text-[#888] text-sm font-mono tracking-widest">NO SIGNAL</p>
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-[#888] rounded-full animate-pulse" />
                    <div className="w-2 h-2 bg-[#888] rounded-full animate-pulse delay-100" />
                    <div className="w-2 h-2 bg-[#888] rounded-full animate-pulse delay-200" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Control Panel */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-b from-[#6B5344] to-[#5A4334] rounded-xl">
          {/* Brand Badge */}
          <div className="flex flex-col">
            <span className="text-[8px] text-[#C4A87C] font-bold uppercase tracking-[0.2em]">Smartking's</span>
            <span className="text-[10px] text-[#C4A87C]/70 font-medium uppercase tracking-wider">Arena TV</span>
          </div>

          {/* LED Indicator */}
          <div className="flex items-center gap-3">
            <div className={channelOn ? "led-on" : "led-off"} />
            <span className="text-[8px] text-[#C4A87C]/60 uppercase tracking-wider">
              {channelOn ? "ON AIR" : "OFF"}
            </span>
          </div>

          {/* Knobs */}
          <div className="flex items-center gap-4">
            {/* Channel Knob */}
            <motion.button
              whileTap={{ scale: 0.9, rotate: 45 }}
              onClick={handleChannelToggle}
              className="vintage-tv-knob flex items-center justify-center"
            >
              <span className="text-[8px] text-[#5A4334] font-bold">CH</span>
            </motion.button>

            {/* Volume Knob */}
            <div className="relative">
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="vintage-tv-knob flex items-center justify-center"
                style={{ transform: `rotate(${volume * 2.7 - 135}deg)` }}
              >
                <div className="w-1 h-3 bg-[#5A4334] rounded-full transform -translate-y-1" />
              </motion.div>
              <Volume2 size={10} className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[#C4A87C]/60" />
            </div>
          </div>
        </div>
      </div>

      {/* Now Playing Info */}
      <AnimatePresence>
        {channelOn && title && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-4 bg-white rounded-[20px] p-4 shadow-lg border border-[#C8C8C4]/20"
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-[#D7FD03] rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-[#11130D] uppercase tracking-wide">{title}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
