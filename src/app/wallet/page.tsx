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
  ArrowUpRight
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
        <section className="sticker-header">
          <div className="sticker-blob bg-lime-yellow" />
          <p className="text-[10px] font-bold text-charcoal/40 uppercase tracking-widest leading-none mb-3">Finance</p>
          <h1 className="text-[48px] font-black leading-none mb-2">Wallet</h1>
          <p className="text-[12px] font-bold text-charcoal/40 uppercase tracking-tighter">Manage your arena funds</p>
        </section>

        <div className="px-6 space-y-6">
          {/* Balance Hero Card */}
          <BentoCard variant="vibrant" className="p-8 relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-onyx/40 uppercase tracking-widest mb-4">Available Balance</p>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-xl font-black opacity-40">₹</span>
                <h2 className="text-[48px] font-black leading-none tracking-tight">
                  {(wallet?.balance || 0).toLocaleString()}
                </h2>
              </div>
              <div className="flex gap-8 border-t border-onyx/10 pt-6">
                <div>
                  <p className="text-[8px] font-bold text-onyx/40 uppercase tracking-widest mb-1">Lifetime</p>
                  <p className="text-sm font-black">₹{(wallet?.lifetime_earnings || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[8px] font-bold text-onyx/40 uppercase tracking-widest mb-1">Pending</p>
                  <p className="text-sm font-black opacity-40">₹{(wallet?.pending_withdrawals || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="absolute right-[-20px] top-[-20px] opacity-10 scale-150 pointer-events-none">
              <WalletIcon size={120} />
            </div>
          </BentoCard>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <BentoCard variant="dark" onClick={() => setIsDepositOpen(true)} className="p-6 flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                <Plus size={24} className="text-lime-yellow" strokeWidth={3} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Deposit</span>
            </BentoCard>
            <BentoCard onClick={() => setIsWithdrawOpen(true)} className="p-6 flex flex-col items-center gap-3 border border-black/5 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-off-white flex items-center justify-center">
                <ArrowDownLeft size={24} className="text-onyx" strokeWidth={3} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Withdraw</span>
            </BentoCard>
          </div>

          {/* Quick Info Card */}
          <BentoCard variant="pastel" pastelColor="lavender" className="p-6 flex items-center justify-between border-none">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center">
                  <CreditCard size={20} className="text-onyx" />
                </div>
                <div>
                  <p className="text-xs font-black">Link Payment Method</p>
                  <p className="text-[8px] font-bold text-onyx/40 uppercase tracking-widest">For instant withdrawals</p>
                </div>
             </div>
             <ChevronRight size={18} className="text-onyx/30" />
          </BentoCard>

          {/* Transactions */}
          <section className="space-y-6 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black">History</h3>
              <div className="flex gap-2">
                {["All", "Deposits", "Withdrawals"].map(f => (
                  <button 
                    key={f} 
                    onClick={() => setTxFilter(f)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all",
                      txFilter === f ? "bg-onyx text-white" : "bg-silver/20 text-charcoal"
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-onyx/20" />
                  <p className="text-[9px] text-charcoal/40 font-bold uppercase tracking-widest">Scanning transactions...</p>
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
                      <div className="flex items-center justify-between p-4 bg-white rounded-3xl border border-black/[0.03] shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center",
                            tx.type === 'deposit' ? 'bg-pastel-mint' : 
                            tx.type === 'withdrawal' ? 'bg-pastel-coral' : 'bg-pastel-lavender'
                          )}>
                            {tx.type === 'deposit' ? <Plus size={20} /> : 
                             tx.type === 'withdrawal' ? <ArrowDownLeft size={20} /> : 
                             <Trophy size={20} />}
                          </div>
                          <div>
                            <p className="text-[13px] font-black leading-tight capitalize">{tx.description || tx.type}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest">{new Date(tx.created_at).toLocaleDateString()}</span>
                              <StatusBadge variant={tx.status as any} className="text-[8px] px-2 py-0.5" />
                            </div>
                          </div>
                        </div>
                        <p className={cn(
                          "text-lg font-black",
                          ['deposit', 'prize'].includes(tx.type) ? "text-onyx" : "text-charcoal/40"
                        )}>
                          {['deposit', 'prize'].includes(tx.type) ? '+' : '-'}₹{tx.amount}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              ) : (
                <BentoCard className="p-16 text-center border-none shadow-sm">
                  <Banknote size={40} className="text-charcoal/10 mx-auto mb-4" />
                  <p className="text-[10px] text-charcoal/40 font-bold uppercase tracking-widest">Empty Transaction Vault</p>
                </BentoCard>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Modals */}
      <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
        <DialogContent className="p-0 border-none bg-white rounded-[32px] overflow-hidden max-w-[400px]">
          <div className="bg-lime-yellow p-8">
            <h2 className="text-3xl font-black mb-1">Add Funds</h2>
            <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Power up your arena bank</p>
          </div>
          <div className="p-8 space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-charcoal/40 uppercase tracking-widest">Amount (₹)</label>
              <Input 
                type="number" 
                placeholder="Enter amount" 
                className="h-16 rounded-2xl border-none bg-background text-2xl font-black px-6 focus-visible:ring-onyx text-onyx placeholder:text-charcoal/20"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[100, 250, 500, 1000].map(amt => (
                <button
                  key={amt}
                  onClick={() => setDepositAmount(String(amt))}
                  className={cn(
                    "py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    depositAmount === String(amt) ? "bg-onyx text-white" : "bg-background text-onyx"
                  )}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
            <motion.button 
              whileTap={{ scale: 0.98 }}
              onClick={handleDeposit}
              disabled={processing}
              className="w-full py-5 bg-onyx text-white rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] shadow-xl"
            >
              {processing ? <Loader2 className="animate-spin mx-auto" /> : "Confirm Deposit"}
            </motion.button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
        <DialogContent className="p-0 border-none bg-white rounded-[32px] overflow-hidden max-w-[400px]">
          <div className="bg-background p-8">
            <h2 className="text-3xl font-black mb-1">Withdraw</h2>
            <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Cash out your victory</p>
          </div>
          <div className="p-8 space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-charcoal/40 uppercase tracking-widest">Amount (₹)</label>
              <Input 
                type="number" 
                placeholder="Min ₹100" 
                className="h-16 rounded-2xl border-none bg-background text-2xl font-black px-6 focus-visible:ring-onyx text-onyx placeholder:text-charcoal/20"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
            </div>
            <BentoCard variant="pastel" pastelColor="peach" className="p-4 flex items-center gap-3">
              <Clock size={16} className="text-onyx" />
              <p className="text-[10px] font-black uppercase tracking-widest">24h Processing Time</p>
            </BentoCard>
            <motion.button 
              whileTap={{ scale: 0.98 }}
              onClick={handleWithdraw}
              disabled={processing}
              className="w-full py-5 bg-onyx text-white rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] shadow-xl"
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
