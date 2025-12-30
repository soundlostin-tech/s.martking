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
  Swords
} from "lucide-react";
import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

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

export default function Profile() {
  const { user, profile: authProfile, loading: authLoading } = useAuth();
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
    try {
      // Fetch stories
      const { data: storiesData } = await supabase
        .from("stories")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });
      
      setStories(storiesData || []);

      // Fetch matches via participants
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
      
      const matchesData = participantsData?.map(p => p.matches) || [];
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
      // Refreshing via window for simplicity to update useAuth state
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#5FD3BC] animate-spin" />
      </div>
    );
  }

  const stats = [
    { label: "Matches", value: profile?.matches_played || 0, color: "bg-white", textColor: "text-blue-500" },
    { label: "Followers", value: profile?.followers_count || 0, color: "bg-white", textColor: "text-[#5FD3BC]" },
    { label: "Following", value: profile?.following_count || 0, color: "bg-white", textColor: "text-purple-500" }
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#1A1A1A] font-sans selection:bg-[#5FD3BC]/30">
      <main className="pb-[80px]">
        {/* New Style Header Section */}
        <section className="px-5 pt-8 pb-4">
          <p className="text-[12px] font-bold text-[#6B7280] uppercase tracking-wide mb-2">
            Arena Identity
          </p>
          <h2 className="text-[32px] font-heading text-[#1A1A1A] leading-tight font-bold">
            My Profile
          </h2>
          <p className="text-[12px] font-bold text-[#6B7280] uppercase tracking-wide mt-1">
            Statistics & Reputation
          </p>
        </section>

        {/* Profile Header Section */}
        <section className="px-5 pt-4 pb-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl p-[3px] bg-gradient-to-tr from-[#5FD3BC] via-emerald-400 to-teal-400 shadow-[0_10px_20px_rgba(95,211,188,0.2)]">
                <div className="w-full h-full rounded-[21px] bg-white p-[3px]">
                  <Avatar className="w-full h-full rounded-[18px]">
                    <AvatarImage src={profile?.avatar_url || ""} />
                    <AvatarFallback className="bg-[#F3F4F6] text-2xl font-heading font-bold text-[#9CA3AF] uppercase">
                      {profile?.full_name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#1A1A1A] rounded-xl border-4 border-white flex items-center justify-center text-white shadow-lg">
                <Camera size={14} strokeWidth={3} />
              </button>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl font-heading font-black tracking-tight text-[#1A1A1A]">{profile?.full_name || "Arena Player"}</h2>
                <div className="bg-[#5FD3BC] text-white px-2.5 py-0.5 rounded-lg">
                  <span className="text-[9px] font-bold uppercase tracking-wider">{profile?.role || "Player"}</span>
                </div>
              </div>
              <p className="text-sm text-[#6B7280] font-bold mt-1">@{profile?.username || "username"}</p>
              
              <div className="flex gap-2 mt-4">
                <Link href="/wallet" className="flex items-center gap-1.5 bg-white border border-[#E5E7EB] px-3 py-1.5 rounded-lg shadow-sm hover:bg-[#F9FAFB] transition-colors">
                  <div className="w-4 h-4 rounded bg-emerald-100 flex items-center justify-center">
                    <TrendingUp size={10} className="text-emerald-600" />
                  </div>
                  <span className="text-[10px] font-bold text-[#1A1A1A]">₹{profile?.total_posts || 0}</span>
                </Link>
                <button className="flex items-center gap-1.5 bg-white border border-[#E5E7EB] px-3 py-1.5 rounded-lg shadow-sm hover:bg-[#F9FAFB] transition-colors">
                  <Settings size={12} className="text-[#6B7280]" />
                  <span className="text-[10px] font-bold text-[#1A1A1A]">Settings</span>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3">
            {stats.map((stat, i) => (
              <div key={i} className={`text-center py-4 px-2 rounded-2xl bg-white border border-[#E5E7EB] shadow-[2px_8px_16px_rgba(0,0,0,0.04)]`}>
                <p className={`text-xl font-heading font-black ${stat.textColor}`}>{stat.value}</p>
                <p className="text-[9px] uppercase tracking-widest text-[#6B7280] font-bold mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 space-y-4">
            {profile?.bio && (
              <p className="text-sm text-[#4B5563] font-medium leading-relaxed bg-white/50 p-4 rounded-2xl border border-[#E5E7EB]">
                {profile.bio}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              {profile?.youtube_link && (
                <a href={profile.youtube_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#FF0000]/5 text-[#FF0000] px-4 py-2 rounded-xl text-xs font-bold border border-[#FF0000]/10 hover:bg-[#FF0000]/10 transition-all">
                  <Play size={14} fill="#FF0000" />
                  <span>YouTube</span>
                </a>
              )}
              {profile?.team_site && (
                <a href={profile.team_site} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-bold border border-blue-100 hover:bg-blue-100 transition-all">
                  <ExternalLink size={14} />
                  <span>Team Site</span>
                </a>
              )}
              {profile?.tournament_stats_url && (
                <a href={profile.tournament_stats_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-purple-50 text-purple-600 px-4 py-2 rounded-xl text-xs font-bold border border-purple-100 hover:bg-purple-100 transition-all">
                  <Trophy size={14} />
                  <span>Stats</span>
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Performance Metrics Section */}
        <section className="px-5 mt-4">
          <BentoCard variant="vibrant" className="p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
              <BarChart3 size={120} className="text-[#1A1A1A]" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/50 backdrop-blur-sm flex items-center justify-center border border-white/50 shadow-sm">
                    <TrendingUp size={20} className="text-[#1A1A1A]" />
                  </div>
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]/60">Arena Analytics</h3>
                    <p className="text-sm font-heading font-bold text-[#1A1A1A]">Performance Metrics</p>
                  </div>
                </div>
                <Link href="/analytics" className="w-8 h-8 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
                  <ChevronRight size={18} />
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/40 backdrop-blur-md rounded-2xl p-4 border border-white/40 shadow-sm">
                  <p className="text-[9px] text-[#6B7280] font-bold uppercase tracking-tight mb-1">Win Rate</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-2xl font-heading font-black text-[#1A1A1A]">{profile?.win_rate || 0}%</span>
                  </div>
                </div>
                <div className="bg-white/40 backdrop-blur-md rounded-2xl p-4 border border-white/40 shadow-sm">
                  <p className="text-[9px] text-[#6B7280] font-bold uppercase tracking-tight mb-1">Arena Rank</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-2xl font-heading font-black text-[#1A1A1A]">#{profile?.rank || "---"}</span>
                  </div>
                </div>
                <div className="bg-white/40 backdrop-blur-md rounded-2xl p-4 border border-white/40 shadow-sm">
                  <p className="text-[9px] text-[#6B7280] font-bold uppercase tracking-tight mb-1">MVP Count</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-2xl font-heading font-black text-[#1A1A1A]">{profile?.mvp_count || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </BentoCard>
        </section>

        {/* Action Buttons */}
        <section className="px-5 mt-8 flex gap-3">
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex-[2] bg-[#1A1A1A] hover:bg-black text-white h-14 rounded-2xl text-sm font-bold shadow-xl transition-all active:scale-[0.98]">
                Edit Arena Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-none text-[#1A1A1A] max-w-[95%] sm:max-w-[425px] rounded-3xl shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-heading font-bold">Edit Profile</DialogTitle>
                <DialogDescription className="text-[#6B7280] font-medium">
                  Update your public arena presence.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-6 max-h-[60vh] overflow-y-auto no-scrollbar pr-1">
                <div className="grid gap-2">
                  <Label htmlFor="full_name" className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Display Name</Label>
                  <Input 
                    id="full_name" 
                    value={editForm.full_name} 
                    onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                    className="bg-[#F3F4F6] border-none h-12 rounded-xl focus:ring-2 focus:ring-[#5FD3BC]/50 font-medium" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="username" className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Username</Label>
                  <Input 
                    id="username" 
                    value={editForm.username} 
                    onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                    className="bg-[#F3F4F6] border-none h-12 rounded-xl focus:ring-2 focus:ring-[#5FD3BC]/50 font-medium" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bio" className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Arena Bio</Label>
                  <Textarea 
                    id="bio" 
                    value={editForm.bio} 
                    onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                    className="bg-[#F3F4F6] border-none rounded-xl focus:ring-2 focus:ring-[#5FD3BC]/50 min-h-[100px] font-medium" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="youtube" className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">YouTube Channel</Label>
                  <Input 
                    id="youtube" 
                    value={editForm.youtube_link} 
                    onChange={(e) => setEditForm({...editForm, youtube_link: e.target.value})}
                    placeholder="https://youtube.com/@channel"
                    className="bg-[#F3F4F6] border-none h-12 rounded-xl focus:ring-2 focus:ring-[#5FD3BC]/50 font-medium" 
                  />
                </div>
              </div>
              <DialogFooter className="mt-2">
                <Button 
                  onClick={handleSaveProfile} 
                  disabled={isSaving}
                  className="w-full bg-[#1A1A1A] hover:bg-black text-white font-bold h-14 rounded-2xl shadow-lg"
                >
                  {isSaving ? <Loader2 className="animate-spin" /> : "Save Changes"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button 
            variant="outline"
            onClick={handleShare}
            className="flex-1 bg-white border-[#E5E7EB] hover:bg-[#F9FAFB] h-14 rounded-2xl text-sm font-bold shadow-sm transition-all active:scale-[0.98]"
          >
            Share
          </Button>
        </section>

        {/* Highlights Strip */}
        <section className="mt-12">
          <div className="px-5 mb-4">
            <h3 className="text-sm font-heading font-bold text-[#1A1A1A] uppercase tracking-widest">Highlights</h3>
          </div>
          <div className="flex gap-6 overflow-x-auto no-scrollbar px-5 pb-4">
            <div className="flex flex-col items-center gap-3">
              <div className="w-[72px] h-[72px] rounded-[28px] border-2 border-dashed border-[#D1D5DB] flex items-center justify-center group hover:border-[#5FD3BC] transition-all cursor-pointer bg-white">
                <Plus size={24} className="text-[#9CA3AF] group-hover:text-[#5FD3BC] transition-all" />
              </div>
              <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest">Add Clip</span>
            </div>
            {stories.map((h, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <div className="w-[72px] h-[72px] rounded-[28px] p-[3px] bg-gradient-to-tr from-purple-400 via-[#5FD3BC] to-teal-400 shadow-md">
                  <div className="w-full h-full rounded-[25px] bg-white p-[2px]">
                    <div className="w-full h-full rounded-[23px] overflow-hidden relative bg-[#F3F4F6]">
                      <img 
                        src={h.media_url} 
                        alt="" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                        {h.media_type === "video" ? <Play size={16} fill="white" className="text-white" /> : <Trophy size={16} className="text-white" />}
                      </div>
                    </div>
                  </div>
                </div>
                <span className="text-[9px] font-bold text-[#1A1A1A] uppercase tracking-widest truncate max-w-[70px]">
                  {h.caption || `Clip ${i+1}`}
                </span>
              </div>
            ))}
            {stories.length === 0 && (
              <>
                <div className="flex flex-col items-center gap-3 opacity-40">
                  <div className="w-[72px] h-[72px] rounded-[28px] bg-white flex items-center justify-center border border-[#E5E7EB] shadow-sm">
                    <Trophy size={22} className="text-[#9CA3AF]" />
                  </div>
                  <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest">Wins</span>
                </div>
                <div className="flex flex-col items-center gap-3 opacity-40">
                  <div className="w-[72px] h-[72px] rounded-[28px] bg-white flex items-center justify-center border border-[#E5E7EB] shadow-sm">
                    <Target size={22} className="text-[#9CA3AF]" />
                  </div>
                  <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest">Clutch</span>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Tabs and Content Grid */}
        <section className="mt-8">
          <Tabs defaultValue="grid" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="w-full bg-white h-16 p-0 rounded-none border-t border-b border-[#E5E7EB] sticky top-0 z-40">
              <TabsTrigger 
                value="grid" 
                className="flex-1 h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-4 data-[state=active]:border-[#1A1A1A] data-[state=active]:text-[#1A1A1A] transition-all text-[#9CA3AF]"
              >
                <Grid size={20} strokeWidth={2.5} />
              </TabsTrigger>
              <TabsTrigger 
                value="reels" 
                className="flex-1 h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-4 data-[state=active]:border-[#1A1A1A] data-[state=active]:text-[#1A1A1A] transition-all text-[#9CA3AF]"
              >
                <Play size={20} strokeWidth={2.5} />
              </TabsTrigger>
              <TabsTrigger 
                value="saved" 
                className="flex-1 h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-4 data-[state=active]:border-[#1A1A1A] data-[state=active]:text-[#1A1A1A] transition-all text-[#9CA3AF]"
              >
                <Bookmark size={20} strokeWidth={2.5} />
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="grid" className="m-0 focus-visible:ring-0">
              <div className="grid grid-cols-3 gap-[1px] bg-[#E5E7EB]">
                {matches.length > 0 ? matches.map((match, i) => (
                  <motion.div 
                    key={match.id} 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="aspect-square relative group cursor-pointer bg-white overflow-hidden"
                  >
                    <div className="w-full h-full bg-[#F9FAFB] flex flex-col items-center justify-center p-4">
                      <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-2">
                        <Trophy size={18} className={i % 2 === 0 ? "text-[#5FD3BC]" : "text-[#D1D5DB]"} />
                      </div>
                      <p className="text-[9px] font-bold text-[#1A1A1A] uppercase tracking-tighter truncate max-w-full px-2">
                        {match.title}
                      </p>
                    </div>
                    
                    <div className="absolute top-2 left-2">
                      <div className={`px-2 py-0.5 rounded-md ${i % 2 === 0 ? "bg-[#D1FAE5] text-[#065F46]" : "bg-[#FEE2E2] text-[#B91C1C]"} shadow-sm`}>
                        <span className="text-[8px] font-bold uppercase">{i % 2 === 0 ? "WIN" : "LOSS"}</span>
                      </div>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded-full bg-[#5FD3BC] flex items-center justify-center">
                            <Target size={10} className="text-white" />
                          </div>
                          <span className="text-[10px] font-bold text-white">MVP</span>
                        </div>
                        <span className="text-[9px] text-white/80 font-bold">{new Date(match.start_time).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                  </motion.div>
                )) : (
                  Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="aspect-square bg-[#F9FAFB] flex items-center justify-center opacity-30">
                      <Trophy size={24} className="text-[#9CA3AF]" />
                    </div>
                  ))
                )}
              </div>
              {matches.length === 0 && (
                <div className="py-24 text-center bg-white">
                  <div className="w-20 h-20 rounded-full bg-[#F9FAFB] flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <Swords size={32} className="text-[#D1D5DB]" />
                  </div>
                  <h4 className="text-lg font-heading font-bold text-[#1A1A1A]">No Match History</h4>
                  <p className="text-sm text-[#6B7280] font-medium mt-1 max-w-[200px] mx-auto">Join a tournament to start your arena legacy.</p>
                  <Link href="/matches" className="mt-8 block px-8">
                    <Button className="w-full bg-[#1A1A1A] hover:bg-black text-white rounded-2xl h-14 font-bold shadow-xl">
                      EXPLORE MATCHES
                    </Button>
                  </Link>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="reels" className="m-0 min-h-[400px] flex flex-col items-center justify-center text-[#9CA3AF] bg-white">
              <div className="w-20 h-20 rounded-full bg-[#F9FAFB] flex items-center justify-center mb-6 shadow-sm">
                <Play size={32} className="text-[#D1D5DB]" />
              </div>
              <p className="text-sm font-heading font-bold text-[#1A1A1A] uppercase tracking-[0.2em]">No Match Clips</p>
              <p className="text-xs text-[#6B7280] mt-2 font-medium uppercase">Record your gameplay to show off!</p>
            </TabsContent>

            <TabsContent value="saved" className="m-0 min-h-[400px] flex flex-col items-center justify-center text-[#9CA3AF] bg-white">
              <div className="w-20 h-20 rounded-full bg-[#F9FAFB] flex items-center justify-center mb-6 shadow-sm">
                <Bookmark size={32} className="text-[#D1D5DB]" />
              </div>
              <p className="text-sm font-heading font-bold text-[#1A1A1A] uppercase tracking-[0.2em]">Saved Collections</p>
              <p className="text-xs text-[#6B7280] mt-2 font-medium uppercase">Save tournaments or players here</p>
            </TabsContent>
          </Tabs>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
