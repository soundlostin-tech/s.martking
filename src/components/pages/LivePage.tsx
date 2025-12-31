"use client";

import { BottomNav } from "@/components/layout/BottomNav";
import { VintageTV } from "@/components/ui/VintageTV";
import { BentoCard } from "@/components/ui/BentoCard";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { 
  ChevronRight, 
  Eye, 
  Calendar, 
  Play,
  Zap,
  Swords,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";

function LiveContent() {
  const searchParams = useSearchParams();
  const matchId = searchParams.get('match');
  
  const [activeMatch, setActiveMatch] = useState<any>(null);
  const [otherMatches, setOtherMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tvOn, setTvOn] = useState(false);

  const fetchLiveMatches = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("matches")
        .select(`
          *,
          tournament:tournaments(title, prize_pool)
        `)
        .eq("status", "live")
        .order("viewers_count", { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        if (matchId) {
          const selected = data.find(m => m.id === matchId);
          if (selected) {
            setActiveMatch(selected);
            setOtherMatches(data.filter(m => m.id !== matchId));
            setTvOn(true);
          } else {
            setActiveMatch(data[0]);
            setOtherMatches(data.slice(1));
          }
        } else {
          setActiveMatch(data[0]);
          setOtherMatches(data.slice(1));
        }
      }
    } catch (err) {
      console.error("Error fetching live matches:", err);
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    fetchLiveMatches();

    const channel = supabase
      .channel('live-matches-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches', filter: "status=eq.live" }, () => {
        fetchLiveMatches();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLiveMatches]);

  if (loading) {
    return (
      <main className="pb-[80px]">
        <section className="px-5 pt-8 pb-6">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-10 w-48 mb-2" />
        </section>
        <div className="px-5 space-y-6">
          <Skeleton className="h-[250px] w-full rounded-[32px]" />
          <Skeleton className="h-[200px] w-full rounded-[32px]" />
        </div>
      </main>
    );
  }

      return (
        <main className="pb-20">
            <section className="px-4 pt-4 pb-3">
              <p className="text-[9px] font-black text-[#6B7280] uppercase tracking-widest mb-1">
                Broadcasting Now
              </p>
              <h2 className="text-2xl sm:text-3xl font-heading text-[#1A1A1A] leading-tight font-black tracking-tight">
                LIVE ARENA
              </h2>
              <p className="text-[8px] font-black text-[#4F9B8B] uppercase tracking-widest mt-0.5">
                Join the Action • Real-time
              </p>
            </section>

            <div className="px-4 space-y-4">
              <div className="rounded-2xl overflow-hidden shadow-lg border-2 border-white bg-black w-full">
                <VintageTV 
                  streamUrl={activeMatch?.stream_url}
                  isOn={tvOn && !!activeMatch}
                  onToggle={(on) => setTvOn(on)}
                  title={activeMatch?.title}
                />
              </div>

              {activeMatch ? (
                <>
                  <BentoCard variant="mint" size="default" className="relative overflow-hidden shadow-lg border-none">
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5 bg-[#1A1A1A] text-white px-2.5 py-1 rounded-full shadow">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                          <span className="text-[8px] font-black tracking-wide uppercase">LIVE</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur px-2.5 py-1 rounded-full border border-white/20">
                          <Eye size={12} className="text-white" />
                          <span className="text-[9px] font-black text-white tracking-tight">{activeMatch.viewers_count?.toLocaleString() || 0}</span>
                        </div>
                      </div>
                      <h3 className="text-base sm:text-lg font-heading text-white font-black leading-tight tracking-tight mb-0.5">{activeMatch.title}</h3>
                      <p className="text-[8px] text-white/60 font-black uppercase tracking-wide mb-4">{activeMatch.tournament?.title}</p>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-white/20 backdrop-blur rounded-xl p-2.5 text-center border border-white/20 min-w-0">
                          <p className="text-[7px] font-black text-white/60 uppercase tracking-wide mb-0.5 truncate">Mode</p>
                          <p className="text-xs font-black text-white truncate">{activeMatch.mode}</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur rounded-xl p-2.5 text-center border border-white/20 min-w-0">
                          <p className="text-[7px] font-black text-white/60 uppercase tracking-wide mb-0.5 truncate">Map</p>
                          <p className="text-xs font-black text-white truncate">{activeMatch.map || 'Bermuda'}</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur rounded-xl p-2.5 text-center border border-white/20 min-w-0">
                          <p className="text-[7px] font-black text-white/60 uppercase tracking-wide mb-0.5 truncate">Teams</p>
                          <p className="text-xs font-black text-white truncate">{activeMatch.live_stats?.teams_alive || 12}</p>
                        </div>
                      </div>
                    </div>
                  
                    <div className="absolute right-[-20px] bottom-[-20px] opacity-[0.1] pointer-events-none">
                      <Swords size={100} color="white" />
                    </div>
                  </BentoCard>

                {otherMatches.length > 0 && (
                  <section className="space-y-6 pt-2">
                    <div className="flex items-center gap-3 px-1">
                      <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-[#E5E7EB] to-transparent" />
                      <h4 className="text-sm font-black text-[#6B7280] uppercase tracking-[0.2em] whitespace-nowrap">Explore More</h4>
                      <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-[#E5E7EB] to-transparent" />
                    </div>
                    <div className="flex flex-col gap-4">
                      {otherMatches.map((match, idx) => {
                        const colors = ["blue", "pink", "yellow", "coral", "lavender", "peach"];
                        const color = colors[idx % colors.length] as any;
                        const isDarkText = ["blue", "yellow", "peach"].includes(color);
                        return (
                          <motion.div 
                            key={match.id}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => {
                              setActiveMatch(match);
                              setTvOn(true);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                          >
                            <BentoCard variant={color} className="p-5 flex items-center justify-between cursor-pointer border-none shadow-lg group">
                              <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                                  <Play size={24} strokeWidth={3} className={isDarkText ? "text-[#1A1A1A]" : "text-white"} ml-1 />
                                </div>
                                <div>
                                  <h5 className={cn("text-base font-black tracking-tight", isDarkText ? "text-[#1A1A1A]" : "text-white")}>{match.title}</h5>
                                  <div className="flex items-center gap-2 mt-1">
                                      <span className={cn("w-2 h-2 rounded-full animate-pulse shadow-[0_0_5px_rgba(255,255,255,0.8)]", isDarkText ? "bg-[#4F9B8B]" : "bg-white")} />
                                    <p className={cn("text-[10px] font-black uppercase tracking-widest", isDarkText ? "text-[#1A1A1A]/60" : "text-white/60")}>{match.viewers_count} VIEWERS</p>
                                  </div>
                                </div>
                              </div>
                              <div className="w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center border border-[#E5E7EB]">
                                <ChevronRight size={22} className="text-[#1A1A1A]" strokeWidth={3} />
                              </div>
                            </BentoCard>
                          </motion.div>
                        );
                      })}
                    </div>
                  </section>
                )}

                <BentoCard variant="purple" className="p-8 shadow-xl border-none overflow-hidden relative group">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h4 className="text-2xl font-heading text-white font-black tracking-tighter">SCHEDULE</h4>
                      <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Upcoming Broadcasts</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white text-[#1A1A1A] flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                      <Calendar size={20} />
                    </div>
                  </div>
                  <div className="space-y-6">
                    {[
                        { time: "06:00 PM", title: "Duo Battle Royale", status: "upcoming", color: "blue" },
                        { time: "09:00 PM", title: "Pro League Finals", status: "upcoming", color: "coral" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-4 border-b border-white/10 last:border-0 last:pb-0">
                        <div className="flex items-center gap-5">
                          <div className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-[#A8D8EA]' : 'bg-[#F1948A]'} shadow-sm`} />
                          <div>
                            <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">{item.time}</p>
                            <p className="text-base font-black text-white tracking-tight">{item.title}</p>
                          </div>
                        </div>
                        <div className="bg-white text-[#1A1A1A] px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-md">
                          SOON
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="absolute -right-10 -bottom-10 opacity-[0.1] pointer-events-none group-hover:scale-110 transition-transform">
                    <Zap size={200} color="white" />
                  </div>
                </BentoCard>
              </>
            ) : (
              <BentoCard className="p-16 text-center bg-white shadow-2xl rounded-[40px] border-none">
                <div className="w-20 h-20 bg-[#FFF9ED] rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl rotate-12 border-none">
                  <Zap size={40} className="text-[#FDAB6D]" />
                </div>
                <h3 className="text-3xl font-heading text-[#1A1A1A] font-black tracking-tighter mb-3">RADIO SILENCE</h3>
                <p className="text-[11px] text-[#6B7280] mb-10 font-black uppercase tracking-[0.2em]">No Live Streams at this moment</p>
                <Link href="/matches">
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    className="w-full py-5 bg-[#1A1A1A] text-white rounded-2xl text-[12px] font-black uppercase tracking-widest shadow-[0_15px_30px_rgba(0,0,0,0.15)] flex items-center justify-center gap-3"
                  >
                    JOIN THE BATTLE
                    <ChevronRight size={18} strokeWidth={3} />
                  </motion.button>
                </Link>
              </BentoCard>
            )}
          </div>
        </main>
      );
  }
  
  export function LivePage() {
    return (
      <div className="min-h-screen bg-[#FFFDF5] text-[#1A1A1A] relative">
        <Suspense fallback={<LoadingScreen />}>
          <LiveContent />
        </Suspense>
        <BottomNav />
      </div>
    );
  }
