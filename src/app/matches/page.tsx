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

      const { data, error } = await query.order("start_time", { ascending: true });
      
      if (error) {
        console.error("Supabase error fetching matches:", error);
        throw error;
      }

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
      case "live": return "bg-destructive text-destructive-foreground";
      case "upcoming": return "bg-primary text-primary-foreground";
      case "completed": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-foreground" />
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-32 bg-background">
      <HeroSection 
        title="Battle Arena" 
        subtitle="The stage is set. Claim your glory in the upcoming tournaments."
        className="bg-background"
      />

          <div className="px-6 -mt-12 relative z-20 space-y-10 max-w-2xl mx-auto">
            {/* Filter Controls */}
            <div className="flex bg-black/5 backdrop-blur-xl p-2 rounded-full border border-black/5 overflow-x-auto no-scrollbar gap-2 shadow-2xl shadow-black/5">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-8 py-4 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                    activeFilter === filter 
                      ? "bg-primary text-primary-foreground shadow-2xl scale-105" 
                      : "text-foreground/40 hover:text-foreground hover:bg-background/50"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="relative group">
              <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within:text-foreground transition-all group-focus-within:scale-110" size={20} />
              <input 
                type="text" 
                placeholder="Search tournament..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background border border-black/5 rounded-[2.5rem] py-8 pl-20 pr-10 text-xs focus:outline-none focus:ring-8 focus:ring-black/[0.02] transition-all shadow-2xl shadow-black/5 font-bold uppercase tracking-[0.2em] placeholder:text-foreground/10"
              />
            </div>


          {/* Match List */}
          <div className="grid grid-cols-1 gap-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-muted" />
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Awaiting orders...</p>
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
                    className="bg-black rounded-[2.5rem] p-8 shadow-2xl overflow-hidden group relative"
                  >
                    {/* Radial Glows */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                      <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-mustard blur-[120px] rounded-full" />
                      <div className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] bg-dark-goldenrod blur-[120px] rounded-full" />
                    </div>

                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-8">
                        <div className="flex items-center gap-5">
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border border-royal-gold/5 ${
                            match.status === 'live' ? 'bg-destructive/10 text-destructive' : 'bg-royal-gold/5 text-royal-gold'
                          }`}>
                            {match.status === 'live' ? <Play size={28} fill="currentColor" /> : <Swords size={28} />}
                          </div>
                          <div className="space-y-1">
                            <h3 className="font-heading text-2xl leading-tight text-royal-gold">{match.title}</h3>
                            <p className="text-[10px] text-royal-gold/40 font-bold uppercase tracking-[0.3em]">{match.tournament?.title}</p>
                          </div>
                        </div>
                        <Badge className={`${getStatusColor(match.status)} rounded-full text-[10px] px-4 py-1.5 font-bold border-none tracking-widest`}>
                          {match.status.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-5 mb-8">
                        <div className="bg-royal-gold/5 rounded-3xl p-5 border border-royal-gold/5">
                          <div className="flex items-center gap-3 text-royal-gold/40 mb-3">
                            <Calendar size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Schedule</span>
                          </div>
                          <p className="text-sm font-serif italic text-royal-gold/90">
                            {match.start_time ? new Date(match.start_time).toLocaleDateString() : 'TBD'} @ {match.start_time ? new Date(match.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                          </p>
                        </div>
                        <div className="bg-royal-gold/5 rounded-3xl p-5 border border-royal-gold/5">
                          <div className="flex items-center gap-3 text-royal-gold/40 mb-3">
                            <Users size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Configuration</span>
                          </div>
                          <p className="text-sm font-serif italic text-royal-gold/90">{match.mode} • {match.map || 'Bermuda'}</p>
                        </div>
                      </div>

                      <div className="pt-8 border-t border-royal-gold/5 flex items-center justify-between gap-5">
                        {match.status === "upcoming" ? (
                          <>
                            <button className="flex-1 py-5 px-8 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-royal-gold/40 hover:text-royal-gold transition-colors border border-royal-gold/5">
                              Details
                            </button>
                            <button 
                              onClick={() => handleJoinMatch(match.tournament_id, match.id)}
                              disabled={joining === match.id}
                              className="flex-[2] bg-royal-gold text-black py-5 px-8 rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-mustard transition-all shadow-xl flex items-center justify-center gap-3"
                            >
                              {joining === match.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "RESERVE SLOT"}
                            </button>
                          </>
                        ) : (
                          <Link href={match.status === 'live' ? `/live?matchId=${match.id}` : '#'} className="w-full">
                            <button className={`w-full py-5 px-8 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 ${
                              match.status === 'live' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-destructive/20' : 'bg-royal-gold/5 text-royal-gold/40'
                            }`}>
                              {match.status === 'live' ? <><Play size={18} fill="currentColor" /> WATCH ARENA</> : "VIEW RESULTS"}
                            </button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-background p-20 rounded-[3.5rem] border border-black/5 text-center space-y-8 shadow-2xl shadow-black/5"
              >
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <Swords size={48} className="text-muted-foreground/30" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-3xl font-heading text-foreground uppercase tracking-tight">Arena is Quiet</h3>
                  <p className="text-sm text-muted-foreground font-serif italic">No battles match your current search criteria.</p>
                </div>
                <button 
                  onClick={() => { setActiveFilter("All"); setSearchQuery(""); }}
                  className="text-[10px] font-bold text-foreground uppercase tracking-[0.3em] border-b-2 border-foreground/10 hover:border-foreground transition-colors pb-1"
                >
                  Reset Search
                </button>
              </motion.div>
            )}
          </div>
        </div>

      <BottomNav />
    </main>
  );
}
