"use client";

import { useState, useEffect } from "react";
import { 
  Trophy, 
  BarChart3, 
  Download, 
  Search, 
  Filter, 
  ArrowUpDown, 
  ChevronRight,
  User,
  Shield,
  Target,
  Swords,
  TrendingUp,
  DollarSign,
  Loader2,
  Medal,
  ExternalLink
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
  SheetDescription,
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
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);

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
      // Fetch profiles joined with wallets for earnings
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

      // Transform data and add simulated stats for kills/points
      const transformedData = data.map((profile: any, index: number) => {
        const earnings = profile.wallets?.lifetime_earnings || 0;
        const matches = profile.matches_played || 0;
        
        // Simulating kills and points based on matches and win rate
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
          team: index % 3 === 0 ? "Team SK" : index % 3 === 1 ? "Soul" : "GodLike" // Simulated team names
        };
      });

      // Sort by points initially
      const sortedData = [...transformedData].sort((a, b) => b.points - a.points);
      setLeaderboard(sortedData);
    } catch (error: any) {
      toast.error("Failed to load leaderboard");
      console.error(error);
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

  const handleExport = () => {
    const headers = ["Rank", "Player", "Team", "Matches", "Wins", "Kills", "Points", "Earnings"];
    const csvData = leaderboard.map((player, index) => [
      index + 1,
      player.name,
      player.team,
      player.matches,
      player.wins,
      player.kills,
      player.points,
      `₹${player.earnings}`
    ]);

    const csvContent = [headers, ...csvData].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `leaderboard_${selectedTournament}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Leaderboard exported successfully");
  };

  const filteredLeaderboard = leaderboard.filter(player => 
    player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    player.team.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const topPlayer = leaderboard[0];

  return (
    <main className="min-h-screen pb-24 bg-stone-50">
      <HeroSection 
        title="Arena Ranks" 
        subtitle="Live monitoring of elite performance"
        className="mx-0 rounded-none pb-12"
      >
        <div className="mt-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-1 rounded-2xl border border-white/20">
            <Select value={selectedTournament} onValueChange={setSelectedTournament}>
              <SelectTrigger className="w-[240px] h-12 bg-transparent border-none text-white font-bold focus:ring-0">
                <SelectValue placeholder="Select Tournament" />
              </SelectTrigger>
              <SelectContent className="bg-onyx border-white/10 text-white rounded-2xl">
                <SelectItem value="global" className="hover:bg-white/10 cursor-pointer">Global Leaderboard</SelectItem>
                {tournaments.map((t) => (
                  <SelectItem key={t.id} value={t.id} className="hover:bg-white/10 cursor-pointer">{t.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={handleExport}
            className="bg-lime-yellow hover:bg-white text-onyx font-bold rounded-2xl h-12 px-6 flex gap-2 transition-all shadow-lg"
          >
            <Download size={18} /> Export Data
          </Button>
        </div>
      </HeroSection>

      <div className="max-w-7xl mx-auto px-6 -mt-8 space-y-6">
        {/* Top Player Overview Card */}
        {topPlayer && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-onyx text-white p-8 rounded-[40px] border border-white/10 shadow-2xl relative overflow-hidden"
          >
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-lime-yellow ring-8 ring-white/5">
                  <AvatarImage src={topPlayer.avatar_url} />
                  <AvatarFallback className="bg-stone-800 text-white text-3xl font-heading">
                    {topPlayer.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 bg-lime-yellow text-onyx p-2 rounded-full border-4 border-onyx shadow-xl">
                  <Medal size={20} />
                </div>
              </div>

              <div className="flex-1 text-center md:text-left space-y-2">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <Badge className="bg-lime-yellow text-onyx border-none rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                    MVP Player
                  </Badge>
                  <span className="text-white/40 text-xs font-medium">RANK #1</span>
                </div>
                <h2 className="text-4xl font-heading tracking-tight">{topPlayer.name}</h2>
                <p className="text-white/60 font-medium">Member of <span className="text-lime-yellow">{topPlayer.team}</span></p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full md:w-auto">
                {[
                  { label: "Points", value: topPlayer.points, icon: Trophy, color: "text-lime-yellow" },
                  { label: "Kills", value: topPlayer.kills, icon: Target, color: "text-red-400" },
                  { label: "Wins", value: topPlayer.wins, icon: Swords, color: "text-blue-400" },
                  { label: "Earnings", value: `₹${topPlayer.earnings.toLocaleString()}`, icon: DollarSign, color: "text-green-400" },
                ].map((stat, i) => (
                  <div key={i} className="bg-white/5 backdrop-blur-md p-4 rounded-3xl border border-white/10 text-center">
                    <stat.icon size={16} className={`${stat.color} mx-auto mb-2`} />
                    <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">{stat.label}</p>
                    <p className="text-xl font-heading text-white">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-lime-yellow/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
          </motion.div>
        )}

        {/* Leaderboard Table Section */}
        <section className="bg-white rounded-[40px] border border-stone-200 overflow-hidden shadow-sm">
          <div className="p-8 border-b border-stone-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="font-heading text-2xl text-onyx">Rankings</h3>
              <p className="text-xs text-stone-400 font-medium">Sorted by highest points across the arena</p>
            </div>
            
            <div className="relative w-full md:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <Input 
                placeholder="Search players or teams..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-2xl bg-stone-50 border-stone-200 h-12 pl-12 focus-visible:ring-lime-yellow"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-stone-50/50">
                <TableRow className="border-stone-100 hover:bg-transparent">
                  <TableHead className="w-20 pl-8 font-bold text-stone-400 uppercase text-[10px] tracking-widest">Rank</TableHead>
                  <TableHead className="font-bold text-stone-400 uppercase text-[10px] tracking-widest">Player</TableHead>
                  <TableHead className="font-bold text-stone-400 uppercase text-[10px] tracking-widest">Team</TableHead>
                  <TableHead 
                    className="font-bold text-stone-400 uppercase text-[10px] tracking-widest cursor-pointer hover:text-onyx transition-colors"
                    onClick={() => handleSort("matches")}
                  >
                    <div className="flex items-center gap-2">Matches <ArrowUpDown size={12} /></div>
                  </TableHead>
                  <TableHead 
                    className="font-bold text-stone-400 uppercase text-[10px] tracking-widest cursor-pointer hover:text-onyx transition-colors"
                    onClick={() => handleSort("wins")}
                  >
                    <div className="flex items-center gap-2">Wins <ArrowUpDown size={12} /></div>
                  </TableHead>
                  <TableHead 
                    className="font-bold text-stone-400 uppercase text-[10px] tracking-widest cursor-pointer hover:text-onyx transition-colors"
                    onClick={() => handleSort("kills")}
                  >
                    <div className="flex items-center gap-2">Kills <ArrowUpDown size={12} /></div>
                  </TableHead>
                  <TableHead 
                    className="font-bold text-stone-400 uppercase text-[10px] tracking-widest cursor-pointer hover:text-onyx transition-colors"
                    onClick={() => handleSort("points")}
                  >
                    <div className="flex items-center gap-2 text-onyx font-black">Points <ArrowUpDown size={12} /></div>
                  </TableHead>
                  <TableHead 
                    className="font-bold text-stone-400 uppercase text-[10px] tracking-widest cursor-pointer hover:text-onyx transition-colors pr-8"
                    onClick={() => handleSort("earnings")}
                  >
                    <div className="flex items-center gap-2">Earnings <ArrowUpDown size={12} /></div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-64 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-lime-yellow mx-auto" />
                      <p className="text-stone-400 mt-4 font-medium">Calibrating ranks...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredLeaderboard.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-64 text-center">
                      <p className="text-stone-400 font-medium">No players found matching your search</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeaderboard.map((player, index) => (
                    <Sheet key={player.id}>
                      <SheetTrigger asChild>
                        <TableRow 
                          className="border-stone-100 hover:bg-stone-50 cursor-pointer group transition-colors"
                          onClick={() => setSelectedPlayer(player)}
                        >
                          <TableCell className="pl-8 py-6">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-heading text-sm ${
                              index === 0 ? "bg-amber-100 text-amber-600" :
                              index === 1 ? "bg-stone-200 text-stone-600" :
                              index === 2 ? "bg-orange-100 text-orange-600" :
                              "bg-stone-50 text-stone-400"
                            }`}>
                              {index + 1}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10 border-2 border-stone-100 group-hover:border-lime-yellow transition-colors">
                                <AvatarImage src={player.avatar_url} />
                                <AvatarFallback className="bg-stone-100 text-stone-600 text-xs">
                                  {player.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-bold text-onyx">{player.name}</p>
                                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">{player.role || "Elite Player"}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="rounded-full border-stone-200 text-stone-500 bg-stone-50 font-bold px-3 py-0.5">
                              {player.team}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium text-stone-600">{player.matches}</TableCell>
                          <TableCell className="font-medium text-blue-600">{player.wins}</TableCell>
                          <TableCell className="font-medium text-red-600">{player.kills}</TableCell>
                          <TableCell className="font-black text-onyx text-base">{player.points}</TableCell>
                          <TableCell className="font-bold text-green-600 pr-8">₹{player.earnings.toLocaleString()}</TableCell>
                        </TableRow>
                      </SheetTrigger>
                      <SheetContent className="w-full sm:max-w-md bg-white border-l border-stone-200 p-0">
                        <PlayerDetails player={player} />
                      </SheetContent>
                    </Sheet>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </section>
      </div>

      <AdminNav />
    </main>
  );
}

function PlayerDetails({ player }: { player: any }) {
  if (!player) return null;

  return (
    <div className="h-full flex flex-col">
      <div className="relative h-48 bg-onyx overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-lime-yellow/20 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-lime-yellow/10 rounded-full blur-[60px]" />
      </div>

      <div className="px-8 -mt-16 flex-1 space-y-8 pb-12 overflow-y-auto no-scrollbar">
        <div className="flex flex-col items-center text-center space-y-4">
          <Avatar className="w-32 h-32 border-4 border-white shadow-xl ring-4 ring-lime-yellow/20">
            <AvatarImage src={player.avatar_url} />
            <AvatarFallback className="bg-onyx text-white text-3xl font-heading">
              {player.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-3xl font-heading text-onyx">{player.name}</h3>
            <p className="text-stone-400 font-medium">Joined Arena 2025 • {player.team}</p>
            <div className="flex justify-center gap-2 mt-4">
              <Badge className="bg-lime-yellow text-onyx border-none rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-widest">
                {player.role || "PRO PLAYER"}
              </Badge>
              <Badge variant="outline" className="rounded-full border-stone-200 text-stone-500 font-bold px-4 py-1 text-[10px] uppercase tracking-widest">
                VERIFIED
              </Badge>
            </div>
          </div>
        </div>

        <section className="space-y-4">
          <h4 className="text-xs font-black text-stone-400 uppercase tracking-[0.2em] ml-1">Performance Matrix</h4>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Matches Played", value: player.matches, icon: Swords, color: "text-blue-500", bg: "bg-blue-50" },
              { label: "Total Victory", value: player.wins, icon: Trophy, color: "text-amber-500", bg: "bg-amber-50" },
              { label: "Kill Count", value: player.kills, icon: Target, color: "text-red-500", bg: "bg-red-50" },
              { label: "Win Ratio", value: `${player.win_rate}%`, icon: TrendingUp, color: "text-green-500", bg: "bg-green-50" },
            ].map((stat, i) => (
              <div key={i} className="bg-stone-50 p-4 rounded-3xl border border-stone-100">
                <div className={`w-10 h-10 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-3`}>
                  <stat.icon size={20} />
                </div>
                <p className="text-[10px] text-stone-400 uppercase font-bold tracking-widest">{stat.label}</p>
                <p className="text-xl font-heading text-onyx">{stat.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h4 className="text-xs font-black text-stone-400 uppercase tracking-[0.2em] ml-1">Financial Overview</h4>
          <div className="bg-onyx text-white p-6 rounded-[32px] border border-white/10 flex justify-between items-center shadow-xl">
            <div>
              <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Lifetime Earnings</p>
              <h4 className="text-3xl font-heading text-lime-yellow mt-1">₹{player.earnings.toLocaleString()}</h4>
            </div>
            <div className="p-4 bg-white/10 rounded-2xl">
              <DollarSign size={24} className="text-white" />
            </div>
          </div>
        </section>

        <div className="space-y-3">
          <Button className="w-full h-14 bg-onyx hover:bg-lime-yellow hover:text-onyx text-white rounded-[24px] font-bold text-base transition-all shadow-xl shadow-onyx/20 flex gap-3">
            <ExternalLink size={20} /> View Full History
          </Button>
          <Button variant="outline" className="w-full h-14 border-stone-200 hover:bg-stone-50 rounded-[24px] font-bold text-stone-500">
            Contact Player
          </Button>
        </div>
      </div>
    </div>
  );
}
