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
  Layout,
  Radio,
  Eye,
  Signal,
  LayoutGrid,
  Trophy
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LiveContent() {
  const searchParams = useSearchParams();
  const matchId = searchParams.get('match');
  
  const [activeMatch, setActiveMatch] = useState<any>(null);
  const [otherMatches, setOtherMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches', filter: "status=eq.live" }, (payload) => {
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
        <Signal className="w-12 h-12 animate-pulse text-secondary mb-4" />
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">Syncing Feed...</p>
      </div>
    );
  }

  return (
    <main className="pb-32 relative z-10">
      <TopHeader />

      <div className="px-6 space-y-10 mt-8 max-w-2xl mx-auto">
        {activeMatch ? 
          <>
            {/* Primary Feed - Cinematic Player */}
              <section className="space-y-6">
                <div className="relative aspect-video bg-black rounded-[40px] overflow-hidden shadow-2xl shadow-primary/10 border border-border group">
                  <iframe 
                    src={activeMatch.stream_url} 
                    className="w-full h-full"
                    allow="autoplay; encrypted-media"
                  />
                  
                  {/* HUD Overlays */}
                  <div className="absolute top-6 left-6 z-20 flex items-center gap-3">
                    <div className="bg-accent text-accent-foreground px-4 py-1.5 rounded-2xl flex items-center gap-2 shadow-2xl text-[10px] font-bold uppercase tracking-widest border border-white/20">
                      <div className="w-1.5 h-1.5 bg-accent-foreground rounded-full animate-pulse" />
                      LIVE
                    </div>
                    <div className="bg-black/40 backdrop-blur-md text-white px-4 py-1.5 rounded-2xl flex items-center gap-2 shadow-2xl text-[10px] font-bold uppercase tracking-widest border border-white/10">
                      <Eye size={14} className="text-accent" />
                      {activeMatch.viewers_count.toLocaleString()}
                    </div>
                  </div>

                  <div className="absolute bottom-6 left-6 right-6 z-20 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                     <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/80">
                       FEED #AX-{activeMatch.id.slice(0,4).toUpperCase()}
                     </div>
                     <button className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all">
                       <LayoutGrid size={18} />
                     </button>
                  </div>
                </div>

                {/* Transmission Intelligence */}
                <div className="bg-card rounded-[40px] p-8 border border-border shadow-sm space-y-8">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h2 className="text-2xl font-heading text-foreground leading-tight">{activeMatch.title}</h2>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-2">
                        <Trophy size={12} className="text-secondary" /> {activeMatch.tournament?.title}
                      </p>
                    </div>
                    <Badge className="bg-secondary/10 text-secondary border-none rounded-full text-[10px] px-4 py-1.5 font-bold tracking-widest">
                      ROUND {activeMatch.current_round}
                    </Badge>
                  </div>

                  {/* Tactical Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/30 p-5 rounded-[28px] border border-border flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-secondary shadow-inner">
                        <MapIcon size={20} />
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Sector</p>
                        <p className="text-sm font-heading text-foreground">{activeMatch.map}</p>
                      </div>
                    </div>
                    <div className="bg-muted/30 p-5 rounded-[28px] border border-border flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-secondary shadow-inner">
                        <Activity size={20} />
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Mode</p>
                        <p className="text-sm font-heading text-foreground">{activeMatch.mode}</p>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Telemetry */}
                  <div className="grid grid-cols-3 gap-2 pt-4 border-t border-border">
                    <div className="text-center space-y-1">
                      <p className="text-[28px] font-heading text-foreground">{activeMatch.live_stats?.teams_alive || 0}</p>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Warriors</p>
                    </div>
                    <div className="text-center space-y-1 border-x border-border">
                      <p className="text-[28px] font-heading text-foreground">{activeMatch.live_stats?.total_kills || 0}</p>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Eliminations</p>
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-[28px] font-heading text-foreground">{activeMatch.live_stats?.safe_zone_phase || 0}</p>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Sector P-{activeMatch.live_stats?.safe_zone_phase || 1}</p>
                    </div>
                  </div>
                </div>
              </section>


            {/* Alternative Relays */}
            {otherMatches.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <div className="space-y-1">
                    <h3 className="text-lg font-heading text-foreground">Alternative <span className="italic font-serif opacity-60">Relays</span></h3>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">SCANNING LIVE SIGNALS</p>
                  </div>
                  <div className="flex items-center gap-2 bg-secondary/10 px-3 py-1.5 rounded-full border border-secondary/20">
                    <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" />
                    <span className="text-[9px] font-bold text-secondary uppercase tracking-widest">{otherMatches.length} RELAYS</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {otherMatches.map((match) => (
                    <motion.div 
                      key={match.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        setActiveMatch(match);
                      }}
                      className="bg-card p-4 rounded-[32px] border border-border shadow-sm flex items-center gap-5 hover:border-secondary/30 transition-all duration-500 cursor-pointer group"
                    >
                      <div className="relative w-20 h-20 rounded-[24px] overflow-hidden bg-black flex-shrink-0 shadow-inner">
                         <iframe 
                          src={match.stream_url} 
                          className="w-full h-full pointer-events-none scale-150 opacity-40 blur-[1px]"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Play size={24} fill="currentColor" className="text-white opacity-60 group-hover:scale-110 group-hover:opacity-100 transition-transform" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <h4 className="font-heading text-foreground truncate group-hover:text-secondary transition-colors">{match.title}</h4>
                        <div className="flex items-center gap-4">
                          <span className="text-[9px] font-bold text-secondary px-3 py-1 bg-secondary/10 rounded-full uppercase tracking-widest">
                            {match.mode}
                          </span>
                          <span className="text-[9px] flex items-center gap-1.5 text-muted-foreground font-bold uppercase tracking-widest">
                            <Eye size={12} className="text-muted-foreground" />
                            {match.viewers_count.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-secondary group-hover:text-white transition-all">
                        <ChevronRight size={20} strokeWidth={3} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}
          <>
        : 
          <div className="py-24 text-center space-y-8 mt-12 bg-muted/20 rounded-[50px] border border-dashed border-border shadow-sm">
            <div className="w-24 h-24 bg-muted rounded-[32px] flex items-center justify-center mx-auto text-muted-foreground/30 shadow-inner">
              <WifiOff size={48} strokeWidth={1} />
            </div>
            <div className="space-y-2 px-10">
              <h3 className="text-2xl font-heading text-foreground">Silent <span className="italic font-serif opacity-60">Frequencies</span></h3>
              <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-[0.2em] leading-loose">No active combat signals detected in the current sector.</p>
            </div>
            <div className="px-10">
              <button className="w-full py-5 bg-secondary text-white rounded-3xl text-[11px] font-bold uppercase tracking-[0.3em] shadow-xl shadow-secondary/20 hover:scale-[1.02] transition-all border-none">
                INITIALIZE RECON
              </button>
            </div>
            </div>
          }
        </div>
      </main>
  );
}

    export default function Live() {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center bg-background">
            <Loader2 className="w-8 h-8 animate-spin text-secondary" />
          </div>
        }>
          <LiveContent />
        </Suspense>
        <BottomNav />
        {/* Background Glows */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0 opacity-30">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-malachite-400/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-sea-green-500/10 blur-[120px] rounded-full" />
        </div>
      </div>
    );
  }
