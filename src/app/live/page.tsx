"use client";

import { BottomNav } from "@/components/layout/BottomNav";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, 
  Pause, 
  Volume2, 
  Maximize, 
  Users, 
  Target, 
  Map as MapIcon, 
  Trophy, 
  Wifi, 
  WifiOff,
  ChevronRight,
  Loader2,
  Gamepad2,
  Circle
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function Live() {
  const [activeMatch, setActiveMatch] = useState<any>(null);
  const [otherMatches, setOtherMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(80);

  useEffect(() => {
    const fetchLiveMatches = async () => {
      try {
        const { data, error } = await supabase
          .from("matches")
          .select(`
            *,
            tournament:tournaments(title)
          `)
          .eq("status", "live")
          .order("viewers_count", { ascending: false });

        if (data && data.length > 0) {
          setActiveMatch(data[0]);
          setOtherMatches(data.slice(1));
        }
      } catch (err) {
        console.error("Error fetching live matches:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveMatches();

    // Set up real-time subscription for match updates
    const channel = supabase
      .channel('live-matches')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, (payload) => {
        if (payload.new && (payload.new as any).status === 'live') {
          // If it's the active match, update it
          setActiveMatch((prev: any) => {
            if (prev && prev.id === (payload.new as any).id) {
              return { ...prev, ...payload.new };
            }
            return prev;
          });
          
          // Refresh the list to be safe
          fetchLiveMatches();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-100">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-32 bg-zinc-100">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 bg-white/40 backdrop-blur-xl border-b border-white/20 sticky top-0 z-30 shadow-xl">
        <h1 className="text-3xl font-heading text-black">Live Arena</h1>
        <p className="text-sm text-zinc-500 font-serif">Watch and follow ongoing tournaments in real-time.</p>
      </div>

      <div className="px-6 space-y-8 mt-8 max-w-2xl mx-auto">
        {activeMatch ? (
          <>
            {/* Main Live Stream Area */}
            <section className="space-y-6">
              <div className="relative aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl group border border-white/20">
                {/* Video Placeholder */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <iframe 
                    src={activeMatch.stream_url} 
                    className="w-full h-full"
                    allow="autoplay; encrypted-media"
                  />
                  {/* Overlay for custom controls */}
                  {!isPlaying && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-10">
                      <motion.button 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        onClick={() => setIsPlaying(true)}
                        className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center shadow-xl"
                      >
                        <Play size={32} fill="currentColor" />
                      </motion.button>
                    </div>
                  )}
                </div>

                {/* Status Indicator */}
                <div className="absolute top-6 left-6 z-20 flex items-center gap-2">
                  <Badge className="bg-red-600 text-white border-none px-4 py-1.5 flex items-center gap-1.5 animate-pulse shadow-lg text-[10px] font-bold rounded-full">
                    <Wifi size={14} />
                    LIVE
                  </Badge>
                  <Badge className="bg-black/60 backdrop-blur-md text-white border-none px-4 py-1.5 flex items-center gap-1.5 shadow-lg text-[10px] font-bold rounded-full">
                    <Users size={14} />
                    {activeMatch.viewers_count.toLocaleString()}
                  </Badge>
                </div>
              </div>

              {/* Match Info Card */}
              <div className="bg-white/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/20 shadow-xl space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-heading text-black">{activeMatch.title}</h2>
                    <p className="text-sm text-zinc-500 font-bold uppercase tracking-widest mt-1">{activeMatch.tournament?.title}</p>
                  </div>
                  <Badge className="bg-black text-white rounded-full px-4 py-1.5 font-bold text-[10px] uppercase tracking-widest border-none">
                    Round {activeMatch.current_round}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-center gap-4 p-4 bg-white/20 rounded-3xl border border-white/30">
                    <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center shadow-lg">
                      <MapIcon size={22} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Map</p>
                      <p className="text-base font-serif font-bold text-black">{activeMatch.map}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-white/20 rounded-3xl border border-white/30">
                    <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center shadow-lg">
                      <Gamepad2 size={22} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Mode</p>
                      <p className="text-base font-serif font-bold text-black">{activeMatch.mode}</p>
                    </div>
                  </div>
                </div>

                {/* Live Stats Grid */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-black/5">
                  <div className="text-center space-y-1">
                    <div className="flex items-center justify-center gap-1.5 text-zinc-400">
                      <Users size={14} />
                      <span className="text-[9px] font-bold uppercase tracking-widest">Teams</span>
                    </div>
                    <h4 className="text-3xl font-heading text-black">{activeMatch.live_stats?.teams_alive || 0}</h4>
                    <p className="text-[9px] text-zinc-400 font-bold uppercase">Alive</p>
                  </div>
                  <div className="text-center space-y-1">
                    <div className="flex items-center justify-center gap-1.5 text-zinc-400">
                      <Target size={14} />
                      <span className="text-[9px] font-bold uppercase tracking-widest">Kills</span>
                    </div>
                    <h4 className="text-3xl font-heading text-black">{activeMatch.live_stats?.total_kills || 0}</h4>
                    <p className="text-[9px] text-zinc-400 font-bold uppercase">Total</p>
                  </div>
                  <div className="text-center space-y-1">
                    <div className="flex items-center justify-center gap-1.5 text-zinc-400">
                      <Circle size={14} />
                      <span className="text-[9px] font-bold uppercase tracking-widest">Zone</span>
                    </div>
                    <h4 className="text-3xl font-heading text-black">{activeMatch.live_stats?.safe_zone_phase || 0}</h4>
                    <p className="text-[9px] text-zinc-400 font-bold uppercase">Phase</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Other Live Rooms */}
            {otherMatches.length > 0 && (
              <section className="space-y-6">
                <h3 className="text-2xl font-heading text-black px-2">Live Chambers</h3>
                <div className="space-y-4">
                  {otherMatches.map((match) => (
                    <motion.div 
                      key={match.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveMatch(match)}
                      className="bg-white/40 backdrop-blur-xl p-5 rounded-[2.5rem] border border-white/20 shadow-xl flex items-center justify-between group hover:border-black/20 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-5">
                        <div className="relative w-20 h-20 rounded-[1.5rem] overflow-hidden bg-black flex items-center justify-center shadow-lg">
                          <div className="absolute inset-0 opacity-40">
                             <iframe 
                              src={match.stream_url} 
                              className="w-full h-full pointer-events-none scale-150"
                            />
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                            <Play size={20} fill="white" className="text-white" />
                          </div>
                        </div>
                        <div>
                          <h4 className="font-heading text-lg text-black leading-tight">{match.title}</h4>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-[10px] px-3 py-1 rounded-full bg-black/5 text-black font-bold uppercase tracking-widest">
                              {match.mode}
                            </span>
                            <span className="text-[10px] flex items-center gap-1.5 text-zinc-400 font-bold uppercase tracking-widest">
                              <Users size={12} />
                              {match.viewers_count.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center shadow-xl group-hover:bg-zinc-800 transition-all">
                        <ChevronRight size={20} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          <div className="bg-white/40 backdrop-blur-xl p-20 rounded-[3rem] border border-white/20 text-center space-y-6 shadow-xl">
            <div className="w-24 h-24 bg-zinc-50 rounded-full flex items-center justify-center mx-auto text-zinc-200">
              <WifiOff size={48} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-heading text-black">Static in the Air</h3>
              <p className="text-sm text-zinc-400 font-serif">No live battles currently in progress. Explore upcoming tournaments to join the fray.</p>
            </div>
            <button className="px-8 py-4 bg-black text-white rounded-full text-xs font-bold uppercase tracking-[0.2em] shadow-2xl hover:bg-zinc-800 transition-all">
              View Schedule
            </button>
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
