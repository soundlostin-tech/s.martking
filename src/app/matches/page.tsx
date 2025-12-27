"use client";

import { BottomNav } from "@/components/layout/BottomNav";
import { TopHeader } from "@/components/layout/TopHeader";
import { useState, useEffect, useCallback } from "react";
import { Swords, Search, Loader2, Play, Trophy, Calendar, Users, Signal, ChevronRight, Radio } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const filters = ["All", "Upcoming", "Live", "Completed"];

export default function MatchesPage() {
  const { user, loading: authLoading } = useAuth(false);
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
    <div className="min-h-screen bg-transparent text-foreground">
      <main className="pb-24 relative z-10">
        <TopHeader />

        {/* Search & Filter - Mobile Optimized */}
        <section className="px-4 sm:px-6 pt-4 sm:pt-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              type="text" 
              placeholder="Search matches..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-muted border border-border rounded-xl sm:rounded-2xl py-3.5 sm:py-4 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-accent/20 transition-all placeholder:text-muted-foreground/50 text-foreground"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
            {filters.map((filter) => (
              <motion.button
                key={filter}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveFilter(filter)}
                className={`flex-shrink-0 px-5 sm:px-6 py-2.5 rounded-xl text-[11px] sm:text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap border haptic-tap ${
                  activeFilter === filter 
                    ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                    : "bg-muted text-foreground border-border active:bg-muted/80"
                }`}
              >
                {filter}
              </motion.button>
            ))}
          </div>
        </section>

        {/* Match List - Mobile Optimized */}
        <section className="px-4 sm:px-6 pt-6 space-y-3 sm:space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 bg-card rounded-[24px] border border-border">
              <Loader2 className="w-10 h-10 animate-spin text-accent" />
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Loading matches...</p>
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
                  className="mobile-card p-4 sm:p-6 space-y-4"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center transition-colors ${
                        match.status === 'live' 
                          ? 'bg-accent/15 text-accent' 
                          : 'bg-muted text-muted-foreground'
                      } border border-border`}>
                        {match.status === 'live' ? <Play size={20} fill="currentColor" className="translate-x-0.5 sm:w-6 sm:h-6" /> : <Swords size={20} className="sm:w-6 sm:h-6" />}
                      </div>
                      <div className="min-w-0 space-y-1">
                        <h3 className="font-outfit text-base sm:text-lg font-semibold text-foreground truncate">{match.title}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="border-border bg-muted text-[8px] sm:text-[9px] font-bold text-muted-foreground px-2 py-0">
                            {match.mode.toUpperCase()}
                          </Badge>
                          <span className="text-[9px] sm:text-[10px] text-muted-foreground font-medium">{match.tournament?.title}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[8px] sm:text-[9px] font-bold uppercase tracking-wide border ${
                      match.status === 'live' 
                        ? 'bg-accent text-primary-foreground border-accent animate-pulse' 
                        : 'bg-muted text-muted-foreground border-border'
                    }`}>
                      {match.status}
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <div className="bg-muted/50 rounded-xl p-3 sm:p-4 border border-border flex items-center gap-3">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-background flex items-center justify-center text-accent">
                        <Calendar size={16} className="sm:w-[18px] sm:h-[18px]" />
                      </div>
                      <div>
                        <p className="text-[8px] sm:text-[9px] font-bold text-muted-foreground uppercase">Time</p>
                        <p className="text-[10px] sm:text-[11px] font-semibold text-foreground">
                          {match.start_time ? new Date(match.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                        </p>
                      </div>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-3 sm:p-4 border border-border flex items-center gap-3">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-background flex items-center justify-center text-accent">
                        <Users size={16} className="sm:w-[18px] sm:h-[18px]" />
                      </div>
                      <div>
                        <p className="text-[8px] sm:text-[9px] font-bold text-muted-foreground uppercase">Slots</p>
                        <p className="text-[10px] sm:text-[11px] font-semibold text-foreground">{match.current_slots || 0} / {match.tournament?.slots || 48}</p>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex flex-col gap-0.5">
                      <p className="text-[8px] sm:text-[9px] font-bold text-muted-foreground uppercase tracking-wide">Prize Pool</p>
                      <div className="flex items-center gap-1.5">
                        <Trophy size={14} className="text-accent sm:w-4 sm:h-4" />
                        <span className="text-lg sm:text-xl font-outfit font-bold text-foreground">₹{match.tournament?.prize_pool.toLocaleString() || 0}</span>
                      </div>
                    </div>
                  
                    {match.status === "upcoming" ? (
                      <motion.button 
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleJoinMatch(match.tournament_id, match.id)}
                        disabled={joining === match.id}
                        className="bg-accent text-primary-foreground px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl text-[10px] sm:text-[11px] font-bold uppercase tracking-wide shadow-sm flex items-center gap-2 active:bg-accent/90 transition-colors haptic-tap touch-target"
                      >
                        {joining === match.id ? <Loader2 size={14} className="animate-spin" /> : (
                          <>JOIN ₹{match.tournament?.entry_fee} <ChevronRight size={12} strokeWidth={3} /></>
                        )}
                      </motion.button>
                    ) : (
                      <Link 
                        href={match.status === 'live' ? `/live?match=${match.id}` : '#'} 
                        className="bg-accent text-primary-foreground px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl text-[10px] sm:text-[11px] font-bold uppercase tracking-wide shadow-sm flex items-center gap-2 active:bg-accent/90 transition-colors touch-target"
                      >
                        {match.status === 'live' ? <>WATCH <Radio size={12} className="animate-pulse" /></> : "VIEW"}
                      </Link>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="bg-card p-12 sm:p-16 rounded-[24px] border border-dashed border-border text-center space-y-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto text-muted-foreground/30">
                <Signal size={32} strokeWidth={1} className="sm:w-10 sm:h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-outfit font-semibold text-foreground">No Matches</h3>
                <p className="text-[11px] sm:text-xs text-muted-foreground">No matches found for the selected filter</p>
              </div>
              <button 
                onClick={() => { setActiveFilter("All"); setSearchQuery(""); }}
                className="px-6 py-2.5 bg-muted text-foreground rounded-xl text-[10px] sm:text-[11px] font-bold uppercase tracking-wide border border-border haptic-tap"
              >
                Reset Filters
              </button>
            </div>
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
