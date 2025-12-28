"use client";

import { motion } from "framer-motion";
import { BottomNav } from "@/components/layout/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { 
  ChevronRight, Plus, Wallet, Zap, Trophy, TrendingUp, Users, Clock, Swords
} from "lucide-react";
import { StoryViewer } from "@/components/StoryViewer";
import { StoryUpload } from "@/components/StoryUpload";
import { TopHeader } from "@/components/layout/TopHeader";
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

  return (
    <div className="min-h-screen bg-background text-onyx font-sans">
      <main className="pb-32 relative z-10">
        <TopHeader />

        {/* Sticker Header */}
        <section className="sticker-header">
          <div className="sticker-blob bg-lime-yellow" />
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full border-2 border-white shadow-sm overflow-hidden bg-white">
              {user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl font-bold bg-pastel-mint">
                  {user?.email?.[0]?.toUpperCase() || 'A'}
                </div>
              )}
            </div>
            <div>
              <p className="text-[10px] font-bold text-charcoal/40 uppercase tracking-widest leading-none">Welcome back</p>
              <p className="text-[12px] font-bold text-charcoal/30 mt-1 uppercase tracking-tighter">Dec 28, 2025</p>
            </div>
          </div>
          <h1 className="text-[32px] font-black leading-[1.1] mb-6 max-w-[280px]">
            Hello {user?.user_metadata?.full_name?.split(' ')[0] || 'Warrior'}! <br />
            Ready to win today?
          </h1>

          <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
            {[
              { label: 'Competitive', emoji: '🔥', color: 'coral' },
              { label: 'Chill', emoji: '😎', color: 'mint' },
              { label: 'Grinding', emoji: '💪', color: 'lavender' },
              { label: 'Lucky', emoji: '🍀', color: 'peach' }
            ].map((mood) => (
              <motion.div 
                key={mood.label} 
                whileTap={{ scale: 0.9 }}
                className="flex flex-col items-center gap-2"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm bento-pastel-${mood.color}`}>
                  <span className="text-2xl">{mood.emoji}</span>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-charcoal-brown/60">{mood.label}</span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Story Row */}
        <section className="py-4 overflow-hidden">
          <div className="flex gap-4 overflow-x-auto no-scrollbar px-6 items-start">
            <div className="flex-shrink-0 flex flex-col items-center gap-2">
              <motion.div 
                whileTap={{ scale: 0.92 }}
                onClick={() => setIsUploadOpen(true)}
                className="relative w-[64px] h-[64px] rounded-full p-[2px] bg-white border border-black/5 shadow-sm"
              >
                <div className="w-full h-full rounded-full bg-off-white flex items-center justify-center overflow-hidden">
                  {user?.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-heading text-charcoal">{user?.email?.[0]?.toUpperCase() || 'A'}</span>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-onyx rounded-full border-2 border-white flex items-center justify-center shadow-md">
                  <Plus size={12} strokeWidth={3} className="text-white" />
                </div>
              </motion.div>
              <span className="text-[10px] font-bold text-charcoal/60 uppercase tracking-widest">You</span>
            </div>

            {profiles.map((profile) => (
              <div key={profile.id} className="flex-shrink-0 flex flex-col items-center gap-2">
                <motion.div 
                  whileTap={{ scale: 0.92 }}
                  onClick={() => openStory(profile.id)}
                  className={cn(
                    "w-[64px] h-[64px] rounded-full p-[3px] shadow-sm bg-white",
                    stories.some(s => s.user_id === profile.id) ? "ring-2 ring-lime-yellow" : "border border-black/5"
                  )}
                >
                  <div className="w-full h-full rounded-full bg-off-white flex items-center justify-center overflow-hidden">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl font-heading text-charcoal">{profile.full_name?.[0]?.toUpperCase()}</span>
                    )}
                  </div>
                </motion.div>
                <span className="text-[10px] font-bold text-charcoal/60 uppercase tracking-widest">{profile.full_name?.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Tournament */}
        <section className="px-6 mb-8">
          <BentoCard variant="vibrant" className="p-6 h-[180px] relative overflow-hidden flex flex-col justify-between">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-2">
                <span className="px-3 py-1 bg-onyx text-white text-[10px] font-bold rounded-full uppercase tracking-widest">Featured</span>
                {featured?.status === 'live' && <StatusBadge variant="live" className="bg-white/30 backdrop-blur-sm" />}
              </div>
              <h3 className="text-2xl font-black leading-tight mb-1">{featured?.tournament?.title || "Pro League Season 8"}</h3>
              <p className="text-[12px] font-bold text-onyx/60 uppercase tracking-wider">
                {featured?.mode || 'SQUAD'} • ₹{featured?.tournament?.entry_fee || 50} Entry
              </p>
            </div>
            <div className="relative z-10 flex justify-between items-end">
              <div>
                <p className="text-lg font-black leading-none">₹{featured?.tournament?.prize_pool || "10,000"}</p>
                <p className="text-[10px] font-bold text-onyx/40 uppercase tracking-widest">Prize Pool</p>
              </div>
              <Link href={`/matches/${featured?.id || ''}`}>
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2 bg-onyx text-white rounded-full text-xs font-bold uppercase tracking-widest shadow-lg"
                >
                  Join Now
                </motion.button>
              </Link>
            </div>
            
            <div className="absolute top-0 right-0 p-2 opacity-10">
              <Trophy size={120} />
            </div>
          </BentoCard>
        </section>

        {/* My Activity Grid */}
        <section className="px-6 mb-8">
          <div className="grid grid-cols-2 gap-4">
            <BentoCard variant="pastel" pastelColor="mint" className="p-6 h-40 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={16} className="text-charcoal-brown/50" />
                  <span className="text-[10px] font-bold text-charcoal-brown/50 uppercase tracking-widest">Win Rate</span>
                </div>
                <p className="text-3xl font-black">68%</p>
              </div>
              <div className="h-4 bg-white/30 rounded-full overflow-hidden">
                <div className="h-full bg-onyx/20 w-[68%]" />
              </div>
            </BentoCard>

            <BentoCard variant="dark" className="p-6 h-40 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={16} className="text-white/30" />
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Matches Today</span>
                </div>
                <p className="text-3xl font-black text-white">3</p>
              </div>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Played today</p>
            </BentoCard>

            <BentoCard variant="pastel" pastelColor="lavender" className="p-6 h-40 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Trophy size={16} className="text-charcoal-brown/50" />
                  <span className="text-[10px] font-bold text-charcoal-brown/50 uppercase tracking-widest">Current Rank</span>
                </div>
                <p className="text-3xl font-black">#42</p>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp size={12} className="text-green-600" />
                <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">+12%</span>
              </div>
            </BentoCard>

            <BentoCard className="p-6 h-40 flex flex-col justify-between border border-black/5 shadow-sm">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Wallet size={16} className="text-charcoal-brown/50" />
                  <span className="text-[10px] font-bold text-charcoal-brown/50 uppercase tracking-widest">Wallet</span>
                </div>
                <p className="text-3xl font-black">₹1,250</p>
              </div>
              <Link href="/wallet" className="text-[10px] font-bold text-onyx underline uppercase tracking-widest">Add Funds</Link>
            </BentoCard>
          </div>
        </section>

        {/* Quick Actions Strip */}
        <section className="mb-8">
          <div className="flex gap-3 overflow-x-auto no-scrollbar px-6">
            {[
              { label: 'Join Match', icon: Swords, href: '/matches', primary: true },
              { label: 'Add Funds', icon: Plus, href: '/wallet' },
              { label: 'Leaderboard', icon: Trophy, href: '/leaderboard' },
              { label: 'Invite Friends', icon: Users, href: '/profile' }
            ].map((action) => (
              <Link key={action.label} href={action.href}>
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "flex items-center gap-2 px-5 py-3 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap shadow-sm",
                    action.primary ? "bg-onyx text-white" : "bg-white text-onyx border border-black/5"
                  )}
                >
                  <action.icon size={16} />
                  {action.label}
                </motion.button>
              </Link>
            ))}
          </div>
        </section>

        {/* Upcoming Section */}
        <section className="px-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black">Upcoming</h3>
            <Link href="/matches" className="text-[10px] font-bold text-charcoal/40 uppercase tracking-widest">See All</Link>
          </div>

          <div className="flex gap-4 overflow-x-auto no-scrollbar py-2 -mx-6 px-6">
            {featuredMatches.slice(1).map((match) => (
              <BentoCard key={match.id} className="min-w-[240px] p-5 shadow-sm border border-black/5">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-xl bg-pastel-yellow flex items-center justify-center">
                    <Trophy size={20} className="text-onyx" />
                  </div>
                  <StatusBadge variant="upcoming" />
                </div>
                <h4 className="text-lg font-black leading-tight mb-1">{match.tournament?.title}</h4>
                <p className="text-[10px] font-bold text-charcoal/40 uppercase tracking-widest mb-4">
                  {match.mode} • ₹{match.tournament?.entry_fee} Entry
                </p>
                
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-bold text-charcoal/30 uppercase tracking-widest leading-none mb-1">Prize Pool</p>
                    <p className="text-base font-black leading-none">₹{match.tournament?.prize_pool}</p>
                  </div>
                  <Link href={`/matches/${match.id}`}>
                    <motion.button 
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-1.5 bg-silver/20 rounded-full text-[10px] font-bold uppercase tracking-widest"
                    >
                      Join
                    </motion.button>
                  </Link>
                </div>
              </BentoCard>
            ))}
          </div>
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
