"use client";

import { motion } from "framer-motion";
import { BottomNav } from "@/components/layout/BottomNav";
import { TopHeader } from "@/components/layout/TopHeader";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { 
  ChevronRight, Plus, Wallet, Trophy, TrendingUp, Users, Clock, Swords, Play, Star, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StoryViewer } from "@/components/StoryViewer";
import { StoryUpload } from "@/components/StoryUpload";
import { BentoCard } from "@/components/ui/BentoCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Link from "next/link";

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
    } catch (error) {
      console.error("Error fetching arena data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

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

  const featured = featuredMatches[0];
  const userName = user?.user_metadata?.full_name?.split(' ')[0] || 'Warrior';

    return (
      <div className="min-h-screen text-onyx font-sans" suppressHydrationWarning={true}>
        <main className="pb-32 relative z-10" suppressHydrationWarning={true}>
          <TopHeader />
  
          {/* Hero Section */}
        <section className="relative pt-12 pb-14 px-8 overflow-hidden bg-transparent">
          <div className="relative z-10">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[48px] font-black leading-[0.9] mb-4 tracking-[-0.03em]"
            >
              Discover,<br />
              Create,<br />
              <span className="text-[#A0A0A0]">Conquer</span>
            </motion.h1>
            <div className="flex items-center gap-2">
              <span className="w-8 h-[2px] bg-[#11130D]/10" />
              <p className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-[0.2em]">
                Hello {userName} — Ready to compete?
              </p>
            </div>
          </div>
        </section>

        {/* Story Row */}
        <section className="py-4 overflow-hidden">
          <div className="flex gap-4 overflow-x-auto no-scrollbar px-6 items-start">
            <div className="flex-shrink-0 flex flex-col items-center gap-2">
              <motion.div 
                whileTap={{ scale: 0.92 }}
                onClick={() => setIsUploadOpen(true)}
                className="relative w-[68px] h-[68px] rounded-full p-[3px] bg-soft-yellow shadow-md"
              >
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                  {user?.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-black text-charcoal">{user?.email?.[0]?.toUpperCase() || 'A'}</span>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-onyx rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                  <Plus size={14} strokeWidth={3} className="text-white" />
                </div>
              </motion.div>
              <span className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">You</span>
            </div>

            {profiles.slice(0, 8).map((profile) => (
              <div key={profile.id} className="flex-shrink-0 flex flex-col items-center gap-2">
                <motion.div 
                  whileTap={{ scale: 0.92 }}
                  onClick={() => openStory(profile.id)}
                  className={cn(
                    "w-[68px] h-[68px] rounded-full p-[3px] shadow-sm",
                    stories.some(s => s.user_id === profile.id) 
                      ? "bg-soft-yellow" 
                      : "bg-white"
                  )}
                >
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl font-black text-charcoal">{profile.full_name?.[0]?.toUpperCase()}</span>
                    )}
                  </div>
                </motion.div>
                <span className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">{profile.full_name?.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Activity Bento Grid - Reference Style */}
        <section className="px-6 mb-6 relative">
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-pastel-mint/10 rounded-full blur-[100px] -z-10" />
          <div className="grid grid-cols-2 gap-4 relative z-10">
            {/* Progress Card - Like reference "Your Progress" */}
            <BentoCard variant="pastel" pastelColor="mint" className="p-5 h-[180px] flex flex-col justify-between relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-white/60 flex items-center justify-center">
                    <TrendingUp size={16} className="text-onyx" />
                  </div>
                  <span className="text-[10px] font-black text-onyx/60 uppercase tracking-widest">Win Rate</span>
                </div>
                <p className="text-[48px] font-black leading-none">68%</p>
              </div>
              <div className="relative z-10">
                <div className="h-2 bg-white/40 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "68%" }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="h-full bg-onyx/30 rounded-full"
                  />
                </div>
                <p className="text-[9px] font-bold text-onyx/40 mt-2 uppercase tracking-widest">Last 7 days</p>
              </div>
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/20 rounded-full" />
            </BentoCard>

            {/* Matches Today Card */}
            <BentoCard variant="dark" className="p-5 h-[180px] flex flex-col justify-between relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                    <Swords size={16} className="text-pastel-sky" />
                  </div>
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Today</span>
                </div>
                <p className="text-[48px] font-black leading-none text-white">3</p>
                <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest mt-1">Matches Played</p>
              </div>
              <Link href="/matches" className="relative z-10">
                <motion.div 
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 text-pastel-sky"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest">View All</span>
                  <ChevronRight size={14} />
                </motion.div>
              </Link>
              <div className="absolute top-0 right-0 w-24 h-24 bg-pastel-sky/10 rounded-full blur-2xl" />
            </BentoCard>
          </div>
        </section>

        {/* Featured Tournament Hero - Like reference "Activities" */}
        <section className="px-6 mb-6">
          <BentoCard variant="vibrant" className="p-6 h-[200px] relative overflow-hidden">
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  {featured?.status === 'live' && <StatusBadge variant="live" />}
                  <span className="px-3 py-1 bg-onyx/10 text-onyx text-[9px] font-black rounded-full uppercase tracking-widest">Featured</span>
                </div>
                <h3 className="text-[28px] font-black leading-[1] mb-2">
                  {featured?.tournament?.title || "Pro League"}
                </h3>
                <p className="text-[11px] font-bold text-onyx/50 uppercase tracking-wider">
                  {featured?.mode || 'SQUAD'} • ₹{featured?.tournament?.entry_fee || 50} Entry
                </p>
              </div>
              
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[9px] font-bold text-onyx/40 uppercase tracking-widest mb-1">Prize Pool</p>
                  <p className="text-2xl font-black">₹{(featured?.tournament?.prize_pool || 10000).toLocaleString()}</p>
                </div>
                <Link href={`/matches/${featured?.id || ''}`}>
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-onyx text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2"
                  >
                    Join <ChevronRight size={14} />
                  </motion.button>
                </Link>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-4 right-4 w-20 h-20 bg-onyx/5 rounded-3xl rotate-12" />
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/20 rounded-full" />
            <Trophy className="absolute top-6 right-6 text-onyx/10" size={80} />
          </BentoCard>
        </section>

        {/* Quick Actions - Horizontal Bento */}
        <section className="px-6 mb-6">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Wallet', icon: Wallet, color: 'lavender', href: '/wallet', value: '₹1,250' },
              { label: 'Rank', icon: Trophy, color: 'coral', href: '/leaderboard', value: '#42' },
              { label: 'Live', icon: Play, color: 'mint', href: '/live', value: 'Watch' },
            ].map((item) => (
              <Link key={item.label} href={item.href}>
                <motion.div whileTap={{ scale: 0.95 }}>
                  <BentoCard variant="pastel" pastelColor={item.color as any} className="p-4 h-[100px] flex flex-col justify-between">
                    <div className="w-9 h-9 rounded-xl bg-white/50 flex items-center justify-center">
                      <item.icon size={18} className="text-onyx" />
                    </div>
                    <div>
                      <p className="text-[15px] font-black leading-none">{item.value}</p>
                      <p className="text-[9px] font-bold text-onyx/40 uppercase tracking-widest mt-1">{item.label}</p>
                    </div>
                  </BentoCard>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>

        {/* Action Strip - Horizontal Scroll */}
        <section className="mb-8">
          <div className="flex gap-3 overflow-x-auto no-scrollbar px-6">
            {[
              { label: 'Join Match', icon: Swords, href: '/matches', primary: true },
              { label: 'Add Funds', icon: Plus, href: '/wallet' },
              { label: 'Leaderboard', icon: Trophy, href: '/leaderboard' },
              { label: 'Invite', icon: Users, href: '/profile' }
            ].map((action) => (
              <Link key={action.label} href={action.href}>
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap shadow-soft",
                    action.primary ? "bg-onyx text-white" : "bg-white text-onyx"
                  )}
                >
                  <action.icon size={16} />
                  {action.label}
                </motion.button>
              </Link>
            ))}
          </div>
        </section>

        {/* Upcoming Matches Section */}
        <section className="px-6 mb-8 relative">
          <div className="absolute top-0 right-0 w-40 h-40 bg-pastel-sky/10 rounded-full blur-[80px] -z-10" />
          <div className="flex justify-between items-center mb-5 relative z-10">
            <h3 className="text-xl font-black">Upcoming</h3>
            <Link href="/matches" className="flex items-center gap-1 text-charcoal/40">
              <span className="text-[10px] font-black uppercase tracking-widest">See All</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="flex gap-4 overflow-x-auto no-scrollbar py-2 -mx-6 px-6 relative z-10">
            {featuredMatches.slice(1, 5).map((match, i) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={`/matches/${match.id}`}>
                  <BentoCard className="min-w-[220px] p-5 shadow-soft">
                    <div className="flex items-center justify-between mb-4">
                      <div className={cn(
                        "w-11 h-11 rounded-2xl flex items-center justify-center",
                        i === 0 ? "bg-pastel-lavender" : 
                        i === 1 ? "bg-pastel-mint" : 
                        i === 2 ? "bg-pastel-coral" : "bg-pastel-sky"
                      )}>
                        <Trophy size={18} className="text-onyx" />
                      </div>
                      <StatusBadge variant={match.status as any} className="text-[8px] px-3 py-1" />
                    </div>
                    
                    <h4 className="text-[15px] font-black leading-tight mb-1">{match.tournament?.title}</h4>
                    <p className="text-[10px] font-bold text-charcoal/40 uppercase tracking-widest mb-4">
                      {match.mode} • ₹{match.tournament?.entry_fee}
                    </p>
                    
                    <div className="flex justify-between items-end pt-3 border-t border-black/[0.03]">
                      <div>
                        <p className="text-[8px] font-bold text-charcoal/30 uppercase tracking-widest">Prize</p>
                        <p className="text-[15px] font-black">₹{match.tournament?.prize_pool?.toLocaleString()}</p>
                      </div>
                      <motion.div 
                        whileTap={{ scale: 0.9 }}
                        className="w-10 h-10 bg-onyx rounded-xl flex items-center justify-center"
                      >
                        <ChevronRight size={18} className="text-white" />
                      </motion.div>
                    </div>
                  </BentoCard>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

          {/* Live Now Banner */}
          {featuredMatches.some(m => m.status === 'live') && (
            <section className="px-6 mb-8">
              <Link href="/live">
                <BentoCard variant="dark" className="p-5 flex items-center justify-between relative overflow-hidden">
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-pastel-coral flex items-center justify-center">
                      <Play size={20} className="text-onyx" fill="currentColor" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge variant="live" className="text-[8px] px-2 py-0.5" />
                      </div>
                      <p className="text-[13px] font-black text-white">Tournament is streaming now</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-white/40 relative z-10" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-pastel-coral/10" />
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
