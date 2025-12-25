"use client";

import { motion } from "framer-motion";
import { Wallet } from "lucide-react";
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
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Said Hamare Zamane Mein.....</p>
          </Link>
        </motion.div>

          <div className="flex items-center gap-3">
            {user && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center bg-white/40 backdrop-blur-xl border border-black/[0.03] rounded-2xl px-3 py-2 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] transition-all cursor-pointer group"
              >
                <Link href="/wallet" className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-zinc-800 to-black flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform">
                    <Wallet size={14} />
                  </div>
                  <div className="flex flex-col pr-1">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter leading-none">Vault Balance</span>
                    <span className="text-sm font-heading text-black leading-none mt-1">₹{balance?.toLocaleString() ?? '0'}</span>
                  </div>
                </Link>
              </motion.div>
            )}
          </div>
      </div>
    </header>
  );
}
