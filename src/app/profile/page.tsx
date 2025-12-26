"use client";

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-foreground" />
      </div>
    );
  }

    return (
        <main className="min-h-screen pb-32 bg-background relative overflow-x-hidden">
            <div className="mesh-bg">
              <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] animate-blob" />
              <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] animate-blob [animation-delay:2s]" />
            </div>

      {/* Header */}
      <div className="px-6 pt-12 pb-6 bg-white/40 backdrop-blur-xl border-b border-white/20 sticky top-0 z-30 shadow-xl">
        <h1 className="text-3xl font-heading text-black">Agent Identity</h1>
        <p className="text-sm text-zinc-500 font-serif">Customize your profile and track your battle statistics.</p>
      </div>

      <div className="px-6 mt-8 relative z-10 space-y-8 max-w-4xl mx-auto">
              {/* Profile Card - Mobile App Style */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[3rem] p-10 md:p-14 shadow-[0_40px_100px_-15px_rgba(0,0,0,0.1)] relative overflow-hidden flex flex-col items-center text-center border-b-[12px] border-lemon-lime"
              >
                {/* Geometric accents inside card */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-jungle-teal/5 shape-triangle rotate-45 -mr-10 -mt-10" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-sea-green/5 shape-circle -ml-10 -mb-10" />

              <div className="relative mb-10 group">
                <div className="absolute inset-0 bg-jungle-teal/10 blur-2xl rounded-full scale-110 group-hover:scale-125 transition-transform" />
                <Avatar className="w-48 h-48 border-8 border-white shadow-2xl relative z-10">
                  <AvatarImage src={profile?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop"} className="object-cover" />
                  <AvatarFallback className="bg-jungle-teal text-white text-5xl font-heading uppercase">
                    {profile?.full_name?.substring(0, 2) || "SK"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-2 right-2 bg-lemon-lime text-white p-4 rounded-[2rem] shadow-2xl z-20 group-hover:rotate-12 transition-transform border-4 border-white">
                  <Trophy size={32} />
                </div>
              </div>
              
              <div className="space-y-4 relative z-10">
                <h2 className="text-5xl md:text-6xl font-heading text-black tracking-tighter">{profile?.full_name || "Arena Champion"}</h2>
                <div className="flex items-center justify-center gap-4">
                  <Badge className="bg-jungle-teal/5 text-jungle-teal border-none rounded-xl px-6 py-2 text-xs font-bold uppercase tracking-[0.2em]">
                    {profile?.role || "Elite Player"}
                  </Badge>
                  <div className="flex items-center gap-2 px-5 py-2 bg-sea-green text-white rounded-xl shadow-xl shadow-sea-green/20">
                    <CheckCircle2 size={16} />
                    <span className="text-xs font-bold uppercase tracking-widest">Verified</span>
                  </div>
                </div>
              </div>
            </motion.div>
  
              {/* Content Section */}
              <AnimatePresence mode="wait">
                {isEditing ? (
                  <motion.form 
                    key="edit"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, y: 20 }}
                    onSubmit={handleUpdateProfile}
                    className="bg-white rounded-[3rem] p-12 shadow-2xl space-y-12 relative overflow-hidden border-t-[12px] border-jungle-teal"
                  >
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-10">
                        <h3 className="text-3xl font-heading text-black">Edit <span className="text-jungle-teal">Profile</span></h3>
                        <button onClick={() => setIsEditing(false)} className="w-12 h-12 flex items-center justify-center bg-muted rounded-full text-jungle-teal hover:bg-jungle-teal hover:text-white transition-colors">
                          <X size={24} />
                        </button>
                      </div>
                      
                      <div className="space-y-10">
                        <div className="space-y-3">
                          <label className="text-xs font-bold text-black/30 uppercase tracking-[0.3em] ml-2">Full Name</label>
                          <Input 
                            value={formData.full_name} 
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} 
                            className="h-16 px-8 rounded-2xl border-2 border-muted bg-muted/50 text-black font-bold focus:border-jungle-teal focus:ring-0 transition-all text-lg"
                            placeholder="Full Name"
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-xs font-bold text-black/30 uppercase tracking-[0.3em] ml-2">Phone Number</label>
                          <Input 
                            value={formData.phone} 
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                            className="h-16 px-8 rounded-2xl border-2 border-muted bg-muted/50 text-black font-bold focus:border-jungle-teal focus:ring-0 transition-all text-lg"
                            placeholder="+91 XXXXX XXXXX"
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-xs font-bold text-black/30 uppercase tracking-[0.3em] ml-2">Avatar URL</label>
                          <Input 
                            value={formData.avatar_url} 
                            onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })} 
                            className="h-16 px-8 rounded-2xl border-2 border-muted bg-muted/50 text-black font-bold focus:border-jungle-teal focus:ring-0 transition-all text-lg"
                            placeholder="Image URL"
                          />
                        </div>
                      </div>

                      <button 
                        type="submit" 
                        disabled={saving}
                        className="w-full h-20 bg-jungle-teal text-white rounded-[2rem] font-bold text-xl shadow-2xl shadow-jungle-teal/30 hover:bg-sea-green transition-all flex items-center justify-center gap-4 mt-12 active:scale-[0.98]"
                      >
                        {saving ? <Loader2 className="w-7 h-7 animate-spin" /> : <><Save size={24} /> Save Changes</>}
                      </button>
                    </div>
                  </motion.form>
                ) : (
                  <motion.div 
                    key="view"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                  >
                    {/* Native App Grid Menu */}
                    <div className="grid grid-cols-2 gap-6">
                        <button 
                          onClick={() => setIsEditing(true)}
                          className="bg-white rounded-[2.5rem] p-8 shadow-xl flex flex-col items-center gap-4 group hover:scale-[1.02] transition-all border-b-8 border-lemon-lime"
                        >
                          <div className="w-16 h-16 bg-lemon-lime/10 text-lemon-lime rounded-[1.5rem] flex items-center justify-center group-hover:rotate-12 transition-transform">
                            <Settings size={32} />
                          </div>
                          <span className="font-heading text-xl">Preferences</span>
                        </button>

                        <button 
                          onClick={handleLogout}
                          className="bg-jungle-teal rounded-[2.5rem] p-8 shadow-xl flex flex-col items-center gap-4 group hover:scale-[1.02] transition-all border-b-8 border-sea-green"
                        >
                          <div className="w-16 h-16 bg-white/10 text-white rounded-[1.5rem] flex items-center justify-center group-hover:translate-x-1 transition-transform">
                            <LogOut size={32} />
                          </div>
                          <span className="font-heading text-xl text-white">Sign Out</span>
                        </button>
                    </div>

                    {/* Stats Section - Geometric Style */}
                    <div className="grid grid-cols-2 gap-6">
                      {[
                        { label: "Matches", value: profile?.matches_played || 12, icon: Swords, color: "bg-jungle-teal" },
                        { label: "Win Rate", value: `${profile?.win_rate || 24}%`, icon: TrendingUp, color: "bg-sea-green" },
                        { label: "Total Kills", value: "342", icon: Target, color: "bg-lemon-lime" },
                        { label: "Earnings", value: `₹${(wallet?.lifetime_earnings || 0).toLocaleString()}`, icon: DollarSign, color: "bg-yellow" },
                      ].map((stat, i) => (
                        <div key={i} className="bg-white rounded-[2.5rem] p-8 shadow-xl flex flex-col gap-6 relative overflow-hidden group">
                          <div className={`absolute top-0 right-0 w-24 h-24 ${stat.color} opacity-5 shape-diamond -mr-8 -mt-8`} />
                          <div className={`w-14 h-14 ${stat.color} text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                            <stat.icon size={28} />
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-black/30 font-bold uppercase tracking-[0.2em]">{stat.label}</p>
                            <p className="text-4xl font-heading text-black">{stat.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
    
                    {/* Account Settings List */}
                    <div className="bg-white rounded-[3.5rem] p-8 shadow-xl space-y-4">
                      <h4 className="text-2xl font-heading px-4 mb-6">Account <span className="text-lemon-lime">Details</span></h4>
                      {[
                        { label: "Email", value: user?.email, icon: Mail },
                        { label: "Contact", value: profile?.phone || "Not linked", icon: Phone },
                        { label: "Region", value: profile?.country || "India", icon: Globe },
                        { label: "Joined", value: new Date(profile?.created_at).toLocaleDateString(), icon: Calendar },
                      ].map((item, i) => (
                        <div key={i} className="group flex justify-between items-center p-6 hover:bg-muted rounded-[2rem] transition-all">
                          <div className="flex items-center gap-6">
                            <div className="w-14 h-14 bg-muted text-jungle-teal rounded-[1.2rem] flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-jungle-teal group-hover:text-white transition-all">
                              <item.icon size={24} />
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-[10px] text-black/30 font-bold uppercase tracking-[0.2em]">{item.label}</p>
                              <p className="text-lg font-bold text-black tracking-tight">{item.value}</p>
                            </div>
                          </div>
                          <ChevronRight size={20} className="text-black/10 group-hover:text-jungle-teal group-hover:translate-x-1 transition-all" />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
  
            {/* Danger Zone */}
            <div className="bg-red-50 rounded-[3rem] p-12 text-center space-y-6 shadow-xl relative overflow-hidden group border-2 border-red-100">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-red-500/5 blur-[100px] pointer-events-none" />
              <div className="w-24 h-24 bg-red-100 text-red-500 rounded-[2rem] flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform">
                <Trash2 size={40} />
              </div>
              <div className="space-y-2 relative z-10">
                <h4 className="text-3xl font-heading text-red-600">Retire Account</h4>
                <p className="text-base text-red-400 font-medium max-w-xs mx-auto leading-relaxed italic">
                  Permanent deletion of all your battlefield records.
                </p>
              </div>
              <button className="px-12 py-5 bg-red-500 text-white rounded-[2rem] text-sm font-bold uppercase tracking-[0.2em] shadow-xl shadow-red-500/20 hover:bg-red-600 active:scale-95 transition-all relative z-10">
                Initiate Deletion
              </button>
            </div>
          </div>



      <BottomNav />
    </main>
  );
}
