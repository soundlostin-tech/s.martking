"use client";

import { HeroSection } from "@/components/layout/HeroSection";
import { BottomNav } from "@/components/layout/BottomNav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, User, Shield, Bell, LogOut, Trophy, Target, DollarSign, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    winnings: 0,
    tournamentsJoined: 0,
  });
  const [loading, setLoading] = useState(true);

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
      setProfile(profileData);

      const { data: winningsData } = await supabase
        .from("transactions")
        .select("amount")
        .eq("user_id", user!.id)
        .eq("type", "winning");
      
      const { count } = await supabase
        .from("participants")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", user!.id);

      setStats({
        winnings: winningsData?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0,
        tournamentsJoined: count || 0,
      });
    } catch (error) {
      console.error("Error fetching profile data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <Loader2 className="w-8 h-8 animate-spin text-lemon-lime" />
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-24 bg-stone-100">
      <HeroSection 
        title="" 
        subtitle=""
        className="mx-0 rounded-none pb-24"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Avatar className="w-28 h-28 border-4 border-lime-yellow shadow-[0_0_20px_rgba(214,253,2,0.6)]">
              <AvatarImage src={profile?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop"} />
              <AvatarFallback>{profile?.full_name?.substring(0, 2).toUpperCase() || "SK"}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 -right-2 bg-lime-yellow text-onyx p-1.5 rounded-full border-2 border-onyx shadow-lg">
              <Trophy size={16} />
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-3xl font-heading text-white mb-1">{profile?.full_name || "Smartking Elite"}</h2>
            <Badge className="bg-olive text-onyx border-none rounded-full px-4 py-1 text-xs font-bold uppercase tracking-widest">
              {stats.tournamentsJoined > 5 ? "Pro Player" : "Rookie"}
            </Badge>
          </div>
        </div>
      </HeroSection>

      <div className="px-6 -mt-10 relative z-10 flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-[24px] border border-stone-200 shadow-sm">
            <div className="p-2 bg-stone-100 rounded-lg w-fit mb-3 text-olive">
              <Target size={20} />
            </div>
            <p className="text-xs text-stone-500 uppercase font-medium">Joined</p>
            <h4 className="text-2xl font-heading">{stats.tournamentsJoined}</h4>
          </div>
          <div className="bg-white p-5 rounded-[24px] border border-stone-200 shadow-sm">
            <div className="p-2 bg-stone-100 rounded-lg w-fit mb-3 text-olive">
              <DollarSign size={20} />
            </div>
            <p className="text-xs text-stone-500 uppercase font-medium">Earnings</p>
            <h4 className="text-2xl font-heading">₹{stats.winnings.toLocaleString()}</h4>
          </div>
        </div>

        <div className="bg-alabaster-grey-2 rounded-[24px] border border-stone-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-stone-300">
            <h3 className="font-heading text-xl">Personal Info</h3>
          </div>
          <div className="p-2">
            {[
              { label: "Full Name", value: profile?.full_name, icon: User },
              { label: "Email", value: user?.email, icon: Bell },
              { label: "Phone", value: profile?.phone, icon: Shield },
            ].map((item, i) => (
              <div key={i} className="w-full flex justify-between items-center p-4 rounded-2xl">
                <div className="flex items-center gap-4 text-left">
                  <div className="text-stone-400">
                    <item.icon size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-stone-500 uppercase font-bold">{item.label}</p>
                    <p className="text-sm font-medium">{item.value || "Not set"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-alabaster-grey-2 rounded-[24px] border border-stone-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-stone-300">
            <h3 className="font-heading text-xl">Account Settings</h3>
          </div>
          <div className="p-2">
            <button 
              onClick={handleLogout}
              className="w-full flex justify-between items-center p-4 hover:bg-red-50 rounded-2xl transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="text-red-500">
                  <LogOut size={20} />
                </div>
                <span className="text-sm font-medium text-red-500">Logout</span>
              </div>
              <ChevronRight size={18} className="text-stone-300" />
            </button>
          </div>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
