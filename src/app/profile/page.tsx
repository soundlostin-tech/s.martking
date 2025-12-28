"use client";

import { BottomNav } from "@/components/layout/BottomNav";
import { BentoCard } from "@/components/ui/BentoCard";
import { ListRow } from "@/components/ui/ListRow";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  HelpCircle,
  FileText,
  Star,
  Zap,
  Crown,
  Target,
  Flame
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

const achievements = [
  { id: 1, name: "First Win", icon: Trophy, color: "yellow", unlocked: true },
  { id: 2, name: "Hot Streak", icon: Flame, color: "coral", unlocked: true },
  { id: 3, name: "Sharpshooter", icon: Target, color: "mint", unlocked: true },
  { id: 4, name: "Elite", icon: Crown, color: "lavender", unlocked: false },
  { id: 5, name: "Legend", icon: Star, color: "pink", unlocked: false },
  { id: 6, name: "Unstoppable", icon: Zap, color: "sky", unlocked: false },
];

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
      <div className="min-h-screen flex items-center justify-center bg-background" suppressHydrationWarning={true}>
        <Loader2 className="w-10 h-10 animate-spin text-onyx/20" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-onyx" suppressHydrationWarning>
      <main className="pb-32 relative z-10">
        

        {/* Sticker Header */}
        <section className="sticker-header relative">
          <div className="sticker-blob sticker-blob-1" style={{ background: 'var(--color-pastel-peach)' }} />
          <div className="sticker-blob sticker-blob-2" style={{ background: 'var(--color-pastel-pink)' }} />
          
          <div className="relative z-10">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[42px] font-black leading-[0.95] mb-3"
            >
              Profile
            </motion.h1>
            <p className="text-[13px] font-bold text-charcoal/50 uppercase tracking-wide">
              Your arena identity
            </p>
          </div>
        </section>

        <div className="px-6 space-y-6" suppressHydrationWarning>
            {/* Profile Card */}
            <BentoCard variant="pastel" pastelColor="peach" className="p-6 relative overflow-hidden">
              <div className="flex items-center gap-5 relative z-10" suppressHydrationWarning>
                <div className="relative" suppressHydrationWarning>
                  <div className="w-20 h-20 rounded-full p-[3px] bg-gradient-to-br from-pastel-peach to-pastel-mint" suppressHydrationWarning>
                    <div className="w-full h-full rounded-full bg-white p-0.5" suppressHydrationWarning>
                      <Avatar className="w-full h-full rounded-full">
                        {profile?.avatar_url ? (
                          <AvatarImage src={profile?.avatar_url} className="object-cover" />
                        ) : (
                          <AvatarFallback className="bg-off-white text-onyx text-2xl font-black">
                            {profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0].toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    </div>
                  </div>
                  <motion.button 
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsEditing(true)}
                    className="absolute -bottom-1 -right-1 w-8 h-8 bg-onyx rounded-full flex items-center justify-center shadow-lg border-2 border-white"
                  >
                    <Edit2 size={12} className="text-white" />
                  </motion.button>
                </div>
                <div className="flex-1" suppressHydrationWarning>
                  <h3 className="text-xl font-black">{profile?.full_name || "Warrior"}</h3>
                  <p className="text-[10px] text-onyx/50 font-bold uppercase tracking-widest mt-0.5">
                    @{profile?.username || user?.email?.split('@')[0]}
                  </p>
                  {profile?.free_fire_uid && (
                    <div className="mt-2 inline-flex items-center px-3 py-1 bg-white/50 rounded-lg" suppressHydrationWarning>
                      <span className="text-[9px] text-onyx font-black uppercase tracking-widest">UID: {profile.ff_uid || profile.free_fire_uid}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/20 rounded-full" />
            </BentoCard>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4" suppressHydrationWarning>
            {[
              { label: "Total Wins", value: Math.floor((profile?.matches_played || 0) * (parseFloat(profile?.win_rate || "0") / 100)), icon: Trophy, color: "yellow" },
              { label: "Win Rate", value: `${profile?.win_rate || 0}%`, icon: TrendingUp, color: "mint" },
              { label: "Earnings", value: `₹${(wallet?.lifetime_earnings || 0).toLocaleString()}`, icon: Award, color: "lavender" },
              { label: "Matches", value: profile?.matches_played || 0, icon: Gamepad2, color: "coral" },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <BentoCard className="p-5 shadow-soft">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      stat.color === 'yellow' ? 'bg-pastel-yellow' :
                      stat.color === 'mint' ? 'bg-pastel-mint' :
                      stat.color === 'lavender' ? 'bg-pastel-lavender' : 'bg-pastel-coral'
                    )}>
                      <stat.icon size={18} className="text-onyx" />
                    </div>
                  </div>
                  <h4 className="text-2xl font-black">{stat.value}</h4>
                  <p className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest mt-1">{stat.label}</p>
                </BentoCard>
              </motion.div>
            ))}
          </div>

          {/* Achievement Stickers */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black">Achievements</h3>
              <span className="text-[10px] font-bold text-charcoal/40 uppercase tracking-widest">3/6 Unlocked</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {achievements.map((achievement, i) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <BentoCard 
                    className={cn(
                      "p-4 text-center relative overflow-hidden",
                      !achievement.unlocked && "opacity-40"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center",
                      achievement.color === 'yellow' ? 'bg-pastel-yellow' :
                      achievement.color === 'mint' ? 'bg-pastel-mint' :
                      achievement.color === 'coral' ? 'bg-pastel-coral' :
                      achievement.color === 'lavender' ? 'bg-pastel-lavender' :
                      achievement.color === 'pink' ? 'bg-pastel-pink' : 'bg-pastel-sky'
                    )}>
                      <achievement.icon size={20} className="text-onyx" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest">{achievement.name}</p>
                    {!achievement.unlocked && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                        <span className="text-[8px] font-black text-charcoal/40 uppercase tracking-widest">Locked</span>
                      </div>
                    )}
                  </BentoCard>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Settings Menu */}
          <section className="space-y-4">
            <h3 className="text-lg font-black">Settings</h3>
            
            <div className="space-y-3">
              <ListRow 
                icon={<Settings size={18} className="text-charcoal/40" />}
                title="Account & Security"
                meta="Manage your credentials"
              />
              <ListRow 
                icon={<Bell size={18} className="text-charcoal/40" />}
                title="Notifications"
                meta="Reminders and alerts"
              />
              <Link href="/wallet">
                <ListRow 
                  icon={<CreditCard size={18} className="text-charcoal/40" />}
                  title="Payment Hub"
                  meta="Wallet and bank settings"
                />
              </Link>
              <ListRow 
                icon={<ShieldCheck size={18} className="text-charcoal/40" />}
                title="Verification"
                meta="KYC and identity status"
                rightContent={
                  <span className="text-[9px] font-black text-onyx/40 bg-pastel-yellow px-3 py-1 rounded-full uppercase tracking-widest">Pending</span>
                }
              />
            </div>
          </section>

          {/* Support Menu */}
          <section className="space-y-4">
            <h3 className="text-lg font-black">Support</h3>
            
            <div className="space-y-3">
              <ListRow 
                icon={<HelpCircle size={18} className="text-charcoal/40" />}
                title="Arena Help"
                meta="FAQs and support desk"
              />
              <ListRow 
                icon={<FileText size={18} className="text-charcoal/40" />}
                title="Legal Hub"
                meta="Terms and privacy policy"
              />
            </div>
          </section>

          {/* Logout */}
          <motion.div whileTap={{ scale: 0.98 }}>
            <BentoCard 
              className="p-5 flex items-center justify-between cursor-pointer bg-pastel-coral/30 border-none"
              onClick={handleLogout}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-pastel-coral flex items-center justify-center">
                  <LogOut size={20} className="text-onyx" />
                </div>
                <span className="text-[14px] font-black uppercase tracking-widest">Sign Out</span>
              </div>
              <ChevronRight size={20} className="text-onyx/20" />
            </BentoCard>
          </motion.div>
        </div>

        {/* Edit Profile Modal */}
        <AnimatePresence>
          {isEditing && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-md flex items-end sm:items-center justify-center p-4"
            >
              <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="bg-white w-full max-w-md rounded-[40px] p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black">Edit Profile</h3>
                    <p className="text-[10px] text-charcoal/40 font-bold uppercase tracking-widest mt-1">Update your identity</p>
                  </div>
                  <motion.button 
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsEditing(false)} 
                    className="w-12 h-12 rounded-2xl bg-off-white flex items-center justify-center"
                  >
                    <X size={24} className="text-onyx" />
                  </motion.button>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-charcoal/40 uppercase tracking-widest ml-1">Full Name</label>
                    <Input 
                      value={formData.full_name} 
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} 
                      className="h-14 rounded-2xl border-none bg-off-white font-black px-5 text-onyx focus-visible:ring-onyx placeholder:text-charcoal/20"
                      placeholder="Your Full Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-charcoal/40 uppercase tracking-widest ml-1">Username</label>
                    <Input 
                      value={formData.username} 
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })} 
                      className="h-14 rounded-2xl border-none bg-off-white font-black px-5 text-onyx focus-visible:ring-onyx placeholder:text-charcoal/20"
                      placeholder="Username"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-charcoal/40 uppercase tracking-widest ml-1">Phone</label>
                    <Input 
                      value={formData.phone} 
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                      className="h-14 rounded-2xl border-none bg-off-white font-black px-5 text-onyx focus-visible:ring-onyx placeholder:text-charcoal/20"
                      placeholder="Phone Number"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-charcoal/40 uppercase tracking-widest ml-1">Avatar URL</label>
                    <Input 
                      value={formData.avatar_url} 
                      onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })} 
                      className="h-14 rounded-2xl border-none bg-off-white font-black px-5 text-onyx focus-visible:ring-onyx placeholder:text-charcoal/20"
                      placeholder="Image URL"
                    />
                  </div>

                  <motion.button 
                    whileTap={{ scale: 0.98 }}
                    type="submit" 
                    disabled={saving}
                    className="w-full h-14 bg-onyx text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] shadow-xl"
                  >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Save Changes"}
                  </motion.button>
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
