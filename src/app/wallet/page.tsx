"use client";

import { HeroSection } from "@/components/layout/HeroSection";
import { BottomNav } from "@/components/layout/BottomNav";
import { PillButton } from "@/components/ui/PillButton";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  Plus, 
  Loader2, 
  Filter, 
  Wallet as WalletIcon, 
  Banknote, 
  CreditCard,
  X,
  CheckCircle2,
  AlertCircle,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const txTypes = ["All", "Prize", "Deposit", "Withdrawal", "Bonus", "Fee"];
const txStatuses = ["All", "Pending", "Completed", "Failed"];

export default function WalletPage() {
  const { user, loading: authLoading } = useAuth();
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  // Filters
  const [activeType, setActiveType] = useState("All");
  const [activeStatus, setActiveStatus] = useState("All");

  // Modals
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  
  // Forms
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("upi");

  useEffect(() => {
    if (user) {
      fetchWalletData();
    }
  }, [user, activeType, activeStatus]);

  const fetchWalletData = async () => {
    setLoading(true);
    try {
      // Fetch wallet
      const { data: walletData, error: walletError } = await supabase
        .from("wallets")
        .select("*")
        .eq("id", user!.id)
        .single();
      
      if (walletError) throw walletError;
      setWallet(walletData);

      // Fetch transactions
      let query = supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (activeType !== "All") {
        query = query.eq("type", activeType.toLowerCase());
      }
      if (activeStatus !== "All") {
        query = query.eq("status", activeStatus.toLowerCase());
      }

      const { data: txData, error: txError } = await query;
      if (txError) throw txError;
      setTransactions(txData || []);
    } catch (error) {
      console.error("Error fetching wallet data:", error);
      toast.error("Failed to sync wallet data");
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
      // Create transaction
      const { error: txError } = await supabase.from("transactions").insert({
        user_id: user!.id,
        amount,
        type: "deposit",
        status: "completed",
        description: "Wallet Recharge",
      });

      if (txError) throw txError;

      // Update wallet balance
      const { error: walletError } = await supabase
        .from("wallets")
        .update({ 
          balance: Number(wallet?.balance || 0) + amount, 
          updated_at: new Date().toISOString() 
        })
        .eq("id", user!.id);
      
      if (walletError) throw walletError;

      toast.success(`₹${amount} added successfully!`);
      setIsDepositOpen(false);
      setDepositAmount("");
      fetchWalletData();
    } catch (error: any) {
      toast.error(error.message || "Failed to process deposit");
    } finally {
      setProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = Number(withdrawAmount);
    const minWithdrawal = 100;
    const maxWithdrawal = 10000;

    if (!amount || amount < minWithdrawal) {
      toast.error(`Minimum withdrawal is ₹${minWithdrawal}`);
      return;
    }
    if (amount > maxWithdrawal) {
      toast.error(`Maximum withdrawal is ₹${maxWithdrawal}`);
      return;
    }
    if (amount > (wallet?.balance || 0)) {
      toast.error("Insufficient balance");
      return;
    }

    setProcessing(true);
    try {
      // Create pending transaction
      const { error: txError } = await supabase.from("transactions").insert({
        user_id: user!.id,
        amount,
        type: "withdrawal",
        status: "pending",
        description: `Withdrawal via ${payoutMethod.toUpperCase()}`,
        metadata: { payout_method: payoutMethod }
      });

      if (txError) throw txError;

      // Update wallet balance and pending withdrawals
      const { error: walletError } = await supabase
        .from("wallets")
        .update({ 
          balance: Number(wallet?.balance || 0) - amount,
          pending_withdrawals: Number(wallet?.pending_withdrawals || 0) + amount,
          updated_at: new Date().toISOString() 
        })
        .eq("id", user!.id);
      
      if (walletError) throw walletError;

      toast.success(`Withdrawal request for ₹${amount} submitted!`);
      setIsWithdrawOpen(false);
      setWithdrawAmount("");
      fetchWalletData();
    } catch (error: any) {
      toast.error(error.message || "Failed to process withdrawal");
    } finally {
      setProcessing(false);
    }
  };

  const getTxIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <Plus size={18} />;
      case 'withdrawal': return <ArrowDownLeft size={18} />;
      case 'prize': return <Banknote size={18} />;
      case 'bonus': return <CheckCircle2 size={18} />;
      default: return <History size={18} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-600';
      case 'pending': return 'bg-amber-100 text-amber-600';
      case 'failed': return 'bg-red-100 text-red-600';
      default: return 'bg-stone-100 text-stone-500';
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="w-8 h-8 animate-spin text-lemon-lime" />
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-32 bg-stone-50">
      <HeroSection 
        title="My Wallet" 
        subtitle="Manage your earnings and secure payouts."
        className="mx-0 rounded-none pb-24"
      />

      <div className="px-6 -mt-16 relative z-10 space-y-8">
        {/* Wallet Summary Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-onyx rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden border border-white/5"
        >
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[10px] font-bold opacity-40 uppercase tracking-[0.2em] mb-1">Available Balance</p>
                <h2 className="text-5xl font-heading tracking-tight">₹{(wallet?.balance || 0).toLocaleString()}</h2>
              </div>
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <WalletIcon size={24} className="text-lime-yellow" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/10">
              <div className="space-y-1">
                <p className="text-[10px] opacity-40 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Plus size={10} className="text-green-400" /> Lifetime Earnings
                </p>
                <p className="font-heading text-xl">₹{(wallet?.lifetime_earnings || 0).toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] opacity-40 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Loader2 size={10} className="text-amber-400" /> Pending Payouts
                </p>
                <p className="font-heading text-xl text-amber-400">₹{(wallet?.pending_withdrawals || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-lime-yellow/10 blur-[100px] rounded-full" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-onyx-light/50 blur-[80px] rounded-full" />
        </motion.div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <PillButton 
            className="h-16 flex items-center justify-center gap-3 bg-white text-onyx border-stone-200 shadow-sm hover:shadow-md transition-all active:scale-95"
            onClick={() => setIsDepositOpen(true)}
          >
            <div className="w-8 h-8 rounded-full bg-onyx text-white flex items-center justify-center">
              <Plus size={18} />
            </div>
            <span className="font-bold text-sm">Add Funds</span>
          </PillButton>
          <PillButton 
            className="h-16 flex items-center justify-center gap-3 shadow-lg shadow-lime-yellow/20 active:scale-95"
            onClick={() => setIsWithdrawOpen(true)}
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <ArrowDownLeft size={18} />
            </div>
            <span className="font-bold text-sm text-white">Withdraw</span>
          </PillButton>
        </div>

        {/* Transaction History Section */}
        <div className="space-y-6">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-heading text-onyx">Transaction History</h3>
              <div className="flex gap-2">
                <Select value={activeType} onValueChange={setActiveType}>
                  <SelectTrigger className="w-[100px] h-9 text-[10px] font-bold rounded-xl border-stone-200 bg-white">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {txTypes.map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={activeStatus} onValueChange={setActiveStatus}>
                  <SelectTrigger className="w-[110px] h-9 text-[10px] font-bold rounded-xl border-stone-200 bg-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {txStatuses.map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="py-20 flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-stone-200" />
                <p className="text-xs text-stone-400 font-medium">Syncing transactions...</p>
              </div>
            ) : transactions.length > 0 ? (
              <AnimatePresence mode="popLayout">
                {transactions.map((tx, i) => (
                  <motion.div 
                    key={tx.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-[24px] p-4 flex justify-between items-center border border-stone-100 shadow-sm group hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        tx.type === 'deposit' || tx.type === 'prize' ? 'bg-green-50 text-green-600' : 'bg-stone-50 text-stone-400'
                      }`}>
                        {getTxIcon(tx.type)}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-onyx capitalize leading-tight">{tx.description || tx.type}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-[10px] text-stone-400 font-medium">
                            {new Date(tx.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <span className="w-1 h-1 bg-stone-200 rounded-full" />
                          <Badge className={`px-2 py-0 h-4 text-[8px] font-black uppercase tracking-tighter ${getStatusColor(tx.status)} border-none`}>
                            {tx.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-heading text-lg ${
                        tx.type === 'deposit' || tx.type === 'prize' ? 'text-green-600' : 'text-onyx'
                      }`}>
                        {tx.type === 'deposit' || tx.type === 'prize' ? '+' : '-'}₹{Number(tx.amount).toLocaleString()}
                      </p>
                      <button className="text-[10px] font-bold text-stone-300 group-hover:text-onyx transition-colors flex items-center gap-1 ml-auto">
                        Details <ChevronRight size={10} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <div className="bg-white p-12 rounded-[32px] border border-dashed border-stone-200 text-center space-y-4">
                <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto text-stone-200">
                  <History size={32} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-onyx">No records found</h3>
                  <p className="text-[11px] text-stone-400 mt-1">Transactions will appear here once processed.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Deposit Modal */}
      <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
        <DialogContent className="rounded-[32px] border-none shadow-2xl p-0 overflow-hidden bg-stone-50 max-w-[90vw] sm:max-w-[400px]">
          <div className="bg-onyx p-8 text-white relative">
            <DialogHeader>
              <DialogTitle className="text-2xl font-heading">Add Funds</DialogTitle>
              <DialogDescription className="text-white/40 text-xs">Instantly recharge your arena wallet.</DialogDescription>
            </DialogHeader>
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-lime-yellow/20 blur-[60px] rounded-full" />
          </div>
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Enter Amount (₹)</label>
              <div className="relative">
                <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                <Input 
                  type="number" 
                  placeholder="e.g. 500" 
                  className="h-16 pl-12 rounded-2xl border-stone-200 bg-white text-xl font-heading focus:ring-lime-yellow"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                />
              </div>
              <div className="flex gap-2 pt-2 overflow-x-auto no-scrollbar pb-2">
                {[100, 200, 500, 1000].map(val => (
                  <button 
                    key={val}
                    onClick={() => setDepositAmount(val.toString())}
                    className="px-4 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-600 hover:border-lime-yellow hover:text-onyx transition-all active:scale-95"
                  >
                    +₹{val}
                  </button>
                ))}
              </div>
            </div>

            <PillButton 
              className="w-full h-16 shadow-lg shadow-lime-yellow/20"
              onClick={handleDeposit}
              disabled={processing}
            >
              {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm & Recharge"}
            </PillButton>
          </div>
        </DialogContent>
      </Dialog>

      {/* Withdraw Modal */}
      <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
        <DialogContent className="rounded-[32px] border-none shadow-2xl p-0 overflow-hidden bg-stone-50 max-w-[90vw] sm:max-w-[400px]">
          <div className="bg-onyx p-8 text-white relative">
            <DialogHeader>
              <DialogTitle className="text-2xl font-heading">Withdraw</DialogTitle>
              <DialogDescription className="text-white/40 text-xs">Transfer your earnings to your bank/UPI.</DialogDescription>
            </DialogHeader>
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-400/10 blur-[60px] rounded-full" />
          </div>
          <div className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Amount to Withdraw</label>
                <div className="relative">
                  <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                  <Input 
                    type="number" 
                    placeholder="Min ₹100" 
                    className="h-16 pl-12 rounded-2xl border-stone-200 bg-white text-xl font-heading"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                  />
                </div>
                <p className="text-[10px] text-stone-400 text-right font-medium">Available: ₹{(wallet?.balance || 0).toLocaleString()}</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Payout Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setPayoutMethod("upi")}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                      payoutMethod === 'upi' ? 'border-lime-yellow bg-lime-yellow/5' : 'border-stone-100 bg-white'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${payoutMethod === 'upi' ? 'bg-onyx text-white' : 'bg-stone-50 text-stone-400'}`}>
                      <CreditCard size={16} />
                    </div>
                    <span className="text-[10px] font-black uppercase">UPI ID</span>
                  </button>
                  <button 
                    onClick={() => setPayoutMethod("bank")}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                      payoutMethod === 'bank' ? 'border-lime-yellow bg-lime-yellow/5' : 'border-stone-100 bg-white'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${payoutMethod === 'bank' ? 'bg-onyx text-white' : 'bg-stone-50 text-stone-400'}`}>
                      <Banknote size={16} />
                    </div>
                    <span className="text-[10px] font-black uppercase">Bank A/C</span>
                  </button>
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                <AlertCircle className="text-amber-500 mt-0.5" size={16} />
                <p className="text-[10px] text-amber-700 leading-relaxed font-medium">
                  Withdrawals are processed within 24-48 hours. Ensure your payment details are correct in profile settings.
                </p>
              </div>
            </div>

            <PillButton 
              className="w-full h-16 shadow-lg shadow-lime-yellow/20"
              onClick={handleWithdraw}
              disabled={processing}
            >
              {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Request Withdrawal"}
            </PillButton>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </main>
  );
}
