"use client";

import { BottomNav } from "@/components/layout/BottomNav";
import { TopHeader } from "@/components/layout/TopHeader";
import { BentoCard } from "@/components/ui/BentoCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useState, useEffect, useCallback } from "react";
import { Search, Loader2, Trophy, Calendar, Users, ChevronRight, AlertCircle, Swords, Clock, Play } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useHaptics } from "@/hooks/useHaptics";

const filters = ["All", "Upcoming", "Live", "Completed"];

export default function MatchesPage() {
  const { user } = useAuth(false);
  const { triggerHaptic } = useHaptics();
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMatches = useCallback(async () => {
    try {
      let query = supabase
        .from("matches")
        .select(`*, tournament:tournaments(title, entry_fee, prize_pool, slots)`);
      
      if (activeFilter !== "All") {
        query = query.eq("status", activeFilter.toLowerCase());
      }

      const { data, error } = await query.order("start_time", { ascending: true });
      
      if (error) throw error;

      let filteredData = data || [];
      if (searchQuery) {
        filteredData = filteredData.filter(m => 
          m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
          m.tournament?.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      const withCounts = await Promise.all(filteredData.map(async (m) => {
        const { count } = await supabase
          .from("participants")
          .select("user_id", { count: 'exact' })
          .eq("match_id", m.id);
        return { ...m, current_slots: count || 0 };
      }));

      setMatches(withCounts);
    } catch (error: any) {
      console.error("Error fetching matches:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        error
      });
    } finally {
      setLoading(false);
    }
  }, [activeFilter, searchQuery]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const liveMatches = matches.filter(m => m.status === 'live');
  const upcomingMatches = matches.filter(m => m.status === 'upcoming');

    return (
<div className="min-h-screen text-onyx bg-transparent relative" suppressHydrationWarning={true}>
<main className="pb-32 relative z-10" suppressHydrationWarning={true}>
          
          {/* Header Section */}
        <section className="relative pt-16 pb-14 px-8 overflow-hidden bg-transparent" suppressHydrationWarning={true}>
          
          <div className="relative z-10" suppressHydrationWarning={true}>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[42px] font-black leading-[0.95] mb-3"
            >
              Matches
            </motion.h1>
            <p className="text-[13px] font-bold text-charcoal/50 uppercase tracking-wide">
              Join the action today
            </p>
          </div>
        </section>

        {/* Search & Filter */}
        <section className="px-6 space-y-5 mb-6" suppressHydrationWarning={true}>
          <div className="relative" suppressHydrationWarning={true}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal opacity-30" size={20} />
            <input 
              type="text" 
              placeholder="Search tournaments..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white rounded-2xl py-4 pl-12 pr-4 text-[14px] font-bold focus:ring-2 focus:ring-onyx/10 transition-all placeholder:text-charcoal/30 text-onyx shadow-soft"
            />
          </div>

            <div className="flex gap-2 overflow-x-auto no-scrollbar" suppressHydrationWarning={true}>
              {filters.map((filter) => (
                <motion.button
                  key={filter}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    triggerHaptic('light');
                    setActiveFilter(filter);
                  }}
                  className={cn(
                    "chip",
                    activeFilter === filter ? "chip-selected" : "chip-default"
                  )}
                >
                  {filter === 'Live' && <span className="w-2 h-2 rounded-full bg-current mr-2" />}
                  {filter}
                </motion.button>
              ))}
            </div>
        </section>

        {/* Live Now Section */}
        {liveMatches.length > 0 && activeFilter !== 'Completed' && activeFilter !== 'Upcoming' && (
          <section className="px-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-pastel-coral animate-pulse" />
              <h3 className="text-lg font-black">Live Now</h3>
            </div>
            <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-6 px-6">
              {liveMatches.map((match, i) => (
                <Link key={match.id} href={`/matches/${match.id}`}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <BentoCard variant="vibrant" className="min-w-[280px] p-5 relative overflow-hidden">
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <StatusBadge variant="live" />
                          <div className="flex items-center gap-1 text-onyx/60">
                            <Users size={14} />
                            <span className="text-[10px] font-black">{match.viewers_count || 0}</span>
                          </div>
                        </div>
                        <h4 className="text-lg font-black leading-tight mb-1">{match.tournament?.title}</h4>
                        <p className="text-[10px] font-bold text-onyx/50 uppercase tracking-widest mb-4">
                          {match.mode} • ₹{match.tournament?.entry_fee} Entry
                        </p>
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-[8px] font-bold text-onyx/40 uppercase tracking-widest">Prize</p>
                            <p className="text-lg font-black">₹{match.tournament?.prize_pool?.toLocaleString()}</p>
                          </div>
                          <motion.button 
                            whileTap={{ scale: 0.9 }}
                            className="w-10 h-10 bg-onyx rounded-xl flex items-center justify-center"
                          >
                            <Play size={16} className="text-pastel-sky" fill="currentColor" />
                          </motion.button>
                        </div>
                      </div>
                      <Trophy className="absolute top-4 right-4 text-onyx/5" size={80} />
                    </BentoCard>
                  </motion.div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Match List */}
        <section className="px-6 space-y-4" suppressHydrationWarning={true}>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4" suppressHydrationWarning={true}>
              <Loader2 className="w-12 h-12 animate-spin text-onyx/20" />
              <p className="text-[10px] text-charcoal/40 font-bold uppercase tracking-widest">Entering Lobby...</p>
            </div>
          ) : matches.length > 0 ? (
            <AnimatePresence mode="popLayout">
              {matches.filter(m => activeFilter === 'All' || m.status === activeFilter.toLowerCase()).map((match, i) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Link href={`/matches/${match.id}`}>
                    <BentoCard className="p-5 shadow-soft relative overflow-hidden">
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-14 h-14 rounded-2xl flex items-center justify-center",
                              match.status === 'live' ? 'bg-soft-yellow' :
                              match.status === 'upcoming' ? 'bg-pastel-sky' : 'bg-silver/30'
                            )}>
                              <Trophy size={22} className="text-onyx" />
                            </div>
                            <div>
                              <h3 className="text-[17px] font-black leading-tight">{match.title || match.tournament?.title}</h3>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-[9px] font-black bg-onyx text-white px-2.5 py-1 rounded-lg uppercase tracking-widest">{match.mode}</span>
                                <span className="text-[10px] text-charcoal/40 font-bold uppercase tracking-wider">₹{match.tournament?.entry_fee}</span>
                              </div>
                            </div>
                          </div>
                          <StatusBadge variant={match.status as any} />
                        </div>

                        <div className="flex justify-between items-end pt-4 border-t border-black/[0.03]">
                          <div className="flex gap-6">
                            <div>
                              <p className="text-[8px] font-bold text-charcoal/30 uppercase tracking-widest mb-1">Prize Pool</p>
                              <p className="text-xl font-black">₹{match.tournament?.prize_pool?.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-[8px] font-bold text-charcoal/30 uppercase tracking-widest mb-1">Starts</p>
                              <p className="text-sm font-black flex items-center gap-1">
                                <Clock size={12} />
                                {match.start_time ? new Date(match.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                              </p>
                            </div>
                          </div>
                          <motion.button 
                            whileTap={{ scale: 0.95 }}
                            className={cn(
                              "px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2",
                              match.status === 'upcoming' ? "bg-onyx text-white" : 
                              match.status === 'live' ? "bg-soft-yellow text-onyx" : "bg-silver/20 text-charcoal"
                            )}
                          >
                            {match.status === 'upcoming' ? 'Join' : match.status === 'live' ? 'Watch' : 'Results'}
                            <ChevronRight size={14} />
                          </motion.button>
                        </div>

                        {/* Capacity Bar */}
                        <div className="mt-4 space-y-1.5">
                          <div className="w-full h-1.5 bg-off-white rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, ((match.current_slots || 0) / (match.tournament?.slots || 48)) * 100)}%` }}
                              transition={{ delay: 0.2, duration: 0.5 }}
                              className={cn(
                                "h-full rounded-full",
                                match.status === 'live' ? 'bg-soft-yellow' : 'bg-onyx/20'
                              )}
                            />
                          </div>
                          <div className="flex justify-between items-center text-[8px] font-bold text-charcoal/30 uppercase tracking-widest">
                            <span>{match.current_slots || 0} / {match.tournament?.slots || 48} Slots</span>
                            <span className="text-onyx">{Math.round(((match.current_slots || 0) / (match.tournament?.slots || 48)) * 100)}%</span>
                          </div>
                        </div>
                      </div>
                    </BentoCard>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <BentoCard className="p-12 text-center shadow-soft flex flex-col items-center relative overflow-hidden">
              <div className="relative z-10">
                <div className="w-20 h-20 rounded-full bg-off-white flex items-center justify-center mb-6 mx-auto">
                  <AlertCircle size={40} className="text-charcoal/10" />
                </div>
                <h3 className="text-2xl font-black mb-2">No Matches Found</h3>
                <p className="text-[11px] text-charcoal/40 mb-8 font-bold uppercase tracking-widest">
                  Try adjusting your filters
                </p>
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setActiveFilter("All"); setSearchQuery(""); }}
                  className="px-8 py-4 bg-onyx text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl"
                >
                  Reset Filters
                </motion.button>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-pastel-mint/30 rounded-full blur-3xl" />
            </BentoCard>
          )}
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
