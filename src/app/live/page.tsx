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
  AlertCircle
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
      <section className="relative px-6 pt-10 pb-6">
        <div className="relative z-10">
          <p className="text-[10px] font-bold text-charcoal/50 uppercase tracking-[0.2em] mb-2">
            Broadcast Center
          </p>
          <h2 className="text-[32px] font-heading text-onyx leading-tight font-black">
            LIVE <br />
            <span className="text-onyx">Broadcasting</span>
          </h2>
        </div>
      </section>

      <div className="px-6 space-y-6">
        {/* Vintage TV Component */}
        <div className="rounded-[40px] overflow-hidden shadow-2xl border border-black/5">
          <VintageTV 
            streamUrl={activeMatch?.stream_url}
            isOn={tvOn && !!activeMatch}
            onToggle={(on) => setTvOn(on)}
            title={activeMatch?.title}
          />
        </div>

        {activeMatch ? (
          <>
            {/* Match Info Card */}
            <BentoCard className="p-8 border-none shadow-[0_10px_40px_rgba(0,0,0,0.03)]">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <StatusBadge variant="live" />
                  <h3 className="text-2xl font-heading text-onyx font-black mt-4 leading-tight">{activeMatch.title}</h3>
                  <p className="text-[10px] text-charcoal/40 font-bold uppercase tracking-widest mt-1">{activeMatch.tournament?.title}</p>
                </div>
                <div className="flex items-center gap-2 bg-off-white px-4 py-2 rounded-2xl">
                  <Eye size={16} className="text-lime-vibrant" />
                  <span className="text-sm font-black text-onyx">{activeMatch.viewers_count?.toLocaleString() || 0}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-background rounded-2xl p-4 text-center">
                  <p className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest mb-1">Mode</p>
                  <p className="text-sm font-black text-onyx">{activeMatch.mode}</p>
                </div>
                <div className="bg-background rounded-2xl p-4 text-center">
                  <p className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest mb-1">Map</p>
                  <p className="text-sm font-black text-onyx">{activeMatch.map || 'Bermuda'}</p>
                </div>
                <div className="bg-background rounded-2xl p-4 text-center">
                  <p className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest mb-1">Round</p>
                  <p className="text-sm font-black text-onyx">{activeMatch.current_round || 1}</p>
                </div>
              </div>
            </BentoCard>

            {/* Live Stats */}
            <BentoCard className="p-8 border-none shadow-[0_10px_40px_rgba(0,0,0,0.03)]">
              <h4 className="text-[10px] font-bold text-charcoal/40 uppercase tracking-widest mb-6">Real-Time Data</h4>
              <div className="grid grid-cols-3 gap-8">
                <div className="text-center">
                  <p className="text-3xl font-heading text-onyx font-black">{activeMatch.live_stats?.teams_alive || 0}</p>
                  <p className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest mt-1">Teams Alive</p>
                </div>
                <div className="text-center border-x border-black/[0.03]">
                  <p className="text-3xl font-heading text-onyx font-black">{activeMatch.live_stats?.total_kills || 0}</p>
                  <p className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest mt-1">Total Kills</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-heading text-onyx font-black">{activeMatch.live_stats?.safe_zone_phase || 1}</p>
                  <p className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest mt-1">Zone Phase</p>
                </div>
              </div>
            </BentoCard>

            {/* Today's Schedule */}
            <BentoCard className="p-8 border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between mb-8">
                <h4 className="text-lg font-heading text-onyx font-black">Schedule</h4>
                <Calendar size={20} className="text-charcoal/20" />
              </div>
              <div className="space-y-6">
                {[
                  { time: "12:00 PM", title: "Solo Championship", status: "completed" },
                  { time: "03:00 PM", title: "Squad Showdown", status: "live" },
                  { time: "06:00 PM", title: "Duo Battle Royale", status: "upcoming" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-black/[0.03] last:border-0 last:pb-0">
                    <div className="flex items-center gap-4">
                      <Clock size={16} className="text-charcoal/20" />
                      <div>
                        <p className="text-[10px] font-black text-onyx">{item.time}</p>
                        <p className="text-sm font-bold text-charcoal/60">{item.title}</p>
                      </div>
                    </div>
                    <StatusBadge variant={item.status as any} className="text-[9px] px-3 py-1" />
                  </div>
                ))}
              </div>
            </BentoCard>

            {/* Other Live Matches */}
            {otherMatches.length > 0 && (
              <section className="space-y-6 pt-4">
                <h4 className="text-xl font-heading text-onyx font-black px-1">Active Streams</h4>
                <div className="space-y-4">
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
                          <div className="w-14 h-14 rounded-2xl bg-off-white flex items-center justify-center">
                            <Play size={24} className="text-onyx/20" />
                          </div>
                          <div>
                            <h5 className="text-[14px] font-black text-onyx">{match.title}</h5>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
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
          <BentoCard className="p-16 text-center border-none bg-white shadow-sm">
            <AlertCircle size={48} className="text-charcoal/10 mx-auto mb-6" />
            <h3 className="text-2xl font-heading text-onyx font-black mb-3">Airwaves are Silent</h3>
            <p className="text-xs text-charcoal/40 mb-10 font-bold uppercase tracking-widest">No tournaments are broadcasting right now</p>
            <Link href="/matches">
              <motion.button 
                whileTap={{ scale: 0.95 }}
                className="px-10 py-5 bg-onyx text-white rounded-2xl text-[12px] font-bold uppercase tracking-[0.2em] shadow-2xl shadow-onyx/10"
              >
                Browse Hub
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

  return (
    <main className="pb-28 relative z-10">
      <TopHeader />

      {/* Pastel Blob Header */}
      <section className="relative px-4 sm:px-6 pt-6 pb-4 blob-header blob-header-mint">
        <div className="relative z-10">
          <p className="text-[10px] font-bold text-[#4A4B48] uppercase tracking-[0.2em] mb-1">
            Broadcast Center
          </p>
          <h2 className="text-2xl sm:text-3xl font-heading text-[#11130D]">
            LIVE <span className="text-[#868935]">Stream</span>
          </h2>
        </div>
      </section>

      <div className="px-4 sm:px-6 space-y-6 mt-4">
        {/* Vintage TV Component */}
        <VintageTV 
          streamUrl={activeMatch?.stream_url}
          isOn={tvOn && !!activeMatch}
          onToggle={(on) => setTvOn(on)}
          title={activeMatch?.title}
        />

        {activeMatch ? (
          <>
            {/* Match Info Card */}
            <BentoCard className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <StatusBadge variant="live" />
                  <h3 className="text-lg font-heading text-[#11130D] mt-2">{activeMatch.title}</h3>
                  <p className="text-[11px] text-[#4A4B48] font-medium">{activeMatch.tournament?.title}</p>
                </div>
                <div className="flex items-center gap-2 bg-[#E8E9EC] px-3 py-1.5 rounded-full">
                  <Eye size={14} className="text-[#868935]" />
                  <span className="text-[11px] font-bold text-[#11130D]">{activeMatch.viewers_count?.toLocaleString() || 0}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#E8E9EC] rounded-xl p-3 text-center">
                  <p className="text-[9px] font-bold text-[#4A4B48] uppercase tracking-wide mb-1">Mode</p>
                  <p className="text-sm font-heading text-[#11130D]">{activeMatch.mode}</p>
                </div>
                <div className="bg-[#E8E9EC] rounded-xl p-3 text-center">
                  <p className="text-[9px] font-bold text-[#4A4B48] uppercase tracking-wide mb-1">Map</p>
                  <p className="text-sm font-heading text-[#11130D]">{activeMatch.map || 'Bermuda'}</p>
                </div>
                <div className="bg-[#E8E9EC] rounded-xl p-3 text-center">
                  <p className="text-[9px] font-bold text-[#4A4B48] uppercase tracking-wide mb-1">Round</p>
                  <p className="text-sm font-heading text-[#11130D]">{activeMatch.current_round || 1}</p>
                </div>
              </div>
            </BentoCard>

            {/* Live Stats */}
            <BentoCard className="p-5">
              <h4 className="text-sm font-heading text-[#11130D] mb-4">Live Stats</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-heading text-[#11130D]">{activeMatch.live_stats?.teams_alive || 0}</p>
                  <p className="text-[9px] font-bold text-[#4A4B48] uppercase tracking-wide">Teams Alive</p>
                </div>
                <div className="text-center border-x border-[#C8C8C4]/30">
                  <p className="text-2xl font-heading text-[#11130D]">{activeMatch.live_stats?.total_kills || 0}</p>
                  <p className="text-[9px] font-bold text-[#4A4B48] uppercase tracking-wide">Total Kills</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-heading text-[#11130D]">{activeMatch.live_stats?.safe_zone_phase || 1}</p>
                  <p className="text-[9px] font-bold text-[#4A4B48] uppercase tracking-wide">Zone Phase</p>
                </div>
              </div>
            </BentoCard>

            {/* Today's Schedule */}
            <BentoCard className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-heading text-[#11130D]">Today's Schedule</h4>
                <Calendar size={16} className="text-[#868935]" />
              </div>
              <div className="space-y-3">
                {[
                  { time: "12:00 PM", title: "Solo Championship", status: "completed" },
                  { time: "03:00 PM", title: "Squad Showdown", status: "live" },
                  { time: "06:00 PM", title: "Duo Battle Royale", status: "upcoming" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-[#C8C8C4]/20 last:border-0">
                    <div className="flex items-center gap-3">
                      <Clock size={14} className="text-[#4A4B48]" />
                      <span className="text-[11px] font-bold text-[#4A4B48]">{item.time}</span>
                    </div>
                    <span className="text-[12px] font-medium text-[#11130D]">{item.title}</span>
                    <StatusBadge variant={item.status as any} className="text-[8px] px-2" />
                  </div>
                ))}
              </div>
            </BentoCard>

            {/* Other Live Matches */}
            {otherMatches.length > 0 && (
              <section className="space-y-4">
                <h4 className="text-sm font-heading text-[#11130D]">Other Live Matches</h4>
                <div className="space-y-3">
                  {otherMatches.map((match) => (
                    <motion.div 
                      key={match.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setActiveMatch(match);
                        setTvOn(true);
                      }}
                    >
                      <BentoCard className="p-4 flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-[#E8E9EC] flex items-center justify-center">
                            <StatusBadge variant="live" className="text-[8px] px-2" />
                          </div>
                          <div>
                            <h5 className="text-[13px] font-heading text-[#11130D]">{match.title}</h5>
                            <p className="text-[10px] text-[#4A4B48]">{match.mode} • {match.viewers_count} viewers</p>
                          </div>
                        </div>
                        <ChevronRight size={18} className="text-[#C8C8C4]" />
                      </BentoCard>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Rules Reminder */}
            <BentoCard className="p-5">
              <h4 className="text-sm font-heading text-[#11130D] mb-3">Rules Reminder</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-[11px] text-[#4A4B48]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#868935] mt-1.5" />
                  No teaming with opponents
                </li>
                <li className="flex items-start gap-2 text-[11px] text-[#4A4B48]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#868935] mt-1.5" />
                  Stream sniping is prohibited
                </li>
                <li className="flex items-start gap-2 text-[11px] text-[#4A4B48]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#868935] mt-1.5" />
                  Report issues immediately to admins
                </li>
              </ul>
            </BentoCard>
          </>
        ) : (
          <BentoCard className="p-8 text-center">
            <AlertCircle size={48} className="text-[#C8C8C4] mx-auto mb-4" />
            <h3 className="text-lg font-heading text-[#11130D] mb-2">No Live Matches</h3>
            <p className="text-[11px] text-[#4A4B48] mb-4">There are no tournaments streaming right now.</p>
            <Link href="/matches">
              <motion.button 
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-[#D7FD03] text-[#11130D] rounded-xl text-[11px] font-bold uppercase tracking-wide shadow-lg shadow-[#D7FD03]/30"
              >
                Browse Matches
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
    <div className="min-h-screen bg-[#D4D7DE] text-[#11130D]">
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#D4D7DE]">
          <Loader2 className="w-8 h-8 animate-spin text-[#868935]" />
        </div>
      }>
        <LiveContent />
      </Suspense>
      <BottomNav />
    </div>
  );
}
