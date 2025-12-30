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
  Swords,
  Youtube,
  Users as LucideUsers,
  Target,
  TrendingUp,
  Zap,
  FileText,
  UserPlus,
  UserCheck,
  Eye,
  Heart,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import Link from "next/link";

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
  const { user } = useAuth(false);
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followPending, setFollowPending] = useState(false);

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

      const [participantsRes, videosRes, postsRes] = await Promise.all([
        supabase
          .from("participants")
          .select(`match_id, matches (id, title, status, start_time)`)
          .eq("user_id", profileData.id)
          .order("joined_at", { ascending: false })
          .limit(12),
        supabase
          .from("videos")
          .select("*")
          .eq("user_id", profileData.id)
          .eq("is_public", true)
          .order("created_at", { ascending: false }),
        supabase
          .from("posts")
          .select("*")
          .eq("user_id", profileData.id)
          .eq("is_public", true)
          .order("created_at", { ascending: false }),
      ]);

      const matchesData = participantsRes.data?.map(p => p.matches).filter(Boolean) || [];
      setMatches(matchesData);
      setVideos(videosRes.data || []);
      setPosts(postsRes.data || []);

      if (user && user.id !== profileData.id) {
        const { data: followData } = await supabase
          .from("follows")
          .select("id")
          .eq("follower_id", user.id)
          .eq("following_id", profileData.id)
          .single();
        setIsFollowing(!!followData);
      }
    } catch (err) {
      console.error("Error fetching public profile:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!user) {
      toast.error("Please sign in to follow");
      return;
    }
    if (!profile || user.id === profile.id) return;
    if (followPending) return;

    setFollowPending(true);
    const newFollowing = !isFollowing;
    setIsFollowing(newFollowing);

    try {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          follower_id: user.id,
          following_id: profile.id,
          action: newFollowing ? "follow" : "unfollow",
        }),
      });

      if (!res.ok) throw new Error();
      toast.success(newFollowing ? "Following!" : "Unfollowed");
      
      setProfile(prev => prev ? {
        ...prev,
        followers_count: newFollowing 
          ? (prev.followers_count || 0) + 1 
          : Math.max(0, (prev.followers_count || 0) - 1)
      } : prev);
    } catch {
      setIsFollowing(!newFollowing);
      toast.error("Failed to update follow");
    } finally {
      setFollowPending(false);
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
        toast.success("Link copied!");
      }
    } catch {}
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

  const isOwnProfile = user?.id === profile.id;

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#1A1A1A] relative">
      <header className="fixed top-0 left-0 right-0 h-16 bg-[#F8F6F0]/80 backdrop-blur-md z-[50] border-b border-[#1A1A1A]/5 flex items-center justify-between px-4">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center text-[#1A1A1A]">
          <ArrowLeft size={18} strokeWidth={3} />
        </button>
        <h1 className="text-sm font-heading font-black tracking-tight uppercase">@{profile.username}</h1>
        <button onClick={handleShare} className="w-10 h-10 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center text-[#1A1A1A]">
          <Share2 size={18} strokeWidth={3} />
        </button>
      </header>

      <main className="pt-20 pb-24">
        <section className="px-4 pb-6">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-2xl p-[3px] bg-[#1A1A1A] shadow-lg">
              <div className="w-full h-full rounded-[13px] bg-white p-[2px]">
                <Avatar className="w-full h-full rounded-[11px]">
                  <AvatarImage src={profile.avatar_url || ""} />
                  <AvatarFallback className="bg-[#F3F4F6] text-2xl font-black">{profile.full_name?.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-heading font-black tracking-tight leading-tight truncate">{profile.full_name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 bg-[#6EBF8B] text-[#1A1A1A] rounded text-[8px] font-black uppercase tracking-wide">
                  {profile.role}
                </span>
                <span className="text-[10px] text-[#6B7280] font-bold">Rank #{profile.rank || "--"}</span>
              </div>
            </div>
          </div>

          {profile.bio && (
            <p className="mt-4 text-xs text-[#4B5563] leading-relaxed">{profile.bio}</p>
          )}

          <div className="flex items-center gap-3 mt-4">
            {!isOwnProfile && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleFollow}
                disabled={followPending}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide flex items-center justify-center gap-2 transition-colors ${
                  isFollowing
                    ? "bg-white border-2 border-[#E5E7EB] text-[#6B7280]"
                    : "bg-[#1A1A1A] text-white"
                }`}
              >
                {isFollowing ? <UserCheck size={14} /> : <UserPlus size={14} />}
                {isFollowing ? "Following" : "Follow"}
              </motion.button>
            )}
            {profile.youtube_link && (
              <a href={profile.youtube_link} target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-xl bg-[#FF0000] flex items-center justify-center">
                <Youtube size={18} className="text-white" />
              </a>
            )}
          </div>

          <div className="grid grid-cols-4 gap-2 mt-6">
            {[
              { label: "Posts", value: posts.length },
              { label: "Followers", value: profile.followers_count || 0 },
              { label: "Following", value: profile.following_count || 0 },
              { label: "Win %", value: `${profile.win_rate || 0}%` },
            ].map((stat, i) => (
              <div key={i} className="text-center py-3 bg-white rounded-xl border border-[#E5E7EB]">
                <p className="text-base font-heading font-black text-[#1A1A1A]">{stat.value}</p>
                <p className="text-[8px] uppercase tracking-wide text-[#6B7280] font-bold mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full bg-white h-12 p-0 rounded-none border-y border-[#E5E7EB] grid grid-cols-3">
            <TabsTrigger value="posts" className="h-full rounded-none data-[state=active]:bg-[#F3F4F6] flex items-center justify-center gap-1.5">
              <FileText size={16} />
              <span className="text-[10px] font-bold">{posts.length}</span>
            </TabsTrigger>
            <TabsTrigger value="videos" className="h-full rounded-none data-[state=active]:bg-[#F3F4F6] flex items-center justify-center gap-1.5">
              <Play size={16} />
              <span className="text-[10px] font-bold">{videos.length}</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="h-full rounded-none data-[state=active]:bg-[#F3F4F6] flex items-center justify-center gap-1.5">
              <Trophy size={16} />
              <span className="text-[10px] font-bold">{matches.length}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="m-0 p-1">
            {posts.length > 0 ? (
              <div className="grid grid-cols-3 gap-1">
                {posts.map((post) => (
                  <Link key={post.id} href={`/p/${post.slug}`} className="aspect-square relative overflow-hidden bg-[#F3F4F6]">
                    {post.thumbnail_url ? (
                      <img src={post.thumbnail_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#A8E6CF] to-[#A8D8EA]">
                        <FileText size={24} className="text-white/50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                      <div className="flex items-center gap-3 text-white">
                        <span className="flex items-center gap-1 text-xs font-bold">
                          <Heart size={14} fill="white" /> {post.like_count || 0}
                        </span>
                        <span className="flex items-center gap-1 text-xs font-bold">
                          <Eye size={14} /> {post.view_count || 0}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <FileText size={32} className="mx-auto text-[#D1D5DB] mb-3" />
                <p className="text-xs text-[#6B7280] font-bold">No posts yet</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="videos" className="m-0 p-1">
            {videos.length > 0 ? (
              <div className="grid grid-cols-3 gap-1">
                {videos.map((video) => (
                  <Link key={video.id} href={`/v/${video.slug}`} className="aspect-[9/16] relative overflow-hidden bg-[#1A1A1A]">
                    {video.thumbnail_url ? (
                      <img src={video.thumbnail_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <video src={video.video_url} className="w-full h-full object-cover" muted preload="metadata" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-2">
                      <div className="flex items-center gap-2">
                        <Play size={10} className="text-white" fill="white" />
                        <span className="text-[9px] font-bold text-white">{video.view_count || 0}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <Play size={32} className="mx-auto text-[#D1D5DB] mb-3" />
                <p className="text-xs text-[#6B7280] font-bold">No videos yet</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="stats" className="m-0 p-4 space-y-4">
            <BentoCard variant="purple" className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp size={18} className="text-[#1A1A1A]" />
                <p className="text-sm font-heading font-black uppercase tracking-tight">Performance</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/40 rounded-xl p-3 text-center">
                  <p className="text-[8px] font-black uppercase tracking-wide text-[#1A1A1A]/60 mb-1">Win Rate</p>
                  <span className="text-xl font-heading font-black">{profile.win_rate}%</span>
                </div>
                <div className="bg-white/40 rounded-xl p-3 text-center">
                  <p className="text-[8px] font-black uppercase tracking-wide text-[#1A1A1A]/60 mb-1">Rank</p>
                  <span className="text-xl font-heading font-black">#{profile.rank || "--"}</span>
                </div>
                <div className="bg-white/40 rounded-xl p-3 text-center">
                  <p className="text-[8px] font-black uppercase tracking-wide text-[#1A1A1A]/60 mb-1">MVP</p>
                  <span className="text-xl font-heading font-black">{profile.mvp_count || 0}</span>
                </div>
              </div>
            </BentoCard>

            <div className="space-y-2">
              <h4 className="text-xs font-black text-[#6B7280] uppercase tracking-wide px-1">Recent Battles</h4>
              {matches.length > 0 ? (
                matches.slice(0, 5).map((match: any, i) => {
                  const colors = ["mint", "blue", "pink", "yellow", "coral"];
                  return (
                    <BentoCard key={match.id} variant={colors[i % colors.length] as any} size="compact" className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white/40 flex items-center justify-center">
                        <Swords size={14} className="text-[#1A1A1A]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-[#1A1A1A] truncate">{match.title}</p>
                        <p className="text-[9px] text-[#1A1A1A]/60 font-bold uppercase">{match.status}</p>
                      </div>
                    </BentoCard>
                  );
                })
              ) : (
                <div className="py-8 text-center bg-white rounded-xl border border-[#E5E7EB]">
                  <p className="text-xs text-[#6B7280] font-bold">No battle history</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <BottomNav />
    </div>
  );
}
