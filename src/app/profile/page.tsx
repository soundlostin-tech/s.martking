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
import { LoadingScreen } from "@/components/ui/LoadingScreen";
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

    const [showTooltip, setShowTooltip] = useState<string | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const statTooltips: Record<string, string> = {
      "Total Wins": "Matches won across all tournaments.",
      "Win Rate": "Percentage of matches won. Updated every 24 hours.",
      "Earnings": "Total ₹ earned from prizes and kill rewards.",
      "Matches": "Total number of tournament entries."
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
      e.preventDefault();
      
      const hasCriticalChanges = formData.phone !== profile?.phone || formData.username !== profile?.username;
      
      if (hasCriticalChanges && !isConfirmOpen) {
        setIsConfirmOpen(true);
        return;
      }

      setSaving(true);
      // ...


  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    window.location.href = "/signin";
  };

  if (authLoading || loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#1A1A1A] relative">
      {/* Background is now global */}
      
      <main className="pb-[80px] relative z-10">
        <section className="px-4 pt-6 pb-4">
          <p className="text-[12px] font-bold text-[#6B7280] uppercase tracking-wide mb-2">
            Your Account
          </p>
          <h2 className="text-[32px] font-heading text-[#1A1A1A] leading-tight font-bold">
            Profile
          </h2>
        </section>

        <div className="px-4 space-y-4">
          <BentoCard variant="pastel" pastelColor="rose" className="p-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-18 h-18 rounded-full p-[2px] bg-[#1A1A1A]">
                  <div className="w-full h-full rounded-full bg-white p-0.5">
                    <Avatar className="w-16 h-16 rounded-full">
                      {profile?.avatar_url ? (
                        <AvatarImage src={profile?.avatar_url} className="object-cover" />
                      ) : (
                        <AvatarFallback className="bg-[#F5F5F5] text-[#1A1A1A] text-xl font-heading">
                          {profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0].toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </div>
                </div>
                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsEditing(true)}
                  className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#1A1A1A] rounded-full flex items-center justify-center shadow-lg border-2 border-white"
                >
                  <Edit2 size={12} className="text-white" />
                </motion.button>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-heading text-[#1A1A1A] font-bold">{profile?.full_name || "Warrior"}</h3>
                <p className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wide mt-0.5">@{profile?.username || user?.email?.split('@')[0]}</p>
                {profile?.free_fire_uid && (
                  <div className="mt-2 inline-flex items-center px-2 py-0.5 bg-[#1A1A1A]/5 rounded-md">
                    <span className="text-[9px] text-[#1A1A1A] font-bold uppercase tracking-wide">UID: {profile.free_fire_uid}</span>
                  </div>
                )}
              </div>
            </div>
          </BentoCard>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Total Wins", value: Math.floor((profile?.matches_played || 0) * (parseFloat(profile?.win_rate || "0") / 100)), icon: Trophy, color: "bg-[#FEF3C7]" },
              { label: "Win Rate", value: `${profile?.win_rate || 0}%`, icon: TrendingUp, color: "bg-[#D1FAE5]" },
              { label: "Earnings", value: `₹${(wallet?.lifetime_earnings || 0).toLocaleString()}`, icon: Award, color: "bg-[#5FD3BC]" },
              { label: "Matches", value: profile?.matches_played || 0, icon: Gamepad2, color: "bg-[#FFEDD5]" },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <BentoCard className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.color}`}>
                      <stat.icon size={14} className="text-[#1A1A1A]" />
                    </div>
                    <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wide">{stat.label}</span>
                  </div>
                  <h4 className="text-xl font-heading text-[#1A1A1A] font-bold">{stat.value}</h4>
                </BentoCard>
              </motion.div>
            ))}
          </div>

          <section className="space-y-3 pt-2">
            <h3 className="text-lg font-heading text-[#1A1A1A] font-bold px-1">Settings</h3>
            
            <div className="space-y-2">
              <ListRow 
                icon={<Settings size={18} className="text-[#6B7280]" />}
                title="Account & Security"
                meta="Manage your credentials"
              />
              <ListRow 
                icon={<Bell size={18} className="text-[#6B7280]" />}
                title="Notifications"
                meta="Reminders and alerts"
              />
              <Link href="/wallet">
                <ListRow 
                  icon={<CreditCard size={18} className="text-[#6B7280]" />}
                  title="Payment Hub"
                  meta="Wallet and bank settings"
                />
              </Link>
              <ListRow 
                icon={<ShieldCheck size={18} className="text-[#6B7280]" />}
                title="Verification"
                meta="KYC and identity status"
                rightContent={
                  <span className="text-[9px] font-bold text-[#6B7280] bg-[#F5F5F5] px-3 py-1 rounded-full uppercase tracking-wide">Pending</span>
                }
              />
            </div>
          </section>

          <section className="space-y-3 pt-2">
            <h3 className="text-lg font-heading text-[#1A1A1A] font-bold px-1">Support</h3>
            
            <div className="space-y-2">
              <ListRow 
                icon={<HelpCircle size={18} className="text-[#6B7280]" />}
                title="Arena Help"
                meta="FAQs and support desk"
              />
              <ListRow 
                icon={<FileText size={18} className="text-[#6B7280]" />}
                title="Legal Hub"
                meta="Terms and privacy policy"
              />
            </div>
          </section>

          <BentoCard 
            className="p-5 flex items-center justify-between cursor-pointer bg-[#FEE2E2]/50"
            onClick={handleLogout}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#FEE2E2] flex items-center justify-center">
                <LogOut size={18} className="text-[#1A1A1A]" />
              </div>
              <span className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wide">Sign Out</span>
            </div>
            <ChevronRight size={18} className="text-[#9CA3AF]" />
          </BentoCard>
        </div>

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
                className="bg-white w-full max-w-md rounded-2xl p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-heading text-[#1A1A1A] font-bold">Edit Profile</h3>
                    <p className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wide mt-1">Update your presence</p>
                  </div>
                  <motion.button 
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsEditing(false)} 
                    className="w-10 h-10 rounded-lg bg-[#F5F5F5] flex items-center justify-center"
                  >
                    <X size={20} className="text-[#1A1A1A]" />
                  </motion.button>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wide ml-1">Full Name</label>
                    <Input 
                      value={formData.full_name} 
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} 
                      className="h-12 rounded-lg border border-[#E5E7EB] bg-white font-medium px-4 text-[#1A1A1A] focus:border-[#5FD3BC] focus:ring-2 focus:ring-[#5FD3BC]/20 placeholder:text-[#9CA3AF]"
                      placeholder="Your Full Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wide ml-1">Username</label>
                    <Input 
                      value={formData.username} 
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })} 
                      className="h-12 rounded-lg border border-[#E5E7EB] bg-white font-medium px-4 text-[#1A1A1A] focus:border-[#5FD3BC] focus:ring-2 focus:ring-[#5FD3BC]/20 placeholder:text-[#9CA3AF]"
                      placeholder="Username"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wide ml-1">Phone</label>
                    <Input 
                      value={formData.phone} 
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                      className="h-12 rounded-lg border border-[#E5E7EB] bg-white font-medium px-4 text-[#1A1A1A] focus:border-[#5FD3BC] focus:ring-2 focus:ring-[#5FD3BC]/20 placeholder:text-[#9CA3AF]"
                      placeholder="Phone Number"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wide ml-1">Avatar URL</label>
                    <Input 
                      value={formData.avatar_url} 
                      onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })} 
                      className="h-12 rounded-lg border border-[#E5E7EB] bg-white font-medium px-4 text-[#1A1A1A] focus:border-[#5FD3BC] focus:ring-2 focus:ring-[#5FD3BC]/20 placeholder:text-[#9CA3AF]"
                      placeholder="Image URL"
                    />
                  </div>

                  <motion.button 
                    whileTap={{ scale: 0.98 }}
                    type="submit" 
                    disabled={saving}
                    className="w-full h-12 bg-[#5FD3BC] text-[#1A1A1A] rounded-lg text-[12px] font-bold uppercase tracking-wide shadow-lg flex items-center justify-center disabled:bg-[#D1D5DB]"
                  >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
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
