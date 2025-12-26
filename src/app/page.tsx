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
            rank: "#42", // Placeholder for actual rank calculation
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
    <div className="min-h-screen bg-dark-slate-grey bg-[radial-gradient(circle_at_50%_0%,_#2d4d43_0%,_#243e36_100%)] text-white">
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
                      ? 'bg-gradient-to-tr from-muted-teal to-accent shadow-lg shadow-muted-teal/20' 
                      : 'border-2 border-dashed border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="w-full h-full rounded-[21px] bg-[#243e36] p-0.5">
                    <div className="w-full h-full rounded-[19px] bg-white/5 flex items-center justify-center overflow-hidden">
                      {user.user_metadata?.avatar_url ? (
                        <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl font-heading text-white/20">{user.email?.[0].toUpperCase()}</span>
                      )}
                    </div>
                  </div>
                  {!stories.some(s => s.user_id === user.id) && (
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-muted-teal rounded-xl border-[3px] border-[#243e36] flex items-center justify-center text-white shadow-xl">
                      <Plus size={16} strokeWidth={4} />
                    </div>
                  )}
                </motion.div>
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">YOU</span>
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
                        ? 'bg-gradient-to-tr from-muted-teal to-accent shadow-lg shadow-muted-teal/20' 
                        : 'bg-white/5'
                    }`}
                  >
                      <div className="w-full h-full rounded-[21px] bg-[#243e36] p-0.5">
                        <div className="w-full h-full rounded-[19px] bg-white/5 flex items-center justify-center overflow-hidden">
                          {profile.avatar_url ? (
                            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xl font-heading text-white/10">{profile.full_name?.[0].toUpperCase()}</span>
                          )}
                        </div>
                      </div>
                  </motion.div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${
                    hasStory ? 'text-white' : 'text-white/20'
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
          <div className="relative h-56 rounded-[40px] overflow-hidden shadow-2xl shadow-black/40 group cursor-pointer active:scale-[0.98] transition-all duration-500">
            <div className="absolute inset-0 bg-[#2d4d43] group-hover:bg-[#345a4f] transition-colors duration-700" />
            
            {/* Ambient FX */}
            <div className="absolute inset-0 overflow-hidden opacity-60">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 90, 0],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{ duration: 15, repeat: Infinity }}
                className="absolute -top-20 -left-20 w-64 h-64 bg-muted-teal/20 blur-[80px] rounded-full"
              />
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  x: [0, -50, 0],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{ duration: 12, repeat: Infinity }}
                className="absolute -bottom-20 -right-20 w-80 h-80 bg-accent/20 blur-[100px] rounded-full"
              />
            </div>
            
            <div className="relative h-full p-10 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-2 h-2 rounded-full bg-muted-teal animate-pulse" />
                <span className="text-[10px] font-bold text-muted-teal uppercase tracking-[0.4em]">ELITE DEPLOYMENT ACTIVE</span>
              </div>
              <h2 className="text-4xl font-heading text-white leading-[1.1] tracking-tight">Win ₹1,00,000<br/>Mega Pool</h2>
              <p className="text-[11px] text-white/40 font-bold uppercase tracking-[0.2em] mt-4 flex items-center gap-2">
                <Users size={14} className="text-muted-teal" /> 2,450 WARRIORS REGISTERED
              </p>
              
              <div className="mt-8 flex items-center gap-4">
                <button className="px-8 py-3.5 bg-muted-teal text-white rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] shadow-2xl shadow-muted-teal/30 hover:bg-muted-teal/80 transition-all">
                  INITIALIZE ENTRY
                </button>
                <div className="flex -space-x-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-4 border-[#2d4d43] bg-white/10 overflow-hidden shadow-xl">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+50}`} alt="" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="absolute right-10 top-1/2 -translate-y-1/2 opacity-10 group-hover:opacity-20 transition-opacity">
              <Trophy size={160} strokeWidth={1} />
            </div>
          </div>
        </section>

        {/* Live Performance Matrix */}
        <section className="px-6 mb-12 overflow-x-auto no-scrollbar flex gap-5">
          {[
            { label: "Elite Wins", value: userStats.wins, icon: Trophy, color: "muted-teal" },
            { label: "Global Rank", value: userStats.rank, icon: Zap, color: "accent" },
            { label: "Engagement", value: userStats.growth, icon: TrendingUp, color: "muted-teal" },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="flex-shrink-0 w-36 bg-white/5 backdrop-blur-xl rounded-[32px] p-6 border border-white/10 shadow-2xl"
            >
              <div className={`w-10 h-10 rounded-2xl bg-${stat.color}/10 flex items-center justify-center mb-4`}>
                <stat.icon size={20} className={`text-${stat.color}`} />
              </div>
              <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1">{stat.label}</p>
              <h4 className="text-2xl font-heading text-white">{stat.value}</h4>
            </motion.div>
          ))}
        </section>

        {/* Section Header */}
        <section className="px-8 pb-6 flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-heading text-white">Active <span className="italic font-serif opacity-60">Operations</span></h2>
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">BATTLE SIGNALS DETECTED</p>
          </div>
          <Link href="/matches" className="p-3 bg-white/5 rounded-2xl text-white/40 hover:text-muted-teal transition-all">
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
              className="bg-white/5 backdrop-blur-xl rounded-[32px] p-6 border border-white/10 shadow-2xl hover:border-muted-teal/30 transition-all duration-500 group flex items-center gap-6"
            >
              <div className="relative w-24 h-24 rounded-3xl bg-[#2d4d43] overflow-hidden flex-shrink-0 shadow-inner">
                 {match.status === 'live' ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-muted-teal/20 flex items-center justify-center animate-pulse">
                      <Play size={24} className="text-muted-teal translate-x-0.5" fill="currentColor" />
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center opacity-20">
                    <Swords size={32} />
                  </div>
                )}
                <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded-xl bg-black/40 backdrop-blur-md border border-white/5 flex items-center justify-center gap-1.5">
                  <div className={`w-1 h-1 rounded-full ${match.status === 'live' ? 'bg-red-500 animate-pulse' : 'bg-muted-teal'}`} />
                  <span className="text-[8px] font-bold uppercase tracking-tighter text-white/80">{match.status}</span>
                </div>
              </div>
              
              <div className="flex-1 min-w-0 space-y-2">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">{match.mode} • {match.map || 'Bermuda'}</p>
                <h3 className="text-xl font-heading text-white truncate group-hover:text-muted-teal transition-colors">{match.title}</h3>
                
                <div className="flex items-center gap-5 pt-1">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-lg bg-muted-teal/10 flex items-center justify-center">
                      <Trophy size={12} className="text-muted-teal" />
                    </div>
                    <span className="text-[11px] font-bold text-white/60">₹{match.tournament?.prize_pool.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-lg bg-white/5 flex items-center justify-center">
                      <Users size={12} className="text-white/30" />
                    </div>
                    <span className="text-[11px] font-bold text-white/40">{match.live_stats?.players_alive || 48} / {match.tournament?.slots || 100}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end justify-center gap-1 pl-4 border-l border-white/5">
                <span className="text-[9px] font-bold text-white/20 uppercase tracking-[0.3em]">ENTRY</span>
                <span className="text-2xl font-heading text-muted-teal">₹{match.tournament?.entry_fee}</span>
              </div>
            </motion.div>
          )) : (
            <div className="py-20 text-center flex flex-col items-center gap-4 bg-white/5 backdrop-blur-xl rounded-[40px] border border-dashed border-white/10">
              <Signal size={48} strokeWidth={1} className="text-white/10" />
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/20 italic">Scanning for Battle Signals...</p>
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
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-muted-teal/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent/5 blur-[120px] rounded-full" />
      </div>
    </div>
  );
}
