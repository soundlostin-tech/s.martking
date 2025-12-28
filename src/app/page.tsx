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
    <div className="min-h-screen bg-background text-foreground">
      <main className="pb-28 relative z-10">
        <TopHeader />

        {/* Greeting Section with Pastel Blob */}
        <section className="relative px-4 sm:px-6 pt-6 pb-4 blob-header blob-header-yellow">
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">
              {user ? `Hello, ${user.user_metadata?.full_name?.split(' ')[0] || 'Warrior'}` : 'Welcome back'}
            </p>
            <h2 className="text-3xl sm:text-4xl font-heading text-foreground leading-tight">
              Discover, Create, <br />
              <span className="text-muted-foreground italic">Enjoy</span>
            </h2>
          </div>
        </section>

        {/* Stories Row */}
        <section className="py-4 overflow-hidden">
          <div className="flex gap-4 overflow-x-auto no-scrollbar px-4 sm:px-6 items-start">
            {/* Arena Official Story */}
            <div className="flex-shrink-0 flex flex-col items-center gap-2">
              <motion.div 
                whileTap={{ scale: 0.92 }}
                className="w-[72px] h-[72px] rounded-full p-[3px] bg-gradient-to-tr from-[#FEF38B] to-[#D7FD03]"
              >
                <div className="w-full h-full rounded-full bg-white p-0.5">
                  <div className="w-full h-full rounded-full bg-[#FEF38B] flex items-center justify-center overflow-hidden">
                    <Trophy size={28} className="text-foreground" />
                  </div>
                </div>
              </motion.div>
              <span className="text-[9px] font-bold text-foreground/60 uppercase tracking-wide">Arena</span>
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
                      ? 'bg-gradient-to-tr from-[#D0D1FF] to-[#CCF5E6]' 
                      : 'border-2 border-dashed border-muted-foreground/30'
                  }`}
                >
                  <div className="w-full h-full rounded-full bg-white p-0.5">
                    <div className="w-full h-full rounded-full bg-muted flex items-center justify-center overflow-hidden">
                      {user.user_metadata?.avatar_url ? (
                        <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl font-heading text-muted-foreground">{user.email?.[0].toUpperCase()}</span>
                      )}
                    </div>
                  </div>
                  {!stories.some(s => s.user_id === user.id) && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-foreground text-white rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                      <Plus size={14} strokeWidth={3} />
                    </div>
                  )}
                </motion.div>
                <span className="text-[9px] font-bold text-foreground/60 uppercase tracking-wide">You</span>
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
                        ? 'bg-gradient-to-tr from-[#FFD6D1] to-[#D0D1FF]' 
                        : 'bg-muted/50'
                    }`}
                  >
                    <div className="w-full h-full rounded-full bg-white p-0.5">
                      <div className="w-full h-full rounded-full bg-muted flex items-center justify-center overflow-hidden">
                        {profile.avatar_url ? (
                          <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl font-heading text-muted-foreground">{profile.full_name?.[0]?.toUpperCase()}</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                  <span className={`text-[9px] font-bold uppercase tracking-wide ${
                    hasStory ? 'text-foreground' : 'text-foreground/40'
                  }`}>
                    {profile.full_name?.split(' ')[0]?.slice(0, 8)}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Featured Tournament Hero Card */}
        {featuredMatches[0] && (
          <section className="px-4 sm:px-6 mb-8">
            <BentoCard variant="hero" pastelColor="yellow" className="p-8">
              <div className="flex items-start justify-between mb-6">
                <StatusBadge variant={featuredMatches[0].status === 'live' ? 'live' : 'upcoming'} />
                <div className="text-right">
                  <p className="text-[10px] font-bold text-foreground/60 uppercase tracking-widest mb-1">Prize Pool</p>
                  <p className="text-2xl font-heading text-foreground">₹{featuredMatches[0].tournament?.prize_pool?.toLocaleString()}</p>
                </div>
              </div>
              
              <h3 className="text-2xl sm:text-3xl font-heading text-foreground mb-3 leading-tight">
                {featuredMatches[0].title}
              </h3>
              <p className="text-xs text-foreground/60 font-medium mb-6 uppercase tracking-wider">
                {featuredMatches[0].tournament?.title}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-1">Starts</span>
                    <span className="text-sm font-heading text-foreground">
                      {featuredMatches[0].start_time 
                        ? new Date(featuredMatches[0].start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'TBD'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-1">Mode</span>
                    <span className="text-sm font-heading text-foreground">{featuredMatches[0].mode}</span>
                  </div>
                </div>
                <Link href={`/matches`}>
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-foreground text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-xl shadow-foreground/10 flex items-center gap-2"
                  >
                    Enter <ChevronRight size={16} />
                  </motion.button>
                </Link>
              </div>
            </BentoCard>
          </section>
        )}

        {/* Quick Actions - Match Reference Image Grid */}
        <section className="px-4 sm:px-6 mb-8">
          <div className="grid grid-cols-2 gap-4">
            <Link href="/matches">
              <BentoCard variant="pastel" pastelColor="coral" className="p-6 h-40 flex flex-col justify-between">
                <div className="w-12 h-12 rounded-2xl bg-white/40 flex items-center justify-center">
                  <Zap size={24} className="text-foreground" />
                </div>
                <div>
                  <h4 className="text-lg font-heading text-foreground leading-tight">Fast<br />Matches</h4>
                  <p className="text-[10px] font-bold text-foreground/50 uppercase tracking-wide mt-1">Play Now</p>
                </div>
              </BentoCard>
            </Link>
            <div className="grid grid-rows-2 gap-4">
              <Link href="/wallet">
                <BentoCard variant="pastel" pastelColor="mint" className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/40 flex items-center justify-center flex-shrink-0">
                    <Wallet size={20} className="text-foreground" />
                  </div>
                  <span className="text-sm font-heading text-foreground">Add Funds</span>
                </BentoCard>
              </Link>
              <Link href="/leaderboard">
                <BentoCard variant="pastel" pastelColor="lavender" className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/40 flex items-center justify-center flex-shrink-0">
                    <Trophy size={20} className="text-foreground" />
                  </div>
                  <span className="text-sm font-heading text-foreground">Rankings</span>
                </BentoCard>
              </Link>
            </div>
          </div>
        </section>

        {/* Performance - Reference Image Stats Card */}
        <section className="px-4 sm:px-6 mb-8">
          <BentoCard className="p-6 bg-white">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-heading text-foreground">Your Progress</h3>
                <p className="text-xs text-muted-foreground">This week's activity</p>
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-[#D0D1FF] flex items-center justify-center">
                <span className="text-[10px] font-bold">95%</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-6">
              {[
                { label: "Wins", value: userStats.wins, color: "#FEF38B" },
                { label: "Rank", value: userStats.rank, color: "#D0D1FF" },
                { label: "Growth", value: userStats.growth, color: "#CCF5E6" },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</span>
                  <p className="text-xl font-heading text-foreground">{stat.value}</p>
                  <div className="w-full h-1 bg-muted rounded-full mt-2 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "70%" }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: stat.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </BentoCard>
        </section>

        {/* Live Event Highlight - Reference Image Middle Bottom Style */}
        {featuredMatches.some(m => m.status === 'live') && (
          <section className="px-4 sm:px-6 mb-8">
            <Link href="/live">
              <BentoCard variant="pastel" pastelColor="peach" className="p-6 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-white/60 flex items-center justify-center overflow-hidden">
                      <Play size={24} className="text-foreground fill-foreground ml-1" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-lg font-heading text-foreground leading-tight">Live Tournament</h4>
                    <p className="text-xs text-foreground/60">Watch and participate now</p>
                  </div>
                </div>
                <motion.div 
                  whileHover={{ x: 5 }}
                  className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center"
                >
                  <ChevronRight size={20} className="text-foreground" />
                </motion.div>
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
