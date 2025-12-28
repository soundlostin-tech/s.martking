"use client";

import { use, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, Calendar, Clock, Trophy, Users, Shield, 
  ChevronDown, CheckCircle2, AlertCircle, Loader2, ArrowRight
} from "lucide-react";
import { BottomNav } from "@/components/layout/BottomNav";
import { TopHeader } from "@/components/layout/TopHeader";
import { BentoCard } from "@/components/ui/BentoCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function MatchDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth(false);
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  
  const [expandedSection, setExpandedSection] = useState<string | null>("prizes");

  const fetchData = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("matches")
        .select(`*, tournament:tournaments(*)`)
        .eq("id", id)
        .single();

      if (error) throw error;
      setMatch(data);

      if (user) {
        const { data: participant } = await supabase
          .from("participants")
          .select("*")
          .eq("match_id", id)
          .eq("user_id", user.id)
          .single();
        setIsJoined(!!participant);
      }
    } catch (error) {
      console.error("Error fetching match details:", error);
      toast.error("Match not found");
      router.push("/matches");
    } finally {
      setLoading(false);
    }
  }, [id, user, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleJoin = async () => {
    if (!user) {
      router.push("/signin");
      return;
    }

    setJoining(true);
    try {
      const { data, error } = await supabase.rpc('join_tournament', {
        p_tournament_id: match.tournament_id,
        p_match_id: match.id
      });

      if (error) throw error;
      const result = typeof data === 'string' ? JSON.parse(data) : data;

      if (result.success) {
        toast.success(result.message);
        fetchData();
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to join");
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-onyx/20 mb-4" />
        <p className="text-[10px] font-bold text-charcoal/40 uppercase tracking-[0.3em]">Loading Arena...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-onyx">
      <main className="pb-40 relative z-10">
        {/* Colorful Sticker Header */}
        <section className="relative pt-16 pb-12 px-6 bg-pastel-mint rounded-b-[48px] shadow-sm overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
             <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white blur-3xl" />
             <div className="absolute top-20 -left-10 w-32 h-32 rounded-full bg-onyx blur-3xl" />
          </div>

          <div className="relative z-10 flex items-center justify-between mb-8">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => router.back()}
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm"
            >
              <ChevronLeft size={24} />
            </motion.button>
            <StatusBadge variant={match.status as any} />
          </div>

          <div className="relative z-10">
            <h1 className="text-[32px] font-black leading-tight mb-2">{match.title}</h1>
            <p className="text-xs font-bold text-onyx/40 uppercase tracking-widest">{match.tournament?.title}</p>
          </div>
        </section>

        <div className="px-6 -mt-8 space-y-4">
          {/* Key Facts Grid */}
          <div className="grid grid-cols-2 gap-4">
            <BentoCard className="p-5 flex flex-col justify-between h-32 shadow-sm">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-charcoal/30" />
                <span className="text-[9px] font-bold text-charcoal/30 uppercase tracking-widest">Date</span>
              </div>
              <p className="text-sm font-black">
                {match.start_time ? new Date(match.start_time).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}
              </p>
            </BentoCard>

            <BentoCard className="p-5 flex flex-col justify-between h-32 shadow-sm">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-charcoal/30" />
                <span className="text-[9px] font-bold text-charcoal/30 uppercase tracking-widest">Time</span>
              </div>
              <p className="text-sm font-black">
                {match.start_time ? new Date(match.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}
              </p>
            </BentoCard>

            <BentoCard className="p-5 flex flex-col justify-between h-32 shadow-sm">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-charcoal/30" />
                <span className="text-[9px] font-bold text-charcoal/30 uppercase tracking-widest">Mode</span>
              </div>
              <p className="text-sm font-black uppercase tracking-wider">{match.mode}</p>
            </BentoCard>

            <BentoCard className="p-5 flex flex-col justify-between h-32 shadow-sm">
              <div className="flex items-center gap-2">
                <Trophy size={16} className="text-charcoal/30" />
                <span className="text-[9px] font-bold text-charcoal/30 uppercase tracking-widest">Map</span>
              </div>
              <p className="text-sm font-black">Bermuda</p>
            </BentoCard>
          </div>

          {/* Pricing Bento */}
          <BentoCard variant="dark" className="p-6 flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1">Entry Fee</p>
              <p className="text-2xl font-black text-white">₹{match.tournament?.entry_fee || 0}</p>
            </div>
            <div className="h-10 w-[1px] bg-white/10" />
            <div className="text-right">
              <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1">Prize Pool</p>
              <p className="text-2xl font-black text-lime-yellow">₹{match.tournament?.prize_pool?.toLocaleString() || 0}</p>
            </div>
          </BentoCard>

          {/* Prize Breakdown (Expandable) */}
          <BentoCard className="p-0 overflow-hidden border-none shadow-sm">
            <button 
              onClick={() => setExpandedSection(expandedSection === 'prizes' ? null : 'prizes')}
              className="w-full p-6 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Trophy size={20} className="text-charcoal/20" />
                <h3 className="text-[14px] font-black uppercase tracking-wider">Prize Breakdown</h3>
              </div>
              <motion.div animate={{ rotate: expandedSection === 'prizes' ? 180 : 0 }}>
                <ChevronDown size={20} className="text-charcoal/30" />
              </motion.div>
            </button>
            <AnimatePresence>
              {expandedSection === 'prizes' && (
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="px-6 pb-6 space-y-4"
                >
                  {[
                    { rank: "1st Place", prize: `₹${Math.floor(match.tournament?.prize_pool * 0.5)}` },
                    { rank: "2nd Place", prize: `₹${Math.floor(match.tournament?.prize_pool * 0.3)}` },
                    { rank: "3rd Place", prize: `₹${Math.floor(match.tournament?.prize_pool * 0.2)}` }
                  ].map((p, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-black/[0.03] last:border-0">
                      <span className="text-[12px] font-bold text-charcoal/60 uppercase tracking-widest">{p.rank}</span>
                      <span className="text-sm font-black text-onyx">{p.prize}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </BentoCard>

          {/* Rules (Expandable) */}
          <BentoCard className="p-0 overflow-hidden border-none shadow-sm">
            <button 
              onClick={() => setExpandedSection(expandedSection === 'rules' ? null : 'rules')}
              className="w-full p-6 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Shield size={20} className="text-charcoal/20" />
                <h3 className="text-[14px] font-black uppercase tracking-wider">Tournament Rules</h3>
              </div>
              <motion.div animate={{ rotate: expandedSection === 'rules' ? 180 : 0 }}>
                <ChevronDown size={20} className="text-charcoal/30" />
              </motion.div>
            </button>
            <AnimatePresence>
              {expandedSection === 'rules' && (
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="px-6 pb-6 space-y-4"
                >
                  <ul className="space-y-3">
                    {[
                      "No emulator players allowed.",
                      "Teaming up will result in immediate ban.",
                      "Ensure your FF UID matches your profile.",
                      "Room ID/Password revealed 15m before start."
                    ].map((rule, i) => (
                      <li key={i} className="flex items-start gap-3 text-[12px] font-bold text-charcoal/60 leading-relaxed">
                        <div className="w-1.5 h-1.5 rounded-full bg-onyx mt-1.5 flex-shrink-0" />
                        {rule}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </BentoCard>

          {/* How to Join Steps */}
          <BentoCard variant="pastel" pastelColor="lavender" className="p-6 space-y-6">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                  <Play size={20} className="text-onyx" />
                </div>
                <h3 className="text-[14px] font-black uppercase tracking-wider">How to join</h3>
             </div>
             <div className="space-y-4">
               {[
                 { step: 1, text: "Pay the entry fee from your wallet." },
                 { step: 2, text: "Wait for the room code (revealed 15m prior)." },
                 { step: 3, text: "Copy code, open Free Fire, and join." }
               ].map((s) => (
                 <div key={s.step} className="flex items-start gap-4">
                   <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[10px] font-black flex-shrink-0">
                     {s.step}
                   </span>
                   <p className="text-[12px] font-bold text-onyx/60 leading-tight pt-1">{s.text}</p>
                 </div>
               ))}
             </div>
          </BentoCard>
        </div>
      </main>

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-0 w-full p-6 bg-white/80 backdrop-blur-xl border-t border-black/5 z-50">
        {isJoined ? (
          <div className="flex gap-4">
            <BentoCard className="flex-1 p-4 bg-pastel-mint border-none flex flex-col justify-center">
              <p className="text-[9px] font-bold text-onyx/40 uppercase tracking-widest mb-1">Room Code</p>
              <p className="text-sm font-black tracking-[0.2em]">REVEALING SOON</p>
            </BentoCard>
            <motion.button 
              whileTap={{ scale: 0.95 }}
              className="px-8 bg-onyx text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest shadow-xl flex items-center justify-center"
            >
              Help
            </motion.button>
          </div>
        ) : (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleJoin}
            disabled={joining || match.status !== 'upcoming'}
            className={cn(
              "w-full py-5 rounded-[24px] text-[14px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl transition-all",
              match.status === 'upcoming' 
                ? "bg-lime-yellow text-onyx shadow-lime-yellow/20" 
                : "bg-silver/20 text-charcoal cursor-not-allowed"
            )}
          >
            {joining ? <Loader2 size={20} className="animate-spin" /> : (
              <>
                Join Tournament — ₹{match.tournament?.entry_fee}
                <ArrowRight size={20} />
              </>
            )}
          </motion.button>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
