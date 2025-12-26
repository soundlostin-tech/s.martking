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
    <main className="min-h-screen w-full bg-background pb-32 overflow-x-hidden relative">
      <div className="mesh-bg">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-royal-gold/20 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-dark-goldenrod/10 rounded-full blur-[120px] animate-blob [animation-delay:2s]" />
      </div>
      
      <TopHeader />

      {/* Stories Section */}
      <section className="px-6 py-8 max-w-4xl mx-auto relative z-10">
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
                    ? 'bg-gradient-to-tr from-white via-dark-goldenrod to-royal-gold p-[2px]' 
                    : 'bg-muted'
                }`}
              >
                <div className="w-20 h-20 rounded-full bg-white border border-dark-goldenrod/10 flex items-center justify-center overflow-hidden shadow-2xl">
                  {user.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-2xl font-heading text-primary/30">{user.email?.[0].toUpperCase()}</div>
                  )}
                  {/* Subtle inner glow */}
                  <div className="absolute inset-0 bg-gradient-to-b from-royal-gold/10 to-transparent pointer-events-none" />
                </div>
                  {!stories.some(s => s.user_id === user.id) && (
                    <div className="absolute bottom-1 right-1 w-6 h-6 bg-primary border-2 border-white rounded-full flex items-center justify-center shadow-lg">
                      <Plus size={14} className="text-white" />
                    </div>
                  )}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">You</span>
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
                    hasStory ? 'bg-gradient-to-tr from-white via-dark-goldenrod to-royal-gold' : 'bg-transparent border border-muted'
                  }`}>
                    <div className="w-20 h-20 rounded-full bg-white border border-dark-goldenrod/10 flex items-center justify-center overflow-hidden shadow-2xl">
                      {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-2xl font-heading text-primary/30">{profile.full_name?.[0]}</div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-b from-royal-gold/10 to-transparent pointer-events-none" />
                    </div>
                    {profile.status === 'Active' && (
                      <div className="absolute bottom-1 right-1 w-5 h-5 bg-primary border-2 border-white rounded-full shadow-md" />
                    )}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${
                    hasStory ? 'text-foreground' : 'text-foreground/30'
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
      <section className="px-6 py-12 max-w-4xl mx-auto relative z-10">
        <div className="flex items-end justify-between mb-12">
          <div className="space-y-2">
            <h2 className="text-4xl font-heading text-foreground tracking-tight">Active <span className="italic font-serif opacity-60">Battles</span></h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(182,145,33,0.4)]" />
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Live tournaments in progress</p>
            </div>
          </div>
          <Link href="/matches">
            <button className="group flex items-center gap-3 px-8 py-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground hover:scale-105 transition-all shadow-xl shadow-primary/10 border border-white/20">
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
              className="group relative bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-2xl overflow-hidden hover:-translate-y-2 transition-all duration-500 border border-primary/10"
            >
              {/* Radial Glow Effects */}
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-mustard blur-[120px] rounded-full" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] bg-dark-goldenrod blur-[120px] rounded-full" />
              </div>

              <div className="relative z-10 space-y-8">
                <div className="flex items-center justify-between">
                  <Badge className={`${
                    match.status === 'live' ? 'bg-primary text-white' : 'bg-primary/10 text-primary'
                  } rounded-full text-[10px] px-4 py-1.5 font-bold border-none tracking-widest shadow-sm`}>
                    {match.status.toUpperCase()}
                  </Badge>
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((_, i) => (
                      <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-primary/5" />
                    ))}
                    <div className="w-7 h-7 rounded-full border-2 border-white bg-primary flex items-center justify-center text-[10px] font-bold text-white">+24</div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-3xl bg-primary/5 flex items-center justify-center border border-primary/10 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                    {match.status === 'live' ? (
                      <Play size={32} className="text-primary" fill="currentColor" />
                    ) : (
                      <Swords size={32} className="text-primary" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-heading text-foreground leading-tight">{match.title}</h3>
                    <p className="text-[10px] text-foreground/30 font-bold uppercase tracking-[0.3em]">{match.tournament?.title}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="bg-primary/[0.03] rounded-[2rem] p-6 border border-primary/5 flex flex-col gap-1 hover:bg-primary/[0.05] transition-colors">
                    <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">Prize Pool</span>
                    <span className="text-2xl font-heading text-foreground">₹{match.tournament?.prize_pool}</span>
                  </div>
                  <div className="bg-primary/[0.03] rounded-[2rem] p-6 border border-primary/5 flex flex-col gap-1 hover:bg-primary/[0.05] transition-colors">
                    <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">Entry Fee</span>
                    <span className="text-2xl font-heading text-foreground">₹{match.tournament?.entry_fee}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-primary/10">
                  <div className="flex items-center gap-3 text-foreground/30">
                    <Users size={16} />
                    <span className="text-xs font-serif italic">{match.mode} • {match.map || 'Bermuda'}</span>
                  </div>
                  <Link href={match.status === 'live' ? `/live?matchId=${match.id}` : '/matches'} className="w-full max-w-[140px]">
                    <button className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-primary text-white text-[11px] font-bold hover:bg-golden-earth transition-all shadow-xl active:scale-95">
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
      <section className="px-6 py-12 max-w-4xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-[3rem] bg-white/80 backdrop-blur-2xl p-12 text-center space-y-8 shadow-2xl border border-primary/20"
        >
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-royal-gold blur-[100px] rounded-full" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-dark-goldenrod blur-[100px] rounded-full" />
          </div>

          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-primary/10 border border-primary/10">
              <Trophy size={14} className="text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Grand Prize Event</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-heading text-primary">The Pro Arena <br /> <span className="italic">Championship</span></h2>
            <p className="text-lg font-serif text-foreground/60 max-w-md mx-auto">Registration opens in 48 hours. Only the top 64 warriors will be selected.</p>
            <button className="px-10 py-5 bg-primary text-white rounded-full font-serif text-lg hover:scale-105 active:scale-95 transition-all shadow-xl">
              Get Notified
            </button>
          </div>
        </motion.div>
      </section>


      <BottomNav />
    </main>
  );
}
