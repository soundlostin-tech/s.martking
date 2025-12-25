"use client";

import { motion } from "framer-motion";
import { Wallet, Bell, User, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export function TopHeader() {
  const { user } = useAuth(false);
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      const fetchBalance = async () => {
        const { data } = await supabase
          .from("wallets")
          .select("balance")
          .eq("id", user.id)
          .single();
        if (data) setBalance(data.balance);
      };
      fetchBalance();

      const channel = supabase
        .channel('wallet_balance_header')
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'wallets',
          filter: `id=eq.${user.id}`
        }, (payload) => {
          setBalance(payload.new.balance);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  return (
    <header className="sticky top-0 z-50 w-full bg-zinc-100/80 backdrop-blur-md border-b border-black/5 px-6 py-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col"
        >
          <Link href="/" className="group">
            <h1 className="text-2xl font-heading text-black leading-tight group-hover:tracking-wider transition-all">SMARTKING's</h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Arena</p>
          </Link>
        </motion.div>

        <div className="flex items-center gap-3">
          {user && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="hidden sm:flex items-center gap-3 bg-white/50 border border-black/5 rounded-full px-4 py-1.5 shadow-sm"
            >
              <Link href="/wallet" className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center text-white shadow-lg">
                  <Wallet size={12} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] font-bold text-zinc-400 uppercase leading-none">Vault</span>
                  <span className="text-xs font-heading text-black leading-none mt-0.5">₹{balance?.toLocaleString() ?? '0'}</span>
                </div>
              </Link>
            </motion.div>
          )}

          <div className="flex items-center gap-2">
            <Link href="/wallet" className="sm:hidden w-10 h-10 rounded-full bg-white/50 border border-black/5 flex items-center justify-center shadow-sm">
              <Wallet size={18} className="text-black" />
            </Link>
            
            <button className="w-10 h-10 rounded-full bg-white/50 border border-black/5 flex items-center justify-center shadow-sm relative">
              <Bell size={18} className="text-black" />
              <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-zinc-100" />
            </button>

            <Link href="/profile">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-full bg-black border border-black/5 flex items-center justify-center shadow-lg overflow-hidden"
              >
                {user?.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User size={20} className="text-white" />
                )}
              </motion.div>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
