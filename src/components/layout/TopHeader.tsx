"use client";

import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { Search, Bell, Crown, Wallet, User as UserIcon, Plus } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { useHaptics } from "@/hooks/useHaptics";
import Link from "next/link";

export function TopHeader() {
  const { user, profile } = useAuth(false);
  const { triggerHaptic } = useHaptics();
  const { scrollY } = useScroll();
  const [wallet, setWallet] = useState<any>(null);

  const fetchWallet = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", user.id)
      .maybeSingle();
    setWallet(data);
  }, [user]);

  useEffect(() => {
    fetchWallet();
    const channel = supabase
      .channel('wallet_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'wallets',
        filter: `user_id=eq.${user?.id}`
      }, () => fetchWallet())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchWallet, user?.id]);

  const smoothY = useSpring(scrollY, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const headerHeight = useTransform(smoothY, [0, 80], ["96px", "72px"]);
  const headerPadding = useTransform(smoothY, [0, 80], ["24px", "12px"]);
  const logoScale = useTransform(smoothY, [0, 80], [1, 0.85]);
  const blurAmount = useTransform(smoothY, [0, 80], ["0px", "24px"]);
  
  const bgColor = useTransform(
    smoothY,
    [0, 80],
    ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.7)"]
  );

  const backdropFilter = useTransform(
    blurAmount,
    (blur) => `blur(${blur}) saturate(180%)`
  );

  return (
    <>
      <motion.header 
        style={{ 
          height: headerHeight,
          paddingTop: headerPadding,
          paddingBottom: headerPadding,
          backgroundColor: bgColor,
          backdropFilter: backdropFilter,
        }}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-[100] w-full flex items-center justify-between px-6 border-b border-black/[0.03] safe-top"
      >
        {/* Logo Section */}
        <Link href="/" onClick={() => triggerHaptic('light')}>
          <motion.div 
            style={{ scale: logoScale }}
            className="flex items-center gap-3"
          >
            <div className="relative w-12 h-12 rounded-[18px] bg-onyx flex items-center justify-center text-white shadow-2xl overflow-hidden group">
              <motion.div 
                className="absolute inset-0 bg-gradient-to-tr from-pastel-mint/20 via-white/10 to-pastel-lavender/20"
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
              <Crown size={22} className="relative z-10 text-soft-yellow" fill="currentColor" />
            </div>
            
            <div className="flex flex-col">
              <h1 className="text-lg font-black text-onyx tracking-tighter leading-none">
                SMARTKING<span className="text-onyx/30"> arena</span>
              </h1>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1 h-1 rounded-full bg-pastel-mint animate-pulse" />
                <p className="text-[7px] font-black text-onyx/40 uppercase tracking-[0.3em]">
                  Live competition
                </p>
              </div>
            </div>
          </motion.div>
        </Link>
        
        {/* Right Section: Wallet & Profile */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <Link href="/wallet" onClick={() => triggerHaptic('medium')}>
                <motion.div 
                  whileTap={{ scale: 0.95 }}
                  className="h-11 pl-4 pr-2 rounded-2xl bg-white shadow-soft border border-black/[0.03] flex items-center gap-3 group"
                >
                  <div className="flex flex-col items-end">
                    <p className="text-[8px] font-black text-onyx/30 uppercase tracking-widest leading-none mb-0.5">Balance</p>
                    <p className="text-sm font-black text-onyx leading-none">₹{wallet?.balance || 0}</p>
                  </div>
                  <div className="w-7 h-7 rounded-xl bg-soft-yellow flex items-center justify-center text-onyx shadow-sm group-hover:rotate-12 transition-transform">
                    <Plus size={14} strokeWidth={3} />
                  </div>
                </motion.div>
              </Link>

              <Link href="/profile" onClick={() => triggerHaptic('light')}>
                <motion.div 
                  whileTap={{ scale: 0.9 }}
                  className="w-11 h-11 rounded-2xl border-2 border-white shadow-soft overflow-hidden bg-off-white flex items-center justify-center"
                >
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon size={20} className="text-onyx/20" />
                  )}
                </motion.div>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/signin">
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-2.5 rounded-2xl bg-onyx text-white text-[10px] font-black uppercase tracking-widest shadow-xl"
                >
                  Sign In
                </motion.button>
              </Link>
            </div>
          )}

          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => triggerHaptic('light')}
            className="w-11 h-11 rounded-2xl bg-white shadow-soft border border-black/[0.03] flex items-center justify-center text-onyx/40 relative"
          >
            <Bell size={20} />
            <span className="absolute top-3 right-3 w-2 h-2 bg-pastel-coral rounded-full border-2 border-white" />
          </motion.button>
        </div>

        {/* Dynamic Scroll Progress */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-pastel-lavender via-pastel-mint to-soft-yellow origin-left"
          style={{ scaleX: useSpring(useTransform(scrollY, [0, 1000], [0, 1]), { stiffness: 100, damping: 30 }) }}
        />
      </motion.header>
      
      {/* Spacer to prevent content jump */}
      <div className="h-24" />
    </>
  );
}
