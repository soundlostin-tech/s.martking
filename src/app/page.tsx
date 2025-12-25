"use client";

import { motion, AnimatePresence } from "framer-motion";
import { BottomNav } from "@/components/layout/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { 
  IndianRupee, Trophy, Swords, ChevronRight, Calendar, 
  ArrowRight, Star, Users, Play, Target, Zap, Plus 
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
  
  // Story state
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  const [activeStories, setActiveStories] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      // Fetch profiles for "Stories"
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .limit(10);
      setProfiles(profileData || []);

      // Fetch active stories
      const { data: storyData } = await supabase
        .from("stories")
        .select(`
          *,
          user:profiles(full_name, avatar_url)
        `)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: true });
      setStories(storyData || []);

      // Fetch matches for "Tournament Cards"
      const { data: matchData } = await supabase
        .from("matches")
        .select(`
          *,
          tournament:tournaments(title, entry_fee, prize_pool)
        `)
        .or('status.eq.live,status.eq.upcoming')
        .order('status', { ascending: false }) // Live first
        .limit(4);
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
    <main className="min-h-screen w-full bg-zinc-50 pb-32 overflow-x-hidden">
      <TopHeader />

      {/* Stories Section */}
      <section className="px-6 py-8 max-w-4xl mx-auto">
        <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6">
          {/* My Story / Add Story */}
          {user && (
            <div className="flex-shrink-0 flex flex-col items-center gap-3">
              <div 
                onClick={() => {
                  const myStories = stories.filter(s => s.user_id === user.id);
                  if (myStories.length > 0) openStory(user.id);
                  else setIsUploadOpen(true);
                }}
                className={`relative p-1 rounded-full cursor-pointer transition-transform hover:scale-110 ${
                  stories.some(s => s.user_id === user.id) 
                    ? 'bg-gradient-to-tr from-black via-zinc-400 to-white p-[2px]' 
                    : 'bg-zinc-200'
                }`}
              >
                <div className="w-20 h-20 rounded-full bg-black border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl">
                  {user.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover opacity-80" />
                  ) : (
                    <div className="text-2xl font-heading text-white/20">{user.email?.[0].toUpperCase()}</div>
                  )}
                  {/* Subtle inner glow */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                </div>
                  {!stories.some(s => s.user_id === user.id) && (
                    <div className="absolute bottom-1 right-1 w-6 h-6 bg-white border-2 border-black rounded-full flex items-center justify-center shadow-lg">
                      <Plus size={14} className="text-black" />
                    </div>
                  )}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/60">You</span>
            </div>
          )}

          {profiles
            .filter(p => p.id !== user?.id)
            .map((profile, i) => {
              const hasStory = stories.some(s => s.user_id === profile.id);
              return (
                <motion.div 
                  key={profile.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => hasStory && openStory(profile.id)}
                  className={`flex-shrink-0 flex flex-col items-center gap-3 group ${hasStory ? 'cursor-pointer' : ''}`}
                >
                  <div className={`relative p-[2px] rounded-full transition-transform group-hover:scale-110 ${
                    hasStory ? 'bg-gradient-to-tr from-black via-zinc-400 to-white' : 'bg-transparent border border-zinc-200'
                  }`}>
                    <div className="w-20 h-20 rounded-full bg-black border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl">
                      {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover opacity-80" />
                      ) : (
                        <div className="text-2xl font-heading text-white/20">{profile.full_name?.[0]}</div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                    </div>
                    {profile.status === 'Active' && (
                      <div className="absolute bottom-1 right-1 w-5 h-5 bg-white border-2 border-black rounded-full shadow-md" />
                    )}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${
                    hasStory ? 'text-black' : 'text-black/40'
                  }`}>
                    {profile.full_name?.split(' ')[0]}
                  </span>
                </motion.div>
              );
            })}
        </div>
      </section>

      {/* Modals */}
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

      {/* Featured Tournament Cards */}
      <section className="px-6 py-12 max-w-4xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div className="space-y-2">
            <h2 className="text-4xl font-heading text-black tracking-tight">Active <span className="italic font-serif opacity-60">Battles</span></h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Live tournaments in progress</p>
            </div>
          </div>
          <Link href="/matches">
            <button className="group flex items-center gap-3 px-8 py-4 rounded-full bg-black text-[10px] font-bold text-white hover:scale-105 transition-all shadow-xl shadow-black/10 border border-white/10">
              BROWSE ALL <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {featuredMatches.map((match, i) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative bg-black rounded-[2.5rem] p-10 shadow-2xl overflow-hidden hover:-translate-y-2 transition-all duration-500 border border-white/5"
            >
              {/* Radial Glow Effects */}
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-zinc-400 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] bg-zinc-600 blur-[120px] rounded-full" />
              </div>

              <div className="relative z-10 space-y-8">
                <div className="flex items-center justify-between">
                  <Badge className={`${
                    match.status === 'live' ? 'bg-white text-black' : 'bg-white/10 text-white'
                  } rounded-full text-[10px] px-4 py-1.5 font-bold border-none tracking-widest shadow-lg`}>
                    {match.status.toUpperCase()}
                  </Badge>
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((_, i) => (
                      <div key={i} className="w-7 h-7 rounded-full border-2 border-black bg-zinc-800" />
                    ))}
                    <div className="w-7 h-7 rounded-full border-2 border-black bg-white flex items-center justify-center text-[10px] font-bold text-black">+24</div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                    {match.status === 'live' ? (
                      <Play size={32} className="text-white" fill="currentColor" />
                    ) : (
                      <Swords size={32} className="text-white" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-heading text-white leading-tight">{match.title}</h3>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.3em]">{match.tournament?.title}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="bg-white/[0.03] rounded-[2rem] p-6 border border-white/5 flex flex-col gap-1 hover:bg-white/[0.05] transition-colors">
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Prize Pool</span>
                    <span className="text-2xl font-heading text-white">₹{match.tournament?.prize_pool}</span>
                  </div>
                  <div className="bg-white/[0.03] rounded-[2rem] p-6 border border-white/5 flex flex-col gap-1 hover:bg-white/[0.05] transition-colors">
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Entry Fee</span>
                    <span className="text-2xl font-heading text-white">₹{match.tournament?.entry_fee}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-white/10">
                  <div className="flex items-center gap-3 text-white/40">
                    <Users size={16} />
                    <span className="text-xs font-serif italic">{match.mode} • {match.map || 'Bermuda'}</span>
                  </div>
                  <Link href={match.status === 'live' ? `/live?matchId=${match.id}` : '/matches'} className="w-full max-w-[140px]">
                    <button className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-white text-black text-[11px] font-bold hover:bg-zinc-200 transition-all shadow-xl active:scale-95">
                      {match.status === 'live' ? 'WATCH LIVE' : 'JOIN NOW'}
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Section (Large Banner Style) */}
      <section className="px-6 py-12 max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-[3rem] bg-black p-12 text-center space-y-8 shadow-2xl"
        >
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-zinc-200 blur-[100px] rounded-full" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-zinc-400 blur-[100px] rounded-full" />
          </div>

          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/10 border border-white/10">
              <Trophy size={14} className="text-white" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Grand Prize Event</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-heading text-white">The Pro Arena <br /> <span className="italic">Championship</span></h2>
            <p className="text-lg font-serif text-white/60 max-w-md mx-auto">Registration opens in 48 hours. Only the top 64 warriors will be selected.</p>
            <button className="px-10 py-5 bg-white text-black rounded-full font-serif text-lg hover:scale-105 active:scale-95 transition-all shadow-xl">
              Get Notified
            </button>
          </div>
        </motion.div>
      </section>

      <BottomNav />
    </main>
  );
}
