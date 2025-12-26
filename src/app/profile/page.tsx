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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-foreground" />
      </div>
    );
  }

    return (
        <main className="min-h-screen pb-32 bg-background relative overflow-x-hidden">
          <div className="mesh-bg">
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-royal-gold/20 rounded-full blur-[120px] animate-blob" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-dark-goldenrod/10 rounded-full blur-[120px] animate-blob [animation-delay:2s]" />
          </div>

          <HeroSection 
            title="Agent Profile" 
            subtitle="Customize your identity and review your battlefield achievements."
            className="bg-transparent relative z-10"
          />

          <div className="px-6 -mt-16 relative z-10 space-y-8 max-w-2xl mx-auto">
            {/* Profile Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/60 backdrop-blur-xl border border-primary/10 rounded-[3rem] p-10 md:p-14 shadow-2xl relative overflow-hidden flex flex-col items-center text-center"
            >
              {/* Radial Glows */}
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-mustard blur-[120px] rounded-full" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] bg-dark-goldenrod blur-[120px] rounded-full" />
              </div>

              <div className="relative mb-8 group">
                <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full scale-110 group-hover:scale-125 transition-transform" />
                <Avatar className="w-40 h-40 border-4 border-primary shadow-2xl relative z-10">
                  <AvatarImage src={profile?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop"} className="object-cover" />
                  <AvatarFallback className="bg-white text-primary text-4xl font-heading uppercase">
                    {profile?.full_name?.substring(0, 2) || "SK"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 bg-primary text-white p-3 rounded-2xl shadow-2xl z-20 group-hover:scale-110 transition-transform">
                  <Trophy size={24} />
                </div>
              </div>
              
              <div className="space-y-4 relative z-10">
                <h2 className="text-4xl md:text-5xl font-heading text-primary tracking-tight">{profile?.full_name || "Arena Champion"}</h2>
                <div className="flex items-center justify-center gap-3">
                  <Badge className="bg-primary/10 text-primary/60 border-none rounded-full px-5 py-2 text-[10px] font-bold uppercase tracking-[0.2em]">
                    {profile?.role || "Elite Player"}
                  </Badge>
                  <div className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full shadow-xl">
                    <CheckCircle2 size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Verified</span>
                  </div>
                </div>
              </div>
            </motion.div>
  
              {/* Action Controls */}
              <div className="grid grid-cols-2 gap-5">
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="h-20 flex items-center justify-center gap-3 bg-white/60 backdrop-blur-xl border border-primary/10 rounded-full font-serif text-lg text-primary shadow-xl hover:bg-white/80 transition-all active:scale-95"
                >
                  {isEditing ? <X size={20} /> : <Settings size={20} />}
                  {isEditing ? "Cancel" : "Preferences"}
                </button>
                <button 
                  onClick={handleLogout}
                  className="h-20 flex items-center justify-center gap-3 bg-primary text-white rounded-full font-serif text-lg shadow-2xl hover:bg-golden-earth transition-all active:scale-95"
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
                    className="bg-white/60 backdrop-blur-xl rounded-[3rem] p-12 shadow-2xl space-y-10 relative overflow-hidden border border-primary/10"
                  >
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-mustard blur-[100px] rounded-full" />
                    </div>
  
                    <div className="relative z-10">
                      <h3 className="text-2xl font-heading text-primary mb-8 tracking-tight">Update <span className="italic font-serif opacity-60">Identity</span></h3>
                      <div className="space-y-8">
                        <div className="space-y-3">
                          <label className="text-[10px] font-bold text-primary/30 uppercase tracking-[0.3em] ml-6">Full Name</label>
                          <Input 
                            value={formData.full_name} 
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} 
                            className="h-16 px-8 rounded-[2rem] border-primary/5 bg-white/50 text-primary font-serif placeholder:text-primary/10 focus:ring-primary/20 transition-all"
                            placeholder="E.g. John Doe"
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-bold text-primary/30 uppercase tracking-[0.3em] ml-6">Phone Number</label>
                          <Input 
                            value={formData.phone} 
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                            className="h-16 px-8 rounded-[2rem] border-primary/5 bg-white/50 text-primary font-serif placeholder:text-primary/10 focus:ring-primary/20 transition-all"
                            placeholder="+91 XXXXX XXXXX"
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-bold text-primary/30 uppercase tracking-[0.3em] ml-6">Avatar Image URL</label>
                          <Input 
                            value={formData.avatar_url} 
                            onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })} 
                            className="h-16 px-8 rounded-[2rem] border-primary/5 bg-white/50 text-primary font-serif placeholder:text-primary/10 focus:ring-primary/20 transition-all"
                            placeholder="https://images..."
                          />
                        </div>
                      </div>
                      <button 
                        type="submit" 
                        disabled={saving}
                        className="w-full h-20 bg-primary text-white rounded-full font-serif text-xl shadow-2xl hover:bg-golden-earth transition-all flex items-center justify-center gap-3 mt-12"
                      >
                        {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Save size={22} /> Update Agent</>}
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
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-5">
                      {[
                        { label: "Matches", value: profile?.matches_played || 12, icon: Swords },
                        { label: "Win Rate", value: `${profile?.win_rate || 24}%`, icon: TrendingUp },
                        { label: "Kills", value: "342", icon: Target },
                        { label: "Rewards", value: `₹${(wallet?.lifetime_earnings || 0).toLocaleString()}`, icon: DollarSign },
                      ].map((stat, i) => (
                        <div key={i} className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl flex flex-col gap-5 relative overflow-hidden group border border-primary/10">
                          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="w-14 h-14 bg-primary/5 text-primary rounded-2xl flex items-center justify-center border border-primary/5 shadow-xl group-hover:scale-110 transition-transform">
                            <stat.icon size={28} />
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] text-primary/30 font-bold uppercase tracking-[0.2em]">{stat.label}</p>
                            <p className="text-3xl font-heading text-primary">{stat.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
    
                    {/* Account List */}
                    <div className="bg-white/60 backdrop-blur-xl border border-primary/10 rounded-[3rem] p-6 shadow-2xl space-y-3">
                      {[
                        { label: "Email Address", value: user?.email, icon: Mail },
                        { label: "Mobile Contact", value: profile?.phone || "Not linked", icon: Phone },
                        { label: "Country / Region", value: profile?.country || "India", icon: Globe },
                        { label: "Agent Since", value: new Date(profile?.created_at).toLocaleDateString(), icon: Calendar },
                      ].map((item, i) => (
                        <div key={i} className="group flex justify-between items-center p-6 hover:bg-white/40 rounded-[2.5rem] transition-all">
                          <div className="flex items-center gap-6">
                            <div className="w-14 h-14 bg-primary/5 text-primary rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform border border-primary/10">
                              <item.icon size={24} />
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-[10px] text-foreground/30 font-bold uppercase tracking-[0.2em]">{item.label}</p>
                              <p className="text-lg font-serif text-foreground font-bold tracking-tight">{item.value}</p>
                            </div>
                          </div>
                          <ChevronRight size={20} className="text-foreground/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
  
            {/* Danger Zone */}
            <div className="bg-destructive/10 border border-destructive/20 rounded-[3rem] p-12 text-center space-y-6 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-destructive/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-3xl flex items-center justify-center mx-auto shadow-2xl border border-destructive/20 group-hover:scale-110 transition-transform">
                <Trash2 size={36} />
              </div>
              <div className="space-y-2">
                <h4 className="text-2xl font-heading text-destructive">Retire Account</h4>
                <p className="text-sm text-destructive/60 font-serif max-w-xs mx-auto leading-relaxed italic">
                  Permanent deletion will remove all records. This action cannot be undone.
                </p>
              </div>
              <button className="px-10 py-4 bg-destructive text-white rounded-full text-xs font-bold uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all">
                Initiate Deletion
              </button>
            </div>
          </div>



      <BottomNav />
    </main>
  );
}
