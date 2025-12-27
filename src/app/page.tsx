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
  Sparkles, Timer, Zap, Map as MapIcon,
  Activity, Star, IndianRupee, Bell,
  Search, ShieldCheck, LayoutGrid, Signal
} from "lucide-react";
import { StoryViewer } from "@/components/StoryViewer";
import { StoryUpload } from "@/components/StoryUpload";
import { TopHeader } from "@/components/layout/TopHeader";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

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
        <main className="pb-32 relative z-10">
          <TopHeader />
  
          {/* Stories - Cinematic Native Pattern */}
          <section className="py-8 overflow-hidden">
            <div className="flex gap-5 overflow-x-auto no-scrollbar px-6 items-center">
              {user && (
                <div className="flex-shrink-0 flex flex-col items-center gap-3">
                  <motion.div 
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      const myStories = stories.filter(s => s.user_id === user.id);
                      if (myStories.length > 0) openStory(user.id);
                      else setIsUploadOpen(true);
                    }}
                    className={`relative w-[72px] h-[72px] rounded-[24px] p-[2.5px] flex items-center justify-center transition-all duration-500 ${
                      stories.some(s => s.user_id === user.id) 
                        ? 'bg-gradient-to-tr from-malachite-400 to-sea-green-500 shadow-lg shadow-malachite-400/20' 
                        : 'border-2 border-dashed border-evergreen-200 hover:border-evergreen-300'
                    }`}
                  >
                      <div className="w-full h-full rounded-[21px] bg-background p-0.5">
                        <div className="w-full h-full rounded-[19px] bg-muted flex items-center justify-center overflow-hidden">
                          {user.user_metadata?.avatar_url ? (
                            <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xl font-heading text-primary">{user.email?.[0].toUpperCase()}</span>
                          )}
                        </div>
                      </div>
                      {!stories.some(s => s.user_id === user.id) && (
                        <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-xl border-[3px] border-background flex items-center justify-center text-primary-foreground shadow-xl">
                          <Plus size={16} strokeWidth={4} />
                        </div>
                      )}
                    </motion.div>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">YOU</span>
                  </div>
                )}
    
                {profiles.filter(p => p.id !== user?.id).map((profile) => {
                  const hasStory = stories.some(s => s.user_id === profile.id);
                  return (
                    <div 
                      key={profile.id}
                      onClick={() => hasStory && openStory(profile.id)}
                      className="flex-shrink-0 flex flex-col items-center gap-3"
                    >
                      <motion.div 
                        whileTap={{ scale: 0.9 }}
                        className={`w-[72px] h-[72px] rounded-[24px] p-[2.5px] transition-all duration-500 ${
                          hasStory 
                            ? 'bg-gradient-to-tr from-malachite-400 to-sea-green-500 shadow-lg shadow-malachite-400/20' 
                            : 'bg-muted'
                        }`}
                      >
                          <div className="w-full h-full rounded-[21px] bg-background p-0.5">
                            <div className="w-full h-full rounded-[19px] bg-muted flex items-center justify-center overflow-hidden">
                              {profile.avatar_url ? (
                                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-xl font-heading text-primary">{profile.full_name?.[0].toUpperCase()}</span>
                              )}
                            </div>
                          </div>
                      </motion.div>
                      <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${
                        hasStory ? 'text-accent' : 'text-muted-foreground'
                      }`}>
                        {profile.full_name?.split(' ')[0].toUpperCase()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
    
            {/* Dynamic Hero Banner */}
            <section className="px-6 mb-10">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -6, rotateY: 2, rotateX: 2 }}
                style={{ perspective: "1000px" }}
                className="relative h-72 rounded-[48px] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.4)] group cursor-pointer transition-all duration-700 border border-white/5 bg-gradient-to-br from-evergreen-900 to-evergreen-800"
              >
                {/* Forest-Elite Ambient Glows */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.5, 1],
                      opacity: [0.1, 0.2, 0.1],
                      rotate: [0, 45, 0]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-1/2 -right-1/4 w-[600px] h-[600px] bg-malachite-500/20 blur-[150px] rounded-full" 
                  />
                  <motion.div 
                    animate={{ 
                      scale: [1.2, 1, 1.2],
                      opacity: [0.05, 0.15, 0.05],
                      rotate: [0, -45, 0]
                    }}
                    transition={{ duration: 18, repeat: Infinity, ease: "linear", delay: 2 }}
                    className="absolute -bottom-1/2 -left-1/4 w-[600px] h-[600px] bg-sea-green-500/20 blur-[150px] rounded-full" 
                  />
                  {/* Scanning Grid Line */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />
                </div>
                
                <div className="relative h-full p-7 md:p-12 flex flex-col justify-between z-10">
                  <div className="space-y-4 md:space-y-7">
                    <motion.div 
                      initial={{ opacity: 0, letterSpacing: "1em" }}
                      animate={{ opacity: 1, letterSpacing: "0.5em" }}
                      transition={{ delay: 0.4, duration: 1.5 }}
                      className="flex items-center gap-3"
                    >
                      <div className="flex gap-1">
                        {[1,2,3].map(i => (
                          <motion.div 
                            key={i}
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                            className="w-1.5 h-1.5 rounded-full bg-malachite-400" 
                          />
                        ))}
                      </div>
                      <span className="text-[9px] font-black text-malachite-400 uppercase tracking-[0.5em] drop-shadow-[0_0_8px_rgba(22,219,101,0.5)]">NEURAL NET ACTIVE</span>
                    </motion.div>
                    
                    <div className="space-y-2">
                      <motion.h2 
                        initial={{ x: -30, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="text-4xl md:text-7xl font-outfit font-extrabold text-white leading-[0.9] tracking-tighter"
                      >
                        WIN <span className="text-transparent bg-clip-text bg-gradient-to-br from-malachite-400 via-white to-sea-green-400 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">₹1.00L</span>
                      </motion.h2>
                      <motion.h2 
                        initial={{ x: -30, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                        className="text-2xl md:text-4xl font-outfit font-light tracking-[0.2em] uppercase text-white/40"
                      >
                        Mega <span className="font-black text-white/80 italic">Vault</span>
                      </motion.h2>
                    </div>
                    
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.3)]"
                    >
                      <div className="flex -space-x-2">
                        {[1,2,3].map(i => (
                          <div key={i} className="w-5 h-5 rounded-full border border-black bg-evergreen-900" />
                        ))}
                      </div>
                      <span className="text-[10px] text-white/60 font-medium uppercase tracking-widest">
                        <span className="text-malachite-400 font-bold">2.4K+</span> WARRIORS IN QUEUE
                      </span>
                    </motion.div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <motion.button 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                      className="group/btn relative px-10 py-4 bg-white text-black rounded-full text-[12px] font-black uppercase tracking-[0.3em] overflow-hidden"
                    >
                      <span className="relative z-20 flex items-center gap-2">
                        ENTER ARENA
                        <ChevronRight size={18} strokeWidth={3} className="group-hover/btn:translate-x-1 transition-transform" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-malachite-400 to-sea-green-500 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                      <div className="absolute inset-0 bg-white group-hover/btn:scale-x-0 transition-transform origin-left duration-500" />
                    </motion.button>

                    <div className="hidden sm:flex flex-col items-end gap-1 opacity-40 group-hover:opacity-80 transition-opacity">
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(i => <div key={i} className="w-1 h-4 bg-white/20 rounded-full" />)}
                      </div>
                      <span className="text-[8px] font-bold tracking-[0.5em] text-white uppercase">Sync Status</span>
                    </div>
                  </div>
                </div>
                
                {/* Tech Decoration */}
                <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-malachite-500/5 to-transparent pointer-events-none" />
                <div className="absolute top-8 right-8 text-white/5 pointer-events-none group-hover:text-malachite-500/10 transition-colors duration-1000">
                  <Activity size={240} strokeWidth={0.5} />
                </div>
              </motion.div>
            </section>
    
            {/* Live Performance Matrix */}
            <section className="px-6 mb-12 overflow-x-auto no-scrollbar flex gap-5">
              {[
                { label: "Elite Wins", value: userStats.wins, icon: Trophy, color: "accent" },
                { label: "Global Rank", value: userStats.rank, icon: Zap, color: "accent" },
                { label: "Engagement", value: userStats.growth, icon: TrendingUp, color: "accent" },
              ].map((stat, i) => (
                  <motion.div 
                  key={i}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 + 0.6 }}
                  whileHover={{ y: -4, backgroundColor: "var(--muted)" }}
                  className="flex-shrink-0 w-32 md:w-36 card-premium rounded-[28px] md:rounded-[32px] p-4 md:p-6 cursor-default"
                >
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-accent/5 flex items-center justify-center mb-3 md:mb-4 border border-accent/10">
                    <stat.icon size={16} className="text-accent md:size-[20px]" />
                  </div>
                  <p className="text-[8px] md:text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
                  <h4 className="text-xl md:text-2xl font-outfit font-black text-foreground">{stat.value}</h4>
                </motion.div>
              ))}
            </section>
    
            {/* Section Header */}
            <section className="px-8 pb-6 flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-2xl font-outfit font-black text-foreground uppercase tracking-tight">Active <span className="text-malachite-500 italic">Operations</span></h2>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-malachite-500 animate-pulse" />
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">BATTLE SIGNALS DETECTED</p>
                </div>
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/matches" className="p-3.5 bg-card rounded-2xl text-muted-foreground hover:text-malachite-500 shadow-sm transition-all border border-border flex items-center gap-2 group">
                  <LayoutGrid size={20} />
                  <span className="text-[10px] font-black uppercase tracking-widest overflow-hidden w-0 group-hover:w-16 transition-all duration-300">BROWSE</span>
                </Link>
              </motion.div>
            </section>
    
            {/* Match Command Grid */}
            <section className="px-6 space-y-4">
              {featuredMatches.length > 0 ? featuredMatches.map((match, i) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ x: 8 }}
                  className="card-premium rounded-[32px] p-5 group flex items-center gap-6 cursor-pointer relative overflow-hidden"
                >
                  {/* Card Background Accent */}
                  <div className="absolute top-0 left-0 w-1 h-full bg-malachite-500 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  
                  <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-[24px] md:rounded-[28px] bg-muted/50 overflow-hidden flex-shrink-0 shadow-inner border border-border group-hover:border-malachite-500/20 transition-colors">
                     {match.status === 'live' ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-malachite-500/10 flex items-center justify-center animate-pulse">
                          <Play size={20} className="text-malachite-500 translate-x-0.5 md:size-[24px]" fill="currentColor" />
                        </div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity">
                        <Swords size={24} className="text-foreground md:size-[32px]" />
                      </div>
                    )}
                    <div className="absolute bottom-1.5 left-1.5 right-1.5 md:bottom-2 md:left-2 md:right-2 px-2 md:px-2.5 py-0.5 md:py-1 rounded-lg md:rounded-xl bg-background/90 backdrop-blur-md border border-border flex items-center justify-center gap-1 md:gap-1.5 shadow-sm">
                      <div className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full ${match.status === 'live' ? 'bg-malachite-500 animate-pulse' : 'bg-muted-foreground'}`} />
                      <span className="text-[8px] md:text-[9px] font-black uppercase tracking-tighter text-foreground">{match.status}</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-1.5 md:space-y-2.5">
                    <div className="flex items-center gap-2 md:gap-3">
                      <Badge variant="outline" className="rounded-md md:rounded-lg bg-malachite-500/5 border-malachite-500/10 text-malachite-500 text-[7px] md:text-[8px] font-black uppercase tracking-widest px-1.5 md:px-2 py-0 md:py-0.5">
                        {match.mode}
                      </Badge>
                      <span className="text-[8px] md:text-[9px] font-bold text-muted-foreground uppercase tracking-[0.15em] md:tracking-[0.2em]">{match.map || 'Bermuda'}</span>
                    </div>
                    
                    <h3 className="text-lg md:text-xl font-outfit font-bold text-foreground truncate group-hover:text-malachite-500 transition-colors">{match.title}</h3>
                    
                    <div className="flex items-center gap-3 md:gap-5">
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <Trophy size={12} className="text-malachite-500 md:size-[14px]" />
                        <span className="text-[11px] md:text-[12px] font-bold text-foreground">₹{match.tournament?.prize_pool.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <Users size={12} className="text-muted-foreground md:size-[14px]" />
                        <span className="text-[11px] md:text-[12px] font-medium text-muted-foreground">
                          <span className="text-foreground font-bold">{match.live_stats?.players_alive || 48}</span> / {match.tournament?.slots || 100}
                        </span>
                      </div>
                    </div>
                  </div>
    
                  <div className="flex flex-col items-end justify-center gap-1 md:gap-1.5 pl-4 md:pl-6 border-l border-border group-hover:border-malachite-500/10 transition-colors">
                    <span className="text-[8px] md:text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] md:tracking-[0.3em]">ENTRY</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[11px] md:text-[12px] font-bold text-malachite-500">₹</span>
                      <span className="text-2xl md:text-3xl font-outfit font-black text-malachite-500">{match.tournament?.entry_fee}</span>
                    </div>
                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      className="w-8 h-8 rounded-xl bg-malachite-500 text-white flex items-center justify-center shadow-lg shadow-malachite-500/20 mt-1 opacity-0 group-hover:opacity-100 transition-all duration-300"
                    >
                      <ChevronRight size={18} />
                    </motion.div>
                  </div>
                </motion.div>
              )) : (
                <div className="py-20 text-center flex flex-col items-center gap-4 bg-muted rounded-[40px] border border-dashed border-border shadow-sm">
                  <Signal size={48} strokeWidth={1} className="text-muted-foreground/30" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground italic">Scanning for Battle Signals...</p>
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
      
      {/* Visual background glows - disabled for pure white look */}
      {/* <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0 opacity-30">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-malachite-400/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-sea-green-500/15 blur-[120px] rounded-full" />
      </div> */}
    </div>
  );
}
