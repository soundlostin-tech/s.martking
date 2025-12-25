"use client";

import { HeroSection } from "@/components/layout/HeroSection";
import { AdminNav } from "@/components/layout/AdminNav";
import { Badge } from "@/components/ui/badge";
import { PillButton } from "@/components/ui/PillButton";
import { Play, Pause, Square, ExternalLink } from "lucide-react";

export default function AdminLive() {
  return (
    <main className="min-h-screen pb-24 bg-stone-100">
      <HeroSection 
        title="Live Monitoring" 
        subtitle="Monitor all active tournament sessions."
        className="mx-0 rounded-none pb-24"
      />

      <div className="px-6 -mt-12 relative z-10 flex flex-col gap-6">
        <div className="bg-onyx rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-6">
              <Badge className="bg-lime-yellow text-onyx animate-pulse">ACTIVE</Badge>
              <p className="text-sm font-heading">Match #FF-9021</p>
            </div>
            <h2 className="text-3xl font-heading mb-2">Grand Finale: Pro League</h2>
            <p className="text-sm opacity-60 mb-8">12 Squads • 48 Players • Map: Bermuda</p>
            
            <div className="flex gap-3">
              <PillButton className="flex-1 text-xs py-2 bg-white/10 hover:bg-white/20 border-white/20 text-white flex items-center justify-center gap-2">
                <Pause size={14} /> Pause
              </PillButton>
              <PillButton className="flex-1 text-xs py-2 bg-red-600/80 hover:bg-red-600 text-white flex items-center justify-center gap-2">
                <Square size={14} /> End Match
              </PillButton>
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-lemon-lime/10 blur-[80px] rounded-full" />
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-heading text-xl px-2">Other Live Matches</h3>
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-[24px] p-5 border border-stone-200 shadow-sm flex justify-between items-center">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center text-onyx">
                  <Play size={20} className="fill-current" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Daily Scrims #{i+5}</h4>
                  <p className="text-[10px] text-stone-500 uppercase font-bold">In Progress • Zone {i+2}</p>
                </div>
              </div>
              <button className="p-3 bg-stone-50 rounded-full text-stone-400 hover:text-onyx transition-all">
                <ExternalLink size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <AdminNav />
    </main>
  );
}
