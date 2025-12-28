"use client";

import { AdminNav } from "@/components/layout/AdminNav";
import { 
  Trophy, 
  Users, 
  Activity, 
  Gamepad2, 
  ChevronRight, 
  Loader2,
  Monitor,
  Target,
  Zap,
  Radio,
  Eye,
  Signal,
  LayoutGrid,
  Play
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { BentoCard } from "@/components/ui/BentoCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-onyx/20 mb-4" />
        <p className="text-[10px] font-black text-charcoal/40 uppercase tracking-[0.3em]">Acquiring Live Signal...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-32 bg-background text-onyx font-sans">
      <div className="px-8 pt-24 relative z-10 max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-charcoal/40 uppercase tracking-[0.3em]">Combat Oversight</p>
            <h1 className="text-[48px] font-black leading-none tracking-tight">Live Control</h1>
          </div>
          <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-soft border border-black/[0.03]">
            <div className="w-2 h-2 rounded-full bg-onyx animate-pulse" />
            <p className="text-[10px] font-black text-onyx uppercase tracking-widest">Feed Operational</p>
          </div>
        </header>

        {/* KPI Strip */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BentoCard variant="vibrant" className="p-8 flex flex-col justify-between min-h-[160px] relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-onyx/10 flex items-center justify-center">
                  <Radio size={20} className="text-onyx" />
                </div>
                <span className="text-[10px] font-black text-onyx/40 uppercase tracking-widest">Active Deployments</span>
              </div>
              <p className="text-[48px] font-black leading-none">{summary.liveTournaments}</p>
            </div>
            <div className="absolute top-4 right-4 w-32 h-32 bg-onyx/5 rounded-full blur-3xl pointer-events-none" />
          </BentoCard>

          <BentoCard variant="pastel" pastelColor="mint" className="p-8 flex flex-col justify-between min-h-[160px] relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center">
                  <Users size={20} className="text-onyx" />
                </div>
                <span className="text-[10px] font-black text-onyx/40 uppercase tracking-widest">Warriors Active</span>
              </div>
              <p className="text-[48px] font-black leading-none">{summary.totalPlayers}</p>
            </div>
            <div className="absolute top-4 right-4 w-32 h-32 bg-white/20 rounded-full blur-3xl pointer-events-none" />
          </BentoCard>
        </div>

        {/* Active Operations List */}
        <section className="space-y-6">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-2xl font-black tracking-tight">Active Operations</h3>
            <span className="text-[10px] font-black text-charcoal/40 uppercase tracking-widest">{tournaments.length} DEPLOYED</span>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar -mx-8 px-8">
            {tournaments.map((t) => (
              <motion.div
                key={t.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedTournament(t.id)}
                className="flex-shrink-0"
              >
                <BentoCard 
                  variant={selectedTournament === t.id ? "dark" : "default"}
                  className={`w-72 p-6 flex flex-col justify-between h-[220px] cursor-pointer transition-all duration-300 ${
                    selectedTournament === t.id ? "shadow-glow-soft" : "hover:bg-off-white"
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        selectedTournament === t.id ? "bg-white/10 text-pastel-mint" : "bg-off-white text-onyx/30"
                      }`}>
                        <Trophy size={20} />
                      </div>
                      <StatusBadge variant="live" className="text-[8px] px-2 py-0.5" />
                    </div>
                    <h3 className="text-lg font-black leading-tight mb-2 line-clamp-2">{t.title}</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-6">
                      <div>
                        <p className={`text-[8px] font-bold uppercase tracking-widest mb-0.5 ${selectedTournament === t.id ? "text-white/40" : "text-onyx/40"}`}>Matches</p>
                        <p className="text-sm font-black">{t.matches_count}</p>
                      </div>
                      <div>
                        <p className={`text-[8px] font-bold uppercase tracking-widest mb-0.5 ${selectedTournament === t.id ? "text-white/40" : "text-onyx/40"}`}>Players</p>
                        <p className="text-sm font-black">{t.players_count}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); updateTournamentStatus(t.id, 'paused'); }}
                        className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                          selectedTournament === t.id ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-off-white text-charcoal hover:bg-white'
                        }`}
                      >
                        Pause
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); updateTournamentStatus(t.id, 'completed'); }}
                        className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                          selectedTournament === t.id ? 'bg-pastel-mint text-onyx hover:opacity-90' : 'bg-onyx text-white hover:opacity-90'
                        }`}
                      >
                        End
                      </button>
                    </div>
                  </div>
                </BentoCard>
              </motion.div>
            ))}
            
            {tournaments.length === 0 && (
              <div className="w-full h-[220px] bg-white rounded-[28px] border-2 border-dashed border-black/[0.05] flex flex-col items-center justify-center gap-3">
                <Monitor size={32} className="text-onyx/10" />
                <p className="text-[10px] font-black uppercase tracking-widest text-charcoal/30">No active deployments</p>
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
              <BentoCard className="p-10 space-y-12 relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-charcoal/40 uppercase tracking-[0.3em]">Operational Dossier</p>
                    <h2 className="text-3xl font-black tracking-tight">{currentTournament.title}</h2>
                  </div>
                  <div className="flex -space-x-3">
                    {[1,2,3,4].map((i) => (
                      <div key={i} className="w-11 h-11 rounded-full border-4 border-white bg-off-white shadow-soft overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+10}`} alt="warrior" />
                      </div>
                    ))}
                    <div className="w-11 h-11 rounded-full border-4 border-white bg-onyx flex items-center justify-center text-[10px] font-black text-white shadow-soft">
                      +{currentTournament.players_count! > 4 ? currentTournament.players_count! - 4 : 0}
                    </div>
                  </div>
                </div>

                {/* Tournament Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: "Confirmed Kills", value: statsSummary?.totalKills || 0, icon: Target, color: "coral" },
                    { label: "Warriors Alive", value: statsSummary?.playersAlive || 0, icon: Activity, color: "mint" },
                    { label: "System Viewers", value: statsSummary?.totalViewers.toLocaleString() || 0, icon: Eye, color: "sky" },
                  ].map((stat, i) => (
                    <div key={i} className="flex items-center gap-5 p-5 bg-off-white rounded-3xl border border-black/[0.02]">
                      <div className={`w-12 h-12 rounded-2xl bg-pastel-${stat.color} flex items-center justify-center`}>
                        <stat.icon size={20} className="text-onyx" />
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-onyx/40 uppercase tracking-widest">{stat.label}</p>
                        <p className="text-2xl font-black">{stat.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Live Matches List */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 px-1">
                    <div className="w-2 h-2 rounded-full bg-onyx animate-pulse" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Ongoing Battles</h3>
                  </div>
                  <div className="space-y-4">
                    {tournamentMatches.map((m) => (
                      <motion.div 
                        key={m.id}
                        whileHover={{ x: 4 }}
                        className="p-6 bg-off-white rounded-[24px] border border-black/[0.02] flex flex-col md:flex-row md:items-center justify-between gap-6 group cursor-pointer"
                      >
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-onyx/20 group-hover:text-onyx transition-colors shadow-soft">
                            <Gamepad2 size={28} />
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-3">
                              <h4 className="text-lg font-black">{m.title}</h4>
                              <span className="px-3 py-1 bg-onyx text-white text-[8px] font-black uppercase tracking-widest rounded-full">
                                Round {m.current_round}
                              </span>
                            </div>
                            <p className="text-[10px] text-charcoal/40 font-bold uppercase tracking-widest flex items-center gap-2">
                              {m.mode} <span className="w-1 h-1 bg-onyx/10 rounded-full" /> {m.map}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between md:justify-end gap-8 pt-4 md:pt-0 border-t md:border-t-0 border-black/5">
                          <div className="flex gap-8">
                            <div>
                              <p className="text-[8px] font-bold text-charcoal/40 uppercase tracking-widest mb-0.5">Teams Alive</p>
                              <p className="text-sm font-black">{m.live_stats?.teams_alive || 0}</p>
                            </div>
                            <div>
                              <p className="text-[8px] font-bold text-charcoal/40 uppercase tracking-widest mb-0.5">Viewers</p>
                              <p className="text-sm font-black">{m.viewers_count.toLocaleString()}</p>
                            </div>
                          </div>
                          <Link href={`/live?match=${m.id}`}>
                            <motion.button 
                              whileTap={{ scale: 0.95 }}
                              className="px-6 py-3 bg-onyx text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2"
                            >
                              Enter Feed <ChevronRight size={14} strokeWidth={3} />
                            </motion.button>
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                    {tournamentMatches.length === 0 && (
                      <div className="py-16 text-center flex flex-col items-center gap-3 bg-off-white rounded-[28px] border-2 border-dashed border-black/[0.05]">
                        <Zap size={24} className="text-onyx/10" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-charcoal/30 italic">No active match signals</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-pastel-mint/10 rounded-full blur-[100px] pointer-events-none" />
              </BentoCard>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      <AdminNav />
    </main>
  );
}
