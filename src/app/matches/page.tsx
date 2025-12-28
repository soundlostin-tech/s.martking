"use client";

import { BottomNav } from "@/components/layout/BottomNav";
import { TopHeader } from "@/components/layout/TopHeader";
import { BentoCard } from "@/components/ui/BentoCard";
import { ChipGroup } from "@/components/ui/Chip";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useState, useEffect, useCallback } from "react";
import { Search, Loader2, Trophy, Calendar, Users, ChevronRight, AlertCircle, Swords } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

const filters = ["All", "Upcoming", "Live", "Completed"];

export default function MatchesPage() {
  const { user } = useAuth(false);
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
    } catch (error) {
      console.error("Error fetching matches:", error);
    } finally {
      setLoading(false);
    }
  }, [activeFilter, searchQuery]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  return (
    <div className="min-h-screen bg-background text-onyx">
      <main className="pb-32 relative z-10">
        <TopHeader />

        {/* Sticker Header */}
        <section className="sticker-header">
          <div className="sticker-blob bg-pastel-mint" />
          <p className="text-[10px] font-bold text-charcoal/40 uppercase tracking-widest leading-none mb-3">Arena Lobby</p>
          <h1 className="text-[48px] font-black leading-none mb-2">Matches</h1>
          <p className="text-[12px] font-bold text-charcoal/40 uppercase tracking-tighter">Join the action today</p>
        </section>

        {/* Search & Filter */}
        <section className="px-6 space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal opacity-40" size={18} />
            <input 
              type="text" 
              placeholder="Search tournaments..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-black/5 rounded-2xl py-4 pl-12 pr-4 text-[14px] font-medium focus:ring-2 focus:ring-onyx/5 transition-all placeholder:text-charcoal/40 text-onyx shadow-sm"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "chip",
                  activeFilter === filter ? "chip-selected" : "chip-default"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </section>

        {/* Match List */}
        <section className="px-6 pt-8 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-onyx/20" />
              <p className="text-[10px] text-charcoal/40 font-bold uppercase tracking-widest">Entering Lobby...</p>
            </div>
          ) : matches.length > 0 ? (
            <AnimatePresence mode="popLayout">
              {matches.map((match, i) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link href={`/matches/${match.id}`}>
                    <BentoCard className="p-6 space-y-4 border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-pastel-yellow flex items-center justify-center">
                            <Trophy size={20} className="text-onyx" />
                          </div>
                          <div>
                            <h3 className="text-lg font-black leading-tight">{match.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[9px] font-black bg-onyx text-white px-2 py-0.5 rounded-md uppercase tracking-widest">{match.mode}</span>
                              <span className="text-[10px] text-charcoal/40 font-bold uppercase tracking-wider">₹{match.tournament?.entry_fee} Entry</span>
                            </div>
                          </div>
                        </div>
                        <StatusBadge variant={match.status as any} />
                      </div>

                      <div className="flex justify-between items-end pt-4 border-t border-black/[0.03]">
                        <div>
                          <p className="text-[9px] font-bold text-charcoal/30 uppercase tracking-widest leading-none mb-1">Prize Pool</p>
                          <p className="text-xl font-black leading-none text-onyx">₹{match.tournament?.prize_pool?.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] font-bold text-charcoal/30 uppercase tracking-widest leading-none mb-1">Starts</p>
                          <p className="text-sm font-black text-onyx">
                            {match.start_time ? new Date(match.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 pt-2">
                        <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-onyx/20 rounded-full"
                            style={{ width: `${Math.min(100, ((match.current_slots || 0) / (match.tournament?.slots || 48)) * 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center text-[8px] font-bold text-charcoal/30 uppercase tracking-widest">
                          <span>{match.current_slots || 0} / {match.tournament?.slots || 48} Slots Filled</span>
                          <span className="text-onyx">{Math.round(((match.current_slots || 0) / (match.tournament?.slots || 48)) * 100)}%</span>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <motion.button 
                          whileTap={{ scale: 0.95 }}
                          className={cn(
                            "px-6 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm",
                            match.status === 'upcoming' ? "bg-onyx text-white" : "bg-silver/20 text-charcoal"
                          )}
                        >
                          {match.status === 'upcoming' ? 'Join Tournament' : match.status === 'live' ? 'Watch Live' : 'Results'}
                          <ChevronRight size={16} />
                        </motion.button>
                      </div>
                    </BentoCard>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <BentoCard className="p-12 text-center border-none shadow-sm flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-off-white flex items-center justify-center mb-6">
                <AlertCircle size={40} className="text-charcoal/10" />
              </div>
              <h3 className="text-2xl font-black mb-2">No Matches Found</h3>
              <p className="text-xs text-charcoal/40 mb-8 font-bold uppercase tracking-widest">
                Try adjusting your filters
              </p>
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => { setActiveFilter("All"); setSearchQuery(""); }}
                className="px-8 py-4 bg-onyx text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl"
              >
                Refresh
              </motion.button>
            </BentoCard>
          )}
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
