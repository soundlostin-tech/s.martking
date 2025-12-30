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
          growth: "+12%" // Mock growth for now
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

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#1A1A1A] relative">
      {/* Background is now global in layout via AnimatedBackground component */}
      
      <main className="pb-[80px] relative z-10">
        <TopHeader />
        
        <section className="py-4">
          <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 items-start">
            <div className="flex-shrink-0 flex flex-col items-center gap-2">
              <motion.div 
                whileTap={{ scale: 0.92 }}
                onClick={() => setIsUploadOpen(true)}
                className="relative w-16 h-16 rounded-full p-[2px] bg-white shadow-[2px_8px_16px_rgba(0,0,0,0.06)] border-2 border-dashed border-[#E5E7EB]"
              >
                <div className="w-full h-full rounded-full bg-[#F5F5F5] flex items-center justify-center overflow-hidden">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="w-full h-full object-cover opacity-40" />
                  ) : (
                    <Plus size={24} strokeWidth={3} className="text-[#6B7280]" />
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#1A1A1A] rounded-full border-2 border-white flex items-center justify-center shadow-md">
                  <Plus size={14} strokeWidth={4} className="text-white" />
                </div>
              </motion.div>
              <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wide">You</span>
            </div>

            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2">
                  <Skeleton className="w-16 h-16 rounded-full" />
                  <Skeleton className="h-2 w-10" />
                </div>
              ))
            ) : (
              profiles.filter(p => p.id !== profile?.id).map((p) => {
                const hasStories = stories.some(s => s.user_id === p.id);
                return (
                  <div key={p.id} className="flex-shrink-0 flex flex-col items-center gap-2">
                    <motion.div 
                      whileTap={{ scale: 0.92 }}
                      onClick={() => hasStories && openStory(p.id)}
                      className={`w-16 h-16 rounded-full p-[2px] bg-white shadow-[2px_8px_16px_rgba(0,0,0,0.06)] border-2 ${
                        hasStories ? 'border-[#5FD3BC] cursor-pointer' : 'border-[#E5E7EB] cursor-default opacity-60'
                      }`}
                    >
                      <div className="w-full h-full rounded-full bg-[#E5E7EB] flex items-center justify-center overflow-hidden">
                        {p.avatar_url ? (
                          <img src={p.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg font-heading text-[#6B7280]">{p.full_name?.[0]?.toUpperCase()}</span>
                        )}
                      </div>
                    </motion.div>
                    <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wide">{p.full_name?.split(' ')[0]}</span>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="px-4 mb-6">
          {isLoading ? (
            <Skeleton className="h-[260px] w-full rounded-3xl" />
          ) : featured ? (
            <BentoCard variant="vibrant" className="p-6 relative overflow-hidden min-h-[260px] flex flex-col">
              <div className="relative z-10 flex flex-col h-full flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <StatusBadge variant={featured.status as any} className="bg-[#1A1A1A] text-white" />
                  <div className="px-3 py-1 bg-white/30 backdrop-blur-md rounded-full text-[10px] font-bold text-[#1A1A1A] flex items-center gap-1.5 border border-white/20">
                    <Clock size={12} strokeWidth={3} />
                    {featured.status === 'live' ? 'Live — elapsed 02:45:12' : 'Starts in 02:45:12'}
                  </div>
                </div>

                <h3 className="text-[28px] font-heading text-[#1A1A1A] leading-tight font-black mb-1">
                  {featured?.tournament?.title || "Pro League Season 4"}
                </h3>
                <div className="flex gap-2 mb-6">
                  <div className="px-3 py-1 bg-[#1A1A1A] text-white rounded-lg text-[10px] font-bold uppercase tracking-wider">SOLO MATCH</div>
                </div>
                
                  <div className="flex items-center justify-between mt-auto bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-white/50">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-[#1A1A1A]/70 uppercase tracking-widest mb-1">Entry Fee</span>
                      <span className="text-3xl font-heading text-[#1A1A1A] font-black">₹{featured?.tournament?.entry_fee}</span>
                    </div>
                    <Link href={`/matches/${featured.id}`}>
                      <motion.button 
                        whileTap={{ scale: 0.95 }}
                        className="bg-[#1A1A1A] text-white px-10 py-5 rounded-xl font-bold text-base shadow-[0_10px_20px_rgba(0,0,0,0.2)] flex items-center gap-2 hover:bg-[#2A2A2A] transition-colors focus:outline-none focus:ring-2 focus:ring-[#5FD3BC] focus:ring-offset-2"
                        aria-label="Join this match now"
                      >
                        Join Now
                        <ChevronRight size={20} strokeWidth={3} />
                      </motion.button>
                    </Link>
                  </div>

                <div className="mt-4 pt-3 border-t border-black/5 flex justify-between items-center">
                  <div className="flex gap-4">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-bold text-[#1A1A1A]/40 uppercase tracking-tight">Your Win Rate</span>
                      <span className="text-[12px] font-bold text-[#1A1A1A]">{userStats.winRate}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] font-bold text-[#1A1A1A]/40 uppercase tracking-tight">Rank</span>
                      <span className="text-[12px] font-bold text-[#1A1A1A]">{userStats.rank}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] font-bold text-[#1A1A1A]/40 uppercase tracking-tight">Δ Growth</span>
                      <span className="text-[12px] font-bold text-[#059669]">{userStats.growth}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[8px] font-bold text-[#1A1A1A]/40 uppercase tracking-tight">Prize Pool</span>
                    <span className="text-[12px] font-bold text-[#1A1A1A]">₹{featured?.tournament?.prize_pool?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="absolute right-[-30px] top-[-30px] scale-[1.4] opacity-[0.03] pointer-events-none">
                <Trophy size={200} strokeWidth={1} />
              </div>
            </BentoCard>
          ) : null}
        </section>

        <section className="px-4 mb-6">
          <div className="grid grid-cols-2 gap-3">
            {isLoading ? (
              <>
                <Skeleton className="h-36 rounded-3xl" />
                <Skeleton className="h-36 rounded-3xl" />
              </>
            ) : (
              <>
                <BentoCard variant="dark" className="p-4 h-36 flex flex-col justify-between overflow-hidden relative">
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <Target size={14} className="text-[#5FD3BC]" />
                      <span className="text-[10px] font-bold text-white/60 uppercase tracking-wide">Win Rate</span>
                    </div>
                    <p className="text-2xl font-heading text-white font-bold">{userStats.winRate}</p>
                  </div>
                  <div className="h-8 flex items-end gap-1 relative z-10">
                    {[40, 70, 45, 90, 60, 80, 55].map((h, i) => (
                      <div key={i} className="flex-1 bg-[#5FD3BC]/30 rounded-t-sm" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                  <div className="absolute -right-4 -top-4 opacity-5">
                    <Swords size={100} />
                  </div>
                </BentoCard>
                
                <BentoCard variant="pastel" pastelColor="lavender" className="p-4 h-36 flex flex-col justify-between overflow-hidden relative">
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown size={14} className="text-[#1A1A1A]/60" />
                      <span className="text-[10px] font-bold text-[#1A1A1A]/60 uppercase tracking-wide">Current Rank</span>
                    </div>
                    <p className="text-2xl font-heading text-[#1A1A1A] font-bold">{userStats.rank}</p>
                    <div className="mt-1 flex items-center gap-1">
                      <TrendingUp size={12} className="text-[#5FD3BC]" />
                      <span className="text-[10px] font-bold text-[#5FD3BC] uppercase">{userStats.growth} this week</span>
                    </div>
                  </div>
                  <div className="absolute -right-4 -bottom-4 opacity-10">
                    <Award size={80} />
                  </div>
                </BentoCard>
              </>
            )}
          </div>
        </section>

        <section className="px-4 mb-6 overflow-x-auto no-scrollbar flex gap-3">
          {[
            { label: "Join Match", icon: Swords, href: "/matches", color: "mint" },
            { label: "Add Funds", icon: Wallet, href: "/wallet", color: "peach" },
            { label: "Leaderboard", icon: Trophy, href: "/leaderboard", color: "sky" }
          ].map((action) => (
            <Link key={action.label} href={action.href} className="flex-shrink-0">
              <div className="bg-white shadow-[2px_8px_16px_rgba(0,0,0,0.06)] flex items-center gap-3 px-4 py-3 rounded-lg touch-target">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  action.color === 'mint' ? 'bg-[#D1FAE5]' :
                  action.color === 'peach' ? 'bg-[#FFEDD5]' : 'bg-[#E0F2FE]'
                }`}>
                  <action.icon size={16} className="text-[#1A1A1A]" />
                </div>
                <span className="text-sm font-bold text-[#1A1A1A]">{action.label}</span>
              </div>
            </Link>
          ))}
        </section>

        <section className="px-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-heading text-[#1A1A1A] font-bold">Upcoming</h3>
            <Link href="/matches" className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wide">See All</Link>
          </div>
          
          <div className="flex flex-col gap-3">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-2xl" />
              ))
            ) : (
              featuredMatches.slice(1, 4).map((match) => (
                <Link key={match.id} href={`/matches/${match.id}`}>
                  <BentoCard className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#D1FAE5] flex items-center justify-center">
                        <Zap size={18} className="text-[#1A1A1A]" />
                      </div>
                      <div>
                        <h4 className="font-heading text-[#1A1A1A] font-bold leading-tight text-sm">{match.tournament?.title || "Standard Match"}</h4>
                        <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wide mt-0.5">₹{match.tournament?.entry_fee} Entry</p>
                      </div>
                    </div>
                    <StatusBadge variant="upcoming" className="text-[9px] px-2 py-0.5" />
                  </BentoCard>
                </Link>
              ))
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
