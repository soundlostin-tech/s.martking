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
    <div className="min-h-screen bg-background text-onyx">
      <main className="pb-32 relative z-10">
        <TopHeader />

        {/* Header Section */}
        <section className="relative px-6 pt-10 pb-6">
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-charcoal/50 uppercase tracking-[0.2em] mb-2">
              Arena Lobby
            </p>
            <h2 className="text-[32px] font-heading text-onyx leading-tight font-black">
              Available <br />
              <span className="text-onyx">Tournaments</span>
            </h2>
          </div>
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

          <ChipGroup 
            options={filters}
            selected={activeFilter}
            onChange={setActiveFilter}
          />
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
                  <BentoCard className="p-6 space-y-6 border-none shadow-[0_10px_40px_rgba(0,0,0,0.03)]">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                          match.status === 'live' 
                            ? 'bg-lime-vibrant shadow-lg shadow-lime-vibrant/20' 
                            : 'bg-off-white'
                        }`}>
                          <Trophy size={24} className="text-onyx" />
                        </div>
                        <div>
                          <h3 className="text-lg font-heading text-onyx font-black leading-tight">{match.title}</h3>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[9px] font-black text-white bg-onyx px-2 py-0.5 rounded-md uppercase tracking-widest">{match.mode}</span>
                            <span className="text-[10px] text-charcoal/60 font-bold uppercase tracking-wider">{match.tournament?.title}</span>
                          </div>
                        </div>
                      </div>
                      <StatusBadge variant={match.status === 'live' ? 'live' : match.status === 'upcoming' ? 'upcoming' : 'completed'} />
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-background rounded-2xl p-4 flex items-center gap-4">
                        <Calendar size={18} className="text-charcoal/40" />
                        <div>
                          <p className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest mb-0.5">Starts</p>
                          <p className="text-xs font-black text-onyx">
                            {match.start_time ? new Date(match.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                          </p>
                        </div>
                      </div>
                      <div className="bg-background rounded-2xl p-4 flex items-center gap-4">
                        <Users size={18} className="text-charcoal/40" />
                        <div>
                          <p className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest mb-0.5">Joined</p>
                          <p className="text-xs font-black text-onyx">{match.current_slots || 0} / {match.tournament?.slots || 48}</p>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-onyx rounded-full transition-all duration-700 ease-out"
                          style={{ width: `${Math.min(100, ((match.current_slots || 0) / (match.tournament?.slots || 48)) * 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[9px] font-bold text-charcoal/40 uppercase tracking-widest">
                        <span>Lobby Capacity</span>
                        <span className="text-onyx">{Math.round(((match.current_slots || 0) / (match.tournament?.slots || 48)) * 100)}%</span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-6 border-t border-black/[0.03]">
                      <div>
                        <p className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest mb-1">Total Prize</p>
                        <div className="flex items-center gap-1.5">
                          <span className="text-2xl font-heading text-onyx font-black">₹{match.tournament?.prize_pool?.toLocaleString() || 0}</span>
                        </div>
                      </div>
                    
                      {match.status === "upcoming" ? (
                        <motion.button 
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleJoinMatch(match.tournament_id, match.id)}
                          disabled={joining === match.id}
                          className="bg-onyx text-white px-6 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest shadow-xl shadow-onyx/10 flex items-center gap-2 disabled:opacity-50"
                        >
                          {joining === match.id ? <Loader2 size={16} className="animate-spin" /> : (
                            <>Enter ₹{match.tournament?.entry_fee} <ChevronRight size={16} /></>
                          )}
                        </motion.button>
                      ) : match.status === 'live' ? (
                        <Link href={`/live?match=${match.id}`}>
                          <motion.button 
                            whileTap={{ scale: 0.95 }}
                            className="bg-lime-vibrant text-onyx px-6 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest shadow-xl shadow-lime-vibrant/20 flex items-center gap-2"
                          >
                            Watch Live <ChevronRight size={18} />
                          </motion.button>
                        </Link>
                      ) : (
                        <motion.button 
                          whileTap={{ scale: 0.95 }}
                          className="bg-off-white text-charcoal px-6 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest flex items-center gap-2"
                        >
                          Results <ChevronRight size={18} />
                        </motion.button>
                      )}
                    </div>
                  </BentoCard>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <BentoCard className="p-16 text-center border-none bg-white shadow-sm">
              <div className="w-20 h-20 rounded-full bg-off-white flex items-center justify-center mx-auto mb-6 shadow-sm">
                <AlertCircle size={40} className="text-charcoal/20" />
              </div>
              <h3 className="text-xl font-heading text-onyx mb-3 font-black">No Arenas Found</h3>
              <p className="text-xs text-charcoal/50 mb-8 font-bold uppercase tracking-widest">Check back later!</p>
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => { setActiveFilter("All"); setSearchQuery(""); }}
                className="px-8 py-4 bg-onyx text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest shadow-xl shadow-onyx/10"
              >
                Refresh Hub
              </motion.button>
            </BentoCard>
          )}
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
