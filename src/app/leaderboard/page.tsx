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
      <div className="min-h-screen text-onyx" suppressHydrationWarning={true}>
        <main className="pb-32 relative z-10" suppressHydrationWarning={true}>
          <TopHeader />
  
          {/* Header Section */}
        <section className="relative pt-12 pb-14 px-8 overflow-hidden bg-transparent" suppressHydrationWarning={true}>
          
          <div className="relative z-10" suppressHydrationWarning={true}>
            <p className="text-[10px] font-bold text-charcoal/50 uppercase tracking-[0.2em] mb-2">
              Arena Rankings
            </p>
            <h2 className="text-[32px] font-heading text-onyx leading-tight font-black">
              Elite <br />
              <span className="text-onyx">Warriors</span>
            </h2>
          </div>
        </section>

        <div className="px-6 space-y-6" suppressHydrationWarning={true}>
          {/* Tournament Selector */}
          <Select value={selectedTournament} onValueChange={setSelectedTournament}>
            <SelectTrigger className="w-full h-14 rounded-2xl bg-white border border-black/5 font-bold text-onyx focus:ring-onyx/5 shadow-sm" suppressHydrationWarning={true}>
              <SelectValue placeholder="Select Tournament" />
            </SelectTrigger>
            <SelectContent className="bg-white border-black/5 rounded-2xl">
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
            <div className="flex flex-col items-center justify-center py-20 gap-4" suppressHydrationWarning={true}>
              <Loader2 className="w-12 h-12 animate-spin text-onyx/20" />
              <p className="text-[10px] text-charcoal/40 font-bold uppercase tracking-widest">Scanning rankings...</p>
            </div>
          ) : (
            <>
              {/* Top 3 Podium */}
              <BentoCard variant="hero" pastelColor="yellow" className="p-8 border-none shadow-[0_10px_40px_rgba(0,0,0,0.03)]" suppressHydrationWarning={true}>
                <div className="flex items-end justify-center gap-4 mb-4">
                  {/* 2nd Place */}
                  {topThree[1] && (
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="flex flex-col items-center"
                    >
                      <div className="w-16 h-16 rounded-full bg-white p-1 shadow-lg mb-2 border border-black/5">
                        <div className="w-full h-full rounded-full bg-off-white flex items-center justify-center text-charcoal text-xl font-heading overflow-hidden">
                          {topThree[1].avatar_url ? (
                            <img src={topThree[1].avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : topThree[1].full_name?.[0]?.toUpperCase()}
                        </div>
                      </div>
                      <div className="w-16 h-20 bg-silver/30 rounded-t-[20px] flex flex-col items-center justify-center">
                        <Medal size={20} className="text-charcoal mb-1" />
                        <span className="text-xl font-heading text-onyx font-black">2</span>
                      </div>
                      <p className="text-[10px] font-black text-onyx mt-2 truncate max-w-16">{topThree[1].full_name?.split(' ')[0]}</p>
                      <p className="text-[9px] text-charcoal/40 font-bold uppercase tracking-widest">{topThree[1].points} PTS</p>
                    </motion.div>
                  )}

                  {/* 1st Place */}
                  {topThree[0] && (
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="flex flex-col items-center -mt-4"
                    >
                      <div className="w-20 h-20 rounded-full bg-onyx p-1 shadow-2xl mb-2">
                        <div className="w-full h-full rounded-full bg-white p-0.5">
                          <div className="w-full h-full rounded-full bg-lime-vibrant flex items-center justify-center text-onyx text-2xl font-heading overflow-hidden">
                            {topThree[0].avatar_url ? (
                              <img src={topThree[0].avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : topThree[0].full_name?.[0]?.toUpperCase()}
                          </div>
                        </div>
                      </div>
                      <div className="w-20 h-28 bg-onyx rounded-t-[24px] flex flex-col items-center justify-center shadow-2xl">
                        <Trophy size={24} className="text-lime-vibrant mb-1" />
                        <span className="text-2xl font-heading text-white font-black">1</span>
                      </div>
                      <p className="text-[11px] font-black text-onyx mt-2 truncate max-w-20">{topThree[0].full_name?.split(' ')[0]}</p>
                      <p className="text-[10px] text-charcoal/40 font-bold uppercase tracking-widest">{topThree[0].points} PTS</p>
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
                      <div className="w-14 h-14 rounded-full bg-white p-1 shadow-lg mb-2 border border-black/5">
                        <div className="w-full h-full rounded-full bg-off-white flex items-center justify-center text-charcoal text-lg font-heading overflow-hidden">
                          {topThree[2].avatar_url ? (
                            <img src={topThree[2].avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : topThree[2].full_name?.[0]?.toUpperCase()}
                        </div>
                      </div>
                      <div className="w-14 h-16 bg-pastel-peach rounded-t-[18px] flex flex-col items-center justify-center">
                        <Medal size={18} className="text-onyx mb-1" />
                        <span className="text-lg font-heading text-onyx font-black">3</span>
                      </div>
                      <p className="text-[10px] font-black text-onyx mt-2 truncate max-w-14">{topThree[2].full_name?.split(' ')[0]}</p>
                      <p className="text-[9px] text-charcoal/40 font-bold uppercase tracking-widest">{topThree[2].points} PTS</p>
                    </motion.div>
                  )}
                </div>
              </BentoCard>

              {/* Rankings List */}
              <section className="space-y-4">
                {restOfLeaderboard.map((player, i) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                  >
                    <BentoCard className={`p-5 flex items-center gap-5 border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] ${player.id === user?.id ? 'ring-2 ring-onyx shadow-xl' : ''}`}>
                      <div className="w-8 text-center">
                        <span className="text-lg font-heading text-onyx font-black">{player.rank}</span>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-off-white flex items-center justify-center overflow-hidden border border-black/5">
                        {player.avatar_url ? (
                          <img src={player.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm font-heading text-charcoal font-black">{player.full_name?.[0]?.toUpperCase()}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-black text-onyx truncate">{player.full_name}</p>
                        <p className="text-[10px] font-bold text-charcoal/40 uppercase tracking-widest">{player.wins} WINS</p>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-heading text-onyx font-black">{player.points}</p>
                        <div className="flex items-center justify-end gap-1 mt-0.5">
                          {player.change > 0 ? (
                            <>
                              <ChevronUp size={12} className="text-lime-vibrant" strokeWidth={3} />
                              <span className="text-[10px] text-lime-vibrant font-black">{player.change}</span>
                            </>
                          ) : player.change < 0 ? (
                            <>
                              <ChevronDown size={12} className="text-pastel-coral" strokeWidth={3} />
                              <span className="text-[10px] text-pastel-coral font-black">{Math.abs(player.change)}</span>
                            </>
                          ) : (
                            <span className="text-[10px] text-charcoal/20 font-black">-</span>
                          )}
                        </div>
                      </div>
                    </BentoCard>
                  </motion.div>
                ))}
              </section>

              {/* My Position Sticky Card */}
              {myRank && (
                <div className="fixed bottom-32 left-6 right-6 max-w-lg mx-auto z-[60]">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                  >
                    <BentoCard className="p-4 flex items-center justify-between bg-onyx border-none shadow-2xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                          <Users size={20} className="text-lime-vibrant" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Your Current Position</p>
                          <p className="text-sm font-bold text-white">Keep pushing, Warrior!</p>
                        </div>
                      </div>
                      <div className="bg-lime-vibrant px-4 py-2 rounded-xl">
                        <span className="text-xl font-heading text-onyx font-black">#{myRank}</span>
                      </div>
                    </BentoCard>
                  </motion.div>
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
