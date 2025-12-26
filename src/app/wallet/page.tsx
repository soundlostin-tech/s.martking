"use client";

import { BottomNav } from "@/components/layout/BottomNav";
import { TopHeader } from "@/components/layout/TopHeader";
import { PaperWrapper } from "@/components/layout/PaperWrapper";
import { 
  ArrowDownLeft, 
  Plus, 
  Loader2, 
  Activity, 
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function WalletPage() {
  const { user, loading: authLoading } = useAuth(true);
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const fetchWalletData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: walletData, error: walletError } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      if (walletError) throw walletError;
      setWallet(walletData);

      const { data: txData, error: txError } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (txError) throw txError;
      setTransactions(txData || []);
    } catch (error) {
      console.error("Error fetching wallet data:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  const handleDeposit = async () => {
    const amount = Number(depositAmount);
    if (!amount || amount < 10) {
      toast.error("Minimum deposit is ₹10");
      return;
    }

    setProcessing(true);
    try {
      const { error: txError } = await supabase.from("transactions").insert({
        user_id: user!.id,
        amount,
        type: "deposit",
        status: "completed",
        description: "Recharge",
      });

      if (txError) throw txError;

      const { error: walletError } = await supabase
        .from("wallets")
        .update({ 
          balance: Number(wallet?.balance || 0) + amount, 
          updated_at: new Date().toISOString() 
        })
        .eq("user_id", user!.id);
      
      if (walletError) throw walletError;

      toast.success(`₹${amount} added!`);
      setIsDepositOpen(false);
      setDepositAmount("");
      fetchWalletData();
    } catch (error: any) {
      toast.error("Deposit failed");
    } finally {
      setProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = Number(withdrawAmount);
    if (!amount || amount < 100) {
      toast.error(`Min withdrawal is ₹100`);
      return;
    }
    if (amount > (wallet?.balance || 0)) {
      toast.error("Insufficient balance");
      return;
    }

    setProcessing(true);
    try {
      const { error: txError } = await supabase.from("transactions").insert({
        user_id: user!.id,
        amount,
        type: "withdrawal",
        status: "pending",
        description: `Withdrawal Request`,
      });

      if (txError) throw txError;

      const { error: walletError } = await supabase
        .from("wallets")
        .update({ 
          balance: Number(wallet?.balance || 0) - amount,
          pending_withdrawals: Number(wallet?.pending_withdrawals || 0) + amount,
          updated_at: new Date().toISOString() 
        })
        .eq("user_id", user!.id);
      
      if (walletError) throw walletError;

      toast.success(`Withdrawal requested!`);
      setIsWithdrawOpen(false);
      setWithdrawAmount("");
      fetchWalletData();
    } catch (error: any) {
      toast.error("Withdrawal failed");
    } finally {
      setProcessing(false);
    }
  };

  if (authLoading) return null;

  return (
    <div className="w-full">
      <TopHeader />
      <PaperWrapper className="mt-20">
        <div className="space-y-10 pb-20">
          <div className="flex flex-col gap-2">
            <h2 className="text-5xl -rotate-2">Financial Sector</h2>
            <p className="text-xl opacity-50 uppercase tracking-widest">Managing Capital</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border-2 border-[#000033]/10 p-8 rounded-3xl rotate-2">
              <p className="text-xl opacity-40 uppercase tracking-widest mb-2">Balance</p>
              <div className="text-6xl text-[#000033]">₹{(wallet?.balance || 0).toLocaleString()}</div>
              
              <div className="mt-8 flex gap-4">
                <button onClick={() => setIsDepositOpen(true)} className="btn-hand-drawn bg-white">Add</button>
                <button onClick={() => setIsWithdrawOpen(true)} className="btn-hand-drawn opacity-60">Extract</button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="border-b-2 border-dashed border-[#000033]/10 py-4">
                <p className="text-lg opacity-40 uppercase tracking-widest">Lifetime Earnings</p>
                <p className="text-3xl">₹{(wallet?.lifetime_earnings || 0).toLocaleString()}</p>
              </div>
              <div className="py-4">
                <p className="text-lg opacity-40 uppercase tracking-widest">Pending</p>
                <p className="text-3xl opacity-40">₹{(wallet?.pending_withdrawals || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-3xl flex items-center gap-4">
              <Activity size={24} /> Logs
            </h3>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#000033]/20" />
              </div>
            ) : transactions.length > 0 ? (
              <div className="space-y-4">
                {transactions.map((tx, i) => (
                  <div key={tx.id} className="flex items-center justify-between border-b-2 border-[#000033]/5 pb-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 ${
                        ['deposit', 'prize'].includes(tx.type) ? 'border-[#000033] rotate-3' : 'border-[#000033]/10 -rotate-3'
                      }`}>
                         {tx.type === 'deposit' ? <Plus size={18} /> : <ArrowDownLeft size={18} />}
                      </div>
                      <div className="text-left">
                        <h4 className="text-xl font-bold">{tx.description || tx.type}</h4>
                        <p className="text-sm opacity-40">{new Date(tx.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className={`text-2xl ${['deposit', 'prize'].includes(tx.type) ? 'text-[#000033]' : 'opacity-40'}`}>
                      {['deposit', 'prize'].includes(tx.type) ? '+' : '-'}₹{tx.amount}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center opacity-30">
                <AlertCircle size={40} className="mx-auto mb-4" />
                <p className="text-2xl">No entries found</p>
              </div>
            )}
          </div>
        </div>

        <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
          <DialogContent className="font-handwritten text-xl p-10 bg-white border-2 border-[#000033]">
            <DialogHeader>
              <DialogTitle className="text-4xl">Add Funds</DialogTitle>
              <DialogDescription className="text-lg">Add deployment funds.</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 pt-6">
              <Input 
                type="number" 
                placeholder="Amount (min ₹10)" 
                className="h-14 font-handwritten text-2xl border-2 border-[#000033]/20 rounded-2xl"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
              />
              <button 
                onClick={handleDeposit}
                disabled={processing}
                className="btn-hand-drawn w-full py-4 bg-[#000033] text-white"
              >
                {processing ? "..." : "Inject Funds"}
              </button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
          <DialogContent className="font-handwritten text-xl p-10 bg-white border-2 border-[#000033]">
            <DialogHeader>
              <DialogTitle className="text-4xl">Extract Funds</DialogTitle>
              <DialogDescription className="text-lg">Withdraw winnings.</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 pt-6">
              <Input 
                type="number" 
                placeholder="Amount (min ₹100)" 
                className="h-14 font-handwritten text-2xl border-2 border-[#000033]/20 rounded-2xl"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
              <button 
                onClick={handleWithdraw}
                disabled={processing}
                className="btn-hand-drawn w-full py-4 bg-[#000033] text-white"
              >
                {processing ? "..." : "Withdraw"}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </PaperWrapper>
      <BottomNav />
    </div>
  );
}
