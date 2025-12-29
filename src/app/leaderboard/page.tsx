"use client";

import { BottomNav } from "@/components/layout/BottomNav";
import { TopHeader } from "@/components/layout/TopHeader";
import { BentoCard } from "@/components/ui/BentoCard";
import { ChipGroup } from "@/components/ui/Chip";
import { useState, useEffect, useCallback } from "react";
import { Trophy, Medal, TrendingUp, ChevronUp, ChevronDown, Loader2, Users, X, Swords, Target, Gamepad2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { useHaptics } from "@/hooks/useHaptics";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function LeaderboardPage() {
  const { user } = useAuth(false);
  const { triggerHaptic } = useHaptics();
  const [activeTab, setActiveTab] = useState("Overall");
  const [selectedTournament, setSelectedTournament] = useState<string>("all");
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

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

  const openPlayerProfile = (player: any) => {
    triggerHaptic('medium');
    setSelectedPlayer(player);
    setIsProfileOpen(true);
  };

return (
<div className="min-h-screen text-onyx bg-transparent relative" suppressHydrationWarning={true}>
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
                    onClick={() => openPlayerProfile(player)}
                  >
                    <BentoCard className={`p-5 flex items-center gap-5 border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] cursor-pointer active:scale-[0.98] transition-transform ${player.id === user?.id ? 'ring-2 ring-onyx shadow-xl' : ''}`}>
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

    {/* Player Profile Modal */}
    <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
      <DialogContent className="p-0 border-none bg-white rounded-[36px] overflow-hidden max-w-[400px]">
        {selectedPlayer && (
          <>
            <div className="bg-pastel-mint p-8 relative overflow-hidden">
              <button 
                onClick={() => setIsProfileOpen(false)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/50 rounded-full flex items-center justify-center z-10"
              >
                <X size={18} />
              </button>
              <div className="relative z-10 flex items-center gap-5">
                <div className="w-20 h-20 rounded-full bg-white p-1 shadow-lg">
                  <div className="w-full h-full rounded-full bg-off-white flex items-center justify-center overflow-hidden">
                    {selectedPlayer.avatar_url ? (
                      <img src={selectedPlayer.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-black text-onyx">{selectedPlayer.full_name?.[0]?.toUpperCase()}</span>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-black mb-1">{selectedPlayer.full_name}</h3>
                  <p className="text-[10px] font-black text-onyx/50 uppercase tracking-widest">Rank #{selectedPlayer.rank}</p>
                </div>
              </div>
              <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/20 rounded-full" />
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Points", value: selectedPlayer.points, icon: Trophy, color: "yellow" },
                  { label: "Win Rate", value: `${selectedPlayer.win_rate || 0}%`, icon: Target, color: "mint" },
                  { label: "Total Wins", value: selectedPlayer.wins || 0, icon: Medal, color: "coral" },
                  { label: "Matches", value: selectedPlayer.matches_played || 0, icon: Gamepad2, color: "lavender" },
                ].map((stat, i) => (
                  <BentoCard key={i} variant="pastel" pastelColor={stat.color as any} className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <stat.icon size={14} className="text-onyx/40" />
                      <span className="text-[9px] font-black text-onyx/40 uppercase tracking-widest">{stat.label}</span>
                    </div>
                    <p className="text-xl font-black">{stat.value}</p>
                  </BentoCard>
                ))}
              </div>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsProfileOpen(false)}
                className="w-full py-4 bg-onyx text-white rounded-2xl text-[11px] font-black uppercase tracking-widest"
              >
                Close
              </motion.button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>

    <BottomNav />
  </div>
);
}
