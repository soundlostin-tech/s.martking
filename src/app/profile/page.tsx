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
      <div className="min-h-screen flex items-center justify-center bg-[#D4D7DE]">
        <Loader2 className="w-10 h-10 animate-spin text-[#868935]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#D4D7DE] text-[#11130D]">
      <main className="pb-28 relative z-10">
        <TopHeader />

        {/* Pastel Blob Header */}
        <section className="relative px-4 sm:px-6 pt-6 pb-4 blob-header blob-header-peach">
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-[#4A4B48] uppercase tracking-[0.2em] mb-1">
              Your Account
            </p>
            <h2 className="text-2xl sm:text-3xl font-heading text-[#11130D]">
              <span className="text-[#868935]">Profile</span>
            </h2>
          </div>
        </section>

        <div className="px-4 sm:px-6 pt-4 space-y-6">
          {/* Profile Card */}
          <BentoCard variant="hero" pastelColor="peach" className="p-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full p-[3px] bg-gradient-to-br from-[#D7FD03] to-[#C7E323]">
                  <div className="w-full h-full rounded-full bg-white p-0.5">
                    <Avatar className="w-full h-full rounded-full">
                      {profile?.avatar_url ? (
                        <AvatarImage src={profile?.avatar_url} className="object-cover" />
                      ) : (
                        <AvatarFallback className="bg-[#E8E9EC] text-[#868935] text-2xl font-heading">
                          {profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0].toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </div>
                </div>
                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsEditing(true)}
                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#D7FD03] rounded-full flex items-center justify-center shadow-lg"
                >
                  <Edit2 size={14} className="text-[#11130D]" />
                </motion.button>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-heading text-[#11130D]">{profile?.full_name || "Warrior"}</h3>
                <p className="text-[11px] text-[#4A4B48] font-medium">@{profile?.username || user?.email?.split('@')[0]}</p>
                {profile?.free_fire_uid && (
                  <p className="text-[10px] text-[#868935] font-bold uppercase tracking-wide mt-1">UID: {profile.free_fire_uid}</p>
                )}
              </div>
            </div>
          </BentoCard>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
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
              >
                <BentoCard className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-[#D7FD03]/20 flex items-center justify-center">
                      <stat.icon size={16} className="text-[#868935]" />
                    </div>
                    <span className="text-[10px] font-bold text-[#4A4B48] uppercase tracking-wide">{stat.label}</span>
                  </div>
                  <h4 className="text-xl font-heading text-[#11130D]">{stat.value}</h4>
                </BentoCard>
              </motion.div>
            ))}
          </div>

          {/* Settings Menu */}
          <section className="space-y-3">
            <h3 className="text-sm font-heading text-[#11130D] px-1">Settings</h3>
            
            <div className="space-y-2">
              <ListRow 
                icon={<Settings size={18} />}
                title="Account & Security"
                meta="Manage your account settings"
              />
              <ListRow 
                icon={<Bell size={18} />}
                title="Notifications"
                meta="Match reminders, results, wallet"
              />
              <Link href="/wallet">
                <ListRow 
                  icon={<CreditCard size={18} />}
                  title="Wallet"
                  meta="Manage funds and withdrawals"
                />
              </Link>
              <ListRow 
                icon={<ShieldCheck size={18} />}
                title="KYC Verification"
                meta="Verify your identity"
                rightContent={
                  <span className="text-[9px] font-bold text-[#7A5C00] bg-[#F5D68A] px-2 py-1 rounded-full uppercase">Pending</span>
                }
              />
            </div>
          </section>

          {/* Support Menu */}
          <section className="space-y-3">
            <h3 className="text-sm font-heading text-[#11130D] px-1">Support</h3>
            
            <div className="space-y-2">
              <ListRow 
                icon={<HelpCircle size={18} />}
                title="Help & Support"
                meta="FAQs and contact us"
              />
              <ListRow 
                icon={<FileText size={18} />}
                title="Terms & Privacy"
                meta="Legal information"
              />
            </div>
          </section>

          {/* Logout */}
          <BentoCard 
            className="p-4 flex items-center justify-between cursor-pointer border-[#F5A8A8]/30"
            onClick={handleLogout}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F5A8A8]/20 flex items-center justify-center">
                <LogOut size={18} className="text-[#8A2020]" />
              </div>
              <span className="text-[13px] font-semibold text-[#8A2020]">Sign Out</span>
            </div>
            <ChevronRight size={18} className="text-[#8A2020]/30" />
          </BentoCard>
        </div>

        {/* Edit Profile Modal */}
        <AnimatePresence>
          {isEditing && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center"
            >
              <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="bg-white w-full max-w-md rounded-t-[28px] sm:rounded-[28px] p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-heading text-[#11130D]">Edit Profile</h3>
                    <p className="text-[10px] text-[#4A4B48] font-medium uppercase tracking-wide">Update your information</p>
                  </div>
                  <motion.button 
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsEditing(false)} 
                    className="w-10 h-10 rounded-xl bg-[#E8E9EC] flex items-center justify-center"
                  >
                    <X size={20} className="text-[#4A4B48]" />
                  </motion.button>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#4A4B48] uppercase tracking-wider ml-1">Name</label>
                    <Input 
                      value={formData.full_name} 
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} 
                      className="h-12 rounded-xl border border-[#C8C8C4]/30 bg-[#E8E9EC] font-medium px-4 text-[#11130D] focus-visible:ring-[#D7FD03]"
                      placeholder="Your Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#4A4B48] uppercase tracking-wider ml-1">Username</label>
                    <Input 
                      value={formData.username} 
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })} 
                      className="h-12 rounded-xl border border-[#C8C8C4]/30 bg-[#E8E9EC] font-medium px-4 text-[#11130D] focus-visible:ring-[#D7FD03]"
                      placeholder="Username"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#4A4B48] uppercase tracking-wider ml-1">Phone</label>
                    <Input 
                      value={formData.phone} 
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                      className="h-12 rounded-xl border border-[#C8C8C4]/30 bg-[#E8E9EC] font-medium px-4 text-[#11130D] focus-visible:ring-[#D7FD03]"
                      placeholder="+91"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#4A4B48] uppercase tracking-wider ml-1">Avatar URL</label>
                    <Input 
                      value={formData.avatar_url} 
                      onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })} 
                      className="h-12 rounded-xl border border-[#C8C8C4]/30 bg-[#E8E9EC] font-medium px-4 text-[#11130D] focus-visible:ring-[#D7FD03]"
                      placeholder="https://..."
                    />
                  </div>

                  <motion.button 
                    whileTap={{ scale: 0.98 }}
                    type="submit" 
                    disabled={saving}
                    className="w-full h-14 bg-[#D7FD03] text-[#11130D] rounded-xl text-[11px] font-bold uppercase tracking-wider shadow-lg shadow-[#D7FD03]/30"
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
