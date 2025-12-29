"use client";

import { BottomNav } from "@/components/layout/BottomNav";
import { TopHeader } from "@/components/layout/TopHeader";
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-onyx/20 mb-4" />
        <p className="text-[10px] font-bold text-charcoal/40 uppercase tracking-[0.3em]">Tuning in...</p>
      </div>
    );
  }

  return (
    <main className="pb-32 relative z-10">
      <TopHeader />

      {/* Header Section */}
      <section className="relative px-6 pt-10 pb-12 blob-header blob-header-coral">
        <div className="relative z-10">
          <p className="text-[10px] font-bold text-charcoal/50 uppercase tracking-[0.2em] mb-2">
            Broadcasting Now
          </p>
          <h2 className="text-[44px] font-heading text-onyx leading-tight font-black">
            LIVE <br />
            <span className="text-charcoal-brown/40">Watch Today's Action</span>
          </h2>
        </div>
      </section>

      <div className="px-6 space-y-8 -mt-6">
        {/* Vintage TV Component */}
        <VintageTV 
          streamUrl={activeMatch?.stream_url}
          isOn={tvOn && !!activeMatch}
          onToggle={(on) => setTvOn(on)}
          title={activeMatch?.title}
        />

        {activeMatch ? (
          <>
            {/* Now Streaming Card */}
            <BentoCard variant="vibrant" className="p-8 border-none relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <StatusBadge variant="live" className="bg-onyx text-white shadow-none" />
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl">
                    <Eye size={16} className="text-onyx" />
                    <span className="text-sm font-black text-onyx">{activeMatch.viewers_count?.toLocaleString() || 0}</span>
                  </div>
                </div>
                <h3 className="text-2xl font-heading text-onyx font-black leading-tight">{activeMatch.title}</h3>
                <p className="text-[10px] text-onyx/40 font-bold uppercase tracking-widest mt-1 mb-8">{activeMatch.tournament?.title}</p>
                
                <div className="flex gap-3">
                  <div className="bg-white/40 backdrop-blur-md rounded-2xl p-4 flex-1 text-center">
                    <p className="text-[9px] font-bold text-onyx/40 uppercase tracking-widest mb-1">Mode</p>
                    <p className="text-sm font-black text-onyx">{activeMatch.mode}</p>
                  </div>
                  <div className="bg-white/40 backdrop-blur-md rounded-2xl p-4 flex-1 text-center">
                    <p className="text-[9px] font-bold text-onyx/40 uppercase tracking-widest mb-1">Map</p>
                    <p className="text-sm font-black text-onyx">{activeMatch.map || 'Bermuda'}</p>
                  </div>
                  <div className="bg-white/40 backdrop-blur-md rounded-2xl p-4 flex-1 text-center">
                    <p className="text-[9px] font-bold text-onyx/40 uppercase tracking-widest mb-1">Teams</p>
                    <p className="text-sm font-black text-onyx">{activeMatch.live_stats?.teams_alive || 12}</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute right-[-20px] bottom-[-20px] scale-[1.5] opacity-5 pointer-events-none">
                <Swords size={120} />
              </div>
            </BentoCard>

            {/* Today's Schedule Card */}
            <BentoCard variant="pastel" pastelColor="sky" className="p-8 border-none">
              <div className="flex items-center justify-between mb-8">
                <h4 className="text-xl font-heading text-onyx font-black">Today's Schedule</h4>
                <div className="w-10 h-10 rounded-2xl bg-white/40 flex items-center justify-center">
                  <Calendar size={20} className="text-onyx" />
                </div>
              </div>
              <div className="space-y-6">
                {[
                  { time: "12:00 PM", title: "Solo Championship", status: "completed" },
                  { time: "03:00 PM", title: "Squad Showdown", status: "live" },
                  { time: "06:00 PM", title: "Duo Battle Royale", status: "upcoming" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-onyx/5 last:border-0 last:pb-0">
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-onyx/20" />
                      <div>
                        <p className="text-[10px] font-black text-onyx/40 uppercase tracking-widest">{item.time}</p>
                        <p className="text-sm font-bold text-onyx">{item.title}</p>
                      </div>
                    </div>
                    <StatusBadge variant={item.status as any} className="text-[8px] px-3 py-1 bg-white/40 border-none shadow-none" />
                  </div>
                ))}
              </div>
            </BentoCard>

            {/* Rules & Fair Play */}
            <BentoCard variant="pastel" pastelColor="mint" className="p-8 border-none flex items-center gap-6">
              <div className="w-16 h-16 rounded-3xl bg-white/40 flex items-center justify-center flex-shrink-0">
                <ShieldCheck size={32} className="text-onyx" />
              </div>
              <div>
                <h4 className="font-heading text-onyx font-black text-lg">Fair Play Rules</h4>
                <p className="text-xs font-bold text-onyx/40 uppercase tracking-widest mt-0.5">Zero tolerance for cheating</p>
                <Link href="#" className="inline-flex items-center gap-1 text-[10px] font-black text-onyx uppercase tracking-widest mt-3">
                  Read More <ChevronRight size={12} strokeWidth={3} />
                </Link>
              </div>
            </BentoCard>

            {/* Other Live Matches */}
            {otherMatches.length > 0 && (
              <section className="space-y-6 pt-4">
                <h4 className="text-xl font-heading text-onyx font-black px-1">More Streams</h4>
                <div className="flex flex-col gap-4">
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
                      <BentoCard className="p-5 flex items-center justify-between cursor-pointer border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-2xl bg-pastel-coral flex items-center justify-center">
                            <Play size={24} className="text-onyx" />
                          </div>
                          <div>
                            <h5 className="text-[14px] font-black text-onyx">{match.title}</h5>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="w-1.5 h-1.5 bg-onyx rounded-full animate-pulse" />
                              <p className="text-[10px] font-bold text-charcoal/40 uppercase tracking-widest">{match.viewers_count} VIEWERS</p>
                            </div>
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-off-white flex items-center justify-center">
                          <ChevronRight size={20} className="text-onyx" />
                        </div>
                      </BentoCard>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          <BentoCard className="p-16 text-center border-none bg-white shadow-sm rounded-[40px]">
            <div className="w-20 h-20 bg-pastel-sky rounded-full flex items-center justify-center mx-auto mb-8">
              <Zap size={40} className="text-onyx" />
            </div>
            <h3 className="text-[28px] font-heading text-onyx font-black mb-3">No Live Streams</h3>
            <p className="text-xs text-charcoal/40 mb-10 font-bold uppercase tracking-widest">Tune in later for epic battles</p>
            <Link href="/matches">
              <motion.button 
                whileTap={{ scale: 0.95 }}
                className="w-full py-6 bg-onyx text-white rounded-[24px] text-[12px] font-bold uppercase tracking-[0.2em] shadow-xl"
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
    <div className="min-h-screen bg-background text-onyx">
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="w-10 h-10 animate-spin text-onyx/20" />
        </div>
      }>
        <LiveContent />
      </Suspense>
      <BottomNav />
    </div>
  );
}
