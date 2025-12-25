"use client";

import { HeroSection } from "@/components/layout/HeroSection";
import { BottomNav } from "@/components/layout/BottomNav";
import { AnalyticsCard } from "@/components/ui/AnalyticsCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, Bell, ChevronRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [stats, setStats] = useState({
    activeTournaments: 0,
    upcomingMatches: 0,
    totalWinnings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          // Fetch profile
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();
          setProfile(profileData);

          // Fetch wallet
          const { data: walletData } = await supabase
            .from("wallets")
            .select("*")
            .eq("id", user.id)
            .single();
          setWallet(walletData);

          // Fetch stats
          const { count: activeTournaments } = await supabase
            .from("tournaments")
            .select("*", { count: 'exact', head: true })
            .eq("status", "active");

          const { count: upcomingMatches } = await supabase
            .from("matches")
            .select("*", { count: 'exact', head: true })
            .eq("status", "upcoming");

          // Fetch winnings from transactions
          const { data: winningsData } = await supabase
            .from("transactions")
            .select("amount")
            .eq("user_id", user.id)
            .eq("type", "winning");
          
          const totalWinnings = winningsData?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

          setStats({
            activeTournaments: activeTournaments || 0,
            upcomingMatches: upcomingMatches || 0,
            totalWinnings,
          });
        } catch (error) {
          console.error("Error fetching dashboard data:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <Loader2 className="w-8 h-8 animate-spin text-lemon-lime" />
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-24">
      {/* Header */}
      <div className="bg-stone-100 px-6 pt-12 pb-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 border-2 border-lime-yellow shadow-[0_0_10px_rgba(214,253,2,0.5)]">
            <AvatarImage src={profile?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"} />
            <AvatarFallback>{profile?.full_name?.substring(0, 2).toUpperCase() || "SK"}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-heading leading-tight">Hi, {profile?.full_name?.split(' ')[0] || 'Smartking'}</h3>
            <p className="text-xs text-stone-500">Welcome to your arena</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-2 rounded-full bg-onyx text-white">
            <Bell size={20} />
          </button>
          <button 
            className="p-2 rounded-full bg-onyx text-white"
            onClick={() => supabase.auth.signOut()}
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      <HeroSection 
        title="Arena Dashboard" 
        subtitle="Here's what's happening in your arena."
        className="mx-0 rounded-none"
      >
        <AnalyticsCard
          title="Gross Winnings"
          value={`₹${stats.totalWinnings.toLocaleString()}`}
          trend="+0%"
          variant="highlight"
          className="mt-4"
        />
      </HeroSection>

      <div className="px-6 -mt-6 relative z-20 flex flex-col gap-4">
        <AnalyticsCard
          variant="dark"
          title="Wallet Balance"
          value={`₹${(wallet?.balance || 0).toLocaleString()}`}
          subtext="Available for entry fees and withdrawal"
          className="shadow-2xl"
        />

        <div className="grid grid-cols-2 gap-4">
          <AnalyticsCard
            variant="light"
            title="Active Tournaments"
            value={stats.activeTournaments.toString()}
            subtext="Ending soon"
            showIcon={false}
          />
          <AnalyticsCard
            variant="light"
            title="Upcoming Matches"
            value={stats.upcomingMatches.toString()}
            subtext="In next 24 hours"
            showIcon={false}
          />
        </div>

        <div className="bg-onyx rounded-[24px] p-6 text-white shadow-lg overflow-hidden relative">
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm font-medium opacity-60 uppercase tracking-widest">Monthly Target</p>
              <span className="text-lime-yellow font-bold">0%</span>
            </div>
            <div className="h-3 w-full bg-white/10 rounded-full mb-4">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "0%" }}
                className="h-full bg-lime-yellow rounded-full"
              />
            </div>
            <p className="text-lg font-heading">₹0.00 <span className="text-xs opacity-50 font-sans ml-2">to reach target</span></p>
          </div>
          {/* Decorative blurred blob */}
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-lemon-lime/20 blur-3xl rounded-full" />
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
