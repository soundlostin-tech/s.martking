"use client";

import { BottomNav } from "@/components/layout/BottomNav";
import { BentoCard } from "@/components/ui/BentoCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowDownLeft, 
  Plus, 
  Wallet as WalletIcon, 
  TrendingUp,
  Clock,
  CreditCard,
  Banknote,
  ChevronRight,
  Loader2,
  ArrowUpRight,
  Zap,
  Target
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useCallback, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useSearchParams } from "next/navigation";

function WalletContent() {
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
            id: user.id,
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const filteredTransactions = transactions.filter(tx => {
    if (txFilter === "All") return true;
    if (txFilter === "Deposits") return tx.type === "deposit";
    if (txFilter === "Withdrawals") return tx.type === "withdrawal";
    if (txFilter === "Pending") return tx.status === "pending";
    return true;
  });

  const searchParams = useSearchParams();
  useEffect(() => {
    const depositAmt = searchParams.get('deposit');
    if (depositAmt) {
      setDepositAmount(depositAmt);
      setIsDepositOpen(true);
    }
  }, [searchParams]);

  if (authLoading) return null;

  return (
      <div className="min-h-screen bg-[#F8F6F0] text-[#1A1A1A] relative">
        <main className="pb-20 relative z-10">
          <section className="px-4 pt-4 pb-3">
            <p className="text-[9px] font-black text-[#6B7280] uppercase tracking-widest mb-1">
              Financial Intelligence
            </p>
            <h2 className="text-2xl sm:text-3xl font-heading text-[#1A1A1A] leading-tight font-black tracking-tight">
              MY WALLET
            </h2>
          </section>

          <div className="px-4 space-y-4">
            <BentoCard variant="mint" size="default" className="relative overflow-hidden shadow-lg border-none">
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-[8px] font-black text-[#1A1A1A]/60 uppercase tracking-wide mb-1">Available Balance</p>
                    <h2 className="text-3xl sm:text-4xl font-heading text-[#1A1A1A] leading-none font-black tracking-tight">
                      {formatCurrency(wallet?.balance || 0)}
                    </h2>
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-[#1A1A1A] flex items-center justify-center shadow">
                    <WalletIcon size={20} className="text-[#6EBF8B]" strokeWidth={2.5} />
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-4 border-t border-[#1A1A1A]/5">
                  <div>
                    <p className="text-[8px] font-black text-[#1A1A1A]/60 uppercase tracking-wide mb-0.5">Lifetime</p>
                    <p className="text-base font-heading text-[#1A1A1A] font-black tracking-tight">₹{(wallet?.lifetime_earnings || 0).toLocaleString()}</p>
                  </div>
                  <div className="h-8 w-px bg-[#1A1A1A]/5" />
                  <div>
                    <p className="text-[8px] font-black text-[#1A1A1A]/60 uppercase tracking-wide mb-0.5">Pending</p>
                    <p className="text-base font-heading text-[#1A1A1A]/40 font-black tracking-tight">₹{(wallet?.pending_withdrawals || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute right-[-20px] bottom-[-20px] opacity-[0.03] pointer-events-none">
                <Banknote size={100} />
              </div>
            </BentoCard>

            <div className="grid grid-cols-2 gap-3">
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsDepositOpen(true)}
                className="bg-[#1A1A1A] text-white rounded-xl py-5 flex flex-col items-center gap-2 shadow-lg"
              >
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Plus size={20} strokeWidth={4} className="text-[#6EBF8B]" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-wide">Add Loot</span>
              </motion.button>
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsWithdrawOpen(true)}
                className="bg-white text-[#1A1A1A] rounded-xl py-5 flex flex-col items-center gap-2 shadow border border-[#E5E7EB]"
              >
                <div className="w-10 h-10 rounded-xl bg-[#F5F5F5] flex items-center justify-center">
                  <ArrowDownLeft size={20} strokeWidth={4} className="text-[#1A1A1A]" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-wide">Withdraw</span>
              </motion.button>
            </div>

            <BentoCard variant="blue" size="compact" className="flex items-center justify-between shadow border-none overflow-hidden relative group">
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-white/40 flex items-center justify-center">
                  <CreditCard size={20} className="text-[#1A1A1A]" strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="font-heading text-[#1A1A1A] font-black text-sm tracking-tight">Refuel Station</h4>
                  <p className="text-[8px] font-black text-[#1A1A1A]/60 uppercase tracking-wide mt-0.5">UPI & Bank Connect</p>
                </div>
              </div>
              <motion.button 
                whileTap={{ scale: 0.9 }}
                className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow"
              >
                <ChevronRight size={18} className="text-[#1A1A1A]" strokeWidth={3} />
              </motion.button>
            </BentoCard>

            <section className="space-y-4 pt-2">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-base font-heading text-[#1A1A1A] font-black tracking-tight">History</h3>
                <Link href="#" className="text-[8px] font-black text-[#6B7280] uppercase tracking-wide bg-white px-2.5 py-1 rounded-lg border border-[#E5E7EB]">All</Link>
              </div>

              <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-2">
                {["All", "Deposits", "Withdrawals"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setTxFilter(f)}
                    className={`px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-wide transition-all ${
                      txFilter === f 
                        ? "bg-[#1A1A1A] text-white shadow" 
                        : "bg-white text-[#6B7280] border border-[#E5E7EB]"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <div className="space-y-2.5">
                {loading ? (
                  <div className="space-y-2.5">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full rounded-xl" />
                    ))}
                  </div>
                ) : filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx, i) => {
                    const colors = ["mint", "blue", "pink", "yellow", "coral", "teal"];
                    const color = colors[i % colors.length] as any;
                    return (
                      <motion.div 
                        key={tx.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                      >
                        <BentoCard variant={color} size="compact" className="flex items-center justify-between border-none shadow group">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/40 flex items-center justify-center">
                              {tx.type === 'deposit' ? <Plus size={16} strokeWidth={3} className="text-[#1A1A1A]" /> : 
                               tx.type === 'withdrawal' ? <ArrowDownLeft size={16} strokeWidth={3} className="text-[#1A1A1A]" /> : 
                               <TrendingUp size={16} strokeWidth={3} className="text-[#1A1A1A]" />}
                            </div>
                            <div>
                              <h4 className="text-sm font-heading font-black text-[#1A1A1A] capitalize leading-tight mb-0.5 tracking-tight">{tx.description || tx.type}</h4>
                              <div className="flex items-center gap-2">
                                <span className="text-[8px] font-black text-[#1A1A1A]/60 uppercase tracking-wide flex items-center gap-1">
                                  <Clock size={10} strokeWidth={3} /> {new Date(tx.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                </span>
                                <StatusBadge 
                                  variant={tx.status === 'completed' ? 'completed' : tx.status === 'pending' ? 'pending' : 'failed'} 
                                  className="text-[7px] px-1.5 py-0.5 font-black uppercase tracking-wide"
                                />
                              </div>
                            </div>
                          </div>
                          <p className="text-lg font-heading font-black tracking-tight text-[#1A1A1A]">
                            {['deposit', 'prize'].includes(tx.type) ? '+' : '-'}₹{tx.amount}
                          </p>
                        </BentoCard>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="py-12 text-center bg-white rounded-2xl shadow border-none">
                    <div className="w-14 h-14 bg-[#F3F4F6] rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Banknote size={24} className="text-[#9CA3AF]" />
                    </div>
                    <h3 className="text-base font-heading text-[#1A1A1A] font-black tracking-tight mb-1">LEDGER VOID</h3>
                    <p className="text-[8px] font-black text-[#6B7280] uppercase tracking-wide">No transactions yet</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>

      <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
        <DialogContent className="p-0 border-none bg-white rounded-t-[40px] sm:rounded-[40px] overflow-hidden max-w-[100vw] sm:max-w-[420px] shadow-2xl fixed bottom-0 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 left-0 right-0 sm:left-1/2 sm:-translate-x-1/2 m-0 z-[100]">
          <div className="bg-[#6EBF8B] p-10 relative">
            <div className="w-16 h-16 rounded-[24px] bg-white flex items-center justify-center mb-6 shadow-xl rotate-6">
              <Plus size={32} className="text-[#1A1A1A]" strokeWidth={4} />
            </div>
            <DialogTitle className="text-4xl font-heading text-[#1A1A1A] leading-none font-black mb-3 tracking-tighter">ADD LOOT</DialogTitle>
            <DialogDescription className="text-[#1A1A1A]/60 text-[10px] font-black uppercase tracking-[0.2em]">Fuel your next victory</DialogDescription>
          </div>
          <div className="p-8 space-y-8">
            <div className="space-y-4">
              <label className="text-[11px] font-black text-[#6B7280] uppercase tracking-widest ml-1">AMOUNT TO LOAD (₹)</label>
              <div className="relative">
                <Input 
                  type="number" 
                  inputMode="numeric"
                  placeholder="0" 
                  className="h-20 rounded-[24px] border-4 border-[#F5F5F5] bg-white text-4xl font-heading font-black px-8 focus:border-[#6EBF8B] focus:ring-0 text-[#1A1A1A] placeholder:text-[#9CA3AF] shadow-inner transition-all"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2">
                   <Zap size={24} className="text-[#6EBF8B]" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[100, 200, 500, 1000].map(amt => (
                <motion.button
                  key={amt}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setDepositAmount(String(amt))}
                  className={`py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border-2 ${
                    depositAmount === String(amt) 
                      ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-xl' 
                      : 'bg-white text-[#1A1A1A] border-[#E5E7EB] hover:bg-[#F9FAFB]'
                  }`}
                >
                  ₹{amt}
                </motion.button>
              ))}
            </div>
            <motion.button 
              whileTap={{ scale: 0.98 }}
              onClick={handleDeposit}
              disabled={processing}
              className="w-full h-16 bg-[#1A1A1A] text-white rounded-[24px] text-sm font-black uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 disabled:bg-[#E5E7EB] transition-all"
            >
              {processing ? <Loader2 className="w-8 h-8 animate-spin" /> : "SECURE DEPOSIT"}
            </motion.button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
        <DialogContent className="p-0 border-none bg-white rounded-t-[40px] sm:rounded-[40px] overflow-hidden max-w-[100vw] sm:max-w-[420px] shadow-2xl fixed bottom-0 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 left-0 right-0 sm:left-1/2 sm:-translate-x-1/2 m-0 z-[100]">
          <div className="bg-[#FFD8B1] p-10 relative">
             <div className="w-16 h-16 rounded-[24px] bg-white flex items-center justify-center mb-6 shadow-xl -rotate-6">
              <ArrowDownLeft size={32} className="text-[#1A1A1A]" strokeWidth={4} />
            </div>
            <DialogTitle className="text-4xl font-heading text-[#1A1A1A] leading-none font-black mb-3 tracking-tighter">CLAIM SPOILS</DialogTitle>
            <DialogDescription className="text-[#1A1A1A]/60 text-[10px] font-black uppercase tracking-[0.2em]">Liquidate your winnings</DialogDescription>
          </div>
          <div className="p-8 space-y-8">
            <div className="space-y-4">
              <label className="text-[11px] font-black text-[#6B7280] uppercase tracking-widest ml-1">WITHDRAW AMOUNT (₹)</label>
              <div className="relative">
                <Input 
                  type="number" 
                  placeholder="Min ₹100" 
                  className="h-20 rounded-[24px] border-4 border-[#F5F5F5] bg-white text-4xl font-heading font-black px-8 focus:border-[#FFD8B1] focus:ring-0 text-[#1A1A1A] placeholder:text-[#9CA3AF] shadow-inner transition-all"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2">
                   <Banknote size={24} className="text-[#FFD8B1]" />
                </div>
              </div>
            </div>
            <div className="bg-[#FFF1E6] rounded-[24px] p-6 flex items-start gap-4 border-2 border-[#FFD8B1]/20">
              <Clock size={24} strokeWidth={3} className="text-[#1A1A1A] mt-1" />
              <p className="text-[11px] text-[#1A1A1A] font-black uppercase tracking-widest leading-relaxed">Intelligence Report: Payouts are processed within 24 hours to your linked UPI/Bank.</p>
            </div>
            <motion.button 
              whileTap={{ scale: 0.98 }}
              onClick={handleWithdraw}
              disabled={processing}
              className="w-full h-16 bg-[#1A1A1A] text-white rounded-[24px] text-sm font-black uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 disabled:bg-[#E5E7EB] transition-all"
            >
              {processing ? <Loader2 className="w-8 h-8 animate-spin" /> : "REQUEST PAYOUT"}
            </motion.button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}

export default function WalletPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <WalletContent />
    </Suspense>
  );
}
