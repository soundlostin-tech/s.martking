"use client";

import { motion } from "framer-motion";
import { BottomNav } from "@/components/layout/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { 
  Trophy, ChevronRight, Users, Play, TrendingUp, Award, Plus,
  Wallet, Zap, Clock
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
    <div className="min-h-screen bg-background text-onyx">
      <main className="pb-32 relative z-10">
        <TopHeader />

        {/* Greeting Section - Matches Image Left Screen */}
        <section className="px-6 pt-10 pb-6">
          <div className="flex flex-col gap-1 mb-8">
            <h2 className="text-[40px] font-heading text-onyx leading-[1.1] font-black max-w-[280px]">
              Not Sure <br />
              About Your <br />
              <span className="text-onyx">Mood?</span>
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="px-6 py-3 bg-white rounded-full shadow-sm border border-black/5">
              <span className="text-sm font-bold text-onyx">Let Us Help!</span>
            </div>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              className="w-12 h-12 bg-onyx rounded-full flex items-center justify-center shadow-lg"
            >
              <ChevronRight size={24} className="text-white" />
            </motion.button>
          </div>
        </section>

        {/* Stories Row - Matches Image Middle Screen Top */}
        <section className="py-6 overflow-hidden">
          <div className="flex gap-4 overflow-x-auto no-scrollbar px-6 items-start">
            {/* User's own story */}
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

            {/* Other users' stories */}
            {profiles.map((profile) => (
              <div key={profile.id} className="flex-shrink-0 flex flex-col items-center gap-2">
                <motion.div 
                  whileTap={{ scale: 0.92 }}
                  className="w-[64px] h-[64px] rounded-full p-[2px] bg-white border border-black/5 shadow-sm"
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

        {/* Main Interaction Card - Matches Image Middle Screen */}
        <section className="px-6 mb-8">
          <BentoCard className="p-8 border-none shadow-[0_20px_60px_rgba(0,0,0,0.06)] relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-pastel-mint flex items-center justify-center">
                  <span className="text-lg">😊</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-pastel-coral flex items-center justify-center">
                  <span className="text-lg">😡</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-pastel-lavender flex items-center justify-center">
                  <span className="text-lg">😴</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-off-white flex items-center justify-center">
                <div className="w-5 h-[2px] bg-onyx mb-[4px] rounded-full" />
                <div className="w-5 h-[2px] bg-onyx rounded-full absolute" />
              </div>
            </div>
            
            <p className="text-sm font-bold text-charcoal/50 uppercase tracking-[0.2em] mb-3">Sep 14, 2025</p>
            <h3 className="text-[32px] font-heading text-onyx leading-tight font-black mb-6">
              Hello {user?.user_metadata?.full_name?.split(' ')[0] || 'Warrior'}! How are you feeling today?
            </h3>

            <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
              {['Happy', 'Angry', 'Sleepy', 'Bored'].map((mood) => (
                <div key={mood} className="flex flex-col items-center gap-2">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    mood === 'Happy' ? 'bg-pastel-mint' : 
                    mood === 'Angry' ? 'bg-pastel-coral' :
                    mood === 'Sleepy' ? 'bg-pastel-lavender' : 'bg-pastel-peach'
                  }`}>
                    <span className="text-2xl">{mood === 'Happy' ? '😊' : mood === 'Angry' ? '😡' : mood === 'Sleepy' ? '😴' : '😐'}</span>
                  </div>
                  <span className="text-[10px] font-bold text-onyx uppercase tracking-wider">{mood}</span>
                </div>
              ))}
            </div>
          </BentoCard>
        </section>

        {/* Quick Stats Grid - Matches Image Middle Screen Bottom */}
        <section className="px-6 mb-8">
          <div className="grid grid-cols-2 gap-4">
            <BentoCard variant="dark" className="p-6 h-48 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Clock size={16} className="text-pastel-coral" />
                  <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Sleep Duration</span>
                </div>
                <div className="flex gap-1 items-end h-12">
                  {[40, 60, 45, 80, 50, 70].map((h, i) => (
                    <div key={i} className="flex-1 bg-pastel-coral/30 rounded-t-sm" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
              <p className="text-2xl font-heading text-white font-black">7h 20min</p>
            </BentoCard>
            
            <BentoCard variant="pastel" pastelColor="lavender" className="p-6 h-48 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-onyx" />
                  <span className="text-[10px] font-bold text-onyx/50 uppercase tracking-widest">Stress Indicator</span>
                </div>
                <div className="h-12 flex items-center">
                  <svg viewBox="0 0 100 40" className="w-full h-full text-onyx/20">
                    <path d="M0 30 Q 25 10 50 30 T 100 10" fill="none" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-heading text-onyx font-black">High</p>
            </BentoCard>
          </div>
        </section>

        {/* Mood Summary Card - Matches Image Right Screen Middle */}
        <section className="px-6 mb-8">
          <BentoCard variant="vibrant" className="p-8 relative overflow-hidden min-h-[220px]">
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-onyx/40 uppercase tracking-[0.2em] mb-4">Monthly Mood Summary</p>
              <h3 className="text-[44px] font-heading text-onyx leading-none font-black mb-4">Happy</h3>
              <p className="text-sm font-bold text-onyx/60 max-w-[180px]">You're feeling calm and optimistic. Keep up the good vibes!</p>
            </div>
            <div className="absolute right-[-20px] bottom-[-20px] scale-[1.5] opacity-20">
              <div className="text-[120px]">😊</div>
            </div>
          </BentoCard>
        </section>

        {/* Bottom Performance Stats - Matches Image Right Screen Bottom */}
        <section className="px-6 mb-8">
          <BentoCard className="p-8 border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
            <div className="grid grid-cols-3 gap-8">
              <div>
                <p className="text-[10px] font-bold text-charcoal/40 uppercase tracking-widest mb-4">Activity</p>
                <p className="text-xl font-heading text-onyx font-black">101,513</p>
                <p className="text-[10px] font-bold text-charcoal/30 uppercase tracking-widest mt-1">Steps</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-charcoal/40 uppercase tracking-widest mb-4">Therapy</p>
                <p className="text-xl font-heading text-onyx font-black">10/30</p>
                <p className="text-[10px] font-bold text-charcoal/30 uppercase tracking-widest mt-1">Sessions</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-charcoal/40 uppercase tracking-widest mb-4">Discipline</p>
                <p className="text-xl font-heading text-onyx font-black">88%</p>
                <p className="text-[10px] font-bold text-charcoal/30 uppercase tracking-widest mt-1">Focus Score</p>
              </div>
            </div>
          </BentoCard>
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
