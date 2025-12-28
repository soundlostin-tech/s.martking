"use client";

import { BottomNav } from "@/components/layout/BottomNav";
import { TopHeader } from "@/components/layout/TopHeader";
import { BentoCard } from "@/components/ui/BentoCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ChipGroup } from "@/components/ui/Chip";
import { 
  ArrowDownLeft, 
  Plus, 
  Loader2, 
  Wallet as WalletIcon, 
  TrendingUp,
  Clock,
  CreditCard,
  Banknote
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

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-[#D4D7DE] text-[#11130D]">
      <main className="pb-28 relative z-10">
        <TopHeader />

        {/* Pastel Blob Header */}
        <section className="relative px-4 sm:px-6 pt-6 pb-4 blob-header blob-header-lavender">
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-[#4A4B48] uppercase tracking-[0.2em] mb-1">
              Your Funds
            </p>
            <h2 className="text-2xl sm:text-3xl font-heading text-[#11130D]">
              <span className="text-[#868935]">Wallet</span>
            </h2>
          </div>
        </section>

        <div className="px-4 sm:px-6 pt-4 space-y-6">
          {/* Balance Hero Card */}
          <BentoCard variant="hero" pastelColor="lavender" className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-[10px] font-bold text-[#4A4B48] uppercase tracking-wide mb-1">Available Balance</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl text-[#868935]">₹</span>
                  <h2 className="text-4xl sm:text-5xl font-heading text-[#11130D]">
                    {(wallet?.balance || 0).toLocaleString()}
                  </h2>
                </div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#D7FD03] flex items-center justify-center shadow-lg shadow-[#D7FD03]/30">
                <WalletIcon size={24} className="text-[#11130D]" />
              </div>
            </div>

            <div className="flex items-center gap-6 pt-4 border-t border-[#C8C8C4]/30">
              <div>
                <p className="text-[9px] font-bold text-[#4A4B48] uppercase tracking-wide">Lifetime Earnings</p>
                <p className="text-lg font-heading text-[#11130D]">₹{(wallet?.lifetime_earnings || 0).toLocaleString()}</p>
              </div>
              <div className="h-8 w-px bg-[#C8C8C4]/30" />
              <div>
                <p className="text-[9px] font-bold text-[#4A4B48] uppercase tracking-wide">Pending</p>
                <p className="text-lg font-heading text-[#4A4B48]">₹{(wallet?.pending_withdrawals || 0).toLocaleString()}</p>
              </div>
            </div>
          </BentoCard>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsDepositOpen(true)}
              className="bg-[#D7FD03] text-[#11130D] rounded-[20px] py-5 flex flex-col items-center gap-3 shadow-lg shadow-[#D7FD03]/30"
            >
              <div className="w-12 h-12 rounded-xl bg-[#11130D]/10 flex items-center justify-center">
                <Plus size={24} strokeWidth={3} />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wide">Deposit</span>
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsWithdrawOpen(true)}
              className="bg-white text-[#11130D] rounded-[20px] py-5 flex flex-col items-center gap-3 border border-[#C8C8C4]/30 shadow-sm"
            >
              <div className="w-12 h-12 rounded-xl bg-[#E8E9EC] flex items-center justify-center">
                <ArrowDownLeft size={24} strokeWidth={3} className="text-[#868935]" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wide">Withdraw</span>
            </motion.button>
          </div>

          {/* Add Bank/UPI */}
          <BentoCard className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E8E9EC] flex items-center justify-center">
                <CreditCard size={18} className="text-[#868935]" />
              </div>
              <div>
                <p className="text-[12px] font-semibold text-[#11130D]">Add Bank / UPI</p>
                <p className="text-[10px] text-[#4A4B48]">For faster withdrawals</p>
              </div>
            </div>
            <motion.button 
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-[#E8E9EC] text-[#11130D] rounded-xl text-[10px] font-bold uppercase tracking-wide"
            >
              Setup
            </motion.button>
          </BentoCard>

          {/* Transactions */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-heading text-[#11130D]">Transactions</h3>
            </div>

            <ChipGroup 
              options={["All", "Deposits", "Withdrawals"]}
              selected={txFilter}
              onChange={setTxFilter}
            />

            <div className="space-y-3">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-[#868935]" />
                  <p className="text-[10px] text-[#4A4B48] font-bold uppercase tracking-wider">Loading...</p>
                </div>
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx, i) => (
                  <motion.div 
                    key={tx.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <BentoCard className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          ['deposit', 'prize'].includes(tx.type) ? 'bg-[#D7FD03]/20' : 'bg-[#E8E9EC]'
                        }`}>
                          {tx.type === 'deposit' ? <Plus size={18} className="text-[#868935]" /> : 
                           tx.type === 'withdrawal' ? <ArrowDownLeft size={18} className="text-[#4A4B48]" /> : 
                           <TrendingUp size={18} className="text-[#868935]" />}
                        </div>
                        <div>
                          <h4 className="text-[12px] font-semibold text-[#11130D] capitalize">{tx.description || tx.type}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px] text-[#4A4B48] flex items-center gap-1">
                              <Clock size={10} /> {new Date(tx.created_at).toLocaleDateString()}
                            </span>
                            <StatusBadge 
                              variant={tx.status === 'completed' ? 'completed' : tx.status === 'pending' ? 'pending' : 'failed'} 
                              className="text-[8px] px-2"
                            />
                          </div>
                        </div>
                      </div>
                      <p className={`text-base font-heading ${
                        ['deposit', 'prize'].includes(tx.type) ? 'text-[#868935]' : 'text-[#4A4B48]'
                      }`}>
                        {['deposit', 'prize'].includes(tx.type) ? '+' : '-'}₹{tx.amount}
                      </p>
                    </BentoCard>
                  </motion.div>
                ))
              ) : (
                <BentoCard className="p-8 text-center">
                  <Banknote size={32} className="text-[#C8C8C4] mx-auto mb-3" />
                  <p className="text-[11px] text-[#4A4B48] font-medium">No transactions yet</p>
                </BentoCard>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Deposit Modal */}
      <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
        <DialogContent className="p-0 border-none bg-white rounded-t-[28px] sm:rounded-[28px] overflow-hidden max-w-[100vw] sm:max-w-[400px] shadow-2xl fixed bottom-0 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 left-0 right-0 sm:left-1/2 sm:-translate-x-1/2 m-0">
          <div className="bg-gradient-to-br from-[#D7FD03] to-[#C7E323] p-6 relative">
            <DialogTitle className="text-2xl font-heading text-[#11130D] mb-1">Add Funds</DialogTitle>
            <DialogDescription className="text-[#11130D]/60 text-[11px] font-medium uppercase tracking-wide">Deposit money to your wallet</DialogDescription>
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#4A4B48] uppercase tracking-wider ml-1">Amount (₹)</label>
              <Input 
                type="number" 
                placeholder="Enter amount" 
                className="h-14 rounded-xl border border-[#C8C8C4]/30 bg-[#E8E9EC] text-xl font-heading px-5 focus-visible:ring-[#D7FD03] text-[#11130D] placeholder:text-[#4A4B48]/40"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {[100, 200, 500, 1000].map(amt => (
                <motion.button
                  key={amt}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDepositAmount(String(amt))}
                  className={`flex-1 py-2.5 rounded-xl text-[11px] font-bold ${
                    depositAmount === String(amt) 
                      ? 'bg-[#D7FD03] text-[#11130D]' 
                      : 'bg-[#E8E9EC] text-[#4A4B48]'
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
              className="w-full h-14 bg-[#D7FD03] text-[#11130D] rounded-xl text-[11px] font-bold uppercase tracking-wider shadow-lg shadow-[#D7FD03]/30"
            >
              {processing ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Add Funds"}
            </motion.button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Withdraw Modal */}
      <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
        <DialogContent className="p-0 border-none bg-white rounded-t-[28px] sm:rounded-[28px] overflow-hidden max-w-[100vw] sm:max-w-[400px] shadow-2xl fixed bottom-0 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 left-0 right-0 sm:left-1/2 sm:-translate-x-1/2 m-0">
          <div className="bg-[#E8E9EC] p-6 relative">
            <DialogTitle className="text-2xl font-heading text-[#11130D] mb-1">Withdraw</DialogTitle>
            <DialogDescription className="text-[#4A4B48] text-[11px] font-medium uppercase tracking-wide">Withdraw your winnings</DialogDescription>
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#4A4B48] uppercase tracking-wider ml-1">Amount (₹)</label>
              <Input 
                type="number" 
                placeholder="Min ₹100" 
                className="h-14 rounded-xl border border-[#C8C8C4]/30 bg-[#E8E9EC] text-xl font-heading px-5 focus-visible:ring-[#D7FD03] text-[#11130D] placeholder:text-[#4A4B48]/40"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
            </div>
            <div className="bg-[#F5E3C7]/50 rounded-xl p-3 flex items-center gap-2">
              <Clock size={14} className="text-[#7A5C00]" />
              <p className="text-[10px] text-[#7A5C00] font-medium">Processing time: 24 hours</p>
            </div>
            <motion.button 
              whileTap={{ scale: 0.98 }}
              onClick={handleWithdraw}
              disabled={processing}
              className="w-full h-14 bg-[#11130D] text-white rounded-xl text-[11px] font-bold uppercase tracking-wider shadow-lg"
            >
              {processing ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Request Withdrawal"}
            </motion.button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
