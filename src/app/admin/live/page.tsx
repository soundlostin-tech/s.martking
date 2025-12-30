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
  Settings,
  Swords
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BentoCard } from "@/components/ui/BentoCard";

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
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
        <div className="space-y-4 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#1A1A1A]/20 mx-auto" />
          <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-[0.3em]">Acquiring Live Signal...</p>
        </div>
      </div>
    );
  }

  return (
      <main className="min-h-screen pb-32 bg-[#F8F6F0] text-[#1A1A1A]">
      <div className="px-8 pt-24 space-y-12 max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <p className="text-[10px] font-black text-[#1A1A1A]/40 uppercase tracking-[0.3em] mb-2">LIVE CONTROL</p>
            <h1 className="text-[44px] font-heading font-black leading-none tracking-tight text-[#1A1A1A]">
              OPERATIONS <br />
              <span className="text-[#6B7280]/40">MONITORING</span>
            </h1>
          </div>
          <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-md border-2 border-[#E5E7EB]">
            <div className="w-2 h-2 rounded-full bg-[#5FD3BC] animate-pulse" />
            <p className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-widest">FEED OPERATIONAL</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <BentoCard variant="mint" className="p-10 relative overflow-hidden shadow-xl border-none h-48 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-[#1A1A1A]/40 uppercase tracking-[0.2em]">ACTIVE DEPLOYMENTS</p>
                <h3 className="text-5xl font-heading font-black">{summary.liveTournaments}</h3>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#1A1A1A] flex items-center justify-center shadow-lg">
                <Radio size={28} className="text-[#6EBF8B]" />
              </div>
            </div>
            <div className="absolute right-[-20px] bottom-[-20px] opacity-[0.05] rotate-12">
              <Activity size={140} />
            </div>
          </BentoCard>

          <BentoCard variant="blue" className="p-10 relative overflow-hidden shadow-xl border-none h-48 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-[#1A1A1A]/40 uppercase tracking-[0.2em]">WARRIORS ENGAGED</p>
                <h3 className="text-5xl font-heading font-black">{summary.totalPlayers}</h3>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#1A1A1A] flex items-center justify-center shadow-lg">
                <Users size={28} className="text-[#A8D8EA]" />
              </div>
            </div>
            <div className="absolute right-[-20px] bottom-[-20px] opacity-[0.05] -rotate-12">
              <Swords size={140} />
            </div>
          </BentoCard>
        </div>

        <section className="space-y-8">
          <div className="flex items-center gap-4 px-2">
            <h3 className="text-2xl font-heading font-black text-[#1A1A1A] tracking-tight uppercase">MISSION SQUADRON</h3>
            <div className="h-0.5 flex-1 bg-[#1A1A1A]/5" />
          </div>
          
          <div className="flex gap-6 overflow-x-auto pb-8 no-scrollbar -mx-2 px-2">
            {tournaments.map((t, idx) => {
                  const colors = ["peach", "purple", "pink", "yellow", "coral", "teal"];
              const color = colors[idx % colors.length] as any;
              return (
                <motion.div
                  key={t.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedTournament(t.id)}
                  className="flex-shrink-0"
                >
                  <BentoCard
                    variant={selectedTournament === t.id ? color : 'default'}
                    className={`w-80 p-8 shadow-xl transition-all duration-300 cursor-pointer relative overflow-hidden group ${
                      selectedTournament === t.id ? 'ring-4 ring-[#1A1A1A] scale-105' : 'opacity-60 border-2 border-[#E5E7EB]'
                    }`}
                  >
                    <div className="relative z-10 space-y-6">
                      <div className="flex justify-between items-start">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${selectedTournament === t.id ? 'bg-[#1A1A1A] text-white' : 'bg-[#F5F5F5] text-[#1A1A1A]/20'}`}>
                          <Trophy size={22} />
                        </div>
                        <div className={`px-3 py-1 rounded-lg text-[9px] font-black tracking-[0.2em] ${selectedTournament === t.id ? 'bg-[#1A1A1A] text-white' : 'bg-[#F5F5F5] text-[#1A1A1A]/20'}`}>
                          ACTIVE
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-heading font-black leading-tight tracking-tight h-14 overflow-hidden">{t.title}</h3>
                      
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#1A1A1A]/5">
                        <div>
                          <p className="text-[9px] font-black text-[#1A1A1A]/40 uppercase tracking-widest mb-1">Matches</p>
                          <p className="text-xl font-heading font-black">{t.matches_count}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-[#1A1A1A]/40 uppercase tracking-widest mb-1">Players</p>
                          <p className="text-xl font-heading font-black">{t.players_count}</p>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); updateTournamentStatus(t.id, 'paused'); }}
                          className="flex-1 py-3 bg-white/40 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/20 hover:bg-white/60 transition-all"
                        >
                          PAUSE
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); updateTournamentStatus(t.id, 'completed'); }}
                          className="flex-1 py-3 bg-[#1A1A1A] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all"
                        >
                          TERMINATE
                        </button>
                      </div>
                    </div>
                  </BentoCard>
                </motion.div>
              );
            })}
            
            {tournaments.length === 0 && (
              <div className="w-full bg-white p-20 rounded-[40px] shadow-inner border-4 border-dashed border-[#E5E7EB] text-center flex flex-col items-center gap-6">
                <Monitor size={64} strokeWidth={1} className="text-[#D1D5DB]" />
                <p className="text-[12px] font-black uppercase tracking-[0.4em] text-[#9CA3AF]">NO ACTIVE DEPLOYMENTS DETECTED</p>
              </div>
            )}
          </div>
        </section>

        <AnimatePresence mode="wait">
          {currentTournament && (
            <motion.section
              key={currentTournament.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-10"
            >
              <BentoCard className="p-12 shadow-2xl rounded-[48px] border-none bg-white relative overflow-hidden">
                <div className="relative z-10 space-y-12">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-2">
                      <span className="text-[10px] font-black text-[#6B7280] uppercase tracking-[0.4em]">MISSION INTELLIGENCE</span>
                      <h2 className="text-4xl font-heading font-black text-[#1A1A1A] leading-tight tracking-tighter">{currentTournament.title}</h2>
                    </div>
                    <div className="flex -space-x-4">
                      {[1,2,3,4,5].map((i) => (
                        <div key={i} className="w-14 h-14 rounded-2xl border-4 border-white bg-[#F5F5F5] shadow-xl overflow-hidden relative">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+idx}`} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                      <div className="w-14 h-14 rounded-2xl border-4 border-white bg-[#1A1A1A] flex items-center justify-center text-[11px] font-black text-white shadow-xl">
                        +{Math.max(0, (currentTournament.players_count || 0) - 5)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { label: "CONFIRMED KILLS", value: statsSummary?.totalKills || 0, icon: Target, color: "peach" },
                        { label: "WARRIORS ALIVE", value: statsSummary?.playersAlive || 0, icon: Activity, color: "mint" },
                        { label: "INTEL VIEWERS", value: statsSummary?.totalViewers.toLocaleString() || 0, icon: Eye, color: "blue" },
                      ].map((stat, i) => (
                        <div key={i} className="p-8 bg-[#F9FAFB] rounded-[32px] border-2 border-[#E5E7EB] flex items-center gap-8 shadow-sm">
                          <div className={`w-16 h-16 rounded-[20px] flex items-center justify-center shadow-md ${
                            stat.color === 'peach' ? 'bg-[#FFCDB2]' : 
                            stat.color === 'mint' ? 'bg-[#A8E6CF]' : 'bg-[#A8D8EA]'
                          }`}>
                          <stat.icon size={28} className="text-[#1A1A1A]" />
                        </div>
                        <div>
                          <p className="text-[10px] text-[#6B7280] uppercase font-black tracking-widest mb-1">{stat.label}</p>
                          <p className="text-3xl font-heading font-black text-[#1A1A1A] tracking-tighter">{stat.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-8 pt-8 border-t border-[#1A1A1A]/5">
                    <div className="flex items-center gap-4 px-2">
                      <div className="w-3 h-3 rounded-full bg-[#5FD3BC] animate-pulse shadow-[0_0_10px_rgba(95,211,188,0.5)]" />
                      <h3 className="text-sm font-black text-[#1A1A1A] uppercase tracking-[0.3em]">LIVE BATTLE SECTORS</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6">
                      {tournamentMatches.map((m, mIdx) => {
                        const colors = ["mint", "blue", "pink", "yellow"];
                        const mColor = colors[mIdx % colors.length] as any;
                        return (
                          <div 
                            key={m.id}
                            className="group relative"
                          >
                            <BentoCard 
                              variant={mColor}
                              className="p-8 shadow-lg border-none hover:shadow-2xl hover:translate-y-[-4px] transition-all duration-500 flex flex-col md:flex-row md:items-center justify-between gap-8"
                            >
                              <div className="flex items-center gap-8">
                                <div className="w-20 h-20 bg-white/40 rounded-[24px] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500">
                                  <Gamepad2 size={36} className="text-[#1A1A1A]" />
                                </div>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-4">
                                    <h4 className="text-2xl font-heading font-black text-[#1A1A1A] tracking-tight">{m.title}</h4>
                                    <Badge className="bg-[#1A1A1A] text-white border-none px-4 py-1 text-[9px] font-black tracking-widest rounded-full shadow-lg">
                                      ROUND {m.current_round}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <span className="text-[10px] font-black text-[#1A1A1A]/60 uppercase tracking-widest">{m.mode}</span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#1A1A1A]/10" />
                                    <span className="text-[10px] font-black text-[#1A1A1A]/60 uppercase tracking-widest">{m.map}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-12 pt-6 md:pt-0 border-t md:border-t-0 border-black/5">
                                <div className="flex gap-10">
                                  <div className="text-center">
                                    <p className="text-[9px] font-black text-[#1A1A1A]/40 uppercase tracking-widest mb-1">TEAMS</p>
                                    <p className="text-2xl font-heading font-black text-[#1A1A1A]">{m.live_stats?.teams_alive || 0}</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-[9px] font-black text-[#1A1A1A]/40 uppercase tracking-widest mb-1">VIEWERS</p>
                                    <p className="text-2xl font-heading font-black text-[#1A1A1A]">{m.viewers_count.toLocaleString()}</p>
                                  </div>
                                </div>
                                <Link href={`/live?match=${m.id}`}>
                                  <motion.button 
                                    whileTap={{ scale: 0.95 }}
                                    className="px-8 py-4 bg-[#1A1A1A] text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl flex items-center gap-3"
                                  >
                                    CONNECT <ChevronRight size={16} strokeWidth={4} />
                                  </motion.button>
                                </Link>
                              </div>
                            </BentoCard>
                          </div>
                        )
                      })}
                      {tournamentMatches.length === 0 && (
                        <div className="py-24 text-center flex flex-col items-center gap-6 bg-[#F9FAFB] rounded-[40px] border-4 border-dashed border-[#E5E7EB]">
                          <Zap size={48} strokeWidth={1} className="text-[#D1D5DB]" />
                          <p className="text-[11px] font-black uppercase tracking-[0.4em] text-[#9CA3AF]">NO ACTIVE MATCH SIGNALS DETECTED</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="absolute top-[-30%] right-[-10%] w-1/2 h-full bg-[#5FD3BC]/5 blur-[120px] rounded-full pointer-events-none" />
              </BentoCard>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      <AdminNav />
    </main>
  );
}
