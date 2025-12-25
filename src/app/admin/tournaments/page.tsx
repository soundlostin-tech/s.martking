"use client";

import { HeroSection } from "@/components/layout/HeroSection";
import { AdminNav } from "@/components/layout/AdminNav";
import { PillButton } from "@/components/ui/PillButton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, MoreVertical, Edit2, Copy, Archive } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AdminTournaments() {
  return (
    <main className="min-h-screen pb-24 bg-stone-100">
      <HeroSection 
        title="Tournaments" 
        subtitle="Create and manage arena events."
        className="mx-0 rounded-none pb-24"
      >
        <div className="flex flex-col gap-4 mt-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <Input className="bg-white/10 border-white/10 text-white pl-12 rounded-full h-12" placeholder="Search events..." />
          </div>
          <PillButton className="w-full flex items-center justify-center gap-2">
            <Plus size={18} /> Create Tournament
          </PillButton>
        </div>
      </HeroSection>

      <div className="px-6 -mt-8 relative z-10 flex flex-col gap-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {["All", "Active", "Draft", "Archived"].map((f) => (
            <Badge key={f} className={`rounded-full px-4 py-1 border-none ${f === "All" ? "bg-onyx text-white" : "bg-stone-200 text-stone-500"}`}>
              {f}
            </Badge>
          ))}
        </div>

        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-[24px] p-6 border border-stone-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <Badge className="bg-lime-yellow/10 text-olive border-none rounded-full text-[10px] font-bold mb-2">SQUAD • BERMUDA</Badge>
                <h3 className="text-xl font-heading">Pro League Season {i}</h3>
                <p className="text-xs text-stone-500">Starts 28 Dec • 48/48 Slots Filled</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 text-stone-400 hover:text-onyx transition-all">
                    <MoreVertical size={20} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-2xl p-2 border-stone-200">
                  <DropdownMenuItem className="rounded-xl gap-2 font-medium"><Edit2 size={16} /> Edit</DropdownMenuItem>
                  <DropdownMenuItem className="rounded-xl gap-2 font-medium"><Copy size={16} /> Duplicate</DropdownMenuItem>
                  <DropdownMenuItem className="rounded-xl gap-2 font-medium text-red-500"><Archive size={16} /> Archive</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="flex justify-between items-end mt-6">
              <div className="flex flex-col gap-1">
                <p className="text-[10px] text-stone-400 uppercase font-bold">Prize Pool</p>
                <p className="text-lg font-heading">₹50,000</p>
              </div>
              <Badge className={i === 1 ? "bg-onyx text-white" : "bg-stone-100 text-stone-400"}>
                {i === 1 ? "ACTIVE" : "UPCOMING"}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      <AdminNav />
    </main>
  );
}
