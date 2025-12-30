"use client";

import { BottomNav } from "@/components/layout/BottomNav";
import { BentoCard } from "@/components/ui/BentoCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
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
  Loader2,
  Camera,
  Swords,
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
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { Skeleton } from "@/components/ui/skeleton";

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
    const { user, profile: authProfile, loading: authLoading } = useAuth(true);
    const [activeTab, setActiveTab] = useState("grid");
    const [videos, setVideos] = useState<any[]>([]);
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [editForm, setEditForm] = useState({
      full_name: "",
      username: "",
      bio: "",
      youtube_link: "",
      team_site: "",
      tournament_stats_url: ""
    });
    const [uploadForm, setUploadForm] = useState({
      title: "",
      description: ""
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);

    const profile = authProfile as unknown as ProfileExtended;

    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    const ALLOWED_TYPES = ["video/mp4", "video/quicktime", "video/x-msvideo", "video/x-matroska"];

    const validateFile = (file: File) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return "Unsupported video format. Please use MP4, MOV, or AVI.";
      }
      if (file.size > MAX_FILE_SIZE) {
        return "Video size exceeds 50MB limit.";
      }
      return null;
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const error = validateFile(file);
      if (error) {
        toast.error(error);
        return;
      }

      setSelectedFile(file);
    };

    const handleVideoUpload = async () => {
      if (!selectedFile || !user) return;

      if (!uploadForm.title) {
        toast.error("Please enter a title for your video");
        return;
      }

      setIsUploadingVideo(true);
      setUploadProgress(0);
      setUploadError(null);

      try {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `videos/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('videos')
          .upload(filePath, selectedFile, {
            onUploadProgress: (progress) => {
              const percent = (progress.loaded / progress.total) * 100;
              setUploadProgress(Math.round(percent));
            }
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('videos')
          .getPublicUrl(filePath);

        const { error: videoError } = await supabase
          .from('videos')
          .insert({
            user_id: user.id,
            video_url: publicUrl,
            title: uploadForm.title,
            description: uploadForm.description,
            thumbnail_url: publicUrl
          });

        if (videoError) throw videoError;

        toast.success("Combat footage uploaded to Arena Feeds");
        setIsUploadDialogOpen(false);
        setUploadForm({ title: "", description: "" });
        setSelectedFile(null);
        setUploadProgress(0);
        fetchData();
      } catch (error: any) {
        console.error("Upload error:", error);
        setUploadError(error.message || "Failed to upload footage");
        toast.error(error.message || "Failed to upload footage");
      } finally {
        setIsUploadingVideo(false);
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
      <div className="min-h-screen bg-[#F8F6F0] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4 shadow-inner">
          <AlertCircle size={28} className="text-red-500" />
        </div>
        <h2 className="text-xl font-heading font-black text-[#1A1A1A] tracking-tight uppercase mb-2">COMMS FAILURE</h2>
        <p className="text-[9px] text-[#6B7280] font-black uppercase tracking-widest mb-6 max-w-[240px]">Unable to establish link with Arena HQ.</p>
        <Button onClick={fetchData} className="h-12 px-6 bg-[#1A1A1A] text-white rounded-xl font-black uppercase tracking-wide text-xs gap-2">
          <RefreshCcw size={14} />
          RETRY
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#1A1A1A] relative">
      <main className="pt-4 pb-20 relative z-10">
        <header className="px-4 mb-4">
          <p className="text-[9px] font-black text-[#6B7280] uppercase tracking-[0.2em] mb-1">OPERATIVE IDENTITY</p>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-[#1A1A1A] tracking-tight uppercase leading-none">MY PROFILE</h1>
        </header>

        <section className="px-4 pt-2 pb-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[20px] p-[3px] bg-[#1A1A1A] shadow-lg rotate-2 transition-all">
                <div className="w-full h-full rounded-[17px] bg-white p-[2px]">
                  <Avatar className="w-full h-full rounded-[15px] border-2 border-[#F3F4F6]">
                    <AvatarImage src={profile?.avatar_url || ""} className="object-cover" />
                    <AvatarFallback className="bg-[#F3F4F6] text-2xl font-heading font-black text-[#9CA3AF] uppercase">
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
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#1A1A1A] rounded-xl border-[3px] border-[#F8F6F0] flex items-center justify-center text-white shadow-lg z-20"
              >
                {isUploadingAvatar ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} strokeWidth={3} />}
              </motion.button>
              <div className="absolute top-0 -right-1 w-5 h-5 rounded-full bg-[#6EBF8B] border-[3px] border-[#F8F6F0] shadow z-20" />
            </div>
            
            <div className="flex-1 min-w-0 space-y-1.5">
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-6 w-32 rounded-lg" />
                  <Skeleton className="h-4 w-24 rounded-md" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              ) : (
                <>
                  <h2 className="text-lg sm:text-xl font-heading font-black tracking-tight text-[#1A1A1A] leading-tight truncate">{profile?.full_name || "Arena Operative"}</h2>
                  <p className="text-[10px] text-[#6B7280] font-black uppercase tracking-widest truncate">@{profile?.username || "identity_unknown"}</p>
                  <div className="inline-flex items-center gap-1.5 bg-[#1A1A1A] text-white px-3 py-1 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#6EBF8B] animate-pulse" />
                    <span className="text-[8px] font-black uppercase tracking-widest">{profile?.role || "Operative"}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {!loading && profile?.bio && (
            <div className="mt-4 text-xs text-[#4B5563] font-medium leading-relaxed bg-white p-4 rounded-2xl border border-[#1A1A1A]/5 shadow-sm">
              {profile.bio}
            </div>
          )}
          
          <div className="flex flex-wrap gap-2 mt-4">
            {!loading && profile?.youtube_link && (
              <a href={profile.youtube_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#FF0000] text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wide shadow-md">
                <Youtube size={14} strokeWidth={3} />
                <span>FEED</span>
              </a>
            )}
            {!loading && profile?.team_site && (
              <a href={profile.team_site} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#1A1A1A] text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wide shadow-md">
                <ExternalLink size={14} strokeWidth={3} />
                <span>HQ</span>
              </a>
            )}
            {!loading && profile?.tournament_stats_url && (
              <a href={profile.tournament_stats_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#FEF3C7] text-[#1A1A1A] px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wide shadow-md">
                <Trophy size={14} strokeWidth={3} />
                <span>RECORDS</span>
              </a>
            )}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { label: "Battles", value: profile?.matches_played || 0, color: "mint", icon: Swords },
              { label: "Allies", value: profile?.followers_count || 0, color: "blue", icon: LucideUsers },
              { label: "Following", value: profile?.following_count || 0, color: "pink", icon: Target }
            ].map((stat, i) => (
              <BentoCard key={i} variant={stat.color as any} size="compact" className="text-center shadow-md border-none">
                <stat.icon size={14} className="mx-auto mb-1.5 opacity-40" strokeWidth={3} />
                {loading ? (
                  <Skeleton className="h-6 w-10 mx-auto rounded" />
                ) : (
                  <>
                    <p className="text-xl font-heading font-black text-[#1A1A1A] tracking-tight leading-none">{stat.value}</p>
                    <p className="text-[8px] uppercase tracking-widest text-[#1A1A1A]/50 font-black mt-1">{stat.label}</p>
                  </>
                )}
              </BentoCard>
            ))}
          </div>
        </section>

        <section className="px-4">
          <BentoCard variant="purple" size="default" className="relative overflow-hidden shadow-lg border-none">
            <div className="absolute top-0 right-0 p-4 opacity-[0.06]">
              <BarChart3 size={80} className="text-[#1A1A1A]" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white shadow flex items-center justify-center">
                  <TrendingUp size={18} className="text-[#1A1A1A]" strokeWidth={3} />
                </div>
                <div>
                  <p className="text-[8px] font-black uppercase tracking-widest text-[#1A1A1A]/40">PERFORMANCE</p>
                  <p className="text-sm font-heading font-black text-[#1A1A1A] tracking-tight">Efficiency Matrix</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "WIN %", value: `${profile?.win_rate || 0}%`, icon: Zap },
                  { label: "RANK", value: `#${profile?.rank || "--"}`, icon: Crown },
                  { label: "MVP", value: profile?.mvp_count || 0, icon: Award }
                ].map((item, i) => (
                  <div key={i} className="bg-white/50 backdrop-blur rounded-xl p-2.5 text-center border border-white/40">
                    <item.icon size={12} className="mx-auto mb-1 opacity-30" />
                    <p className="text-[7px] text-[#6B7280] font-black uppercase tracking-wide mb-0.5">{item.label}</p>
                    {loading ? <Skeleton className="h-5 w-12 mx-auto rounded" /> : <span className="text-lg font-heading font-black text-[#1A1A1A] tracking-tight leading-none">{item.value}</span>}
                  </div>
                ))}
              </div>
            </div>
          </BentoCard>
        </section>

        <section className="px-4 mt-4 flex gap-3">
          <motion.button 
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsEditDialogOpen(true)}
            className="flex-[2] bg-[#1A1A1A] text-white h-12 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2"
          >
            <Settings size={14} />
            EDIT PROFILE
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsUploadDialogOpen(true)}
            className="flex-1 bg-[#6EBF8B] text-white h-12 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2"
          >
            <Video size={14} strokeWidth={3} />
            UPLOAD
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.98 }}
            onClick={handleShare}
            className="flex-1 bg-white border-2 border-[#1A1A1A] text-[#1A1A1A] h-12 rounded-xl text-[10px] font-black uppercase tracking-widest shadow flex items-center justify-center gap-2"
          >
            <Share2 size={14} strokeWidth={3} />
            SHARE
          </motion.button>
        </section>

        <section className="mt-6">
          <Tabs defaultValue="grid" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="w-full bg-[#F8F6F0] h-14 p-1.5 rounded-none border-t border-b border-[#1A1A1A]/5 sticky top-0 z-40">
              <TabsTrigger 
                value="grid" 
                className="flex-1 h-full rounded-xl data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-white data-[state=active]:shadow transition-all text-[#9CA3AF] font-black"
              >
                <div className="flex flex-col items-center gap-0.5">
                  <Grid size={16} strokeWidth={3} />
                  <span className="text-[7px] uppercase tracking-wide">GRID</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="reels" 
                className="flex-1 h-full rounded-xl data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-white data-[state=active]:shadow transition-all text-[#9CA3AF] font-black"
              >
                <div className="flex flex-col items-center gap-0.5">
                  <Play size={16} strokeWidth={3} />
                  <span className="text-[7px] uppercase tracking-wide">FEEDS</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="saved" 
                className="flex-1 h-full rounded-xl data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-white data-[state=active]:shadow transition-all text-[#9CA3AF] font-black"
              >
                <div className="flex flex-col items-center gap-0.5">
                  <Bookmark size={16} strokeWidth={3} />
                  <span className="text-[7px] uppercase tracking-wide">SAVED</span>
                </div>
              </TabsTrigger>
            </TabsList>

            
            <TabsContent value="grid" className="m-0 focus-visible:ring-0">
              <div className="grid grid-cols-3 gap-0.5 bg-[#E5E7EB] p-0.5">
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
                        transition={{ delay: i * 0.03 }}
                        className="aspect-square relative group cursor-pointer overflow-hidden"
                      >
                        <BentoCard variant={color} className="w-full h-full p-0 rounded-none flex flex-col items-center justify-center text-center">
                          <Trophy size={14} strokeWidth={3} className="text-[#1A1A1A]" />
                          <p className="text-[7px] font-black text-[#1A1A1A] uppercase tracking-tight mt-1 px-1 truncate w-full">
                            {match.title}
                          </p>
                        </BentoCard>
                        
                        <div className="absolute top-1 left-1">
                          <div className="px-1 py-0.5 rounded bg-[#1A1A1A] text-white shadow">
                            <span className="text-[5px] font-black uppercase tracking-wide">LIVE</span>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })
                ) : (
                  <div className="col-span-3 py-12 text-center bg-white">
                    <div className="w-14 h-14 rounded-full bg-[#F9FAFB] flex items-center justify-center mx-auto mb-4 shadow-inner">
                      <Swords size={24} className="text-[#D1D5DB]" />
                    </div>
                    <h4 className="text-base font-heading font-black text-[#1A1A1A] tracking-tight">BATTLE LOG EMPTY</h4>
                    <p className="text-[9px] text-[#6B7280] font-bold uppercase tracking-wide mt-1">Engage in missions to record achievements.</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="reels" className="m-0 min-h-[200px] bg-white p-3">
              {videos.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {videos.map((video, i) => (
                    <div 
                      key={video.id} 
                      className="aspect-[9/16] relative rounded-2xl overflow-hidden bg-[#F3F4F6] shadow border border-white cursor-pointer"
                    >
                      <video 
                        src={video.video_url} 
                        className="w-full h-full object-cover"
                        controls={false}
                        muted
                        playsInline
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-3">
                        <p className="text-[10px] font-black text-white uppercase tracking-tight line-clamp-1">{video.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-5 h-5 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                            <Play size={10} className="text-white" fill="white" />
                          </div>
                          <span className="text-[8px] font-black text-white uppercase tracking-wide">VIDEO</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-[#9CA3AF]">
                  <div className="w-14 h-14 rounded-full bg-[#F9FAFB] flex items-center justify-center mb-4 shadow-inner">
                    <Play size={24} className="text-[#D1D5DB]" />
                  </div>
                  <p className="text-sm font-heading font-black text-[#1A1A1A] uppercase tracking-wide">NO FEEDS</p>
                  <p className="text-[9px] text-[#6B7280] mt-1 font-bold uppercase tracking-wide">Broadcast your victories!</p>
                </div>
              )}
            </TabsContent>


            <TabsContent value="saved" className="m-0 min-h-[200px] bg-white p-3">
              <div className="flex flex-col items-center justify-center py-12 text-[#9CA3AF]">
                <div className="w-14 h-14 rounded-full bg-[#F9FAFB] flex items-center justify-center mb-4 shadow-inner">
                  <Bookmark size={24} className="text-[#D1D5DB]" />
                </div>
                <p className="text-sm font-heading font-black text-[#1A1A1A] uppercase tracking-wide">ARCHIVE EMPTY</p>
                <p className="text-[9px] text-[#6B7280] mt-1 font-bold uppercase tracking-wide text-center">Save missions to access here.</p>
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </main>

      <BottomNav />

      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="p-0 border-none bg-white rounded-t-[24px] sm:rounded-[24px] overflow-hidden max-w-[100vw] sm:max-w-[400px] shadow-2xl fixed bottom-0 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 left-0 right-0 sm:left-1/2 sm:-translate-x-1/2 m-0 z-[100]">
          <div className="bg-[#6EBF8B] p-5">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
              <Video size={20} className="text-white" strokeWidth={3} />
            </div>
            <DialogTitle className="text-xl font-heading text-white leading-none font-black mb-1 tracking-tight">UPLOAD FOOTAGE</DialogTitle>
            <DialogDescription className="text-white/60 text-[9px] font-black uppercase tracking-widest text-white/70">Share your combat records</DialogDescription>
          </div>
          <div className="p-4 space-y-4">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black text-[#6B7280] uppercase tracking-widest">VIDEO TITLE</Label>
                <Input 
                  value={uploadForm.title} 
                  onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                  placeholder="Epic Victory at Arena..."
                  className="h-11 rounded-xl border-2 border-[#F5F5F5] bg-white text-sm font-bold px-4 focus:border-[#6EBF8B] focus:ring-0" 
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black text-[#6B7280] uppercase tracking-widest">DESCRIPTION</Label>
                <Textarea 
                  value={uploadForm.description} 
                  onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                  placeholder="Briefly explain the combat scenario..."
                  className="rounded-xl border-2 border-[#F5F5F5] bg-white text-xs font-medium p-3 focus:border-[#6EBF8B] focus:ring-0 min-h-[80px]" 
                />
              </div>
              
                <div className="pt-2">
                  <input 
                    type="file" 
                    ref={videoInputRef} 
                    onChange={handleFileSelect} 
                    className="hidden" 
                    accept="video/*"
                  />
                  
                  {!selectedFile ? (
                    <motion.button 
                      whileTap={{ scale: 0.98 }}
                      onClick={() => videoInputRef.current?.click()}
                      className="w-full h-32 rounded-2xl border-2 border-dashed border-[#6EBF8B]/30 bg-[#6EBF8B]/5 flex flex-col items-center justify-center gap-3 text-[#6EBF8B] transition-colors hover:bg-[#6EBF8B]/10 group"
                    >
                      <div className="w-12 h-12 rounded-full bg-[#6EBF8B]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Plus size={24} strokeWidth={3} />
                      </div>
                      <div className="text-center">
                        <p className="font-black uppercase tracking-widest text-[10px]">SELECT VIDEO FILE</p>
                        <p className="text-[8px] opacity-60 font-bold mt-1 uppercase tracking-wide">MP4, MOV, AVI (MAX 50MB)</p>
                      </div>
                    </motion.button>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-[#F9FAFB] border-2 border-[#E5E7EB] flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#1A1A1A] flex items-center justify-center text-white">
                          <Video size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-black text-[#1A1A1A] uppercase truncate">{selectedFile.name}</p>
                          <p className="text-[8px] font-bold text-[#6B7280] uppercase">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                        <button 
                          onClick={() => setSelectedFile(null)}
                          className="w-8 h-8 rounded-lg hover:bg-red-50 text-red-500 flex items-center justify-center transition-colors"
                        >
                          <AlertCircle size={18} />
                        </button>
                      </div>

                      {isUploadingVideo ? (
                        <div className="space-y-2">
                          <div className="flex justify-between items-end">
                            <p className="text-[8px] font-black text-[#6EBF8B] uppercase tracking-widest">UPLOADING TO ARENA...</p>
                            <p className="text-[10px] font-black text-[#1A1A1A]">{uploadProgress}%</p>
                          </div>
                          <div className="h-2 w-full bg-[#E5E7EB] rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-[#6EBF8B]"
                              initial={{ width: 0 }}
                              animate={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <motion.button 
                          whileTap={{ scale: 0.98 }}
                          onClick={handleVideoUpload}
                          className="w-full h-14 rounded-2xl bg-[#6EBF8B] text-white flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-[#6EBF8B]/20"
                        >
                          <Zap size={18} fill="white" />
                          CONFIRM BROADCAST
                        </motion.button>
                      )}
                    </div>
                  )}

                  {uploadError && (
                    <p className="mt-3 text-[8px] font-black text-red-500 uppercase tracking-widest text-center">{uploadError}</p>
                  )}
                </div>

            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="p-0 border-none bg-white rounded-t-[24px] sm:rounded-[24px] overflow-hidden max-w-[100vw] sm:max-w-[400px] shadow-2xl fixed bottom-0 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 left-0 right-0 sm:left-1/2 sm:-translate-x-1/2 m-0 z-[100]">
          <div className="bg-[#1A1A1A] p-5">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-3">
              <Settings size={20} className="text-white" strokeWidth={3} />
            </div>
            <DialogTitle className="text-xl font-heading text-white leading-none font-black mb-1 tracking-tight">EDIT PROFILE</DialogTitle>
            <DialogDescription className="text-white/40 text-[9px] font-black uppercase tracking-widest">Update your identity</DialogDescription>
          </div>
          <div className="p-4 space-y-4 max-h-[50vh] overflow-y-auto no-scrollbar">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black text-[#6B7280] uppercase tracking-widest">FULL NAME</Label>
                <Input 
                  value={editForm.full_name} 
                  onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                  className="h-11 rounded-xl border-2 border-[#F5F5F5] bg-white text-sm font-bold px-4 focus:border-[#1A1A1A] focus:ring-0" 
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black text-[#6B7280] uppercase tracking-widest">USERNAME</Label>
                <Input 
                  value={editForm.username} 
                  onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                  className="h-11 rounded-xl border-2 border-[#F5F5F5] bg-white text-sm font-bold px-4 focus:border-[#1A1A1A] focus:ring-0" 
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black text-[#6B7280] uppercase tracking-widest">BIO</Label>
                <Textarea 
                  value={editForm.bio} 
                  onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                  placeholder="Tell the arena about yourself..."
                  className="rounded-xl border-2 border-[#F5F5F5] bg-white text-xs font-medium p-3 focus:border-[#1A1A1A] focus:ring-0 min-h-[80px]" 
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black text-[#6B7280] uppercase tracking-widest">YOUTUBE</Label>
                <Input 
                  value={editForm.youtube_link} 
                  onChange={(e) => setEditForm({...editForm, youtube_link: e.target.value})}
                  placeholder="https://youtube.com/..."
                  className="h-11 rounded-xl border-2 border-[#F5F5F5] bg-white text-xs font-medium px-4 focus:border-[#1A1A1A] focus:ring-0" 
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black text-[#6B7280] uppercase tracking-widest">WEBSITE</Label>
                <Input 
                  value={editForm.team_site} 
                  onChange={(e) => setEditForm({...editForm, team_site: e.target.value})}
                  placeholder="https://..."
                  className="h-11 rounded-xl border-2 border-[#F5F5F5] bg-white text-xs font-medium px-4 focus:border-[#1A1A1A] focus:ring-0" 
                />
              </div>
            </div>
            <motion.button 
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveProfile} 
              disabled={isSaving}
              className="w-full h-11 bg-[#1A1A1A] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2"
            >
              {isSaving ? <Loader2 className="animate-spin" size={14} /> : "SAVE CHANGES"}
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
