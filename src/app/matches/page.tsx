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
    <div className="min-h-screen bg-background text-foreground">
      <main className="pb-32 relative z-10">
        <TopHeader />

            {/* Search & Filter - Tactical Command Style */}
            <section className="px-6 pt-8 space-y-6">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input 
                  type="text" 
                  placeholder="SEARCH ARENA SECTORS..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-muted border border-border rounded-[24px] py-5 pl-14 pr-6 text-xs font-bold tracking-widest focus:ring-2 focus:ring-accent/20 transition-all placeholder:text-muted-foreground/50 uppercase shadow-sm text-foreground"
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
                        ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/10" 
                        : "bg-muted text-foreground border-border hover:bg-muted/80"
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
                  <div className="flex flex-col items-center justify-center py-32 gap-6 bg-card rounded-[40px] border border-border shadow-sm">
                    <Loader2 className="w-12 h-12 animate-spin text-accent" />
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.3em]">Accessing Arena Database...</p>
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
                        className="bg-card rounded-[40px] p-8 border border-border shadow-md relative overflow-hidden group"
                      >
                      <div className="flex justify-between items-start mb-10">
                        <div className="flex items-center gap-6">
                          <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center transition-all duration-500 ${
                            match.status === 'live' 
                              ? 'bg-accent/10 text-accent group-hover:bg-accent group-hover:text-primary' 
                              : 'bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground'
                          } shadow-sm border border-border`}>
                            {match.status === 'live' ? <Play size={28} fill="currentColor" className="translate-x-0.5" /> : <Swords size={28} />}
                          </div>
                          <div className="min-w-0 space-y-1.5">
                            <h3 className="font-heading text-xl text-foreground truncate group-hover:text-secondary transition-colors">{match.title}</h3>
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="border-border bg-muted text-[8px] font-bold tracking-widest text-muted-foreground px-3 py-0.5">
                                {match.mode.toUpperCase()}
                              </Badge>
                              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-[0.2em]">{match.tournament?.title}</p>
                            </div>
                          </div>
                        </div>
                        <div className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] border ${
                          match.status === 'live' 
                            ? 'bg-accent text-primary animate-pulse border-white/20 shadow-lg shadow-accent/20' 
                            : 'bg-muted text-muted-foreground border-border'
                        }`}>
                          {match.status}
                        </div>
                      </div>
    
                      <div className="grid grid-cols-2 gap-4 mb-10">
                        <div className="bg-muted/50 rounded-[28px] p-5 border border-border flex items-center gap-5 group-hover:bg-muted transition-colors">
                          <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-accent shadow-sm">
                            <Calendar size={18} />
                          </div>
                          <div>
                            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Deployment</p>
                            <p className="text-[11px] font-bold text-foreground uppercase tracking-wide">
                              {match.start_time ? new Date(match.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }) : 'TBD'}
                            </p>
                          </div>
                        </div>
                        <div className="bg-muted/50 rounded-[28px] p-5 border border-border flex items-center gap-5 group-hover:bg-muted transition-colors">
                          <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-accent shadow-sm">
                            <Users size={18} />
                          </div>
                          <div>
                            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Capacity</p>
                            <p className="text-[11px] font-bold text-foreground uppercase tracking-wide">{match.current_slots || 0} / {match.tournament?.slots || 48} WARRIORS</p>
                          </div>
                        </div>
                      </div>
    
                      <div className="flex items-center justify-between pt-6 border-t border-border">
                        <div className="flex flex-col gap-1">
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.3em]">PRIZE POOL</p>
                          <div className="flex items-center gap-2">
                            <Trophy size={18} className="text-accent" />
                            <span className="text-2xl font-heading text-foreground">₹{match.tournament?.prize_pool.toLocaleString() || 0}</span>
                          </div>
                        </div>
                      
                      {match.status === "upcoming" ? (
                        <motion.button 
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleJoinMatch(match.tournament_id, match.id)}
                          disabled={joining === match.id}
                          className="bg-secondary text-secondary-foreground px-10 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] shadow-xl shadow-secondary/20 flex items-center gap-3 hover:bg-secondary/90 transition-all border-none"
                        >
                          {joining === match.id ? <Loader2 size={16} className="animate-spin" /> : (
                            <>DEPLOY ₹{match.tournament?.entry_fee} <ChevronRight size={14} strokeWidth={3} /></>
                          )}
                        </motion.button>
                      ) : (
                        <Link href={match.status === 'live' ? `/live?match=${match.id}` : '#'} className="bg-secondary text-secondary-foreground px-10 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] shadow-xl shadow-secondary/20 flex items-center gap-3 hover:bg-secondary/90 transition-all">
                          {match.status === 'live' ? <>WATCH FEED <Radio size={14} className="animate-pulse" /></> : "VIEW DEBRIEF"}
                        </Link>
                      )}
                    </div>
                    
                    {/* Visual background glows */}
                    <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-accent/5 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                  </motion.div>
                ))}
                </AnimatePresence>
              ) : (
                <div className="bg-card p-20 rounded-[50px] border border-dashed border-border text-center space-y-8 mt-8 shadow-sm">
                  <div className="w-24 h-24 bg-muted rounded-[32px] flex items-center justify-center mx-auto text-muted-foreground/30 shadow-inner">
                    <Signal size={48} strokeWidth={1} />
                  </div>
                <div className="space-y-3 px-6">
                  <h3 className="text-2xl font-heading text-foreground">Silent <span className="italic font-serif opacity-60">Horizon</span></h3>
                  <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-[0.2em] leading-loose">No battle signals detected in the selected sector. Adjust your scanners.</p>
                </div>
                <div className="px-10">
                  <button 
                    onClick={() => { setActiveFilter("All"); setSearchQuery(""); }}
                    className="w-full py-5 bg-muted text-foreground hover:text-accent rounded-[20px] text-[10px] font-bold uppercase tracking-[0.3em] transition-all border border-border"
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
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-sea-green-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-malachite-500/15 blur-[120px] rounded-full" />
      </div>
    </div>
  );
}
