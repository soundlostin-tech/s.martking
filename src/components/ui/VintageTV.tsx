"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Power } from "lucide-react";

interface VintageTVProps {
  streamUrl?: string;
  isOn?: boolean;
  onToggle?: (isOn: boolean) => void;
  title?: string;
}

export function VintageTV({ streamUrl, isOn = false, onToggle, title }: VintageTVProps) {
  const [volume, setVolume] = useState(50);
  const [channelOn, setChannelOn] = useState(isOn);

  useEffect(() => {
    setChannelOn(isOn);
  }, [isOn]);

  const handleChannelToggle = () => {
    const newState = !channelOn;
    setChannelOn(newState);
    onToggle?.(newState);
  };

  return (
    <div className="vintage-tv w-full max-w-md mx-auto relative group">
      {/* Decorative Sticker: "LIVE ARENA" */}
      <div className="absolute -top-6 -left-4 z-20 rotate-[-12deg]">
        <div className="bg-lime-yellow text-onyx px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg border-2 border-white">
          Live Arena
        </div>
      </div>

      {/* Antennas */}
      <div className="flex justify-center gap-16 mb-2">
        <div className="w-1.5 h-20 bg-onyx rounded-full transform -rotate-12 origin-bottom shadow-sm" />
        <div className="w-1.5 h-20 bg-onyx rounded-full transform rotate-12 origin-bottom shadow-sm" />
      </div>

      {/* TV Cabinet - Clean, Bold Design */}
      <div className="relative bg-onyx rounded-[44px] p-6 shadow-[0_32px_80px_rgba(0,0,0,0.3)] border-8 border-carbon-black">
        {/* Screen Area */}
        <div className="vintage-tv-screen aspect-video rounded-[24px] overflow-hidden relative bg-[#050505] mb-6 border-4 border-carbon-black">
          <AnimatePresence mode="wait">
            {channelOn && streamUrl ? (
              <motion.div
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8, filter: "brightness(2)" }}
                className="absolute inset-0"
              >
                <iframe
                  src={streamUrl}
                  className="w-full h-full"
                  allow="autoplay; encrypted-media"
                />
                <div className="scanlines absolute inset-0 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center"
              >
                <div className="tv-static absolute inset-0 opacity-20" />
                <div className="scanlines absolute inset-0 pointer-events-none" />
                
                <div className="relative z-10 text-center px-8 py-4 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10">
                  <p className="text-white/40 text-[10px] font-black tracking-[0.3em] uppercase">No Signal</p>
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-lime-yellow rounded-full animate-pulse" />
                    <div className="w-2 h-2 bg-lime-yellow/40 rounded-full animate-pulse delay-150" />
                    <div className="w-2 h-2 bg-lime-yellow/20 rounded-full animate-pulse delay-300" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Control Panel */}
        <div className="flex items-center justify-between px-2">
          {/* LED & Labels */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <div className={channelOn ? "led-on" : "led-off"} />
              <span className={`text-[9px] font-black uppercase tracking-widest ${channelOn ? "text-lime-yellow" : "text-white/20"}`}>
                {channelOn ? "On Air" : "Offline"}
              </span>
            </div>
            <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.1em]">SK Arena Model-X</div>
          </div>

          {/* Knobs Area */}
          <div className="flex items-center gap-6">
            {/* Volume Knob */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="w-12 h-12 rounded-full bg-gradient-to-b from-charcoal to-carbon-black border-2 border-white/10 shadow-lg cursor-pointer flex items-center justify-center"
                  style={{ transform: `rotate(${volume * 2.4 - 120}deg)` }}
                  onPan={(e, info) => {
                    const newVol = Math.max(0, Math.min(100, volume + info.delta.x));
                    setVolume(newVol);
                  }}
                >
                  <div className="w-1 h-3 bg-lime-yellow rounded-full transform -translate-y-2 shadow-[0_0_8px_rgba(215,253,3,0.5)]" />
                </motion.div>
              </div>
              <span className="text-[8px] font-black text-white/40 uppercase">VOL</span>
            </div>

            {/* CH Power Knob */}
            <div className="flex flex-col items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.9, rotate: 90 }}
                onClick={handleChannelToggle}
                className={`w-14 h-14 rounded-full flex items-center justify-center border-2 shadow-xl transition-all ${
                  channelOn 
                    ? "bg-lime-yellow border-white text-onyx shadow-[0_0_20px_rgba(215,253,3,0.3)]" 
                    : "bg-charcoal border-white/10 text-white/20"
                }`}
              >
                <Power size={24} strokeWidth={3} />
              </motion.button>
              <span className="text-[8px] font-black text-white/40 uppercase">Power</span>
            </div>
          </div>
        </div>
      </div>

      {/* Shadow under TV */}
      <div className="w-[80%] h-4 bg-black/20 blur-xl rounded-full mx-auto mt-4" />
    </div>
  );
}
