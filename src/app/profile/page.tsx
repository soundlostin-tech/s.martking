"use client";

import { HeroSection } from "@/components/layout/HeroSection";
import { BottomNav } from "@/components/layout/BottomNav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, User, Shield, Bell, LogOut, Trophy, Target, DollarSign } from "lucide-react";

export default function Profile() {
  return (
    <main className="min-h-screen pb-24 bg-stone-100">
      <HeroSection 
        title="" 
        subtitle=""
        className="mx-0 rounded-none pb-24"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Avatar className="w-28 h-28 border-4 border-lime-yellow shadow-[0_0_20px_rgba(214,253,2,0.6)]">
              <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop" />
              <AvatarFallback>SK</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 -right-2 bg-lime-yellow text-onyx p-1.5 rounded-full border-2 border-onyx shadow-lg">
              <Trophy size={16} />
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-3xl font-heading text-white mb-1">Smartking Elite</h2>
            <Badge className="bg-olive text-onyx border-none rounded-full px-4 py-1 text-xs font-bold uppercase tracking-widest">
              Pro Player
            </Badge>
          </div>
        </div>
      </HeroSection>

      <div className="px-6 -mt-10 relative z-10 flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-[24px] border border-stone-200 shadow-sm">
            <div className="p-2 bg-stone-100 rounded-lg w-fit mb-3 text-olive">
              <Target size={20} />
            </div>
            <p className="text-xs text-stone-500 uppercase font-medium">Win Rate</p>
            <h4 className="text-2xl font-heading">64.5%</h4>
          </div>
          <div className="bg-white p-5 rounded-[24px] border border-stone-200 shadow-sm">
            <div className="p-2 bg-stone-100 rounded-lg w-fit mb-3 text-olive">
              <DollarSign size={20} />
            </div>
            <p className="text-xs text-stone-500 uppercase font-medium">Earnings</p>
            <h4 className="text-2xl font-heading">₹3.3L</h4>
          </div>
        </div>

        <div className="bg-alabaster-grey-2 rounded-[24px] border border-stone-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-stone-300">
            <h3 className="font-heading text-xl">Personal Info</h3>
          </div>
          <div className="p-2">
            {[
              { label: "Full Name", value: "Smartking Elite", icon: User },
              { label: "Email", value: "smartking@arena.com", icon: Bell },
              { label: "Phone", value: "+91 98765 43210", icon: Shield },
            ].map((item, i) => (
              <button key={i} className="w-full flex justify-between items-center p-4 hover:bg-stone-200/50 rounded-2xl transition-all">
                <div className="flex items-center gap-4 text-left">
                  <div className="text-stone-400">
                    <item.icon size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-stone-500 uppercase font-bold">{item.label}</p>
                    <p className="text-sm font-medium">{item.value}</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-stone-300" />
              </button>
            ))}
          </div>
        </div>

        <div className="bg-alabaster-grey-2 rounded-[24px] border border-stone-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-stone-300">
            <h3 className="font-heading text-xl">Settings & Privacy</h3>
          </div>
          <div className="p-2">
            {[
              { label: "Edit Profile", icon: User },
              { label: "Security & Login", icon: Shield },
              { label: "Notifications", icon: Bell },
              { label: "Logout", icon: LogOut, color: "text-red-500" },
            ].map((item, i) => (
              <button key={i} className="w-full flex justify-between items-center p-4 hover:bg-stone-200/50 rounded-2xl transition-all">
                <div className="flex items-center gap-4">
                  <div className={item.color || "text-stone-400"}>
                    <item.icon size={20} />
                  </div>
                  <span className={`text-sm font-medium ${item.color || "text-onyx"}`}>{item.label}</span>
                </div>
                <ChevronRight size={18} className="text-stone-300" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
