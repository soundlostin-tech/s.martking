"use client";

import { BottomNav } from "@/components/layout/BottomNav";
import { TopHeader } from "@/components/layout/TopHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronRight, 
  Bell, 
  LogOut, 
  Trophy, 
  Loader2, 
  Edit2, 
  Save, 
  X, 
  Settings,
  TrendingUp,
  ShieldCheck,
  CreditCard,
  Award,
  Gamepad2,
  Activity
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
      toast.success("Profile updated successfully");
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
    toast.success("Signed out successfully");
    window.location.href = "/signin";
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Activity className="w-10 h-10 animate-pulse text-dark-emerald" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <main className="pb-24 relative z-10">
        <TopHeader />

        <div className="px-4 sm:px-6 pt-6 sm:pt-8 space-y-6 sm:space-y-8">
          {/* Profile Header - Mobile Optimized */}
          <section className="flex flex-col items-center text-center">
            <div className="relative mb-4 sm:mb-6">
              <motion.div 
                whileTap={{ scale: 0.95 }}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-[28px] sm:rounded-[36px] p-1 bg-gradient-to-tr from-dark-emerald to-emerald-depths shadow-lg"
              >
                <div className="w-full h-full rounded-[24px] sm:rounded-[32px] bg-background p-0.5">
                  <Avatar className="w-full h-full rounded-[22px] sm:rounded-[30px] border-none bg-muted">
                    <AvatarImage src={profile?.avatar_url} className="object-cover" />
                    <AvatarFallback className="bg-muted text-muted-foreground text-2xl sm:text-3xl font-heading">
                      {profile?.full_name?.[0].toUpperCase() || "SK"}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </motion.div>
              <button 
                onClick={() => setIsEditing(true)}
                className="absolute -bottom-1 -right-1 w-9 h-9 sm:w-10 sm:h-10 bg-primary text-primary-foreground rounded-xl sm:rounded-2xl shadow-lg flex items-center justify-center active:scale-90 transition-transform border-2 border-background touch-target"
              >
                <Edit2 size={16} strokeWidth={3} />
              </button>
            </div>
            
            <div className="space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-heading text-foreground">{profile?.full_name || "Warrior"}</h2>
              <div className="flex items-center justify-center gap-2">
                <Badge variant="outline" className="border-border bg-muted text-[8px] sm:text-[9px] font-bold tracking-wider text-accent px-3 py-0.5 rounded-full uppercase">
                  PRO
                </Badge>
                <p className="text-[10px] sm:text-[11px] font-medium text-muted-foreground">@{profile?.username || user?.email?.split('@')[0]}</p>
              </div>
            </div>
          </section>

          {/* Stats Grid - Mobile Optimized */}
          <section className="grid grid-cols-2 gap-3 sm:gap-4">
            {[
              { label: "Wins", value: Math.floor((profile?.matches_played || 0) * (parseFloat(profile?.win_rate || "0") / 100)), icon: Award },
              { label: "Win Rate", value: `${profile?.win_rate || 0}%`, icon: TrendingUp },
              { label: "Earnings", value: `₹${(wallet?.lifetime_earnings || 0).toLocaleString()}`, icon: Trophy },
              { label: "Matches", value: profile?.matches_played || 0, icon: Gamepad2 },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="mobile-card p-4 sm:p-5"
              >
                <div className="flex items-center gap-3 mb-2 sm:mb-3">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-accent/15 flex items-center justify-center text-accent">
                    <stat.icon size={16} className="sm:w-[18px] sm:h-[18px]" />
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wide">{stat.label}</span>
                </div>
                <h4 className="text-xl sm:text-2xl font-outfit font-bold text-foreground">{stat.value}</h4>
              </motion.div>
            ))}
          </section>

          {/* Menu - Mobile Optimized */}
          <section className="bg-card rounded-[24px] sm:rounded-[28px] overflow-hidden border border-border shadow-sm">
            <div className="p-2 sm:p-3 space-y-1">
              {[
                { label: "Settings", icon: Settings, href: "#", accent: true },
                { label: "Notifications", icon: Bell, href: "#" },
                { label: "Wallet", icon: CreditCard, href: "/wallet", accent: true },
                { label: "Security", icon: ShieldCheck, href: "#" },
              ].map((item, i) => (
                <button 
                  key={i}
                  className="w-full flex items-center justify-between p-3.5 sm:p-4 active:bg-muted transition-colors rounded-xl sm:rounded-2xl text-left touch-target"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center border border-border ${item.accent ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground'}`}>
                      <item.icon size={18} className="sm:w-5 sm:h-5" />
                    </div>
                    <span className="text-[12px] sm:text-[13px] font-semibold text-foreground">{item.label}</span>
                  </div>
                  <ChevronRight size={18} className="text-muted-foreground" />
                </button>
              ))}
              
              <div className="h-[1px] bg-border mx-3 my-2" />
              
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-between p-3.5 sm:p-4 active:bg-destructive/10 transition-colors rounded-xl sm:rounded-2xl text-left touch-target"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive border border-destructive/10">
                    <LogOut size={18} className="sm:w-5 sm:h-5" />
                  </div>
                  <span className="text-[12px] sm:text-[13px] font-semibold text-destructive">Sign Out</span>
                </div>
                <ChevronRight size={18} className="text-destructive/30" />
              </button>
            </div>
          </section>
        </div>

        {/* Edit Profile Modal - Mobile Optimized */}
        <AnimatePresence>
          {isEditing && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-lg flex items-end sm:items-center justify-center"
            >
              <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="bg-background border border-border w-full max-w-md rounded-t-[28px] sm:rounded-[28px] p-6 sm:p-8 space-y-6 sm:space-y-8 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto"
              >
                <div className="relative z-10 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-xl sm:text-2xl font-heading text-foreground">Edit Profile</h3>
                    <p className="text-[10px] sm:text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Update your information</p>
                  </div>
                  <button onClick={() => setIsEditing(false)} className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground active:bg-muted/80 transition-colors border border-border touch-target">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleUpdateProfile} className="relative z-10 space-y-5 sm:space-y-6">
                  <div className="space-y-4 sm:space-y-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Name</label>
                      <Input 
                        value={formData.full_name} 
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} 
                        className="h-12 sm:h-14 rounded-xl border border-border bg-muted font-medium px-4 text-foreground focus-visible:ring-accent"
                        placeholder="Your Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Username</label>
                      <Input 
                        value={formData.username} 
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })} 
                        className="h-12 sm:h-14 rounded-xl border border-border bg-muted font-medium px-4 text-foreground focus-visible:ring-accent"
                        placeholder="Username"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Phone</label>
                      <Input 
                        value={formData.phone} 
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                        className="h-12 sm:h-14 rounded-xl border border-border bg-muted font-medium px-4 text-foreground focus-visible:ring-accent"
                        placeholder="+91"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Avatar URL</label>
                      <Input 
                        value={formData.avatar_url} 
                        onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })} 
                        className="h-12 sm:h-14 rounded-xl border border-border bg-muted font-medium px-4 text-foreground focus-visible:ring-accent"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={saving}
                    className="w-full h-12 sm:h-14 bg-primary text-primary-foreground rounded-xl text-[11px] sm:text-[12px] font-bold uppercase tracking-wider shadow-lg active:scale-[0.98] transition-transform haptic-tap touch-target"
                  >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Save Changes"}
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BottomNav />
    </div>
  );
}
