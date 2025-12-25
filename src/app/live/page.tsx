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
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="w-8 h-8 animate-spin text-lemon-lime" />
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-32 bg-stone-50">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 bg-white border-b border-stone-100 sticky top-0 z-30">
        <h1 className="text-2xl font-heading text-onyx">Live Arena</h1>
        <p className="text-sm text-stone-500 font-medium">Watch and follow ongoing tournaments in real-time.</p>
      </div>

      <div className="px-6 space-y-6 mt-6">
        {activeMatch ? (
          <>
            {/* Main Live Stream Area */}
            <section className="space-y-4">
              <div className="relative aspect-video bg-black rounded-[32px] overflow-hidden shadow-2xl group border-4 border-white">
                {/* Video Placeholder */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <iframe 
                    src={activeMatch.stream_url} 
                    className="w-full h-full pointer-events-none"
                    allow="autoplay; encrypted-media"
                  />
                  {/* Overlay for custom controls */}
                  {!isPlaying && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-10">
                      <motion.button 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        onClick={() => setIsPlaying(true)}
                        className="w-20 h-20 bg-lime-yellow rounded-full flex items-center justify-center shadow-xl text-onyx"
                      >
                        <Play size={32} fill="currentColor" />
                      </motion.button>
                    </div>
                  )}
                </div>

                {/* Status Indicator */}
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                  <Badge className="bg-red-600 text-white border-none px-3 py-1 flex items-center gap-1.5 animate-pulse shadow-lg">
                    <Wifi size={14} />
                    LIVE
                  </Badge>
                  <Badge className="bg-black/60 backdrop-blur-md text-white border-none px-3 py-1 flex items-center gap-1.5 shadow-lg">
                    <Users size={14} />
                    {activeMatch.viewers_count.toLocaleString()}
                  </Badge>
                </div>

                {/* Video Controls Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button onClick={() => setIsPlaying(!isPlaying)} className="text-white hover:text-lime-yellow transition-colors">
                        {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                      </button>
                      <div className="flex items-center gap-2 group/vol">
                        <Volume2 size={20} className="text-white" />
                        <div className="w-24 h-1 bg-white/20 rounded-full overflow-hidden">
                          <div className="h-full bg-lime-yellow w-3/4" />
                        </div>
                      </div>
                    </div>
                    <button className="text-white hover:text-lime-yellow transition-colors">
                      <Maximize size={24} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Match Info */}
              <div className="bg-white p-6 rounded-[32px] border border-stone-100 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-heading text-onyx">{activeMatch.title}</h2>
                    <p className="text-sm text-stone-500 font-medium">{activeMatch.tournament?.title}</p>
                  </div>
                  <Badge className="bg-onyx text-lime-yellow rounded-xl px-3 py-1 font-bold text-[10px] uppercase tracking-widest">
                    Round {activeMatch.current_round}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-2xl">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-500 shadow-sm border border-stone-100">
                      <MapIcon size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Map</p>
                      <p className="text-sm font-bold text-onyx">{activeMatch.map}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-2xl">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-purple-500 shadow-sm border border-stone-100">
                      <Gamepad2 size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Mode</p>
                      <p className="text-sm font-bold text-onyx">{activeMatch.mode}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-onyx rounded-[24px] p-4 text-white shadow-lg text-center">
                  <div className="flex items-center justify-center gap-1.5 text-lime-yellow mb-1">
                    <Users size={14} />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Teams</span>
                  </div>
                  <h4 className="text-2xl font-heading">{activeMatch.live_stats?.teams_alive || 0}</h4>
                  <p className="text-[9px] text-stone-500 font-bold uppercase">Alive</p>
                </div>
                <div className="bg-onyx rounded-[24px] p-4 text-white shadow-lg text-center">
                  <div className="flex items-center justify-center gap-1.5 text-red-500 mb-1">
                    <Target size={14} />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Total Kills</span>
                  </div>
                  <h4 className="text-2xl font-heading">{activeMatch.live_stats?.total_kills || 0}</h4>
                  <p className="text-[9px] text-stone-500 font-bold uppercase">In Arena</p>
                </div>
                <div className="bg-onyx rounded-[24px] p-4 text-white shadow-lg text-center">
                  <div className="flex items-center justify-center gap-1.5 text-blue-400 mb-1">
                    <Circle size={14} />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Zone</span>
                  </div>
                  <h4 className="text-2xl font-heading">{activeMatch.live_stats?.safe_zone_phase || 0}</h4>
                  <p className="text-[9px] text-stone-500 font-bold uppercase">Phase</p>
                </div>
              </div>
            </section>

            {/* Other Live Rooms */}
            {otherMatches.length > 0 && (
              <section className="space-y-4">
                <h3 className="text-lg font-heading text-onyx px-2">Other Live Rooms</h3>
                <div className="space-y-3">
                  {otherMatches.map((match) => (
                    <motion.div 
                      key={match.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveMatch(match)}
                      className="bg-white p-4 rounded-[28px] border border-stone-100 shadow-sm flex items-center justify-between group hover:border-lime-yellow/50 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-stone-100 flex items-center justify-center">
                          <iframe 
                            src={match.stream_url} 
                            className="w-full h-full pointer-events-none opacity-50"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <Play size={16} fill="white" className="text-white" />
                          </div>
                        </div>
                        <div>
                          <h4 className="font-bold text-onyx text-sm leading-tight">{match.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 font-bold uppercase">
                              {match.mode}
                            </span>
                            <span className="text-[10px] flex items-center gap-1 text-stone-400 font-bold">
                              <Users size={10} />
                              {match.viewers_count.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-onyx text-white rounded-xl text-[10px] font-bold uppercase tracking-widest group-hover:bg-lime-yellow group-hover:text-onyx transition-all">
                        Watch
                      </button>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          <div className="bg-white p-12 rounded-[32px] border border-dashed border-stone-200 text-center space-y-4">
            <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto text-stone-300">
              <WifiOff size={40} />
            </div>
            <div>
              <h3 className="text-lg font-heading text-onyx">No Live Matches</h3>
              <p className="text-sm text-stone-400 font-medium">Check back later or explore upcoming tournaments.</p>
            </div>
            <button className="px-6 py-3 bg-onyx text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-ony/20">
              Browse Matches
            </button>
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
