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
  Star,
  Award,
  Crown
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
import { BentoCard } from "@/components/ui/BentoCard";

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
      <main className="min-h-screen pb-32 bg-[#F8F6F0] text-[#1A1A1A]">
      <div className="px-8 pt-24 space-y-12 max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-[#1A1A1A]/40 uppercase tracking-[0.3em] mb-2">RANKING PROTOCOLS</p>
            <h1 className="text-[44px] font-heading font-black leading-none tracking-tight text-[#1A1A1A]">
              ELITE <br />
              <span className="text-[#6B7280]/40">REGISTRY</span>
            </h1>
          </div>
          <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-md border-2 border-[#E5E7EB]">
            <div className="w-2 h-2 rounded-full bg-[#5FD3BC] animate-pulse" />
            <p className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-widest">REGISTRY SYNCED</p>
          </div>
        </div>

        {/* Top Player Highlight */}
        {topPlayer && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <BentoCard variant="mint" className="p-10 shadow-2xl relative overflow-hidden group">
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                <div className="relative">
                  <div className="w-44 h-44 rounded-[48px] p-[4px] bg-[#1A1A1A] shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
                    <div className="w-full h-full rounded-[44px] bg-white p-[4px]">
                      <Avatar className="w-full h-full rounded-[40px]">
                        <AvatarImage src={topPlayer.avatar_url} />
                        <AvatarFallback className="bg-[#F3F4F6] text-4xl font-heading font-black">
                          {topPlayer.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-[#1A1A1A] text-white p-4 rounded-2xl shadow-xl z-20 border-4 border-white rotate-[-6deg] group-hover:rotate-0 transition-transform">
                    <Crown size={28} strokeWidth={3} className="text-[#F5E6A3]" />
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left space-y-6">
                  <div className="flex items-center justify-center md:justify-start gap-4">
                    <div className="bg-[#1A1A1A] text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
                      ARENA CHAMPION
                    </div>
                    <span className="text-[#1A1A1A]/60 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                      <Star size={12} fill="#1A1A1A" className="text-[#1A1A1A]" /> RANK #1
                    </span>
                  </div>
                  <h2 className="text-5xl font-heading font-black tracking-tighter leading-none text-[#1A1A1A]">{topPlayer.name}</h2>
                  <p className="text-[#1A1A1A]/40 font-black text-xs uppercase tracking-[0.3em]">OPERATIVE ID: <span className="text-[#1A1A1A]">@{topPlayer.username}</span></p>
                </div>

                <div className="grid grid-cols-2 gap-6 w-full md:w-auto">
                  {[
                    { label: "ARENA POINTS", value: topPlayer.points, icon: Trophy, color: "blue" },
                    { label: "ELIMINATIONS", value: topPlayer.kills, icon: Target, color: "pink" },
                  ].map((stat, i) => (
                    <BentoCard key={i} variant={stat.color as any} className="p-6 text-center min-w-[160px] shadow-lg border-none group-hover:scale-105 transition-transform">
                      <stat.icon size={20} className="mx-auto mb-2 text-[#1A1A1A] opacity-40" />
                      <p className="text-[9px] text-[#1A1A1A]/60 uppercase font-black tracking-widest">{stat.label}</p>
                      <p className="text-2xl font-heading font-black text-[#1A1A1A] tracking-tighter">{stat.value.toLocaleString()}</p>
                    </BentoCard>
                  ))}
                </div>
              </div>
              <div className="absolute right-[-40px] bottom-[-40px] rotate-[-15deg] opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none">
                <Medal size={240} strokeWidth={1} />
              </div>
            </BentoCard>
          </motion.div>
        )}

        {/* Filter Bar */}
        <div className="bg-white rounded-[32px] border-2 border-[#E5E7EB] p-6 shadow-xl flex flex-col md:flex-row gap-6">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={20} strokeWidth={3} />
            <Input 
              className="bg-[#F5F5F5] border-none pl-14 rounded-2xl h-16 text-sm font-black tracking-tight focus-visible:ring-[#1A1A1A] placeholder:text-[#9CA3AF] text-[#1A1A1A]" 
              placeholder="SEARCH OPERATIVES OR SQUADRONS..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <Select value={selectedTournament} onValueChange={setSelectedTournament}>
              <SelectTrigger className="w-[240px] h-16 rounded-2xl bg-[#F5F5F5] border-none font-black text-[11px] tracking-widest text-[#1A1A1A] uppercase px-6">
                <SelectValue placeholder="ARENA SCALE" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-none shadow-2xl p-2 bg-white">
                <SelectItem value="global" className="text-[10px] uppercase font-black rounded-xl py-3">GLOBAL ARENA</SelectItem>
                {tournaments.map((t) => (
                  <SelectItem key={t.id} value={t.id} className="text-[10px] uppercase font-black rounded-xl py-3">{t.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              className="h-16 w-16 rounded-2xl bg-[#1A1A1A] text-white flex items-center justify-center shadow-xl active:bg-black p-0"
            >
              <Download size={24} strokeWidth={3} />
            </motion.button>
          </div>
        </div>

        {/* Leaderboard Table */}
        <section className="space-y-8 pb-12">
          <div className="flex items-end justify-between px-2">
            <div className="space-y-1">
              <h3 className="text-3xl font-heading font-black text-[#1A1A1A] tracking-tighter uppercase">RANKING <span className="text-[#1A1A1A]/20 italic">TABLE</span></h3>
              <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-[0.2em]">{filteredLeaderboard.length} OPERATIVES CLASSIFIED</p>
            </div>
          </div>

          <div className="bg-white rounded-[48px] border-none shadow-2xl overflow-hidden">
            <Table>
              <TableHeader className="bg-[#F9FAFB]">
                <TableRow className="border-b-2 border-[#E5E7EB] hover:bg-transparent h-24">
                  <TableHead className="w-32 pl-12 font-black text-[#1A1A1A]/40 uppercase text-[10px] tracking-[0.3em]">POS</TableHead>
                  <TableHead className="font-black text-[#1A1A1A]/40 uppercase text-[10px] tracking-[0.3em]">OPERATIVE</TableHead>
                  <TableHead className="font-black text-[#1A1A1A]/40 uppercase text-[10px] tracking-[0.3em]">SQUADRON</TableHead>
                  <TableHead className="font-black text-[#1A1A1A]/40 uppercase text-[10px] tracking-[0.3em] text-center">WINS</TableHead>
                  <TableHead className="font-black text-[#1A1A1A]/40 uppercase text-[10px] tracking-[0.3em] text-center cursor-pointer hover:text-[#1A1A1A] transition-colors" onClick={() => handleSort("points")}>
                    <div className="flex items-center justify-center gap-2">ARENA PTS <ArrowUpDown size={14} strokeWidth={3} /></div>
                  </TableHead>
                  <TableHead className="font-black text-[#1A1A1A]/40 uppercase text-[10px] tracking-[0.3em] text-right pr-12">LOOTED</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-96 text-center">
                      <div className="flex flex-col items-center gap-6">
                        <Loader2 className="w-14 h-14 animate-spin text-[#1A1A1A]/10 mx-auto" />
                        <p className="text-[11px] font-black uppercase tracking-[0.4em] text-[#6B7280]">Synchronizing Registry...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredLeaderboard.map((player, index) => (
                  <TableRow key={player.id} className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors h-28 group">
                    <TableCell className="pl-12">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-heading text-xl font-black transition-all duration-500 ${
                        index === 0 ? "bg-[#1A1A1A] text-white shadow-xl scale-110" :
                        index === 1 ? "bg-[#F5F5F5] text-[#1A1A1A] border-2 border-[#E5E7EB]" :
                        index === 2 ? "bg-[#F5F5F5] text-[#1A1A1A]/60 border-2 border-[#E5E7EB]" :
                        "text-[#1A1A1A]/30"
                      }`}>
                        {index + 1}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl p-1 bg-[#1A1A1A]/5 shadow-inner group-hover:scale-110 transition-transform duration-500">
                          <Avatar className="w-full h-full rounded-[14px]">
                            <AvatarImage src={player.avatar_url} />
                            <AvatarFallback className="bg-[#F3F4F6] text-[#1A1A1A] text-sm font-black uppercase">
                              {player.name.substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="space-y-1">
                          <p className="font-heading font-black text-[#1A1A1A] text-lg group-hover:text-[#5FD3BC] transition-colors">{player.name}</p>
                          <p className="text-[10px] text-[#1A1A1A]/40 font-black uppercase tracking-[0.2em]">TAG: @{player.username}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-xl border-2 border-[#E5E7EB] text-[#1A1A1A]/60 font-black text-[9px] tracking-widest px-4 py-1 group-hover:border-[#1A1A1A] group-hover:text-[#1A1A1A] transition-all bg-white shadow-sm">
                        {player.team}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-heading font-black text-[#1A1A1A]/40 group-hover:text-[#1A1A1A] transition-colors text-lg">{player.wins}</TableCell>
                    <TableCell className="text-center">
                      <span className="font-heading font-black text-2xl text-[#1A1A1A] tracking-tighter">{player.points}</span>
                    </TableCell>
                    <TableCell className="text-right pr-12">
                      <span className="font-heading font-black text-[#1A1A1A] text-xl tracking-tighter">₹{player.earnings.toLocaleString()}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {!loading && filteredLeaderboard.length === 0 && (
              <div className="py-32 text-center flex flex-col items-center gap-6 bg-[#F9FAFB]">
                <Users size={64} strokeWidth={1} className="text-[#D1D5DB]" />
                <p className="text-[12px] font-black uppercase tracking-[0.4em] text-[#9CA3AF]">NO MATCHING OPERATIVE DATA DETECTED</p>
              </div>
            )}
          </div>
        </section>
      </div>

      <AdminNav />
    </main>
  );
}
