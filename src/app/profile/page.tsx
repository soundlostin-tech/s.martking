"use client";

import { HeroSection } from "@/components/layout/HeroSection";
import { BottomNav } from "@/components/layout/BottomNav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronRight, 
  User, 
  Shield, 
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
  Lock, 
  Trash2, 
  AlertCircle,
  CheckCircle2,
  Swords,
  TrendingUp,
  Settings,
  Calendar
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    avatar_url: "",
    country: "",
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
        country: profileData?.country || "India",
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
      <div className="min-h-screen flex items-center justify-center bg-zinc-100">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-32 bg-zinc-100">
      <HeroSection 
        title="Agent Profile" 
        subtitle="Customize your identity and review your battlefield achievements."
        className="bg-zinc-100"
      />

      <div className="px-6 -mt-16 relative z-10 space-y-8 max-w-2xl mx-auto">
        {/* Profile Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/40 backdrop-blur-xl border border-white/20 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden flex flex-col items-center text-center"
        >
          <div className="relative mb-6">
            <Avatar className="w-32 h-32 border-4 border-white shadow-2xl">
              <AvatarImage src={profile?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop"} />
              <AvatarFallback className="bg-black text-white text-3xl font-heading">
                {profile?.full_name?.substring(0, 2).toUpperCase() || "SK"}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 -right-2 bg-black text-white p-2.5 rounded-2xl shadow-xl">
              <Trophy size={20} />
            </div>
          </div>
          
          <div className="space-y-2 relative z-10">
            <h2 className="text-4xl font-heading text-black">{profile?.full_name || "Arena Champion"}</h2>
            <div className="flex items-center justify-center gap-2">
              <Badge className="bg-black/5 text-black border-none rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-wider">
                {profile?.role || "Elite Player"}
              </Badge>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full border border-white/30 backdrop-blur-sm">
                <CheckCircle2 size={12} className="text-black" />
                <span className="text-[9px] text-black font-bold uppercase tracking-widest">Verified</span>
              </div>
            </div>
          </div>
          <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-zinc-200/30 blur-[100px] rounded-full" />
        </motion.div>

        {/* Action Controls */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="h-20 flex items-center justify-center gap-3 bg-white/40 backdrop-blur-xl border border-white/20 rounded-full font-serif text-lg text-black shadow-xl hover:bg-white/60 transition-all active:scale-95"
          >
            {isEditing ? <X size={20} /> : <Settings size={20} />}
            {isEditing ? "Close" : "Edit Profile"}
          </button>
          <button 
            onClick={handleLogout}
            className="h-20 flex items-center justify-center gap-3 bg-black text-white rounded-full font-serif text-lg shadow-xl hover:bg-zinc-800 transition-all active:scale-95"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>

        {/* Content Section */}
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.form 
              key="edit"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onSubmit={handleUpdateProfile}
              className="bg-white/40 backdrop-blur-xl border border-white/20 rounded-[3rem] p-10 shadow-2xl space-y-8"
            >
              <h3 className="text-2xl font-heading text-black">Update Identity</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-4">Full Name</label>
                  <Input 
                    value={formData.full_name} 
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} 
                    className="h-16 px-8 rounded-full border-zinc-200 bg-white/60 shadow-lg text-black font-serif"
                    placeholder="E.g. John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-4">Phone Number</label>
                  <Input 
                    value={formData.phone} 
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                    className="h-16 px-8 rounded-full border-zinc-200 bg-white/60 shadow-lg text-black font-serif"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-4">Avatar Image URL</label>
                  <Input 
                    value={formData.avatar_url} 
                    onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })} 
                    className="h-16 px-8 rounded-full border-zinc-200 bg-white/60 shadow-lg text-black font-serif"
                    placeholder="https://images..."
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={saving}
                className="w-full h-16 bg-black text-white rounded-full font-serif text-lg shadow-xl hover:bg-zinc-800 transition-all flex items-center justify-center gap-3"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save size={20} /> Save Changes</>}
              </button>
            </motion.form>
          ) : (
            <motion.div 
              key="view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Matches", value: profile?.matches_played || 12, icon: Swords },
                  { label: "Win Rate", value: `${profile?.win_rate || 24}%`, icon: TrendingUp },
                  { label: "Kills", value: "342", icon: Target },
                  { label: "Rewards", value: `₹${(wallet?.lifetime_earnings || 0).toLocaleString()}`, icon: DollarSign },
                ].map((stat, i) => (
                  <div key={i} className="bg-white/40 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-6 shadow-xl flex flex-col gap-3">
                    <div className="w-10 h-10 bg-black text-white rounded-2xl flex items-center justify-center shadow-lg">
                      <stat.icon size={20} />
                    </div>
                    <div>
                      <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">{stat.label}</p>
                      <p className="text-2xl font-heading text-black">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Account List */}
              <div className="bg-white/40 backdrop-blur-xl border border-white/20 rounded-[3rem] p-4 shadow-2xl space-y-2">
                {[
                  { label: "Email", value: user?.email, icon: Mail },
                  { label: "Phone", value: profile?.phone || "Not linked", icon: Phone },
                  { label: "Location", value: profile?.country || "India", icon: Globe },
                  { label: "Member Since", value: new Date(profile?.created_at).toLocaleDateString(), icon: Calendar },
                ].map((item, i) => (
                  <div key={i} className="group flex justify-between items-center p-5 hover:bg-white/40 rounded-[2rem] transition-all">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-black/5 rounded-2xl flex items-center justify-center text-black/40 group-hover:bg-black group-hover:text-white transition-all">
                        <item.icon size={22} />
                      </div>
                      <div>
                        <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">{item.label}</p>
                        <p className="text-base font-serif text-black font-bold">{item.value}</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-zinc-200 group-hover:text-black transition-colors" />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Danger Zone */}
        <div className="bg-red-50/20 backdrop-blur-sm border border-red-100 rounded-[3rem] p-8 text-center space-y-4">
          <div className="w-14 h-14 bg-red-100 text-red-500 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Trash2 size={24} />
          </div>
          <div className="space-y-1">
            <h4 className="text-lg font-heading text-red-600">Retire Account</h4>
            <p className="text-xs text-red-400 font-serif max-w-[240px] mx-auto leading-relaxed">
              Permanent deletion will remove all match history and forfeits remaining balance.
            </p>
          </div>
          <button className="text-xs font-bold text-red-600 underline underline-offset-4 decoration-red-200 hover:decoration-red-600 transition-all">
            Initiate Deletion
          </button>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
