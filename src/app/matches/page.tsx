"use client";

import { BottomNav } from "@/components/layout/BottomNav";
import { TopHeader } from "@/components/layout/TopHeader";
import { BentoCard } from "@/components/ui/BentoCard";
import { ChipGroup } from "@/components/ui/Chip";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useState, useEffect, useCallback } from "react";
import { Search, Loader2, Trophy, Calendar, Users, ChevronRight, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const filters = ["All", "Upcoming", "Live", "Completed"];

export default function MatchesPage() {
  const { user } = useAuth(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);

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
      toast.error("Failed to load matches");
    } finally {
      setLoading(false);
    }
  }, [activeFilter, searchQuery]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const handleJoinMatch = async (tournamentId: string, matchId: string) => {
    if (!user) {
      toast.error("Please sign in to join");
      return;
    }

    setJoining(matchId);
    try {
      const { data, error } = await supabase.rpc('join_tournament', {
        p_tournament_id: tournamentId,
        p_match_id: matchId
      });

      if (error) throw error;

      const result = typeof data === 'string' ? JSON.parse(data) : data;

      if (result.success) {
        toast.success(result.message);
        fetchMatches();
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      console.error("Error joining match:", error);
      toast.error(error.message || "Failed to join");
    } finally {
      setJoining(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#D4D7DE] text-[#11130D]">
      <main className="pb-28 relative z-10">
        <TopHeader />

        {/* Pastel Blob Header */}
        <section className="relative px-4 sm:px-6 pt-6 pb-4 blob-header blob-header-coral">
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-[#4A4B48] uppercase tracking-[0.2em] mb-1">
              Tournament Hub
            </p>
            <h2 className="text-2xl sm:text-3xl font-heading text-[#11130D]">
              All <span className="text-[#868935]">Matches</span>
            </h2>
          </div>
        </section>

        {/* Search & Filter */}
        <section className="px-4 sm:px-6 pt-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4A4B48]" size={18} />
            <input 
              type="text" 
              placeholder="Search matches..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#C8C8C4]/30 rounded-xl py-3.5 pl-12 pr-4 text-[13px] font-medium focus:ring-2 focus:ring-[#D7FD03]/50 focus:border-[#D7FD03] transition-all placeholder:text-[#4A4B48]/50 text-[#11130D]"
            />
          </div>

          <ChipGroup 
            options={filters}
            selected={activeFilter}
            onChange={setActiveFilter}
          />
        </section>

        {/* Match List */}
        <section className="px-4 sm:px-6 pt-6 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-[#868935]" />
              <p className="text-[10px] text-[#4A4B48] font-bold uppercase tracking-wider">Loading matches...</p>
            </div>
          ) : matches.length > 0 ? (
            <AnimatePresence mode="popLayout">
              {matches.map((match, i) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <BentoCard className="p-5 space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          match.status === 'live' 
                            ? 'bg-[#D7FD03]/20' 
                            : 'bg-[#E8E9EC]'
                        }`}>
                          <Trophy size={20} className={match.status === 'live' ? 'text-[#868935]' : 'text-[#4A4B48]'} />
                        </div>
                        <div>
                          <h3 className="text-[15px] font-heading text-[#11130D]">{match.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold text-[#4A4B48] bg-[#E8E9EC] px-2 py-0.5 rounded-md">{match.mode}</span>
                            <span className="text-[10px] text-[#4A4B48]">{match.tournament?.title}</span>
                          </div>
                        </div>
                      </div>
                      <StatusBadge variant={match.status === 'live' ? 'live' : match.status === 'upcoming' ? 'upcoming' : 'completed'} />
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-[#E8E9EC] rounded-xl p-3 flex items-center gap-3">
                        <Calendar size={16} className="text-[#868935]" />
                        <div>
                          <p className="text-[9px] font-bold text-[#4A4B48] uppercase">Time</p>
                          <p className="text-[11px] font-semibold text-[#11130D]">
                            {match.start_time ? new Date(match.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                          </p>
                        </div>
                      </div>
                      <div className="bg-[#E8E9EC] rounded-xl p-3 flex items-center gap-3">
                        <Users size={16} className="text-[#868935]" />
                        <div>
                          <p className="text-[9px] font-bold text-[#4A4B48] uppercase">Slots</p>
                          <p className="text-[11px] font-semibold text-[#11130D]">{match.current_slots || 0} / {match.tournament?.slots || 48}</p>
                        </div>
                      </div>
                    </div>

                    {/* Slots Progress Bar */}
                    <div className="w-full h-2 bg-[#E8E9EC] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#D7FD03] rounded-full transition-all duration-500"
                        style={{ width: `${((match.current_slots || 0) / (match.tournament?.slots || 48)) * 100}%` }}
                      />
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-[#C8C8C4]/20">
                      <div>
                        <p className="text-[9px] font-bold text-[#4A4B48] uppercase">Prize Pool</p>
                        <div className="flex items-center gap-1">
                          <Trophy size={14} className="text-[#868935]" />
                          <span className="text-lg font-heading text-[#11130D]">₹{match.tournament?.prize_pool?.toLocaleString() || 0}</span>
                        </div>
                      </div>
                    
                      {match.status === "upcoming" ? (
                        <motion.button 
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleJoinMatch(match.tournament_id, match.id)}
                          disabled={joining === match.id}
                          className="bg-[#D7FD03] text-[#11130D] px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wide shadow-lg shadow-[#D7FD03]/30 flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {joining === match.id ? <Loader2 size={14} className="animate-spin" /> : (
                            <>Join ₹{match.tournament?.entry_fee} <ChevronRight size={14} /></>
                          )}
                        </motion.button>
                      ) : match.status === 'live' ? (
                        <Link href={`/live?match=${match.id}`}>
                          <motion.button 
                            whileTap={{ scale: 0.95 }}
                            className="bg-[#D7FD03] text-[#11130D] px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wide shadow-lg shadow-[#D7FD03]/30 flex items-center gap-1.5"
                          >
                            Watch <ChevronRight size={14} />
                          </motion.button>
                        </Link>
                      ) : (
                        <motion.button 
                          whileTap={{ scale: 0.95 }}
                          className="bg-[#E8E9EC] text-[#4A4B48] px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wide flex items-center gap-1.5"
                        >
                          View <ChevronRight size={14} />
                        </motion.button>
                      )}
                    </div>
                  </BentoCard>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <BentoCard className="p-12 text-center">
              <AlertCircle size={40} className="text-[#C8C8C4] mx-auto mb-4" />
              <h3 className="text-lg font-heading text-[#11130D] mb-2">No Matches Found</h3>
              <p className="text-[11px] text-[#4A4B48] mb-4">No matches found for the selected filter</p>
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => { setActiveFilter("All"); setSearchQuery(""); }}
                className="px-6 py-2.5 bg-[#E8E9EC] text-[#11130D] rounded-xl text-[10px] font-bold uppercase tracking-wide"
              >
                Reset Filters
              </motion.button>
            </BentoCard>
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
