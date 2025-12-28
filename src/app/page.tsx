"use client";

import { motion } from "framer-motion";
import { BottomNav } from "@/components/layout/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { 
  Trophy, ChevronRight, Users, Play, TrendingUp, Award, Plus,
  Wallet, Zap, Clock
} from "lucide-react";
import { StoryViewer } from "@/components/StoryViewer";
import { StoryUpload } from "@/components/StoryUpload";
import { TopHeader } from "@/components/layout/TopHeader";
import { BentoCard } from "@/components/ui/BentoCard";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default function Home() {
  const { user, loading: authLoading } = useAuth(false);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [featuredMatches, setFeaturedMatches] = useState<any[]>([]);
  const [userStats, setUserStats] = useState({ wins: 0, rank: "N/A", growth: "+0%" });
  const [loading, setLoading] = useState(true);
  
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  const [activeStories, setActiveStories] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const [profilesRes, storiesRes, matchesRes] = await Promise.all([
        supabase.from("profiles").select("*").limit(15),
        supabase.from("stories")
          .select(`*, user:profiles(full_name, avatar_url)`)
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: true }),
        supabase.from("matches")
          .select(`*, tournament:tournaments(title, entry_fee, prize_pool)`)
          .or('status.eq.live,status.eq.upcoming')
          .order('status', { ascending: false })
          .limit(10)
      ]);

      setProfiles(profilesRes.data || []);
      setStories(storiesRes.data || []);
      setFeaturedMatches(matchesRes.data || []);

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("matches_played, win_rate")
          .eq("id", user.id)
          .single();
        
        if (profile) {
          setUserStats({
            wins: Math.floor((profile.matches_played || 0) * (parseFloat(profile.win_rate) / 100)),
            rank: "#42",
            growth: "+12%"
          });
        }
      }
    } catch (error) {
      console.error("Error fetching arena data:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openStory = (userId: string) => {
    const userStories = stories.filter(s => s.user_id === userId);
    if (userStories.length > 0) {
      setActiveStories(userStories);
      setSelectedStoryIndex(0);
      setIsViewerOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-white text-onyx">
      <main className="pb-32 relative z-10">
        <TopHeader />

        {/* Greeting Section */}
        <section className="relative px-4 sm:px-6 pt-8 pb-4 blob-header blob-header-yellow">
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-charcoal uppercase tracking-[0.2em] mb-2">
              {user ? `Welcome back, ${user.user_metadata?.full_name?.split(' ')[0] || 'Warrior'}` : 'Greetings, Champion'}
            </p>
            <h2 className="text-3xl sm:text-4xl font-heading text-onyx leading-tight">
              Ready to win <br />
              <span className="text-olive underline decoration-lime-vibrant decoration-4 underline-offset-4">big today?</span>
            </h2>
          </div>
        </section>

        {/* Stories Row */}
        <section className="py-6 overflow-hidden">
          <div className="flex gap-4 overflow-x-auto no-scrollbar px-4 sm:px-6 items-start">
            {/* Arena Official Story */}
            <div className="flex-shrink-0 flex flex-col items-center gap-2">
              <motion.div 
                whileTap={{ scale: 0.92 }}
                className="w-[72px] h-[72px] rounded-full p-[3px] bg-gradient-to-tr from-lime-vibrant to-lemon-lime shadow-lg shadow-lime-vibrant/20"
              >
                <div className="w-full h-full rounded-full bg-white p-0.5">
                  <div className="w-full h-full rounded-full bg-lime-vibrant flex items-center justify-center overflow-hidden">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2.5" className="w-8 h-8">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                  </div>
                </div>
              </motion.div>
              <span className="text-[10px] font-bold text-olive uppercase tracking-wide">Arena</span>
            </div>

            {/* User's own story */}
            {user && (
              <div className="flex-shrink-0 flex flex-col items-center gap-2">
                <motion.div 
                  whileTap={{ scale: 0.92 }}
                  onClick={() => {
                    const myStories = stories.filter(s => s.user_id === user.id);
                    if (myStories.length > 0) openStory(user.id);
                    else setIsUploadOpen(true);
                  }}
                  className={`relative w-[72px] h-[72px] rounded-full p-[3px] ${
                    stories.some(s => s.user_id === user.id) 
                      ? 'bg-gradient-to-tr from-lime-vibrant to-lemon-lime shadow-lg shadow-lime-vibrant/20' 
                      : 'border-2 border-dashed border-silver'
                  }`}
                >
                  <div className="w-full h-full rounded-full bg-white p-0.5">
                    <div className="w-full h-full rounded-full bg-off-white flex items-center justify-center overflow-hidden">
                      {user.user_metadata?.avatar_url ? (
                        <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl font-heading text-charcoal">{user.email?.[0].toUpperCase()}</span>
                      )}
                    </div>
                  </div>
                  {!stories.some(s => s.user_id === user.id) && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-lime-vibrant rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                      <Plus size={14} strokeWidth={3} className="text-onyx" />
                    </div>
                  )}
                </motion.div>
                <span className="text-[10px] font-bold text-charcoal uppercase tracking-wide">You</span>
              </div>
            )}

            {/* Other users' stories */}
            {profiles.filter(p => p.id !== user?.id).map((profile) => {
              const hasStory = stories.some(s => s.user_id === profile.id);
              return (
                <div 
                  key={profile.id}
                  onClick={() => hasStory && openStory(profile.id)}
                  className="flex-shrink-0 flex flex-col items-center gap-2"
                >
                  <motion.div 
                    whileTap={{ scale: 0.92 }}
                    className={`w-[72px] h-[72px] rounded-full p-[3px] ${
                      hasStory 
                        ? 'bg-gradient-to-tr from-lime-vibrant to-lemon-lime shadow-lg shadow-lime-vibrant/20' 
                        : 'bg-silver/30'
                    }`}
                  >
                    <div className="w-full h-full rounded-full bg-white p-0.5">
                      <div className="w-full h-full rounded-full bg-off-white flex items-center justify-center overflow-hidden">
                        {profile.avatar_url ? (
                          <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl font-heading text-charcoal">{profile.full_name?.[0]?.toUpperCase()}</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                  <span className={`text-[10px] font-bold uppercase tracking-wide ${
                    hasStory ? 'text-olive' : 'text-charcoal'
                  }`}>
                    {profile.full_name?.split(' ')[0]?.slice(0, 8)}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Featured Tournament Hero Card - Peach Theme */}
        {featuredMatches[0] && (
          <section className="px-4 sm:px-6 mb-8">
            <BentoCard variant="hero" pastelColor="peach" className="p-7">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <StatusBadge variant={featuredMatches[0].status === 'live' ? 'live' : 'upcoming'} />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-charcoal uppercase tracking-widest opacity-60">Prize Pool</p>
                  <p className="text-2xl font-heading text-onyx font-black">₹{featuredMatches[0].tournament?.prize_pool?.toLocaleString()}</p>
                </div>
              </div>
              
              <h3 className="text-2xl sm:text-3xl font-heading text-onyx mb-2 leading-tight font-black">{featuredMatches[0].title}</h3>
              <p className="text-xs text-charcoal font-bold mb-6 opacity-70 uppercase tracking-wide">{featuredMatches[0].tournament?.title}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-olive" />
                    <span className="text-xs font-bold text-onyx">
                      {featuredMatches[0].start_time 
                        ? new Date(featuredMatches[0].start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'TBD'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-olive" />
                    <span className="text-xs font-bold text-onyx">{featuredMatches[0].mode}</span>
                  </div>
                </div>
                <Link href={`/matches`}>
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-onyx text-white rounded-2xl text-[12px] font-bold uppercase tracking-wider shadow-xl shadow-onyx/20 flex items-center gap-2"
                  >
                    Play <ChevronRight size={16} />
                  </motion.button>
                </Link>
              </div>
            </BentoCard>
          </section>
        )}

        {/* Quick Actions Grid */}
        <section className="px-4 sm:px-6 mb-8">
          <div className="grid grid-cols-3 gap-4">
            <Link href="/matches">
              <BentoCard variant="pastel" pastelColor="mint" className="p-5 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-3">
                  <Zap size={22} className="text-olive" />
                </div>
                <span className="text-[11px] font-bold text-onyx uppercase tracking-wide">Enter Arena</span>
              </BentoCard>
            </Link>
            <Link href="/wallet">
              <BentoCard variant="pastel" pastelColor="lavender" className="p-5 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-3">
                  <Wallet size={22} className="text-olive" />
                </div>
                <span className="text-[11px] font-bold text-onyx uppercase tracking-wide">Top Up</span>
              </BentoCard>
            </Link>
            <Link href="/matches">
              <BentoCard variant="pastel" pastelColor="yellow" className="p-5 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-3">
                  <Trophy size={22} className="text-olive" />
                </div>
                <span className="text-[11px] font-bold text-onyx uppercase tracking-wide">Win History</span>
              </BentoCard>
            </Link>
          </div>
        </section>

        {/* Performance Stats - Dark Mode Card */}
        <section className="px-4 sm:px-6 mb-8">
          <BentoCard variant="dark" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-heading text-white">Your Performance</h3>
              <Link href="/leaderboard" className="text-[10px] font-bold text-lime-vibrant uppercase tracking-widest flex items-center gap-1">
                Leaderboard <ChevronRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-6">
              {[
                { label: "Wins", value: userStats.wins, icon: Trophy, color: "text-pastel-yellow" },
                { label: "Rank", value: userStats.rank, icon: Award, color: "text-pastel-mint" },
                { label: "Growth", value: userStats.growth, icon: TrendingUp, color: "text-pastel-coral" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-3">
                    <stat.icon size={22} className={stat.color} />
                  </div>
                  <p className="text-xl font-heading text-white font-black">{stat.value}</p>
                  <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
            </div>
          </BentoCard>
        </section>

        {/* Upcoming Matches Slider */}
        <section className="px-4 sm:px-6 mb-8">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xl font-heading text-onyx font-black">Next Matches</h3>
            <Link href="/matches" className="text-[11px] font-bold text-olive uppercase tracking-widest flex items-center gap-1">
              All <ChevronRight size={14} />
            </Link>
          </div>
          
          <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-4 px-4">
            {featuredMatches.slice(1, 6).map((match, i) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex-shrink-0 w-72"
              >
                <BentoCard className="p-5 border-none shadow-xl shadow-silver/10">
                  <div className="flex items-start justify-between mb-4">
                    <StatusBadge variant={match.status === 'live' ? 'live' : 'upcoming'} />
                    <span className="text-[11px] font-bold text-charcoal opacity-50 uppercase tracking-widest">{match.mode}</span>
                  </div>
                  <h4 className="text-lg font-heading text-onyx mb-1 truncate font-bold">{match.title}</h4>
                  <p className="text-[11px] text-charcoal mb-5 opacity-60 font-medium uppercase tracking-wide">{match.tournament?.title}</p>
                  <div className="flex items-center justify-between border-t border-off-white pt-4">
                    <div className="flex items-center gap-2">
                      <Trophy size={14} className="text-olive" />
                      <span className="text-sm font-black text-onyx">₹{match.tournament?.prize_pool?.toLocaleString()}</span>
                    </div>
                    <div className="bg-lime-vibrant/20 px-3 py-1.5 rounded-xl">
                      <span className="text-[11px] font-bold text-olive">₹{match.tournament?.entry_fee}</span>
                    </div>
                  </div>
                </BentoCard>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Live Broadcast CTA */}
        {featuredMatches.some(m => m.status === 'live') && (
          <section className="px-4 sm:px-6 mb-8">
            <Link href="/live">
              <BentoCard variant="pastel" pastelColor="coral" className="p-6 relative overflow-hidden group">
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-onyx flex items-center justify-center shadow-2xl group-active:scale-95 transition-transform">
                      <Play size={28} className="text-lime-vibrant translate-x-1" fill="currentColor" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-onyx uppercase tracking-widest">Live Broadcast</span>
                      </div>
                      <p className="text-sm font-bold text-onyx opacity-80">Watch Elite Warriors Clash</p>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-white/50 flex items-center justify-center">
                    <ChevronRight size={24} className="text-onyx" />
                  </div>
                </div>
              </BentoCard>
            </Link>
          </section>
        )}
      </main>

      <StoryViewer 
        stories={activeStories}
        initialIndex={selectedStoryIndex}
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
      />

      <StoryUpload 
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={fetchData}
      />

      <BottomNav />
    </div>
  );
}
