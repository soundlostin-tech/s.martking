"use client";

import { BottomNav } from "@/components/layout/BottomNav";
import { TopHeader } from "@/components/layout/TopHeader";
import { useState, useEffect, useCallback } from "react";
import { Search, Loader2, Trophy, Calendar, Users, Signal } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion } from "framer-motion";
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
    } finally {
      setLoading(false);
    }
  }, [activeFilter, searchQuery]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const handleJoinMatch = async (tournamentId: string, matchId: string) => {
    if (!user) {
      toast.error("Please sign in first");
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
      toast.error(error.message || "Failed to join");
    } finally {
      setJoining(null);
    }
  };

  return (
    <div className="min-h-screen pb-24">
      <TopHeader />
      
      <main className="pt-24 px-6 space-y-8 max-w-4xl mx-auto">
        <div className="flex flex-col gap-6">
          <h2 className="text-3xl font-bold tracking-tight">Arena Battles</h2>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input 
                type="text" 
                placeholder="Find a battle..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-card border border-border pl-10 pr-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-jungle-teal/20"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                    activeFilter === filter 
                      ? "bg-jungle-teal text-white shadow-sm" 
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {loading ? (
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 bg-muted animate-pulse rounded-2xl" />
            ))
          ) : matches.length > 0 ? (
            matches.map((match) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border p-5 rounded-2xl hover:border-jungle-teal transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        match.status === 'live' ? 'bg-red-500 text-white animate-pulse' : 'bg-jungle-teal/10 text-jungle-teal'
                      }`}>
                        {match.status}
                      </span>
                      <span className="text-xs text-muted-foreground uppercase tracking-widest">{match.mode} • {match.tournament?.title}</span>
                    </div>
                    <h3 className="text-xl font-bold">{match.title}</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold">₹{match.tournament?.prize_pool}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Prize Pool</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar size={16} />
                    <span className="text-sm">{match.start_time ? new Date(match.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users size={16} />
                    <span className="text-sm">{match.current_slots || 0}/{match.tournament?.slots || 48}</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 text-muted-foreground">
                    <Trophy size={16} />
                    <span className="text-sm">Entry: ₹{match.tournament?.entry_fee}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-4">
                  <div className="text-lg font-bold">₹{match.tournament?.entry_fee} Entry</div>
                  {match.status === "upcoming" ? (
                    <button 
                      onClick={() => handleJoinMatch(match.tournament_id, match.id)}
                      disabled={joining === match.id}
                      className="bg-jungle-teal text-white px-8 py-2 rounded-full text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {joining === match.id ? <Loader2 size={16} className="animate-spin" /> : "Join Battle"}
                    </button>
                  ) : (
                    <Link 
                      href={match.status === 'live' ? `/live?match=${match.id}` : '#'} 
                      className={`px-8 py-2 rounded-full text-sm font-bold border transition-colors ${
                        match.status === 'live' 
                        ? 'border-red-500 text-red-500 hover:bg-red-50' 
                        : 'border-border text-muted-foreground'
                      }`}
                    >
                      {match.status === 'live' ? "Watch Live" : "View Results"}
                    </Link>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-20 text-center space-y-4">
              <Signal size={48} className="mx-auto text-muted-foreground/30" />
              <p className="text-muted-foreground font-medium uppercase tracking-widest">No active battles found</p>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
