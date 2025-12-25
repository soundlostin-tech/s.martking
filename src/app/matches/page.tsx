"use client";

import { HeroSection } from "@/components/layout/HeroSection";
import { BottomNav } from "@/components/layout/BottomNav";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Swords, Calendar, Users } from "lucide-react";

const filters = ["All", "Upcoming", "Ongoing", "Completed"];

export default function Matches() {
  const [activeFilter, setActiveFilter] = useState("All");

  return (
    <main className="min-h-screen pb-24 bg-stone-100">
      <HeroSection 
        title="Your Matches" 
        subtitle="Browse upcoming, ongoing, and completed battles."
        className="mx-0 rounded-none"
      />

      <div className="px-6 -mt-6 relative z-10">
        <div className="flex bg-stone-100 p-1.5 rounded-full border border-stone-200 overflow-x-auto no-scrollbar gap-1 shadow-md">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                activeFilter === filter 
                  ? "bg-lime-yellow text-onyx shadow-sm" 
                  : "text-stone-500 hover:text-onyx"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
        <p className="mt-4 px-2 text-xs text-stone-500 font-medium uppercase tracking-widest">
          Matches this month: <span className="text-onyx font-bold">24</span>
        </p>
      </div>

      <div className="px-6 mt-8 flex flex-col gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-alabaster-grey-2 border border-stone-200 rounded-[24px] p-6 shadow-md hover:shadow-lg transition-all">
            <div className="flex justify-between items-start mb-4">
              <div>
                <Badge className="bg-olive/10 text-olive border-none mb-2 rounded-full text-[10px] uppercase tracking-tighter">Premier League</Badge>
                <h3 className="text-xl font-heading leading-tight">Elite Squad Rush #{i}</h3>
              </div>
              <Badge className={
                i === 1 ? "bg-lime-yellow text-onyx border-none" : 
                i === 2 ? "bg-onyx text-white border-none" : 
                "bg-stone-300 text-stone-600 border-none"
              }>
                {i === 1 ? "LIVE" : i === 2 ? "UPCOMING" : "COMPLETED"}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-stone-100 rounded-lg text-stone-500">
                  <Calendar size={16} />
                </div>
                <div>
                  <p className="text-[10px] text-stone-500 uppercase">Date & Time</p>
                  <p className="text-sm font-medium">25 Dec, 08:00 PM</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-stone-100 rounded-lg text-stone-500">
                  <Users size={16} />
                </div>
                <div>
                  <p className="text-[10px] text-stone-500 uppercase">Mode</p>
                  <p className="text-sm font-medium">SQUAD Mode</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-300 flex justify-between items-center">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="w-8 h-8 rounded-full border-2 border-alabaster-grey-2 bg-stone-200 flex items-center justify-center text-[10px] font-bold">
                    P{j}
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-alabaster-grey-2 bg-onyx text-white flex items-center justify-center text-[10px] font-bold">
                  +12
                </div>
              </div>
              <button className="text-onyx font-bold text-sm flex items-center gap-1">
                Match Details <Swords size={16} className="text-lime-yellow" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <BottomNav />
    </main>
  );
}
