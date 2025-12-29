"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Trophy, 
  Search, 
  ArrowUpDown, 
  ChevronRight,
  Target,
  Swords,
  TrendingUp,
  Loader2,
  Medal,
  ExternalLink,
  Users,
  Clock,
  Zap,
  IndianRupee,
  MoreVertical,
  Download,
  ShieldCheck,
  Star
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { AdminNav } from "@/components/layout/AdminNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AdminLeaderboard() {
  const [loading, setLoading] = useState(true);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [selectedTournament, setSelectedTournament] = useState("global");
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "points", direction: "desc" });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchLeaderboardData();
  }, [selectedTournament]);

  const fetchInitialData = async () => {
    try {
      const { data: tournamentData } = await supabase
        .from("tournaments")
        .select("id, title")
        .order("created_at", { ascending: false });
      
      if (tournamentData) setTournaments(tournamentData);
    } catch (error) {
      console.error("Error fetching tournaments:", error);
    }
  };

  const fetchLeaderboardData = async () => {
    setLoading(true);
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          username,
          avatar_url,
          win_rate,
          matches_played,
          role
        `);

      if (profilesError) throw profilesError;

      const { data: wallets, error: walletsError } = await supabase
        .from("wallets")
        .select("user_id, lifetime_earnings");

      if (walletsError) throw walletsError;

      const walletMap = new Map(wallets?.map(w => [w.user_id, w.lifetime_earnings]) || []);

      const transformedData = (profiles || []).map((profile: any, index: number) => {
        const earnings = walletMap.get(profile.id) || 0;
        const matches = profile.matches_played || 0;
        const avgKillsPerMatch = 4.5 + (parseFloat(profile.win_rate || "0") / 10);
        const totalKills = Math.floor(matches * avgKillsPerMatch);
        const wins = Math.floor(matches * (parseFloat(profile.win_rate || "0") / 100));
        const points = (wins * 100) + (totalKills * 10);

        return {
          id: profile.id,
          name: profile.full_name || profile.username || 'Warrior',
          username: profile.username || 'warrior',
          avatar_url: profile.avatar_url,
          matches,
          wins,
          kills: totalKills,
          points,
          earnings: Number(earnings),
          win_rate: profile.win_rate,
          role: profile.role,
          team: index % 3 === 0 ? "TEAM SK" : index % 3 === 1 ? "SOUL" : "GODLIKE"
        };
      });

      const sortedData = [...transformedData].sort((a, b) => b.points - a.points);
      setLeaderboard(sortedData);
    } catch (error: any) {
      toast.error("Failed to load leaderboard signals");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "desc";
    if (sortConfig.key === key && sortConfig.direction === "desc") {
      direction = "asc";
    }
    setSortConfig({ key, direction });

    const sorted = [...leaderboard].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });
    setLeaderboard(sorted);
  };

  const filteredLeaderboard = useMemo(() => {
    return leaderboard.filter(player => 
      player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.team.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [leaderboard, searchQuery]);

  const topPlayer = leaderboard[0];

    return (
      <main className="min-h-screen pb-32 bg-off-white text-onyx font-sans">
        <div className="px-8 pt-24 relative z-10 max-w-6xl mx-auto space-y-16">
          {/* Hero Header */}
          <header className="relative">
            <div className="absolute -top-20 -left-10 w-64 h-64 bg-pastel-yellow/30 rounded-full blur-[100px] pointer-events-none" />
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-[2px] bg-onyx/10" />
                <p className="text-[10px] font-black text-charcoal/40 uppercase tracking-[0.4em]">Ranking Protocols</p>
              </div>
              <h1 className="text-[64px] font-black leading-[0.85] tracking-[-0.04em]">
                Elite<br />
                <span className="text-onyx/20">Registry</span>
              </h1>
            </div>
          </header>
  
          {/* Top Player Highlight */}
          {topPlayer && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <BentoCard variant="pastel" pastelColor="yellow" className="p-10 border-none shadow-soft-lg relative overflow-hidden group">
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                  <div className="relative">
                    <div className="absolute -inset-6 bg-white/40 rounded-full blur-2xl animate-pulse" />
                    <div className="w-44 h-44 rounded-full border-8 border-white bg-white shadow-2xl relative z-10 overflow-hidden ring-1 ring-black/[0.03]">
                      <img src={topPlayer.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${topPlayer.name}`} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-onyx text-white p-3 rounded-[20px] shadow-2xl z-20 border-4 border-white rotate-[12deg]">
                      <Medal size={24} strokeWidth={3} />
                    </div>
                  </div>
  
                  <div className="flex-1 text-center md:text-left space-y-5">
                    <div className="flex items-center justify-center md:justify-start gap-4">
                      <div className="px-5 py-2 bg-onyx text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl">
                        ARENA CHAMPION
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-white/60 rounded-full shadow-sm">
                        <Star size={14} className="text-onyx" />
                        <span className="text-onyx text-[10px] font-black uppercase tracking-widest">RANK #1</span>
                      </div>
                    </div>
                    <h2 className="text-[56px] font-black tracking-tighter leading-none text-onyx">{topPlayer.name}</h2>
                    <p className="text-onyx/30 font-black text-[11px] uppercase tracking-[0.3em]">Affiliation: <span className="text-onyx">{topPlayer.team}</span></p>
                  </div>
  
                  <div className="grid grid-cols-2 gap-6 w-full md:w-auto">
                    {[
                      { label: "Arena Points", value: topPlayer.points, icon: Trophy },
                      { label: "Eliminations", value: topPlayer.kills, icon: Target },
                    ].map((stat, i) => (
                      <div key={i} className="bg-white/80 backdrop-blur-md p-8 rounded-[32px] border border-white/40 text-center min-w-[160px] group-hover:translate-y-[-4px] transition-all shadow-soft group-hover:shadow-soft-lg">
                        <stat.icon size={24} className="mx-auto mb-3 text-onyx/20 group-hover:text-onyx transition-colors" />
                        <p className="text-[9px] text-onyx/30 uppercase font-black tracking-widest mb-1">{stat.label}</p>
                        <p className="text-3xl font-black text-onyx">{stat.value.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute top-[-30%] right-[-10%] w-96 h-96 bg-white/20 rounded-full blur-[120px] pointer-events-none" />
              </BentoCard>
            </motion.div>
          )}
  
          {/* Filter Bar */}
          <section className="bg-white rounded-[40px] shadow-soft border border-black/[0.02] p-8 flex flex-col lg:flex-row gap-6 relative z-20">
            <div className="relative flex-1 group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-charcoal/20 group-focus-within:text-onyx transition-colors" size={20} />
              <Input 
                className="bg-off-white border-none pl-16 rounded-[24px] h-16 text-[12px] font-black tracking-widest focus-visible:ring-onyx/5 placeholder:text-charcoal/10 uppercase" 
                placeholder="SEARCH WARRIORS OR AFFILIATIONS..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <Select value={selectedTournament} onValueChange={setSelectedTournament}>
                <SelectTrigger className="w-[240px] h-16 rounded-[24px] bg-off-white border-none font-black text-[10px] tracking-[0.2em] text-charcoal/40 uppercase shadow-inner">
                  <SelectValue placeholder="ARENA SCALE" />
                </SelectTrigger>
                <SelectContent className="rounded-[32px] border-none bg-white shadow-2xl p-2">
                  <SelectItem value="global" className="rounded-2xl font-black text-[10px] uppercase tracking-widest py-4">GLOBAL ARENA</SelectItem>
                  {tournaments.map((t) => (
                    <SelectItem key={t.id} value={t.id} className="rounded-2xl font-black text-[10px] uppercase tracking-widest py-4">{t.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button className="h-16 w-16 rounded-[24px] bg-onyx text-white hover:bg-carbon-black transition-all p-0 shadow-2xl">
                <Download size={24} strokeWidth={2.5} />
              </Button>
            </div>
          </section>
  
          {/* Leaderboard Table */}
          <section className="space-y-8">
            <div className="flex items-end justify-between px-2">
              <div className="space-y-2">
                <h3 className="text-3xl font-black tracking-tight text-onyx">Ranking Hub</h3>
                <p className="text-[10px] font-black text-charcoal/30 uppercase tracking-[0.4em]">{filteredLeaderboard.length} WARRIORS CLASSIFIED</p>
              </div>
              <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-full border border-black/[0.03] shadow-soft">
                <div className="w-2 h-2 rounded-full bg-pastel-mint shadow-[0_0_10px_#C1E6C0] animate-pulse" />
                <p className="text-[9px] font-black text-onyx uppercase tracking-[0.2em]">Signal: Active</p>
              </div>
            </div>
  
            <BentoCard className="p-0 border-none shadow-soft-lg overflow-hidden bg-white rounded-[48px]">
              <Table>
                <TableHeader className="bg-off-white/50 border-b border-black/[0.02]">
                  <TableRow className="hover:bg-transparent h-24 border-none">
                    <TableHead className="w-32 pl-12 font-black text-charcoal/20 uppercase text-[10px] tracking-[0.4em]">Rank</TableHead>
                    <TableHead className="font-black text-charcoal/20 uppercase text-[10px] tracking-[0.4em]">Warrior</TableHead>
                    <TableHead className="font-black text-charcoal/20 uppercase text-[10px] tracking-[0.4em]">Affiliation</TableHead>
                    <TableHead className="font-black text-charcoal/20 uppercase text-[10px] tracking-[0.4em] text-center">Wins</TableHead>
                    <TableHead className="font-black text-charcoal/20 uppercase text-[10px] tracking-[0.4em] text-center cursor-pointer hover:text-onyx transition-colors" onClick={() => handleSort("points")}>
                      <div className="flex items-center justify-center gap-2">Points <ArrowUpDown size={14} /></div>
                    </TableHead>
                    <TableHead className="font-black text-charcoal/20 uppercase text-[10px] tracking-[0.4em] text-right pr-12">Earnings</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-96 text-center border-none">
                        <div className="flex flex-col items-center gap-6">
                          <Loader2 className="w-16 h-16 animate-spin text-onyx/10 mx-auto" />
                          <p className="text-[12px] font-black uppercase tracking-[0.4em] text-charcoal/20">Syncing Registry...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredLeaderboard.map((player, index) => (
                    <TableRow key={player.id} className="border-b border-black/[0.01] hover:bg-off-white transition-all duration-300 h-28 group">
                      <TableCell className="pl-12">
                        <div className={cn(
                          "w-12 h-12 rounded-[20px] flex items-center justify-center font-black text-[20px] transition-all duration-500",
                          index === 0 ? "bg-onyx text-white shadow-2xl rotate-[-4deg] scale-110" :
                          index === 1 ? "bg-pastel-silver/20 text-onyx/60" :
                          index === 2 ? "bg-pastel-peach/10 text-onyx/40" :
                          "text-onyx/10"
                        )}>
                          {index + 1}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-6">
                          <div className="w-14 h-14 rounded-full border-4 border-white bg-white shadow-soft overflow-hidden group-hover:scale-110 transition-transform duration-500 ring-1 ring-black/[0.03]">
                            <img src={player.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.name}`} alt="" />
                          </div>
                          <div className="space-y-1">
                            <p className="font-black text-[17px] tracking-tight group-hover:text-onyx transition-colors">{player.name}</p>
                            <p className="text-[10px] font-bold text-charcoal/20 uppercase tracking-[0.15em]">@{player.username}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="px-5 py-2 bg-off-white text-charcoal/40 font-black text-[10px] uppercase tracking-[0.2em] rounded-full inline-block group-hover:bg-white group-hover:text-onyx transition-all shadow-sm border border-black/[0.01]">
                          {player.team}
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-black text-onyx/20 text-lg group-hover:text-onyx transition-colors">{player.wins}</TableCell>
                      <TableCell className="text-center font-black text-[28px] tracking-tighter text-onyx">{player.points}</TableCell>
                      <TableCell className="text-right pr-12 font-black text-2xl tracking-tight">₹{player.earnings.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {!loading && filteredLeaderboard.length === 0 && (
                <div className="py-40 text-center flex flex-col items-center gap-8 bg-off-white/30">
                  <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center shadow-soft opacity-20 rotate-[-12deg]">
                    <Users size={40} />
                  </div>
                  <p className="text-[12px] font-black uppercase tracking-[0.4em] text-charcoal/20">Warrior registry empty in this sector</p>
                </div>
              )}
            </BentoCard>
          </section>
        </div>
  
        <AdminNav />
      </main>
    );
}
