"use client";

import { HeroSection } from "@/components/layout/HeroSection";
import { BottomNav } from "@/components/layout/BottomNav";
import { Badge } from "@/components/ui/badge";
import { AnalyticsCard } from "@/components/ui/AnalyticsCard";
import { motion } from "framer-motion";

export default function Live() {
  return (
    <main className="min-h-screen pb-24 bg-stone-100">
      <HeroSection 
        title="Live Now" 
        subtitle="Track your Free Fire tournaments in real time."
        className="mx-0 rounded-none"
      >
        <Badge className="bg-lime-yellow text-onyx px-4 py-1.5 rounded-full flex items-center gap-2 w-fit border-none">
          <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
          LIVE
        </Badge>
        
        <div className="mt-8 bg-onyx/40 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-heading text-white">Elite Pro Squads</h3>
                <p className="text-sm text-alabaster-grey/60">Match ID: #FF-2025-01</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-heading text-lime-yellow">12:45</p>
                <p className="text-xs text-alabaster-grey/60 uppercase tracking-widest">Elapsed Time</p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 flex flex-col items-center gap-2">
                <div className="w-16 h-16 bg-lime-yellow/10 rounded-full flex items-center justify-center border border-lime-yellow/30">
                  <span className="text-2xl font-heading text-lime-yellow">A</span>
                </div>
                <p className="text-sm font-medium text-white">Team Alpha</p>
                <Badge className="bg-white/10 text-white border-none">4 Kills</Badge>
              </div>

              <div className="text-2xl font-heading text-alabaster-grey/20 italic">VS</div>

              <div className="flex-1 flex flex-col items-center gap-2">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                  <span className="text-2xl font-heading text-white/40">B</span>
                </div>
                <p className="text-sm font-medium text-white">Team Bravo</p>
                <Badge className="bg-white/10 text-white border-none">2 Kills</Badge>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-lime-yellow rounded-full" />
                <span className="text-sm text-white font-medium">18 Players Alive</span>
              </div>
              <span className="text-xs text-alabaster-grey/40 uppercase tracking-tighter">Final Circle Approaching</span>
            </div>
          </div>
          {/* Animated glow */}
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-lime-yellow/20 blur-[80px] rounded-full animate-blur-pulse" />
        </div>
      </HeroSection>

      <div className="px-6 mt-8 flex flex-col gap-4">
        <h2 className="text-xl font-heading px-2">Ongoing Matches</h2>
        
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-alabaster-grey-2 border border-stone-200 rounded-[24px] p-5 shadow-md flex justify-between items-center">
            <div className="flex flex-col gap-1">
              <h4 className="font-heading text-lg">Daily Rush - Duo</h4>
              <p className="text-xs text-stone-500">ID: #DR-90{i} • SQUAD Mode</p>
              <div className="flex gap-2 mt-2">
                <div className="w-24 h-2 bg-stone-300 rounded-full overflow-hidden">
                  <div className="h-full bg-onyx w-2/3" />
                </div>
                <span className="text-[10px] text-onyx font-bold">12/18 Kills</span>
              </div>
            </div>
            <div className="text-right flex flex-col items-end gap-2">
              <Badge className="bg-onyx text-white rounded-full">Zone 4</Badge>
              <span className="text-[10px] text-stone-500 font-medium">UP NEXT</span>
            </div>
          </div>
        ))}
      </div>

      <BottomNav />
    </main>
  );
}
