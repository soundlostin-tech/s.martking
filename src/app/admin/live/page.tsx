"use client";

import { HeroSection } from "@/components/layout/HeroSection";
import { AdminNav } from "@/components/layout/AdminNav";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
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
    const interval = setInterval(fetchLiveData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchLiveData = async () => {
    try {
      const { data: activeTournaments, error: tError } = await supabase
        .from("tournaments")
        .select(`id, title, status`)
        .eq("status", "active");

      if (tError) throw tError;

      const { data: liveMatches, error: mError } = await supabase
        .from("matches")
        .select("*")
        .eq("status", "live");

      if (mError) throw mError;

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
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <Loader2 className="w-12 h-12 animate-spin text-black/10" />
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-32 bg-zinc-50">
      <HeroSection 
        title={<>Live <span className="italic font-serif opacity-60">Control</span></>}
        subtitle="Real-time arena oversight and deployment control."
        className="mx-0 rounded-none pb-32 bg-zinc-50 border-b border-black/5"
      >
        <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-zinc-200 rounded-full blur-[120px]" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-zinc-300 rounded-full blur-[120px]" />
        </div>
      </HeroSection>

      <div className="px-6 -mt-24 relative z-10 space-y-10 max-w-5xl mx-auto">
        {/* KPI Strip */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-primary rounded-[2.5rem] p-8 text-black border border-black/5 shadow-2xl shadow-black/10 relative overflow-hidden group"
            >
              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-1">
                  <p className="text-[10px] text-black/40 uppercase font-bold tracking-[0.2em]">Active Deployments</p>
                  <h3 className="text-4xl font-heading">{summary.liveTournaments}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-2 h-2 rounded-full bg-black animate-pulse" />
                    <p className="text-[9px] text-black/40 font-bold uppercase tracking-widest">LIVE SYSTEM FEED</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-black/10 text-black">
                  <Activity size={24} />
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/20 rounded-full blur-3xl" />
            </motion.div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-zinc-50 rounded-[2.5rem] p-8 text-black border border-black/5 shadow-2xl shadow-black/5 relative overflow-hidden group"
          >
            <div className="flex justify-between items-start relative z-10">
              <div className="space-y-1">
                <p className="text-[10px] text-black/30 uppercase font-bold tracking-[0.2em]">Warriors in Action</p>
                <h3 className="text-4xl font-heading">{summary.totalPlayers}</h3>
                <p className="text-[9px] text-black/20 font-bold uppercase tracking-widest mt-2">TOTAL ACTIVE PARTICIPANTS</p>
              </div>
              <div className="p-4 rounded-2xl bg-black/5 text-black">
                <Users size={24} />
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-black/[0.02] rounded-full blur-3xl" />
          </motion.div>
        </div>

        {/* Live Tournaments List */}
        <section className="space-y-6">
          <div className="flex justify-between items-end px-2">
            <div className="space-y-1">
              <h3 className="text-2xl font-heading text-black">Active <span className="italic font-serif opacity-60">Operations</span></h3>
              <p className="text-[10px] font-bold text-black/30 uppercase tracking-[0.2em]">{tournaments.length} DEPLOYMENTS DETECTED</p>
            </div>
          </div>
          
          <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar -mx-6 px-6">
            {tournaments.map((t) => (
              <motion.div
                key={t.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedTournament(t.id)}
                className={`flex-shrink-0 w-80 p-8 rounded-[2.5rem] border transition-all duration-500 cursor-pointer relative overflow-hidden group ${
                  selectedTournament === t.id 
                    ? 'bg-zinc-50 border-black shadow-2xl shadow-black/10' 
                    : 'bg-zinc-50 border-black/5 shadow-sm opacity-60 hover:opacity-100'
                }`}
              >
                <div className="relative z-10 space-y-6">
                  <div className="flex justify-between items-start">
                    <div className={`p-3 rounded-2xl transition-colors duration-500 ${selectedTournament === t.id ? 'bg-black text-white' : 'bg-black/5 text-black/20'}`}>
                      <Trophy size={20} />
                    </div>
                    <Badge className={`border-none font-bold text-[8px] tracking-[0.2em] px-3 py-1 rounded-full ${selectedTournament === t.id ? 'bg-black text-white' : 'bg-black/5 text-black/40'}`}>
                      ACTIVE
                    </Badge>
                  </div>
                  
                  <h3 className={`text-xl font-heading leading-tight ${selectedTournament === t.id ? 'text-black' : 'text-black/60'}`}>{t.title}</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-bold text-black/20 uppercase tracking-widest">Matches</span>
                      <p className="text-lg font-heading text-black">{t.matches_count}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-bold text-black/20 uppercase tracking-widest">Players</span>
                      <p className="text-lg font-heading text-black">{t.players_count}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); updateTournamentStatus(t.id, 'paused'); }}
                      className={`flex-1 py-3 rounded-xl text-[9px] font-bold uppercase tracking-[0.2em] transition-all ${
                        selectedTournament === t.id ? 'bg-black/5 text-black hover:bg-black/10' : 'bg-black/[0.02] text-black/20'
                      }`}
                    >
                      Pause
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); updateTournamentStatus(t.id, 'completed'); }}
                      className={`flex-1 py-3 rounded-xl text-[9px] font-bold uppercase tracking-[0.2em] transition-all ${
                        selectedTournament === t.id ? 'bg-black text-white hover:bg-zinc-800' : 'bg-black/[0.02] text-black/20'
                      }`}
                    >
                      End
                    </button>
                  </div>
                </div>
                {selectedTournament === t.id && (
                  <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-[-20%] right-[-10%] w-full h-full bg-zinc-200 blur-[80px] rounded-full" />
                  </div>
                )}
              </motion.div>
            ))}
            
            {tournaments.length === 0 && (
              <div className="w-full bg-zinc-50 p-16 rounded-[3rem] border border-dashed border-black/10 text-center flex flex-col items-center gap-4">
                <Monitor size={48} strokeWidth={1} className="text-black/5" />
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/20">No active deployments detected</p>
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
              className="space-y-8"
            >
              <div className="bg-zinc-50 p-10 rounded-[3rem] border border-black/5 shadow-2xl shadow-black/[0.02] space-y-12 overflow-hidden relative">
                <div className="relative z-10 space-y-12">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-black/20 uppercase tracking-[0.3em]">OPERATIONAL DOSSIER</span>
                      <h2 className="text-3xl font-heading text-black leading-tight">{currentTournament.title}</h2>
                    </div>
                    <div className="flex -space-x-3">
                      {[1,2,3,4].map((i) => (
                        <div key={i} className="w-12 h-12 rounded-full border-4 border-zinc-50 bg-black/5 shadow-xl overflow-hidden">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+10}`} alt="warrior" />
                        </div>
                      ))}
                      <div className="w-12 h-12 rounded-full border-4 border-zinc-50 bg-black flex items-center justify-center text-[10px] font-bold text-white shadow-xl">
                        +{currentTournament.players_count! > 4 ? currentTournament.players_count! - 4 : 0}
                      </div>
                    </div>
                  </div>

                  {/* Tournament Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { label: "Confirmed Kills", value: statsSummary?.totalKills || 0, icon: Target },
                      { label: "Avg Lethality", value: statsSummary?.avgKills || 0, icon: Activity },
                      { label: "System Viewers", value: statsSummary?.totalViewers.toLocaleString() || 0, icon: Monitor },
                    ].map((stat, i) => (
                      <div key={i} className="p-6 bg-zinc-50 rounded-[2rem] border border-black/5 flex items-center gap-6 shadow-2xl shadow-black/[0.01]">
                        <div className="w-14 h-14 rounded-2xl bg-black/5 text-black flex items-center justify-center">
                          <stat.icon size={22} />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[9px] text-black/20 uppercase font-bold tracking-widest">{stat.label}</p>
                          <p className="text-2xl font-heading text-black">{stat.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Live Matches List */}
                  <div className="space-y-8">
                    <div className="flex items-center gap-3 px-2">
                      <div className="w-2 h-2 rounded-full bg-black animate-pulse" />
                      <h3 className="text-[10px] font-bold text-black uppercase tracking-[0.3em]">ONGOING BATTLES</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                      {tournamentMatches.map((m) => (
                        <div 
                          key={m.id}
                          className="p-8 bg-zinc-50 rounded-[2.5rem] border border-black/5 hover:border-black/10 transition-all duration-500 group flex flex-col md:flex-row md:items-center justify-between gap-8 shadow-2xl shadow-black/[0.01]"
                        >
                          <div className="flex items-center gap-8">
                            <div className="w-20 h-20 bg-black/5 rounded-[2rem] flex items-center justify-center text-black/20 group-hover:text-black group-hover:bg-black/10 transition-all duration-500 shadow-inner">
                              <Gamepad2 size={32} />
                            </div>
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-3">
                                <h4 className="text-xl font-heading text-black">{m.title}</h4>
                                <Badge className="bg-black text-white border-none px-3 py-1 text-[8px] font-bold tracking-widest rounded-full">
                                  ROUND {m.current_round}
                                </Badge>
                              </div>
                              <p className="text-[10px] text-black/30 font-bold uppercase tracking-[0.2em] flex items-center gap-3">
                                {m.mode.toUpperCase()}
                                <span className="w-1 h-1 bg-black/10 rounded-full" />
                                {m.map.toUpperCase()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between md:justify-end gap-12 border-t md:border-t-0 pt-6 md:pt-0 border-black/5">
                            <div className="flex items-center gap-8">
                              <div className="space-y-0.5 text-center md:text-left">
                                <span className="text-[8px] font-bold text-black/20 uppercase tracking-widest">Teams Alive</span>
                                <p className="text-lg font-heading text-black">{m.live_stats?.teams_alive || 0}</p>
                              </div>
                              <div className="space-y-0.5 text-center md:text-left">
                                <span className="text-[8px] font-bold text-black/20 uppercase tracking-widest">Viewers</span>
                                <p className="text-lg font-heading text-black">{m.viewers_count.toLocaleString()}</p>
                              </div>
                            </div>
                            <button 
                              className="px-8 py-4 bg-black text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all shadow-2xl shadow-black/20 flex items-center gap-2"
                              onClick={() => window.location.href = `/live?match=${m.id}`}
                            >
                              ENTER FEED <ChevronRight size={14} strokeWidth={3} />
                            </button>
                          </div>
                        </div>
                      ))}
                      {tournamentMatches.length === 0 && (
                        <div className="py-20 text-center flex flex-col items-center gap-4">
                          <Zap size={32} strokeWidth={1} className="text-black/5" />
                          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/20 italic">No active match signals detected</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* Visual Glows */}
                <div className="absolute top-[-20%] left-[-10%] w-full h-full bg-zinc-200/20 blur-[100px] rounded-full pointer-events-none" />
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      <AdminNav />
    </main>
  );
}
