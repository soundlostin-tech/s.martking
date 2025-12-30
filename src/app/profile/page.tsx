"use client";

import { BottomNav } from "@/components/layout/BottomNav";
import { BentoCard } from "@/components/ui/BentoCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft,
  Settings,
  Grid,
  Play,
  Bookmark,
  Plus,
  BarChart3,
  TrendingUp,
  Target,
  Trophy,
  Share2,
  ExternalLink,
  ChevronRight,
  MoreVertical
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("grid");

  // Mock data for placeholders
  const stats = [
    { label: "Matches", value: "248" },
    { label: "Followers", value: "1.2k" },
    { label: "Following", value: "482" }
  ];

  const highlights = [
    { label: "Highlight 1" },
    { label: "Highlight 2" },
    { label: "Highlight 3" },
    { label: "Highlight 4" },
    { label: "Highlight 5" }
  ];

  const gridPosts = Array.from({ length: 9 }).map((_, i) => ({
    id: i,
    image: `https://picsum.photos/seed/${i + 100}/400/400`
  }));

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-[#5FD3BC]/30">
      <main className="pb-[80px]">
        {/* Top Navigation */}
        <header className="sticky top-0 z-50 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/5 px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-1 hover:bg-white/5 rounded-full transition-colors">
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-xl font-bold tracking-tight">Profile</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-1 hover:bg-white/5 rounded-full transition-colors">
              <Share2 size={22} />
            </button>
            <button className="p-1 hover:bg-white/5 rounded-full transition-colors">
              <Settings size={22} />
            </button>
          </div>
        </header>

        {/* Profile Header Section */}
        <section className="px-5 pt-6 pb-4">
          <div className="flex items-start justify-between">
            <div className="relative">
              <div className="w-24 h-24 rounded-full p-[3px] bg-gradient-to-tr from-[#5FD3BC] to-emerald-600 shadow-[0_0_20px_rgba(95,211,188,0.2)]">
                <div className="w-full h-full rounded-full bg-[#0A0A0A] p-[3px]">
                  <Avatar className="w-full h-full">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-[#1A1A1A] text-2xl font-bold text-white/50">
                      ?
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#5FD3BC] rounded-full border-4 border-[#0A0A0A] flex items-center justify-center text-black">
                <Plus size={16} strokeWidth={3} />
              </button>
            </div>
            
            <div className="flex-1 flex justify-around pl-4 pt-4">
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-xl font-black">{stat.value}</p>
                  <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black">Display Name Placeholder</h2>
              <div className="bg-[#5FD3BC]/10 border border-[#5FD3BC]/20 px-2 py-0.5 rounded-md">
                <span className="text-[10px] font-bold text-[#5FD3BC] uppercase tracking-tighter">Pro Player</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 font-medium mt-1">@username_placeholder</p>
          </div>

          <div className="mt-3 space-y-2">
            <p className="text-sm text-gray-300 leading-relaxed max-w-[90%]">
              This is a multi-line bio placeholder. Add your achievements, team affiliation, and gaming setup details here.
            </p>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-[#5FD3BC] text-xs font-bold">
                <ExternalLink size={14} />
                <span>external-link-placeholder.com</span>
              </div>
              <div className="flex items-center gap-2 text-[#5FD3BC] text-xs font-bold">
                <Trophy size={14} />
                <span>tournament-stats.gg/player</span>
              </div>
            </div>
          </div>
        </section>

        {/* Dashboard / Analytics Card */}
        <section className="px-5 mt-4">
          <BentoCard variant="dark" className="bg-[#111111] border border-white/5 p-4 rounded-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <BarChart3 size={64} className="text-[#5FD3BC]" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Performance Metrics</h3>
                <Link href="/analytics" className="text-[10px] font-bold text-[#5FD3BC] flex items-center gap-1">
                  VIEW ALL <ChevronRight size={12} />
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-500 font-bold uppercase">Win Rate</p>
                  <div className="flex items-center gap-1.5">
                    <Target size={14} className="text-[#5FD3BC]" />
                    <span className="text-lg font-black">68%</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-500 font-bold uppercase">Rank</p>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp size={14} className="text-purple-500" />
                    <span className="text-lg font-black">#42</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-500 font-bold uppercase">MVP</p>
                  <div className="flex items-center gap-1.5">
                    <Trophy size={14} className="text-yellow-500" />
                    <span className="text-lg font-black">12</span>
                  </div>
                </div>
              </div>
            </div>
          </BentoCard>
        </section>

        {/* Action Buttons */}
        <section className="px-5 mt-6 flex gap-3">
          <button className="flex-[2] bg-[#5FD3BC] hover:bg-[#4eb19d] text-black h-11 rounded-xl text-sm font-black transition-all active:scale-[0.98]">
            Edit Profile
          </button>
          <button className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 h-11 rounded-xl text-sm font-bold transition-all active:scale-[0.98]">
            Share
          </button>
        </section>

        {/* Highlights Strip */}
        <section className="mt-8">
          <div className="flex gap-6 overflow-x-auto no-scrollbar px-5 pb-2">
            <div className="flex flex-col items-center gap-2">
              <div className="w-[72px] h-[72px] rounded-full border-2 border-dashed border-white/20 flex items-center justify-center">
                <Plus size={24} className="text-white/40" />
              </div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">New</span>
            </div>
            {highlights.map((h, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-[72px] h-[72px] rounded-full p-[2px] border-2 border-[#1A1A1A]">
                  <div className="w-full h-full rounded-full bg-[#1A1A1A] flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-[#5FD3BC]/20 to-[#5FD3BC]/5 flex items-center justify-center">
                      <Trophy size={24} className="text-[#5FD3BC]/40" />
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{h.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Tabs and Content Grid */}
        <section className="mt-8">
          <Tabs defaultValue="grid" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="w-full bg-transparent h-12 p-0 rounded-none border-t border-b border-white/5">
              <TabsTrigger 
                value="grid" 
                className="flex-1 h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#5FD3BC] data-[state=active]:text-[#5FD3BC]"
              >
                <Grid size={20} />
              </TabsTrigger>
              <TabsTrigger 
                value="reels" 
                className="flex-1 h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#5FD3BC] data-[state=active]:text-[#5FD3BC]"
              >
                <Play size={20} />
              </TabsTrigger>
              <TabsTrigger 
                value="saved" 
                className="flex-1 h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#5FD3BC] data-[state=active]:text-[#5FD3BC]"
              >
                <Bookmark size={20} />
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="grid" className="m-0 focus-visible:ring-0">
              <div className="grid grid-cols-3 gap-[2px]">
                {gridPosts.map((post) => (
                  <motion.div 
                    key={post.id} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="aspect-square relative group cursor-pointer bg-[#111111] overflow-hidden"
                  >
                    <img src={post.image} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                      <div className="flex items-center gap-1">
                        <Trophy size={12} className="text-[#5FD3BC]" />
                        <span className="text-[10px] font-bold">WIN</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="reels" className="m-0 min-h-[300px] flex flex-col items-center justify-center text-gray-500">
              <Play size={40} className="mb-2 opacity-20" />
              <p className="text-xs font-bold uppercase tracking-widest">No Match Highlights</p>
            </TabsContent>

            <TabsContent value="saved" className="m-0 min-h-[300px] flex flex-col items-center justify-center text-gray-500">
              <Bookmark size={40} className="mb-2 opacity-20" />
              <p className="text-xs font-bold uppercase tracking-widest">No Saved Content</p>
            </TabsContent>
          </Tabs>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
