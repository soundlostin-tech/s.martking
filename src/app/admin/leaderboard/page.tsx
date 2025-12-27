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
    <main className="min-h-screen pb-32 bg-background text-foreground">
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px]" />
      </div>

      <div className="px-6 pt-24 relative z-10 space-y-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="space-y-1">
          <h4 className="text-[10px] font-bold text-secondary uppercase tracking-[0.4em]">Ranking Protocols</h4>
          <h1 className="text-4xl font-heading text-foreground">Elite <span className="italic font-serif opacity-60">Registry</span></h1>
        </div>

        {/* Top Player Highlight */}
        {topPlayer && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-accent/10 border border-accent/30 p-10 rounded-[3rem] shadow-lg relative overflow-hidden group"
          >
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
              <div className="relative">
                <div className="absolute -inset-4 bg-accent/20 rounded-full blur-2xl animate-pulse" />
                <Avatar className="w-40 h-40 border-8 border-background shadow-2xl relative z-10">
                  <AvatarImage src={topPlayer.avatar_url} />
                  <AvatarFallback className="bg-muted text-foreground text-4xl font-heading">
                    {topPlayer.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 bg-accent text-primary p-3 rounded-2xl shadow-xl z-20 border-4 border-background">
                  <Medal size={24} strokeWidth={3} />
                </div>
              </div>

              <div className="flex-1 text-center md:text-left space-y-4">
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <Badge className="bg-accent text-primary border-none rounded-full px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest shadow-lg shadow-accent/20">
                    ARENA CHAMPION
                  </Badge>
                  <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                    <Star size={12} className="text-accent" /> RANK #1
                  </span>
                </div>
                <h2 className="text-5xl font-heading tracking-tight leading-none text-foreground">{topPlayer.name}</h2>
                <p className="text-muted-foreground font-bold text-xs uppercase tracking-[0.2em]">Affiliation: <span className="text-secondary">{topPlayer.team}</span></p>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                {[
                  { label: "Arena Points", value: topPlayer.points, icon: Trophy },
                  { label: "Eliminations", value: topPlayer.kills, icon: Target },
                ].map((stat, i) => (
                  <div key={i} className="bg-card p-6 rounded-[2rem] border border-border text-center min-w-[140px] group-hover:border-accent/30 transition-all shadow-sm">
                    <stat.icon size={20} className="mx-auto mb-2 text-accent opacity-60" />
                    <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">{stat.label}</p>
                    <p className="text-2xl font-heading text-foreground">{stat.value.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-accent/10 rounded-full blur-[100px]" />
          </motion.div>
        )}

        {/* Filter Bar */}
        <div className="bg-card rounded-[2.5rem] border border-border p-6 shadow-lg flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input 
              className="bg-muted border-none pl-14 rounded-2xl h-14 text-xs font-bold tracking-wide focus-visible:ring-accent placeholder:text-muted-foreground/50 text-foreground" 
              placeholder="SEARCH WARRIORS OR AFFILIATIONS..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={selectedTournament} onValueChange={setSelectedTournament}>
              <SelectTrigger className="w-[200px] h-14 rounded-2xl bg-muted border-none font-bold text-[10px] tracking-widest text-muted-foreground">
                <SelectValue placeholder="ARENA SCALE" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-border bg-popover text-popover-foreground shadow-2xl">
                <SelectItem value="global" className="text-[10px] uppercase font-bold">GLOBAL ARENA</SelectItem>
                {tournaments.map((t) => (
                  <SelectItem key={t.id} value={t.id} className="text-[10px] uppercase font-bold">{t.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button className="h-14 w-14 rounded-2xl bg-muted text-muted-foreground hover:bg-accent hover:text-primary transition-all p-0 border border-border">
              <Download size={20} />
            </Button>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="space-y-6">
          <div className="flex items-end justify-between px-2">
            <div className="space-y-1">
              <h3 className="text-2xl font-heading text-foreground">Ranking <span className="italic font-serif opacity-60">Table</span></h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{filteredLeaderboard.length} WARRIORS CLASSIFIED</p>
            </div>
            <div className="flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-full border border-accent/20">
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <p className="text-[8px] font-bold text-accent uppercase tracking-widest">Live Sync: Active</p>
            </div>
          </div>

          <div className="bg-card rounded-[3rem] border border-border shadow-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-border hover:bg-transparent h-20">
                  <TableHead className="w-24 pl-10 font-bold text-muted-foreground uppercase text-[9px] tracking-[0.3em]">Pos</TableHead>
                  <TableHead className="font-bold text-muted-foreground uppercase text-[9px] tracking-[0.3em]">Warrior</TableHead>
                  <TableHead className="font-bold text-muted-foreground uppercase text-[9px] tracking-[0.3em]">Affiliation</TableHead>
                  <TableHead className="font-bold text-muted-foreground uppercase text-[9px] tracking-[0.3em] text-center">Wins</TableHead>
                  <TableHead className="font-bold text-muted-foreground uppercase text-[9px] tracking-[0.3em] text-center cursor-pointer hover:text-accent transition-colors" onClick={() => handleSort("points")}>
                    <div className="flex items-center justify-center gap-2">AP <ArrowUpDown size={12} /></div>
                  </TableHead>
                  <TableHead className="font-bold text-muted-foreground uppercase text-[9px] tracking-[0.3em] text-right pr-10">Earnings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-64 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-accent mx-auto" />
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Syncing Registry...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredLeaderboard.map((player, index) => (
                  <TableRow key={player.id} className="border-border hover:bg-muted/20 transition-colors h-24 group">
                    <TableCell className="pl-10">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-heading text-lg transition-all duration-500 ${
                        index === 0 ? "bg-accent text-primary shadow-lg shadow-accent/20 scale-110" :
                        index === 1 ? "bg-muted text-foreground" :
                        index === 2 ? "bg-muted/50 text-muted-foreground" :
                        "text-muted-foreground/40"
                      }`}>
                        {index + 1}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-5">
                        <Avatar className="w-12 h-12 border-2 border-border shadow-sm group-hover:scale-110 transition-transform duration-500">
                          <AvatarImage src={player.avatar_url} />
                          <AvatarFallback className="bg-muted text-muted-foreground text-sm font-heading">
                            {player.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-0.5">
                          <p className="font-heading text-foreground group-hover:text-accent transition-colors">{player.name}</p>
                          <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">@{player.username}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-full border-border text-muted-foreground font-bold text-[9px] tracking-widest px-3 py-0.5 group-hover:border-accent/20 group-hover:text-accent transition-all">
                        {player.team}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-heading text-muted-foreground group-hover:text-foreground transition-colors">{player.wins}</TableCell>
                    <TableCell className="text-center font-heading text-xl text-foreground">{player.points}</TableCell>
                    <TableCell className="text-right pr-10 font-heading text-foreground text-lg">₹{player.earnings.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {!loading && filteredLeaderboard.length === 0 && (
              <div className="py-32 text-center flex flex-col items-center gap-4 bg-muted/10">
                <Users size={48} strokeWidth={1} className="text-muted-foreground/20" />
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">No matching warrior data found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AdminNav />
    </main>
  );
}
