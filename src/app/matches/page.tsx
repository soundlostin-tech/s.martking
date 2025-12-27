"use client";

import { BottomNav } from "@/components/layout/BottomNav";
import { TopHeader } from "@/components/layout/TopHeader";
import { useState, useEffect, useCallback } from "react";
import { Swords, Search, Loader2, Play, Trophy, Calendar, Users, Filter, Zap, Target, Signal, IndianRupee, ChevronRight, LayoutGrid, Radio } from "lucide-react";
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
        .select(`
          *,
          tournament:tournaments(title, entry_fee, prize_pool, slots)
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
      toast.error("Security clearing required. Please sign in.");
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
      toast.error(error.message || "Combat deployment failure");
    } finally {
      setJoining(null);
    }
  };

  return (
    <div className="min-h-screen bg-seashell-50 text-graphite-800">
      <main className="pb-32 relative z-10">
        <TopHeader />

          {/* Search & Filter - Tactical Command Style */}
          <section className="px-6 pt-8 space-y-6">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-shadow-grey-500" size={18} />
              <input 
                type="text" 
                placeholder="SEARCH ARENA SECTORS..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-seashell-100 border border-shadow-grey-200 rounded-[24px] py-5 pl-14 pr-6 text-xs font-bold tracking-widest focus:ring-2 focus:ring-tangerine-dream-400/20 transition-all placeholder:text-shadow-grey-400 uppercase shadow-sm text-graphite-800"
              />
            </div>
  
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
              {filters.map((filter) => (
                <motion.button
                  key={filter}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-8 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap border ${
                    activeFilter === filter 
                      ? "bg-tangerine-dream-400 text-white border-tangerine-dream-400 shadow-lg shadow-tangerine-dream-400/20" 
                      : "bg-seashell-100 text-shadow-grey-500 border-shadow-grey-200 hover:bg-seashell-200"
                  }`}
                >
                  {filter}
                </motion.button>
              ))}
            </div>
          </section>
  
          {/* Match List - Polished Arena Cards */}
          <section className="px-6 pt-8 space-y-6 max-w-2xl mx-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-6 bg-seashell-100 rounded-[40px] border border-shadow-grey-200 shadow-sm">
                <Loader2 className="w-12 h-12 animate-spin text-tangerine-dream-500" />
                <p className="text-[10px] text-shadow-grey-500 font-bold uppercase tracking-[0.3em]">Accessing Arena Database...</p>
              </div>
            ) : matches.length > 0 ? (
              <AnimatePresence mode="popLayout">
                {matches.map((match, i) => (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-seashell-100 rounded-[40px] p-8 border border-shadow-grey-200 shadow-[0_10px_40px_-15px_rgba(68,65,64,0.08)] relative overflow-hidden group"
                  >
                    <div className="flex justify-between items-start mb-10">
                      <div className="flex items-center gap-6">
                        <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center transition-all duration-500 ${
                          match.status === 'live' 
                            ? 'bg-strawberry-red-500/10 text-strawberry-red-500 group-hover:bg-strawberry-red-500 group-hover:text-white' 
                            : 'bg-tangerine-dream-400/10 text-tangerine-dream-500 group-hover:bg-tangerine-dream-400 group-hover:text-white'
                        } shadow-sm`}>
                          {match.status === 'live' ? <Play size={28} fill="currentColor" className="translate-x-0.5" /> : <Swords size={28} />}
                        </div>
                        <div className="min-w-0 space-y-1.5">
                          <h3 className="font-heading text-xl text-graphite-900 truncate group-hover:text-strawberry-red-500 transition-colors">{match.title}</h3>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="border-shadow-grey-200 bg-seashell-50 text-[8px] font-bold tracking-widest text-shadow-grey-500 px-3 py-0.5">
                              {match.mode.toUpperCase()}
                            </Badge>
                            <p className="text-[9px] text-shadow-grey-500 font-bold uppercase tracking-[0.2em]">{match.tournament?.title}</p>
                          </div>
                        </div>
                      </div>
                      <div className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] border ${
                        match.status === 'live' 
                          ? 'bg-strawberry-red-500 text-white animate-pulse border-white/20 shadow-lg shadow-strawberry-red-500/20' 
                          : 'bg-seashell-50 text-shadow-grey-500 border-shadow-grey-200'
                      }`}>
                        {match.status}
                      </div>
                    </div>
  
                    <div className="grid grid-cols-2 gap-4 mb-10">
                      <div className="bg-seashell-50 rounded-[28px] p-5 border border-shadow-grey-200 flex items-center gap-5 group-hover:bg-seashell-200 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-seashell-100 flex items-center justify-center text-tangerine-dream-500 shadow-sm">
                          <Calendar size={18} />
                        </div>
                        <div>
                          <p className="text-[8px] font-bold text-shadow-grey-500 uppercase tracking-widest">Deployment</p>
                          <p className="text-[11px] font-bold text-graphite-800 uppercase tracking-wide">
                            {match.start_time ? new Date(match.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }) : 'TBD'}
                          </p>
                        </div>
                      </div>
                      <div className="bg-seashell-50 rounded-[28px] p-5 border border-shadow-grey-200 flex items-center gap-5 group-hover:bg-seashell-200 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-seashell-100 flex items-center justify-center text-tangerine-dream-500 shadow-sm">
                          <Users size={18} />
                        </div>
                        <div>
                          <p className="text-[8px] font-bold text-shadow-grey-500 uppercase tracking-widest">Capacity</p>
                          <p className="text-[11px] font-bold text-graphite-800 uppercase tracking-wide">{match.current_slots || 0} / {match.tournament?.slots || 48} WARRIORS</p>
                        </div>
                      </div>
                    </div>
  
                    <div className="flex items-center justify-between pt-6 border-t border-shadow-grey-200">
                      <div className="flex flex-col gap-1">
                        <p className="text-[9px] font-bold text-shadow-grey-500 uppercase tracking-[0.3em]">PRIZE POOL</p>
                        <div className="flex items-center gap-2">
                          <Trophy size={18} className="text-tangerine-dream-500" />
                          <span className="text-2xl font-heading text-graphite-900">₹{match.tournament?.prize_pool.toLocaleString() || 0}</span>
                        </div>
                      </div>
                    
                    {match.status === "upcoming" ? (
                      <motion.button 
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleJoinMatch(match.tournament_id, match.id)}
                        disabled={joining === match.id}
                        className="bg-strawberry-red-500 text-white px-10 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] shadow-xl shadow-strawberry-red-500/20 flex items-center gap-3 hover:bg-strawberry-red-400 transition-all border-none"
                      >
                        {joining === match.id ? <Loader2 size={16} className="animate-spin" /> : (
                          <>DEPLOY ₹{match.tournament?.entry_fee} <ChevronRight size={14} strokeWidth={3} /></>
                        )}
                      </motion.button>
                    ) : (
                      <Link href={match.status === 'live' ? `/live?match=${match.id}` : '#'} className="bg-tangerine-dream-400 text-white px-10 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] shadow-xl shadow-tangerine-dream-400/20 flex items-center gap-3 hover:bg-tangerine-dream-500 transition-all">
                        {match.status === 'live' ? <>WATCH FEED <Radio size={14} className="animate-pulse" /></> : "VIEW DEBRIEF"}
                      </Link>
                    )}
                  </div>
                  
                  {/* Visual background glows */}
                  <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-tangerine-dream-400/5 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="bg-seashell-100 p-20 rounded-[50px] border border-dashed border-shadow-grey-300 text-center space-y-8 mt-8 shadow-sm">
              <div className="w-24 h-24 bg-strawberry-red-500/5 rounded-[32px] flex items-center justify-center mx-auto text-shadow-grey-300 shadow-inner">
                <Signal size={48} strokeWidth={1} />
              </div>
              <div className="space-y-3 px-6">
                <h3 className="text-2xl font-heading text-graphite-900">Silent <span className="italic font-serif opacity-60">Horizon</span></h3>
                <p className="text-[11px] text-shadow-grey-500 font-bold uppercase tracking-[0.2em] leading-loose">No battle signals detected in the selected sector. Adjust your scanners.</p>
              </div>
              <div className="px-10">
                <button 
                  onClick={() => { setActiveFilter("All"); setSearchQuery(""); }}
                  className="w-full py-5 bg-strawberry-red-500/5 text-shadow-grey-500 hover:text-strawberry-red-500 rounded-[20px] text-[10px] font-bold uppercase tracking-[0.3em] transition-all border border-shadow-grey-200"
                >
                  RESET SCANNERS
                </button>
              </div>
            </div>
          )}
        </section>

      </main>

      <BottomNav />
      {/* Background Glows */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0 opacity-30">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-tangerine-dream-400/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-tangerine-dream-500/15 blur-[120px] rounded-full" />
      </div>
    </div>
  );
}
