"use client";

import { BottomNav } from "@/components/layout/BottomNav";
import { BentoCard } from "@/components/ui/BentoCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { 
  ArrowDownLeft, 
  Plus, 
  Wallet as WalletIcon, 
  TrendingUp,
  Clock,
  CreditCard,
  Banknote,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

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

  const filteredTransactions = transactions.filter(tx => {
    if (txFilter === "All") return true;
    if (txFilter === "Deposits") return tx.type === "deposit";
    if (txFilter === "Withdrawals") return tx.type === "withdrawal";
    return true;
  });

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#1A1A1A] relative">
      <div className="unified-bg" />
      
      <main className="pb-[80px] relative z-10">
        <section className="px-4 pt-6 pb-4">
          <p className="text-[12px] font-bold text-[#6B7280] uppercase tracking-wide mb-2">
            Financial Hub
          </p>
          <h2 className="text-[32px] font-heading text-[#1A1A1A] leading-tight font-bold">
            WALLET
          </h2>
          <p className="text-[12px] font-bold text-[#6B7280] uppercase tracking-wide mt-1">
            Manage Winnings
          </p>
        </section>

        <div className="px-4 space-y-4">
          <BentoCard variant="vibrant" className="p-6 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-[10px] font-bold text-[#1A1A1A]/60 uppercase tracking-wide mb-2">Available Balance</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg text-[#1A1A1A]/60 font-bold">₹</span>
                    <h2 className="text-[36px] font-heading text-[#1A1A1A] leading-none font-bold">
                      {(wallet?.balance || 0).toLocaleString()}
                    </h2>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#1A1A1A] flex items-center justify-center shadow-lg">
                  <WalletIcon size={22} className="text-[#5FD3BC]" />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-4 border-t border-[#1A1A1A]/10">
                <div>
                  <p className="text-[9px] font-bold text-[#1A1A1A]/60 uppercase tracking-wide mb-1">Lifetime Earnings</p>
                  <p className="text-base font-heading text-[#1A1A1A] font-bold">₹{(wallet?.lifetime_earnings || 0).toLocaleString()}</p>
                </div>
                <div className="h-6 w-px bg-[#1A1A1A]/10" />
                <div>
                  <p className="text-[9px] font-bold text-[#1A1A1A]/60 uppercase tracking-wide mb-1">Pending</p>
                  <p className="text-base font-heading text-[#1A1A1A]/60 font-bold">₹{(wallet?.pending_withdrawals || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div className="absolute right-[-20px] bottom-[-20px] scale-[1.5] opacity-5 pointer-events-none">
              <Banknote size={100} />
            </div>
          </BentoCard>

          <div className="grid grid-cols-2 gap-3">
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsDepositOpen(true)}
              className="bg-[#1A1A1A] text-white rounded-lg py-6 flex flex-col items-center gap-2 shadow-lg"
            >
              <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                <Plus size={24} strokeWidth={3} className="text-[#5FD3BC]" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wide">Add Funds</span>
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsWithdrawOpen(true)}
              className="bg-white text-[#1A1A1A] rounded-lg py-6 flex flex-col items-center gap-2 shadow-[2px_8px_16px_rgba(0,0,0,0.06)]"
            >
              <div className="w-12 h-12 rounded-lg bg-[#F5F5F5] flex items-center justify-center">
                <ArrowDownLeft size={24} strokeWidth={3} className="text-[#1A1A1A]" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wide">Withdraw</span>
            </motion.button>
          </div>

          <BentoCard variant="pastel" pastelColor="lavender" className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-white/40 flex items-center justify-center">
                <CreditCard size={22} className="text-[#1A1A1A]" />
              </div>
              <div>
                <h4 className="font-heading text-[#1A1A1A] font-bold text-base">Bank & UPI</h4>
                <p className="text-[9px] font-bold text-[#1A1A1A]/60 uppercase tracking-wide mt-0.5">For Instant Withdrawals</p>
              </div>
            </div>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm"
            >
              <ChevronRight size={20} className="text-[#1A1A1A]" />
            </motion.button>
          </BentoCard>

          <section className="space-y-4 pt-2">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xl font-heading text-[#1A1A1A] font-bold">History</h3>
              <Link href="#" className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wide">See All</Link>
            </div>

            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              {["All", "Deposits", "Withdrawals"].map((f) => (
                <button
                  key={f}
                  onClick={() => setTxFilter(f)}
                  className={`px-5 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all touch-target ${
                    txFilter === f 
                      ? "bg-[#1A1A1A] text-white shadow-lg" 
                      : "bg-white text-[#6B7280] shadow-[2px_8px_16px_rgba(0,0,0,0.06)]"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

              <div className="space-y-3">
                {loading ? (
                  <LoadingScreen />
                ) : filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx, i) => (
                  <motion.div 
                    key={tx.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <BentoCard className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          ['deposit', 'prize'].includes(tx.type) ? 'bg-[#D1FAE5]' : 'bg-[#FEE2E2]'
                        }`}>
                          {tx.type === 'deposit' ? <Plus size={22} className="text-[#1A1A1A]" /> : 
                           tx.type === 'withdrawal' ? <ArrowDownLeft size={22} className="text-[#1A1A1A]" /> : 
                           <TrendingUp size={22} className="text-[#1A1A1A]" />}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#1A1A1A] capitalize leading-tight">{tx.description || tx.type}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wide flex items-center gap-1">
                              <Clock size={10} strokeWidth={3} /> {new Date(tx.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>
                            <StatusBadge 
                              variant={tx.status === 'completed' ? 'completed' : tx.status === 'pending' ? 'pending' : 'failed'} 
                              className="text-[8px] px-2 py-0.5"
                            />
                          </div>
                        </div>
                      </div>
                      <p className={`text-lg font-heading font-bold ${
                        ['deposit', 'prize'].includes(tx.type) ? 'text-[#1A1A1A]' : 'text-[#6B7280]'
                      }`}>
                        {['deposit', 'prize'].includes(tx.type) ? '+' : '-'}₹{tx.amount}
                      </p>
                    </BentoCard>
                  </motion.div>
                ))
              ) : (
                <div className="py-16 text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Banknote size={28} className="text-[#9CA3AF]" />
                  </div>
                  <h3 className="text-lg font-heading text-[#1A1A1A] font-bold">No Transactions</h3>
                  <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wide mt-1">History is currently clear</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
        <DialogContent className="p-0 border-none bg-white rounded-t-2xl sm:rounded-2xl overflow-hidden max-w-[100vw] sm:max-w-[400px] shadow-2xl fixed bottom-0 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 left-0 right-0 sm:left-1/2 sm:-translate-x-1/2 m-0">
          <div className="bg-[#5FD3BC] p-8 relative">
            <DialogTitle className="text-[28px] font-heading text-[#1A1A1A] leading-none font-bold mb-2">Deposit</DialogTitle>
            <DialogDescription className="text-[#1A1A1A]/60 text-[10px] font-bold uppercase tracking-wide">Fuel your arena journey</DialogDescription>
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wide ml-1">Enter Amount (₹)</label>
              <Input 
                type="number" 
                placeholder="0" 
                className="h-16 rounded-lg border border-[#E5E7EB] bg-white text-2xl font-heading font-bold px-6 focus:border-[#5FD3BC] focus:ring-2 focus:ring-[#5FD3BC]/20 text-[#1A1A1A] placeholder:text-[#9CA3AF]"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[100, 200, 500, 1000].map(amt => (
                <motion.button
                  key={amt}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setDepositAmount(String(amt))}
                  className={`py-3 rounded-lg text-[11px] font-bold uppercase tracking-wide transition-all ${
                    depositAmount === String(amt) 
                      ? 'bg-[#1A1A1A] text-white shadow-lg' 
                      : 'bg-[#F5F5F5] text-[#1A1A1A] border border-[#E5E7EB]'
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
              className="w-full h-14 bg-[#5FD3BC] text-[#1A1A1A] rounded-lg text-[12px] font-bold uppercase tracking-wide shadow-lg flex items-center justify-center gap-2 disabled:bg-[#D1D5DB]"
            >
              {processing ? <Loader2 className="w-6 h-6 animate-spin" /> : "Confirm Deposit"}
            </motion.button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
        <DialogContent className="p-0 border-none bg-white rounded-t-2xl sm:rounded-2xl overflow-hidden max-w-[100vw] sm:max-w-[400px] shadow-2xl fixed bottom-0 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 left-0 right-0 sm:left-1/2 sm:-translate-x-1/2 m-0">
          <div className="bg-[#F5F5F5] p-8 relative">
            <DialogTitle className="text-[28px] font-heading text-[#1A1A1A] leading-none font-bold mb-2">Withdraw</DialogTitle>
            <DialogDescription className="text-[#6B7280] text-[10px] font-bold uppercase tracking-wide">Claim your spoils of war</DialogDescription>
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wide ml-1">Withdraw Amount (₹)</label>
              <Input 
                type="number" 
                placeholder="Min ₹100" 
                className="h-16 rounded-lg border border-[#E5E7EB] bg-white text-2xl font-heading font-bold px-6 focus:border-[#5FD3BC] focus:ring-2 focus:ring-[#5FD3BC]/20 text-[#1A1A1A] placeholder:text-[#9CA3AF]"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
            </div>
            <div className="bg-[#FFEDD5] rounded-lg p-4 flex items-center gap-3">
              <Clock size={20} strokeWidth={3} className="text-[#1A1A1A]" />
              <p className="text-[10px] text-[#1A1A1A] font-bold uppercase tracking-wide leading-relaxed">Processing time: 24 hours to your linked bank account.</p>
            </div>
            <motion.button 
              whileTap={{ scale: 0.98 }}
              onClick={handleWithdraw}
              disabled={processing}
              className="w-full h-14 bg-[#1A1A1A] text-white rounded-lg text-[12px] font-bold uppercase tracking-wide shadow-lg flex items-center justify-center gap-2 disabled:bg-[#D1D5DB]"
            >
              {processing ? <Loader2 className="w-6 h-6 animate-spin" /> : "Request Payout"}
            </motion.button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
