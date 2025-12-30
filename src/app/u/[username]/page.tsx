"use client";

import { use } from "react";
import { BottomNav } from "@/components/layout/BottomNav";
import { BentoCard } from "@/components/ui/BentoCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft,
  Grid,
  Play,
  Trophy,
  Share2,
  ExternalLink,
  Swords,
  Youtube,
  Users as LucideUsers,
  Target,
  BarChart3,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface PublicProfile {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  role: string;
  win_rate: number;
  matches_played: number;
  followers_count: number;
  following_count: number;
  bio: string | null;
  youtube_link: string | null;
  team_site: string | null;
  tournament_stats_url: string | null;
  rank: number;
  mvp_count: number;
}

export default function UserProfile({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const router = useRouter();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    setLoading(true);
    setError(false);
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .or(`username.eq.${username},id.eq.${username}`)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      const { data: participantsData, error: participantsError } = await supabase
        .from("participants")
        .select(`
          match_id,
          matches (
            id,
            title,
            status,
            start_time
          )
        `)
        .eq("user_id", profileData.id)
        .order("joined_at", { ascending: false })
        .limit(12);

      if (participantsError) throw participantsError;
      
      const matchesData = participantsData?.map(p => p.matches).filter(Boolean) || [];
      setMatches(matchesData);
      
      const { data: videosData } = await supabase
        .from("videos")
        .select("*")
        .eq("user_id", profileData.id)
        .order("created_at", { ascending: false });
      
      setVideos(videosData || []);

    } catch (err) {
      console.error("Error fetching public profile:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `${profile?.full_name || "Smartking's Arena"} Operative`,
      text: `Analyze this combat profile on Smartking's Arena!`,
      url: window.location.href
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(window.location.href);
      }
    } catch (err) {}
  };

  if (loading) return <LoadingScreen />;

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#F8F6F0] flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-3xl font-heading font-black text-[#1A1A1A] mb-4">SIGNAL LOST</h2>
        <p className="text-[11px] text-[#6B7280] font-black uppercase tracking-[0.2em] mb-10">Operative could not be located in the Arena database.</p>
        <Button onClick={() => router.push("/")} className="w-full max-w-[240px] h-16 bg-[#1A1A1A] text-white rounded-[24px] font-black uppercase tracking-widest shadow-2xl">
          RETURN TO HQ
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#1A1A1A] relative">
      <header className="fixed top-0 left-0 right-0 h-20 bg-[#F8F6F0]/80 backdrop-blur-md z-[50] border-b border-[#1A1A1A]/5 flex items-center justify-between px-5">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center text-[#1A1A1A]">
          <ArrowLeft size={20} strokeWidth={3} />
        </button>
        <h1 className="text-lg font-heading font-black tracking-tighter uppercase">OPERATIVE PROFILE</h1>
        <button onClick={handleShare} className="w-10 h-10 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center text-[#1A1A1A]">
          <Share2 size={20} strokeWidth={3} />
        </button>
      </header>

      <main className="pt-24 pb-[100px]">
        <section className="px-5 pt-4 pb-8">
          <div className="flex items-center gap-8">
            <div className="w-32 h-32 rounded-[48px] p-[5px] bg-[#1A1A1A] shadow-2xl rotate-3">
              <div className="w-full h-full rounded-[43px] bg-white p-[4px]">
                <Avatar className="w-full h-full rounded-[39px]">
                  <AvatarImage src={profile.avatar_url || ""} />
                  <AvatarFallback className="bg-[#F3F4F6] text-4xl font-black">{profile.full_name?.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-heading font-black tracking-tighter leading-tight">{profile.full_name}</h2>
              <p className="text-sm text-[#6B7280] font-black uppercase tracking-widest">@{profile.username}</p>
              <div className="mt-4 inline-flex items-center gap-2 bg-[#6EBF8B] text-[#1A1A1A] px-4 py-2 rounded-full shadow-md">
                <Zap size={12} fill="#1A1A1A" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{profile.role}</span>
              </div>
            </div>
          </div>

          <div className="mt-10 space-y-6">
            {profile.bio && (
              <div className="text-sm text-[#4B5563] font-bold leading-relaxed bg-white p-6 rounded-[32px] border-2 border-[#E5E7EB] shadow-lg">
                {profile.bio}
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              {profile.youtube_link && (
                <a href={profile.youtube_link} className="flex items-center gap-3 bg-[#FF0000] text-white px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">
                  <Youtube size={16} strokeWidth={3} />
                  <span>INTEL FEED</span>
                </a>
              )}
            </div>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { label: "Battles", value: profile.matches_played, color: "mint", icon: Swords },
              { label: "Allies", value: profile.followers_count, color: "blue", icon: LucideUsers },
              { label: "Targeting", value: profile.following_count, color: "pink", icon: Target }
            ].map((stat, i) => (
              <BentoCard key={i} variant={stat.color as any} className="text-center py-7 shadow-xl">
                <stat.icon size={16} className="mx-auto mb-2 opacity-40" />
                <p className="text-2xl font-heading font-black text-[#1A1A1A] tracking-tighter">{stat.value}</p>
                <p className="text-[9px] uppercase tracking-widest text-[#1A1A1A]/60 font-black mt-1">{stat.label}</p>
              </BentoCard>
            ))}
          </div>
        </section>

        <section className="px-5">
          <BentoCard variant="purple" className="p-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-8">
              <TrendingUp size={24} className="text-[#1A1A1A]" />
              <p className="text-xl font-heading font-black uppercase tracking-tight">Efficiency Matrix</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/40 backdrop-blur-md rounded-[24px] p-5 border border-white/40">
                <p className="text-[9px] font-black uppercase tracking-widest mb-2">WIN RATIO</p>
                <span className="text-3xl font-heading font-black">{profile.win_rate}%</span>
              </div>
              <div className="bg-white/40 backdrop-blur-md rounded-[24px] p-5 border border-white/40">
                <p className="text-[9px] font-black uppercase tracking-widest mb-2">RANK</p>
                <span className="text-3xl font-heading font-black">#{profile.rank}</span>
              </div>
              <div className="bg-white/40 backdrop-blur-md rounded-[24px] p-5 border border-white/40">
                <p className="text-[9px] font-black uppercase tracking-widest mb-2">MVP</p>
                <span className="text-3xl font-heading font-black">{profile.mvp_count}</span>
              </div>
            </div>
          </BentoCard>
        </section>

        <section className="mt-8">
          <Tabs defaultValue="grid" className="w-full">
            <TabsList className="w-full bg-white h-20 p-0 rounded-none border-y-2 border-[#E5E7EB]">
              <TabsTrigger value="grid" className="flex-1 h-full rounded-none"><Grid size={24} /></TabsTrigger>
              <TabsTrigger value="reels" className="flex-1 h-full rounded-none"><Play size={24} /></TabsTrigger>
            </TabsList>
            <TabsContent value="grid" className="m-0 focus-visible:ring-0">
              <div className="grid grid-cols-3 gap-1 bg-[#E5E7EB] p-1">
                {matches.map((match, i) => (
                  <div key={match.id} className="aspect-square relative overflow-hidden">
                    <BentoCard variant="mint" className="w-full h-full p-0 rounded-none flex items-center justify-center">
                      <Trophy size={20} />
                    </BentoCard>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="reels" className="m-0 focus-visible:ring-0">
              <div className="grid grid-cols-2 gap-2 p-4">
                {videos.length > 0 ? (
                  videos.map((video) => (
                    <div key={video.id} className="aspect-[9/16] relative rounded-2xl overflow-hidden bg-[#F3F4F6] shadow">
                      <video src={video.video_url} className="w-full h-full object-cover" muted playsInline />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-3 pointer-events-none">
                        <p className="text-[10px] font-black text-white uppercase truncate">{video.title}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 py-20 text-center">
                    <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest">No footage available</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
