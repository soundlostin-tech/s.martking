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
  Download
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { AdminNav } from "@/components/layout/AdminNav";
import { HeroSection } from "@/components/layout/HeroSection";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

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
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          avatar_url,
          win_rate,
          matches_played,
          role,
          wallets (
            lifetime_earnings
          )
        `);

      if (error) throw error;

      const transformedData = data.map((profile: any, index: number) => {
        const earnings = profile.wallets?.lifetime_earnings || 0;
        const matches = profile.matches_played || 0;
        const avgKillsPerMatch = 4.5 + (parseFloat(profile.win_rate) / 10);
        const totalKills = Math.floor(matches * avgKillsPerMatch);
        const wins = Math.floor(matches * (parseFloat(profile.win_rate) / 100));
        const points = (wins * 100) + (totalKills * 10);

        return {
          id: profile.id,
          name: profile.full_name,
          avatar_url: profile.avatar_url,
          matches,
          wins,
          kills: totalKills,
          points,
          earnings,
          win_rate: profile.win_rate,
          role: profile.role,
          team: index % 3 === 0 ? "TEAM SK" : index % 3 === 1 ? "SOUL" : "GODLIKE"
        };
      });

      const sortedData = [...transformedData].sort((a, b) => b.points - a.points);
      setLeaderboard(sortedData);
    } catch (error: any) {
      toast.error("Failed to load leaderboard");
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
      player.team.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [leaderboard, searchQuery]);

  const topPlayer = leaderboard[0];

  return (
    <main className="min-h-screen pb-32 bg-zinc-50">
      <HeroSection 
        title={<>Arena <span className="italic font-serif opacity-60">Ranks</span></>}
        subtitle="Live monitoring of elite performance."
        className="mx-0 rounded-none pb-32 bg-zinc-50 border-b border-black/5"
      >
        <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-zinc-200 rounded-full blur-[120px]" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-zinc-300 rounded-full blur-[120px]" />
        </div>
      </HeroSection>

      <div className="px-6 -mt-24 relative z-10 space-y-10 max-w-5xl mx-auto">
        {/* Top Player Card */}
        {topPlayer && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-primary text-black p-10 rounded-[3rem] shadow-2xl shadow-primary/10 border border-black/5 relative overflow-hidden group"
          >
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
              <div className="relative">
                <Avatar className="w-40 h-40 border-8 border-white shadow-2xl">
                  <AvatarImage src={topPlayer.avatar_url} />
                  <AvatarFallback className="bg-black text-white text-4xl font-heading">
                    {topPlayer.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 bg-black text-white p-3 rounded-2xl shadow-xl">
                  <Medal size={24} />
                </div>
              </div>

              <div className="flex-1 text-center md:text-left space-y-3">
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <Badge className="bg-black text-white border-none rounded-full px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest">
                    MVP PLAYER
                  </Badge>
                  <span className="text-black/40 text-[10px] font-bold uppercase tracking-widest">RANK #1</span>
                </div>
                <h2 className="text-5xl font-heading tracking-tight leading-none">{topPlayer.name}</h2>
                <p className="text-black/40 font-bold text-xs uppercase tracking-[0.2em]">Affiliation: <span className="text-black">{topPlayer.team}</span></p>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                {[
                  { label: "Points", value: topPlayer.points, icon: Trophy },
                  { label: "Kills", value: topPlayer.kills, icon: Target },
                ].map((stat, i) => (
                  <div key={i} className="bg-white/40 backdrop-blur-md p-6 rounded-[2rem] border border-white/20 text-center min-w-[120px]">
                    <stat.icon size={20} className="mx-auto mb-2 opacity-40" />
                    <p className="text-[9px] text-black/40 uppercase font-bold tracking-widest">{stat.label}</p>
                    <p className="text-2xl font-heading text-black">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/20 rounded-full blur-[100px]" />
          </motion.div>
        )}

        {/* Action & Filter Bar */}
        <div className="bg-zinc-50 rounded-[2.5rem] border border-black/5 p-6 shadow-2xl shadow-black/5 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-black/20" size={18} />
            <Input 
              className="bg-black/[0.03] border-none pl-14 rounded-2xl h-14 text-xs font-bold tracking-wide focus-visible:ring-black placeholder:text-black/20" 
              placeholder="SEARCH PLAYERS OR TEAMS..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={selectedTournament} onValueChange={setSelectedTournament}>
              <SelectTrigger className="w-[180px] h-14 rounded-2xl bg-black/[0.03] border-none font-bold text-[10px] tracking-widest">
                <SelectValue placeholder="TOURNAMENT" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-black/5 bg-zinc-50">
                <SelectItem value="global" className="text-[10px] uppercase font-bold">GLOBAL ARENA</SelectItem>
                {tournaments.map((t) => (
                  <SelectItem key={t.id} value={t.id} className="text-[10px] uppercase font-bold">{t.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button className="h-14 w-14 rounded-2xl bg-black text-white hover:bg-zinc-800 transition-all p-0 shadow-xl shadow-black/10">
              <Download size={20} />
            </Button>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="space-y-6">
          <div className="flex items-end justify-between px-2">
            <div className="space-y-1">
              <h3 className="text-2xl font-heading text-black">Arena <span className="italic font-serif opacity-60">Directory</span></h3>
              <p className="text-[10px] font-bold text-black/30 uppercase tracking-[0.2em]">{filteredLeaderboard.length} WARRIORS RANKED</p>
            </div>
            <Badge className="bg-black/5 text-black/40 border-none font-bold text-[8px] tracking-widest px-3 py-1">LAST UPDATED: JUST NOW</Badge>
          </div>

          <div className="bg-zinc-50 rounded-[3rem] border border-black/5 shadow-2xl shadow-black/[0.02] overflow-hidden">
            <Table>
              <TableHeader className="bg-black/[0.02]">
                <TableRow className="border-black/5 hover:bg-transparent h-16">
                  <TableHead className="w-24 pl-8 font-bold text-black/20 uppercase text-[9px] tracking-widest">Rank</TableHead>
                  <TableHead className="font-bold text-black/20 uppercase text-[9px] tracking-widest">Warrior</TableHead>
                  <TableHead className="font-bold text-black/20 uppercase text-[9px] tracking-widest">Affiliation</TableHead>
                  <TableHead className="font-bold text-black/20 uppercase text-[9px] tracking-widest text-center">Wins</TableHead>
                  <TableHead className="font-bold text-black/20 uppercase text-[9px] tracking-widest text-center cursor-pointer hover:text-black transition-colors" onClick={() => handleSort("points")}>
                    <div className="flex items-center justify-center gap-2">Points <ArrowUpDown size={12} /></div>
                  </TableHead>
                  <TableHead className="font-bold text-black/20 uppercase text-[9px] tracking-widest text-right pr-8">Earnings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-64 text-center">
                      <Loader2 className="w-10 h-10 animate-spin text-black/10 mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : filteredLeaderboard.map((player, index) => (
                  <TableRow key={player.id} className="border-black/5 hover:bg-black/[0.01] transition-colors h-24">
                    <TableCell className="pl-8">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-heading text-lg ${
                        index === 0 ? "bg-primary text-black" :
                        index === 1 ? "bg-zinc-200 text-black/60" :
                        index === 2 ? "bg-zinc-100 text-black/40" : "text-black/20"
                      }`}>
                        {index + 1}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12 border border-black/5 shadow-sm">
                          <AvatarImage src={player.avatar_url} />
                          <AvatarFallback className="bg-black/5 text-black/20 text-sm font-heading">
                            {player.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-0.5">
                          <p className="font-heading text-black">{player.name}</p>
                          <p className="text-[9px] text-black/30 font-bold uppercase tracking-widest">{player.role}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-full border-black/5 text-black/40 font-bold text-[9px] tracking-widest px-3 py-0.5">
                        {player.team}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-heading text-black/40">{player.wins}</TableCell>
                    <TableCell className="text-center font-heading text-xl text-black">{player.points}</TableCell>
                    <TableCell className="text-right pr-8 font-heading text-black">₹{player.earnings.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <AdminNav />
    </main>
  );
}
