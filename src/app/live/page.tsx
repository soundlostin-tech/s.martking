"use client";

import { BottomNav } from "@/components/layout/BottomNav";
import { VintageTV } from "@/components/ui/VintageTV";
import { BentoCard } from "@/components/ui/BentoCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { motion } from "framer-motion";
import { 
  Clock, 
  ChevronRight, 
  Loader2, 
  Eye, 
  Calendar, 
  AlertCircle,
  Play,
  ShieldCheck,
  Zap,
  Swords
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";

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
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#5FD3BC] mb-4" />
        <p className="text-[12px] font-bold text-[#1A1A1A] uppercase tracking-wide">Tuning in...</p>
      </div>
    );
  }

  return (
    <main className="pb-[80px]">
      <section className="px-4 pt-6 pb-6">
        <p className="text-[12px] font-bold text-[#6B7280] uppercase tracking-wide mb-2">
          Broadcasting Now
        </p>
        <h2 className="text-[32px] font-heading text-[#1A1A1A] leading-tight font-bold">
          LIVE
        </h2>
        <p className="text-[12px] font-bold text-[#6B7280] uppercase tracking-wide mt-1">
          Watch Today's Action
        </p>
      </section>

      <div className="px-4 space-y-6">
        <VintageTV 
          streamUrl={activeMatch?.stream_url}
          isOn={tvOn && !!activeMatch}
          onToggle={(on) => setTvOn(on)}
          title={activeMatch?.title}
        />

        {activeMatch ? (
          <>
            <BentoCard variant="vibrant" className="p-6 relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <StatusBadge variant="live" className="bg-[#1A1A1A] text-white" />
                  <div className="flex items-center gap-2 bg-white/30 backdrop-blur-md px-3 py-1.5 rounded-full">
                    <Eye size={14} className="text-[#1A1A1A]" />
                    <span className="text-sm font-bold text-[#1A1A1A]">{activeMatch.viewers_count?.toLocaleString() || 0}</span>
                  </div>
                </div>
                <h3 className="text-xl font-heading text-[#1A1A1A] font-bold leading-tight">{activeMatch.title}</h3>
                <p className="text-[10px] text-[#1A1A1A]/60 font-bold uppercase tracking-wide mt-1 mb-6">{activeMatch.tournament?.title}</p>
                
                <div className="flex gap-2">
                  <div className="bg-white/40 backdrop-blur-md rounded-lg p-3 flex-1 text-center">
                    <p className="text-[9px] font-bold text-[#1A1A1A]/60 uppercase tracking-wide mb-1">Mode</p>
                    <p className="text-sm font-bold text-[#1A1A1A]">{activeMatch.mode}</p>
                  </div>
                  <div className="bg-white/40 backdrop-blur-md rounded-lg p-3 flex-1 text-center">
                    <p className="text-[9px] font-bold text-[#1A1A1A]/60 uppercase tracking-wide mb-1">Map</p>
                    <p className="text-sm font-bold text-[#1A1A1A]">{activeMatch.map || 'Bermuda'}</p>
                  </div>
                  <div className="bg-white/40 backdrop-blur-md rounded-lg p-3 flex-1 text-center">
                    <p className="text-[9px] font-bold text-[#1A1A1A]/60 uppercase tracking-wide mb-1">Teams</p>
                    <p className="text-sm font-bold text-[#1A1A1A]">{activeMatch.live_stats?.teams_alive || 12}</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute right-[-20px] bottom-[-20px] scale-[1.5] opacity-5 pointer-events-none">
                <Swords size={100} />
              </div>
            </BentoCard>

            <BentoCard variant="pastel" pastelColor="indigo" className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-heading text-[#1A1A1A] font-bold">Today's Schedule</h4>
                <div className="w-10 h-10 rounded-lg bg-white/40 flex items-center justify-center">
                  <Calendar size={18} className="text-[#1A1A1A]" />
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { time: "12:00 PM", title: "Solo Championship", status: "completed" },
                  { time: "03:00 PM", title: "Squad Showdown", status: "live" },
                  { time: "06:00 PM", title: "Duo Battle Royale", status: "upcoming" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-[#1A1A1A]/5 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#1A1A1A]/20" />
                      <div>
                        <p className="text-[10px] font-bold text-[#1A1A1A]/60 uppercase tracking-wide">{item.time}</p>
                        <p className="text-sm font-bold text-[#1A1A1A]">{item.title}</p>
                      </div>
                    </div>
                    <StatusBadge variant={item.status as any} className="text-[8px] px-2 py-0.5" />
                  </div>
                ))}
              </div>
            </BentoCard>

            <BentoCard variant="pastel" pastelColor="mint" className="p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/40 flex items-center justify-center flex-shrink-0">
                <ShieldCheck size={28} className="text-[#1A1A1A]" />
              </div>
              <div>
                <h4 className="font-heading text-[#1A1A1A] font-bold text-base">Fair Play Rules</h4>
                <p className="text-[10px] font-bold text-[#1A1A1A]/60 uppercase tracking-wide mt-0.5">Zero tolerance for cheating</p>
                <Link href="#" className="inline-flex items-center gap-1 text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wide mt-2">
                  Read More <ChevronRight size={12} strokeWidth={3} />
                </Link>
              </div>
            </BentoCard>

            {otherMatches.length > 0 && (
              <section className="space-y-4 pt-2">
                <h4 className="text-lg font-heading text-[#1A1A1A] font-bold px-1">More Streams</h4>
                <div className="flex flex-col gap-3">
                  {otherMatches.map((match) => (
                    <motion.div 
                      key={match.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setActiveMatch(match);
                        setTvOn(true);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      <BentoCard className="p-4 flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-[#FEE2E2] flex items-center justify-center">
                            <Play size={20} className="text-[#1A1A1A]" />
                          </div>
                          <div>
                            <h5 className="text-sm font-bold text-[#1A1A1A]">{match.title}</h5>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="w-1.5 h-1.5 bg-[#5FD3BC] rounded-full animate-pulse" />
                              <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wide">{match.viewers_count} VIEWERS</p>
                            </div>
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[#F5F5F5] flex items-center justify-center">
                          <ChevronRight size={18} className="text-[#1A1A1A]" />
                        </div>
                      </BentoCard>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          <BentoCard className="p-12 text-center">
            <div className="w-16 h-16 bg-[#FEF3C7] rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap size={32} className="text-[#1A1A1A]" />
            </div>
            <h3 className="text-xl font-heading text-[#1A1A1A] font-bold mb-2">No Live Streams</h3>
            <p className="text-[12px] text-[#6B7280] mb-8 font-bold uppercase tracking-wide">Tune in later for epic battles</p>
            <Link href="/matches">
              <motion.button 
                whileTap={{ scale: 0.95 }}
                className="w-full py-4 bg-[#5FD3BC] text-[#1A1A1A] rounded-lg text-[12px] font-bold uppercase tracking-wide shadow-lg"
              >
                Browse Tournaments
              </motion.button>
            </Link>
          </BentoCard>
        )}
      </div>
    </main>
  );
}

export default function Live() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#1A1A1A] relative">
      <div className="unified-bg" />
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#5FD3BC]" />
        </div>
      }>
        <LiveContent />
      </Suspense>
      <BottomNav />
    </div>
  );
}
