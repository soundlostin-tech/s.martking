"use client";

import { BottomNav } from "@/components/layout/BottomNav";
import { TopHeader } from "@/components/layout/TopHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronRight, 
  User, 
  Bell, 
  LogOut, 
  Trophy, 
  Target, 
  DollarSign, 
  Loader2, 
  Edit2, 
  Save, 
  X, 
  Mail, 
  Phone, 
  Globe, 
  Settings,
  Calendar,
  Swords,
  TrendingUp,
  ShieldCheck,
  CreditCard,
  Zap,
  Activity,
  Award,
  Gamepad2,
  Signal
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

export default function Profile() {
  const { user, loading: authLoading } = useAuth(true);
  const [profile, setProfile] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    avatar_url: "",
    username: "",
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
        phone: profileData?.phone || "",
        avatar_url: profileData?.avatar_url || "",
        username: profileData?.username || "",
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
        .update(formData)
        .eq("id", user!.id);
      
      if (error) throw error;
      toast.success("Warrior dossiers updated");
      setIsEditing(false);
      fetchProfileData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Uplink terminated");
    window.location.href = "/signin";
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-seashell-50">
        <Activity className="w-12 h-12 animate-pulse text-tangerine-dream-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-seashell-50 text-graphite-800">
      <main className="pb-32 relative z-10">
        <TopHeader />

          <div className="px-6 pt-8 space-y-10 max-w-2xl mx-auto">
            {/* Header Profile Section - Native Mobile Style */}
            <section className="flex flex-col items-center text-center">
              <div className="relative mb-8">
                <motion.div 
                  whileTap={{ scale: 0.95 }}
                  className="w-36 h-36 rounded-[48px] p-1.5 bg-gradient-to-tr from-tangerine-dream-400 to-tangerine-dream-500 shadow-xl shadow-tangerine-dream-400/20"
                >
                  <div className="w-full h-full rounded-[44px] bg-seashell-50 p-1">
                    <Avatar className="w-full h-full rounded-[40px] border-none shadow-inner bg-seashell-100">
                      <AvatarImage src={profile?.avatar_url} className="object-cover" />
                      <AvatarFallback className="bg-seashell-100 text-shadow-grey-400 text-4xl font-heading">
                        {profile?.full_name?.[0].toUpperCase() || "SK"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </motion.div>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="absolute bottom-0 right-0 w-12 h-12 bg-tangerine-dream-400 text-white rounded-2xl shadow-xl flex items-center justify-center active:scale-90 transition-all border-4 border-seashell-50"
                >
                  <Edit2 size={20} strokeWidth={3} />
                </button>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-3xl font-heading text-graphite-900">{profile?.full_name || "Initiate Warrior"}</h2>
                <div className="flex items-center justify-center gap-3">
                  <Badge variant="outline" className="border-shadow-grey-200 bg-seashell-100 text-[9px] font-bold tracking-[0.3em] text-tangerine-dream-500 px-4 py-1 rounded-full uppercase">
                    LEVEL 42 PRO
                  </Badge>
                  <p className="text-[10px] font-bold text-shadow-grey-400 uppercase tracking-[0.3em]">@{profile?.username || user?.email?.split('@')[0]}</p>
                </div>
              </div>
            </section>
  
            {/* Stats Grid - Performance Matrix */}
            <section className="grid grid-cols-2 gap-6">
              {[
                { label: "Elite Wins", value: Math.floor((profile?.matches_played || 0) * (parseFloat(profile?.win_rate || "0") / 100)), icon: Award, color: "tangerine-dream" },
                { label: "Win Rate", value: `${profile?.win_rate || 0}%`, icon: TrendingUp, color: "tangerine-dream" },
                { label: "Earnings", value: `₹${(wallet?.lifetime_earnings || 0).toLocaleString()}`, icon: Trophy, color: "tangerine-dream" },
                { label: "Matches", value: profile?.matches_played || 0, icon: Gamepad2, color: "shadow-grey" },
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-seashell-100 p-6 rounded-[32px] border border-shadow-grey-200 shadow-md"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-10 h-10 rounded-2xl bg-tangerine-dream-400/10 flex items-center justify-center text-tangerine-dream-500 shadow-sm`}>
                      <stat.icon size={20} />
                    </div>
                    <span className="text-[9px] font-bold text-shadow-grey-500 uppercase tracking-widest">{stat.label}</span>
                  </div>
                  <h4 className="text-3xl font-heading text-graphite-900">{stat.value}</h4>
                </motion.div>
              ))}
            </section>
  
            {/* Profile Menu - System Protocols */}
            <section className="bg-seashell-100 rounded-[40px] overflow-hidden border border-shadow-grey-200 shadow-lg">
              <div className="p-4 space-y-2">
                {[
                  { label: "Operational Parameters", icon: Settings, href: "#", color: "text-tangerine-dream-500" },
                  { label: "Signal Notifications", icon: Bell, href: "#", color: "text-shadow-grey-500" },
                  { label: "Finance Archives", icon: CreditCard, href: "/wallet", color: "text-tangerine-dream-500" },
                  { label: "Security Clearance", icon: ShieldCheck, href: "#", color: "text-shadow-grey-500" },
                ].map((item, i) => (
                  <button 
                    key={i}
                    className="w-full flex items-center justify-between p-5 hover:bg-seashell-200 active:bg-seashell-300 transition-all rounded-[28px] group text-left"
                  >
                    <div className="flex items-center gap-5">
                      <div className={`w-12 h-12 rounded-2xl bg-seashell-50 flex items-center justify-center ${item.color} shadow-sm`}>
                        <item.icon size={22} />
                      </div>
                      <span className="text-[13px] font-bold text-graphite-800 uppercase tracking-widest">{item.label}</span>
                    </div>
                    <ChevronRight size={20} className="text-shadow-grey-300 group-active:translate-x-1 transition-all" />
                  </button>
                ))}
                
                <div className="h-[1px] bg-shadow-grey-200 my-4 mx-6" />
                
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between p-5 hover:bg-strawberry-red-500/5 active:bg-strawberry-red-500/10 transition-all rounded-[28px] group text-left"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-strawberry-red-500/10 flex items-center justify-center text-strawberry-red-500 shadow-sm">
                      <LogOut size={22} />
                    </div>
                    <span className="text-[13px] font-bold text-strawberry-red-500 uppercase tracking-widest">Terminate Uplink</span>
                  </div>
                  <ChevronRight size={20} className="text-strawberry-red-500/20 group-active:translate-x-1 transition-all" />
                </button>
              </div>
            </section>
          </div>
  
          {/* Edit Profile Overlay */}
          <AnimatePresence>
            {isEditing && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-graphite-900/20 backdrop-blur-xl flex items-end sm:items-center justify-center p-4"
              >
                <motion.div 
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  className="bg-seashell-50 border border-shadow-grey-200 w-full max-w-md rounded-t-[48px] sm:rounded-[48px] p-10 space-y-10 shadow-2xl relative overflow-hidden"
                >
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-2xl font-heading text-graphite-900">Dossier <span className="italic opacity-60">Update</span></h3>
                      <p className="text-[10px] font-bold text-shadow-grey-500 uppercase tracking-[0.2em]">Modify Warrior Identification</p>
                    </div>
                    <button onClick={() => setIsEditing(false)} className="w-12 h-12 rounded-2xl bg-seashell-100 flex items-center justify-center text-shadow-grey-400 hover:text-graphite-800 transition-colors">
                      <X size={24} />
                    </button>
                  </div>
  
                  <form onSubmit={handleUpdateProfile} className="relative z-10 space-y-8">
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-tangerine-dream-500 uppercase tracking-[0.3em] ml-2">Display Designation</label>
                        <Input 
                          value={formData.full_name} 
                          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} 
                          className="h-16 rounded-2xl border border-shadow-grey-200 bg-seashell-100 font-bold px-8 text-graphite-800 focus-visible:ring-tangerine-dream-400 text-sm"
                          placeholder="Your Name"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-tangerine-dream-500 uppercase tracking-[0.3em] ml-2">Arena Alias</label>
                        <Input 
                          value={formData.username} 
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })} 
                          className="h-16 rounded-2xl border border-shadow-grey-200 bg-seashell-100 font-bold px-8 text-graphite-800 focus-visible:ring-tangerine-dream-400 text-sm"
                          placeholder="Username"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-tangerine-dream-500 uppercase tracking-[0.3em] ml-2">Signal Connection (Phone)</label>
                        <Input 
                          value={formData.phone} 
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                          className="h-16 rounded-2xl border border-shadow-grey-200 bg-seashell-100 font-bold px-8 text-graphite-800 focus-visible:ring-tangerine-dream-400 text-sm"
                          placeholder="+91"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-tangerine-dream-500 uppercase tracking-[0.3em] ml-2">Visual Proxy (URL)</label>
                        <Input 
                          value={formData.avatar_url} 
                          onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })} 
                          className="h-16 rounded-2xl border border-shadow-grey-200 bg-seashell-100 font-bold px-8 text-graphite-800 focus-visible:ring-tangerine-dream-400 text-sm"
                          placeholder="https://..."
                        />
                      </div>
                    </div>
  
                    <button 
                      type="submit" 
                      disabled={saving}
                      className="w-full h-16 bg-strawberry-red-500 text-white rounded-3xl text-[11px] font-bold uppercase tracking-[0.3em] shadow-xl shadow-strawberry-red-500/20 active:scale-95 transition-all"
                    >
                      {saving ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : "COMMIT CHANGES"}
                    </button>
                  </form>
                
                {/* Visual Glow */}
                <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-tangerine-dream-400/10 blur-[100px] rounded-full pointer-events-none" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BottomNav />
      {/* Background Glows */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0 opacity-30">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-tangerine-dream-400/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-tangerine-dream-500/15 blur-[120px] rounded-full" />
      </div>
    </div>
  );
}

