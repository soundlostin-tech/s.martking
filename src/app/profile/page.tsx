"use client";

import { BottomNav } from "@/components/layout/BottomNav";
import { TopHeader } from "@/components/layout/TopHeader";
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
  FileText
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-onyx/20" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-onyx relative z-10">
      <main className="pb-32">
        <TopHeader />

        {/* Header Section */}
        <section className="px-6 pt-6 pb-4">
          <p className="text-[10px] font-bold text-charcoal/50 uppercase tracking-[0.2em] mb-2">
            Your Account
          </p>
          <h2 className="text-[32px] font-heading text-onyx leading-tight font-black">
            User <br />
            <span className="text-onyx">Profile</span>
          </h2>
        </section>

        <div className="px-6 space-y-6">
          {/* Profile Card */}
          <BentoCard variant="hero" pastelColor="peach" className="p-8">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full p-[3px] bg-onyx">
                  <div className="w-full h-full rounded-full bg-white p-0.5">
                    <Avatar className="w-full h-full rounded-full">
                      {profile?.avatar_url ? (
                        <AvatarImage src={profile?.avatar_url} className="object-cover" />
                      ) : (
                        <AvatarFallback className="bg-off-white text-onyx text-2xl font-heading">
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
              <div className="flex-1">
                <h3 className="text-xl font-heading text-onyx font-black">{profile?.full_name || "Warrior"}</h3>
                <p className="text-[10px] text-charcoal/50 font-bold uppercase tracking-widest mt-0.5">@{profile?.username || user?.email?.split('@')[0]}</p>
                {profile?.free_fire_uid && (
                  <div className="mt-2 inline-flex items-center px-2 py-0.5 bg-onyx/5 rounded-md">
                    <span className="text-[9px] text-onyx font-black uppercase tracking-widest">UID: {profile.free_fire_uid}</span>
                  </div>
                )}
              </div>
            </div>
          </BentoCard>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Total Wins", value: Math.floor((profile?.matches_played || 0) * (parseFloat(profile?.win_rate || "0") / 100)), icon: Trophy, color: "bg-pastel-yellow" },
              { label: "Win Rate", value: `${profile?.win_rate || 0}%`, icon: TrendingUp, color: "bg-pastel-mint" },
              { label: "Earnings", value: `₹${(wallet?.lifetime_earnings || 0).toLocaleString()}`, icon: Award, color: "bg-pastel-lavender" },
              { label: "Matches", value: profile?.matches_played || 0, icon: Gamepad2, color: "bg-pastel-peach" },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <BentoCard className="p-6 border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${stat.color}`}>
                      <stat.icon size={16} className="text-onyx" />
                    </div>
                    <span className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest">{stat.label}</span>
                  </div>
                  <h4 className="text-2xl font-heading text-onyx font-black">{stat.value}</h4>
                </BentoCard>
              </motion.div>
            ))}
          </div>

          {/* Settings Menu */}
          <section className="space-y-4">
            <h3 className="text-lg font-heading text-onyx font-black px-1">Settings</h3>
            
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
                  <span className="text-[9px] font-bold text-onyx/40 bg-off-white px-3 py-1 rounded-full uppercase tracking-widest">Pending</span>
                }
              />
            </div>
          </section>

          {/* Support Menu */}
          <section className="space-y-4">
            <h3 className="text-lg font-heading text-onyx font-black px-1">Support</h3>
            
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
          <BentoCard 
            className="p-6 flex items-center justify-between cursor-pointer border-none bg-pastel-coral/20"
            onClick={handleLogout}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-pastel-coral flex items-center justify-center">
                <LogOut size={20} className="text-onyx" />
              </div>
              <span className="text-[14px] font-black text-onyx uppercase tracking-widest">Sign Out</span>
            </div>
            <ChevronRight size={20} className="text-onyx/20" />
          </BentoCard>
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
                className="bg-white w-full max-w-md rounded-[40px] p-8 space-y-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-heading text-onyx font-black">Edit Identity</h3>
                    <p className="text-[10px] text-charcoal/40 font-bold uppercase tracking-widest mt-1">Update your presence in the arena</p>
                  </div>
                  <motion.button 
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsEditing(false)} 
                    className="w-12 h-12 rounded-2xl bg-off-white flex items-center justify-center"
                  >
                    <X size={24} className="text-onyx" />
                  </motion.button>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-charcoal/40 uppercase tracking-widest ml-1">Real Name</label>
                    <Input 
                      value={formData.full_name} 
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} 
                      className="h-16 rounded-2xl border border-black/5 bg-background font-black px-6 text-onyx focus-visible:ring-onyx placeholder:text-charcoal/20"
                      placeholder="Your Full Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-charcoal/40 uppercase tracking-widest ml-1">Warrior Handle</label>
                    <Input 
                      value={formData.username} 
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })} 
                      className="h-16 rounded-2xl border border-black/5 bg-background font-black px-6 text-onyx focus-visible:ring-onyx placeholder:text-charcoal/20"
                      placeholder="Username"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-charcoal/40 uppercase tracking-widest ml-1">Communication</label>
                    <Input 
                      value={formData.phone} 
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                      className="h-16 rounded-2xl border border-black/5 bg-background font-black px-6 text-onyx focus-visible:ring-onyx placeholder:text-charcoal/20"
                      placeholder="Phone Number"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-charcoal/40 uppercase tracking-widest ml-1">Avatar Resource</label>
                    <Input 
                      value={formData.avatar_url} 
                      onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })} 
                      className="h-16 rounded-2xl border border-black/5 bg-background font-black px-6 text-onyx focus-visible:ring-onyx placeholder:text-charcoal/20"
                      placeholder="Image URL"
                    />
                  </div>

                  <motion.button 
                    whileTap={{ scale: 0.98 }}
                    type="submit" 
                    disabled={saving}
                    className="w-full h-16 bg-onyx text-white rounded-2xl text-[12px] font-bold uppercase tracking-[0.2em] shadow-xl shadow-onyx/10"
                  >
                    {saving ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : "Deploy Changes"}
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
