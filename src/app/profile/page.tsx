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
  CreditCard
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    avatar_url: "",
  });

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    try {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .single();
      
      const { data: walletData } = await supabase
        .from("wallets")
        .select("*")
        .eq("id", user!.id)
        .single();
      
      setProfile(profileData);
      setWallet(walletData);
      setFormData({
        full_name: profileData?.full_name || "",
        phone: profileData?.phone || "",
        avatar_url: profileData?.avatar_url || "",
      });
    } catch (error) {
      console.error("Error fetching profile data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update(formData)
        .eq("id", user!.id);
      
      if (error) throw error;
      toast.success("Profile updated");
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
    toast.success("Signed out");
    window.location.href = "/signin";
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="pb-32">
        <TopHeader />

        <div className="px-6 pt-8 space-y-8 max-w-lg mx-auto">
          {/* Header Profile Section - Native Mobile Style */}
          <section className="flex flex-col items-center text-center">
            <div className="relative mb-6">
              <motion.div 
                whileTap={{ scale: 0.95 }}
                className="w-32 h-32 rounded-[40px] p-1 bg-gradient-to-tr from-primary to-accent shadow-2xl shadow-primary/20"
              >
                <div className="w-full h-full rounded-[38px] bg-background p-1">
                  <Avatar className="w-full h-full rounded-[36px] border-none">
                    <AvatarImage src={profile?.avatar_url} className="object-cover" />
                    <AvatarFallback className="bg-muted text-foreground/20 text-3xl font-bold">
                      {profile?.full_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </motion.div>
              <button 
                onClick={() => setIsEditing(true)}
                className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-2xl shadow-xl flex items-center justify-center text-primary border border-foreground/[0.04] active:scale-90 transition-all"
              >
                <Edit2 size={18} />
              </button>
            </div>
            
            <h2 className="text-2xl font-bold text-foreground mb-1">{profile?.full_name || "New Player"}</h2>
            <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-[0.2em]">{user?.email}</p>
          </section>

          {/* Stats Grid - Native Mini Cards */}
          <section className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-[32px] border border-foreground/[0.04] shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Swords size={16} />
                </div>
                <span className="text-[9px] font-bold text-foreground/30 uppercase tracking-widest">Matches</span>
              </div>
              <h4 className="text-2xl font-bold text-foreground">{profile?.matches_played || 0}</h4>
            </div>
            <div className="bg-white p-6 rounded-[32px] border border-foreground/[0.04] shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                  <Trophy size={16} />
                </div>
                <span className="text-[9px] font-bold text-foreground/30 uppercase tracking-widest">Wins</span>
              </div>
              <h4 className="text-2xl font-bold text-foreground">{profile?.win_rate || 0}%</h4>
            </div>
          </section>

          {/* Profile Menu - Native List Pattern */}
          <section className="bg-white rounded-[40px] overflow-hidden border border-foreground/[0.04] shadow-sm">
            <div className="p-4 space-y-1">
              {[
                { label: "Account Settings", icon: Settings, href: "#", color: "text-blue-500" },
                { label: "Notification", icon: Bell, href: "#", color: "text-orange-500" },
                { label: "Payment Methods", icon: CreditCard, href: "/wallet", color: "text-emerald-500" },
                { label: "Security", icon: ShieldCheck, href: "#", color: "text-indigo-500" },
              ].map((item, i) => (
                <button 
                  key={i}
                  className="w-full flex items-center justify-between p-4 hover:bg-foreground/[0.02] active:bg-foreground/[0.04] transition-all rounded-[24px] group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-2xl bg-foreground/[0.02] flex items-center justify-center ${item.color}`}>
                      <item.icon size={20} />
                    </div>
                    <span className="text-sm font-bold text-foreground/80">{item.label}</span>
                  </div>
                  <ChevronRight size={18} className="text-foreground/10 group-active:translate-x-1 transition-all" />
                </button>
              ))}
              
              <div className="h-[1px] bg-foreground/[0.04] my-2 mx-4" />
              
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-between p-4 hover:bg-red-50 active:bg-red-100 transition-all rounded-[24px] group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center text-red-500">
                    <LogOut size={20} />
                  </div>
                  <span className="text-sm font-bold text-red-500/80">Sign Out</span>
                </div>
                <ChevronRight size={18} className="text-red-500/20 group-active:translate-x-1 transition-all" />
              </button>
            </div>
          </section>

          {/* Edit Profile Modal */}
          <AnimatePresence>
            {isEditing && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
              >
                <motion.div 
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  className="bg-white w-full max-w-md rounded-t-[40px] sm:rounded-[40px] p-8 space-y-8 shadow-2xl"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-foreground">Edit Profile</h3>
                    <button onClick={() => setIsEditing(false)} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <X size={20} />
                    </button>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-foreground/20 uppercase tracking-widest ml-1">Full Name</label>
                      <Input 
                        value={formData.full_name} 
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} 
                        className="h-14 rounded-2xl border-foreground/[0.06] bg-foreground/[0.02] font-bold px-6"
                        placeholder="Your Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-foreground/20 uppercase tracking-widest ml-1">Phone Number</label>
                      <Input 
                        value={formData.phone} 
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                        className="h-14 rounded-2xl border-foreground/[0.06] bg-foreground/[0.02] font-bold px-6"
                        placeholder="+91"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-foreground/20 uppercase tracking-widest ml-1">Avatar URL</label>
                      <Input 
                        value={formData.avatar_url} 
                        onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })} 
                        className="h-14 rounded-2xl border-foreground/[0.06] bg-foreground/[0.02] font-bold px-6"
                        placeholder="https://..."
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={saving}
                      className="w-full py-4 bg-primary text-white rounded-2xl text-xs font-bold uppercase tracking-[0.2em] shadow-lg shadow-primary/20"
                    >
                      {saving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Save Changes"}
                    </button>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
