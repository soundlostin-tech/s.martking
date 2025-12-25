"use client";

import { HeroSection } from "@/components/layout/HeroSection";
import { BottomNav } from "@/components/layout/BottomNav";
import { PillButton } from "@/components/ui/PillButton";
import { ArrowUpRight, ArrowDownLeft, History, Plus, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function Wallet() {
  const { user, loading: authLoading } = useAuth();
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchWalletData();
    }
  }, [user]);

  const fetchWalletData = async () => {
    try {
      // Fetch wallet
      const { data: walletData } = await supabase
        .from("wallets")
        .select("*")
        .eq("id", user!.id)
        .single();
      setWallet(walletData);

      // Fetch transactions
      const { data: txData } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(10);
      setTransactions(txData || []);
    } catch (error) {
      console.error("Error fetching wallet data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFunds = async () => {
    setProcessing(true);
    try {
      const amount = 500; // Hardcoded for demo
      
      // Create transaction
      const { error: txError } = await supabase.from("transactions").insert({
        user_id: user!.id,
        amount,
        type: "deposit",
        status: "completed",
        description: "Test Deposit",
      });

      if (txError) throw txError;

      // Update wallet balance
      const { error: walletError } = await supabase.rpc('increment_wallet_balance', {
        user_id: user!.id,
        amount_to_add: amount
      });

      // If RPC fails (maybe not created yet), use standard update
      if (walletError) {
         const { error: updateError } = await supabase
          .from("wallets")
          .update({ balance: (wallet?.balance || 0) + amount, updated_at: new Date().toISOString() })
          .eq("id", user!.id);
        
        if (updateError) throw updateError;
      }

      toast.success(`₹${amount} added to your wallet!`);
      fetchWalletData();
    } catch (error: any) {
      toast.error(error.message || "Failed to add funds");
    } finally {
      setProcessing(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <Loader2 className="w-8 h-8 animate-spin text-lemon-lime" />
      </div>
    );
  }

  const totalEarned = transactions
    .filter(tx => tx.type === "winning")
    .reduce((acc, tx) => acc + Number(tx.amount), 0);

  return (
    <main className="min-h-screen pb-24 bg-stone-100">
      <HeroSection 
        title="Wallet" 
        subtitle="Track your prize money and payouts."
        className="mx-0 rounded-none pb-32"
      />

      <div className="px-6 -mt-24 relative z-10">
        <div className="bg-onyx rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden border border-white/10">
          <div className="relative z-10">
            <p className="text-sm font-medium opacity-60 uppercase tracking-widest mb-2">Current Balance</p>
            <h2 className="text-5xl font-heading mb-8">₹{(wallet?.balance || 0).toLocaleString()}</h2>
            
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10">
              <div>
                <p className="text-[10px] opacity-40 uppercase mb-1">Pending</p>
                <p className="font-heading text-lg">₹0</p>
              </div>
              <div>
                <p className="text-[10px] opacity-40 uppercase mb-1">In Play</p>
                <p className="font-heading text-lg text-lime-yellow">₹0</p>
              </div>
              <div>
                <p className="text-[10px] opacity-40 uppercase mb-1">Total Earned</p>
                <p className="font-heading text-lg">₹{totalEarned.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-48 h-48 bg-olive-leaf/30 blur-[60px] rounded-full" />
        </div>

        <div className="flex justify-between gap-4 mt-8">
          <PillButton 
            variant="outline" 
            className="flex-1 flex items-center justify-center gap-2"
            onClick={handleAddFunds}
            disabled={processing}
          >
            {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus size={18} />} Add Funds
          </PillButton>
          <PillButton className="flex-1 flex items-center justify-center gap-2">
            <ArrowDownLeft size={18} /> Withdraw
          </PillButton>
        </div>

        <div className="mt-10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-heading">Transactions</h3>
            <button className="text-stone-500 flex items-center gap-1 text-sm font-medium">
              <History size={16} /> History
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {transactions.length > 0 ? (
              transactions.map((tx, i) => (
                <div key={tx.id} className="bg-white rounded-2xl p-4 flex justify-between items-center border border-stone-200">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-full ${(tx.type === "winning" || tx.type === "deposit") ? "bg-lime-yellow/10 text-olive" : "bg-stone-100 text-stone-500"}`}>
                      {(tx.type === "winning" || tx.type === "deposit") ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm capitalize">{tx.description || tx.type.replace('_', ' ')}</h4>
                      <p className="text-[10px] text-stone-500">{new Date(tx.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-sm ${(tx.type === "winning" || tx.type === "deposit") ? "text-olive" : "text-onyx"}`}>
                      {(tx.type === "winning" || tx.type === "deposit") ? "+" : "-"}₹{Number(tx.amount).toLocaleString()}
                    </p>
                    <p className={`text-[9px] font-bold uppercase ${tx.status === "pending" ? "text-amber-500" : "text-stone-400"}`}>{tx.status}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-stone-500 py-8">No transactions yet</p>
            )}
          </div>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
