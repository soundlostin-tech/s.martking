"use client";

import { BottomNav } from "@/components/layout/BottomNav";
import { TopHeader } from "@/components/layout/TopHeader";
import { 
  ArrowDownLeft, 
  Plus, 
  Loader2, 
  Activity, 
  AlertCircle,
  TrendingUp,
  History,
  CreditCard,
  Wallet
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
        description: "Wallet Recharge",
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

      toast.success(`₹${amount} added successfully!`);
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
    <div className="min-h-screen pb-24">
      <TopHeader />
      
      <main className="pt-24 px-6 space-y-8 max-w-4xl mx-auto">
        <header className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Wallet Balance</h2>
          <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">Manage your arena funds</p>
        </header>

        <section className="bg-card border border-border p-8 rounded-[2rem] shadow-sm space-y-8">
          <div className="space-y-1">
            <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Wallet size={14} className="text-jungle-teal" />
              Available Funds
            </div>
            <div className="text-6xl font-black text-primary">₹{(wallet?.balance || 0).toLocaleString()}</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setIsDepositOpen(true)}
              className="flex items-center justify-center gap-2 bg-jungle-teal text-white py-4 rounded-2xl font-bold hover:opacity-90 transition-opacity"
            >
              <Plus size={20} /> Add Cash
            </button>
            <button 
              onClick={() => setIsWithdrawOpen(true)}
              className="flex items-center justify-center gap-2 bg-muted text-primary py-4 rounded-2xl font-bold hover:bg-muted/80 transition-colors"
            >
              Withdraw
            </button>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4">
          <div className="bg-card border border-border p-5 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground uppercase tracking-widest text-[10px] font-bold">
              <TrendingUp size={12} className="text-green-500" />
              Lifetime Earnings
            </div>
            <div className="text-2xl font-bold">₹{(wallet?.lifetime_earnings || 0).toLocaleString()}</div>
          </div>
          <div className="bg-card border border-border p-5 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground uppercase tracking-widest text-[10px] font-bold">
              <Activity size={12} className="text-yellow-500" />
              Pending Withdrawals
            </div>
            <div className="text-2xl font-bold text-muted-foreground">₹{(wallet?.pending_withdrawals || 0).toLocaleString()}</div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <History size={20} className="text-jungle-teal" />
              Recent Transactions
            </h3>
          </div>

          <div className="space-y-4">
            {loading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
              ))
            ) : transactions.length > 0 ? (
              transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 bg-card border border-border rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-xl ${
                      ['deposit', 'prize'].includes(tx.type) ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {['deposit', 'prize'].includes(tx.type) ? <Plus size={18} /> : <ArrowDownLeft size={18} />}
                    </div>
                    <div>
                      <div className="font-bold text-sm">{tx.description || tx.type}</div>
                      <div className="text-[10px] text-muted-foreground font-medium">{new Date(tx.created_at).toLocaleDateString()} • {tx.status}</div>
                    </div>
                  </div>
                  <div className={`font-black ${
                    ['deposit', 'prize'].includes(tx.type) ? 'text-green-600' : 'text-primary'
                  }`}>
                    {['deposit', 'prize'].includes(tx.type) ? '+' : '-'}₹{tx.amount}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center space-y-2">
                <AlertCircle size={40} className="mx-auto text-muted-foreground/20" />
                <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">No transaction history</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
        <DialogContent className="rounded-3xl p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Add Funds</DialogTitle>
            <DialogDescription>Recharge your wallet to join arena battles.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Amount (INR)</label>
              <Input 
                type="number" 
                placeholder="₹100" 
                className="h-14 text-2xl font-bold rounded-2xl border-border focus:ring-jungle-teal/20"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
              />
            </div>
            <button 
              onClick={handleDeposit}
              disabled={processing}
              className="w-full py-4 bg-jungle-teal text-white rounded-2xl font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {processing ? <Loader2 size={24} className="animate-spin mx-auto" /> : "Complete Deposit"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
        <DialogContent className="rounded-3xl p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Withdraw Funds</DialogTitle>
            <DialogDescription>Transfer your winnings to your account.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Amount (INR)</label>
              <Input 
                type="number" 
                placeholder="₹500" 
                className="h-14 text-2xl font-bold rounded-2xl border-border focus:ring-jungle-teal/20"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
            </div>
            <button 
              onClick={handleWithdraw}
              disabled={processing}
              className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {processing ? <Loader2 size={24} className="animate-spin mx-auto" /> : "Request Withdrawal"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
