"use client";

import { BottomNav } from "@/components/layout/BottomNav";
import { TopHeader } from "@/components/layout/TopHeader";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, 
  Users, 
  Target, 
  Map as MapIcon, 
  Wifi, 
  WifiOff,
  ChevronRight,
  Loader2,
  Gamepad2,
  Circle,
  Activity,
  Zap,
  Layout
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function Live() {
  const [activeMatch, setActiveMatch] = useState<any>(null);
  const [otherMatches, setOtherMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

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

    const channel = supabase
      .channel('live-matches')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, (payload) => {
        if (payload.new && (payload.new as any).status === 'live') {
          setActiveMatch((prev: any) => {
            if (prev && prev.id === (payload.new as any).id) {
              return { ...prev, ...payload.new };
            }
            return prev;
          });
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="pb-32">
        <TopHeader />

        <div className="px-6 space-y-8 mt-6 max-w-lg mx-auto">
          {activeMatch ? (
            <>
              {/* Main Live Stream Area - Native Player Style */}
              <section className="space-y-4">
                <div className="relative aspect-video bg-black rounded-[32px] overflow-hidden shadow-2xl shadow-primary/10 border border-foreground/[0.04]">
                  <iframe 
                    src={activeMatch.stream_url} 
                    className="w-full h-full"
                    allow="autoplay; encrypted-media"
                  />
                  
                  {/* Status Overlay */}
                  <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                    <div className="bg-red-500 text-white px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-lg text-[10px] font-bold uppercase tracking-wider">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      LIVE
                    </div>
                    <div className="bg-black/40 backdrop-blur-md text-white px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-lg text-[10px] font-bold uppercase tracking-wider">
                      <Users size={12} />
                      {activeMatch.viewers_count.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Match Info Header */}
                <div className="bg-white rounded-[32px] p-6 border border-foreground/[0.04] shadow-sm">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl font-bold text-foreground truncate">{activeMatch.title}</h2>
                      <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-[0.2em] mt-1">{activeMatch.tournament?.title}</p>
                    </div>
                    <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">
                      Round {activeMatch.current_round}
                    </div>
                  </div>

                  {/* Native Mini Stats Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-foreground/[0.02] p-4 rounded-[24px] border border-foreground/[0.03] flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm">
                        <MapIcon size={16} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-foreground/30 uppercase tracking-widest">Map</p>
                        <p className="text-xs font-bold text-foreground truncate">{activeMatch.map}</p>
                      </div>
                    </div>
                    <div className="bg-foreground/[0.02] p-4 rounded-[24px] border border-foreground/[0.03] flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm">
                        <Activity size={16} className="text-accent" />
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-foreground/30 uppercase tracking-widest">Mode</p>
                        <p className="text-xs font-bold text-foreground truncate">{activeMatch.mode}</p>
                      </div>
                    </div>
                  </div>

                  {/* Live Telemetry Bar */}
                  <div className="mt-6 pt-6 border-t border-foreground/[0.04] flex items-center justify-around">
                    <div className="text-center">
                      <h4 className="text-2xl font-bold text-foreground">{activeMatch.live_stats?.teams_alive || 0}</h4>
                      <p className="text-[9px] font-bold text-foreground/30 uppercase tracking-widest">Alive</p>
                    </div>
                    <div className="w-[1px] h-8 bg-foreground/[0.04]" />
                    <div className="text-center">
                      <h4 className="text-2xl font-bold text-foreground">{activeMatch.live_stats?.total_kills || 0}</h4>
                      <p className="text-[9px] font-bold text-foreground/30 uppercase tracking-widest">Kills</p>
                    </div>
                    <div className="w-[1px] h-8 bg-foreground/[0.04]" />
                    <div className="text-center">
                      <h4 className="text-2xl font-bold text-foreground">{activeMatch.live_stats?.safe_zone_phase || 0}</h4>
                      <p className="text-[9px] font-bold text-foreground/30 uppercase tracking-widest">Zone</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Other Live Rooms - Native List Style */}
              {otherMatches.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-lg font-bold text-foreground">Live Channels</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                      <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">{otherMatches.length} active</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {otherMatches.map((match) => (
                      <motion.div 
                        key={match.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveMatch(match)}
                        className="bg-white p-3 rounded-[28px] border border-foreground/[0.04] shadow-sm flex items-center gap-4 active:shadow-md transition-all cursor-pointer"
                      >
                        <div className="relative w-16 h-16 rounded-[20px] overflow-hidden bg-black flex-shrink-0">
                           <iframe 
                            src={match.stream_url} 
                            className="w-full h-full pointer-events-none scale-150 opacity-40"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Play size={20} fill="white" className="text-white opacity-80" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-foreground truncate">{match.title}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[9px] font-bold text-primary px-2 py-0.5 bg-primary/5 rounded-md uppercase">
                              {match.mode}
                            </span>
                            <span className="text-[9px] flex items-center gap-1 text-foreground/30 font-bold uppercase tracking-wider">
                              <Users size={10} />
                              {match.viewers_count.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded-2xl bg-foreground/[0.03] flex items-center justify-center text-foreground/20">
                          <ChevronRight size={18} />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}
            </>
          ) : (
            <div className="bg-white p-12 rounded-[40px] border border-foreground/[0.04] text-center space-y-6 shadow-sm mt-12">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto text-foreground/10">
                <WifiOff size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-foreground">No Live Battles</h3>
                <p className="text-xs text-foreground/40 font-medium">Currently there are no live tournaments. Check the schedule for upcoming ones.</p>
              </div>
              <button className="w-full py-4 bg-primary text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-primary/20">
                View Schedule
              </button>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
