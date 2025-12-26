"use client";

import { BottomNav } from "@/components/layout/BottomNav";
import { TopHeader } from "@/components/layout/TopHeader";
import { 
  ArrowDownLeft, 
  Plus, 
  Loader2, 
  Wallet as WalletIcon, 
  TrendingUp,
  Activity,
  AlertCircle,
  Clock
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PaperWrapper } from "@/components/layout/PaperWrapper";

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
        description: "Arena Balance Recharge",
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

      toast.success(`₹${amount} added to your arena balance!`);
      setIsDepositOpen(false);
      setDepositAmount("");
      fetchWalletData();
    } catch (error: any) {
      toast.error("Failed to process deployment funds");
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
      toast.error("Insufficient arena balance");
      return;
    }

    setProcessing(true);
    try {
      const { error: txError } = await supabase.from("transactions").insert({
        user_id: user!.id,
        amount,
        type: "withdrawal",
        status: "pending",
        description: `Funds Extraction Request`,
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

      toast.success(`Withdrawal requested. System audit in progress.`);
      setIsWithdrawOpen(false);
      setWithdrawAmount("");
      fetchWalletData();
    } catch (error: any) {
      toast.error("Extraction protocol failure");
    } finally {
      setProcessing(false);
    }
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen">
      <TopHeader />
      <PaperWrapper className="!w-[850px] !min-h-[600px] !rotate-1">
        <div className="w-full flex flex-col gap-8 h-full max-h-[500px] overflow-y-auto no-scrollbar pr-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-5xl font-heading -rotate-2">Financial Sector</h2>
            <p className="text-xl font-handwritten opacity-50 uppercase tracking-widest">Managing Operational Capital</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border-2 border-ink-blue/10 p-8 rounded-3xl rotate-2 bg-ink-blue/5">
              <p className="font-handwritten text-xl opacity-40 uppercase tracking-widest mb-2">Available Balance</p>
              <div className="text-6xl font-heading text-ink-blue">₹{(wallet?.balance || 0).toLocaleString()}</div>
              
              <div className="mt-8 flex gap-4">
                <button onClick={() => setIsDepositOpen(true)} className="hand-drawn-btn !bg-white">Recharge</button>
                <button onClick={() => setIsWithdrawOpen(true)} className="hand-drawn-btn !border-ink-blue/10 !opacity-60">Extract</button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="border-b-2 border-dashed border-ink-blue/10 py-4">
                <p className="font-handwritten text-lg opacity-40 uppercase tracking-widest">Lifetime Earnings</p>
                <p className="text-3xl font-heading">₹{(wallet?.lifetime_earnings || 0).toLocaleString()}</p>
              </div>
              <div className="py-4">
                <p className="font-handwritten text-lg opacity-40 uppercase tracking-widest">Pending Withdrawals</p>
                <p className="text-3xl font-heading opacity-40">₹{(wallet?.pending_withdrawals || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-3xl font-heading flex items-center gap-4">
              <Activity size={24} /> Financial Logs
            </h3>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-ink-blue/40" />
              </div>
            ) : transactions.length > 0 ? (
              <div className="space-y-4">
                {transactions.map((tx, i) => (
                  <div key={tx.id} className="flex items-center justify-between border-b-2 border-ink-blue/5 pb-4 group">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 ${
                        ['deposit', 'prize'].includes(tx.type) ? 'border-ink-blue text-ink-blue rotate-3' : 'border-ink-blue/10 text-ink-blue/20 -rotate-3'
                      }`}>
                         {tx.type === 'deposit' ? <Plus size={20} /> : <ArrowDownLeft size={20} />}
                      </div>
                      <div className="text-left">
                        <h4 className="text-xl font-handwritten font-bold">{tx.description || tx.type}</h4>
                        <p className="text-sm opacity-40">{new Date(tx.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className={`text-2xl font-heading ${['deposit', 'prize'].includes(tx.type) ? 'text-ink-blue' : 'opacity-40'}`}>
                      {['deposit', 'prize'].includes(tx.type) ? '+' : '-'}₹{tx.amount}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center opacity-30">
                <AlertCircle size={40} className="mx-auto mb-4" />
                <p className="text-2xl font-handwritten">No ledger entries found</p>
              </div>
            )}
          </div>
        </div>
      </PaperWrapper>

      {/* Modals are themed by default via globals.css but we can refine them if needed */}
      <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
        <DialogContent className="font-handwritten text-xl p-10">
          <DialogHeader>
            <DialogTitle className="text-4xl font-heading">Recharge Arena</DialogTitle>
            <DialogDescription className="text-lg">Add deployment funds to your wallet.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 pt-6">
            <Input 
              type="number" 
              placeholder="Enter amount (min ₹10)" 
              className="h-14 font-handwritten text-2xl border-2 border-ink-blue/20 rounded-2xl"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
            />
            <button 
              onClick={handleDeposit}
              disabled={processing}
              className="hand-drawn-btn w-full !py-4"
            >
              {processing ? "Processing..." : "Inject Funds"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
        <DialogContent className="font-handwritten text-xl p-10">
          <DialogHeader>
            <DialogTitle className="text-4xl font-heading">Extract Funds</DialogTitle>
            <DialogDescription className="text-lg">Withdraw your arena winnings.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 pt-6">
            <Input 
              type="number" 
              placeholder="Enter amount (min ₹100)" 
              className="h-14 font-handwritten text-2xl border-2 border-ink-blue/20 rounded-2xl"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
            />
            <button 
              onClick={handleWithdraw}
              disabled={processing}
              className="hand-drawn-btn w-full !py-4"
            >
              {processing ? "Processing..." : "Initiate Extraction"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
