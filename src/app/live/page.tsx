"use client";

import { BottomNav } from "@/components/layout/BottomNav";
import { TopHeader } from "@/components/layout/TopHeader";
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
  Info
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
    } catch (err) {
      console.error("Error fetching live matches:", err);
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    fetchLiveMatches();
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

      {/* Sticker Header */}
      <section className="sticker-header">
        <div className="sticker-blob bg-pastel-coral" />
        <p className="text-[10px] font-bold text-charcoal/40 uppercase tracking-widest leading-none mb-3">Airwaves</p>
        <h1 className="text-[48px] font-black leading-none mb-2">LIVE</h1>
        <p className="text-[12px] font-bold text-charcoal/40 uppercase tracking-tighter">Watch today's action</p>
      </section>

      <div className="px-6 space-y-6">
        {/* Vintage TV Component (Hero) */}
        <section className="relative -mx-2">
          <VintageTV 
            streamUrl={activeMatch?.stream_url}
            isOn={tvOn && !!activeMatch}
            onToggle={(on) => setTvOn(on)}
            title={activeMatch?.title}
          />
        </section>

        {activeMatch ? (
          <div className="space-y-4">
            {/* Now Streaming Info */}
            <BentoCard className="p-6 border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <StatusBadge variant="live" />
                  <h3 className="text-xl font-black mt-3 leading-tight">{activeMatch.title}</h3>
                  <Link href={`/matches/${activeMatch.id}`} className="text-[10px] font-bold text-charcoal/40 uppercase tracking-widest underline mt-1 block">
                    Tournament Details
                  </Link>
                </div>
                <div className="flex items-center gap-2 bg-pastel-mint px-3 py-1.5 rounded-xl">
                  <Eye size={14} className="text-onyx" />
                  <span className="text-xs font-black">{activeMatch.viewers_count?.toLocaleString() || 0}</span>
                </div>
              </div>
            </BentoCard>

            {/* Grid for Schedule and Rules */}
            <div className="grid grid-cols-1 gap-4">
              {/* Today's Schedule Card */}
              <BentoCard className="p-6 border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-[14px] font-black uppercase tracking-wider">Today's Schedule</h4>
                  <Calendar size={18} className="text-charcoal/20" />
                </div>
                <div className="space-y-4">
                  {[
                    { time: "12:00 PM", title: "Solo Pro Finals", status: "completed" },
                    { time: "03:00 PM", title: "Squad Showdown", status: "live" },
                    { time: "08:00 PM", title: "Night Warriors", status: "upcoming" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-black/[0.03] last:border-0">
                      <div className="flex items-center gap-3">
                        <Clock size={14} className="text-charcoal/20" />
                        <div>
                          <p className="text-[10px] font-black leading-none mb-1">{item.time}</p>
                          <p className="text-[12px] font-bold text-charcoal/60">{item.title}</p>
                        </div>
                      </div>
                      <StatusBadge variant={item.status as any} className="text-[8px] px-2 py-1" />
                    </div>
                  ))}
                </div>
              </BentoCard>

              {/* Rules & Fair Play Card */}
              <BentoCard variant="pastel" pastelColor="lavender" className="p-6 border-none shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <Info size={20} className="text-onyx/40" />
                  <h4 className="text-[14px] font-black uppercase tracking-wider">Fair Play</h4>
                </div>
                <p className="text-[12px] font-bold text-charcoal-brown/60 mb-4 leading-relaxed">
                  All matches are monitored by anti-cheat protocols. Stay clean, win fair.
                </p>
                <button className="text-[10px] font-black uppercase tracking-widest underline">Full Guidelines</button>
              </BentoCard>
            </div>
          </div>
        ) : (
          /* Empty State */
          <BentoCard className="p-12 text-center border-none shadow-sm flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-off-white flex items-center justify-center mb-6">
              <AlertCircle size={40} className="text-charcoal/10" />
            </div>
            <h3 className="text-2xl font-black mb-2">Stream Offline</h3>
            <p className="text-xs text-charcoal/40 mb-8 font-bold uppercase tracking-widest max-w-[200px]">
              No tournaments are broadcasting right now
            </p>
            <Link href="/matches">
              <motion.button 
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-onyx text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl"
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
