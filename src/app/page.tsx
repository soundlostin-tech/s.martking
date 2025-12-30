"use client";

import { motion } from "framer-motion";
import { BottomNav } from "@/components/layout/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { 
  Trophy, ChevronRight, Users, Play, TrendingUp, Award, Plus,
  Wallet, Zap, Clock, Swords, Target, Crown
} from "lucide-react";
import { StoryViewer } from "@/components/StoryViewer";
import { StoryUpload } from "@/components/StoryUpload";
import { TopHeader } from "@/components/layout/TopHeader";
import { BentoCard } from "@/components/ui/BentoCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { user, profile, loading: authLoading } = useAuth(false);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [featuredMatches, setFeaturedMatches] = useState<any[]>([]);
  const [userStats, setUserStats] = useState({ wins: 0, rank: "-", winRate: "0%", growth: "+0%" });
  const [loading, setLoading] = useState(true);
  
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  const [activeStories, setActiveStories] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const [profilesRes, storiesRes, matchesRes] = await Promise.all([
        supabase.from("profiles").select("*").limit(15),
        supabase.from("stories")
          .select(`*, user:profiles(full_name, avatar_url)`)
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false }),
        supabase.from("matches")
          .select(`*, tournament:tournaments(title, entry_fee, prize_pool)`)
          .or('status.eq.live,status.eq.upcoming')
          .order('status', { ascending: false })
          .limit(10)
      ]);

      setProfiles(profilesRes.data || []);
      const validStories = (storiesRes.data || []).filter(s => s.user);
      setStories(validStories);
      setFeaturedMatches(matchesRes.data || []);

      if (profile) {
        setUserStats({
          wins: Math.floor((profile.matches_played || 0) * (profile.win_rate / 100)),
          winRate: `${profile.win_rate || 0}%`,
          rank: profile.rank || "#--",
          growth: "+12%"
        });
      }
    } catch (error) {
      console.error("Error fetching arena data:", error);
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openStory = (userId: string) => {
    const userStories = stories.filter(s => s.user_id === userId);
    if (userStories.length > 0) {
      setActiveStories(userStories);
      setSelectedStoryIndex(0);
      setIsViewerOpen(true);
    }
  };

  const featured = featuredMatches[0];
  const isLoading = loading || authLoading;
  const storyColors = ['#6EBF8B', '#FFCDB2', '#C9B6E4', '#A8D8EA', '#FFB6C1', '#F5E6A3'];

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#1A1A1A] relative">
      <main className="pb-[80px] relative z-10">
        <TopHeader />
        
        <section className="py-6">
          <div className="flex gap-4 overflow-x-auto no-scrollbar px-5 items-start">
            <div className="flex-shrink-0 flex flex-col items-center gap-3">
              <motion.div 
                whileTap={{ scale: 0.92 }}
                onClick={() => setIsUploadOpen(true)}
                className="relative w-[72px] h-[72px] rounded-[28px] p-[3px] bg-white shadow-sm border-2 border-dashed border-[#D1D5DB]"
              >
                <div className="w-full h-full rounded-[23px] bg-[#F9FAFB] flex items-center justify-center overflow-hidden">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="w-full h-full object-cover opacity-40" />
                  ) : (
                    <Plus size={24} strokeWidth={3} className="text-[#9CA3AF]" />
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#1A1A1A] rounded-xl border-4 border-white flex items-center justify-center shadow-lg">
                  <Plus size={14} strokeWidth={4} className="text-white" />
                </div>
              </motion.div>
              <span className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest">You</span>
            </div>

            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 flex flex-col items-center gap-3">
                  <Skeleton className="w-[72px] h-[72px] rounded-[28px]" />
                  <Skeleton className="h-2 w-10" />
                </div>
              ))
            ) : (
              profiles.filter(p => p.id !== profile?.id).map((p, index) => {
                const hasStories = stories.some(s => s.user_id === p.id);
                const color = storyColors[index % storyColors.length];
                return (
                  <div key={p.id} className="flex-shrink-0 flex flex-col items-center gap-3">
                    <motion.div 
                      whileTap={{ scale: 0.92 }}
                      onClick={() => hasStories && openStory(p.id)}
                      className="w-[72px] h-[72px] rounded-[28px] p-[3px] bg-white shadow-md border-2 transition-all duration-300"
                      style={{ 
                        borderColor: hasStories ? color : '#E5E7EB',
                        cursor: hasStories ? 'pointer' : 'default',
                        transform: hasStories ? 'rotate(-3deg)' : 'none'
                      }}
                    >
                      <div className="w-full h-full rounded-[23px] bg-[#F3F4F6] flex items-center justify-center overflow-hidden">
                        {p.avatar_url ? (
                          <img src={p.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl font-heading font-black text-[#9CA3AF]">{p.full_name?.[0]?.toUpperCase()}</span>
                        )}
                      </div>
                    </motion.div>
                    <span className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-widest">{p.full_name?.split(' ')[0]}</span>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="px-5 mb-8">
          {isLoading ? (
            <Skeleton className="h-[280px] w-full rounded-[32px]" />
          ) : featured ? (
            <BentoCard variant="purple" className="p-8 relative overflow-hidden min-h-[280px] flex flex-col group shadow-xl">
              <div className="relative z-10 flex flex-col h-full flex-grow">
                <div className="flex justify-between items-start mb-6">
                  <StatusBadge variant={featured.status as any} className="bg-[#1A1A1A] text-white px-4 py-1.5 rounded-full font-black text-[10px]" />
                  <div className="px-3 py-1 bg-white/50 backdrop-blur-md rounded-xl text-[10px] font-black text-[#1A1A1A] flex items-center gap-1.5 border border-white/20">
                    <Clock size={12} strokeWidth={3} />
                    {featured.status === 'live' ? 'LIVE NOW' : 'SOON'}
                  </div>
                </div>

                <h3 className="text-[32px] font-heading text-[#1A1A1A] leading-tight font-black mb-2 tracking-tighter">
                  {featured?.tournament?.title || "Pro League Season 4"}
                </h3>
                <div className="flex gap-2 mb-8">
                  <div className="px-3 py-1 bg-[#1A1A1A] text-white rounded-lg text-[10px] font-black uppercase tracking-widest">PRO ARENA</div>
                  <div className="px-3 py-1 bg-white/40 text-[#1A1A1A] rounded-lg text-[10px] font-black uppercase tracking-widest">SOLO</div>
                </div>
                
                <div className="flex items-center justify-between mt-auto bg-white/40 backdrop-blur-md p-5 rounded-[24px] border border-white/40 shadow-sm">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-[#1A1A1A]/60 uppercase tracking-widest mb-1">ENTRY FEE</span>
                    <span className="text-3xl font-heading text-[#1A1A1A] font-black">₹{featured?.tournament?.entry_fee}</span>
                  </div>
                  <Link href={`/matches/${featured.id}`}>
                    <motion.button 
                      whileTap={{ scale: 0.95 }}
                      className="bg-[#1A1A1A] text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl flex items-center gap-2 hover:bg-black transition-all"
                    >
                      JOIN
                      <ChevronRight size={18} strokeWidth={3} />
                    </motion.button>
                  </Link>
                </div>
              </div>
              
              <div className="absolute right-[-20px] top-[-20px] scale-[1.2] opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none">
                <Trophy size={240} strokeWidth={1} />
              </div>
            </BentoCard>
          ) : null}
        </section>

        <section className="px-5 mb-8">
          <div className="grid grid-cols-2 gap-4">
            {isLoading ? (
              <>
                <Skeleton className="h-40 rounded-[32px]" />
                <Skeleton className="h-40 rounded-[32px]" />
              </>
            ) : (
              <>
                <BentoCard variant="mint" className="p-6 h-44 flex flex-col justify-between overflow-hidden relative shadow-lg">
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-xl bg-white/50 flex items-center justify-center">
                        <Target size={16} className="text-[#1A1A1A]" />
                      </div>
                      <span className="text-[10px] font-black text-[#1A1A1A]/60 uppercase tracking-widest">WIN RATE</span>
                    </div>
                    <p className="text-4xl font-heading text-[#1A1A1A] font-black tracking-tighter">{userStats.winRate}</p>
                  </div>
                  <div className="absolute -right-6 -bottom-6 opacity-[0.05] rotate-12">
                    <Swords size={120} />
                  </div>
                </BentoCard>
                
                <BentoCard variant="peach" className="p-6 h-44 flex flex-col justify-between overflow-hidden relative shadow-lg">
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-xl bg-white/50 flex items-center justify-center">
                        <Crown size={16} className="text-[#1A1A1A]" />
                      </div>
                      <span className="text-[10px] font-black text-[#1A1A1A]/60 uppercase tracking-widest">ARENA RANK</span>
                    </div>
                    <p className="text-4xl font-heading text-[#1A1A1A] font-black tracking-tighter">{userStats.rank}</p>
                    <div className="mt-2 flex items-center gap-1">
                      <TrendingUp size={14} className="text-emerald-600" />
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{userStats.growth}</span>
                    </div>
                  </div>
                  <div className="absolute -right-6 -bottom-6 opacity-[0.05] -rotate-12">
                    <Award size={120} />
                  </div>
                </BentoCard>
              </>
            )}
          </div>
        </section>

        <section className="px-5 mb-10 overflow-x-auto no-scrollbar flex gap-4">
          {[
            { label: "BATTLE", icon: Swords, href: "/matches", color: "mint" },
            { label: "WALLET", icon: Wallet, href: "/wallet", color: "blue" },
            { label: "RANK", icon: Trophy, href: "/leaderboard", color: "pink" }
          ].map((action) => (
            <Link key={action.label} href={action.href} className="flex-shrink-0">
              <div className="bg-white shadow-md flex items-center gap-4 px-6 py-4 rounded-2xl border border-[#E5E7EB]">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  action.color === 'mint' ? 'bg-[#A8E6CF]' :
                  action.color === 'blue' ? 'bg-[#A8D8EA]' : 'bg-[#FFB6C1]'
                }`}>
                  <action.icon size={20} className="text-[#1A1A1A]" />
                </div>
                <span className="text-xs font-black text-[#1A1A1A] uppercase tracking-widest">{action.label}</span>
              </div>
            </Link>
          ))}
        </section>

        <section className="px-5 mb-10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-heading text-[#1A1A1A] font-black tracking-tight">Arena Battles</h3>
            <Link href="/matches" className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest bg-white px-3 py-1.5 rounded-lg border border-[#E5E7EB]">All Matches</Link>
          </div>
          
          <div className="flex flex-col gap-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-[24px]" />
              ))
            ) : (
              featuredMatches.slice(1, 5).map((match, idx) => {
                const colors = ["mint", "blue", "pink", "yellow", "coral", "teal"];
                const color = colors[idx % colors.length] as any;
                return (
                  <Link key={match.id} href={`/matches/${match.id}`}>
                    <BentoCard variant={color} className="p-5 flex items-center justify-between border-none shadow-md hover:translate-y-[-2px] transition-transform">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/40 flex items-center justify-center">
                          <Zap size={22} className="text-[#1A1A1A]" />
                        </div>
                        <div>
                          <h4 className="font-heading text-[#1A1A1A] font-black leading-tight text-base tracking-tight">{match.tournament?.title || "Standard Match"}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-black text-[#1A1A1A]/60 uppercase tracking-widest">₹{match.tournament?.entry_fee} ENTRY</span>
                            <span className="text-[10px] text-[#1A1A1A]/30 font-black">•</span>
                            <span className="text-[10px] font-black text-[#1A1A1A]/60 uppercase tracking-widest">SOLO</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-[#1A1A1A] text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">
                        JOIN
                      </div>
                    </BentoCard>
                  </Link>
                );
              })
            )}
          </div>
        </section>
      </main>

      <StoryViewer 
        stories={activeStories}
        initialIndex={selectedStoryIndex}
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
      />

      <StoryUpload 
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={fetchData}
      />

      <BottomNav />
    </div>
  );
}
