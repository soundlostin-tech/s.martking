"use client";

import { BottomNav } from "@/components/layout/BottomNav";
import { TopHeader } from "@/components/layout/TopHeader";
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
    toast.success("Logged out");
    window.location.href = "/signin";
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-jungle-teal" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <TopHeader />
      
      <main className="pt-24 px-6 space-y-12 max-w-4xl mx-auto">
        <section className="flex flex-col items-center text-center space-y-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-3xl p-1 bg-card border border-border">
              <Avatar className="w-full h-full rounded-2xl">
                <AvatarImage src={profile?.avatar_url} className="object-cover" />
                <AvatarFallback className="bg-muted text-muted-foreground text-4xl font-bold">
                  {profile?.full_name?.[0].toUpperCase() || "SK"}
                </AvatarFallback>
              </Avatar>
            </div>
            <button 
              onClick={() => setIsEditing(true)}
              className="absolute -bottom-2 -right-2 w-10 h-10 bg-white border border-border text-primary rounded-xl flex items-center justify-center hover:bg-muted transition-all shadow-sm"
            >
              <Edit2 size={16} />
            </button>
          </div>
          
          <div className="space-y-1">
            <h2 className="text-3xl font-bold">{profile?.full_name || "Arena Member"}</h2>
            <p className="text-muted-foreground font-medium">@{profile?.username || user?.email?.split('@')[0]}</p>
          </div>
        </section>

        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Wins", value: Math.floor((profile?.matches_played || 0) * (parseFloat(profile?.win_rate || "0") / 100)), icon: Award },
            { label: "Win Rate", value: `${profile?.win_rate || 0}%`, icon: TrendingUp },
            { label: "Earnings", value: `₹${(wallet?.lifetime_earnings || 0).toLocaleString()}`, icon: Trophy },
            { label: "Matches", value: profile?.matches_played || 0, icon: Gamepad2 },
          ].map((stat, i) => (
            <div key={i} className="bg-card border border-border p-5 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <stat.icon size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">{stat.label}</span>
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
            </div>
          ))}
        </section>

        <section className="bg-card border border-border rounded-3xl overflow-hidden divide-y divide-border">
          {[
            { label: "Wallet & Transactions", icon: CreditCard, href: "/wallet" },
            { label: "Match History", icon: Activity, href: "/matches" },
            { label: "Settings", icon: Settings, href: "#" },
            { label: "Security", icon: ShieldCheck, href: "#" },
          ].map((item, i) => (
            <Link 
              key={i}
              href={item.href}
              className="flex items-center justify-between p-5 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <item.icon size={20} className="text-muted-foreground" />
                <span className="font-semibold">{item.label}</span>
              </div>
              <ChevronRight size={18} className="text-muted-foreground/50" />
            </Link>
          ))}
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-5 hover:bg-red-50 transition-colors text-left"
          >
            <div className="flex items-center gap-4">
              <LogOut size={20} className="text-red-500" />
              <span className="font-semibold text-red-500">Log Out</span>
            </div>
            <ChevronRight size={18} className="text-red-200" />
          </button>
        </section>
      </main>

      <AnimatePresence>
        {isEditing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border w-full max-w-md rounded-3xl p-8 shadow-2xl relative"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold">Edit Profile</h3>
                <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-muted rounded-xl transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Full Name</label>
                    <Input 
                      value={formData.full_name} 
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} 
                      className="rounded-xl border-border focus:ring-jungle-teal/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Username</label>
                    <Input 
                      value={formData.username} 
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })} 
                      className="rounded-xl border-border focus:ring-jungle-teal/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Avatar URL</label>
                    <Input 
                      value={formData.avatar_url} 
                      onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })} 
                      className="rounded-xl border-border focus:ring-jungle-teal/20"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={saving}
                  className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {saving ? <Loader2 size={24} className="animate-spin mx-auto" /> : "Save Changes"}
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
