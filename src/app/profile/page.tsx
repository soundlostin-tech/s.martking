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
  TrendingUp
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
import { Button } from "@/components/ui/button";

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

  const handleDeleteAccount = async () => {
    toast.error("Account deletion is restricted for demo purposes. Please contact support.");
    setIsDeleteDialogOpen(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <Loader2 className="w-8 h-8 animate-spin text-lemon-lime" />
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-32 bg-stone-50">
      {/* Header / Hero Section */}
      <HeroSection 
        title="" 
        subtitle=""
        className="mx-0 rounded-none pb-24 pt-16 relative overflow-hidden"
      >
        <div className="flex flex-col items-center gap-6 relative z-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative"
          >
            <Avatar className="w-32 h-32 border-4 border-lime-yellow shadow-[0_0_30px_rgba(214,253,2,0.4)] ring-8 ring-onyx/20">
              <AvatarImage src={profile?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop"} />
              <AvatarFallback className="bg-onyx text-white text-3xl font-heading">
                {profile?.full_name?.substring(0, 2).toUpperCase() || "SK"}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 -right-2 bg-lime-yellow text-onyx p-2 rounded-full border-4 border-onyx shadow-xl">
              <Trophy size={18} />
            </div>
          </motion.div>
          
          <div className="text-center space-y-2">
            <h2 className="text-4xl font-heading text-white tracking-tight">{profile?.full_name || "Arena Champion"}</h2>
            <div className="flex items-center justify-center gap-2">
              <Badge className="bg-lime-yellow text-onyx border-none rounded-full px-5 py-1.5 text-xs font-bold uppercase tracking-[0.2em]">
                {profile?.role || "Player"}
              </Badge>
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                <CheckCircle2 size={12} className="text-green-400" />
                <span className="text-[10px] text-white/80 font-bold uppercase tracking-wider">Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-lime-yellow/20 rounded-full blur-[120px]" />
        </div>
      </HeroSection>

      <div className="px-6 -mt-12 relative z-20 space-y-8">
        {/* Gameplay Stats Section */}
        <section className="grid grid-cols-2 gap-4">
          {[
            { label: "Tournaments", value: profile?.matches_played || 0, icon: Swords, color: "text-blue-500", bg: "bg-blue-50" },
            { label: "Win Rate", value: `${profile?.win_rate || 0}%`, icon: TrendingUp, color: "text-green-500", bg: "bg-green-50" },
            { label: "Matches", value: (profile?.matches_played || 0) * 4, icon: Target, color: "text-purple-500", bg: "bg-purple-50" },
            { label: "Earnings", value: `₹${(wallet?.lifetime_earnings || 0).toLocaleString()}`, icon: DollarSign, color: "text-amber-500", bg: "bg-amber-50" },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-5 rounded-[32px] border border-stone-200 shadow-sm flex flex-col gap-3 group hover:border-lime-yellow transition-all"
            >
              <div className={`p-2.5 ${stat.bg} ${stat.color} rounded-2xl w-fit group-hover:scale-110 transition-transform`}>
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-[10px] text-stone-400 uppercase font-bold tracking-widest">{stat.label}</p>
                <h4 className="text-2xl font-heading text-onyx">{stat.value}</h4>
              </div>
            </motion.div>
          ))}
        </section>

        {/* Profile Details Section */}
        <section className="bg-white rounded-[40px] border border-stone-200 overflow-hidden shadow-sm">
          <div className="p-8 border-b border-stone-100 flex justify-between items-center">
            <div>
              <h3 className="font-heading text-2xl text-onyx">Profile Details</h3>
              <p className="text-xs text-stone-400 font-medium">Manage your public information</p>
            </div>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="w-12 h-12 flex items-center justify-center bg-stone-50 rounded-2xl text-stone-600 hover:bg-onyx hover:text-white transition-all shadow-sm"
            >
              {isEditing ? <X size={20} /> : <Edit2 size={20} />}
            </button>
          </div>
          
          <div className="p-8">
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.form 
                  key="edit"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleUpdateProfile} 
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] text-stone-500 uppercase font-bold tracking-wider ml-1">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                        <Input 
                          value={formData.full_name} 
                          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} 
                          className="rounded-[20px] bg-stone-50 border-stone-200 h-14 pl-12 focus-visible:ring-lime-yellow"
                          placeholder="Your full name"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] text-stone-500 uppercase font-bold tracking-wider ml-1">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                        <Input 
                          value={formData.phone} 
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                          className="rounded-[20px] bg-stone-50 border-stone-200 h-14 pl-12 focus-visible:ring-lime-yellow"
                          placeholder="+91 XXXXX XXXXX"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] text-stone-500 uppercase font-bold tracking-wider ml-1">Country / Region</label>
                      <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                        <Input 
                          value={formData.country} 
                          onChange={(e) => setFormData({ ...formData, country: e.target.value })} 
                          className="rounded-[20px] bg-stone-50 border-stone-200 h-14 pl-12 focus-visible:ring-lime-yellow"
                          placeholder="Select country"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] text-stone-500 uppercase font-bold tracking-wider ml-1">Avatar URL</label>
                      <div className="relative">
                        <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                        <Input 
                          value={formData.avatar_url} 
                          onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })} 
                          className="rounded-[20px] bg-stone-50 border-stone-200 h-14 pl-12 focus-visible:ring-lime-yellow"
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    disabled={saving}
                    className="w-full h-14 bg-onyx hover:bg-lime-yellow hover:text-onyx text-white rounded-[24px] font-bold text-base transition-all shadow-xl shadow-onyx/20 flex gap-3"
                  >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save size={20} /> Update Profile</>}
                  </Button>
                </motion.form>
              ) : (
                <motion.div 
                  key="view"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-2"
                >
                  {[
                    { label: "Full Name", value: profile?.full_name, icon: User },
                    { label: "Email Address", value: user?.email, icon: Mail, sub: "Verified Primary Email" },
                    { label: "Phone Number", value: profile?.phone, icon: Phone },
                    { label: "Country", value: profile?.country, icon: Globe },
                  ].map((item, i) => (
                    <div key={i} className="group flex justify-between items-center py-4 px-4 hover:bg-stone-50 rounded-2xl transition-colors">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-500 group-hover:bg-onyx group-hover:text-white transition-all">
                          <item.icon size={22} />
                        </div>
                        <div>
                          <p className="text-[10px] text-stone-400 uppercase font-bold tracking-widest">{item.label}</p>
                          <p className="text-base font-bold text-onyx leading-tight">{item.value || "Not configured"}</p>
                          {item.sub && <p className="text-[10px] text-green-500 font-bold uppercase mt-1 flex items-center gap-1"><CheckCircle2 size={10} /> {item.sub}</p>}
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-stone-300 group-hover:text-onyx transition-colors" />
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Account Actions Section */}
        <section className="space-y-4">
          <h3 className="font-heading text-xl text-onyx ml-2">Account & Security</h3>
          <div className="bg-white rounded-[40px] border border-stone-200 overflow-hidden shadow-sm p-4 space-y-2">
            {[
              { label: "Change Password", icon: Lock, color: "text-amber-500", bg: "bg-amber-50" },
              { label: "Notification Preferences", icon: Bell, color: "text-blue-500", bg: "bg-blue-50" },
              { label: "Two-Factor Authentication", icon: Shield, color: "text-green-500", bg: "bg-green-50", badge: "On" },
            ].map((action, i) => (
              <button 
                key={i}
                className="w-full flex justify-between items-center p-4 hover:bg-stone-50 rounded-3xl transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl ${action.bg} ${action.color} flex items-center justify-center`}>
                    <action.icon size={22} />
                  </div>
                  <div className="text-left">
                    <span className="text-base font-bold text-onyx">{action.label}</span>
                    {action.badge && (
                      <span className="ml-3 px-2 py-0.5 bg-green-500 text-white text-[9px] font-bold rounded-full uppercase">
                        {action.badge}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight size={20} className="text-stone-300 group-hover:text-onyx transition-colors" />
              </button>
            ))}
            
            <div className="h-[1px] bg-stone-100 mx-4 my-2" />

            <button 
              onClick={handleLogout}
              className="w-full flex justify-between items-center p-4 hover:bg-red-50 rounded-3xl transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-500 flex items-center justify-center">
                  <LogOut size={22} />
                </div>
                <span className="text-base font-bold text-red-600">Logout</span>
              </div>
              <ChevronRight size={20} className="text-red-200 group-hover:text-red-600 transition-colors" />
            </button>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-red-50/50 rounded-[40px] border border-red-100 p-8 flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-red-100 text-red-600 flex items-center justify-center">
            <Trash2 size={28} />
          </div>
          <div>
            <h4 className="font-heading text-xl text-red-600">Delete Account</h4>
            <p className="text-sm text-red-500/80 max-w-[280px]">
              This action is permanent and will result in the loss of all earnings and match history.
            </p>
          </div>
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" className="text-red-600 font-bold hover:bg-red-100 rounded-2xl px-8 h-12">
                Begin Deletion Process
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[32px] border-none bg-white p-8">
              <DialogHeader>
                <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
                  <AlertCircle size={32} />
                </div>
                <DialogTitle className="text-2xl font-heading text-onyx">Are you absolutely sure?</DialogTitle>
                <DialogDescription className="text-stone-500 text-sm">
                  This action cannot be undone. All your data, tournament history, and wallet balance (₹{wallet?.balance || 0}) will be permanently deleted.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex-col gap-3 mt-6">
                <Button 
                  onClick={handleDeleteAccount}
                  className="w-full h-14 bg-red-600 hover:bg-red-700 text-white rounded-[20px] font-bold"
                >
                  Confirm Permanent Deletion
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setIsDeleteDialogOpen(false)}
                  className="w-full h-14 rounded-[20px] font-bold text-stone-500"
                >
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </section>
      </div>

      <BottomNav />
    </main>
  );
}
