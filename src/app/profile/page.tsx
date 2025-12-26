"use client";

import { BottomNav } from "@/components/layout/BottomNav";
import { TopHeader } from "@/components/layout/TopHeader";
import { PaperWrapper } from "@/components/layout/PaperWrapper";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ChevronRight, 
  LogOut, 
  Trophy, 
  Loader2, 
  Edit2, 
  X, 
  Settings,
  TrendingUp,
  ShieldCheck,
  CreditCard,
  Activity,
  Award,
  Gamepad2
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
      toast.success("Dossier updated");
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
    toast.success("Logged out");
    window.location.href = "/signin";
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Activity className="w-12 h-12 animate-pulse text-[#000033]/20" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <TopHeader />
      <PaperWrapper className="mt-20">
        <div className="space-y-12 pb-20">
          {/* Header Profile Section */}
          <section className="flex flex-col items-center text-center">
            <div className="relative mb-6">
              <motion.div 
                whileTap={{ scale: 0.95 }}
                className="w-32 h-32 rounded-3xl p-1 border-2 border-[#000033]/10 rotate-3"
              >
                <Avatar className="w-full h-full rounded-2xl border-none">
                  <AvatarImage src={profile?.avatar_url} className="object-cover" />
                  <AvatarFallback className="bg-[#000033]/5 text-[#000033]/20 text-4xl font-heading">
                    {profile?.full_name?.[0].toUpperCase() || "SK"}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
              <button 
                onClick={() => setIsEditing(true)}
                className="absolute -bottom-2 -right-2 w-10 h-10 bg-white border-2 border-[#000033]/20 text-[#000033] rounded-xl flex items-center justify-center active:scale-90 transition-all shadow-sm"
              >
                <Edit2 size={16} />
              </button>
            </div>
            
            <div className="space-y-1">
              <h2 className="text-4xl">{profile?.full_name || "Initiate"}</h2>
              <p className="text-xl opacity-60">@{profile?.username || user?.email?.split('@')[0]}</p>
            </div>
          </section>

          {/* Stats Grid */}
          <section className="grid grid-cols-2 gap-4">
            {[
              { label: "Wins", value: Math.floor((profile?.matches_played || 0) * (parseFloat(profile?.win_rate || "0") / 100)), icon: Award },
              { label: "Win Rate", value: `${profile?.win_rate || 0}%`, icon: TrendingUp },
              { label: "Earnings", value: `₹${(wallet?.lifetime_earnings || 0).toLocaleString()}`, icon: Trophy },
              { label: "Matches", value: profile?.matches_played || 0, icon: Gamepad2 },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="border-2 border-[#000033]/10 p-4 rounded-2xl flex flex-col gap-2"
              >
                <div className="flex items-center gap-2 opacity-40">
                  <stat.icon size={14} />
                  <span className="text-xs font-bold uppercase tracking-widest">{stat.label}</span>
                </div>
                <h4 className="text-3xl m-0">{stat.value}</h4>
              </motion.div>
            ))}
          </section>

          {/* Profile Menu */}
          <section className="border-2 border-[#000033]/10 rounded-3xl overflow-hidden divide-y divide-[#000033]/5">
            {[
              { label: "Settings", icon: Settings, href: "#" },
              { label: "Wallet", icon: CreditCard, href: "/wallet" },
              { label: "Security", icon: ShieldCheck, href: "#" },
            ].map((item, i) => (
              <button 
                key={i}
                className="w-full flex items-center justify-between p-5 hover:bg-[#000033]/5 active:bg-[#000033]/10 transition-all text-left"
              >
                <div className="flex items-center gap-4">
                  <item.icon size={20} className="text-[#000033]/40" />
                  <span className="text-xl">{item.label}</span>
                </div>
                <ChevronRight size={18} className="text-[#000033]/20" />
              </button>
            ))}
            
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-5 hover:bg-red-50 active:bg-red-100 transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <LogOut size={20} className="text-red-400" />
                <span className="text-xl text-red-500">Log Out</span>
              </div>
              <ChevronRight size={18} className="text-red-200" />
            </button>
          </section>
        </div>

        {/* Edit Profile Overlay */}
        <AnimatePresence>
          {isEditing && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-white/60 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, rotate: 2 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0.9, rotate: -2 }}
                className="bg-white border-2 border-[#000033] w-full max-w-md rounded-3xl p-8 shadow-2xl relative"
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-3xl m-0">Edit Profile</h3>
                  <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold opacity-40 uppercase tracking-widest ml-1">Name</label>
                      <Input 
                        value={formData.full_name} 
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} 
                        className="h-12 border-2 border-[#000033]/10 focus:border-[#000033]/30 bg-transparent rounded-xl px-4 text-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold opacity-40 uppercase tracking-widest ml-1">Username</label>
                      <Input 
                        value={formData.username} 
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })} 
                        className="h-12 border-2 border-[#000033]/10 focus:border-[#000033]/30 bg-transparent rounded-xl px-4 text-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold opacity-40 uppercase tracking-widest ml-1">Avatar URL</label>
                      <Input 
                        value={formData.avatar_url} 
                        onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })} 
                        className="h-12 border-2 border-[#000033]/10 focus:border-[#000033]/30 bg-transparent rounded-xl px-4 text-xl"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={saving}
                    className="btn-hand-drawn w-full py-4 bg-[#000033] text-white hover:bg-[#000033]/90"
                  >
                    {saving ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : "Save Changes"}
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </PaperWrapper>
      <BottomNav />
    </div>
  );
}
