"use client";

import { AdminNav } from "@/components/layout/AdminNav";
import { Badge } from "@/components/ui/badge";
import { PillButton } from "@/components/ui/PillButton";
import { 
  Play, 
  Pause, 
  Square, 
  Users, 
  Activity, 
  Trophy, 
  Gamepad2, 
  ChevronRight, 
  Loader2,
  Monitor,
  Clock,
  Target,
  Zap
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Tournament {
  id: string;
  title: string;
  status: string;
  matches_count?: number;
  players_count?: number;
}

interface Match {
  id: string;
  tournament_id: string;
  title: string;
  status: string;
  mode: string;
  map: string;
  current_round: number;
  viewers_count: number;
  live_stats: {
    total_kills?: number;
    teams_alive?: number;
    avg_match_duration?: string;
  };
}

export default function AdminLive() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    liveTournaments: 0,
    totalPlayers: 0
  });

  useEffect(() => {
    fetchLiveData();
    const interval = setInterval(fetchLiveData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchLiveData = async () => {
    try {
      // 1. Fetch active tournaments
      const { data: activeTournaments, error: tError } = await supabase
        .from("tournaments")
        .select(`
          id, 
          title, 
          status
        `)
        .eq("status", "active");

      if (tError) throw tError;

      // 2. Fetch all live matches
      const { data: liveMatches, error: mError } = await supabase
        .from("matches")
        .select("*")
        .eq("status", "live");

      if (mError) throw mError;

      // 3. Fetch counts for tournaments
      const tournamentsWithCounts = await Promise.all((activeTournaments || []).map(async (t) => {
        const { count: mCount } = await supabase
          .from("matches")
          .select("*", { count: 'exact', head: true })
          .eq("tournament_id", t.id)
          .eq("status", "live");
        
        const { count: pCount } = await supabase
          .from("participants")
          .select("*", { count: 'exact', head: true })
          .eq("tournament_id", t.id);

        return {
          ...t,
          matches_count: mCount || 0,
          players_count: pCount || 0
        };
      }));

      // 4. Summary counts
      const { count: totalPlayersInMatches } = await supabase
        .from("participants")
        .select("user_id", { count: 'exact', head: true })
        .not("match_id", "is", null);

      setTournaments(tournamentsWithCounts);
      setMatches(liveMatches || []);
      setSummary({
        liveTournaments: activeTournaments?.length || 0,
        totalPlayers: totalPlayersInMatches || 0
      });

      if (!selectedTournament && tournamentsWithCounts.length > 0) {
        setSelectedTournament(tournamentsWithCounts[0].id);
      }
    } catch (error: any) {
      console.error("Error fetching live data:", error);
      toast.error("Failed to refresh live data");
    } finally {
      setLoading(false);
    }
  };

  const updateTournamentStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("tournaments")
        .update({ status })
        .eq("id", id);
      
      if (error) throw error;
      toast.success(`Tournament marked as ${status}`);
      fetchLiveData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const currentTournament = useMemo(() => 
    tournaments.find(t => t.id === selectedTournament),
    [tournaments, selectedTournament]
  );

  const tournamentMatches = useMemo(() => 
    matches.filter(m => m.tournament_id === selectedTournament),
    [matches, selectedTournament]
  );

  const statsSummary = useMemo(() => {
    if (tournamentMatches.length === 0) return null;
    const totalKills = tournamentMatches.reduce((acc, m) => acc + (m.live_stats?.total_kills || 0), 0);
    const avgKills = (totalKills / tournamentMatches.length).toFixed(1);
    const totalViewers = tournamentMatches.reduce((acc, m) => acc + (m.viewers_count || 0), 0);
    return { totalKills, avgKills, totalViewers };
  }, [tournamentMatches]);

  if (loading && tournaments.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="w-8 h-8 animate-spin text-lemon-lime" />
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-32 bg-stone-50">
      {/* Header */}
      <div className="bg-onyx text-white px-6 pt-16 pb-20 rounded-b-[40px] shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-heading text-white">Live Monitoring</h1>
              <p className="text-stone-400 text-sm">Real-time arena oversight & control.</p>
            </div>
            <Badge className="bg-lime-yellow text-onyx px-4 py-1.5 rounded-full font-bold animate-pulse">
              LIVE SYSTEM
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/10">
              <div className="flex items-center gap-3 text-lime-yellow mb-2">
                <Activity size={18} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Live Tournaments</span>
              </div>
              <h3 className="text-3xl font-heading">{summary.liveTournaments}</h3>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/10">
              <div className="flex items-center gap-3 text-blue-400 mb-2">
                <Users size={18} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Active Players</span>
              </div>
              <h3 className="text-3xl font-heading">{summary.totalPlayers}</h3>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-lemon-lime/10 blur-[100px] rounded-full" />
      </div>

      <div className="px-6 -mt-10 space-y-6 relative z-20">
        {/* Live Tournaments List */}
        <section className="space-y-4">
          <div className="flex justify-between items-end px-2">
            <h2 className="text-xl font-heading text-onyx">Tournaments in Play</h2>
            <span className="text-[10px] font-bold text-stone-400 uppercase">{tournaments.length} ACTIVE</span>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            {tournaments.map((t) => (
              <motion.div
                key={t.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedTournament(t.id)}
                className={`flex-shrink-0 w-72 p-5 rounded-[32px] border transition-all cursor-pointer ${
                  selectedTournament === t.id 
                    ? 'bg-white border-lime-yellow shadow-xl' 
                    : 'bg-white/60 border-stone-200 shadow-sm opacity-70'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-onyx text-lime-yellow rounded-xl">
                    <Trophy size={20} />
                  </div>
                  <Badge className="bg-green-500/10 text-green-600 border-none font-bold text-[10px]">
                    ACTIVE
                  </Badge>
                </div>
                <h3 className="font-heading text-onyx mb-4 line-clamp-1">{t.title}</h3>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-1.5">
                    <Monitor size={14} className="text-stone-400" />
                    <span className="text-xs font-bold text-onyx">{t.matches_count} <span className="text-stone-400 font-medium">Matches</span></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users size={14} className="text-stone-400" />
                    <span className="text-xs font-bold text-onyx">{t.players_count} <span className="text-stone-400 font-medium">Players</span></span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); updateTournamentStatus(t.id, 'paused'); }}
                    className="flex-1 py-2 bg-stone-100 text-onyx rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-stone-200 transition-colors"
                  >
                    Pause
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); updateTournamentStatus(t.id, 'completed'); }}
                    className="flex-1 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-100 transition-colors"
                  >
                    End
                  </button>
                </div>
              </motion.div>
            ))}
            
            {tournaments.length === 0 && (
              <div className="w-full bg-white p-8 rounded-[32px] border border-dashed border-stone-300 text-center">
                <p className="text-stone-400 text-sm font-medium">No live tournaments found.</p>
              </div>
            )}
          </div>
        </section>

        {/* Detailed Monitoring Panel */}
        <AnimatePresence mode="wait">
          {currentTournament && (
            <motion.section
              key={currentTournament.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white p-8 rounded-[40px] border border-stone-100 shadow-xl shadow-stone-200/50 space-y-8">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">Live Overview</span>
                    <h2 className="text-2xl font-heading text-onyx mt-1">{currentTournament.title}</h2>
                  </div>
                  <div className="flex -space-x-3">
                    {[1,2,3].map((i) => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-stone-100 overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+10}`} alt="player" />
                      </div>
                    ))}
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-onyx flex items-center justify-center text-[10px] font-bold text-white">
                      +{currentTournament.players_count! > 3 ? currentTournament.players_count! - 3 : 0}
                    </div>
                  </div>
                </div>

                {/* Tournament Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-stone-50 rounded-[24px] border border-stone-100">
                    <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-red-500 shadow-sm mb-3">
                      <Target size={16} />
                    </div>
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Total Kills</p>
                    <p className="text-lg font-heading text-onyx">{statsSummary?.totalKills || 0}</p>
                  </div>
                  <div className="p-4 bg-stone-50 rounded-[24px] border border-stone-100">
                    <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-purple-500 shadow-sm mb-3">
                      <Clock size={16} />
                    </div>
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Avg Kills/Match</p>
                    <p className="text-lg font-heading text-onyx">{statsSummary?.avgKills || 0}</p>
                  </div>
                  <div className="p-4 bg-stone-50 rounded-[24px] border border-stone-100">
                    <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-blue-500 shadow-sm mb-3">
                      <Users size={16} />
                    </div>
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Total Viewers</p>
                    <p className="text-lg font-heading text-onyx">{statsSummary?.totalViewers.toLocaleString() || 0}</p>
                  </div>
                </div>

                {/* Live Matches List */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-onyx px-2 flex items-center gap-2">
                    <Zap size={14} className="text-lime-yellow" />
                    Ongoing Matches
                  </h3>
                  <div className="space-y-3">
                    {tournamentMatches.map((m) => (
                      <div 
                        key={m.id}
                        className="p-4 bg-stone-50 rounded-[28px] border border-stone-100 hover:border-onyx/20 transition-all group"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-onyx shadow-sm border border-stone-100">
                              <Gamepad2 size={24} />
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-onyx">{m.title}</h4>
                              <p className="text-[10px] text-stone-500 font-bold uppercase">{m.mode} • {m.map}</p>
                            </div>
                          </div>
                          <Badge className="bg-onyx text-white border-none px-3 py-1 text-[9px] font-bold">
                            ROUND {m.current_round}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <div className="flex flex-col">
                              <span className="text-[8px] font-bold text-stone-400 uppercase tracking-widest">Teams Alive</span>
                              <span className="text-xs font-bold text-onyx">{m.live_stats?.teams_alive || 0}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[8px] font-bold text-stone-400 uppercase tracking-widest">Viewers</span>
                              <span className="text-xs font-bold text-onyx">{m.viewers_count.toLocaleString()}</span>
                            </div>
                          </div>
                          <button 
                            className="flex items-center gap-2 px-4 py-2 bg-onyx text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-lime-yellow hover:text-onyx transition-all shadow-lg shadow-onyx/20"
                            onClick={() => window.location.href = `/live?match=${m.id}`}
                          >
                            Enter Match <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {tournamentMatches.length === 0 && (
                      <div className="py-12 text-center">
                        <p className="text-stone-400 text-xs font-medium italic">No active matches for this tournament session.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      <AdminNav />
    </main>
  );
}
