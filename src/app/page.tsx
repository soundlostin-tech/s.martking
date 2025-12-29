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
import { LoadingScreen } from "@/components/ui/LoadingScreen";

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

  if (loading || authLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#1A1A1A] relative">
      <div className="unified-bg" />
      
      <main className="pb-[80px] relative z-10">
        <TopHeader />
        
        <section className="px-4 pt-6 pb-4">
          <h2 className="text-[32px] font-heading text-[#1A1A1A] leading-tight font-bold max-w-[300px]">
            Hello {user?.user_metadata?.full_name?.split(' ')[0] || 'Warrior'}!
          </h2>
          <p className="text-[12px] font-bold text-[#6B7280] uppercase tracking-[0.1em] mt-1">
            Ready to win?
          </p>
        </section>

        <section className="py-4">
          <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 items-start">
            <div className="flex-shrink-0 flex flex-col items-center gap-2">
              <motion.div 
                whileTap={{ scale: 0.92 }}
                onClick={() => setIsUploadOpen(true)}
                className="relative w-16 h-16 rounded-full p-[2px] bg-white shadow-[2px_8px_16px_rgba(0,0,0,0.06)]"
              >
                <div className="w-full h-full rounded-full bg-[#F5F5F5] flex items-center justify-center">
                  <Plus size={24} strokeWidth={3} className="text-[#6B7280]" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#5FD3BC] rounded-full border-2 border-white flex items-center justify-center">
                  <Plus size={12} strokeWidth={4} className="text-[#1A1A1A]" />
                </div>
              </motion.div>
              <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wide">You</span>
            </div>

            {profiles.map((profile) => (
              <div key={profile.id} className="flex-shrink-0 flex flex-col items-center gap-2">
                <motion.div 
                  whileTap={{ scale: 0.92 }}
                  onClick={() => openStory(profile.id)}
                  className="w-16 h-16 rounded-full p-[2px] bg-white shadow-[2px_8px_16px_rgba(0,0,0,0.06)] border-2 border-[#5FD3BC]"
                >
                  <div className="w-full h-full rounded-full bg-[#E5E7EB] flex items-center justify-center overflow-hidden">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg font-heading text-[#6B7280]">{profile.full_name?.[0]?.toUpperCase()}</span>
                    )}
                  </div>
                </motion.div>
                <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wide">{profile.full_name?.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="px-4 mb-6">
          <BentoCard variant="vibrant" className="p-6 relative overflow-hidden min-h-[200px]">
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <StatusBadge variant="live" className="bg-[#1A1A1A] text-white" />
                  <div className="px-3 py-1 bg-white/30 backdrop-blur-md rounded-full text-[10px] font-bold text-[#1A1A1A] flex items-center gap-1.5">
                    <Clock size={12} strokeWidth={3} />
                    02:45:12
                  </div>
                </div>
                <h3 className="text-[24px] font-heading text-[#1A1A1A] leading-tight font-bold mb-2">
                  {featured?.tournament?.title || "Pro League Season 4"}
                </h3>
                <div className="flex gap-2 mb-4">
                  <div className="px-3 py-1 bg-[#1A1A1A] text-white rounded-lg text-[10px] font-bold">SOLO</div>
                  <div className="px-3 py-1 bg-white text-[#1A1A1A] rounded-lg text-[10px] font-bold">ENTRY ₹{featured?.tournament?.entry_fee || "50"}</div>
                </div>
              </div>
              
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-bold text-[#1A1A1A]/60 uppercase tracking-wide mb-1">Prize Pool</p>
                  <p className="text-2xl font-heading text-[#1A1A1A] font-bold">₹{featured?.tournament?.prize_pool || "5,000"}</p>
                </div>
                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  className="w-12 h-12 bg-[#1A1A1A] rounded-xl flex items-center justify-center shadow-lg"
                >
                  <ChevronRight size={24} className="text-white" />
                </motion.button>
              </div>
            </div>
            
            <div className="absolute right-[-20px] top-[-20px] scale-[1.2] opacity-10 pointer-events-none">
              <Trophy size={160} strokeWidth={1} />
            </div>
          </BentoCard>
        </section>

        <section className="px-4 mb-6">
          <div className="grid grid-cols-2 gap-3">
            <BentoCard variant="dark" className="p-4 h-36 flex flex-col justify-between overflow-hidden relative">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Target size={14} className="text-[#5FD3BC]" />
                  <span className="text-[10px] font-bold text-white/60 uppercase tracking-wide">Win Rate</span>
                </div>
                <p className="text-2xl font-heading text-white font-bold">{userStats.winRate}</p>
              </div>
              <div className="h-8 flex items-end gap-1 relative z-10">
                {[40, 70, 45, 90, 60, 80, 55].map((h, i) => (
                  <div key={i} className="flex-1 bg-[#5FD3BC]/30 rounded-t-sm" style={{ height: `${h}%` }} />
                ))}
              </div>
              <div className="absolute -right-4 -top-4 opacity-5">
                <Swords size={100} />
              </div>
            </BentoCard>
            
            <BentoCard variant="pastel" pastelColor="lavender" className="p-4 h-36 flex flex-col justify-between overflow-hidden relative">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Crown size={14} className="text-[#1A1A1A]/60" />
                  <span className="text-[10px] font-bold text-[#1A1A1A]/60 uppercase tracking-wide">Current Rank</span>
                </div>
                <p className="text-2xl font-heading text-[#1A1A1A] font-bold">{userStats.rank}</p>
                <div className="mt-1 flex items-center gap-1">
                  <TrendingUp size={12} className="text-[#5FD3BC]" />
                  <span className="text-[10px] font-bold text-[#5FD3BC] uppercase">{userStats.growth} this week</span>
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <Award size={80} />
              </div>
            </BentoCard>
          </div>
        </section>

        <section className="px-4 mb-6 overflow-x-auto no-scrollbar flex gap-3">
          {[
            { label: "Join Match", icon: Swords, href: "/matches", color: "mint" },
            { label: "Add Funds", icon: Wallet, href: "/wallet", color: "peach" },
            { label: "Leaderboard", icon: Trophy, href: "/leaderboard", color: "sky" }
          ].map((action) => (
            <Link key={action.label} href={action.href} className="flex-shrink-0">
              <div className="bg-white shadow-[2px_8px_16px_rgba(0,0,0,0.06)] flex items-center gap-3 px-4 py-3 rounded-lg touch-target">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  action.color === 'mint' ? 'bg-[#D1FAE5]' :
                  action.color === 'peach' ? 'bg-[#FFEDD5]' : 'bg-[#E0F2FE]'
                }`}>
                  <action.icon size={16} className="text-[#1A1A1A]" />
                </div>
                <span className="text-sm font-bold text-[#1A1A1A]">{action.label}</span>
              </div>
            </Link>
          ))}
        </section>

        <section className="px-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-heading text-[#1A1A1A] font-bold">Upcoming</h3>
            <Link href="/matches" className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wide">See All</Link>
          </div>
          
          <div className="flex flex-col gap-3">
            {featuredMatches.slice(1, 4).map((match) => (
              <BentoCard key={match.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#D1FAE5] flex items-center justify-center">
                    <Zap size={18} className="text-[#1A1A1A]" />
                  </div>
                  <div>
                    <h4 className="font-heading text-[#1A1A1A] font-bold leading-tight text-sm">{match.tournament?.title || "Standard Match"}</h4>
                    <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wide mt-0.5">₹{match.tournament?.entry_fee} Entry</p>
                  </div>
                </div>
                <StatusBadge variant="upcoming" className="text-[9px] px-2 py-0.5" />
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
