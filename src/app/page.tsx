"use client";

import { motion, AnimatePresence } from "framer-motion";
import { BottomNav } from "@/components/layout/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { 
  Trophy, Swords, ChevronRight, 
  Users, Play, TrendingUp, Award, Plus,
  Activity, LayoutGrid, Signal
} from "lucide-react";
import { StoryViewer } from "@/components/StoryViewer";
import { StoryUpload } from "@/components/StoryUpload";
import { TopHeader } from "@/components/layout/TopHeader";
import { Badge } from "@/components/ui/badge";

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
    <div className="min-h-screen bg-transparent text-foreground">
      <main className="pb-24 relative z-10">
        <TopHeader />

        {/* Stories - Mobile Optimized */}
        <section className="py-4 sm:py-6 overflow-hidden">
          <div className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar px-4 sm:px-6 items-center scroll-smooth">
            {user && (
              <div className="flex-shrink-0 flex flex-col items-center gap-2">
                <motion.div 
                  whileTap={{ scale: 0.92 }}
                  onClick={() => {
                    const myStories = stories.filter(s => s.user_id === user.id);
                    if (myStories.length > 0) openStory(user.id);
                    else setIsUploadOpen(true);
                  }}
                  className={`relative w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-[20px] sm:rounded-[24px] p-[2px] flex items-center justify-center transition-all duration-300 gpu-accelerate ${
                    stories.some(s => s.user_id === user.id) 
                      ? 'bg-gradient-to-tr from-malachite-400 to-sea-green-500 shadow-lg shadow-malachite-400/20' 
                      : 'border-2 border-dashed border-evergreen-200'
                  }`}
                >
                  <div className="w-full h-full rounded-[18px] sm:rounded-[21px] bg-background p-0.5">
                    <div className="w-full h-full rounded-[16px] sm:rounded-[19px] bg-muted flex items-center justify-center overflow-hidden">
                      {user.user_metadata?.avatar_url ? (
                        <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-lg sm:text-xl font-heading text-primary">{user.email?.[0].toUpperCase()}</span>
                      )}
                    </div>
                  </div>
                  {!stories.some(s => s.user_id === user.id) && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 bg-primary rounded-lg sm:rounded-xl border-[2px] sm:border-[3px] border-background flex items-center justify-center text-primary-foreground shadow-lg">
                      <Plus size={14} strokeWidth={4} />
                    </div>
                  )}
                </motion.div>
                <span className="text-[9px] sm:text-[10px] font-bold text-primary uppercase tracking-widest">YOU</span>
              </div>
            )}

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
                    className={`w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-[20px] sm:rounded-[24px] p-[2px] transition-all duration-300 gpu-accelerate ${
                      hasStory 
                        ? 'bg-gradient-to-tr from-malachite-400 to-sea-green-500 shadow-lg shadow-malachite-400/20' 
                        : 'bg-muted'
                    }`}
                  >
                    <div className="w-full h-full rounded-[18px] sm:rounded-[21px] bg-background p-0.5">
                      <div className="w-full h-full rounded-[16px] sm:rounded-[19px] bg-muted flex items-center justify-center overflow-hidden">
                        {profile.avatar_url ? (
                          <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg sm:text-xl font-heading text-primary">{profile.full_name?.[0].toUpperCase()}</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                  <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wide sm:tracking-widest transition-colors ${
                    hasStory ? 'text-accent' : 'text-muted-foreground'
                  }`}>
                    {profile.full_name?.split(' ')[0]?.slice(0, 6).toUpperCase()}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Hero Banner - Mobile Optimized */}
        <section className="px-4 sm:px-6 mb-6 sm:mb-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative h-52 sm:h-72 rounded-[28px] sm:rounded-[40px] overflow-hidden shadow-lg group bg-gradient-to-br from-evergreen-900 to-evergreen-800 gpu-accelerate"
          >
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-1/2 -right-1/4 w-[400px] h-[400px] bg-malachite-500/15 blur-[100px] rounded-full" />
              <div className="absolute -bottom-1/2 -left-1/4 w-[400px] h-[400px] bg-sea-green-500/15 blur-[100px] rounded-full" />
            </div>
            
            <div className="relative h-full p-5 sm:p-8 flex flex-col justify-between z-10">
              <div className="space-y-3 sm:space-y-5">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[1,2,3].map(i => (
                      <motion.div 
                        key={i}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                        className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-malachite-400" 
                      />
                    ))}
                  </div>
                  <span className="text-[8px] sm:text-[9px] font-bold text-malachite-400 uppercase tracking-[0.3em] sm:tracking-[0.5em]">LIVE NOW</span>
                </div>
                
                <div className="space-y-1">
                  <h2 className="text-3xl sm:text-5xl font-outfit font-extrabold text-white leading-none tracking-tight">
                    WIN <span className="text-transparent bg-clip-text bg-gradient-to-br from-malachite-400 via-white to-sea-green-400">₹1.00L</span>
                  </h2>
                  <h3 className="text-lg sm:text-2xl font-outfit font-light tracking-[0.1em] sm:tracking-[0.2em] uppercase text-white/60">
                    Mega <span className="font-bold text-white/90 italic">Vault</span>
                  </h3>
                </div>
                
                <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/10">
                  <div className="flex -space-x-1.5">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-black bg-evergreen-900" />
                    ))}
                  </div>
                  <span className="text-[9px] sm:text-[10px] text-white/60 font-medium uppercase tracking-wider">
                    <span className="text-malachite-400 font-bold">2.4K+</span> IN QUEUE
                  </span>
                </div>
              </div>
              
              <motion.button 
                whileTap={{ scale: 0.95 }}
                className="self-start px-6 sm:px-8 py-3 sm:py-3.5 bg-white text-black rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 haptic-tap"
              >
                ENTER ARENA
                <ChevronRight size={14} strokeWidth={3} />
              </motion.button>
            </div>
            
            <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-malachite-500/10 to-transparent pointer-events-none" />
            <div className="absolute top-4 right-4 text-white/5 pointer-events-none">
              <Activity size={120} strokeWidth={0.5} className="sm:w-[180px] sm:h-[180px]" />
            </div>
          </motion.div>
        </section>

        {/* Stats Grid - Mobile Optimized */}
        <section className="px-4 sm:px-6 mb-8 sm:mb-12">
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {[
              { label: "Wins", value: userStats.wins, icon: Trophy },
              { label: "Rank", value: userStats.rank, icon: Award },
              { label: "Growth", value: userStats.growth, icon: TrendingUp },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="mobile-card flex flex-col items-center text-center p-3 sm:p-4"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-accent/10 flex items-center justify-center mb-2 border border-accent/10">
                  <stat.icon size={16} className="text-accent sm:w-5 sm:h-5" />
                </div>
                <p className="text-[8px] sm:text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">{stat.label}</p>
                <h4 className="text-lg sm:text-xl font-outfit font-bold text-foreground">{stat.value}</h4>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Section Header - Mobile Optimized */}
        <section className="px-4 sm:px-6 pb-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-lg sm:text-xl font-outfit font-bold text-foreground">Active <span className="text-malachite-500 italic">Battles</span></h2>
            <div className="flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-malachite-500 animate-pulse" />
              <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider">LIVE SIGNALS</p>
            </div>
          </div>
          <Link href="/matches" className="p-2.5 sm:p-3 bg-card rounded-xl text-muted-foreground active:bg-muted transition-colors border border-border touch-target">
            <LayoutGrid size={18} />
          </Link>
        </section>

        {/* Match Cards - Mobile Optimized */}
        <section className="px-4 sm:px-6 space-y-3 sm:space-y-4">
          {featuredMatches.length > 0 ? featuredMatches.map((match, i) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="mobile-card p-4 sm:p-5 flex items-center gap-4 sm:gap-5"
            >
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-muted/50 overflow-hidden flex-shrink-0 border border-border">
                {match.status === 'live' ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-malachite-500/15 flex items-center justify-center animate-pulse">
                      <Play size={16} className="text-malachite-500 translate-x-0.5 sm:w-5 sm:h-5" fill="currentColor" />
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center opacity-20">
                    <Swords size={20} className="text-foreground sm:w-6 sm:h-6" />
                  </div>
                )}
                <div className="absolute bottom-1 left-1 right-1 px-1.5 py-0.5 rounded-md bg-background/90 backdrop-blur border border-border flex items-center justify-center gap-1">
                  <div className={`w-1 h-1 rounded-full ${match.status === 'live' ? 'bg-malachite-500 animate-pulse' : 'bg-muted-foreground'}`} />
                  <span className="text-[7px] sm:text-[8px] font-bold uppercase text-foreground">{match.status}</span>
                </div>
              </div>
              
              <div className="flex-1 min-w-0 space-y-1 sm:space-y-1.5">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="rounded-md bg-malachite-500/10 border-malachite-500/15 text-malachite-500 text-[7px] sm:text-[8px] font-bold uppercase px-1.5 py-0">
                    {match.mode}
                  </Badge>
                  <span className="text-[8px] sm:text-[9px] font-bold text-muted-foreground uppercase tracking-wide">{match.map || 'Bermuda'}</span>
                </div>
                
                <h3 className="text-sm sm:text-base font-outfit font-semibold text-foreground truncate">{match.title}</h3>
                
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-1">
                    <Trophy size={11} className="text-malachite-500 sm:w-3 sm:h-3" />
                    <span className="text-[10px] sm:text-[11px] font-bold text-foreground">₹{match.tournament?.prize_pool.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={11} className="text-muted-foreground sm:w-3 sm:h-3" />
                    <span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground">
                      <span className="text-foreground font-bold">{match.live_stats?.players_alive || 48}</span>/{match.tournament?.slots || 100}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end justify-center gap-1 pl-3 sm:pl-4 border-l border-border">
                <span className="text-[7px] sm:text-[8px] font-bold text-muted-foreground uppercase tracking-wider">ENTRY</span>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-[10px] sm:text-[11px] font-bold text-malachite-500">₹</span>
                  <span className="text-xl sm:text-2xl font-outfit font-bold text-malachite-500">{match.tournament?.entry_fee}</span>
                </div>
              </div>
            </motion.div>
          )) : (
            <div className="py-16 text-center flex flex-col items-center gap-3 bg-muted/50 rounded-[24px] border border-dashed border-border">
              <Signal size={36} strokeWidth={1} className="text-muted-foreground/30" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Scanning for signals...</p>
            </div>
          )}
        </section>
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
