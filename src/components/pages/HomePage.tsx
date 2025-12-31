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
import { cn } from "@/lib/utils";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { FeedList } from "@/components/feed/FeedList";
import { Stories } from "@/components/feed/Stories";

export function HomePage() {
  const { user, profile, loading: authLoading } = useAuth(false);
  const [featuredMatches, setFeaturedMatches] = useState<any[]>([]);
  const [userStats, setUserStats] = useState({ wins: 0, rank: "-", winRate: "0%", growth: "+0%" });
  const [loading, setLoading] = useState(true);
  
  const fetchData = useCallback(async () => {
    try {
      const matchesRes = await supabase.from("matches")
        .select(`*, tournament:tournaments(title, entry_fee, prize_pool)`)
        .or('status.eq.live,status.eq.upcoming')
        .order('status', { ascending: false })
        .limit(10);

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
      <div className="min-h-screen bg-[#FFFDF5] text-[#1A1A1A] relative">
          <main className="pb-20 relative z-10">
            <TopHeader />
            
            <Stories />
  
            <section className="px-4 mb-4">
            {isLoading ? (
              <Skeleton className="h-[180px] w-full rounded-2xl" />
            ) : featured ? (
              <BentoCard variant="purple" size="default" className="relative overflow-hidden min-h-[180px] flex flex-col shadow-lg border-none">
                <div className="relative z-10 flex flex-col h-full flex-grow">
                  <div className="flex justify-between items-start mb-3">
                    <StatusBadge variant={featured.status as any} className="bg-[#1A1A1A] text-white px-2.5 py-1 rounded-full font-black text-[8px] tracking-wide" />
                    <div className="px-2 py-1 bg-white/30 backdrop-blur rounded-lg text-[8px] font-black text-white flex items-center gap-1.5 border border-white/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      {featured.status === 'live' ? 'LIVE' : 'SOON'}
                    </div>
                  </div>
  
                  <h3 className="text-xl sm:text-2xl font-heading text-white leading-tight font-black mb-2 tracking-tight">
                    {featured?.tournament?.title || "Pro League Season 4"}
                  </h3>
                  <div className="flex gap-1.5 mb-4">
                    <div className="px-2 py-1 bg-[#1A1A1A] text-white rounded text-[7px] font-black uppercase tracking-wide">PRO</div>
                    <div className="px-2 py-1 bg-white/20 text-white rounded text-[7px] font-black uppercase tracking-wide">SOLO</div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto bg-white/20 backdrop-blur p-3 rounded-xl border border-white/20 gap-3">
                    <div className="flex flex-col min-w-0">
                      <span className="text-[8px] font-black text-white/60 uppercase tracking-wide mb-0.5">ENTRY</span>
                      <span className="text-xl font-heading text-white font-black leading-none">₹{featured?.tournament?.entry_fee}</span>
                    </div>
                    <Link href={`/matches/${featured.id}`}>
                      <motion.button 
                        whileTap={{ scale: 0.95 }}
                        className="bg-white text-[#1A1A1A] h-10 px-5 rounded-xl font-black text-xs shadow-lg flex items-center gap-2"
                      >
                        JOIN
                        <ChevronRight size={14} strokeWidth={3} />
                      </motion.button>
                    </Link>
                  </div>
                </div>
              
                <div className="absolute right-[-10px] top-[-10px] scale-[0.8] opacity-[0.1] pointer-events-none">
                  <Trophy size={140} strokeWidth={1} color="white" />
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
                  <BentoCard variant="mint" size="compact" className="h-28 flex flex-col justify-between overflow-hidden relative shadow-sm border-none">
                    <div className="relative z-10">
                      <div className="flex items-center gap-1.5 mb-2">
                        <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                          <Target size={12} className="text-white" />
                        </div>
                        <span className="text-[8px] font-black text-white/80 uppercase tracking-wide">WIN RATE</span>
                      </div>
                      <p className="text-2xl font-heading text-white font-black tracking-tight">{userStats.winRate}</p>
                    </div>
                    <div className="absolute -right-4 -bottom-4 opacity-[0.1] rotate-12">
                      <Swords size={60} color="white" />
                    </div>
                  </BentoCard>
                  
                  <BentoCard variant="peach" size="compact" className="h-28 flex flex-col justify-between overflow-hidden relative shadow-sm border-none">
                    <div className="relative z-10">
                      <div className="flex items-center gap-1.5 mb-2">
                        <div className="w-6 h-6 rounded-lg bg-black/5 flex items-center justify-center">
                          <Crown size={12} className="text-[#1A1A1A]" />
                        </div>
                        <span className="text-[8px] font-black text-[#1A1A1A]/60 uppercase tracking-wide">RANK</span>
                      </div>
                      <p className="text-2xl font-heading text-[#1A1A1A] font-black tracking-tight">{userStats.rank}</p>
                      <div className="mt-1 flex items-center gap-1">
                        <TrendingUp size={10} className="text-emerald-700" />
                        <span className="text-[8px] font-black text-emerald-700 uppercase tracking-wide">{userStats.growth}</span>
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
                <div className="bg-white shadow-sm flex items-center gap-3 px-4 py-2.5 rounded-xl border-none">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    action.color === 'mint' ? 'bg-[#4F9B8B]' :
                    action.color === 'blue' ? 'bg-[#A8D8EA]' : 'bg-[#F988A2]'
                  }`}>
                    <action.icon size={14} className={action.color === 'blue' ? "text-[#1A1A1A]" : "text-white"} />
                  </div>
                  <span className="text-[9px] font-black text-[#1A1A1A] uppercase tracking-wide">{action.label}</span>
                </div>
              </Link>
            ))}
          </section>
  
          <section className="px-4 mb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-heading text-[#1A1A1A] font-black tracking-tight">Arena Battles</h3>
              <Link href="/matches" className="text-[8px] font-black text-[#6B7280] uppercase tracking-wide bg-white px-2.5 py-1 rounded-lg">All</Link>
            </div>
            
            <div className="flex flex-col gap-2.5">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))
              ) : (
                featuredMatches.slice(1, 4).map((match, idx) => {
                  const colors = ["teal", "blue", "pink", "yellow", "coral", "lavender", "peach"];
                  const color = colors[idx % colors.length] as any;
                  return (
                    <Link key={match.id} href={`/matches/${match.id}`}>
                      <BentoCard variant={color} size="compact" className="flex items-center justify-between border-none shadow-sm">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                            <Zap size={16} className={cn("text-[#1A1A1A]", ["teal", "pink", "coral", "lavender"].includes(color) && "text-white")} />
                          </div>
                          <div className="min-w-0">
                            <h4 className={cn("font-heading font-black leading-tight text-sm tracking-tight truncate", ["teal", "pink", "coral", "lavender"].includes(color) ? "text-white" : "text-[#1A1A1A]")}>{match.tournament?.title || "Standard Match"}</h4>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={cn("text-[8px] font-black uppercase tracking-wide", ["teal", "pink", "coral", "lavender"].includes(color) ? "text-white/60" : "text-[#1A1A1A]/60")}>₹{match.tournament?.entry_fee}</span>
                              <span className={cn("text-[8px] font-black", ["teal", "pink", "coral", "lavender"].includes(color) ? "text-white/30" : "text-[#1A1A1A]/30")}>•</span>
                              <span className={cn("text-[8px] font-black uppercase tracking-wide", ["teal", "pink", "coral", "lavender"].includes(color) ? "text-white/60" : "text-[#1A1A1A]/60")}>SOLO</span>
                            </div>
                          </div>
                        </div>
                        <div className={cn("px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-wide shadow-sm flex-shrink-0", ["teal", "pink", "coral", "lavender"].includes(color) ? "bg-white text-[#1A1A1A]" : "bg-[#1A1A1A] text-white")}>
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
