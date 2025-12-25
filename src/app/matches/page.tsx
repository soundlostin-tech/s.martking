"use client";

import { HeroSection } from "@/components/layout/HeroSection";
import { BottomNav } from "@/components/layout/BottomNav";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Swords, Calendar, Search, Loader2, Play, CheckCircle2, Trophy, ChevronRight, MapPin, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const filters = ["All", "Upcoming", "Ongoing", "Completed"];

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
          tournament:tournaments(title, entry_fee)
        `);
      
      if (activeFilter !== "All") {
        const statusMap: Record<string, string> = {
          "Upcoming": "upcoming",
          "Ongoing": "live",
          "Completed": "completed"
        };
        query = query.eq("status", statusMap[activeFilter]);
      }

      const { data, error } = await query.order("start_time", { ascending: true, nullsFirst: false });
      
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live": return "bg-red-500 text-white";
      case "upcoming": return "bg-black text-white";
      case "completed": return "bg-zinc-500 text-white";
      default: return "bg-zinc-200 text-zinc-600";
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-100">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-32 bg-zinc-100">
      <HeroSection 
        title="Battle Arena" 
        subtitle="The stage is set. Claim your glory in the upcoming tournaments."
        className="bg-zinc-100"
      />

      <div className="px-6 -mt-8 relative z-20 space-y-8 max-w-2xl mx-auto">
        {/* Filter Controls */}
        <div className="flex bg-white/40 backdrop-blur-xl p-1.5 rounded-full border border-white/20 overflow-x-auto no-scrollbar gap-1 shadow-xl">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                activeFilter === filter 
                  ? "bg-black text-white shadow-lg" 
                  : "text-zinc-400 hover:text-black"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-black transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search tournament..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/40 backdrop-blur-xl border border-white/20 rounded-full py-5 pl-14 pr-6 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all shadow-xl font-serif"
          />
        </div>

        {/* Match List */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-zinc-300" />
              <p className="text-zinc-400 font-serif">Awaiting orders...</p>
            </div>
          ) : matches.length > 0 ? (
            <AnimatePresence mode="popLayout">
              {matches.map((match, index) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white/40 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-6 shadow-xl hover:shadow-2xl transition-all group"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                        match.status === 'live' ? 'bg-red-50 text-red-500' : 'bg-zinc-50 text-zinc-400'
                      }`}>
                        {match.status === 'live' ? <Play size={24} fill="currentColor" /> : <Swords size={24} />}
                      </div>
                      <div>
                        <h3 className="font-heading text-xl leading-tight text-black">{match.title}</h3>
                        <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest">{match.tournament?.title}</p>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(match.status)} rounded-full text-[10px] px-3 py-1 font-bold border-none`}>
                      {match.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-8 px-2">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Calendar size={16} className="text-zinc-400" />
                        <span className="text-sm font-serif text-zinc-600">
                          {match.start_time ? new Date(match.start_time).toLocaleDateString() : 'TBD'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Users size={16} className="text-zinc-400" />
                        <span className="text-sm font-serif text-zinc-600">{match.mode}</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Play size={16} className="text-zinc-400" />
                        <span className="text-sm font-serif text-zinc-600">
                          {match.start_time ? new Date(match.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin size={16} className="text-zinc-400" />
                        <span className="text-sm font-serif text-zinc-600">{match.map || 'Bermuda'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-black/5 flex items-center justify-between gap-4">
                    {match.status === "upcoming" ? (
                      <>
                        <button className="flex-1 py-4 px-6 rounded-full text-xs font-bold text-zinc-400 hover:text-black transition-colors font-serif">
                          View Details
                        </button>
                        <button 
                          onClick={() => handleJoinMatch(match.tournament_id, match.id)}
                          disabled={joining === match.id}
                          className="flex-1 bg-black text-white py-4 px-6 rounded-full text-xs font-bold hover:bg-zinc-800 transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                          {joining === match.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Join Battle"}
                        </button>
                      </>
                    ) : (
                      <Link href={match.status === 'live' ? `/live?matchId=${match.id}` : '#'} className="w-full">
                        <button className={`w-full py-4 px-6 rounded-full text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
                          match.status === 'live' ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-zinc-200 text-zinc-600'
                        }`}>
                          {match.status === 'live' ? <><Play size={16} fill="white" /> Watch Live</> : "View Results"}
                        </button>
                      </Link>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/40 backdrop-blur-xl p-16 rounded-[3rem] border border-zinc-200 text-center space-y-6 shadow-xl"
            >
              <div className="w-24 h-24 bg-zinc-50 rounded-full flex items-center justify-center mx-auto">
                <Swords size={48} className="text-zinc-200" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-heading text-black">Arena is Quiet</h3>
                <p className="text-sm text-zinc-400 font-serif">No matches found matching your criteria.</p>
              </div>
              <button 
                onClick={() => { setActiveFilter("All"); setSearchQuery(""); }}
                className="text-xs font-bold text-black underline underline-offset-8 decoration-black/10 hover:decoration-black"
              >
                Clear all filters
              </button>
            </motion.div>
          )}
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
