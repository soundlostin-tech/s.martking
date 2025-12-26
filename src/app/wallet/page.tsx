"use client";

import { BottomNav } from "@/components/layout/BottomNav";
import { TopHeader } from "@/components/layout/TopHeader";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  Loader2, 
  Wallet as WalletIcon, 
  ChevronRight,
  TrendingUp,
  CreditCard,
  History,
  Zap
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function WalletPage() {
  const { user, loading: authLoading } = useAuth();
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  useEffect(() => {
    if (user) {
      fetchWalletData();
    }
  }, [user]);

  const fetchWalletData = async () => {
    setLoading(true);
    try {
      const { data: walletData, error: walletError } = await supabase
        .from("wallets")
        .select("*")
        .eq("id", user!.id)
        .single();
      
      if (walletError) throw walletError;
      setWallet(walletData);

      const { data: txData, error: txError } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (txError) throw txError;
      setTransactions(txData || []);
    } catch (error) {
      console.error("Error fetching wallet data:", error);
    } finally {
      setLoading(false);
    }
  };

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
        .eq("id", user!.id);
      
      if (walletError) throw walletError;

      toast.success(`₹${amount} added!`);
      setIsDepositOpen(false);
      setDepositAmount("");
      fetchWalletData();
    } catch (error: any) {
      toast.error("Failed to process deposit");
    } finally {
      setProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = Number(withdrawAmount);
    if (!amount || amount < 100) {
      toast.error(`Min withdrawal ₹100`);
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
        description: `Withdrawal`,
      });

      if (txError) throw txError;

      const { error: walletError } = await supabase
        .from("wallets")
        .update({ 
          balance: Number(wallet?.balance || 0) - amount,
          pending_withdrawals: Number(wallet?.pending_withdrawals || 0) + amount,
          updated_at: new Date().toISOString() 
        })
        .eq("id", user!.id);
      
      if (walletError) throw walletError;

      toast.success(`Withdrawal requested!`);
      setIsWithdrawOpen(false);
      setWithdrawAmount("");
      fetchWalletData();
    } catch (error: any) {
      toast.error("Failed to process withdrawal");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="pb-32">
        <TopHeader />

        <div className="px-6 pt-8 space-y-8 max-w-lg mx-auto">
          {/* Main Balance Card - Native App Style */}
          <section>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative h-56 rounded-[40px] bg-primary overflow-hidden shadow-2xl shadow-primary/20 p-8 flex flex-col justify-between"
            >
              <div className="absolute top-0 right-0 p-8 opacity-20">
                <WalletIcon size={120} className="text-white" />
              </div>
              
              <div className="relative z-10">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-1">Available Balance</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white/50">₹</span>
                  <h2 className="text-5xl font-bold text-white tracking-tighter">
                    {(wallet?.balance || 0).toLocaleString()}
                  </h2>
                </div>
              </div>

              <div className="relative z-10 grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
                <div>
                  <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest mb-1">Earnings</p>
                  <p className="text-lg font-bold text-white">₹{(wallet?.lifetime_earnings || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest mb-1">Pending</p>
                  <p className="text-lg font-bold text-white/60">₹{(wallet?.pending_withdrawals || 0).toLocaleString()}</p>
                </div>
              </div>
            </motion.div>
          </section>

            {/* Quick Actions - Native Grid */}
            <section className="grid grid-cols-2 gap-4">
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsDepositOpen(true)}
                className="bg-card backdrop-blur-md rounded-[32px] py-6 flex flex-col items-center gap-2 border border-white/10 shadow-sm active:shadow-md transition-all"
              >
                <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                  <Plus size={20} />
                </div>
                <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider">Deposit</span>
              </motion.button>
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsWithdrawOpen(true)}
                className="bg-card backdrop-blur-md rounded-[32px] py-6 flex flex-col items-center gap-2 border border-white/10 shadow-sm active:shadow-md transition-all"
              >
                <div className="w-10 h-10 rounded-2xl bg-accent/20 flex items-center justify-center text-accent">
                  <ArrowDownLeft size={20} />
                </div>
                <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider">Withdraw</span>
              </motion.button>
            </section>

            {/* Transaction History - Native List */}
            <section className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-lg font-bold text-foreground">Activity</h3>
                <History size={16} className="text-foreground/20" />
              </div>

              <div className="space-y-3">
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-primary/30" />
                  </div>
                ) : transactions.length > 0 ? (
                  transactions.map((tx, i) => (
                    <motion.div 
                      key={tx.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-card backdrop-blur-md p-4 rounded-[28px] flex items-center justify-between border border-white/10 shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                          tx.type === 'deposit' || tx.type === 'prize' ? 'bg-primary/20 text-primary' : 'bg-white/5 text-foreground/40'
                        }`}>
                          {tx.type === 'deposit' ? <Plus size={18} /> : tx.type === 'withdrawal' ? <ArrowDownLeft size={18} /> : <TrendingUp size={18} />}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-foreground capitalize leading-none mb-1">{tx.description || tx.type}</h4>
                          <p className="text-[9px] font-bold text-foreground/30 uppercase tracking-wider">
                            {new Date(tx.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-base font-bold ${
                          tx.type === 'deposit' || tx.type === 'prize' ? 'text-primary' : 'text-foreground/40'
                        }`}>
                          {tx.type === 'deposit' || tx.type === 'prize' ? '+' : '-'}₹{tx.amount}
                        </p>
                        <span className={`text-[8px] font-bold uppercase tracking-widest ${
                          tx.status === 'completed' ? 'text-primary/40' : 'text-accent'
                        }`}>
                          {tx.status}
                        </span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-card backdrop-blur-md rounded-[32px] border border-white/10">
                    <p className="text-xs text-foreground/20 font-bold uppercase tracking-widest">No transactions yet</p>
                  </div>
                )}
              </div>
            </section>

        </div>
      </main>

      {/* Styled Modals */}
      <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
        <DialogContent className="p-0 border-none bg-background rounded-[40px] overflow-hidden max-w-[90vw] sm:max-w-[400px]">
          <div className="bg-primary p-8 text-white">
            <DialogTitle className="text-2xl font-bold">Add Funds</DialogTitle>
            <DialogDescription className="text-white/60 text-xs font-medium">Recharge your arena balance instantly.</DialogDescription>
          </div>
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-foreground/20 uppercase tracking-widest ml-1">Amount (₹)</label>
              <Input 
                type="number" 
                placeholder="Enter amount" 
                className="h-14 rounded-2xl border-foreground/[0.06] bg-foreground/[0.02] text-xl font-bold px-6"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
              />
            </div>
            <button 
              onClick={handleDeposit}
              disabled={processing}
              className="w-full py-4 bg-primary text-white rounded-2xl text-xs font-bold uppercase tracking-[0.2em] shadow-lg shadow-primary/20 active:scale-95 transition-all"
            >
              {processing ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Confirm Deposit"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
        <DialogContent className="p-0 border-none bg-background rounded-[40px] overflow-hidden max-w-[90vw] sm:max-w-[400px]">
          <div className="bg-accent p-8 text-foreground">
            <DialogTitle className="text-2xl font-bold">Withdraw</DialogTitle>
            <DialogDescription className="text-foreground/40 text-xs font-medium">Transfer your winnings to your account.</DialogDescription>
          </div>
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-foreground/20 uppercase tracking-widest ml-1">Amount (₹)</label>
              <Input 
                type="number" 
                placeholder="Min ₹100" 
                className="h-14 rounded-2xl border-foreground/[0.06] bg-foreground/[0.02] text-xl font-bold px-6"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
            </div>
            <button 
              onClick={handleWithdraw}
              disabled={processing}
              className="w-full py-4 bg-accent text-foreground rounded-2xl text-xs font-bold uppercase tracking-[0.2em] shadow-lg shadow-accent/20 active:scale-95 transition-all"
            >
              {processing ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Request Payout"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
