"use client";

import { motion, AnimatePresence } from "framer-motion";
import { BottomNav } from "@/components/layout/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { 
  IndianRupee, Trophy, Swords, ChevronRight, Calendar, 
  ArrowRight, Star, Users, Play, Target, Zap, Plus,
  TrendingUp, Award, Clock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
    <div className="min-h-screen bg-white">
      <main className="pb-24 overflow-x-hidden">
        <TopHeader />

        {/* Stories - Native App Pattern */}
        <section className="pt-8 pb-4">
          <div className="flex gap-4 overflow-x-auto no-scrollbar px-6">
            {user && (
              <div className="flex-shrink-0 flex flex-col items-center gap-2">
                <div 
                  onClick={() => {
                    const myStories = stories.filter(s => s.user_id === user.id);
                    if (myStories.length > 0) openStory(user.id);
                    else setIsUploadOpen(true);
                  }}
                  className={`relative w-[72px] h-[72px] rounded-full p-[2px] flex items-center justify-center border-2 ${
                    stories.some(s => s.user_id === user.id) 
                      ? 'border-primary' 
                      : 'border-dashed border-foreground/10'
                  }`}
                >
                  <div className="w-full h-full rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    {user.user_metadata?.avatar_url ? (
                      <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg font-bold text-foreground/20">{user.email?.[0].toUpperCase()}</span>
                    )}
                  </div>
                  {!stories.some(s => s.user_id === user.id) && (
                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-primary rounded-full border-2 border-white flex items-center justify-center text-white shadow-md">
                      <Plus size={14} />
                    </div>
                  )}
                </div>
                <span className="text-[9px] font-bold text-foreground/40 uppercase tracking-tighter">Your Story</span>
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
                  <div className={`w-[72px] h-[72px] rounded-full p-[2.5px] border-2 ${
                    hasStory ? 'border-primary' : 'border-transparent bg-foreground/[0.03]'
                  }`}>
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden border border-foreground/5">
                      {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-lg font-bold text-foreground/10">{profile.full_name?.[0]}</span>
                      )}
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-tighter ${hasStory ? 'text-foreground' : 'text-foreground/30'}`}>
                    {profile.full_name?.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Native Section Header */}
        <section className="px-6 pt-8 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-heading text-foreground">Active Battles</h2>
            <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">Jump into the action</p>
          </div>
          <Link href="/matches" className="text-[11px] font-bold text-primary px-3 py-1 bg-primary/5 rounded-full active:opacity-50 transition-opacity">
            View All
          </Link>
        </section>

        {/* Vertical Feed of Match Cards - Native Mobile Style */}
        <section className="px-6 space-y-4">
          {featuredMatches.map((match, i) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white rounded-3xl p-5 border border-foreground/[0.04] shadow-sm active:shadow-md transition-all flex items-center gap-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center flex-shrink-0">
                {match.status === 'live' ? (
                  <div className="relative">
                    <Play size={24} className="text-primary" fill="currentColor" />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-accent rounded-full border-2 border-white animate-pulse" />
                  </div>
                ) : (
                  <Swords size={24} className="text-primary" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md ${
                    match.status === 'live' ? 'bg-primary text-white' : 'bg-foreground/5 text-foreground/40'
                  }`}>
                    {match.status}
                  </span>
                  <span className="text-[10px] text-foreground/30 font-bold">• {match.mode}</span>
                </div>
                <h3 className="text-base font-bold text-foreground truncate">{match.title}</h3>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1">
                    <Trophy size={12} className="text-accent" />
                    <span className="text-xs font-bold text-foreground/60">₹{match.tournament?.prize_pool}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={12} className="text-foreground/20" />
                    <span className="text-xs font-bold text-foreground/60">24/48</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <span className="text-[10px] font-bold text-foreground/20">ENTRY</span>
                <span className="text-sm font-bold text-foreground">₹{match.tournament?.entry_fee}</span>
              </div>
            </motion.div>
          ))}
        </section>

        {/* Quick Actions Grid - Native App Pattern */}
        <section className="px-6 pt-12">
          <h2 className="text-xl font-heading text-foreground mb-4">Quick Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-3xl p-6 border border-foreground/[0.04] shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                <TrendingUp size={20} className="text-accent" />
              </div>
              <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest block mb-1">Total Wins</span>
              <span className="text-2xl font-bold text-foreground">124</span>
            </div>
            <div className="bg-white rounded-3xl p-6 border border-foreground/[0.04] shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Award size={20} className="text-primary" />
              </div>
              <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest block mb-1">Pro Rank</span>
              <span className="text-2xl font-bold text-foreground">#42</span>
            </div>
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
