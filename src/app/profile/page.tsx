"use client";

import { BottomNav } from "@/components/layout/BottomNav";
import { BentoCard } from "@/components/ui/BentoCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ChevronRight, 
  LogOut, 
  Trophy, 
  Edit2, 
  Save, 
  X, 
  Settings,
  TrendingUp,
  ShieldCheck,
  CreditCard,
  Award,
  Gamepad2,
  Loader2,
  Youtube,
  Music,
  MoreHorizontal,
  Plus,
  Grid,
  Play,
  UserSquare2,
  ExternalLink,
  Share2,
  BarChart3,
  Calendar,
  MessageSquare
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Profile() {
  const { user, loading: authLoading } = useAuth(true);
  const [profile, setProfile] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("grid");
  
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    bio: "",
    youtube_link: "",
    music_status: "",
    avatar_url: "",
    role: "Digital creator"
  });

  const fetchProfileData = useCallback(async () => {
    if (!user) return;
    try {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      const { data: walletData } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      setProfile(profileData);
      setWallet(walletData);
      setFormData({
        full_name: profileData?.full_name || "",
        username: profileData?.username || "failedyoutuber",
        bio: profileData?.bio || "Gaming & YouTube Expert 🎮\nHelping you grow your channel 🚀\nSmart's Arena MVP 🏆",
        youtube_link: profileData?.youtube_link || "youtube.com/@failedyoutuber",
        music_status: profileData?.music_status || "Now playing: League of Legends Theme",
        avatar_url: profileData?.avatar_url || "",
        role: profileData?.role || "Digital creator"
      });
    } catch (error) {
      console.error("Error fetching profile data:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          username: formData.username,
          bio: formData.bio,
          youtube_link: formData.youtube_link,
          music_status: formData.music_status,
          avatar_url: formData.avatar_url,
          role: formData.role,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Profile updated successfully");
      setIsEditing(false);
      fetchProfileData();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    window.location.href = "/signin";
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#5FD3BC] animate-spin" />
      </div>
    );
  }

  const highlights = [
    { title: "New", icon: "✨", color: "bg-blue-500" },
    { title: "Smart's Arena", icon: "🎮", color: "bg-[#5FD3BC]" },
    { title: "Growth", icon: "📈", color: "bg-purple-500" },
    { title: "SEO", icon: "🔍", color: "bg-orange-500" },
    { title: "Setup", icon: "💻", color: "bg-gray-700" }
  ];

  const gridPosts = Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    image: `https://picsum.photos/seed/${i + 50}/400/400`,
    type: i % 3 === 0 ? 'video' : 'image'
  }));

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white relative font-sans">
      <main className="pb-[80px]">
        {/* Status Bar / Header */}
        <div className="flex items-center justify-between px-4 py-3 sticky top-0 bg-[#0A0A0A]/80 backdrop-blur-md z-50">
          <div className="flex items-center gap-1">
            <h1 className="text-lg font-bold tracking-tight">{profile?.username || "failedyoutuber"}</h1>
            <ChevronRight size={16} className="text-gray-500 rotate-90" />
          </div>
          <div className="flex items-center gap-5">
            <Plus size={24} />
            <Settings size={24} onClick={() => setIsEditing(true)} />
            <LogOut size={24} onClick={handleLogout} className="text-red-500" />
          </div>
        </div>

        {/* Profile Info Row */}
        <div className="px-4 py-4 flex items-center gap-8">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full p-[3px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
              <div className="w-full h-full rounded-full bg-[#0A0A0A] p-[2px]">
                <Avatar className="w-full h-full border-none">
                  <AvatarImage src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.username}`} />
                  <AvatarFallback className="bg-gray-800 text-white">
                    {profile?.full_name?.[0] || "F"}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
            <div className="absolute bottom-0 right-0 w-7 h-7 bg-blue-500 rounded-full border-[3px] border-[#0A0A0A] flex items-center justify-center">
              <Plus size={14} className="text-white" />
            </div>
          </div>

          <div className="flex-1 flex justify-around text-center">
            <div>
              <p className="text-lg font-bold">{profile?.total_posts || 128}</p>
              <p className="text-xs text-gray-400">Posts</p>
            </div>
            <div>
              <p className="text-lg font-bold">{profile?.followers_count || "12.5k"}</p>
              <p className="text-xs text-gray-400">Followers</p>
            </div>
            <div>
              <p className="text-lg font-bold">{profile?.following_count || 482}</p>
              <p className="text-xs text-gray-400">Following</p>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="px-4 space-y-1">
          <h2 className="text-sm font-bold">{profile?.full_name || "Failed Youtuber"}</h2>
          <p className="text-xs text-gray-500 font-medium">{profile?.role || "Digital creator"}</p>
          <div className="text-sm whitespace-pre-wrap leading-relaxed mt-1">
            {profile?.bio || "Gaming & YouTube Expert 🎮\nHelping you grow your channel 🚀\nSmart's Arena MVP 🏆"}
          </div>
          
          <div className="flex flex-col gap-1.5 mt-3">
            <div className="flex items-center gap-2 text-blue-400 text-sm font-medium">
              <Youtube size={16} />
              <a href={`https://${profile?.youtube_link || 'youtube.com/@failedyoutuber'}`} target="_blank" rel="noopener noreferrer">
                {profile?.youtube_link || "youtube.com/@failedyoutuber"}
              </a>
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-xs bg-white/5 w-fit px-3 py-1.5 rounded-full">
              <Music size={12} className="text-[#5FD3BC]" />
              <span className="truncate max-w-[200px]">{profile?.music_status || "Now playing: League of Legends Theme"}</span>
            </div>
          </div>
        </div>

        {/* Dashboard Card */}
        <div className="px-4 mt-6">
          <BentoCard variant="dark" className="bg-[#1A1A1A] border-none p-4 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold">Professional dashboard</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">14.2K accounts reached in the last 30 days.</p>
              </div>
              <ChevronRight size={18} className="text-gray-500" />
            </div>
            <div className="flex gap-4 overflow-x-auto no-scrollbar py-1">
              <div className="bg-white/5 p-3 rounded-lg min-w-[120px]">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 size={14} className="text-[#5FD3BC]" />
                  <span className="text-[10px] text-gray-400 uppercase font-bold">Views</span>
                </div>
                <p className="text-lg font-bold">842K</p>
                <p className="text-[10px] text-[#5FD3BC] font-bold">+12.4%</p>
              </div>
              <div className="bg-white/5 p-3 rounded-lg min-w-[120px]">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp size={14} className="text-purple-500" />
                  <span className="text-[10px] text-gray-400 uppercase font-bold">Growth</span>
                </div>
                <p className="text-lg font-bold">4.2%</p>
                <p className="text-[10px] text-purple-500 font-bold">+0.8%</p>
              </div>
              <div className="bg-white/5 p-3 rounded-lg min-w-[120px]">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar size={14} className="text-orange-500" />
                  <span className="text-[10px] text-gray-400 uppercase font-bold">Streak</span>
                </div>
                <p className="text-lg font-bold">14 Days</p>
                <p className="text-[10px] text-orange-500 font-bold">Level 4</p>
              </div>
            </div>
          </BentoCard>
        </div>

        {/* Action Buttons */}
        <div className="px-4 mt-4 flex gap-2">
          <button 
            onClick={() => setIsEditing(true)}
            className="flex-1 bg-white/10 hover:bg-white/20 h-9 rounded-lg text-sm font-bold transition-colors"
          >
            Edit profile
          </button>
          <button className="flex-1 bg-white/10 hover:bg-white/20 h-9 rounded-lg text-sm font-bold transition-colors">
            Share profile
          </button>
          <button className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
            <UserSquare2 size={18} />
          </button>
        </div>

        {/* Highlights */}
        <div className="mt-8">
          <div className="flex gap-5 overflow-x-auto no-scrollbar px-4 pb-2">
            <div className="flex flex-col items-center gap-2">
              <div className="w-[72px] h-[72px] rounded-full border border-gray-800 flex items-center justify-center bg-transparent">
                <Plus size={28} className="text-gray-400" />
              </div>
              <span className="text-[11px] font-medium">New</span>
            </div>
            {highlights.slice(1).map((h, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-[72px] h-[72px] rounded-full p-[2.5px] border border-gray-800">
                  <div className={`w-full h-full rounded-full ${h.color} flex items-center justify-center text-2xl shadow-inner`}>
                    {h.icon}
                  </div>
                </div>
                <span className="text-[11px] font-medium text-gray-300">{h.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs and Grid */}
        <div className="mt-6 border-t border-white/10">
          <Tabs defaultValue="grid" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="w-full bg-transparent h-12 p-0 rounded-none border-b border-white/5">
              <TabsTrigger 
                value="grid" 
                className="flex-1 h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-white"
              >
                <Grid size={22} className={activeTab === 'grid' ? 'text-white' : 'text-gray-500'} />
              </TabsTrigger>
              <TabsTrigger 
                value="reels" 
                className="flex-1 h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-white"
              >
                <Play size={22} className={activeTab === 'reels' ? 'text-white' : 'text-gray-500'} />
              </TabsTrigger>
              <TabsTrigger 
                value="tagged" 
                className="flex-1 h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-white"
              >
                <UserSquare2 size={22} className={activeTab === 'tagged' ? 'text-white' : 'text-gray-500'} />
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="grid" className="m-0 focus-visible:ring-0">
              <div className="grid grid-cols-3 gap-[2px]">
                {gridPosts.map((post) => (
                  <div key={post.id} className="aspect-square relative group cursor-pointer bg-gray-900 overflow-hidden">
                    <img src={post.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    {post.type === 'video' && (
                      <div className="absolute top-2 right-2">
                        <Play size={16} fill="white" className="text-white" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <div className="flex items-center gap-1">
                        <TrendingUp size={16} />
                        <span className="text-xs font-bold">12k</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="reels" className="m-0 min-h-[400px] flex items-center justify-center text-gray-500">
              <div className="text-center p-8">
                <Play size={48} className="mx-auto mb-4 opacity-20" />
                <p className="text-sm">No Reels yet</p>
              </div>
            </TabsContent>

            <TabsContent value="tagged" className="m-0 min-h-[400px] flex items-center justify-center text-gray-500">
              <div className="text-center p-8">
                <UserSquare2 size={48} className="mx-auto mb-4 opacity-20" />
                <p className="text-sm">Photos and videos of you</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center"
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="bg-[#1A1A1A] w-full max-w-md rounded-t-[20px] sm:rounded-[20px] p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto border-t border-white/10"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Edit profile</h3>
                  <p className="text-xs text-gray-400 mt-1">Customize your creator identity</p>
                </div>
                <button 
                  onClick={() => setIsEditing(false)} 
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="flex justify-center mb-6">
                  <div className="relative group">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={formData.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.username}`} />
                      <AvatarFallback>F</AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Edit2 size={20} />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Name</label>
                  <Input 
                    value={formData.full_name} 
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} 
                    className="bg-white/5 border-white/10 h-11 text-white focus:ring-[#5FD3BC]/20 focus:border-[#5FD3BC]"
                    placeholder="Full Name"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Username</label>
                  <Input 
                    value={formData.username} 
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })} 
                    className="bg-white/5 border-white/10 h-11 text-white focus:ring-[#5FD3BC]/20 focus:border-[#5FD3BC]"
                    placeholder="username"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Role</label>
                  <Input 
                    value={formData.role} 
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })} 
                    className="bg-white/5 border-white/10 h-11 text-white focus:ring-[#5FD3BC]/20 focus:border-[#5FD3BC]"
                    placeholder="e.g. Digital creator"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Bio</label>
                  <Textarea 
                    value={formData.bio} 
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })} 
                    className="bg-white/5 border-white/10 min-h-[100px] text-white focus:ring-[#5FD3BC]/20 focus:border-[#5FD3BC]"
                    placeholder="Tell your story..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">YouTube Link</label>
                  <Input 
                    value={formData.youtube_link} 
                    onChange={(e) => setFormData({ ...formData, youtube_link: e.target.value })} 
                    className="bg-white/5 border-white/10 h-11 text-white focus:ring-[#5FD3BC]/20 focus:border-[#5FD3BC]"
                    placeholder="youtube.com/@..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Music/Status</label>
                  <Input 
                    value={formData.music_status} 
                    onChange={(e) => setFormData({ ...formData, music_status: e.target.value })} 
                    className="bg-white/5 border-white/10 h-11 text-white focus:ring-[#5FD3BC]/20 focus:border-[#5FD3BC]"
                    placeholder="Now playing..."
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={saving}
                  className="w-full h-12 bg-white text-black font-bold rounded-xl mt-4 flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Done"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}
