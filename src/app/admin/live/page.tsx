"use client";

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
  Zap,
  Radio,
  Eye,
  ShieldCheck,
  Signal,
  LayoutGrid,
  Settings
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

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
    players_alive?: number;
    safe_zone_phase?: number;
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
          .select("id", { count: 'exact' })
          .eq("tournament_id", t.id)
          .eq("status", "live");
        
        const { count: pCount } = await supabase
          .from("participants")
          .select("user_id", { count: 'exact' })
          .eq("tournament_id", t.id);

        return {
          ...t,
          matches_count: mCount || 0,
          players_count: pCount || 0
        };
      }));

      const { count: totalPlayersInMatches } = await supabase
        .from("participants")
        .select("user_id", { count: 'exact' })
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
      toast.error("Telemetry failure. System reconnecting...");
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
      toast.success(`Event marked as ${status}`);
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
    const playersAlive = tournamentMatches.reduce((acc, m) => acc + (m.live_stats?.players_alive || 0), 0);
    return { totalKills, avgKills, totalViewers, playersAlive };
  }, [tournamentMatches]);

  if (loading && tournaments.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-evergreen-950">
        <div className="space-y-4 text-center">
          <Signal className="w-12 h-12 animate-pulse text-malachite-500 mx-auto" />
          <p className="text-[10px] font-bold text-shadow-green-400 uppercase tracking-[0.3em]">Acquiring Live Signal...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-32 bg-evergreen-950 bg-[radial-gradient(circle_at_50%_0%,_#0D2818_0%,_#0a2013_100%)]">
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-malachite-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="px-6 pt-24 relative z-10 space-y-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h4 className="text-[10px] font-bold text-malachite-500 uppercase tracking-[0.4em]">Combat Oversight</h4>
            <h1 className="text-4xl font-heading text-white">Live <span className="italic font-serif text-white/60">Control</span></h1>
          </div>
          <div className="flex items-center gap-3 bg-white/5 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl">
            <div className="w-2 h-2 rounded-full bg-malachite-500 animate-pulse" />
            <p className="text-[9px] font-bold text-malachite-500 uppercase tracking-widest">System Feed Operational</p>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { label: "Active Deployments", value: summary.liveTournaments, icon: Radio, primary: true },
            { label: "Warriors in Action", value: summary.totalPlayers, icon: Users },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-[2.5rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden group ${
                stat.primary ? "bg-malachite-500/20 backdrop-blur-xl border-malachite-500/30" : "bg-white/5 backdrop-blur-xl"
              }`}
            >
              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-1">
                  <p className={`text-[10px] uppercase font-bold tracking-[0.2em] ${stat.primary ? "text-malachite-500" : "text-white/40"}`}>{stat.label}</p>
                  <h3 className="text-4xl font-heading text-white">{stat.value}</h3>
                  <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest mt-2">REAL-TIME TELEMETRY</p>
                </div>
                <div className={`p-4 rounded-2xl ${stat.primary ? "bg-malachite-500 text-white shadow-[0_0_20px_rgba(229,107,111,0.3)]" : "bg-white/10 text-malachite-500"} group-hover:scale-110 transition-transform duration-500`}>
                  <stat.icon size={24} />
                </div>
              </div>
              <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-[60px] ${stat.primary ? "bg-malachite-500/20" : "bg-white/5"}`} />
            </motion.div>
          ))}
        </div>

        {/* Active Operations List */}
        <section className="space-y-6">
          <div className="flex justify-between items-end px-2">
            <div className="space-y-1">
              <h3 className="text-2xl font-heading text-white">Active <span className="italic font-serif text-white/60">Operations</span></h3>
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">{tournaments.length} DEPLOYMENTS DETECTED</p>
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
                    ? 'bg-malachite-500/20 border-malachite-500/50 shadow-2xl' 
                    : 'bg-white/5 border-white/10 opacity-60 hover:opacity-100'
                }`}
              >
                <div className="relative z-10 space-y-6">
                  <div className="flex justify-between items-start">
                    <div className={`p-3 rounded-2xl transition-colors duration-500 ${selectedTournament === t.id ? 'bg-malachite-500 text-white' : 'bg-white/10 text-white/20'}`}>
                      <Trophy size={20} />
                    </div>
                    <Badge className={`border-none font-bold text-[8px] tracking-[0.2em] px-3 py-1 rounded-full ${selectedTournament === t.id ? 'bg-malachite-500 text-white' : 'bg-white/10 text-white/40'}`}>
                      ACTIVE
                    </Badge>
                  </div>
                  
                  <h3 className={`text-xl font-heading leading-tight ${selectedTournament === t.id ? 'text-white' : 'text-white/60'}`}>{t.title}</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Matches</span>
                      <p className="text-lg font-heading text-white">{t.matches_count}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Players</span>
                      <p className="text-lg font-heading text-white">{t.players_count}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); updateTournamentStatus(t.id, 'paused'); }}
                      className={`flex-1 py-3 rounded-xl text-[9px] font-bold uppercase tracking-[0.2em] transition-all ${
                        selectedTournament === t.id ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white/[0.02] text-white/20'
                      }`}
                    >
                      Pause
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); updateTournamentStatus(t.id, 'completed'); }}
                      className={`flex-1 py-3 rounded-xl text-[9px] font-bold uppercase tracking-[0.2em] transition-all ${
                        selectedTournament === t.id ? 'bg-malachite-500 text-white hover:bg-malachite-500/80 shadow-lg shadow-malachite-500/20' : 'bg-white/[0.02] text-white/20'
                      }`}
                    >
                      End
                    </button>
                  </div>
                </div>
                {selectedTournament === t.id && (
                  <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="absolute top-[-20%] right-[-10%] w-full h-full bg-malachite-500 blur-[80px] rounded-full" />
                  </div>
                )}
              </motion.div>
            ))}
            
            {tournaments.length === 0 && (
              <div className="w-full bg-white/5 backdrop-blur-xl p-16 rounded-[3rem] border border-dashed border-white/10 text-center flex flex-col items-center gap-4">
                <Monitor size={48} strokeWidth={1} className="text-white/5" />
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">No active deployments detected</p>
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
              <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[3rem] border border-white/10 shadow-2xl space-y-12 overflow-hidden relative">
                <div className="relative z-10 space-y-12">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">OPERATIONAL DOSSIER</span>
                      <h2 className="text-3xl font-heading text-white leading-tight">{currentTournament.title}</h2>
                    </div>
                    <div className="flex -space-x-3">
                      {[1,2,3,4].map((i) => (
                        <div key={i} className="w-12 h-12 rounded-full border-4 border-evergreen-950 bg-white/5 shadow-xl overflow-hidden">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+10}`} alt="warrior" />
                        </div>
                      ))}
                      <div className="w-12 h-12 rounded-full border-4 border-evergreen-950 bg-malachite-500 flex items-center justify-center text-[10px] font-bold text-white shadow-xl">
                        +{currentTournament.players_count! > 4 ? currentTournament.players_count! - 4 : 0}
                      </div>
                    </div>
                  </div>

                  {/* Tournament Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { label: "Confirmed Kills", value: statsSummary?.totalKills || 0, icon: Target },
                      { label: "Warriors Alive", value: statsSummary?.playersAlive || 0, icon: Activity },
                      { label: "System Viewers", value: statsSummary?.totalViewers.toLocaleString() || 0, icon: Eye },
                    ].map((stat, i) => (
                      <div key={i} className="p-6 bg-white/5 rounded-[2rem] border border-white/10 flex items-center gap-6 shadow-2xl">
                        <div className="w-14 h-14 rounded-2xl bg-white/5 text-malachite-500 flex items-center justify-center">
                          <stat.icon size={22} />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[9px] text-white/20 uppercase font-bold tracking-widest">{stat.label}</p>
                          <p className="text-2xl font-heading text-white">{stat.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Live Matches List */}
                  <div className="space-y-8">
                    <div className="flex items-center gap-3 px-2">
                      <div className="w-2 h-2 rounded-full bg-malachite-500 animate-pulse" />
                      <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.3em]">ONGOING BATTLES</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                      {tournamentMatches.map((m) => (
                        <div 
                          key={m.id}
                          className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 hover:border-malachite-500/30 transition-all duration-500 group flex flex-col md:flex-row md:items-center justify-between gap-8 shadow-2xl"
                        >
                          <div className="flex items-center gap-8">
                            <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center text-white/20 group-hover:text-malachite-500 group-hover:bg-malachite-500/10 transition-all duration-500 shadow-inner border border-white/5">
                              <Gamepad2 size={32} />
                            </div>
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-3">
                                <h4 className="text-xl font-heading text-white">{m.title}</h4>
                                <Badge className="bg-malachite-500 text-white border-none px-3 py-1 text-[8px] font-bold tracking-widest rounded-full shadow-lg shadow-malachite-500/20">
                                  ROUND {m.current_round}
                                </Badge>
                              </div>
                              <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.2em] flex items-center gap-3">
                                {m.mode.toUpperCase()}
                                <span className="w-1 h-1 bg-white/10 rounded-full" />
                                {m.map.toUpperCase()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between md:justify-end gap-12 border-t md:border-t-0 pt-6 md:pt-0 border-white/5">
                            <div className="flex items-center gap-8">
                              <div className="space-y-0.5 text-center md:text-left">
                                <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Teams Alive</span>
                                <p className="text-lg font-heading text-white">{m.live_stats?.teams_alive || 0}</p>
                              </div>
                              <div className="space-y-0.5 text-center md:text-left">
                                <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Viewers</span>
                                <p className="text-lg font-heading text-white">{m.viewers_count.toLocaleString()}</p>
                              </div>
                            </div>
                            <button 
                              className="px-8 py-4 bg-malachite-500 text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-malachite-500/80 transition-all shadow-2xl shadow-malachite-500/20 flex items-center gap-2"
                              onClick={() => window.location.href = `/live?match=${m.id}`}
                            >
                              ENTER FEED <ChevronRight size={14} strokeWidth={3} />
                            </button>
                          </div>
                        </div>
                      ))}
                      {tournamentMatches.length === 0 && (
                        <div className="py-20 text-center flex flex-col items-center gap-4 bg-white/[0.02] rounded-[2rem] border border-dashed border-white/5">
                          <Zap size={32} strokeWidth={1} className="text-white/5" />
                          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20 italic">No active match signals detected</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* Visual Glows */}
                <div className="absolute top-[-20%] left-[-10%] w-full h-full bg-malachite-500/10 blur-[100px] rounded-full pointer-events-none" />
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      <AdminNav />
    </main>
  );
}
