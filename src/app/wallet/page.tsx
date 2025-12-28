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
    <div className="min-h-screen bg-background text-onyx">
      <main className="pb-32 relative z-10">
        <TopHeader />

        {/* Header Section */}
        <section className="relative px-6 pt-10 pb-6">
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-charcoal/50 uppercase tracking-[0.2em] mb-2">
              Financial Hub
            </p>
            <h2 className="text-[32px] font-heading text-onyx leading-tight font-black">
              Your <br />
              <span className="text-onyx">Wallet</span>
            </h2>
          </div>
        </section>

        <div className="px-6 space-y-6">
          {/* Balance Hero Card */}
          <BentoCard variant="vibrant" className="p-8">
            <div className="flex items-start justify-between mb-8">
              <div>
                <p className="text-[10px] font-bold text-onyx/40 uppercase tracking-[0.2em] mb-2">Available Balance</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl text-onyx/40 font-black">₹</span>
                  <h2 className="text-[44px] font-heading text-onyx leading-none font-black">
                    {(wallet?.balance || 0).toLocaleString()}
                  </h2>
                </div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-onyx flex items-center justify-center shadow-xl shadow-onyx/10">
                <WalletIcon size={24} className="text-lime-vibrant" />
              </div>
            </div>

            <div className="flex items-center gap-8 pt-6 border-t border-onyx/10">
              <div>
                <p className="text-[9px] font-bold text-onyx/40 uppercase tracking-widest mb-1">Lifetime Earnings</p>
                <p className="text-lg font-heading text-onyx font-black">₹{(wallet?.lifetime_earnings || 0).toLocaleString()}</p>
              </div>
              <div className="h-8 w-px bg-onyx/10" />
              <div>
                <p className="text-[9px] font-bold text-onyx/40 uppercase tracking-widest mb-1">Pending</p>
                <p className="text-lg font-heading text-onyx/40 font-black">₹{(wallet?.pending_withdrawals || 0).toLocaleString()}</p>
              </div>
            </div>
          </BentoCard>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsDepositOpen(true)}
              className="bg-onyx text-white rounded-[28px] py-6 flex flex-col items-center gap-3 shadow-xl shadow-onyx/10"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                <Plus size={24} strokeWidth={3} className="text-lime-vibrant" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest">Deposit</span>
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsWithdrawOpen(true)}
              className="bg-white text-onyx rounded-[28px] py-6 flex flex-col items-center gap-3 border border-black/5 shadow-sm"
            >
              <div className="w-12 h-12 rounded-2xl bg-off-white flex items-center justify-center">
                <ArrowDownLeft size={24} strokeWidth={3} className="text-onyx" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest">Withdraw</span>
            </motion.button>
          </div>

          {/* Add Bank/UPI */}
          <BentoCard className="p-5 flex items-center justify-between border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-pastel-lavender flex items-center justify-center">
                <CreditCard size={20} className="text-onyx" />
              </div>
              <div>
                <p className="text-sm font-black text-onyx">Add Bank / UPI</p>
                <p className="text-[10px] font-bold text-charcoal/40 uppercase tracking-wider">For faster withdrawals</p>
              </div>
            </div>
            <motion.button 
              whileTap={{ scale: 0.95 }}
              className="px-5 py-2.5 bg-off-white text-onyx rounded-xl text-[10px] font-bold uppercase tracking-widest"
            >
              Setup
            </motion.button>
          </BentoCard>

          {/* Transactions */}
          <section className="space-y-6">
            <div className="flex items-center justify-between pt-4">
              <h3 className="text-xl font-heading text-onyx font-black">History</h3>
            </div>

            <ChipGroup 
              options={["All", "Deposits", "Withdrawals"]}
              selected={txFilter}
              onChange={setTxFilter}
            />

            <div className="space-y-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="w-10 h-10 animate-spin text-onyx/20" />
                  <p className="text-[10px] text-charcoal/40 font-bold uppercase tracking-widest">Scanning History...</p>
                </div>
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx, i) => (
                  <motion.div 
                    key={tx.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <BentoCard className="p-5 flex items-center justify-between border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                          ['deposit', 'prize'].includes(tx.type) ? 'bg-pastel-mint' : 'bg-pastel-coral'
                        }`}>
                          {tx.type === 'deposit' ? <Plus size={20} className="text-onyx" /> : 
                           tx.type === 'withdrawal' ? <ArrowDownLeft size={20} className="text-onyx" /> : 
                           <TrendingUp size={20} className="text-onyx" />}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-onyx capitalize">{tx.description || tx.type}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest flex items-center gap-1">
                              <Clock size={10} /> {new Date(tx.created_at).toLocaleDateString()}
                            </span>
                            <StatusBadge 
                              variant={tx.status === 'completed' ? 'completed' : tx.status === 'pending' ? 'pending' : 'failed'} 
                              className="text-[8px] px-2 py-0.5"
                            />
                          </div>
                        </div>
                      </div>
                      <p className={`text-xl font-heading font-black ${
                        ['deposit', 'prize'].includes(tx.type) ? 'text-onyx' : 'text-charcoal/40'
                      }`}>
                        {['deposit', 'prize'].includes(tx.type) ? '+' : '-'}₹{tx.amount}
                      </p>
                    </BentoCard>
                  </motion.div>
                ))
              ) : (
                <BentoCard className="p-16 text-center border-none bg-white shadow-sm">
                  <Banknote size={40} className="text-charcoal/10 mx-auto mb-4" />
                  <p className="text-[10px] text-charcoal/40 font-bold uppercase tracking-widest">No transactions discovered</p>
                </BentoCard>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Deposit Modal */}
      <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
        <DialogContent className="p-0 border-none bg-white rounded-t-[32px] sm:rounded-[32px] overflow-hidden max-w-[100vw] sm:max-w-[400px] shadow-2xl fixed bottom-0 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 left-0 right-0 sm:left-1/2 sm:-translate-x-1/2 m-0">
          <div className="bg-lime-vibrant p-8 relative">
            <DialogTitle className="text-[32px] font-heading text-onyx leading-none font-black mb-1">Add Funds</DialogTitle>
            <DialogDescription className="text-onyx/40 text-[10px] font-bold uppercase tracking-[0.2em]">Fuel your arena journey</DialogDescription>
          </div>
          <div className="p-8 space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-charcoal/40 uppercase tracking-[0.2em] ml-1">Deposit Amount (₹)</label>
              <Input 
                type="number" 
                placeholder="Enter amount" 
                className="h-16 rounded-2xl border border-black/5 bg-background text-2xl font-heading font-black px-6 focus-visible:ring-onyx text-onyx placeholder:text-charcoal/20"
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
                  className={`flex-1 py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-colors ${
                    depositAmount === String(amt) 
                      ? 'bg-onyx text-white' 
                      : 'bg-background text-onyx'
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
              className="w-full h-16 bg-onyx text-white rounded-2xl text-[12px] font-bold uppercase tracking-[0.2em] shadow-xl shadow-onyx/10"
            >
              {processing ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : "Confirm Deposit"}
            </motion.button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Withdraw Modal */}
      <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
        <DialogContent className="p-0 border-none bg-white rounded-t-[32px] sm:rounded-[32px] overflow-hidden max-w-[100vw] sm:max-w-[400px] shadow-2xl fixed bottom-0 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 left-0 right-0 sm:left-1/2 sm:-translate-x-1/2 m-0">
          <div className="bg-background p-8 relative">
            <DialogTitle className="text-[32px] font-heading text-onyx leading-none font-black mb-1">Withdraw</DialogTitle>
            <DialogDescription className="text-charcoal/40 text-[10px] font-bold uppercase tracking-[0.2em]">Claim your spoils of war</DialogDescription>
          </div>
          <div className="p-8 space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-charcoal/40 uppercase tracking-[0.2em] ml-1">Withdraw Amount (₹)</label>
              <Input 
                type="number" 
                placeholder="Min ₹100" 
                className="h-16 rounded-2xl border border-black/5 bg-background text-2xl font-heading font-black px-6 focus-visible:ring-onyx text-onyx placeholder:text-charcoal/20"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
            </div>
            <div className="bg-pastel-peach/30 rounded-2xl p-4 flex items-center gap-3">
              <Clock size={16} className="text-onyx" />
              <p className="text-[10px] text-onyx font-bold uppercase tracking-widest">Processing time: 24 hours</p>
            </div>
            <motion.button 
              whileTap={{ scale: 0.98 }}
              onClick={handleWithdraw}
              disabled={processing}
              className="w-full h-16 bg-onyx text-white rounded-2xl text-[12px] font-bold uppercase tracking-[0.2em] shadow-xl shadow-onyx/10"
            >
              {processing ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : "Request Withdrawal"}
            </motion.button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}

      <BottomNav />
    </div>
  );
}
