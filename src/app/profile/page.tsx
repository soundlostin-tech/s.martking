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
  Link as LinkIcon
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
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#5FD3BC] animate-spin" />
      </div>
    );
  }

  const stats = [
    { label: "Matches", value: profile?.matches_played || 0, color: "from-blue-500/20 to-blue-500/5", textColor: "text-blue-400" },
    { label: "Followers", value: profile?.followers_count || 0, color: "from-emerald-500/20 to-emerald-500/5", textColor: "text-[#5FD3BC]" },
    { label: "Following", value: profile?.following_count || 0, color: "from-purple-500/20 to-purple-500/5", textColor: "text-purple-400" }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-[#5FD3BC]/30">
      <main className="pb-[80px]">
        {/* Top Navigation */}
        <header className="sticky top-0 z-50 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/5 px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-1 hover:bg-white/5 rounded-full transition-colors">
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-xl font-bold tracking-tight">Profile</h1>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={handleShare} className="p-1 hover:bg-white/5 rounded-full transition-colors">
              <Share2 size={22} />
            </button>
            <button className="p-1 hover:bg-white/5 rounded-full transition-colors">
              <Settings size={22} />
            </button>
          </div>
        </header>

        {/* Profile Header Section */}
        <section className="px-5 pt-6 pb-4">
          <div className="flex items-start justify-between">
            <div className="relative">
              <div className="w-24 h-24 rounded-full p-[3px] bg-gradient-to-tr from-[#5FD3BC] via-emerald-500 to-teal-500 shadow-[0_0_30px_rgba(95,211,188,0.15)]">
                <div className="w-full h-full rounded-full bg-[#0A0A0A] p-[3px]">
                  <Avatar className="w-full h-full">
                    <AvatarImage src={profile?.avatar_url || ""} />
                    <AvatarFallback className="bg-[#1A1A1A] text-2xl font-bold text-white/50 uppercase">
                      {profile?.full_name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#5FD3BC] rounded-full border-4 border-[#0A0A0A] flex items-center justify-center text-black">
                <Camera size={14} strokeWidth={3} />
              </button>
            </div>
            
            <div className="flex-1 flex justify-around pl-4 pt-4">
              {stats.map((stat, i) => (
                <div key={i} className={`text-center p-2 rounded-xl bg-gradient-to-b ${stat.color} border border-white/5 min-w-[70px]`}>
                  <p className={`text-xl font-black ${stat.textColor}`}>{stat.value}</p>
                  <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black tracking-tight">{profile?.full_name || "Arena Player"}</h2>
              <div className="bg-[#5FD3BC]/10 border border-[#5FD3BC]/20 px-2.5 py-0.5 rounded-full">
                <span className="text-[10px] font-bold text-[#5FD3BC] uppercase tracking-wider">{profile?.role || "Player"}</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 font-medium mt-0.5">@{profile?.username || "username"}</p>
          </div>

          <div className="mt-4 space-y-3">
            {profile?.bio && (
              <p className="text-sm text-gray-300 leading-relaxed max-w-[95%]">
                {profile.bio}
              </p>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {profile?.youtube_link && (
                <a href={profile.youtube_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#5FD3BC] text-xs font-bold hover:underline transition-all">
                  <Play size={14} className="fill-[#5FD3BC]" />
                  <span>YouTube</span>
                </a>
              )}
              {profile?.team_site && (
                <a href={profile.team_site} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-400 text-xs font-bold hover:underline transition-all">
                  <ExternalLink size={14} />
                  <span>Team Site</span>
                </a>
              )}
              {profile?.tournament_stats_url && (
                <a href={profile.tournament_stats_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-purple-400 text-xs font-bold hover:underline transition-all">
                  <Trophy size={14} />
                  <span>Tourney Stats</span>
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Dashboard / Analytics Card */}
        <section className="px-5 mt-4">
          <BentoCard variant="dark" className="bg-[#111111] border border-white/5 p-5 rounded-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
              <BarChart3 size={96} className="text-[#5FD3BC]" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#5FD3BC]/10 flex items-center justify-center">
                    <TrendingUp size={16} className="text-[#5FD3BC]" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-300">Performance Metrics</h3>
                </div>
                <Link href="/analytics" className="text-[10px] font-bold text-[#5FD3BC] flex items-center gap-1 hover:gap-2 transition-all">
                  VIEW ALL <ChevronRight size={12} />
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Win Rate</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-white">{profile?.win_rate || 0}%</span>
                    <Target size={12} className="text-[#5FD3BC]" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Rank</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-white">#{profile?.rank || "---"}</span>
                    <TrendingUp size={12} className="text-purple-500" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">MVP</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-white">{profile?.mvp_count || 0}</span>
                    <Trophy size={12} className="text-yellow-500" />
                  </div>
                </div>
              </div>
            </div>
          </BentoCard>
        </section>

        {/* Action Buttons */}
        <section className="px-5 mt-6 flex gap-3">
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex-[2] bg-[#5FD3BC] hover:bg-[#4eb19d] text-black h-12 rounded-xl text-sm font-black transition-all active:scale-[0.98]">
                Edit Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0F0F0F] border-white/10 text-white max-w-[95%] sm:max-w-[425px] rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-black">Edit Profile</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Update your public arena presence. Changes are reflected immediately.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto no-scrollbar pr-1">
                <div className="grid gap-2">
                  <Label htmlFor="full_name" className="text-xs font-bold text-gray-400 uppercase">Display Name</Label>
                  <Input 
                    id="full_name" 
                    value={editForm.full_name} 
                    onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                    className="bg-white/5 border-white/10 h-11 focus:border-[#5FD3BC]/50 transition-all" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="username" className="text-xs font-bold text-gray-400 uppercase">Username</Label>
                  <Input 
                    id="username" 
                    value={editForm.username} 
                    onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                    className="bg-white/5 border-white/10 h-11 focus:border-[#5FD3BC]/50 transition-all" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bio" className="text-xs font-bold text-gray-400 uppercase">Bio</Label>
                  <Textarea 
                    id="bio" 
                    value={editForm.bio} 
                    onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                    className="bg-white/5 border-white/10 focus:border-[#5FD3BC]/50 transition-all min-h-[80px]" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="youtube" className="text-xs font-bold text-gray-400 uppercase">YouTube Link</Label>
                  <Input 
                    id="youtube" 
                    value={editForm.youtube_link} 
                    onChange={(e) => setEditForm({...editForm, youtube_link: e.target.value})}
                    placeholder="https://youtube.com/@yourchannel"
                    className="bg-white/5 border-white/10 h-11 focus:border-[#5FD3BC]/50 transition-all" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="team" className="text-xs font-bold text-gray-400 uppercase">Team Site</Label>
                  <Input 
                    id="team" 
                    value={editForm.team_site} 
                    onChange={(e) => setEditForm({...editForm, team_site: e.target.value})}
                    placeholder="https://teamwebsite.com"
                    className="bg-white/5 border-white/10 h-11 focus:border-[#5FD3BC]/50 transition-all" 
                  />
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button 
                  onClick={handleSaveProfile} 
                  disabled={isSaving}
                  className="w-full bg-[#5FD3BC] hover:bg-[#4eb19d] text-black font-black h-12 rounded-xl"
                >
                  {isSaving ? <Loader2 className="animate-spin" /> : "Save Changes"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button 
            variant="outline"
            onClick={handleShare}
            className="flex-1 bg-white/5 hover:bg-white/10 border-white/10 h-12 rounded-xl text-sm font-bold transition-all active:scale-[0.98]"
          >
            Share
          </Button>
        </section>

        {/* Highlights Strip */}
        <section className="mt-10">
          <div className="flex gap-6 overflow-x-auto no-scrollbar px-5 pb-2">
            <div className="flex flex-col items-center gap-3">
              <div className="w-[76px] h-[76px] rounded-full border-2 border-dashed border-white/20 flex items-center justify-center group hover:border-[#5FD3BC]/50 transition-all cursor-pointer">
                <Plus size={28} className="text-white/40 group-hover:text-[#5FD3BC] transition-all" />
              </div>
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">New</span>
            </div>
            {stories.map((h, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <div className="w-[76px] h-[76px] rounded-full p-[3px] bg-gradient-to-tr from-purple-500 via-[#5FD3BC] to-teal-500">
                  <div className="w-full h-full rounded-full bg-[#0A0A0A] p-[2px]">
                    <div className="w-full h-full rounded-full overflow-hidden relative">
                      <img 
                        src={h.media_url} 
                        alt="" 
                        className="w-full h-full object-cover opacity-80"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        {h.media_type === "video" ? <Play size={16} fill="white" /> : <Trophy size={16} className="text-[#5FD3BC]" />}
                      </div>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest truncate max-w-[70px]">
                  {h.caption || `Clip ${i+1}`}
                </span>
              </div>
            ))}
            {stories.length === 0 && (
              <>
                <div className="flex flex-col items-center gap-3 opacity-30">
                  <div className="w-[76px] h-[76px] rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <Trophy size={24} className="text-gray-500" />
                  </div>
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Victory</span>
                </div>
                <div className="flex flex-col items-center gap-3 opacity-30">
                  <div className="w-[76px] h-[76px] rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <Target size={24} className="text-gray-500" />
                  </div>
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">MVP</span>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Tabs and Content Grid */}
        <section className="mt-10">
          <Tabs defaultValue="grid" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="w-full bg-transparent h-14 p-0 rounded-none border-t border-b border-white/5">
              <TabsTrigger 
                value="grid" 
                className="flex-1 h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#5FD3BC] data-[state=active]:text-[#5FD3BC] transition-all"
              >
                <Grid size={22} />
              </TabsTrigger>
              <TabsTrigger 
                value="reels" 
                className="flex-1 h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#5FD3BC] data-[state=active]:text-[#5FD3BC] transition-all"
              >
                <Play size={22} />
              </TabsTrigger>
              <TabsTrigger 
                value="saved" 
                className="flex-1 h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#5FD3BC] data-[state=active]:text-[#5FD3BC] transition-all"
              >
                <Bookmark size={22} />
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="grid" className="m-0 focus-visible:ring-0">
              <div className="grid grid-cols-3 gap-[2px] bg-white/5">
                {matches.length > 0 ? matches.map((match, i) => (
                  <motion.div 
                    key={match.id} 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="aspect-square relative group cursor-pointer bg-[#111111] overflow-hidden"
                  >
                    <div className="w-full h-full bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] flex items-center justify-center p-4">
                      <div className="text-center">
                        <Trophy size={20} className={i % 2 === 0 ? "text-[#5FD3BC] mx-auto opacity-50" : "text-gray-600 mx-auto opacity-30"} />
                        <p className="text-[8px] font-black text-gray-500 mt-2 uppercase tracking-tighter truncate max-w-[80px]">
                          {match.title}
                        </p>
                      </div>
                    </div>
                    
                    <div className="absolute top-2 left-2">
                      <div className={`px-1.5 py-0.5 rounded-sm ${i % 2 === 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"} border border-white/5`}>
                        <span className="text-[8px] font-black uppercase">{i % 2 === 0 ? "WIN" : "LOSS"}</span>
                      </div>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-1">
                          <Target size={10} className="text-[#5FD3BC]" />
                          <span className="text-[9px] font-black">MVP</span>
                        </div>
                        <span className="text-[8px] text-gray-400 font-bold">{new Date(match.start_time).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </motion.div>
                )) : (
                  Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="aspect-square bg-[#111111] border border-white/5 flex items-center justify-center opacity-20">
                      <Trophy size={24} />
                    </div>
                  ))
                )}
              </div>
              {matches.length === 0 && (
                <div className="py-20 text-center">
                  <Trophy size={48} className="mx-auto text-gray-800 mb-4" />
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">No match history yet</p>
                  <Link href="/matches">
                    <Button variant="link" className="text-[#5FD3BC] mt-2 font-black text-xs">JOIN TOURNAMENTS</Button>
                  </Link>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="reels" className="m-0 min-h-[350px] flex flex-col items-center justify-center text-gray-600">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <Play size={32} className="opacity-20" />
              </div>
              <p className="text-xs font-black uppercase tracking-[0.2em]">No Match Clips Found</p>
              <p className="text-[10px] text-gray-700 mt-2 font-bold uppercase">Record your gameplay to show off!</p>
            </TabsContent>

            <TabsContent value="saved" className="m-0 min-h-[350px] flex flex-col items-center justify-center text-gray-600">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <Bookmark size={32} className="opacity-20" />
              </div>
              <p className="text-xs font-black uppercase tracking-[0.2em]">No Saved Collections</p>
              <p className="text-[10px] text-gray-700 mt-2 font-bold uppercase">Save tournaments or players here</p>
            </TabsContent>
          </Tabs>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
