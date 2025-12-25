"use client";

import { motion } from "framer-motion";
import { BottomNav } from "@/components/layout/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { IndianRupee, Trophy, Swords, ChevronRight, Calendar, ArrowRight, Star } from "lucide-react";

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();
          setProfile(profileData);
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user]);

  return (
    <main className="min-h-screen w-full bg-zinc-100 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle Background Detail */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-zinc-200/50 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-zinc-200/50 blur-[120px] rounded-full" />

      {/* Hero Card */}
      <div className="relative max-w-xl w-full bg-white/30 backdrop-blur-xl border border-zinc-200/0 shadow-2xl rounded-[3rem] px-8 py-12 md:px-12 md:py-16 animate-fadeIn">
        <div className="flex flex-col items-center text-center space-y-8">
          {/* Tagline */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/5 border border-black/5"
          >
            <Star size={12} className="text-black" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/60">
              Welcome to Smartking's Arena
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="space-y-4"
          >
            <h1 className="text-5xl md:text-6xl font-heading text-black leading-tight tracking-tight">
              Dominance <br /> 
              <span className="italic">is a Choice.</span>
            </h1>
            <p className="text-xl md:text-2xl font-serif text-zinc-800 leading-relaxed max-w-md mx-auto">
              Enter the most elite tournament platform and turn your skills into rewards.
            </p>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col w-full gap-4 pt-4"
          >
            <Link 
              href={user ? "/matches" : "/signup"}
              className="group relative w-full bg-black text-white py-5 px-8 rounded-full font-serif text-lg flex items-center justify-center gap-3 transition-all hover:bg-zinc-800 hover:scale-[1.02] active:scale-95 shadow-xl"
            >
              {user ? "Enter the Arena" : "Begin Your Journey"}
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link 
              href="/matches"
              className="text-sm font-serif text-black/60 hover:text-black transition-colors underline underline-offset-4 decoration-black/20 hover:decoration-black"
            >
              Explore Live Tournaments
            </Link>
          </motion.div>

          {/* Stats Summary (Glassy Details) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="grid grid-cols-3 gap-8 pt-8 border-t border-black/5 w-full"
          >
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-black/40 mb-1">Active</p>
              <p className="text-xl font-heading text-black">12k+</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-black/40 mb-1">Matches</p>
              <p className="text-xl font-heading text-black">840</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-black/40 mb-1">Rewards</p>
              <p className="text-xl font-heading text-black">₹5M+</p>
            </div>
          </motion.div>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
