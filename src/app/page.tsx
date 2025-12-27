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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                whileHover={{ y: -5 }}
                className="relative h-72 rounded-[40px] overflow-hidden shadow-2xl shadow-primary/10 group cursor-pointer transition-all duration-500 border border-white/5 bg-evergreen-500"
              >
                {/* Ambient Glows */}
                <div className="absolute inset-0 overflow-hidden">
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.1, 0.2, 0.1]
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -bottom-20 -right-20 w-[400px] h-[400px] bg-malachite-500 blur-[100px] rounded-full" 
                  />
                  <div className="absolute -top-20 -left-20 w-[300px] h-[300px] bg-sea-green-500/10 blur-[80px] rounded-full" />
                </div>
                
                <div className="relative h-full p-10 flex flex-col justify-between z-10">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-2.5 h-2.5 rounded-full bg-malachite-500" />
                        <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-malachite-400 animate-ping opacity-75" />
                        <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-malachite-500/50 shadow-[0_0_15px_rgba(22,219,101,0.8)]" />
                      </div>
                      <span className="text-[10px] font-black text-malachite-400 uppercase tracking-[0.6em]">ELITE DEPLOYMENT ACTIVE</span>
                    </div>
                    
                    <div className="space-y-1">
                      <motion.h2 
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-5xl md:text-6xl font-serif text-white leading-[1.1] tracking-tight"
                      >
                        Win ₹1,00,000
                      </motion.h2>
                      <motion.h2 
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-5xl md:text-6xl font-serif text-malachite-500 leading-[1.1] tracking-tight"
                      >
                        Mega Pool
                      </motion.h2>
                    </div>
                    
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10"
                    >
                      <Users size={14} className="text-malachite-400" />
                      <span className="text-[11px] text-white/80 font-bold uppercase tracking-[0.2em]">
                        <span className="text-malachite-400">2,450</span> WARRIORS REGISTERED
                      </span>
                    </motion.div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <motion.button 
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-10 py-4 bg-malachite-500 text-white rounded-[24px] text-[12px] font-black uppercase tracking-[0.3em] shadow-[0_10px_30px_rgba(22,219,101,0.3)] hover:shadow-[0_15px_40px_rgba(22,219,101,0.4)] hover:bg-malachite-400 transition-all duration-300 relative overflow-hidden group/btn"
                    >
                      <span className="relative z-10">INITIALIZE ENTRY</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] transition-transform" />
                    </motion.button>

                    <div className="hidden sm:flex items-center gap-4 text-white/30">
                      <div className="w-12 h-[1px] bg-white/10" />
                      <span className="text-[10px] font-bold tracking-[0.3em]">SECURE COMMS</span>
                      <ShieldCheck size={16} />
                    </div>
                  </div>
                </div>
                
                <div className="absolute -right-16 -bottom-16 opacity-[0.04] text-white pointer-events-none group-hover:opacity-[0.08] transition-all duration-1000 group-hover:scale-110 group-hover:-rotate-12">
                  <Trophy size={380} strokeWidth={1} />
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
                  className="flex-shrink-0 w-36 card-premium rounded-[32px] p-6 cursor-default"
                >
                  <div className="w-10 h-10 rounded-2xl bg-accent/5 flex items-center justify-center mb-4 border border-accent/10">
                    <stat.icon size={20} className="text-accent" />
                  </div>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
                  <h4 className="text-2xl font-serif text-foreground">{stat.value}</h4>
                </motion.div>
              ))}
            </section>
    
            {/* Section Header */}
            <section className="px-8 pb-6 flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-2xl font-serif text-foreground">Active <span className="italic opacity-60">Operations</span></h2>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-accent animate-pulse" />
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">BATTLE SIGNALS DETECTED</p>
                </div>
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/matches" className="p-3.5 bg-card rounded-2xl text-muted-foreground hover:text-accent shadow-sm transition-all border border-border flex items-center gap-2 group">
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
                  <div className="absolute top-0 left-0 w-1 h-full bg-accent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  
                  <div className="relative w-24 h-24 rounded-[28px] bg-muted/50 overflow-hidden flex-shrink-0 shadow-inner border border-border group-hover:border-accent/20 transition-colors">
                     {match.status === 'live' ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center animate-pulse">
                          <Play size={24} className="text-accent translate-x-0.5" fill="currentColor" />
                        </div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity">
                        <Swords size={32} className="text-foreground" />
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1 rounded-xl bg-background/90 backdrop-blur-md border border-border flex items-center justify-center gap-1.5 shadow-sm">
                      <div className={`w-1.5 h-1.5 rounded-full ${match.status === 'live' ? 'bg-accent animate-pulse' : 'bg-muted-foreground'}`} />
                      <span className="text-[9px] font-black uppercase tracking-tighter text-foreground">{match.status}</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-2.5">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="rounded-lg bg-accent/5 border-accent/10 text-accent text-[8px] font-black uppercase tracking-widest px-2 py-0.5">
                        {match.mode}
                      </Badge>
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{match.map || 'Bermuda'}</span>
                    </div>
                    
                    <h3 className="text-xl font-serif text-foreground truncate group-hover:text-accent transition-colors">{match.title}</h3>
                    
                    <div className="flex items-center gap-5">
                      <div className="flex items-center gap-2">
                        <Trophy size={14} className="text-accent" />
                        <span className="text-[12px] font-bold text-foreground">₹{match.tournament?.prize_pool.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-muted-foreground" />
                        <span className="text-[12px] font-medium text-muted-foreground">
                          <span className="text-foreground font-bold">{match.live_stats?.players_alive || 48}</span> / {match.tournament?.slots || 100}
                        </span>
                      </div>
                    </div>
                  </div>
    
                  <div className="flex flex-col items-end justify-center gap-1.5 pl-6 border-l border-border group-hover:border-accent/10 transition-colors">
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em]">ENTRY</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[12px] font-bold text-accent">₹</span>
                      <span className="text-3xl font-serif text-accent">{match.tournament?.entry_fee}</span>
                    </div>
                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      className="w-8 h-8 rounded-xl bg-accent text-white flex items-center justify-center shadow-lg shadow-accent/20 mt-1 opacity-0 group-hover:opacity-100 transition-all duration-300"
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
