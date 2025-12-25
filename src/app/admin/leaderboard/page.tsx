"use client";

import { HeroSection } from "@/components/layout/HeroSection";
import { AdminNav } from "@/components/layout/AdminNav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Medal, Star, TrendingUp } from "lucide-react";

export default function AdminLeaderboard() {
  return (
    <main className="min-h-screen pb-24 bg-stone-100">
      <HeroSection 
        title="Leaderboard" 
        subtitle="Top players in your arena."
        className="mx-0 rounded-none pb-32"
      >
        <div className="mt-4">
          <Select defaultValue="pro-league">
            <SelectTrigger className="bg-white/10 border-white/10 text-white rounded-full">
              <SelectValue placeholder="Select Tournament" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-stone-200">
              <SelectItem value="pro-league" className="rounded-xl">Pro League Season 4</SelectItem>
              <SelectItem value="daily-rush" className="rounded-xl">Daily Rush Duo</SelectItem>
              <SelectItem value="elite-scrims" className="rounded-xl">Elite Scrims</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </HeroSection>

      <div className="px-6 -mt-24 relative z-10 flex flex-col gap-6">
        <div className="bg-onyx rounded-[32px] p-8 text-white shadow-2xl border border-white/10 relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative mb-4">
              <Avatar className="w-24 h-24 border-4 border-lime-yellow">
                <AvatarImage src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop" />
                <AvatarFallback>#1</AvatarFallback>
              </Avatar>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-lime-yellow text-onyx px-3 py-1 rounded-full text-[10px] font-bold shadow-lg">
                RANK #1
              </div>
            </div>
            <h3 className="text-2xl font-heading mb-1">KillerKing_99</h3>
            <p className="text-xs text-alabaster-grey/40 uppercase tracking-widest mb-6">4520 Points • 12 Wins</p>
            
            <div className="grid grid-cols-3 w-full gap-4 pt-6 border-t border-white/10">
              <div className="text-center">
                <p className="text-[10px] opacity-40 uppercase mb-1">Kills</p>
                <p className="font-heading text-lg">242</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] opacity-40 uppercase mb-1">K/D</p>
                <p className="font-heading text-lg text-lime-yellow">4.2</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] opacity-40 uppercase mb-1">Assists</p>
                <p className="font-heading text-lg">89</p>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-lime-yellow/10 blur-[60px] rounded-full" />
        </div>

        <div className="flex flex-col gap-3">
          {[
            { rank: 2, name: "ShadowNinja", points: 4100, trend: "up", avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop" },
            { rank: 3, name: "FireStorm", points: 3850, trend: "down", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop" },
            { rank: 4, name: "Elite_Gamer", points: 3700, trend: "stable", avatar: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop" },
            { rank: 5, name: "Pro_Slayer", points: 3550, trend: "up", avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop" },
          ].map((player) => (
            <div key={player.rank} className="bg-white rounded-2xl p-4 flex justify-between items-center border border-stone-200 shadow-sm">
              <div className="flex items-center gap-4">
                <div className={`w-8 text-center font-heading text-lg ${player.rank === 2 ? "text-slate-400" : player.rank === 3 ? "text-amber-700" : "text-stone-300"}`}>
                  #{player.rank}
                </div>
                <Avatar className="w-10 h-10 border border-stone-100">
                  <AvatarImage src={player.avatar} />
                  <AvatarFallback>P{player.rank}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium text-sm">{player.name}</h4>
                  <p className="text-[10px] text-stone-500">{player.points} Points</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {player.trend === "up" ? <TrendingUp size={14} className="text-olive" /> : <div className="w-3.5 h-3.5" />}
                <Badge className="bg-stone-100 text-onyx border-none text-[10px]">VIEW</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AdminNav />
    </main>
  );
}
