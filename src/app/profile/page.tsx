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
  Youtube
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
  const [activeTab, setActiveTab] = useState("grid");
  const [stories, setStories] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
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
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, profile?.id, authLoading]);

  const fetchData = async () => {
    try {
      const { data: storiesData } = await supabase
        .from("stories")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });
      
      setStories(storiesData || []);

      const { data: participantsData } = await supabase
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
        .limit(12);
      
      const matchesData = participantsData?.map(p => p.matches).filter(Boolean) || [];
      setMatches(matchesData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
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
      
      toast.success("Profile updated successfully");
      setIsEditDialogOpen(false);
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
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

      toast.success("Avatar updated");
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
    const shareData = {
      title: `${profile?.full_name || "Smartking's Arena"} Profile`,
      text: `Check out my esports profile on Smartking's Arena!`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Profile link copied to clipboard");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  if (authLoading || loading) return null;

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#1A1A1A] relative">
      <main className="pb-[80px] relative z-10">
        <section className="px-5 pt-8 pb-4">
          <p className="text-[12px] font-black text-[#6B7280] uppercase tracking-widest mb-2">
            Arena Intelligence
          </p>
          <div className="flex items-center justify-between">
            <h2 className="text-[36px] font-heading text-[#1A1A1A] leading-tight font-black tracking-tighter">
              MY PROFILE
            </h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-12 h-12 rounded-2xl bg-white border-2 border-[#E5E7EB] flex items-center justify-center text-[#1A1A1A] hover:bg-gray-50 shadow-lg transition-all">
                  <Settings size={22} strokeWidth={3} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 rounded-[32px] p-3 shadow-2xl border-none mt-2">
                <DropdownMenuLabel className="text-[10px] font-black text-[#6B7280] uppercase tracking-[0.2em] px-4 py-3">Operations</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[#1A1A1A]/5" />
                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)} className="rounded-2xl px-4 py-3 cursor-pointer focus:bg-[#F5F5F5]">
                  <Settings className="mr-3 h-5 w-5 text-[#1A1A1A]" />
                  <span className="font-black text-sm uppercase tracking-widest">Configuration</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShare} className="rounded-2xl px-4 py-3 cursor-pointer focus:bg-[#F5F5F5]">
                  <Share2 className="mr-3 h-5 w-5 text-[#1A1A1A]" />
                  <span className="font-black text-sm uppercase tracking-widest">Broadcast</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#1A1A1A]/5" />
                <DropdownMenuItem onClick={signOut} className="rounded-2xl px-4 py-3 cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-50">
                  <LogOut className="mr-3 h-5 w-5" />
                  <span className="font-black text-sm uppercase tracking-widest">Terminate</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </section>

        <section className="px-5 pt-4 pb-8">
          <div className="flex items-center gap-8">
            <div className="relative">
              <div className="w-28 h-28 rounded-[40px] p-[4px] bg-[#1A1A1A] shadow-2xl rotate-3 transition-transform hover:rotate-0">
                <div className="w-full h-full rounded-[36px] bg-white p-[4px]">
                  <Avatar className="w-full h-full rounded-[32px]">
                    <AvatarImage src={profile?.avatar_url || ""} />
                    <AvatarFallback className="bg-[#F3F4F6] text-3xl font-heading font-black text-[#9CA3AF] uppercase">
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
                whileTap={{ scale: 0.9 }}
                onClick={() => avatarInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#1A1A1A] rounded-2xl border-4 border-white flex items-center justify-center text-white shadow-xl z-20"
              >
                {isUploadingAvatar ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} strokeWidth={3} />}
              </motion.button>
            </div>
            
            <div className="flex-1">
              <div className="flex flex-col gap-1">
                <h2 className="text-3xl font-heading font-black tracking-tighter text-[#1A1A1A]">{profile?.full_name || "Arena Agent"}</h2>
                <p className="text-sm text-[#6B7280] font-black uppercase tracking-widest">@{profile?.username || "identity_unknown"}</p>
              </div>
              <div className="mt-4 inline-flex items-center gap-2 bg-[#A8E6CF] text-[#1A1A1A] px-4 py-1.5 rounded-full shadow-md">
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{profile?.role || "Player"}</span>
              </div>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { label: "Battles", value: profile?.matches_played || 0, color: "mint", icon: Swords },
              { label: "Allies", value: profile?.followers_count || 0, color: "blue", icon: Users },
              { label: "Targeting", value: profile?.following_count || 0, color: "pink", icon: Target }
            ].map((stat, i) => (
              <BentoCard key={i} variant={stat.color as any} className="text-center py-6 px-2 shadow-xl border-none">
                <stat.icon size={16} className="mx-auto mb-2 opacity-40" />
                <p className={`text-2xl font-heading font-black text-[#1A1A1A] tracking-tighter`}>{stat.value}</p>
                <p className="text-[9px] uppercase tracking-widest text-[#1A1A1A]/60 font-black mt-1">{stat.label}</p>
              </BentoCard>
            ))}
          </div>

          <div className="mt-8 space-y-6">
            {profile?.bio && (
              <div className="text-sm text-[#4B5563] font-bold leading-relaxed bg-white p-6 rounded-[32px] border-2 border-[#E5E7EB] shadow-lg relative overflow-hidden group">
                {profile.bio}
                <div className="absolute right-[-10px] bottom-[-10px] opacity-[0.03] group-hover:rotate-12 transition-transform">
                  <Zap size={60} />
                </div>
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              {profile?.youtube_link && (
                <a href={profile.youtube_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-[#FF0000] text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-transform">
                  <Youtube size={16} strokeWidth={3} />
                  <span>INTEL FEED</span>
                </a>
              )}
              {profile?.team_site && (
                <a href={profile.team_site} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-[#1A1A1A] text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-transform">
                  <ExternalLink size={16} strokeWidth={3} />
                  <span>HQ SITE</span>
                </a>
              )}
              {profile?.tournament_stats_url && (
                <a href={profile.tournament_stats_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-[#FEF3C7] text-[#1A1A1A] px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-transform">
                  <Trophy size={16} strokeWidth={3} />
                  <span>RECORDS</span>
                </a>
              )}
            </div>
          </div>
        </section>

        <section className="px-5 pt-4">
          <BentoCard variant="purple" className="p-8 relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 p-6 opacity-[0.05] group-hover:scale-110 transition-transform">
              <BarChart3 size={140} className="text-[#1A1A1A]" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[20px] bg-white/50 flex items-center justify-center shadow-sm">
                    <TrendingUp size={24} className="text-[#1A1A1A]" />
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1A1A1A]/60">MISSION ANALYSIS</h3>
                    <p className="text-xl font-heading font-black text-[#1A1A1A] tracking-tight">Efficiency Metrics</p>
                  </div>
                </div>
                <Link href="/analytics" className="w-10 h-10 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-xl">
                  <ChevronRight size={20} strokeWidth={3} />
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/40 backdrop-blur-md rounded-[24px] p-5 border border-white/40 shadow-sm">
                  <p className="text-[9px] text-[#6B7280] font-black uppercase tracking-widest mb-2">WIN RATIO</p>
                  <span className="text-3xl font-heading font-black text-[#1A1A1A] tracking-tighter">{profile?.win_rate || 0}%</span>
                </div>
                <div className="bg-white/40 backdrop-blur-md rounded-[24px] p-5 border border-white/40 shadow-sm">
                  <p className="text-[9px] text-[#6B7280] font-black uppercase tracking-widest mb-2">ARENA RANK</p>
                  <span className="text-3xl font-heading font-black text-[#1A1A1A] tracking-tighter">#{profile?.rank || "--"}</span>
                </div>
                <div className="bg-white/40 backdrop-blur-md rounded-[24px] p-5 border border-white/40 shadow-sm">
                  <p className="text-[9px] text-[#6B7280] font-black uppercase tracking-widest mb-2">MVP TITLES</p>
                  <span className="text-3xl font-heading font-black text-[#1A1A1A] tracking-tighter">{profile?.mvp_count || 0}</span>
                </div>
              </div>
            </div>
          </BentoCard>
        </section>

        <section className="px-5 mt-10 flex gap-4">
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsEditDialogOpen(true)}
            className="flex-[2] bg-[#1A1A1A] text-white h-16 rounded-[24px] text-[12px] font-black uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3"
          >
            CONFIGURE IDENTITY
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={handleShare}
            className="flex-1 bg-white border-2 border-[#E5E7EB] text-[#1A1A1A] h-16 rounded-[24px] text-[12px] font-black uppercase tracking-[0.2em] shadow-lg flex items-center justify-center"
          >
            BROADCAST
          </motion.button>
        </section>

        <section className="mt-12">
          <div className="px-5 mb-6 flex justify-between items-center">
            <h3 className="text-sm font-black text-[#1A1A1A] uppercase tracking-[0.2em]">INTEL LOGS</h3>
            <div className="h-0.5 flex-1 bg-[#1A1A1A]/5 mx-4" />
          </div>
          <div className="flex gap-6 overflow-x-auto no-scrollbar px-5 pb-6">
            <div className="flex flex-col items-center gap-3">
              <input 
                type="file" 
                ref={clipInputRef} 
                onChange={handleClipUpload} 
                className="hidden" 
                accept="image/*,video/*"
              />
              <motion.button 
                whileTap={{ scale: 0.92 }}
                onClick={() => clipInputRef.current?.click()}
                disabled={isUploadingClip}
                className="w-20 h-20 rounded-[32px] border-4 border-dashed border-[#D1D5DB] flex items-center justify-center group hover:border-[#A8E6CF] transition-all cursor-pointer bg-white shadow-sm"
              >
                {isUploadingClip ? <Loader2 size={28} className="animate-spin text-[#5FD3BC]" /> : <Plus size={28} strokeWidth={4} className="text-[#9CA3AF] group-hover:text-[#5FD3BC] transition-all" />}
              </motion.button>
              <span className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest">ADD LOG</span>
            </div>
            {stories.map((h, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 rounded-[32px] p-[4px] bg-[#1A1A1A] shadow-xl rotate-[-2deg] transition-transform hover:rotate-0">
                  <div className="w-full h-full rounded-[28px] bg-white p-[2px]">
                    <div className="w-full h-full rounded-[26px] overflow-hidden relative bg-[#F3F4F6]">
                      <img 
                        src={h.media_url} 
                        alt="" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        {h.media_type === "video" ? <Play size={20} fill="white" className="text-white" /> : <ImageIcon size={20} className="text-white" />}
                      </div>
                    </div>
                  </div>
                </div>
                <span className="text-[9px] font-black text-[#1A1A1A] uppercase tracking-widest truncate max-w-[80px]">
                  {h.caption || `LOG ${i+1}`}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <Tabs defaultValue="grid" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="w-full bg-white h-20 p-0 rounded-none border-t-2 border-b-2 border-[#E5E7EB] sticky top-0 z-40">
              <TabsTrigger 
                value="grid" 
                className="flex-1 h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-4 data-[state=active]:border-[#1A1A1A] data-[state=active]:text-[#1A1A1A] transition-all text-[#9CA3AF]"
              >
                <Grid size={24} strokeWidth={3} />
              </TabsTrigger>
              <TabsTrigger 
                value="reels" 
                className="flex-1 h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-4 data-[state=active]:border-[#1A1A1A] data-[state=active]:text-[#1A1A1A] transition-all text-[#9CA3AF]"
              >
                <Play size={24} strokeWidth={3} />
              </TabsTrigger>
              <TabsTrigger 
                value="saved" 
                className="flex-1 h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-4 data-[state=active]:border-[#1A1A1A] data-[state=active]:text-[#1A1A1A] transition-all text-[#9CA3AF]"
              >
                <Bookmark size={24} strokeWidth={3} />
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="grid" className="m-0 focus-visible:ring-0">
              <div className="grid grid-cols-3 gap-1 bg-[#E5E7EB] p-1">
                {matches.length > 0 ? matches.map((match, i) => {
                   const colors = ["mint", "blue", "pink", "yellow"];
                   const color = colors[i % colors.length] as any;
                   return (
                    <motion.div 
                      key={match.id} 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="aspect-square relative group cursor-pointer overflow-hidden rounded-xl"
                    >
                      <BentoCard variant={color} className="w-full h-full p-0 rounded-none flex flex-col items-center justify-center text-center">
                        <Trophy size={20} strokeWidth={3} className={i % 2 === 0 ? "text-[#1A1A1A]" : "text-[#1A1A1A]/30"} />
                        <p className="text-[8px] font-black text-[#1A1A1A] uppercase tracking-tighter mt-2 px-2 truncate w-full">
                          {match.title}
                        </p>
                      </BentoCard>
                      
                      <div className="absolute top-1.5 left-1.5">
                        <div className={`px-1.5 py-0.5 rounded-md ${i % 2 === 0 ? "bg-[#1A1A1A] text-white" : "bg-white/60 text-[#1A1A1A]"} shadow-md`}>
                          <span className="text-[7px] font-black uppercase tracking-widest">{i % 2 === 0 ? "W" : "L"}</span>
                        </div>
                      </div>

                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[8px] text-white font-black uppercase tracking-widest">MISSION</span>
                          <span className="text-[8px] text-white/80 font-black">{new Date(match.start_time).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}) : (
                  Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="aspect-square bg-[#F9FAFB] rounded-xl flex items-center justify-center opacity-30">
                      <Trophy size={24} className="text-[#9CA3AF]" />
                    </div>
                  ))
                )}
              </div>
              {matches.length === 0 && (
                <div className="py-24 text-center bg-white rounded-b-[40px]">
                  <div className="w-24 h-24 rounded-full bg-[#F9FAFB] flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <Swords size={40} className="text-[#D1D5DB]" />
                  </div>
                  <h4 className="text-2xl font-heading font-black text-[#1A1A1A] tracking-tighter">MISSION LOG EMPTY</h4>
                  <p className="text-[11px] text-[#6B7280] font-black uppercase tracking-widest mt-2 max-w-[240px] mx-auto">Deploy to the arena to begin recording your legacy.</p>
                  <Link href="/matches" className="mt-10 block px-10">
                    <motion.button 
                      whileTap={{ scale: 0.95 }}
                      className="w-full bg-[#1A1A1A] text-white rounded-[24px] h-16 font-black uppercase tracking-[0.2em] shadow-2xl"
                    >
                      FIND MISSION
                    </motion.button>
                  </Link>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="reels" className="m-0 min-h-[400px] bg-white p-4">
              {stories.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {stories.map((story, i) => (
                    <div key={story.id} className="aspect-[9/16] relative rounded-[32px] overflow-hidden bg-[#F3F4F6] shadow-xl border-4 border-white">
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
                  <p className="text-xl font-heading font-black text-[#1A1A1A] uppercase tracking-widest">NO FEEDS</p>
                  <p className="text-[10px] text-[#6B7280] mt-3 font-black uppercase tracking-[0.2em]">Broadcast your victories to the arena!</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="saved" className="m-0 min-h-[400px] bg-white p-4">
              <div className="flex flex-col items-center justify-center py-24 text-[#9CA3AF]">
                <div className="w-24 h-24 rounded-full bg-[#F9FAFB] flex items-center justify-center mb-8 shadow-inner">
                  <Bookmark size={40} className="text-[#D1D5DB]" />
                </div>
                <p className="text-xl font-heading font-black text-[#1A1A1A] uppercase tracking-widest">VAULT EMPTY</p>
                <p className="text-[10px] text-[#6B7280] mt-3 font-black uppercase tracking-[0.2em] text-center max-w-[240px]">Secure mission data or operative profiles to view them here.</p>
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  className="mt-10 bg-white border-2 border-[#E5E7EB] text-[#1A1A1A] px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg"
                >
                  EXPLORE ARCHIVES
                </motion.button>
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </main>

      <BottomNav />

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
                <Label className="text-[11px] font-black text-[#6B7280] uppercase tracking-widest ml-1">CALLSIGN (NAME)</Label>
                <Input 
                  value={editForm.full_name} 
                  onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                  className="h-16 rounded-[20px] border-4 border-[#F5F5F5] bg-white text-lg font-black px-6 focus:border-[#1A1A1A] focus:ring-0 transition-all" 
                />
              </div>
              <div className="space-y-3">
                <Label className="text-[11px] font-black text-[#6B7280] uppercase tracking-widest ml-1">ID TAG (USERNAME)</Label>
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
                  className="rounded-[24px] border-4 border-[#F5F5F5] bg-white text-sm font-bold p-6 focus:border-[#1A1A1A] focus:ring-0 transition-all min-h-[120px]" 
                />
              </div>
              <div className="space-y-3">
                <Label className="text-[11px] font-black text-[#6B7280] uppercase tracking-widest ml-1">FEED URL (YOUTUBE)</Label>
                <Input 
                  value={editForm.youtube_link} 
                  onChange={(e) => setEditForm({...editForm, youtube_link: e.target.value})}
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
