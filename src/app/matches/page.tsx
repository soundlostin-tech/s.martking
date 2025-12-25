"use client";

import { HeroSection } from "@/components/layout/HeroSection";
import { BottomNav } from "@/components/layout/BottomNav";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Swords, Calendar, Search, Loader2, Play, CheckCircle2, Trophy, ChevronRight, MapPin, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { PillButton } from "@/components/ui/PillButton";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const filters = ["All", "Upcoming", "Ongoing", "Completed"];

export default function MatchesPage() {
  const { user, loading: authLoading } = useAuth();
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, [activeFilter, searchQuery]);

    const [joining, setJoining] = useState<string | null>(null);

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
          m.tournament?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.id.toLowerCase().includes(searchQuery.toLowerCase())
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
      case "live": return "bg-red-500 text-white border-none animate-pulse";
      case "upcoming": return "bg-onyx text-white border-none";
      case "completed": return "bg-green-500 text-white border-none";
      default: return "bg-stone-300 text-stone-600 border-none";
    }
  };

  const getStatusLabel = (status: string) => {
    if (status === "live") return "ONGOING";
    return status.toUpperCase();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="w-8 h-8 animate-spin text-lemon-lime" />
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-32 bg-stone-50">
      <HeroSection 
        title="Battle Arena" 
        subtitle="Explore and join the most intense Free Fire matches."
        className="mx-0 rounded-none pb-12"
      />

      <div className="px-6 -mt-8 relative z-20 space-y-6">
        {/* Filter Controls */}
        <div className="flex bg-white/80 backdrop-blur-md p-1.5 rounded-3xl border border-stone-200 overflow-x-auto no-scrollbar gap-1 shadow-lg">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-2.5 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${
                activeFilter === filter 
                  ? "bg-onyx text-white shadow-md scale-[1.02]" 
                  : "text-stone-400 hover:text-onyx"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-onyx transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search match or tournament..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-stone-200 rounded-[24px] py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-lime-yellow/50 focus:border-lime-yellow transition-all shadow-sm"
          />
        </div>

        {/* Match List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-stone-300" />
              <p className="text-stone-400 font-medium">Loading battles...</p>
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
                  className="bg-white border border-stone-100 rounded-[32px] p-5 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        match.status === 'live' ? 'bg-red-50 text-red-500' : 
                        match.status === 'completed' ? 'bg-green-50 text-green-500' : 'bg-stone-50 text-stone-400'
                      }`}>
                        {match.status === 'live' ? <Play size={20} fill="currentColor" /> : 
                         match.status === 'completed' ? <Trophy size={20} /> : <Calendar size={20} />}
                      </div>
                      <div>
                        <h3 className="font-heading text-lg leading-tight group-hover:text-onyx transition-colors">{match.title}</h3>
                        <p className="text-[11px] text-stone-400 font-bold uppercase tracking-wider">{match.tournament?.title}</p>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(match.status)} rounded-full text-[10px] px-3 py-1 font-bold`}>
                      {getStatusLabel(match.status)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 my-5">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-stone-400" />
                        <span className="text-xs font-medium text-stone-600">
                          {match.start_time ? new Date(match.start_time).toLocaleDateString() : 'TBD'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-stone-400" />
                        <span className="text-xs font-medium text-stone-600">{match.mode}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Play size={14} className="text-stone-400" />
                        <span className="text-xs font-medium text-stone-600">
                          {match.start_time ? new Date(match.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-stone-400" />
                        <span className="text-xs font-medium text-stone-600">{match.map || 'Bermuda'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-stone-50 flex items-center justify-between gap-3">
                    {match.status === "upcoming" ? (
                      <>
                        <button className="flex-1 py-3 px-4 rounded-2xl text-xs font-bold text-stone-500 hover:bg-stone-50 transition-colors">
                          View Details
                        </button>
                          <PillButton 
                            className="flex-1 text-xs h-12 shadow-lg shadow-lime-yellow/20"
                            onClick={() => handleJoinMatch(match.tournament_id, match.id)}
                            disabled={joining === match.id}
                          >
                            {joining === match.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Join Match"}
                          </PillButton>
                      </>
                    ) : match.status === "live" ? (
                      <Link href={`/live?matchId=${match.id}`} className="w-full">
                        <PillButton className="w-full text-xs h-12 bg-red-500 hover:bg-red-600 text-white border-none flex items-center justify-center gap-2">
                          <Play size={16} fill="white" /> Watch Live
                        </PillButton>
                      </Link>
                    ) : (
                      <button className="w-full py-3 px-4 rounded-2xl text-xs font-bold bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors flex items-center justify-center gap-2">
                        <CheckCircle2 size={16} /> View Results
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white p-12 rounded-[40px] border border-dashed border-stone-200 text-center space-y-4"
            >
              <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto">
                <Swords size={40} className="text-stone-200" />
              </div>
              <div>
                <h3 className="text-lg font-heading text-onyx">No Matches Found</h3>
                <p className="text-sm text-stone-400 mt-1">Try adjusting your filters or search query.</p>
              </div>
              <button 
                onClick={() => { setActiveFilter("All"); setSearchQuery(""); }}
                className="text-xs font-bold text-onyx underline underline-offset-4 decoration-lime-yellow decoration-2"
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
