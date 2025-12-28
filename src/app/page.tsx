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
    <div className="min-h-screen bg-[#D4D7DE] text-[#11130D]">
      <main className="pb-28 relative z-10">
        <TopHeader />

        {/* Greeting Section with Pastel Blob */}
        <section className="relative px-4 sm:px-6 pt-6 pb-4 blob-header blob-header-yellow">
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-[#4A4B48] uppercase tracking-[0.2em] mb-1">
              {user ? `Hello, ${user.user_metadata?.full_name?.split(' ')[0] || 'Warrior'}` : 'Welcome back'}
            </p>
            <h2 className="text-2xl sm:text-3xl font-heading text-[#11130D]">
              Ready for today's <span className="text-[#868935]">matches?</span>
            </h2>
          </div>
        </section>

        {/* Stories Row */}
        <section className="py-4 overflow-hidden">
          <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 sm:px-6 items-start">
            {/* Arena Official Story */}
            <div className="flex-shrink-0 flex flex-col items-center gap-2">
              <motion.div 
                whileTap={{ scale: 0.92 }}
                className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full p-[3px] bg-gradient-to-tr from-[#D7FD03] to-[#C7E323]"
              >
                <div className="w-full h-full rounded-full bg-white p-0.5">
                  <div className="w-full h-full rounded-full bg-[#D7FD03] flex items-center justify-center overflow-hidden">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#11130D" strokeWidth="2" className="w-7 h-7">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                  </div>
                </div>
              </motion.div>
              <span className="text-[9px] font-bold text-[#868935] uppercase tracking-wide">Arena</span>
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
                  className={`relative w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full p-[3px] ${
                    stories.some(s => s.user_id === user.id) 
                      ? 'bg-gradient-to-tr from-[#D7FD03] to-[#C7E323]' 
                      : 'border-2 border-dashed border-[#C8C8C4]'
                  }`}
                >
                  <div className="w-full h-full rounded-full bg-white p-0.5">
                    <div className="w-full h-full rounded-full bg-[#E8E9EC] flex items-center justify-center overflow-hidden">
                      {user.user_metadata?.avatar_url ? (
                        <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-lg font-heading text-[#4A4B48]">{user.email?.[0].toUpperCase()}</span>
                      )}
                    </div>
                  </div>
                  {!stories.some(s => s.user_id === user.id) && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#D7FD03] rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                      <Plus size={14} strokeWidth={3} className="text-[#11130D]" />
                    </div>
                  )}
                </motion.div>
                <span className="text-[9px] font-bold text-[#4A4B48] uppercase tracking-wide">You</span>
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
                    className={`w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full p-[3px] ${
                      hasStory 
                        ? 'bg-gradient-to-tr from-[#D7FD03] to-[#C7E323]' 
                        : 'bg-[#C8C8C4]/50'
                    }`}
                  >
                    <div className="w-full h-full rounded-full bg-white p-0.5">
                      <div className="w-full h-full rounded-full bg-[#E8E9EC] flex items-center justify-center overflow-hidden">
                        {profile.avatar_url ? (
                          <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg font-heading text-[#4A4B48]">{profile.full_name?.[0]?.toUpperCase()}</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                  <span className={`text-[9px] font-bold uppercase tracking-wide ${
                    hasStory ? 'text-[#868935]' : 'text-[#4A4B48]'
                  }`}>
                    {profile.full_name?.split(' ')[0]?.slice(0, 6)}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Featured Tournament Hero Card */}
        {featuredMatches[0] && (
          <section className="px-4 sm:px-6 mb-6">
            <BentoCard variant="hero" pastelColor="yellow" className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <StatusBadge variant={featuredMatches[0].status === 'live' ? 'live' : 'upcoming'} />
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold text-[#4A4B48] uppercase tracking-wide">Prize Pool</p>
                  <p className="text-xl font-heading text-[#11130D]">₹{featuredMatches[0].tournament?.prize_pool?.toLocaleString()}</p>
                </div>
              </div>
              
              <h3 className="text-xl sm:text-2xl font-heading text-[#11130D] mb-2">{featuredMatches[0].title}</h3>
              <p className="text-[11px] text-[#4A4B48] font-medium mb-4">{featuredMatches[0].tournament?.title}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-[#868935]" />
                    <span className="text-[11px] font-bold text-[#4A4B48]">
                      {featuredMatches[0].start_time 
                        ? new Date(featuredMatches[0].start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'TBD'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users size={14} className="text-[#868935]" />
                    <span className="text-[11px] font-bold text-[#4A4B48]">{featuredMatches[0].mode}</span>
                  </div>
                </div>
                <Link href={`/matches`}>
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    className="px-5 py-2.5 bg-[#D7FD03] text-[#11130D] rounded-xl text-[11px] font-bold uppercase tracking-wide shadow-lg shadow-[#D7FD03]/30 flex items-center gap-1"
                  >
                    Join Now <ChevronRight size={14} />
                  </motion.button>
                </Link>
              </div>
            </BentoCard>
          </section>
        )}

        {/* Quick Actions */}
        <section className="px-4 sm:px-6 mb-6">
          <div className="grid grid-cols-3 gap-3">
            <Link href="/matches">
              <BentoCard className="p-4 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-xl bg-[#D7FD03]/20 flex items-center justify-center mb-2">
                  <Zap size={18} className="text-[#868935]" />
                </div>
                <span className="text-[10px] font-bold text-[#11130D] uppercase tracking-wide">Join Match</span>
              </BentoCard>
            </Link>
            <Link href="/wallet">
              <BentoCard className="p-4 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-xl bg-[#C7F5E3]/50 flex items-center justify-center mb-2">
                  <Wallet size={18} className="text-[#868935]" />
                </div>
                <span className="text-[10px] font-bold text-[#11130D] uppercase tracking-wide">Add Funds</span>
              </BentoCard>
            </Link>
            <Link href="/matches">
              <BentoCard className="p-4 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-xl bg-[#F5D4C7]/50 flex items-center justify-center mb-2">
                  <Trophy size={18} className="text-[#868935]" />
                </div>
                <span className="text-[10px] font-bold text-[#11130D] uppercase tracking-wide">My Entries</span>
              </BentoCard>
            </Link>
          </div>
        </section>

        {/* Performance Stats */}
        <section className="px-4 sm:px-6 mb-6">
          <BentoCard className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-heading text-[#11130D]">My Performance</h3>
              <Link href="/leaderboard" className="text-[10px] font-bold text-[#868935] uppercase tracking-wide flex items-center gap-1">
                Leaderboard <ChevronRight size={12} />
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Wins", value: userStats.wins, icon: Trophy },
                { label: "Rank", value: userStats.rank, icon: Award },
                { label: "Growth", value: userStats.growth, icon: TrendingUp },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="w-10 h-10 rounded-xl bg-[#E8E9EC] flex items-center justify-center mx-auto mb-2">
                    <stat.icon size={18} className="text-[#868935]" />
                  </div>
                  <p className="text-lg font-heading text-[#11130D]">{stat.value}</p>
                  <p className="text-[9px] font-bold text-[#4A4B48] uppercase tracking-wide">{stat.label}</p>
                </div>
              ))}
            </div>
          </BentoCard>
        </section>

        {/* Upcoming Tournaments */}
        <section className="px-4 sm:px-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-heading text-[#11130D]">Upcoming Matches</h3>
            <Link href="/matches" className="text-[10px] font-bold text-[#868935] uppercase tracking-wide flex items-center gap-1">
              View All <ChevronRight size={12} />
            </Link>
          </div>
          
          <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4">
            {featuredMatches.slice(1, 5).map((match, i) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex-shrink-0 w-64"
              >
                <BentoCard className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <StatusBadge variant={match.status === 'live' ? 'live' : 'upcoming'} />
                    <span className="text-[10px] font-bold text-[#4A4B48]">{match.mode}</span>
                  </div>
                  <h4 className="text-sm font-heading text-[#11130D] mb-1 truncate">{match.title}</h4>
                  <p className="text-[10px] text-[#4A4B48] mb-3">{match.tournament?.title}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Trophy size={12} className="text-[#868935]" />
                      <span className="text-[11px] font-bold text-[#11130D]">₹{match.tournament?.prize_pool?.toLocaleString()}</span>
                    </div>
                    <span className="text-[10px] font-bold text-[#868935]">₹{match.tournament?.entry_fee}</span>
                  </div>
                </BentoCard>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Live Now Card */}
        {featuredMatches.some(m => m.status === 'live') && (
          <section className="px-4 sm:px-6 mb-6">
            <Link href="/live">
              <BentoCard variant="pastel" pastelColor="mint" className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#D7FD03] flex items-center justify-center">
                      <Play size={20} className="text-[#11130D] translate-x-0.5" fill="currentColor" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge variant="live" />
                      </div>
                      <p className="text-[11px] font-bold text-[#4A4B48]">Tournament in progress</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-[#4A4B48]" />
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
