"use client";

import { BottomNav } from "@/components/layout/BottomNav";
import { TopHeader } from "@/components/layout/TopHeader";
import { BentoCard } from "@/components/ui/BentoCard";
import { ChipGroup } from "@/components/ui/Chip";
import { useState, useEffect, useCallback } from "react";
import { Trophy, Medal, TrendingUp, ChevronUp, ChevronDown, Loader2, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function LeaderboardPage() {
  const { user } = useAuth(false);
  const [activeTab, setActiveTab] = useState("Overall");
  const [selectedTournament, setSelectedTournament] = useState<string>("all");
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [myRank, setMyRank] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: tournamentsData } = await supabase
        .from("tournaments")
        .select("id, title")
        .order("created_at", { ascending: false });
      
      setTournaments(tournamentsData || []);

      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, username, matches_played, win_rate")
        .order("matches_played", { ascending: false })
        .limit(50);

      const rankedData = (profilesData || []).map((profile, index) => ({
        ...profile,
        rank: index + 1,
        points: Math.floor((profile.matches_played || 0) * (parseFloat(profile.win_rate || "0") / 100) * 100),
        wins: Math.floor((profile.matches_played || 0) * (parseFloat(profile.win_rate || "0") / 100)),
        change: Math.floor(Math.random() * 5) - 2,
      }));

      setLeaderboard(rankedData);

      if (user) {
        const userRank = rankedData.findIndex(p => p.id === user.id);
        setMyRank(userRank !== -1 ? userRank + 1 : null);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const topThree = leaderboard.slice(0, 3);
  const restOfLeaderboard = leaderboard.slice(3);

  return (
    <div className="min-h-screen bg-[#D4D7DE] text-[#11130D]">
      <main className="pb-28 relative z-10">
        <TopHeader />

        {/* Pastel Blob Header */}
        <section className="relative px-4 sm:px-6 pt-6 pb-4 blob-header blob-header-yellow">
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-[#4A4B48] uppercase tracking-[0.2em] mb-1">
              Rankings
            </p>
            <h2 className="text-2xl sm:text-3xl font-heading text-[#11130D]">
              <span className="text-[#868935]">Leaderboard</span>
            </h2>
          </div>
        </section>

        <div className="px-4 sm:px-6 pt-4 space-y-6">
          {/* Tournament Selector */}
          <Select value={selectedTournament} onValueChange={setSelectedTournament}>
            <SelectTrigger className="w-full h-12 rounded-xl bg-white border border-[#C8C8C4]/30 font-medium text-[#11130D] focus:ring-[#D7FD03]">
              <SelectValue placeholder="Select Tournament" />
            </SelectTrigger>
            <SelectContent className="bg-white border-[#C8C8C4]/30 rounded-xl">
              <SelectItem value="all">All Tournaments</SelectItem>
              {tournaments.map(t => (
                <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Tab Chips */}
          <ChipGroup 
            options={["Overall", "Today", "Weekly"]}
            selected={activeTab}
            onChange={setActiveTab}
          />

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-[#868935]" />
              <p className="text-[10px] text-[#4A4B48] font-bold uppercase tracking-wider">Loading rankings...</p>
            </div>
          ) : (
            <>
              {/* Top 3 Podium */}
              <BentoCard variant="hero" pastelColor="yellow" className="p-6">
                <div className="flex items-end justify-center gap-3 mb-4">
                  {/* 2nd Place */}
                  {topThree[1] && (
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="flex flex-col items-center"
                    >
                      <div className="w-16 h-16 rounded-full bg-white p-1 shadow-lg mb-2">
                        <div className="w-full h-full rounded-full bg-[#E8E9EC] flex items-center justify-center text-[#4A4B48] text-xl font-heading">
                          {topThree[1].avatar_url ? (
                            <img src={topThree[1].avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : topThree[1].full_name?.[0]?.toUpperCase()}
                        </div>
                      </div>
                      <div className="w-16 h-20 bg-[#C8C8C4] rounded-t-xl flex flex-col items-center justify-center">
                        <Medal size={20} className="text-[#4A4B48] mb-1" />
                        <span className="text-xl font-heading text-[#11130D]">2</span>
                      </div>
                      <p className="text-[10px] font-bold text-[#11130D] mt-2 truncate max-w-16">{topThree[1].full_name?.split(' ')[0]}</p>
                      <p className="text-[9px] text-[#868935] font-bold">{topThree[1].points} pts</p>
                    </motion.div>
                  )}

                  {/* 1st Place */}
                  {topThree[0] && (
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="flex flex-col items-center -mt-4"
                    >
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#D7FD03] to-[#C7E323] p-1 shadow-xl mb-2">
                        <div className="w-full h-full rounded-full bg-white p-0.5">
                          <div className="w-full h-full rounded-full bg-[#D7FD03] flex items-center justify-center text-[#11130D] text-2xl font-heading">
                            {topThree[0].avatar_url ? (
                              <img src={topThree[0].avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : topThree[0].full_name?.[0]?.toUpperCase()}
                          </div>
                        </div>
                      </div>
                      <div className="w-20 h-28 bg-[#D7FD03] rounded-t-xl flex flex-col items-center justify-center shadow-lg">
                        <Trophy size={24} className="text-[#11130D] mb-1" />
                        <span className="text-2xl font-heading text-[#11130D]">1</span>
                      </div>
                      <p className="text-[11px] font-bold text-[#11130D] mt-2 truncate max-w-20">{topThree[0].full_name?.split(' ')[0]}</p>
                      <p className="text-[10px] text-[#868935] font-bold">{topThree[0].points} pts</p>
                    </motion.div>
                  )}

                  {/* 3rd Place */}
                  {topThree[2] && (
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="flex flex-col items-center"
                    >
                      <div className="w-14 h-14 rounded-full bg-white p-1 shadow-lg mb-2">
                        <div className="w-full h-full rounded-full bg-[#E8E9EC] flex items-center justify-center text-[#4A4B48] text-lg font-heading">
                          {topThree[2].avatar_url ? (
                            <img src={topThree[2].avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : topThree[2].full_name?.[0]?.toUpperCase()}
                        </div>
                      </div>
                      <div className="w-14 h-16 bg-[#F5E3C7] rounded-t-xl flex flex-col items-center justify-center">
                        <Medal size={18} className="text-[#7A5C00] mb-1" />
                        <span className="text-lg font-heading text-[#11130D]">3</span>
                      </div>
                      <p className="text-[10px] font-bold text-[#11130D] mt-2 truncate max-w-14">{topThree[2].full_name?.split(' ')[0]}</p>
                      <p className="text-[9px] text-[#868935] font-bold">{topThree[2].points} pts</p>
                    </motion.div>
                  )}
                </div>
              </BentoCard>

              {/* Rankings List */}
              <section className="space-y-3">
                {restOfLeaderboard.map((player, i) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                  >
                    <BentoCard className={`p-4 flex items-center gap-4 ${player.id === user?.id ? 'border-[#D7FD03] border-2' : ''}`}>
                      <div className="w-8 text-center">
                        <span className="text-lg font-heading text-[#11130D]">{player.rank}</span>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-[#E8E9EC] flex items-center justify-center">
                        {player.avatar_url ? (
                          <img src={player.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="text-sm font-heading text-[#4A4B48]">{player.full_name?.[0]?.toUpperCase()}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-[#11130D] truncate">{player.full_name}</p>
                        <p className="text-[10px] text-[#4A4B48]">{player.wins} wins</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-heading text-[#11130D]">{player.points}</p>
                        <div className="flex items-center justify-end gap-0.5">
                          {player.change > 0 ? (
                            <>
                              <ChevronUp size={12} className="text-[#868935]" />
                              <span className="text-[9px] text-[#868935] font-bold">{player.change}</span>
                            </>
                          ) : player.change < 0 ? (
                            <>
                              <ChevronDown size={12} className="text-[#8A2020]" />
                              <span className="text-[9px] text-[#8A2020] font-bold">{Math.abs(player.change)}</span>
                            </>
                          ) : (
                            <span className="text-[9px] text-[#4A4B48] font-bold">-</span>
                          )}
                        </div>
                      </div>
                    </BentoCard>
                  </motion.div>
                ))}
              </section>

              {/* My Position Sticky Card */}
              {myRank && (
                <div className="fixed bottom-28 left-4 right-4 max-w-lg mx-auto">
                  <BentoCard className="p-3 flex items-center justify-between bg-[#D7FD03] border-none">
                    <div className="flex items-center gap-3">
                      <Users size={18} className="text-[#11130D]" />
                      <span className="text-[12px] font-bold text-[#11130D]">Your Rank</span>
                    </div>
                    <span className="text-lg font-heading text-[#11130D]">#{myRank}</span>
                  </BentoCard>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
