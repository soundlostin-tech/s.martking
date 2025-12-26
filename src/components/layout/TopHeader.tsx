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
      <header className="sticky top-0 z-50 w-full bg-white/60 backdrop-blur-2xl border-b border-primary/10 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
              <Link href="/" className="group flex items-center gap-2">
                <div className="bg-jungle-teal p-1.5 rounded-lg flex items-center justify-center">
                  <div className="w-5 h-5 bg-lemon-lime shape-triangle rotate-90" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-xl font-heading text-jungle-teal leading-none tracking-tight">Smartking<span className="text-lemon-lime-2">Arena</span></h1>
                  <p className="text-[7px] font-bold uppercase tracking-[0.4em] text-sea-green mt-0.5">Premium Esports</p>
                </div>
              </Link>
          </motion.div>
    
          <div className="flex items-center gap-4">
            {user && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link href="/wallet" className="flex items-center gap-3 bg-white/80 rounded-2xl px-4 py-1.5 border border-primary/10 shadow-lg shadow-primary/5 hover:bg-white transition-colors">
                  <div className="w-7 h-7 rounded-full bg-jungle-teal flex items-center justify-center text-white shadow-inner">
                    <Wallet size={12} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[7px] font-bold text-sea-green uppercase tracking-widest leading-none">Wallet</span>
                    <span className="text-sm font-heading text-jungle-teal mt-0.5">₹{balance?.toLocaleString() ?? '0'}</span>
                  </div>
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </header>
    );
}
