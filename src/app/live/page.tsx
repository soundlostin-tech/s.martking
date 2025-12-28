"use client";

import { BottomNav } from "@/components/layout/BottomNav";
import { VintageTV } from "@/components/ui/VintageTV";
import { BentoCard } from "@/components/ui/BentoCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, 
  ChevronRight, 
  Loader2, 
  Eye, 
  Calendar, 
  AlertCircle,
  Play,
  Info,
  Users,
  Trophy,
  MessageCircle
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

function LiveContent() {
  const searchParams = useSearchParams();
  const matchId = searchParams.get('match');
  
  const [activeMatch, setActiveMatch] = useState<any>(null);
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
        const selected = matchId ? data.find(m => m.id === matchId) : data[0];
        setActiveMatch(selected || data[0]);
        if (selected) setTvOn(true);
      }
      } catch (err: any) {
        console.error("Error fetching live matches:", err.message || err);
      } finally {
        setLoading(false);
      }
    }, [matchId]);

    useEffect(() => {
      fetchLiveMatches();
    }, [fetchLiveMatches]);

    if (loading) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background" suppressHydrationWarning={true}>
          <Loader2 className="w-12 h-12 animate-spin text-onyx/20 mb-4" />
          <p className="text-[10px] font-bold text-charcoal/40 uppercase tracking-[0.3em]">Tuning in...</p>
        </div>
      );
    }

  return (
    <main className="pb-32 relative z-10">
      {/* Sticker Header with Blobs */}
      <section className="sticker-header relative">
        <div className="sticker-blob sticker-blob-1" style={{ background: 'var(--color-pastel-coral)' }} />
        <div className="sticker-blob sticker-blob-2" style={{ background: 'var(--color-pastel-pink)' }} />
        
        <div className="relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[52px] font-black leading-none mb-2"
          >
            LIVE
          </motion.h1>
          <p className="text-[13px] font-bold text-charcoal/50 uppercase tracking-wide">
            Watch today's action unfold
          </p>
        </div>
      </section>

      <div className="px-4 space-y-6">
        {/* Vintage TV Component (Hero) */}
        <section className="relative">
          <VintageTV 
            streamUrl={activeMatch?.stream_url}
            isOn={tvOn && !!activeMatch}
            onToggle={(on) => setTvOn(on)}
            title={activeMatch?.title}
          />
        </section>

        {activeMatch ? (
          <div className="space-y-4 px-2">
            {/* Now Streaming Info */}
            <BentoCard className="p-6 shadow-soft">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <StatusBadge variant="live" className="mb-3" />
                  <h3 className="text-xl font-black leading-tight">{activeMatch.title}</h3>
                  <Link href={`/matches/${activeMatch.id}`} className="text-[10px] font-bold text-charcoal/40 uppercase tracking-widest underline mt-1 block">
                    View Tournament
                  </Link>
                </div>
                <div className="flex items-center gap-2 bg-pastel-mint px-4 py-2 rounded-2xl">
                  <Eye size={16} className="text-onyx" />
                  <span className="text-sm font-black">{activeMatch.viewers_count?.toLocaleString() || 0}</span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-black/[0.03]">
                <div className="text-center">
                  <div className="w-10 h-10 rounded-xl bg-pastel-lavender mx-auto mb-2 flex items-center justify-center">
                    <Trophy size={18} className="text-onyx" />
                  </div>
                  <p className="text-[13px] font-black">₹{(activeMatch.tournament?.prize_pool || 0).toLocaleString()}</p>
                  <p className="text-[8px] font-bold text-charcoal/40 uppercase tracking-widest">Prize</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 rounded-xl bg-pastel-mint mx-auto mb-2 flex items-center justify-center">
                    <Users size={18} className="text-onyx" />
                  </div>
                  <p className="text-[13px] font-black">{activeMatch.mode || 'SQUAD'}</p>
                  <p className="text-[8px] font-bold text-charcoal/40 uppercase tracking-widest">Mode</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 rounded-xl bg-pastel-coral mx-auto mb-2 flex items-center justify-center">
                    <MessageCircle size={18} className="text-onyx" />
                  </div>
                  <p className="text-[13px] font-black">Chat</p>
                  <p className="text-[8px] font-bold text-charcoal/40 uppercase tracking-widest">Soon</p>
                </div>
              </div>
            </BentoCard>

            {/* Schedule and Rules Grid */}
            <div className="grid grid-cols-1 gap-4">
              {/* Today's Schedule Card */}
              <BentoCard className="p-6 shadow-soft">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-pastel-sky flex items-center justify-center">
                      <Calendar size={18} className="text-onyx" />
                    </div>
                    <h4 className="text-[14px] font-black uppercase tracking-wider">Today's Schedule</h4>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { time: "12:00 PM", title: "Solo Pro Finals", status: "completed" },
                    { time: "03:00 PM", title: "Squad Showdown", status: "live" },
                    { time: "08:00 PM", title: "Night Warriors", status: "upcoming" },
                  ].map((item, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-2xl transition-all",
                          item.status === 'live' ? 'bg-soft-yellow/20' : 'bg-off-white'
                        )}

                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                          <Clock size={18} className="text-onyx/60" />
                        </div>
                        <div>
                          <p className="text-[11px] font-black leading-none mb-1 text-onyx/60">{item.time}</p>
                          <p className="text-[14px] font-black">{item.title}</p>
                        </div>
                      </div>
                      <StatusBadge variant={item.status as any} className="text-[8px] px-3 py-1" />
                    </motion.div>
                  ))}
                </div>
              </BentoCard>

              {/* Rules & Fair Play Card */}
              <BentoCard variant="pastel" pastelColor="lavender" className="p-6 relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center">
                      <Info size={18} className="text-onyx" />
                    </div>
                    <h4 className="text-[14px] font-black uppercase tracking-wider">Fair Play</h4>
                  </div>
                  <p className="text-[13px] font-bold text-charcoal-brown/60 mb-5 leading-relaxed">
                    All matches are monitored by anti-cheat protocols. Stay clean, win fair, and become a champion.
                  </p>
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 text-onyx"
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest underline">Full Guidelines</span>
                    <ChevronRight size={14} />
                  </motion.button>
                </div>
                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/30 rounded-full" />
              </BentoCard>
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="px-2">
            <BentoCard className="p-12 text-center shadow-soft flex flex-col items-center relative overflow-hidden">
              <div className="relative z-10">
                <div className="w-24 h-24 rounded-full bg-off-white flex items-center justify-center mb-6 mx-auto">
                  <AlertCircle size={48} className="text-charcoal/10" />
                </div>
                <h3 className="text-2xl font-black mb-2">Stream Offline</h3>
                <p className="text-[11px] text-charcoal/40 mb-8 font-bold uppercase tracking-widest max-w-[240px] mx-auto">
                  No tournaments are broadcasting right now. Check back later!
                </p>
                <Link href="/matches">
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-onyx text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl"
                  >
                    Browse Matches
                  </motion.button>
                </Link>
              </div>
              <div className="absolute top-0 right-0 w-40 h-40 bg-pastel-coral/30 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-pastel-mint/30 rounded-full blur-3xl" />
            </BentoCard>
          </div>
        )}
      </div>
    </main>
  );
}

export default function Live() {
  return (
    <div className="min-h-screen bg-background text-onyx" suppressHydrationWarning={true}>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-background" suppressHydrationWarning={true}>
          <Loader2 className="w-10 h-10 animate-spin text-onyx/20" />
        </div>
      }>
        <LiveContent />
      </Suspense>
      <BottomNav />
    </div>
  );
}
