"use client";

import { BottomNav } from "@/components/layout/BottomNav";
import { TopHeader } from "@/components/layout/TopHeader";
import { 
  Play, 
  Users, 
  Map as MapIcon, 
  WifiOff, 
  ChevronRight, 
  Loader2, 
  Activity, 
  Eye, 
  Signal, 
  LayoutGrid, 
  Trophy 
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { motion } from "framer-motion";

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
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="w-12 h-12 animate-spin text-jungle-teal mb-4" />
        <p className="text-xl text-muted-foreground">Syncing Live Feed...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {activeMatch ? (
        <>
          <section className="space-y-6">
            <div className="relative aspect-video bg-black rounded-[2rem] overflow-hidden border border-border shadow-2xl">
              <iframe 
                src={activeMatch.stream_url} 
                className="w-full h-full"
                allow="autoplay; encrypted-media"
              />
              <div className="absolute top-6 left-6 flex gap-3">
                <div className="bg-red-500 text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  LIVE
                </div>
                <div className="bg-background/80 backdrop-blur-md text-primary px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 border border-border shadow-lg">
                  <Eye size={14} />
                  {activeMatch.viewers_count.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-3xl p-8 space-y-6 shadow-sm">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tight">{activeMatch.title}</h2>
                  <div className="flex items-center gap-4">
                    <p className="text-sm font-medium text-jungle-teal uppercase tracking-widest flex items-center gap-2">
                      <Trophy size={14} /> {activeMatch.tournament?.title}
                    </p>
                    <div className="w-1 h-1 bg-border rounded-full" />
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Users size={14} /> {activeMatch.mode}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                    <MapIcon size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Map Sector</p>
                    <p className="font-bold">{activeMatch.map || 'Bermuda'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                    <Activity size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Operation</p>
                    <p className="font-bold">{activeMatch.mode}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {otherMatches.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <LayoutGrid size={20} className="text-jungle-teal" />
                  Active Relays
                </h3>
              </div>
              <div className="grid gap-4">
                {otherMatches.map((match) => (
                  <motion.div 
                    key={match.id}
                    whileHover={{ x: 4 }}
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      setActiveMatch(match);
                    }}
                    className="bg-card border border-border p-4 rounded-2xl flex items-center gap-4 hover:border-jungle-teal cursor-pointer transition-all"
                  >
                    <div className="relative w-24 aspect-video rounded-lg bg-muted overflow-hidden flex-shrink-0">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Play size={20} className="text-muted-foreground" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold truncate">{match.title}</h4>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest">{match.viewers_count} watching</p>
                    </div>
                    <ChevronRight size={20} className="text-muted-foreground/30" />
                  </motion.div>
                ))}
              </div>
            </section>
          )}
        </>
      ) : (
        <div className="py-32 text-center space-y-6 bg-muted/30 border border-dashed border-border rounded-[2rem]">
          <WifiOff size={64} className="mx-auto text-muted-foreground/20" />
          <div className="space-y-2">
            <h3 className="text-2xl font-bold">Arena Silent</h3>
            <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">No active operations detected</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LivePage() {
  return (
    <div className="min-h-screen pb-24">
      <TopHeader />
      <main className="pt-24 px-6 max-w-4xl mx-auto">
        <Suspense fallback={
          <div className="flex items-center justify-center py-40">
            <Loader2 className="w-8 h-8 animate-spin text-jungle-teal" />
          </div>
        }>
          <LiveContent />
        </Suspense>
      </main>
      <BottomNav />
    </div>
  );
}
