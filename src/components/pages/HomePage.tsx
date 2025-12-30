"use client";

import { motion } from "framer-motion";
import { BottomNav } from "@/components/layout/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { 
  Trophy, ChevronRight, TrendingUp, Award,
  Wallet, Zap, Swords, Target, Crown
} from "lucide-react";
import { TopHeader } from "@/components/layout/TopHeader";
import { BentoCard } from "@/components/ui/BentoCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { FeedList } from "@/components/feed/FeedList";

export function HomePage() {
  const { user, profile, loading: authLoading } = useAuth(false);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [featuredMatches, setFeaturedMatches] = useState<any[]>([]);
  const [userStats, setUserStats] = useState({ wins: 0, rank: "-", winRate: "0%", growth: "+0%" });
  const [loading, setLoading] = useState(true);
  
  const fetchData = useCallback(async () => {
    try {
      const [profilesRes, matchesRes] = await Promise.all([
        supabase.from("profiles").select("*").limit(15),
        supabase.from("matches")
          .select(`*, tournament:tournaments(title, entry_fee, prize_pool)`)
          .or('status.eq.live,status.eq.upcoming')
          .order('status', { ascending: false })
          .limit(10)
      ]);

      setProfiles(profilesRes.data || []);
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

  const featured = featuredMatches[0];
  const isLoading = loading || authLoading;

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#1A1A1A] relative">
        <main className="pb-20 relative z-10">
          <TopHeader />
          
          <section className="py-2">
          <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 items-start">
            <div className="flex gap-3 items-start pr-6">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2">
                    <Skeleton className="w-14 h-14 rounded-2xl" />
                    <Skeleton className="h-2 w-8" />
                  </div>
                ))
              ) : (
                profiles.map((p) => {
                  return (
                    <div key={p.id} className="flex-shrink-0 flex flex-col items-center gap-2">
                      <Link href={`/u/${p.username || p.id}`}>
                        <motion.div 
                          whileTap={{ scale: 0.92 }}
                          className="w-14 h-14 rounded-2xl p-[2px] bg-white shadow border-2 border-[#E5E7EB] transition-all duration-300"
                        >
                          <div className="w-full h-full rounded-[14px] bg-[#F3F4F6] flex items-center justify-center overflow-hidden">
                            {p.avatar_url ? (
                              <img src={p.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-sm font-heading font-black text-[#9CA3AF]">{p.full_name?.[0]?.toUpperCase()}</span>
                            )}
                          </div>
                        </motion.div>
                      </Link>
                      <span className="text-[8px] font-black text-[#1A1A1A] uppercase tracking-wide truncate max-w-[56px]">{p.full_name?.split(' ')[0]}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>

        <section className="px-4 mb-4">
          {isLoading ? (
            <Skeleton className="h-[180px] w-full rounded-2xl" />
          ) : featured ? (
            <BentoCard variant="purple" size="default" className="relative overflow-hidden min-h-[180px] flex flex-col shadow-lg">
              <div className="relative z-10 flex flex-col h-full flex-grow">
                <div className="flex justify-between items-start mb-3">
                  <StatusBadge variant={featured.status as any} className="bg-[#1A1A1A] text-white px-2.5 py-1 rounded-full font-black text-[8px] tracking-wide" />
                  <div className="px-2 py-1 bg-white/50 backdrop-blur rounded-lg text-[8px] font-black text-[#1A1A1A] flex items-center gap-1.5 border border-white/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    {featured.status === 'live' ? 'LIVE' : 'SOON'}
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl font-heading text-[#1A1A1A] leading-tight font-black mb-2 tracking-tight">
                  {featured?.tournament?.title || "Pro League Season 4"}
                </h3>
                <div className="flex gap-1.5 mb-4">
                  <div className="px-2 py-1 bg-[#1A1A1A] text-white rounded text-[7px] font-black uppercase tracking-wide">PRO</div>
                  <div className="px-2 py-1 bg-white/40 text-[#1A1A1A] rounded text-[7px] font-black uppercase tracking-wide">SOLO</div>
                </div>
                
                <div className="flex items-center justify-between mt-auto bg-white/40 backdrop-blur p-3 rounded-xl border border-white/40 gap-3">
                  <div className="flex flex-col min-w-0">
                    <span className="text-[8px] font-black text-[#1A1A1A]/60 uppercase tracking-wide mb-0.5">ENTRY</span>
                    <span className="text-xl font-heading text-[#1A1A1A] font-black leading-none">₹{featured?.tournament?.entry_fee}</span>
                  </div>
                  <Link href={`/matches/${featured.id}`}>
                    <motion.button 
                      whileTap={{ scale: 0.95 }}
                      className="bg-[#1A1A1A] text-white h-10 px-5 rounded-xl font-black text-xs shadow-lg flex items-center gap-2"
                    >
                      JOIN
                      <ChevronRight size={14} strokeWidth={3} />
                    </motion.button>
                  </Link>
                </div>
              </div>
            
              <div className="absolute right-[-10px] top-[-10px] scale-[0.8] opacity-[0.03] pointer-events-none">
                <Trophy size={140} strokeWidth={1} />
              </div>
            </BentoCard>
          ) : null}
        </section>

        <section className="px-4 mb-4">
          <div className="grid grid-cols-2 gap-3">
            {isLoading ? (
              <>
                <Skeleton className="h-28 rounded-2xl" />
                <Skeleton className="h-28 rounded-2xl" />
              </>
            ) : (
              <>
                <BentoCard variant="mint" size="compact" className="h-28 flex flex-col justify-between overflow-hidden relative shadow">
                  <div className="relative z-10">
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="w-6 h-6 rounded-lg bg-white/50 flex items-center justify-center">
                        <Target size={12} className="text-[#1A1A1A]" />
                      </div>
                      <span className="text-[8px] font-black text-[#1A1A1A]/60 uppercase tracking-wide">WIN RATE</span>
                    </div>
                    <p className="text-2xl font-heading text-[#1A1A1A] font-black tracking-tight">{userStats.winRate}</p>
                  </div>
                  <div className="absolute -right-4 -bottom-4 opacity-[0.05] rotate-12">
                    <Swords size={60} />
                  </div>
                </BentoCard>
                
                <BentoCard variant="peach" size="compact" className="h-28 flex flex-col justify-between overflow-hidden relative shadow">
                  <div className="relative z-10">
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="w-6 h-6 rounded-lg bg-white/50 flex items-center justify-center">
                        <Crown size={12} className="text-[#1A1A1A]" />
                      </div>
                      <span className="text-[8px] font-black text-[#1A1A1A]/60 uppercase tracking-wide">RANK</span>
                    </div>
                    <p className="text-2xl font-heading text-[#1A1A1A] font-black tracking-tight">{userStats.rank}</p>
                    <div className="mt-1 flex items-center gap-1">
                      <TrendingUp size={10} className="text-emerald-600" />
                      <span className="text-[8px] font-black text-emerald-600 uppercase tracking-wide">{userStats.growth}</span>
                    </div>
                  </div>
                  <div className="absolute -right-4 -bottom-4 opacity-[0.05] -rotate-12">
                    <Award size={60} />
                  </div>
                </BentoCard>
              </>
            )}
          </div>
        </section>

        <section className="px-4 mb-4 overflow-x-auto no-scrollbar flex gap-2">
          {[
            { label: "BATTLE", icon: Swords, href: "/matches", color: "mint" },
            { label: "WALLET", icon: Wallet, href: "/wallet", color: "blue" },
            { label: "RANK", icon: Trophy, href: "/leaderboard", color: "pink" }
          ].map((action) => (
            <Link key={action.label} href={action.href} className="flex-shrink-0">
              <div className="bg-white shadow flex items-center gap-3 px-4 py-2.5 rounded-xl border border-[#E5E7EB]">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  action.color === 'mint' ? 'bg-[#A8E6CF]' :
                  action.color === 'blue' ? 'bg-[#A8D8EA]' : 'bg-[#FFB6C1]'
                }`}>
                  <action.icon size={14} className="text-[#1A1A1A]" />
                </div>
                <span className="text-[9px] font-black text-[#1A1A1A] uppercase tracking-wide">{action.label}</span>
              </div>
            </Link>
          ))}
        </section>

        <section className="px-4 mb-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-heading text-[#1A1A1A] font-black tracking-tight">Arena Battles</h3>
            <Link href="/matches" className="text-[8px] font-black text-[#6B7280] uppercase tracking-wide bg-white px-2.5 py-1 rounded-lg border border-[#E5E7EB]">All</Link>
          </div>
          
          <div className="flex flex-col gap-2.5">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))
            ) : (
              featuredMatches.slice(1, 4).map((match, idx) => {
                const colors = ["mint", "blue", "pink", "yellow", "coral", "teal"];
                const color = colors[idx % colors.length] as any;
                return (
                  <Link key={match.id} href={`/matches/${match.id}`}>
                    <BentoCard variant={color} size="compact" className="flex items-center justify-between border-none shadow">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-white/40 flex items-center justify-center flex-shrink-0">
                          <Zap size={16} className="text-[#1A1A1A]" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-heading text-[#1A1A1A] font-black leading-tight text-sm tracking-tight truncate">{match.tournament?.title || "Standard Match"}</h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[8px] font-black text-[#1A1A1A]/60 uppercase tracking-wide">₹{match.tournament?.entry_fee}</span>
                            <span className="text-[8px] text-[#1A1A1A]/30 font-black">•</span>
                            <span className="text-[8px] font-black text-[#1A1A1A]/60 uppercase tracking-wide">SOLO</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-[#1A1A1A] text-white px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-wide shadow flex-shrink-0">
                        JOIN
                      </div>
                    </BentoCard>
                  </Link>
                );
              })
            )}
          </div>
        </section>

        <section className="px-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-heading text-[#1A1A1A] font-black tracking-tight">Player Feed</h3>
            <Link href="/feed" className="text-[8px] font-black text-[#6B7280] uppercase tracking-wide bg-white px-2.5 py-1 rounded-lg border border-[#E5E7EB]">View All</Link>
          </div>
          
          <FeedList userId={user?.id} />
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
