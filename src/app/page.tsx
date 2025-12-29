"use client";

import { motion } from "framer-motion";
import { BottomNav } from "@/components/layout/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { 
  Trophy, ChevronRight, Users, Play, TrendingUp, Award, Plus,
  Wallet, Zap, Clock, Swords, Target, Crown
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
  const [userStats, setUserStats] = useState({ wins: 12, rank: "#42", winRate: "68%", growth: "+12%" });
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
          setUserStats(prev => ({
            ...prev,
            wins: Math.floor((profile.matches_played || 0) * (parseFloat(profile.win_rate) / 100)),
            winRate: `${profile.win_rate}%` || "0%"
          }));
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

  const featured = featuredMatches[0];

  return (
    <div className="min-h-screen bg-background text-onyx">
      <main className="pb-32 relative z-10">
        <TopHeader />

        {/* Greeting Section */}
        <section className="px-6 pt-10 pb-6 blob-header blob-header-yellow">
          <div className="flex flex-col gap-1 mb-8 relative z-10">
            <h2 className="text-[44px] font-heading text-onyx leading-[1.1] font-black max-w-[300px]">
              Hello {user?.user_metadata?.full_name?.split(' ')[0] || 'Warrior'}! <br />
              <span className="text-charcoal-brown/40">Ready to win?</span>
            </h2>
          </div>
        </section>

        {/* Story Row */}
        <section className="py-4 overflow-hidden mb-6">
          <div className="flex gap-4 overflow-x-auto no-scrollbar px-6 items-start">
            <div className="flex-shrink-0 flex flex-col items-center gap-2">
              <motion.div 
                whileTap={{ scale: 0.92 }}
                onClick={() => setIsUploadOpen(true)}
                className="relative w-[68px] h-[68px] rounded-full p-[3px] bg-white shadow-sm"
              >
                <div className="w-full h-full rounded-full bg-silver/20 flex items-center justify-center overflow-hidden">
                  <Plus size={24} strokeWidth={3} className="text-charcoal" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-lime-yellow rounded-full border-2 border-white flex items-center justify-center shadow-md">
                  <Plus size={14} strokeWidth={4} className="text-onyx" />
                </div>
              </motion.div>
              <span className="text-[10px] font-bold text-charcoal/60 uppercase tracking-widest">You</span>
            </div>

            {profiles.map((profile) => (
              <div key={profile.id} className="flex-shrink-0 flex flex-col items-center gap-2">
                <motion.div 
                  whileTap={{ scale: 0.92 }}
                  onClick={() => openStory(profile.id)}
                  className="w-[68px] h-[68px] rounded-full p-[3px] bg-white shadow-sm ring-2 ring-lime-yellow ring-offset-2"
                >
                  <div className="w-full h-full rounded-full bg-silver flex items-center justify-center overflow-hidden">
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

        {/* Featured Tournament Hero */}
        <section className="px-6 mb-8">
          <BentoCard variant="vibrant" className="p-8 relative overflow-hidden min-h-[240px]">
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <StatusBadge variant="live" className="bg-onyx text-white shadow-none" />
                  <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black text-onyx flex items-center gap-1.5">
                    <Clock size={12} strokeWidth={3} />
                    02:45:12
                  </div>
                </div>
                <h3 className="text-[32px] font-heading text-onyx leading-tight font-black mb-2">
                  {featured?.tournament?.title || "Pro League Season 4"}
                </h3>
                <div className="flex gap-2 mb-6">
                  <div className="px-3 py-1 bg-onyx text-white rounded-lg text-[10px] font-bold">SOLO</div>
                  <div className="px-3 py-1 bg-white text-onyx rounded-lg text-[10px] font-bold">ENTRY ₹{featured?.tournament?.entry_fee || "50"}</div>
                </div>
              </div>
              
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-bold text-onyx/40 uppercase tracking-widest mb-1">Prize Pool</p>
                  <p className="text-3xl font-heading text-onyx font-black">₹{featured?.tournament?.prize_pool || "5,000"}</p>
                </div>
                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  className="w-14 h-14 bg-onyx rounded-2xl flex items-center justify-center shadow-xl"
                >
                  <ChevronRight size={28} className="text-white" />
                </motion.button>
              </div>
            </div>
            
            {/* Background pattern */}
            <div className="absolute right-[-20px] top-[-20px] scale-[1.2] opacity-10 pointer-events-none">
              <Trophy size={200} strokeWidth={1} />
            </div>
          </BentoCard>
        </section>

        {/* My Activity Grid */}
        <section className="px-6 mb-8">
          <div className="grid grid-cols-2 gap-4">
            <BentoCard variant="dark" className="p-6 h-44 flex flex-col justify-between overflow-hidden relative">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Target size={16} className="text-lime-yellow" />
                  <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Win Rate</span>
                </div>
                <p className="text-3xl font-heading text-white font-black">{userStats.winRate}</p>
              </div>
              <div className="h-10 flex items-end gap-1 relative z-10">
                {[40, 70, 45, 90, 60, 80, 55].map((h, i) => (
                  <div key={i} className="flex-1 bg-lime-yellow/20 rounded-t-sm" style={{ height: `${h}%` }} />
                ))}
              </div>
              <div className="absolute -right-4 -top-4 opacity-5">
                <Swords size={120} />
              </div>
            </BentoCard>
            
            <BentoCard variant="pastel" pastelColor="lavender" className="p-6 h-44 flex flex-col justify-between overflow-hidden relative">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Crown size={16} className="text-onyx/60" />
                  <span className="text-[10px] font-bold text-onyx/40 uppercase tracking-widest">Current Rank</span>
                </div>
                <p className="text-3xl font-heading text-onyx font-black">{userStats.rank}</p>
                <div className="mt-2 flex items-center gap-1">
                  <TrendingUp size={12} className="text-olive" />
                  <span className="text-[10px] font-bold text-olive uppercase">{userStats.growth} this week</span>
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <Award size={100} />
              </div>
            </BentoCard>
          </div>
        </section>

        {/* Quick Actions Strip */}
        <section className="px-6 mb-8 overflow-x-auto no-scrollbar flex gap-4">
          {[
            { label: "Join Match", icon: Swords, href: "/matches", color: "mint" },
            { label: "Add Funds", icon: Wallet, href: "/wallet", color: "peach" },
            { label: "Leaderboard", icon: Trophy, href: "/leaderboard", color: "sky" }
          ].map((action) => (
            <Link key={action.label} href={action.href} className="flex-shrink-0">
              <div className={`chip chip-default bg-white border-none shadow-sm flex items-center gap-3 px-6 py-4 rounded-[20px]`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center bg-pastel-${action.color}`}>
                  <action.icon size={16} className="text-onyx" />
                </div>
                <span className="text-sm font-black text-onyx">{action.label}</span>
              </div>
            </Link>
          ))}
        </section>

        {/* Upcoming Matches */}
        <section className="px-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-heading text-onyx font-black">Upcoming</h3>
            <Link href="/matches" className="text-[10px] font-black text-charcoal/40 uppercase tracking-widest">See All</Link>
          </div>
          
          <div className="flex flex-col gap-4">
            {featuredMatches.slice(1, 4).map((match) => (
              <BentoCard key={match.id} className="p-5 flex items-center justify-between border-none shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-pastel-mint flex items-center justify-center">
                    <Zap size={20} className="text-onyx" />
                  </div>
                  <div>
                    <h4 className="font-heading text-onyx font-black leading-tight">{match.tournament?.title || "Standard Match"}</h4>
                    <p className="text-[10px] font-bold text-charcoal/40 uppercase tracking-widest mt-0.5">₹{match.tournament?.entry_fee} Entry • ₹{match.tournament?.prize_pool} Prize</p>
                  </div>
                </div>
                <StatusBadge variant="upcoming" className="bg-transparent shadow-none p-0" />
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
