"use client";

import { motion, AnimatePresence } from "framer-motion";
import { BottomNav } from "@/components/layout/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { 
  Trophy, Swords, ChevronRight, 
  Users, Play, TrendingUp, Award, Plus,
  Sparkles, Timer, Zap
} from "lucide-react";
import { StoryViewer } from "@/components/StoryViewer";
import { StoryUpload } from "@/components/StoryUpload";
import { TopHeader } from "@/components/layout/TopHeader";

export default function Home() {
  const { user, loading: authLoading } = useAuth(false);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [featuredMatches, setFeaturedMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  const [activeStories, setActiveStories] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const { data: profileData } = await supabase.from("profiles").select("*").limit(10);
      setProfiles(profileData || []);

      const { data: storyData } = await supabase
        .from("stories")
        .select(`*, user:profiles(full_name, avatar_url)`)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: true });
      setStories(storyData || []);

      const { data: matchData } = await supabase
        .from("matches")
        .select(`*, tournament:tournaments(title, entry_fee, prize_pool)`)
        .or('status.eq.live,status.eq.upcoming')
        .order('status', { ascending: false })
        .limit(6);
      setFeaturedMatches(matchData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openStory = (userId: string) => {
    const userStories = stories.filter(s => s.user_id === userId);
    if (userStories.length > 0) {
      setActiveStories(userStories);
      setSelectedStoryIndex(0);
      setIsViewerOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="pb-32">
        <TopHeader />

        {/* Stories - Native App Pattern */}
        <section className="py-6 overflow-hidden">
          <div className="flex gap-5 overflow-x-auto no-scrollbar px-6 items-center">
            {user && (
              <div className="flex-shrink-0 flex flex-col items-center gap-2">
                <motion.div 
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    const myStories = stories.filter(s => s.user_id === user.id);
                    if (myStories.length > 0) openStory(user.id);
                    else setIsUploadOpen(true);
                  }}
                  className={`relative w-[68px] h-[68px] rounded-[22px] p-[2px] flex items-center justify-center ${
                    stories.some(s => s.user_id === user.id) 
                      ? 'bg-gradient-to-tr from-primary to-accent' 
                      : 'border-2 border-dashed border-foreground/10'
                  }`}
                >
                  <div className="w-full h-full rounded-[20px] bg-background p-0.5">
                    <div className="w-full h-full rounded-[18px] bg-muted flex items-center justify-center overflow-hidden">
                      {user.user_metadata?.avatar_url ? (
                        <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl font-bold text-foreground/20">{user.email?.[0].toUpperCase()}</span>
                      )}
                    </div>
                  </div>
                  {!stories.some(s => s.user_id === user.id) && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-lg border-2 border-white flex items-center justify-center text-white shadow-lg">
                      <Plus size={14} strokeWidth={3} />
                    </div>
                  )}
                </motion.div>
                <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-tighter">You</span>
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
                    whileTap={{ scale: 0.9 }}
                    className={`w-[68px] h-[68px] rounded-[22px] p-[2px] ${
                      hasStory 
                        ? 'bg-gradient-to-tr from-primary to-accent' 
                        : 'bg-foreground/[0.03]'
                    }`}
                  >
                    <div className="w-full h-full rounded-[20px] bg-background p-0.5">
                      <div className="w-full h-full rounded-[18px] bg-white flex items-center justify-center overflow-hidden border border-foreground/[0.03]">
                        {profile.avatar_url ? (
                          <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl font-bold text-foreground/10">{profile.full_name?.[0]}</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                  <span className={`text-[10px] font-bold uppercase tracking-tighter transition-colors ${
                    hasStory ? 'text-foreground' : 'text-foreground/30'
                  }`}>
                    {profile.full_name?.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Featured Hero - Native Banner Style */}
        <section className="px-6 mb-8">
          <div className="relative h-44 rounded-[32px] overflow-hidden bg-dark-emerald shadow-xl shadow-dark-teal/40">
            <div className="absolute inset-0 bg-gradient-to-br from-dark-emerald via-medium-jungle to-moss-green opacity-90" />
            
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden opacity-40">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  x: [0, 100, 0],
                  y: [0, 50, 0],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute -top-10 -left-10 w-40 h-40 bg-white/20 blur-[60px] rounded-full"
              />
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  x: [0, -80, 0],
                  y: [0, -40, 0],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute -bottom-10 -right-10 w-48 h-48 bg-moss-green/30 blur-[70px] rounded-full"
              />
            </div>
            
            <div className="relative h-full p-8 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-white/80" />
                <span className="text-[10px] font-bold text-white/70 uppercase tracking-[0.2em]">Mega Tournament</span>
              </div>
              <h2 className="text-3xl font-heading text-white leading-tight">Win ₹50,000<br/>Weekly Pool</h2>
              <div className="mt-4 flex items-center gap-3">
                <button className="px-6 py-2 bg-white text-dark-emerald rounded-full text-[10px] font-bold uppercase tracking-wider">Join Now</button>
                <div className="flex items-center gap-1 text-white/60">
                  <Users size={12} />
                  <span className="text-[10px] font-bold">1.2k joined</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Stats Grid - Native Mini Cards */}
        <section className="px-6 mb-10 overflow-x-auto no-scrollbar flex gap-4">
          <div className="flex-shrink-0 w-32 bg-card rounded-[24px] p-4 border border-moss-green/10 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-moss-green/10 flex items-center justify-center mb-3">
              <Trophy size={16} className="text-moss-green" />
            </div>
            <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-0.5">Wins</p>
            <h4 className="text-xl font-bold text-white">124</h4>
          </div>
          <div className="flex-shrink-0 w-32 bg-card rounded-[24px] p-4 border border-medium-jungle/10 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-dark-emerald/20 flex items-center justify-center mb-3">
              <Zap size={16} className="text-medium-jungle" />
            </div>
            <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-0.5">Rank</p>
            <h4 className="text-xl font-bold text-white">#42</h4>
          </div>
          <div className="flex-shrink-0 w-32 bg-card rounded-[24px] p-4 border border-moss-green/10 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-moss-green/10 flex items-center justify-center mb-3">
              <TrendingUp size={16} className="text-moss-green" />
            </div>
            <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-0.5">Growth</p>
            <h4 className="text-xl font-bold text-white">+12%</h4>
          </div>
        </section>

        {/* Native Section Header */}
        <section className="px-6 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-heading text-white">Active Arena</h2>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Ongoing Battles</p>
          </div>
          <Link href="/matches" className="text-[10px] font-bold text-moss-green px-3 py-1 bg-moss-green/10 rounded-full active:opacity-50 transition-opacity uppercase tracking-wider">
            View All
          </Link>
        </section>

        {/* List of Match Cards - Polished Native Style */}
        <section className="px-6 space-y-4">
          {featuredMatches.map((match, i) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.96 }}
              className="bg-card rounded-[28px] p-4 border border-moss-green/5 shadow-sm active:shadow-lg transition-all flex items-center gap-4"
            >
              <div className="relative w-20 h-20 rounded-2xl bg-white/5 overflow-hidden flex-shrink-0">
                 {match.status === 'live' ? (
                  <div className="absolute inset-0 bg-dark-emerald/20 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-dark-emerald/40 flex items-center justify-center">
                      <Play size={20} className="text-moss-green translate-x-0.5" fill="currentColor" />
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-white/5 flex items-center justify-center">
                    <Swords size={24} className="text-white/20" />
                  </div>
                )}
                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-dark-teal/80 backdrop-blur-md border border-white/10 shadow-sm flex items-center gap-1">
                  <div className={`w-1 h-1 rounded-full ${match.status === 'live' ? 'bg-red-500 animate-pulse' : 'bg-white/30'}`} />
                  <span className="text-[8px] font-bold uppercase tracking-tighter text-white/60">{match.status}</span>
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.1em] mb-1">{match.mode} • Round 2</p>
                <h3 className="text-base font-bold text-white truncate mb-2">{match.title}</h3>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-moss-green/20 flex items-center justify-center">
                      <Trophy size={10} className="text-moss-green" />
                    </div>
                    <span className="text-[11px] font-bold text-white/70">₹{match.tournament?.prize_pool}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-white/5 flex items-center justify-center">
                      <Users size={10} className="text-white/40" />
                    </div>
                    <span className="text-[11px] font-bold text-white/40">24/48</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end justify-center gap-1 pl-2">
                <span className="text-[8px] font-bold text-white/20 uppercase tracking-[0.2em]">Join</span>
                <span className="text-lg font-bold text-moss-green">₹{match.tournament?.entry_fee}</span>
              </div>
            </motion.div>
          ))}
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
