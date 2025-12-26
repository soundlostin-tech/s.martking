"use client";

import { BottomNav } from "@/components/layout/BottomNav";
import { TopHeader } from "@/components/layout/TopHeader";
import { PaperWrapper } from "@/components/layout/PaperWrapper";
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
        <Signal className="w-12 h-12 animate-pulse text-[#000033]/20 mb-4" />
        <p className="text-xl opacity-40">Syncing Feed...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {activeMatch ? (
        <>
          <section className="space-y-6">
            <div className="relative aspect-video bg-[#000033]/5 rounded-3xl overflow-hidden border-2 border-[#000033]/10 shadow-lg -rotate-1">
              <iframe 
                src={activeMatch.stream_url} 
                className="w-full h-full"
                allow="autoplay; encrypted-media"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  LIVE
                </div>
                <div className="bg-white/80 backdrop-blur-sm text-[#000033] px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 border border-[#000033]/10">
                  <Eye size={12} />
                  {activeMatch.viewers_count}
                </div>
              </div>
            </div>

            <div className="border-2 border-[#000033]/10 rounded-3xl p-6 space-y-6 rotate-1">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h2 className="text-3xl m-0">{activeMatch.title}</h2>
                  <p className="text-sm opacity-40 uppercase tracking-widest flex items-center gap-2">
                    <Trophy size={12} /> {activeMatch.tournament?.title}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border-2 border-[#000033]/5 p-4 rounded-2xl flex items-center gap-4">
                  <MapIcon size={18} className="opacity-30" />
                  <div>
                    <p className="text-[10px] opacity-30 uppercase tracking-widest m-0">Sector</p>
                    <p className="text-xl m-0">{activeMatch.map}</p>
                  </div>
                </div>
                <div className="border-2 border-[#000033]/5 p-4 rounded-2xl flex items-center gap-4">
                  <Activity size={18} className="opacity-30" />
                  <div>
                    <p className="text-[10px] opacity-30 uppercase tracking-widest m-0">Mode</p>
                    <p className="text-xl m-0">{activeMatch.mode}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {otherMatches.length > 0 && (
            <section className="space-y-6">
              <h3 className="text-3xl -rotate-2">Other Relays</h3>
              <div className="space-y-4">
                {otherMatches.map((match) => (
                  <motion.div 
                    key={match.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      setActiveMatch(match);
                    }}
                    className="border-2 border-[#000033]/10 p-4 rounded-2xl flex items-center gap-4 hover:bg-[#000033]/5 cursor-pointer transition-all"
                  >
                    <div className="w-16 h-16 rounded-xl bg-[#000033]/5 flex items-center justify-center flex-shrink-0">
                      <Play size={20} className="opacity-40" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xl m-0 truncate">{match.title}</h4>
                      <p className="text-xs opacity-40 uppercase tracking-widest">{match.mode} • {match.viewers_count} watching</p>
                    </div>
                    <ChevronRight size={20} className="opacity-20" />
                  </motion.div>
                ))}
              </div>
            </section>
          )}
        </>
      ) : (
        <div className="py-24 text-center space-y-6 border-2 border-dashed border-[#000033]/10 rounded-3xl rotate-1">
          <WifiOff size={48} className="mx-auto opacity-10" />
          <div className="space-y-1">
            <h3 className="text-3xl">Silent Arena</h3>
            <p className="text-xl opacity-40">No live battles detected in this sector.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LivePage() {
  return (
    <div className="w-full">
      <TopHeader />
      <PaperWrapper className="mt-20">
        <Suspense fallback={
          <div className="flex items-center justify-center py-40">
            <Loader2 className="w-8 h-8 animate-spin text-[#000033]/10" />
          </div>
        }>
          <LiveContent />
        </Suspense>
      </PaperWrapper>
      <BottomNav />
    </div>
  );
}
