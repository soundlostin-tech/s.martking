"use client";

import { HeroSection } from "@/components/layout/HeroSection";
import { BottomNav } from "@/components/layout/BottomNav";
import { AnalyticsCard } from "@/components/ui/AnalyticsCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, Bell, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="min-h-screen pb-24">
      {/* Header */}
      <div className="bg-stone-100 px-6 pt-12 pb-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 border-2 border-lime-yellow shadow-[0_0_10px_rgba(214,253,2,0.5)]">
            <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop" />
            <AvatarFallback>SK</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-heading leading-tight">Hi, Smartking</h3>
            <p className="text-xs text-stone-500">Welcome to your arena</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-2 rounded-full bg-onyx text-white">
            <Bell size={20} />
          </button>
          <button className="p-2 rounded-full bg-onyx text-white">
            <Settings size={20} />
          </button>
        </div>
      </div>

      <HeroSection 
        title="Arena Dashboard" 
        subtitle="Here's what's happening in your arena."
        className="mx-0 rounded-none"
      >
        <AnalyticsCard
          title="Gross Winnings"
          value="₹331,224.74"
          trend="+18.4%"
          variant="highlight"
          className="mt-4"
        />
      </HeroSection>

      <div className="px-6 -mt-6 relative z-20 flex flex-col gap-4">
        <AnalyticsCard
          variant="dark"
          title="Net Profit"
          value="₹331,224.74"
          subtext="After tournament costs and fees"
          className="shadow-2xl"
        />

        <div className="grid grid-cols-2 gap-4">
          <AnalyticsCard
            variant="light"
            title="Active Tournaments"
            value="12"
            subtext="3 ending today"
            showIcon={false}
          />
          <AnalyticsCard
            variant="light"
            title="Upcoming Matches"
            value="48"
            subtext="In next 24 hours"
            showIcon={false}
          />
        </div>

        <div className="bg-onyx rounded-[24px] p-6 text-white shadow-lg overflow-hidden relative">
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm font-medium opacity-60 uppercase tracking-widest">Monthly Target</p>
              <span className="text-lime-yellow font-bold">82%</span>
            </div>
            <div className="h-3 w-full bg-white/10 rounded-full mb-4">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "82%" }}
                className="h-full bg-lime-yellow rounded-full"
              />
            </div>
            <p className="text-lg font-heading">₹400,500.00 <span className="text-xs opacity-50 font-sans ml-2">to reach target</span></p>
          </div>
          {/* Decorative blurred blob */}
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-lemon-lime/20 blur-3xl rounded-full" />
        </div>

        <div className="flex flex-col gap-4 mt-2">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-heading">Recent Performance</h2>
            <button className="text-lime-yellow text-sm font-medium flex items-center gap-1">
              View All <ChevronRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <AnalyticsCard
              variant="light"
              title="Total Players"
              value="2,450"
              subtext="+120 this week"
              showIcon={false}
            />
            <AnalyticsCard
              variant="light"
              title="Win Rate"
              value="64.5%"
              subtext="Top 5% rank"
              showIcon={false}
            />
          </div>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
