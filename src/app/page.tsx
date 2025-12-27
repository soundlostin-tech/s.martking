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
    <div className="min-h-screen bg-background text-foreground">
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
                      : 'border-2 border-dashed border-evergreen-700 hover:border-evergreen-600'
                  }`}
                >
                  <div className="w-full h-full rounded-[21px] bg-background p-0.5">
                    <div className="w-full h-full rounded-[19px] bg-evergreen-900 flex items-center justify-center overflow-hidden">
                      {user.user_metadata?.avatar_url ? (
                        <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl font-heading text-evergreen-400">{user.email?.[0].toUpperCase()}</span>
                      )}
                    </div>
                  </div>
                  {!stories.some(s => s.user_id === user.id) && (
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-malachite-500 rounded-xl border-[3px] border-background flex items-center justify-center text-evergreen-950 shadow-xl">
                      <Plus size={16} strokeWidth={4} />
                    </div>
                  )}
                </motion.div>
                <span className="text-[10px] font-bold text-evergreen-500 uppercase tracking-widest">YOU</span>
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
                        : 'bg-evergreen-900'
                    }`}
                  >
                      <div className="w-full h-full rounded-[21px] bg-background p-0.5">
                        <div className="w-full h-full rounded-[19px] bg-evergreen-800 flex items-center justify-center overflow-hidden">
                          {profile.avatar_url ? (
                            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xl font-heading text-evergreen-400">{profile.full_name?.[0].toUpperCase()}</span>
                          )}
                        </div>
                      </div>
                  </motion.div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${
                    hasStory ? 'text-sea-green-500' : 'text-evergreen-600'
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
          <div className="relative h-56 rounded-[40px] overflow-hidden shadow-xl shadow-malachite-500/5 group cursor-pointer active:scale-[0.98] transition-all duration-500 border border-evergreen-800">
            <div className="absolute inset-0 bg-evergreen-950 group-hover:bg-evergreen-900 transition-colors duration-700" />
            
            {/* Ambient FX */}
            <div className="absolute inset-0 overflow-hidden opacity-60">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 90, 0],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{ duration: 15, repeat: Infinity }}
                className="absolute -top-20 -left-20 w-64 h-64 bg-malachite-500/10 blur-[80px] rounded-full"
              />
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  x: [0, -50, 0],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{ duration: 12, repeat: Infinity }}
                className="absolute -bottom-20 -right-20 w-80 h-80 bg-sea-green-500/30 blur-[100px] rounded-full"
              />
            </div>
            
            <div className="relative h-full p-10 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-2 h-2 rounded-full bg-malachite-400 animate-pulse" />
                <span className="text-[10px] font-bold text-malachite-400 uppercase tracking-[0.4em]">ELITE DEPLOYMENT ACTIVE</span>
              </div>
              <h2 className="text-4xl font-heading text-white leading-[1.1] tracking-tight">Win ₹1,00,000<br/><span className="text-malachite-500">Mega Pool</span></h2>
              <p className="text-[11px] text-evergreen-200 font-bold uppercase tracking-[0.2em] mt-4 flex items-center gap-2">
                <Users size={14} className="text-malachite-500" /> 2,450 WARRIORS REGISTERED
              </p>
              
              <div className="mt-8 flex items-center gap-4">
                <button className="px-8 py-3.5 bg-malachite-500 text-evergreen-950 rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] shadow-xl shadow-malachite-500/20 hover:bg-malachite-400 transition-all">
                  INITIALIZE ENTRY
                </button>
                <div className="flex -space-x-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-4 border-evergreen-950 bg-evergreen-800 overflow-hidden shadow-sm">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+50}`} alt="" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="absolute right-10 top-1/2 -translate-y-1/2 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity text-malachite-500">
              <Trophy size={160} strokeWidth={1} />
            </div>
          </div>
        </section>

        {/* Live Performance Matrix */}
        <section className="px-6 mb-12 overflow-x-auto no-scrollbar flex gap-5">
          {[
            { label: "Elite Wins", value: userStats.wins, icon: Trophy, color: "malachite" },
            { label: "Global Rank", value: userStats.rank, icon: Zap, color: "malachite" },
            { label: "Engagement", value: userStats.growth, icon: TrendingUp, color: "malachite" },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="flex-shrink-0 w-36 bg-card rounded-[32px] p-6 border border-border shadow-sm"
            >
              <div className="w-10 h-10 rounded-2xl bg-malachite-500/10 flex items-center justify-center mb-4">
                <stat.icon size={20} className="text-malachite-400" />
              </div>
              <p className="text-[9px] font-bold text-evergreen-500 uppercase tracking-widest mb-1">{stat.label}</p>
              <h4 className="text-2xl font-heading text-white">{stat.value}</h4>
            </motion.div>
          ))}
        </section>

        {/* Section Header */}
        <section className="px-8 pb-6 flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-heading text-white">Active <span className="italic font-serif opacity-60">Operations</span></h2>
            <p className="text-[10px] font-bold text-evergreen-500 uppercase tracking-[0.3em]">BATTLE SIGNALS DETECTED</p>
          </div>
          <Link href="/matches" className="p-3 bg-card rounded-2xl text-evergreen-400 hover:text-malachite-400 shadow-sm transition-all border border-border">
            <LayoutGrid size={20} />
          </Link>
        </section>

        {/* Match Command Grid */}
        <section className="px-6 space-y-5">
          {featuredMatches.length > 0 ? featuredMatches.map((match, i) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.97 }}
              className="bg-card rounded-[32px] p-6 border border-border shadow-sm hover:border-malachite-400/30 transition-all duration-500 group flex items-center gap-6"
            >
              <div className="relative w-24 h-24 rounded-3xl bg-evergreen-800 overflow-hidden flex-shrink-0 shadow-inner">
                 {match.status === 'live' ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-malachite-500/20 flex items-center justify-center animate-pulse">
                      <Play size={24} className="text-malachite-400 translate-x-0.5" fill="currentColor" />
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center opacity-10">
                    <Swords size={32} className="text-white" />
                  </div>
                )}
                <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded-xl bg-black/60 backdrop-blur-md border border-evergreen-700 flex items-center justify-center gap-1.5">
                  <div className={`w-1 h-1 rounded-full ${match.status === 'live' ? 'bg-malachite-500 animate-pulse' : 'bg-evergreen-400'}`} />
                  <span className="text-[8px] font-bold uppercase tracking-tighter text-white">{match.status}</span>
                </div>
              </div>
              
              <div className="flex-1 min-w-0 space-y-2">
                <p className="text-[10px] font-bold text-evergreen-500 uppercase tracking-[0.2em]">{match.mode} • {match.map || 'Bermuda'}</p>
                <h3 className="text-xl font-heading text-white truncate group-hover:text-malachite-400 transition-colors">{match.title}</h3>
                
                <div className="flex items-center gap-5 pt-1">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-lg bg-malachite-500/10 flex items-center justify-center">
                      <Trophy size={12} className="text-malachite-400" />
                    </div>
                    <span className="text-[11px] font-bold text-white">₹{match.tournament?.prize_pool.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-lg bg-evergreen-800 flex items-center justify-center">
                      <Users size={12} className="text-evergreen-400" />
                    </div>
                    <span className="text-[11px] font-bold text-evergreen-400">{match.live_stats?.players_alive || 48} / {match.tournament?.slots || 100}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end justify-center gap-1 pl-4 border-l border-evergreen-800">
                <span className="text-[9px] font-bold text-evergreen-500 uppercase tracking-[0.3em]">ENTRY</span>
                <span className="text-2xl font-heading text-malachite-400">₹{match.tournament?.entry_fee}</span>
              </div>
            </motion.div>
          )) : (
            <div className="py-20 text-center flex flex-col items-center gap-4 bg-evergreen-900/20 rounded-[40px] border border-dashed border-evergreen-800 shadow-sm">
              <Signal size={48} strokeWidth={1} className="text-evergreen-800" />
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-evergreen-700 italic">Scanning for Battle Signals...</p>
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
      
      {/* Visual background glows */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0 opacity-30">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-malachite-400/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-sea-green-500/15 blur-[120px] rounded-full" />
      </div>
    </div>
  );
}
