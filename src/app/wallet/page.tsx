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
import { Badge } from "@/components/ui/badge";

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
        .maybeSingle();
      
      if (walletError) throw walletError;
      
      if (!walletData) {
        const { data: newWallet, error: createError } = await supabase
          .from("wallets")
          .insert({
            user_id: user.id,
            balance: 0,
            lifetime_earnings: 0,
            pending_withdrawals: 0,
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (createError) throw createError;
        setWallet(newWallet);
      } else {
        setWallet(walletData);
      }

      const { data: txData, error: txError } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (txError) throw txError;
      setTransactions(txData || []);
    } catch (error: any) {
      console.error("Error fetching wallet data:", error.message || error);
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

      toast.success(`₹${amount} added successfully!`);
      setIsDepositOpen(false);
      setDepositAmount("");
      fetchWalletData();
    } catch (error: any) {
      toast.error(error.message || "Failed to add funds");
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

      toast.success(`Withdrawal requested successfully`);
      setIsWithdrawOpen(false);
      setWithdrawAmount("");
      fetchWalletData();
    } catch (error: any) {
      toast.error(error.message || "Withdrawal failed");
    } finally {
      setProcessing(false);
    }
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <main className="pb-24 relative z-10">
        <TopHeader />

        <div className="px-4 sm:px-6 pt-4 sm:pt-6 space-y-6 sm:space-y-8">
          {/* Balance Card - Mobile Optimized */}
          <section>
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative h-44 sm:h-52 rounded-[24px] sm:rounded-[32px] premium-gradient overflow-hidden shadow-lg p-5 sm:p-8 flex flex-col justify-between"
            >
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <WalletIcon size={100} className="text-white sm:w-[140px] sm:h-[140px]" strokeWidth={1} />
              </div>
              
              <div className="relative z-10">
                <p className="text-[9px] sm:text-[10px] font-bold text-primary-foreground/70 uppercase tracking-[0.3em] mb-1">Balance</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl sm:text-2xl font-heading text-primary-foreground/60">₹</span>
                  <h2 className="text-4xl sm:text-5xl font-heading text-primary-foreground tracking-tight">
                    {(wallet?.balance || 0).toLocaleString()}
                  </h2>
                </div>
              </div>

              <div className="relative z-10 grid grid-cols-2 gap-4 sm:gap-6 pt-4 border-t border-white/10">
                <div>
                  <p className="text-[8px] sm:text-[9px] font-bold text-primary-foreground/60 uppercase tracking-wider mb-0.5">Earnings</p>
                  <p className="text-lg sm:text-xl font-heading text-primary-foreground">₹{(wallet?.lifetime_earnings || 0).toLocaleString()}</p>
                </div>
                <div className="text-right sm:text-left">
                  <p className="text-[8px] sm:text-[9px] font-bold text-primary-foreground/60 uppercase tracking-wider mb-0.5">Pending</p>
                  <p className="text-lg sm:text-xl font-heading text-primary-foreground/80">₹{(wallet?.pending_withdrawals || 0).toLocaleString()}</p>
                </div>
              </div>
              
              <div className="absolute top-[-30%] right-[-10%] w-full h-full bg-white/5 blur-[80px] rounded-full pointer-events-none" />
            </motion.div>
          </section>

          {/* Quick Actions - Mobile Optimized */}
          <section className="grid grid-cols-2 gap-3 sm:gap-4">
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsDepositOpen(true)}
              className="mobile-card py-5 sm:py-6 flex flex-col items-center gap-2 haptic-tap"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-accent/15 flex items-center justify-center text-accent">
                <Plus size={20} strokeWidth={3} className="sm:w-6 sm:h-6" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold text-accent uppercase tracking-wide">Add Funds</span>
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsWithdrawOpen(true)}
              className="mobile-card py-5 sm:py-6 flex flex-col items-center gap-2 haptic-tap"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                <ArrowDownLeft size={20} strokeWidth={3} className="sm:w-6 sm:h-6" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Withdraw</span>
            </motion.button>
          </section>

          {/* Transaction History - Mobile Optimized */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="space-y-0.5">
                <h3 className="text-base sm:text-lg font-outfit font-semibold text-foreground">Transactions</h3>
                <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Recent Activity</p>
              </div>
              <Activity size={18} className="text-muted-foreground" />
            </div>

            <div className="space-y-2 sm:space-y-3">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 bg-card rounded-[20px] border border-border">
                  <Loader2 className="w-8 h-8 animate-spin text-accent" />
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Loading...</p>
                </div>
              ) : transactions.length > 0 ? (
                transactions.map((tx, i) => (
                  <motion.div 
                    key={tx.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="mobile-card p-3.5 sm:p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${
                        ['deposit', 'prize'].includes(tx.type) ? 'bg-accent/15 text-accent' : 'bg-muted text-muted-foreground'
                      }`}>
                        {tx.type === 'deposit' ? <Plus size={18} strokeWidth={3} /> : tx.type === 'withdrawal' ? <ArrowDownLeft size={18} strokeWidth={3} /> : <TrendingUp size={18} strokeWidth={3} />}
                      </div>
                      <div>
                        <h4 className="text-[12px] sm:text-[13px] font-semibold text-foreground capitalize">{tx.description || tx.type}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-medium text-muted-foreground flex items-center gap-1">
                            <Clock size={10} /> {new Date(tx.created_at).toLocaleDateString()}
                          </span>
                          <Badge variant="outline" className={`border-none rounded-full text-[7px] sm:text-[8px] px-1.5 py-0 h-4 font-bold ${
                            tx.status === 'completed' ? 'bg-accent/15 text-accent' : 'bg-muted text-muted-foreground'
                          }`}>
                            {tx.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-base sm:text-lg font-outfit font-bold ${
                        ['deposit', 'prize'].includes(tx.type) ? 'text-accent' : 'text-foreground/60'
                      }`}>
                        {['deposit', 'prize'].includes(tx.type) ? '+' : '-'}₹{tx.amount}
                      </p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12 bg-card rounded-[20px] border border-dashed border-border space-y-3">
                  <AlertCircle size={32} className="text-muted-foreground/30 mx-auto" />
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">No transactions yet</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Deposit Modal - Mobile Optimized */}
      <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
        <DialogContent className="p-0 border-none bg-popover text-popover-foreground rounded-t-[28px] sm:rounded-[28px] overflow-hidden max-w-[100vw] sm:max-w-[400px] shadow-2xl fixed bottom-0 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 left-0 right-0 sm:left-1/2 sm:-translate-x-1/2 m-0 sm:m-auto">
          <div className="premium-gradient p-6 sm:p-8 relative overflow-hidden">
            <DialogTitle className="text-2xl sm:text-3xl font-heading text-white mb-1">Add Funds</DialogTitle>
            <DialogDescription className="text-white/60 text-[10px] sm:text-[11px] font-medium uppercase tracking-wide">Add money to your wallet</DialogDescription>
            <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/10 blur-[50px] rounded-full" />
          </div>
          <div className="p-6 sm:p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Amount (₹)</label>
              <Input 
                type="number" 
                placeholder="Enter amount" 
                className="h-14 rounded-xl border border-border bg-muted text-xl font-outfit font-semibold px-5 focus-visible:ring-accent text-foreground placeholder:text-muted-foreground/40"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
              />
            </div>
            <button 
              onClick={handleDeposit}
              disabled={processing}
              className="w-full h-14 bg-primary text-primary-foreground rounded-xl text-[11px] font-bold uppercase tracking-wider shadow-lg active:scale-[0.98] transition-transform haptic-tap touch-target"
            >
              {processing ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Add Funds"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Withdraw Modal - Mobile Optimized */}
      <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
        <DialogContent className="p-0 border-none bg-popover text-popover-foreground rounded-t-[28px] sm:rounded-[28px] overflow-hidden max-w-[100vw] sm:max-w-[400px] shadow-2xl fixed bottom-0 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 left-0 right-0 sm:left-1/2 sm:-translate-x-1/2 m-0 sm:m-auto">
          <div className="bg-muted p-6 sm:p-8 relative overflow-hidden">
            <DialogTitle className="text-2xl sm:text-3xl font-heading text-foreground mb-1">Withdraw</DialogTitle>
            <DialogDescription className="text-muted-foreground text-[10px] sm:text-[11px] font-medium uppercase tracking-wide">Withdraw your winnings</DialogDescription>
            <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-accent/10 blur-[50px] rounded-full" />
          </div>
          <div className="p-6 sm:p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Amount (₹)</label>
              <Input 
                type="number" 
                placeholder="Min ₹100" 
                className="h-14 rounded-xl border border-border bg-muted text-xl font-outfit font-semibold px-5 focus-visible:ring-accent text-foreground placeholder:text-muted-foreground/40"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
            </div>
            <button 
              onClick={handleWithdraw}
              disabled={processing}
              className="w-full h-14 bg-secondary text-secondary-foreground rounded-xl text-[11px] font-bold uppercase tracking-wider shadow-lg active:scale-[0.98] transition-transform haptic-tap touch-target"
            >
              {processing ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Request Withdrawal"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
