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
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-evergreen/5 px-6 py-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col"
        >
            <Link href="/" className="group flex flex-col items-center">
              <span className="bg-primary px-3 py-1 rounded-lg">
                <h1 className="text-2xl font-heading text-primary-foreground leading-tight group-hover:tracking-wider transition-all uppercase">Smartking</h1>
              </span>
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground mt-1">Battle Arena Premium</p>
            </Link>
        </motion.div>
  
            <div className="flex items-center gap-3">
              {user && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center bg-evergreen rounded-[1.25rem] px-4 py-2 shadow-xl shadow-evergreen/10 hover:shadow-evergreen/20 transition-all cursor-pointer group"
                >
                  <Link href="/wallet" className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-frosted-mint flex items-center justify-center text-evergreen shadow-lg group-hover:scale-110 transition-transform">
                      <Wallet size={14} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] font-bold text-frosted-mint/40 uppercase tracking-widest leading-none">Balance</span>
                      <span className="text-sm font-heading text-frosted-mint leading-none mt-1">₹{balance?.toLocaleString() ?? '0'}</span>
                    </div>
                  </Link>
                </motion.div>
              )}
            </div>
  
      </div>
    </header>
  );
}
