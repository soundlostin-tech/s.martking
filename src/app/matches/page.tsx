"use client";

import { BottomNav } from "@/components/layout/BottomNav";
import { TopHeader } from "@/components/layout/TopHeader";
import { useState, useEffect } from "react";
import { Swords, Search, Loader2, Play, Trophy, Calendar, Users, Filter } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const filters = ["All", "Upcoming", "Live", "Completed"];

export default function MatchesPage() {
  const { user, loading: authLoading } = useAuth();
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);

  useEffect(() => {
    fetchMatches();
  }, [activeFilter, searchQuery]);

  const handleJoinMatch = async (tournamentId: string, matchId: string) => {
    if (!user) {
      toast.error("Please sign in to join matches");
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
      toast.error(error.message || "Failed to join match");
    } finally {
      setJoining(null);
    }
  };

  const fetchMatches = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("matches")
        .select(`
          *,
          tournament:tournaments(title, entry_fee, prize_pool)
        `);
      
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

      setMatches(filteredData);
    } catch (error) {
      console.error("Error fetching matches:", error);
      toast.error("Failed to load matches");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="pb-32">
        <TopHeader />

        {/* Search & Filter Bar - Native App Style */}
        <section className="px-6 pt-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/20" size={18} />
            <input 
              type="text" 
              placeholder="Search tournaments..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-foreground/[0.03] border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-foreground/20"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {filters.map((filter) => (
              <motion.button
                key={filter}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveFilter(filter)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                  activeFilter === filter 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "bg-foreground/[0.03] text-foreground/40 hover:bg-foreground/[0.05]"
                }`}
              >
                {filter}
              </motion.button>
            ))}
          </div>
        </section>

        {/* Match List - Polished Native Style */}
        <section className="px-6 pt-6 space-y-4 max-w-lg mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary/30" />
              <p className="text-[10px] text-foreground/30 font-bold uppercase tracking-widest">Scanning Arena...</p>
            </div>
          ) : matches.length > 0 ? (
            <AnimatePresence mode="popLayout">
              {matches.map((match, i) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-[32px] p-5 border border-foreground/[0.04] shadow-sm relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        match.status === 'live' ? 'bg-red-50 text-red-500' : 'bg-primary/5 text-primary'
                      }`}>
                        {match.status === 'live' ? <Play size={20} fill="currentColor" /> : <Swords size={20} />}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base text-foreground truncate">{match.title}</h3>
                        <p className="text-[9px] text-foreground/30 font-bold uppercase tracking-widest">{match.tournament?.title}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      match.status === 'live' ? 'bg-red-500 text-white animate-pulse' : 'bg-foreground/[0.03] text-foreground/40'
                    }`}>
                      {match.status}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-foreground/[0.02] rounded-2xl p-3 flex items-center gap-3">
                      <Calendar size={14} className="text-foreground/20" />
                      <div>
                        <p className="text-[8px] font-bold text-foreground/20 uppercase">Start Time</p>
                        <p className="text-[10px] font-bold text-foreground/60">
                          {match.start_time ? new Date(match.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                        </p>
                      </div>
                    </div>
                    <div className="bg-foreground/[0.02] rounded-2xl p-3 flex items-center gap-3">
                      <Users size={14} className="text-foreground/20" />
                      <div>
                        <p className="text-[8px] font-bold text-foreground/20 uppercase">Slots</p>
                        <p className="text-[10px] font-bold text-foreground/60">24 / 48 Joined</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-foreground/[0.04]">
                    <div className="flex items-center gap-1.5">
                      <Trophy size={14} className="text-accent" />
                      <span className="text-sm font-bold text-foreground">₹{match.tournament?.prize_pool || 0}</span>
                    </div>
                    
                    {match.status === "upcoming" ? (
                      <motion.button 
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleJoinMatch(match.tournament_id, match.id)}
                        disabled={joining === match.id}
                        className="bg-primary text-white px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-primary/20 flex items-center gap-2"
                      >
                        {joining === match.id ? <Loader2 size={12} className="animate-spin" /> : "Join ₹" + match.tournament?.entry_fee}
                      </motion.button>
                    ) : (
                      <Link href={match.status === 'live' ? `/live` : '#'} className="bg-foreground text-white px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-foreground/20">
                        {match.status === 'live' ? "Watch Live" : "View Result"}
                      </Link>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="bg-white p-12 rounded-[40px] border border-foreground/[0.04] text-center space-y-6 shadow-sm mt-8">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto text-foreground/10">
                <Swords size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-foreground">Arena Empty</h3>
                <p className="text-xs text-foreground/40 font-medium">No matches found for this category. Try adjusting your filters.</p>
              </div>
              <button 
                onClick={() => { setActiveFilter("All"); setSearchQuery(""); }}
                className="w-full py-4 bg-foreground/[0.03] text-foreground/60 rounded-2xl text-[10px] font-bold uppercase tracking-widest"
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
