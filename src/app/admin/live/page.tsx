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
      <main className="min-h-screen pb-32 bg-off-white text-onyx font-sans">
        <div className="px-8 pt-24 relative z-10 max-w-6xl mx-auto space-y-16">
          {/* Hero Header */}
          <header className="relative">
            <div className="absolute -top-20 -left-10 w-64 h-64 bg-pastel-coral/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-[2px] bg-onyx/10" />
                <p className="text-[10px] font-black text-charcoal/40 uppercase tracking-[0.4em]">Combat Oversight</p>
              </div>
              <h1 className="text-[64px] font-black leading-[0.85] tracking-[-0.04em]">
                Live<br />
                <span className="text-onyx/20">Operations</span>
              </h1>
            </div>
            
            <div className="absolute top-0 right-0 hidden md:block">
              <div className="bg-white/80 backdrop-blur-md px-6 py-4 rounded-[32px] shadow-soft border border-black/[0.03] flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-pastel-coral shadow-[0_0_15px_rgba(255,191,163,0.8)] animate-pulse" />
                <div>
                  <p className="text-[10px] font-black text-onyx uppercase tracking-widest">Feed Status</p>
                  <p className="text-[12px] font-bold text-charcoal/40 uppercase tracking-tighter">Telemetery Synced</p>
                </div>
              </div>
            </div>
          </header>
  
          {/* KPI Strip */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <BentoCard variant="pastel" pastelColor="coral" className="p-10 flex flex-col justify-between h-[220px] relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-[22px] bg-white/60 flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                    <Radio size={24} className="text-onyx" />
                  </div>
                  <span className="text-[11px] font-black text-onyx/60 uppercase tracking-[0.2em]">Active Deployments</span>
                </div>
                <p className="text-[56px] font-black leading-none tracking-tighter">{summary.liveTournaments}</p>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            </BentoCard>
  
            <BentoCard variant="pastel" pastelColor="mint" className="p-10 flex flex-col justify-between h-[220px] relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-[22px] bg-white/60 flex items-center justify-center group-hover:rotate-[-12deg] transition-transform duration-500">
                    <Users size={24} className="text-onyx" />
                  </div>
                  <span className="text-[11px] font-black text-onyx/60 uppercase tracking-[0.2em]">Warriors Active</span>
                </div>
                <p className="text-[56px] font-black leading-none tracking-tighter">{summary.totalPlayers}</p>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            </BentoCard>
          </section>
  
          {/* Active Operations List */}
          <section className="space-y-8">
            <div className="flex justify-between items-center px-2">
              <h3 className="text-3xl font-black tracking-tight">Deployment Hub</h3>
              <div className="px-4 py-2 bg-white rounded-full shadow-sm border border-black/[0.03]">
                <p className="text-[10px] font-black text-charcoal/30 uppercase tracking-[0.2em]">{tournaments.length} ACTIVE SIGNALS</p>
              </div>
            </div>
            
            <div className="flex gap-6 overflow-x-auto pb-10 no-scrollbar -mx-8 px-8">
              {tournaments.map((t) => (
                <motion.div
                  key={t.id}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setSelectedTournament(t.id)}
                  className="flex-shrink-0"
                >
                  <BentoCard 
                    variant={selectedTournament === t.id ? "dark" : "default"}
                    className={cn(
                      "w-[340px] p-8 flex flex-col justify-between h-[280px] cursor-pointer transition-all duration-500 relative overflow-hidden",
                      selectedTournament === t.id ? "shadow-2xl shadow-onyx/30" : "bg-white hover:shadow-soft-lg"
                    )}
                  >
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-6">
                        <div className={cn(
                          "w-14 h-14 rounded-[22px] flex items-center justify-center transition-all duration-500",
                          selectedTournament === t.id ? "bg-white/10 text-white" : "bg-off-white text-onyx/30 shadow-sm"
                        )}>
                          <Trophy size={24} strokeWidth={2.5} />
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-soft-yellow rounded-full shadow-glow-soft">
                          <div className="w-1.5 h-1.5 rounded-full bg-onyx animate-pulse" />
                          <span className="text-[8px] font-black uppercase tracking-widest text-onyx">Live</span>
                        </div>
                      </div>
                      <h3 className="text-2xl font-black leading-[1.1] mb-2 line-clamp-2 tracking-tight">{t.title}</h3>
                    </div>
  
                    <div className="relative z-10 space-y-6 pt-4 border-t border-white/5">
                      <div className="flex gap-10">
                        <div>
                          <p className={cn("text-[9px] font-black uppercase tracking-[0.2em] mb-1.5", selectedTournament === t.id ? "text-white/40" : "text-onyx/30")}>Matches</p>
                          <p className="text-[20px] font-black leading-none">{t.matches_count}</p>
                        </div>
                        <div>
                          <p className={cn("text-[9px] font-black uppercase tracking-[0.2em] mb-1.5", selectedTournament === t.id ? "text-white/40" : "text-onyx/30")}>Players</p>
                          <p className="text-[20px] font-black leading-none">{t.players_count}</p>
                        </div>
                      </div>
  
                      <div className="flex gap-3">
                        <button 
                          onClick={(e) => { e.stopPropagation(); updateTournamentStatus(t.id, 'paused'); }}
                          className={cn(
                            "flex-1 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all shadow-sm",
                            selectedTournament === t.id ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-off-white text-charcoal hover:bg-black/5'
                          )}
                        >
                          Pause Signal
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); updateTournamentStatus(t.id, 'completed'); }}
                          className={cn(
                            "flex-1 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all shadow-lg",
                            selectedTournament === t.id ? 'bg-pastel-mint text-onyx hover:scale-[1.02]' : 'bg-onyx text-white hover:scale-[1.02]'
                          )}
                        >
                          End Mission
                        </button>
                      </div>
                    </div>
                    {selectedTournament === t.id && (
                      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                    )}
                  </BentoCard>
                </motion.div>
              ))}
              
              {tournaments.length === 0 && (
                <div className="w-full h-[280px] bg-white rounded-[40px] border-2 border-dashed border-black/[0.03] flex flex-col items-center justify-center gap-6 shadow-soft">
                  <div className="w-20 h-20 rounded-[30px] bg-off-white flex items-center justify-center">
                    <Monitor size={40} className="text-onyx/10" />
                  </div>
                  <p className="text-[12px] font-black uppercase tracking-[0.3em] text-charcoal/20">No active deployments found</p>
                </div>
              )}
            </div>
          </section>
  
          {/* Detailed Monitoring Panel */}
          <AnimatePresence mode="wait">
            {currentTournament && (
              <motion.section
                key={currentTournament.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-10"
              >
                <BentoCard className="p-12 space-y-16 relative overflow-hidden bg-white shadow-soft-lg border-none">
                  <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-[2px] bg-onyx/10" />
                        <p className="text-[10px] font-black text-charcoal/40 uppercase tracking-[0.4em]">Operational Intelligence</p>
                      </div>
                      <h2 className="text-[42px] font-black tracking-tight leading-[1]">{currentTournament.title}</h2>
                    </div>
                    <div className="flex items-center gap-4 bg-off-white p-2 rounded-full shadow-sm border border-black/[0.02]">
                      <div className="flex -space-x-3 px-2">
                        {[1,2,3,4].map((i) => (
                          <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-white shadow-sm overflow-hidden ring-1 ring-black/[0.03]">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+10}`} alt="warrior" />
                          </div>
                        ))}
                      </div>
                      <div className="pr-6 pl-2">
                        <p className="text-[18px] font-black leading-none">+{currentTournament.players_count! > 4 ? currentTournament.players_count! - 4 : 0}</p>
                        <p className="text-[8px] font-black text-charcoal/30 uppercase tracking-widest mt-1">Personnel</p>
                      </div>
                    </div>
                  </div>
  
                  {/* Tournament Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                      { label: "Kill Confirmation", value: statsSummary?.totalKills || 0, icon: Target, color: "coral" },
                      { label: "Combat Vitality", value: statsSummary?.playersAlive || 0, icon: Activity, color: "mint" },
                      { label: "Signal Reach", value: statsSummary?.totalViewers.toLocaleString() || 0, icon: Eye, color: "sky" },
                    ].map((stat, i) => (
                      <div key={i} className="group flex items-center gap-6 p-7 bg-off-white rounded-[32px] border border-black/[0.01] hover:bg-white transition-all duration-300 hover:shadow-soft">
                        <div className={cn(
                          "w-16 h-16 rounded-[24px] flex items-center justify-center transition-transform duration-500 group-hover:rotate-12 shadow-sm",
                          `bg-pastel-${stat.color}`
                        )}>
                          <stat.icon size={28} className="text-onyx" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-onyx/30 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                          <p className="text-3xl font-black tracking-tight">{stat.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
  
                  {/* Live Matches List */}
                  <div className="space-y-8">
                    <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-4">
                        <div className="w-3 h-3 rounded-full bg-onyx animate-pulse" />
                        <h3 className="text-[12px] font-black uppercase tracking-[0.4em]">Ongoing Combat Feeds</h3>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-off-white flex items-center justify-center shadow-sm">
                        <Signal size={16} className="text-onyx/20" />
                      </div>
                    </div>
  
                    <div className="space-y-5">
                      {tournamentMatches.map((m) => (
                        <motion.div 
                          key={m.id}
                          whileHover={{ x: 6 }}
                          className="p-8 bg-off-white rounded-[32px] border border-black/[0.01] flex flex-col lg:flex-row lg:items-center justify-between gap-8 group cursor-pointer hover:bg-white hover:shadow-soft-lg transition-all duration-500"
                        >
                          <div className="flex items-center gap-8">
                            <div className="w-20 h-20 bg-white rounded-[24px] flex items-center justify-center text-onyx/10 group-hover:text-onyx transition-all duration-500 shadow-sm group-hover:scale-110">
                              <Gamepad2 size={36} strokeWidth={1.5} />
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-4 flex-wrap">
                                <h4 className="text-2xl font-black tracking-tight">{m.title}</h4>
                                <div className="px-4 py-1.5 bg-onyx text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg">
                                  Phase {m.current_round}
                                </div>
                              </div>
                              <p className="text-[11px] text-charcoal/40 font-black uppercase tracking-[0.15em] flex items-center gap-3">
                                {m.mode} <span className="w-1.5 h-1.5 bg-onyx/10 rounded-full" /> {m.map}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between lg:justify-end gap-12 pt-6 lg:pt-0 border-t lg:border-t-0 border-black/5">
                            <div className="flex gap-12">
                              <div className="text-center">
                                <p className="text-[9px] font-black text-charcoal/20 uppercase tracking-[0.2em] mb-2">Sectors Active</p>
                                <p className="text-xl font-black">{m.live_stats?.teams_alive || 0}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-[9px] font-black text-charcoal/20 uppercase tracking-[0.2em] mb-2">Intercepts</p>
                                <p className="text-xl font-black">{m.viewers_count.toLocaleString()}</p>
                              </div>
                            </div>
                            <Link href={`/live?match=${m.id}`}>
                              <motion.button 
                                whileTap={{ scale: 0.94 }}
                                className="px-10 py-5 bg-onyx text-white rounded-[24px] text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl flex items-center gap-3 hover:bg-carbon-black transition-colors"
                              >
                                Access Feed <ChevronRight size={18} strokeWidth={3} />
                              </motion.button>
                            </Link>
                          </div>
                        </motion.div>
                      ))}
                      {tournamentMatches.length === 0 && (
                        <div className="py-24 text-center flex flex-col items-center gap-4 bg-off-white rounded-[40px] border-2 border-dashed border-black/[0.03]">
                          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm">
                            <Zap size={32} className="text-onyx/10" />
                          </div>
                          <p className="text-[12px] font-black uppercase tracking-[0.3em] text-charcoal/20 italic">No combat signals detected</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="absolute -top-40 -right-40 w-96 h-96 bg-pastel-mint/10 rounded-full blur-[120px] pointer-events-none" />
                </BentoCard>
              </motion.section>
            )}
          </AnimatePresence>
        </div>
  
        <AdminNav />
      </main>
    );
}
