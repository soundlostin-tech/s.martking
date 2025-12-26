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
import { PaperWrapper } from "@/components/layout/PaperWrapper";
import { HandDrawnGrid, HandDrawnX, HandDrawnO } from "@/components/HandDrawnGame";

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
    <div className="min-h-screen">
      <TopHeader />
      <PaperWrapper className="!min-h-[600px] !w-[850px] !rotate-1">
        <div className="w-full flex flex-col gap-8 h-full max-h-[500px] overflow-y-auto no-scrollbar pr-4">
          <div className="flex flex-col gap-4">
            <h2 className="text-5xl font-heading -rotate-2">Battle Sectors</h2>
            
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-blue/30" size={20} />
              <input 
                type="text" 
                placeholder="Find a battle..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-b-2 border-ink-blue/10 py-3 pl-12 pr-4 font-handwritten text-xl focus:border-ink-blue outline-none transition-all placeholder:text-ink-blue/20"
              />
            </div>

            <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-6 py-1 rounded-full font-handwritten text-lg transition-all border-2 ${
                    activeFilter === filter 
                      ? "bg-ink-blue/10 border-ink-blue rotate-2" 
                      : "border-ink-blue/5 hover:border-ink-blue/20"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-ink-blue/40" />
                <p className="font-handwritten text-2xl opacity-40 uppercase tracking-widest">Scanning Arena...</p>
              </div>
            ) : matches.length > 0 ? (
              <div className="grid grid-cols-1 gap-8 pb-10">
                {matches.map((match, i) => (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="relative border-2 border-ink-blue/10 p-6 rounded-3xl hover:border-ink-blue/30 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-6">
                        <div className="w-16 h-16 relative rotate-3">
                           <HandDrawnGrid />
                           <div className="absolute inset-0 flex items-center justify-center text-ink-blue/40">
                             {i % 2 === 0 ? <HandDrawnX /> : <HandDrawnO />}
                           </div>
                        </div>
                        <div className="text-left">
                          <h3 className="text-3xl font-heading leading-tight">{match.title}</h3>
                          <p className="text-sm font-handwritten opacity-50 uppercase tracking-widest">{match.mode} • {match.tournament?.title}</p>
                        </div>
                      </div>
                      <div className={`font-handwritten text-lg px-4 py-1 rounded-full border-2 rotate-6 ${
                        match.status === 'live' ? 'border-red-500 text-red-500' : 'border-ink-blue/10 opacity-40'
                      }`}>
                        {match.status}
                      </div>
                    </div>

                    <div className="flex items-center gap-8 mb-6 font-handwritten text-lg">
                      <div className="flex items-center gap-2 opacity-60">
                         <Calendar size={18} />
                         <span>{match.start_time ? new Date(match.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}</span>
                      </div>
                      <div className="flex items-center gap-2 opacity-60">
                         <Users size={18} />
                         <span>{match.current_slots || 0} / {match.tournament?.slots || 48}</span>
                      </div>
                      <div className="flex items-center gap-2 text-ink-blue font-bold">
                         <Trophy size={18} />
                         <span>₹{match.tournament?.prize_pool.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-3xl font-heading">Entry: ₹{match.tournament?.entry_fee}</div>
                      {match.status === "upcoming" ? (
                        <button 
                          onClick={() => handleJoinMatch(match.tournament_id, match.id)}
                          disabled={joining === match.id}
                          className="hand-drawn-btn !text-lg !px-8"
                        >
                          {joining === match.id ? <Loader2 size={16} className="animate-spin" /> : "Deploy Now"}
                        </button>
                      ) : (
                        <Link href={match.status === 'live' ? `/live?match=${match.id}` : '#'} className="hand-drawn-btn !text-lg !px-8 !border-red-500 !text-red-500">
                          {match.status === 'live' ? "Watch Feed" : "Debrief"}
                        </Link>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center space-y-4 opacity-30">
                <Signal size={60} className="mx-auto" />
                <p className="text-3xl font-handwritten uppercase tracking-[0.2em]">Horizon is Silent</p>
              </div>
            )}
          </div>
        </div>
      </PaperWrapper>
      <BottomNav />
    </div>
  );
}
