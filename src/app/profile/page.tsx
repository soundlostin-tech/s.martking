"use client";

import { BottomNav } from "@/components/layout/BottomNav";
import { BentoCard } from "@/components/ui/BentoCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft,
  Settings,
  Grid,
  Play,
  Bookmark,
  Plus,
  BarChart3,
  TrendingUp,
  Target,
  Trophy,
  Share2,
  ExternalLink,
  ChevronRight,
  MoreVertical,
  Loader2,
  Camera,
  Link as LinkIcon,
  Swords,
  LogOut,
  Image as ImageIcon,
  Video,
  Award,
  Crown,
  Zap,
  Youtube,
  Users as LucideUsers,
  AlertCircle,
  RefreshCcw,
} from "lucide-react";
import { useState, useEffect, useRef, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { Skeleton } from "@/components/ui/skeleton";
import { StoryViewer } from "@/components/ui/StoryViewer";
import { useRouter } from "next/navigation";

interface ProfileExtended {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  role: string;
  win_rate: number;
  matches_played: number;
  followers_count: number;
  following_count: number;
  total_posts: number;
  bio: string | null;
  youtube_link: string | null;
  team_site: string | null;
  tournament_stats_url: string | null;
  rank: number;
  mvp_count: number;
}

function ProfileContent() {
  const { user, profile: authProfile, loading: authLoading, signOut } = useAuth(true);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("grid");
  const [stories, setStories] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  const [editForm, setEditForm] = useState({
    full_name: "",
    username: "",
    bio: "",
    youtube_link: "",
    team_site: "",
    tournament_stats_url: ""
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingClip, setIsUploadingClip] = useState(false);
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const clipInputRef = useRef<HTMLInputElement>(null);

  const profile = authProfile as unknown as ProfileExtended;

  useEffect(() => {
    if (user) {
      fetchData();
      setEditForm({
        full_name: profile?.full_name || "",
        username: profile?.username || "",
        bio: profile?.bio || "",
        youtube_link: profile?.youtube_link || "",
        team_site: profile?.team_site || "",
        tournament_stats_url: profile?.tournament_stats_url || ""
      });
    }
  }, [user, profile?.id]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [storiesRes, participantsRes] = await Promise.all([
        supabase
          .from("stories")
          .select("*")
          .eq("user_id", user?.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("participants")
          .select(`
            match_id,
            matches (
              id,
              title,
              status,
              start_time,
              live_stats
            )
          `)
          .eq("user_id", user?.id)
          .order("joined_at", { ascending: false })
          .limit(12)
      ]);

      if (storiesRes.error) throw storiesRes.error;
      if (participantsRes.error) throw participantsRes.error;

      setStories(storiesRes.data || []);
      const matchesData = participantsRes.data?.map(p => p.matches).filter(Boolean) || [];
      setMatches(matchesData);
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(err.message || "Failed to sync with Arena servers.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!editForm.username) return toast.error("Callsign is required");
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editForm.full_name,
          username: editForm.username,
          bio: editForm.bio,
          youtube_link: editForm.youtube_link,
          team_site: editForm.team_site,
          tournament_stats_url: editForm.tournament_stats_url
        })
        .eq("id", user?.id);

      if (error) throw error;
      
      toast.success("Identity updated successfully");
      setIsEditDialogOpen(false);
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || "Failed to commit changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast.success("Visual feed updated");
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || "Failed to upload avatar");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleClipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploadingClip(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `stories/${fileName}`;
      const mediaType = file.type.startsWith('video') ? 'video' : 'image';

      const { error: uploadError } = await supabase.storage
        .from('stories')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('stories')
        .getPublicUrl(filePath);

      const { error: storyError } = await supabase
        .from('stories')
        .insert({
          user_id: user.id,
          media_url: publicUrl,
          media_type: mediaType,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        });

      if (storyError) throw storyError;

      toast.success("Clip shared to Arena Highlights");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to upload clip");
    } finally {
      setIsUploadingClip(false);
    }
  };

  const handleShare = async () => {
    const profileLink = `${window.location.origin}/u/${profile?.username || user?.id}`;
    const shareData = {
      title: `${profile?.full_name || "Smartking's Arena"} Operative`,
      text: `Analyze my combat profile on Smartking's Arena!`,
      url: profileLink
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(profileLink);
        toast.success("Operative link copied to clipboard");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  if (authLoading) return <LoadingScreen />;

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8F6F0] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 rounded-[32px] bg-red-50 flex items-center justify-center mb-8 shadow-inner rotate-12">
          <AlertCircle size={48} className="text-red-500" />
        </div>
        <h2 className="text-3xl font-heading font-black text-[#1A1A1A] tracking-tighter uppercase mb-4">COMMS FAILURE</h2>
        <p className="text-[11px] text-[#6B7280] font-black uppercase tracking-[0.2em] mb-10 max-w-[280px]">Unable to establish link with Arena HQ. Signal interference detected.</p>
        <Button onClick={fetchData} className="w-full max-w-[240px] h-16 bg-[#1A1A1A] text-white rounded-[24px] font-black uppercase tracking-widest gap-3 shadow-2xl">
          <RefreshCcw size={20} />
          RETRY LINK
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#1A1A1A] relative">
      <main className="pt-8 pb-[100px] relative z-10">
        {/* Page Title Header */}
        <header className="px-5 mb-10">
          <p className="text-[12px] font-black text-[#6B7280] uppercase tracking-[0.3em] mb-2">OPERATIVE IDENTITY</p>
          <h1 className="text-5xl font-heading font-black text-[#1A1A1A] tracking-tighter uppercase leading-none">MY PROFILE</h1>
        </header>

        {/* Profile Header */}
        <section className="px-5 pt-4 pb-10">
          <div className="flex items-center gap-10">
            <div className="relative">
              <div className="w-40 h-40 rounded-[56px] p-[6px] bg-[#1A1A1A] shadow-[0_20px_50px_rgba(0,0,0,0.1)] rotate-3 transition-all hover:rotate-0 hover:scale-105">
                <div className="w-full h-full rounded-[50px] bg-white p-[5px]">
                  <Avatar className="w-full h-full rounded-[45px] border-4 border-[#F3F4F6]">
                    <AvatarImage src={profile?.avatar_url || ""} className="object-cover" />
                    <AvatarFallback className="bg-[#F3F4F6] text-5xl font-heading font-black text-[#9CA3AF] uppercase">
                      {profile?.full_name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <input 
                type="file" 
                ref={avatarInputRef} 
                onChange={handleAvatarUpload} 
                className="hidden" 
                accept="image/*"
              />
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => avatarInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute -bottom-2 -right-2 w-14 h-14 bg-[#1A1A1A] rounded-[24px] border-[6px] border-[#F8F6F0] flex items-center justify-center text-white shadow-2xl z-20"
              >
                {isUploadingAvatar ? <Loader2 size={24} className="animate-spin" /> : <Camera size={24} strokeWidth={3} />}
              </motion.button>
              
              {/* Online Status */}
              <div className="absolute top-2 -right-2 w-8 h-8 rounded-full bg-[#6EBF8B] border-[6px] border-[#F8F6F0] shadow-lg z-20" />
            </div>
            
            <div className="flex-1 space-y-4">
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-56 rounded-2xl" />
                  <Skeleton className="h-5 w-36 rounded-xl" />
                  <Skeleton className="h-10 w-28 rounded-full" />
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-2">
                    <h2 className="text-4xl font-heading font-black tracking-tighter text-[#1A1A1A] leading-none">{profile?.full_name || "Arena Operative"}</h2>
                    <p className="text-sm text-[#6B7280] font-black uppercase tracking-[0.2em]">@{profile?.username || "identity_unknown"}</p>
                  </div>
                  <div className="inline-flex items-center gap-3 bg-[#1A1A1A] text-white px-5 py-2.5 rounded-full shadow-xl">
                    <div className="w-2 h-2 rounded-full bg-[#6EBF8B] animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{profile?.role || "Operative"}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Bio & Links */}
          <div className="mt-12 space-y-8">
            {loading ? (
              <Skeleton className="h-28 w-full rounded-[40px]" />
            ) : (
              profile?.bio && (
                <div className="text-sm text-[#4B5563] font-bold leading-relaxed bg-white p-8 rounded-[40px] border-4 border-[#1A1A1A]/5 shadow-[0_10px_40px_rgba(0,0,0,0.03)] relative overflow-hidden group">
                  <div className="relative z-10">{profile.bio}</div>
                  <div className="absolute right-[-20px] bottom-[-20px] opacity-[0.05] group-hover:rotate-12 transition-all duration-500 scale-150">
                    <Target size={100} />
                  </div>
                </div>
              )
            )}
            
            <div className="flex flex-wrap gap-4">
              {!loading && profile?.youtube_link && (
                <a href={profile.youtube_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-[#FF0000] text-white px-8 py-5 rounded-[28px] text-[11px] font-black uppercase tracking-widest shadow-[0_15px_30px_rgba(255,0,0,0.2)] hover:scale-105 transition-all active:scale-95 border-b-4 border-black/20">
                  <Youtube size={20} strokeWidth={3} />
                  <span>INTEL FEED</span>
                </a>
              )}
              {!loading && profile?.team_site && (
                <a href={profile.team_site} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-[#1A1A1A] text-white px-8 py-5 rounded-[28px] text-[11px] font-black uppercase tracking-widest shadow-[0_15px_30px_rgba(0,0,0,0.2)] hover:scale-105 transition-all active:scale-95 border-b-4 border-white/10">
                  <ExternalLink size={20} strokeWidth={3} />
                  <span>HQ SITE</span>
                </a>
              )}
              {!loading && profile?.tournament_stats_url && (
                <a href={profile.tournament_stats_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-[#FEF3C7] text-[#1A1A1A] px-8 py-5 rounded-[28px] text-[11px] font-black uppercase tracking-widest shadow-[0_15px_30px_rgba(254,243,199,0.3)] hover:scale-105 transition-all active:scale-95 border-b-4 border-[#1A1A1A]/10">
                  <Trophy size={20} strokeWidth={3} />
                  <span>RECORDS</span>
                </a>
              )}
            </div>
          </div>

          {/* Stats Bento */}
          <div className="mt-12 grid grid-cols-3 gap-5">
            {[
              { label: "Battles", value: profile?.matches_played || 0, color: "mint", icon: Swords },
              { label: "Allies", value: profile?.followers_count || 0, color: "blue", icon: LucideUsers },
              { label: "Targeting", value: profile?.following_count || 0, color: "pink", icon: Target }
            ].map((stat, i) => (
              <BentoCard key={i} variant={stat.color as any} className="text-center py-10 px-4 shadow-[0_20px_40px_rgba(0,0,0,0.05)] border-none rounded-[36px] hover:scale-[1.02] transition-transform">
                <stat.icon size={20} className="mx-auto mb-3 opacity-30" strokeWidth={3} />
                {loading ? (
                  <Skeleton className="h-10 w-16 mx-auto rounded-xl" />
                ) : (
                  <>
                    <p className="text-4xl font-heading font-black text-[#1A1A1A] tracking-tighter leading-none">{stat.value}</p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#1A1A1A]/50 font-black mt-3">{stat.label}</p>
                  </>
                )}
              </BentoCard>
            ))}
          </div>
        </section>

        {/* Performance Card */}
        <section className="px-5">
          <BentoCard variant="purple" className="p-10 relative overflow-hidden group shadow-[0_30px_60px_rgba(0,0,0,0.08)] rounded-[48px] border-4 border-white">
            {/* Pattern Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            
            <div className="absolute top-0 right-0 p-8 opacity-[0.08] group-hover:scale-110 group-hover:rotate-3 transition-all duration-700">
              <BarChart3 size={180} className="text-[#1A1A1A]" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-[28px] bg-white shadow-xl flex items-center justify-center rotate-[-3deg]">
                    <TrendingUp size={32} className="text-[#1A1A1A]" strokeWidth={3} />
                  </div>
                  <div>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#1A1A1A]/40 mb-1">ARENA PERFORMANCE</h3>
                    <p className="text-3xl font-heading font-black text-[#1A1A1A] tracking-tighter">Efficiency Matrix</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-5">
                {[
                  { label: "WIN RATIO", value: `${profile?.win_rate || 0}%`, icon: Zap },
                  { label: "GLOBAL RANK", value: `#${profile?.rank || "--"}`, icon: Crown },
                  { label: "MVP MEDALS", value: profile?.mvp_count || 0, icon: Award }
                ].map((item, i) => (
                  <div key={i} className="bg-white/50 backdrop-blur-xl rounded-[32px] p-6 border border-white shadow-[0_10px_30px_rgba(0,0,0,0.02)] flex flex-col items-center text-center">
                    <item.icon size={16} className="mb-3 opacity-20" />
                    <p className="text-[10px] text-[#6B7280] font-black uppercase tracking-[0.2em] mb-2">{item.label}</p>
                    {loading ? <Skeleton className="h-10 w-20 rounded-xl" /> : <span className="text-4xl font-heading font-black text-[#1A1A1A] tracking-tighter leading-none">{item.value}</span>}
                  </div>
                ))}
              </div>
            </div>
          </BentoCard>
        </section>

        {/* Stories / Highlights */}
        <section className="mt-16">
          <div className="px-5 mb-8 flex justify-between items-center">
            <h3 className="text-sm font-black text-[#1A1A1A] uppercase tracking-[0.3em] flex items-center gap-4">
              <div className="w-8 h-8 rounded-xl bg-[#1A1A1A] flex items-center justify-center">
                <Video size={14} className="text-white" />
              </div>
              COMBAT HIGHLIGHTS
            </h3>
            <div className="h-0.5 flex-1 bg-[#1A1A1A]/5 mx-6" />
          </div>
          <div className="flex gap-8 overflow-x-auto no-scrollbar px-5 pb-8">
            <div className="flex flex-col items-center gap-4">
              <input 
                type="file" 
                ref={clipInputRef} 
                onChange={handleClipUpload} 
                className="hidden" 
                accept="image/*,video/*"
              />
              <motion.button 
                whileHover={{ scale: 1.05, borderColor: '#6EBF8B' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => clipInputRef.current?.click()}
                disabled={isUploadingClip}
                className="w-24 h-24 rounded-[40px] border-[5px] border-dashed border-[#D1D5DB] flex items-center justify-center group transition-all cursor-pointer bg-white shadow-xl"
              >
                {isUploadingClip ? <Loader2 size={32} className="animate-spin text-[#6EBF8B]" /> : <Plus size={32} strokeWidth={4} className="text-[#9CA3AF] group-hover:text-[#6EBF8B] transition-all" />}
              </motion.button>
              <span className="text-[11px] font-black text-[#6B7280] uppercase tracking-widest">UPLOAD</span>
            </div>
            
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-4">
                  <Skeleton className="w-24 h-24 rounded-[40px]" />
                  <Skeleton className="h-3 w-16 rounded-full" />
                </div>
              ))
            ) : (
              stories.map((h, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ scale: 1.05, rotate: 0 }}
                  className="flex flex-col items-center gap-4 cursor-pointer"
                  onClick={() => {
                    setSelectedStoryIndex(i);
                    setIsStoryViewerOpen(true);
                  }}
                >
                  <div className="w-24 h-24 rounded-[40px] p-[5px] bg-[#1A1A1A] shadow-2xl rotate-[-3deg] transition-all">
                    <div className="w-full h-full rounded-[35px] bg-white p-[3px]">
                      <div className="w-full h-full rounded-[32px] overflow-hidden relative bg-[#F3F4F6]">
                        <img 
                          src={h.media_url} 
                          alt="" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-all backdrop-blur-[2px]">
                          {h.media_type === "video" ? <Play size={24} fill="white" className="text-white" /> : <ImageIcon size={24} className="text-white" />}
                        </div>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-[0.1em] truncate max-w-[96px]">
                    {h.caption || `LOG ${i+1}`}
                  </span>
                </motion.div>
              ))
            )}
          </div>
        </section>

        {/* Action Buttons */}
        <section className="px-5 mt-10 flex gap-6">
          <motion.button 
            whileHover={{ y: -4 }}
            whileTap={{ y: 0 }}
            onClick={() => setIsEditDialogOpen(true)}
            className="flex-[2] bg-[#1A1A1A] text-white h-20 rounded-[32px] text-[13px] font-black uppercase tracking-[0.2em] shadow-[0_15px_40px_rgba(0,0,0,0.2)] flex items-center justify-center gap-4 border-b-8 border-black/30 transition-all"
          >
            <Settings size={20} />
            EDIT PROFILE
          </motion.button>
          <motion.button 
            whileHover={{ y: -4 }}
            whileTap={{ y: 0 }}
            onClick={handleShare}
            className="flex-1 bg-white border-4 border-[#1A1A1A] text-[#1A1A1A] h-20 rounded-[32px] text-[13px] font-black uppercase tracking-[0.2em] shadow-[0_15px_40px_rgba(0,0,0,0.05)] flex items-center justify-center gap-3 border-b-8 border-[#1A1A1A]/20 transition-all"
          >
            <Share2 size={20} strokeWidth={3} />
            SHARE
          </motion.button>
        </section>

        {/* Content Tabs */}
        <section className="mt-16">
          <Tabs defaultValue="grid" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="w-full bg-[#F8F6F0] h-24 p-2 rounded-none border-t-4 border-b-4 border-[#1A1A1A]/5 sticky top-0 z-40 backdrop-blur-md">
              <TabsTrigger 
                value="grid" 
                className="flex-1 h-full rounded-[24px] data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-white data-[state=active]:shadow-xl transition-all text-[#9CA3AF] font-black"
              >
                <div className="flex flex-col items-center gap-1">
                  <Grid size={24} strokeWidth={3} />
                  <span className="text-[9px] uppercase tracking-widest">GRID</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="reels" 
                className="flex-1 h-full rounded-[24px] data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-white data-[state=active]:shadow-xl transition-all text-[#9CA3AF] font-black"
              >
                <div className="flex flex-col items-center gap-1">
                  <Play size={24} strokeWidth={3} />
                  <span className="text-[9px] uppercase tracking-widest">FEEDS</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="saved" 
                className="flex-1 h-full rounded-[24px] data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-white data-[state=active]:shadow-xl transition-all text-[#9CA3AF] font-black"
              >
                <div className="flex flex-col items-center gap-1">
                  <Bookmark size={24} strokeWidth={3} />
                  <span className="text-[9px] uppercase tracking-widest">SAVED</span>
                </div>
              </TabsTrigger>
            </TabsList>

            
            <TabsContent value="grid" className="m-0 focus-visible:ring-0">
              <div className="grid grid-cols-3 gap-1 bg-[#E5E7EB] p-1">
                {loading ? (
                  Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="aspect-square bg-[#F3F4F6] animate-pulse" />
                  ))
                ) : matches.length > 0 ? (
                  matches.map((match, i) => {
                    const colors = ["mint", "blue", "pink", "yellow", "coral", "teal"];
                    const color = colors[i % colors.length] as any;
                    return (
                      <motion.div 
                        key={match.id} 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="aspect-square relative group cursor-pointer overflow-hidden"
                      >
                        <BentoCard variant={color} className="w-full h-full p-0 rounded-none flex flex-col items-center justify-center text-center">
                          <Trophy size={20} strokeWidth={3} className="text-[#1A1A1A]" />
                          <p className="text-[8px] font-black text-[#1A1A1A] uppercase tracking-tighter mt-2 px-2 truncate w-full">
                            {match.title}
                          </p>
                        </BentoCard>
                        
                        <div className="absolute top-1.5 left-1.5">
                          <div className="px-1.5 py-0.5 rounded-md bg-[#1A1A1A] text-white shadow-md">
                            <span className="text-[7px] font-black uppercase tracking-widest">LIVE</span>
                          </div>
                        </div>

                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                          <div className="flex items-center justify-between w-full">
                            <span className="text-[8px] text-white font-black uppercase tracking-widest">MISSION</span>
                            <span className="text-[8px] text-white/80 font-black">{new Date(match.start_time).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })
                ) : (
                  <div className="col-span-3 py-24 text-center bg-white rounded-b-[40px]">
                    <div className="w-24 h-24 rounded-full bg-[#F9FAFB] flex items-center justify-center mx-auto mb-8 shadow-inner">
                      <Swords size={40} className="text-[#D1D5DB]" />
                    </div>
                    <h4 className="text-2xl font-heading font-black text-[#1A1A1A] tracking-tighter">BATTLE LOG EMPTY</h4>
                    <p className="text-[11px] text-[#6B7280] font-black uppercase tracking-widest mt-2 max-w-[240px] mx-auto">Engage in missions to record your combat achievements.</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="reels" className="m-0 min-h-[400px] bg-white p-4">
              {stories.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {stories.map((story, i) => (
                    <div 
                      key={story.id} 
                      className="aspect-[9/16] relative rounded-[32px] overflow-hidden bg-[#F3F4F6] shadow-xl border-4 border-white cursor-pointer"
                      onClick={() => {
                        setSelectedStoryIndex(i);
                        setIsStoryViewerOpen(true);
                      }}
                    >
                      <img src={story.media_url} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                            {story.media_type === 'video' ? <Play size={14} className="text-white" fill="white" /> : <ImageIcon size={14} className="text-white" />}
                          </div>
                          <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{story.media_type} LOG</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-[#9CA3AF]">
                  <div className="w-24 h-24 rounded-full bg-[#F9FAFB] flex items-center justify-center mb-8 shadow-inner">
                    <Play size={40} className="text-[#D1D5DB]" />
                  </div>
                  <p className="text-xl font-heading font-black text-[#1A1A1A] uppercase tracking-widest">NO INTEL FEEDS</p>
                  <p className="text-[10px] text-[#6B7280] mt-3 font-black uppercase tracking-[0.2em]">Broadcast your victories to the arena!</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="saved" className="m-0 min-h-[400px] bg-white p-4">
              <div className="flex flex-col items-center justify-center py-24 text-[#9CA3AF]">
                <div className="w-24 h-24 rounded-full bg-[#F9FAFB] flex items-center justify-center mb-8 shadow-inner">
                  <Bookmark size={40} className="text-[#D1D5DB]" />
                </div>
                <p className="text-xl font-heading font-black text-[#1A1A1A] uppercase tracking-widest">ARCHIVE EMPTY</p>
                <p className="text-[10px] text-[#6B7280] mt-3 font-black uppercase tracking-[0.2em] text-center max-w-[240px]">Save mission data or Operative profiles to access them here.</p>
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </main>

      <BottomNav />

      {/* Story Viewer Component */}
      <StoryViewer 
        stories={stories} 
        initialIndex={selectedStoryIndex} 
        isOpen={isStoryViewerOpen} 
        onClose={() => setIsStoryViewerOpen(false)} 
      />

      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="p-0 border-none bg-white rounded-t-[40px] sm:rounded-[40px] overflow-hidden max-w-[100vw] sm:max-w-[480px] shadow-2xl fixed bottom-0 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 left-0 right-0 sm:left-1/2 sm:-translate-x-1/2 m-0 z-[100]">
          <div className="bg-[#1A1A1A] p-10 relative">
            <div className="w-16 h-16 rounded-[24px] bg-white/10 flex items-center justify-center mb-6 shadow-inner rotate-6">
              <Settings size={32} className="text-white" strokeWidth={3} />
            </div>
            <DialogTitle className="text-4xl font-heading text-white leading-none font-black mb-3 tracking-tighter">IDENTITY CONFIG</DialogTitle>
            <DialogDescription className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Modify Operative Parameters</DialogDescription>
          </div>
          <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto no-scrollbar">
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-[11px] font-black text-[#6B7280] uppercase tracking-widest ml-1">CALLSIGN (FULL NAME)</Label>
                <Input 
                  value={editForm.full_name} 
                  onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                  className="h-16 rounded-[20px] border-4 border-[#F5F5F5] bg-white text-lg font-black px-6 focus:border-[#1A1A1A] focus:ring-0 transition-all" 
                />
              </div>
              <div className="space-y-3">
                <Label className="text-[11px] font-black text-[#6B7280] uppercase tracking-widest ml-1">ARENA ID (USERNAME)</Label>
                <Input 
                  value={editForm.username} 
                  onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                  className="h-16 rounded-[20px] border-4 border-[#F5F5F5] bg-white text-lg font-black px-6 focus:border-[#1A1A1A] focus:ring-0 transition-all" 
                />
              </div>
              <div className="space-y-3">
                <Label className="text-[11px] font-black text-[#6B7280] uppercase tracking-widest ml-1">OPERATIVE BIO</Label>
                <Textarea 
                  value={editForm.bio} 
                  onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                  placeholder="Tell the arena about your mission..."
                  className="rounded-[24px] border-4 border-[#F5F5F5] bg-white text-sm font-bold p-6 focus:border-[#1A1A1A] focus:ring-0 transition-all min-h-[120px]" 
                />
              </div>
              <div className="space-y-3">
                <Label className="text-[11px] font-black text-[#6B7280] uppercase tracking-widest ml-1">INTEL FEED (YOUTUBE)</Label>
                <Input 
                  value={editForm.youtube_link} 
                  onChange={(e) => setEditForm({...editForm, youtube_link: e.target.value})}
                  placeholder="https://youtube.com/..."
                  className="h-16 rounded-[20px] border-4 border-[#F5F5F5] bg-white text-sm font-bold px-6 focus:border-[#1A1A1A] focus:ring-0 transition-all" 
                />
              </div>
              <div className="space-y-3">
                <Label className="text-[11px] font-black text-[#6B7280] uppercase tracking-widest ml-1">HQ SITE (WEBSITE)</Label>
                <Input 
                  value={editForm.team_site} 
                  onChange={(e) => setEditForm({...editForm, team_site: e.target.value})}
                  placeholder="https://..."
                  className="h-16 rounded-[20px] border-4 border-[#F5F5F5] bg-white text-sm font-bold px-6 focus:border-[#1A1A1A] focus:ring-0 transition-all" 
                />
              </div>
            </div>
            <motion.button 
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveProfile} 
              disabled={isSaving}
              className="w-full h-16 bg-[#1A1A1A] text-white rounded-[24px] text-sm font-black uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3"
            >
              {isSaving ? <Loader2 className="animate-spin" /> : "COMMIT CHANGES"}
            </motion.button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function Profile() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ProfileContent />
    </Suspense>
  );
}
