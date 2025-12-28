"use client";

import { BottomNav } from "@/components/layout/BottomNav";
import { TopHeader } from "@/components/layout/TopHeader";
import { BentoCard } from "@/components/ui/BentoCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { 
  ArrowDownLeft, 
  Plus, 
  Loader2, 
  Wallet as WalletIcon, 
  TrendingUp,
  Clock,
  CreditCard,
  Banknote,
  ArrowUpRight,
  ChevronRight,
  Trophy,
  Sparkles
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function WalletPage() {
  const { user, loading: authLoading } = useAuth(true);
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [txFilter, setTxFilter] = useState("All");
  
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
        description: "Wallet Deposit",
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

  const filteredTransactions = transactions.filter(tx => {
    if (txFilter === "All") return true;
    if (txFilter === "Deposits") return tx.type === "deposit";
    if (txFilter === "Withdrawals") return tx.type === "withdrawal";
    return true;
  });

  return (
    <div className="min-h-screen bg-background text-onyx">
      <main className="pb-32 relative z-10">
        <TopHeader />

        {/* Sticker Header */}
        <section className="sticker-header relative">
          <div className="sticker-blob sticker-blob-1" style={{ background: 'var(--color-soft-yellow)' }} />
          <div className="sticker-blob sticker-blob-2" style={{ background: 'var(--color-pastel-lavender)' }} />
          
          <div className="relative z-10">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[42px] font-black leading-[0.95] mb-3"
            >
              Wallet
            </motion.h1>
            <p className="text-[13px] font-bold text-charcoal/50 uppercase tracking-wide">
              Manage your arena funds
            </p>
          </div>
        </section>

        <div className="px-6 space-y-6">
          {/* Balance Hero Card */}
          <BentoCard variant="vibrant" className="p-7 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={16} className="text-onyx/40" />
                <p className="text-[10px] font-black text-onyx/40 uppercase tracking-widest">Available Balance</p>
              </div>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-2xl font-black opacity-40">₹</span>
                <motion.h2 
                  key={wallet?.balance}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[52px] font-black leading-none tracking-tight"
                >
                  {(wallet?.balance || 0).toLocaleString()}
                </motion.h2>
              </div>
              <div className="flex gap-6 pt-5 border-t border-onyx/10">
                <div>
                  <p className="text-[9px] font-bold text-onyx/40 uppercase tracking-widest mb-1">Lifetime</p>
                  <p className="text-base font-black">₹{(wallet?.lifetime_earnings || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-onyx/40 uppercase tracking-widest mb-1">Pending</p>
                  <p className="text-base font-black text-onyx/50">₹{(wallet?.pending_withdrawals || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
            <WalletIcon className="absolute right-4 top-4 text-onyx/5" size={120} />
          </BentoCard>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div whileTap={{ scale: 0.97 }}>
              <BentoCard variant="dark" onClick={() => setIsDepositOpen(true)} className="p-6 flex flex-col items-center gap-4 h-[120px] justify-center">
                <div className="w-14 h-14 rounded-2xl bg-soft-yellow flex items-center justify-center">
                  <Plus size={26} className="text-onyx" strokeWidth={3} />
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.15em] text-white">Deposit</span>
              </BentoCard>
            </motion.div>
            <motion.div whileTap={{ scale: 0.97 }}>
              <BentoCard onClick={() => setIsWithdrawOpen(true)} className="p-6 flex flex-col items-center gap-4 h-[120px] justify-center shadow-soft">
                <div className="w-14 h-14 rounded-2xl bg-pastel-coral flex items-center justify-center">
                  <ArrowUpRight size={26} className="text-onyx" strokeWidth={3} />
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.15em]">Withdraw</span>
              </BentoCard>
            </motion.div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <BentoCard variant="pastel" pastelColor="mint" className="p-4 text-center">
              <div className="w-9 h-9 rounded-xl bg-white/50 mx-auto mb-2 flex items-center justify-center">
                <TrendingUp size={18} className="text-onyx" />
              </div>
              <p className="text-[14px] font-black">+12%</p>
              <p className="text-[8px] font-bold text-onyx/40 uppercase tracking-widest">This Week</p>
            </BentoCard>
            <BentoCard variant="pastel" pastelColor="lavender" className="p-4 text-center">
              <div className="w-9 h-9 rounded-xl bg-white/50 mx-auto mb-2 flex items-center justify-center">
                <Trophy size={18} className="text-onyx" />
              </div>
              <p className="text-[14px] font-black">5</p>
              <p className="text-[8px] font-bold text-onyx/40 uppercase tracking-widest">Wins</p>
            </BentoCard>
            <BentoCard variant="pastel" pastelColor="yellow" className="p-4 text-center">
              <div className="w-9 h-9 rounded-xl bg-white/50 mx-auto mb-2 flex items-center justify-center">
                <Banknote size={18} className="text-onyx" />
              </div>
              <p className="text-[14px] font-black">₹500</p>
              <p className="text-[8px] font-bold text-onyx/40 uppercase tracking-widest">Avg Win</p>
            </BentoCard>
          </div>

          {/* Quick Info Card */}
          <BentoCard className="p-5 flex items-center justify-between shadow-soft">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-pastel-sky flex items-center justify-center">
                  <CreditCard size={22} className="text-onyx" />
                </div>
                <div>
                  <p className="text-[14px] font-black">Link Payment</p>
                  <p className="text-[9px] font-bold text-onyx/40 uppercase tracking-widest">For instant withdrawals</p>
                </div>
             </div>
             <ChevronRight size={20} className="text-onyx/20" />
          </BentoCard>

          {/* Transactions */}
          <section className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black">History</h3>
              <div className="flex gap-2">
                {["All", "Deposits", "Withdrawals"].map(f => (
                  <motion.button 
                    key={f} 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setTxFilter(f)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                      txFilter === f ? "bg-onyx text-white" : "bg-white text-charcoal shadow-sm"
                    )}
                  >
                    {f}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-onyx/20" />
                  <p className="text-[9px] text-charcoal/40 font-bold uppercase tracking-widest">Loading...</p>
                </div>
              ) : filteredTransactions.length > 0 ? (
                <AnimatePresence mode="popLayout">
                  {filteredTransactions.map((tx, i) => (
                    <motion.div 
                      key={tx.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <BentoCard className="p-4 shadow-soft flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center",
                            tx.type === 'deposit' ? 'bg-pastel-mint' : 
                            tx.type === 'withdrawal' ? 'bg-pastel-coral' : 'bg-pastel-lavender'
                          )}>
                            {tx.type === 'deposit' ? <Plus size={20} className="text-onyx" /> : 
                             tx.type === 'withdrawal' ? <ArrowUpRight size={20} className="text-onyx" /> : 
                             <Trophy size={20} className="text-onyx" />}
                          </div>
                          <div>
                            <p className="text-[14px] font-black leading-tight capitalize">{tx.description || tx.type}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest">
                                {new Date(tx.created_at).toLocaleDateString()}
                              </span>
                              <StatusBadge variant={tx.status as any} className="text-[7px] px-2 py-0.5" />
                            </div>
                          </div>
                        </div>
                        <p className={cn(
                          "text-lg font-black",
                          ['deposit', 'prize'].includes(tx.type) ? "text-onyx" : "text-charcoal/40"
                        )}>
                          {['deposit', 'prize'].includes(tx.type) ? '+' : '-'}₹{tx.amount}
                        </p>
                      </BentoCard>
                    </motion.div>
                  ))}
                </AnimatePresence>
              ) : (
                <BentoCard className="p-16 text-center shadow-soft relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-full bg-off-white mx-auto mb-4 flex items-center justify-center">
                      <Banknote size={32} className="text-charcoal/10" />
                    </div>
                    <p className="text-[11px] text-charcoal/40 font-bold uppercase tracking-widest">No transactions yet</p>
                  </div>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-pastel-mint/30 rounded-full blur-3xl" />
                </BentoCard>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Deposit Modal */}
      <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
        <DialogContent className="p-0 border-none bg-white rounded-[36px] overflow-hidden max-w-[400px]">
          <div className="bg-soft-yellow p-8 relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl font-black mb-1">Add Funds</h2>
              <p className="text-[11px] font-bold opacity-50 uppercase tracking-widest">Power up your wallet</p>
            </div>
            <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/20 rounded-full" />
          </div>
          <div className="p-8 space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-charcoal/40 uppercase tracking-widest">Amount (₹)</label>
              <Input 
                type="number" 
                placeholder="Enter amount" 
                className="h-16 rounded-2xl border-none bg-off-white text-2xl font-black px-6 focus-visible:ring-onyx text-onyx placeholder:text-charcoal/20"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[100, 250, 500, 1000].map(amt => (
                <motion.button
                  key={amt}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDepositAmount(String(amt))}
                  className={cn(
                    "py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    depositAmount === String(amt) ? "bg-onyx text-white" : "bg-off-white text-onyx"
                  )}
                >
                  ₹{amt}
                </motion.button>
              ))}
            </div>
            <motion.button 
              whileTap={{ scale: 0.98 }}
              onClick={handleDeposit}
              disabled={processing}
              className="w-full py-5 bg-onyx text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] shadow-xl"
            >
              {processing ? <Loader2 className="animate-spin mx-auto" /> : "Confirm Deposit"}
            </motion.button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Withdraw Modal */}
      <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
        <DialogContent className="p-0 border-none bg-white rounded-[36px] overflow-hidden max-w-[400px]">
          <div className="bg-pastel-coral p-8 relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl font-black mb-1">Withdraw</h2>
              <p className="text-[11px] font-bold opacity-50 uppercase tracking-widest">Cash out your winnings</p>
            </div>
            <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/20 rounded-full" />
          </div>
          <div className="p-8 space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-charcoal/40 uppercase tracking-widest">Amount (₹)</label>
              <Input 
                type="number" 
                placeholder="Min ₹100" 
                className="h-16 rounded-2xl border-none bg-off-white text-2xl font-black px-6 focus-visible:ring-onyx text-onyx placeholder:text-charcoal/20"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
            </div>
            <BentoCard variant="pastel" pastelColor="peach" className="p-4 flex items-center gap-3">
              <Clock size={18} className="text-onyx" />
              <p className="text-[11px] font-black uppercase tracking-widest">24h Processing</p>
            </BentoCard>
            <motion.button 
              whileTap={{ scale: 0.98 }}
              onClick={handleWithdraw}
              disabled={processing}
              className="w-full py-5 bg-onyx text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] shadow-xl"
            >
              {processing ? <Loader2 className="animate-spin mx-auto" /> : "Request Withdrawal"}
            </motion.button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
