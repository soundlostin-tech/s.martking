"use client";

import { HeroSection } from "@/components/layout/HeroSection";
import { BottomNav } from "@/components/layout/BottomNav";
import { AnalyticsCard } from "@/components/ui/AnalyticsCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, Bell, ChevronRight, Loader2, Trophy, Target, TrendingUp, Swords, IndianRupee, Play, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [stats, setStats] = useState({
    totalTournaments: 0,
    matchesPlayedWeek: 0,
    winRate: 0,
    totalWinnings: 0,
    killsAverage: 0,
    topPlacements: 0,
  });
  const [upcomingMatches, setUpcomingMatches] = useState<any[]>([]);
  const [recentEarnings, setRecentEarnings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          // Fetch profile
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();
          setProfile(profileData);

          // Fetch wallet
          const { data: walletData } = await supabase
            .from("wallets")
            .select("*")
            .eq("id", user.id)
            .single();
          setWallet(walletData);

          // Fetch stats
          const { count: totalTournaments } = await supabase
            .from("participants")
            .select("*", { count: 'exact', head: true })
            .eq("user_id", user.id);

          const lastWeek = new Date();
          lastWeek.setDate(lastWeek.getDate() - 7);
          
          const { count: matchesPlayedWeek } = await supabase
            .from("participants")
            .select("id, joined_at")
            .eq("user_id", user.id)
            .gte("joined_at", lastWeek.toISOString());

          // Fetch winnings from transactions
          const { data: winningsData } = await supabase
            .from("transactions")
            .select("*")
            .eq("user_id", user.id)
            .in("type", ["winning", "bonus"])
            .order("created_at", { ascending: false });
          
          const totalWinnings = winningsData?.filter(t => t.type === 'winning').reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
          setRecentEarnings(winningsData?.slice(0, 3) || []);

          // Fetch upcoming matches
          const { data: matchesData } = await supabase
            .from("matches")
            .select(`
              *,
              tournament:tournaments(title)
            `)
            .eq("status", "upcoming")
            .order("start_time", { ascending: true })
            .limit(5);
          
          setUpcomingMatches(matchesData || []);

          // Mocking some stats for now as they aren't in DB yet
          setStats({
            totalTournaments: totalTournaments || 0,
            matchesPlayedWeek: matchesPlayedWeek || 0,
            winRate: 24, // Mock
            totalWinnings,
            killsAverage: 4.2, // Mock
            topPlacements: 12, // Mock
          });
        } catch (error) {
          console.error("Error fetching dashboard data:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <Loader2 className="w-8 h-8 animate-spin text-lemon-lime" />
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-32 bg-stone-50">
      {/* Header / Greeting */}
      <div className="bg-stone-50 px-6 pt-12 pb-6 flex justify-between items-center sticky top-0 z-30 border-b border-stone-100 backdrop-blur-md bg-stone-50/80">
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12 border-2 border-lime-yellow shadow-[0_0_15px_rgba(214,253,2,0.3)]">
            <AvatarImage src={profile?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"} />
            <AvatarFallback>{profile?.full_name?.substring(0, 2).toUpperCase() || "SK"}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-xl font-heading leading-tight">Hi, {profile?.full_name?.split(' ')[0] || 'Smartking'}</h3>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-lemon-lime animate-pulse" />
              <p className="text-xs text-stone-500 font-medium">Dominating the Arena</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-2.5 rounded-2xl bg-white shadow-sm border border-stone-100 text-onyx hover:bg-stone-50 transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </button>
          <Link href="/profile" className="p-2.5 rounded-2xl bg-onyx text-white shadow-lg hover:opacity-90 transition-opacity">
            <Settings size={20} />
          </Link>
        </div>
      </div>

      <div className="px-6 space-y-8 mt-4">
        {/* Summary Metrics Grid */}
        <section className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-onyx rounded-[32px] p-5 text-white shadow-xl relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Wallet Balance</p>
                <div className="flex items-baseline gap-1">
                  <IndianRupee size={16} className="text-lime-yellow" />
                  <h4 className="text-2xl font-heading">{(wallet?.balance || 0).toLocaleString()}</h4>
                </div>
                <p className="text-[10px] text-stone-500 mt-2">Ready for withdrawal</p>
              </div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-lime-yellow/10 rounded-full blur-2xl group-hover:bg-lime-yellow/20 transition-all duration-500" />
            </div>

            <div className="bg-white rounded-[32px] p-5 border border-stone-100 shadow-sm relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Win Rate</p>
                <div className="flex items-baseline gap-1">
                  <h4 className="text-2xl font-heading text-onyx">{stats.winRate}%</h4>
                  <TrendingUp size={16} className="text-green-500" />
                </div>
                <p className="text-[10px] text-stone-500 mt-2">Top 5% players</p>
              </div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-onyx/5 rounded-full blur-2xl group-hover:bg-onyx/10 transition-all duration-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-[32px] p-5 border border-stone-100 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500">
                <Trophy size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Tournaments</p>
                <h4 className="text-lg font-heading text-onyx">{stats.totalTournaments}</h4>
              </div>
            </div>
            <div className="bg-white rounded-[32px] p-5 border border-stone-100 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-500">
                <Swords size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Played (Week)</p>
                <h4 className="text-lg font-heading text-onyx">{stats.matchesPlayedWeek}</h4>
              </div>
            </div>
          </div>
        </section>

        {/* Upcoming Matches */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-heading text-onyx">Upcoming Matches</h2>
            <Link href="/matches" className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1 hover:text-onyx transition-colors">
              View All <ChevronRight size={14} />
            </Link>
          </div>
          
          <div className="space-y-3">
            {upcomingMatches.length > 0 ? (
              upcomingMatches.map((match) => (
                <div key={match.id} className="bg-white p-4 rounded-[24px] border border-stone-100 shadow-sm flex items-center justify-between group hover:border-lime-yellow/50 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-stone-50 flex flex-col items-center justify-center text-stone-400 group-hover:bg-lime-yellow/10 group-hover:text-onyx transition-colors">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-onyx text-sm leading-tight">{match.title}</h4>
                      <p className="text-[11px] text-stone-400 font-medium">{match.tournament?.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 font-bold">
                          {new Date(match.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-600 font-bold uppercase">
                          {match.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-onyx text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-lime-yellow hover:text-onyx transition-all">
                    View
                  </button>
                </div>
              ))
            ) : (
              <div className="bg-white p-8 rounded-[24px] border border-dashed border-stone-200 text-center space-y-2">
                <Calendar className="w-8 h-8 text-stone-300 mx-auto" />
                <p className="text-sm text-stone-400 font-medium">No upcoming matches</p>
                <button className="text-xs font-bold text-onyx underline">Explore Tournaments</button>
              </div>
            )}
          </div>
        </section>

        {/* Performance Stats */}
        <section className="space-y-4">
          <h2 className="text-xl font-heading text-onyx">Performance Stats</h2>
          <div className="bg-onyx rounded-[32px] p-6 text-white shadow-xl relative overflow-hidden">
            <div className="grid grid-cols-2 gap-8 relative z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-lime-yellow mb-2">
                  <Target size={18} />
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Avg. Kills</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-4xl font-heading">{stats.killsAverage}</h4>
                  <span className="text-[10px] text-stone-400 font-bold uppercase">per match</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-lime-yellow mb-2">
                  <Trophy size={18} />
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Top Placements</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-4xl font-heading">{stats.topPlacements}</h4>
                  <span className="text-[10px] text-stone-400 font-bold uppercase">total</span>
                </div>
              </div>
            </div>
            {/* Background pattern */}
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Swords size={120} />
            </div>
          </div>
        </section>

        {/* Recent Earnings */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-heading text-onyx">Recent Earnings</h2>
            <Link href="/wallet" className="text-xs font-bold text-stone-400 uppercase tracking-widest hover:text-onyx transition-colors">
              History
            </Link>
          </div>
          
          <div className="space-y-3">
            {recentEarnings.length > 0 ? (
              recentEarnings.map((earning) => (
                <div key={earning.id} className="bg-white p-4 rounded-[24px] border border-stone-100 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${earning.type === 'winning' ? 'bg-green-50 text-green-500' : 'bg-orange-50 text-orange-500'}`}>
                      {earning.type === 'winning' ? <Trophy size={18} /> : <IndianRupee size={18} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-onyx text-sm">{earning.description || (earning.type === 'winning' ? 'Match Winnings' : 'Bonus')}</h4>
                      <p className="text-[10px] text-stone-400 font-medium">
                        {new Date(earning.created_at).toLocaleDateString()} • {new Date(earning.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-heading text-onyx">+₹{Number(earning.amount).toLocaleString()}</p>
                    <span className="text-[9px] font-bold text-green-500 uppercase tracking-widest">Credited</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white p-6 rounded-[24px] border border-dashed border-stone-200 text-center">
                <p className="text-xs text-stone-400 font-medium">No recent earnings yet. Win your first match!</p>
              </div>
            )}
          </div>
        </section>
      </div>

      <BottomNav />
    </main>
  );
}
