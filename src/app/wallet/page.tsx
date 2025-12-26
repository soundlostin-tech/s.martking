"use client";

import { BottomNav } from "@/components/layout/BottomNav";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  Plus, 
  Loader2, 
  Wallet as WalletIcon, 
  Banknote, 
  CreditCard,
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
  
  const [activeType, setActiveType] = useState("All");
  const [activeStatus, setActiveStatus] = useState("All");

  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  
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
      const { data: walletData, error: walletError } = await supabase
        .from("wallets")
        .select("*")
        .eq("id", user!.id)
        .single();
      
      if (walletError) throw walletError;
      setWallet(walletData);

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
    if (!amount || amount < 100) {
      toast.error(`Minimum withdrawal is ₹100`);
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
        description: `Withdrawal via ${payoutMethod.toUpperCase()}`,
        metadata: { payout_method: payoutMethod }
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-foreground" />
      </div>
    );
  }

    return (
    <main className="min-h-screen pb-32 bg-background relative overflow-x-hidden">
      <div className="mesh-bg">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] animate-blob [animation-delay:2s]" />
      </div>

      <div className="px-6 pt-24 relative z-10 space-y-8 max-w-2xl mx-auto">
        {/* Wallet Summary Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/60 backdrop-blur-xl border border-primary/10 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden"
        >
          <div className="relative z-10 space-y-8">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-primary/40 uppercase tracking-[0.2em] mb-2">Available Balance</p>
                <h2 className="text-5xl md:text-6xl font-heading text-primary tracking-tighter flex items-center gap-2">
                  <span className="text-3xl text-primary/30">₹</span>
                  {(wallet?.balance || 0).toLocaleString()}
                </h2>
              </div>
              <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center shadow-xl">
                <WalletIcon size={28} />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-primary/5">
              <div className="space-y-1">
                <p className="text-[10px] text-primary/40 font-bold uppercase tracking-wider">Earnings</p>
                <p className="font-heading text-2xl text-foreground">₹{(wallet?.lifetime_earnings || 0).toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-primary/40 font-bold uppercase tracking-wider">Pending</p>
                <p className="font-heading text-2xl text-foreground/40 italic">₹{(wallet?.pending_withdrawals || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
            {/* Subtle background details inside card */}
            <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] bg-primary/10 blur-[80px] rounded-full" />
          </motion.div>
    
          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button 
              className="h-20 flex items-center justify-center gap-3 bg-white/60 backdrop-blur-xl border border-primary/10 rounded-full font-serif text-lg text-primary shadow-xl hover:bg-white/80 transition-all active:scale-95"
              onClick={() => setIsDepositOpen(true)}
            >
              <Plus size={20} />
              Add Funds
            </button>
            <button 
              className="h-20 flex items-center justify-center gap-3 bg-primary text-white rounded-full font-serif text-lg shadow-xl hover:bg-primary/90 transition-all active:scale-95"
              onClick={() => setIsWithdrawOpen(true)}
            >
              <ArrowDownLeft size={20} />
              Withdraw
            </button>
          </div>
  
        {/* Transaction History Section */}
        <div className="space-y-6">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-2xl font-heading text-foreground">Ledger</h3>
            <div className="flex gap-2">
              <Select value={activeType} onValueChange={setActiveType}>
                <SelectTrigger className="w-[120px] h-10 text-[10px] font-bold rounded-full border-primary/10 bg-white/60 backdrop-blur-xl shadow-lg">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  {txTypes.map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
  
          <div className="space-y-4">
            {loading ? (
              <div className="py-20 flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary/30" />
                <p className="text-xs text-muted-foreground font-serif italic">Updating records...</p>
              </div>
            ) : transactions.length > 0 ? (
              <AnimatePresence mode="popLayout">
                {transactions.map((tx, i) => (
                  <motion.div 
                    key={tx.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white/60 backdrop-blur-xl rounded-[2rem] p-5 flex justify-between items-center border border-primary/5 shadow-xl group hover:shadow-2xl transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        tx.type === 'deposit' || tx.type === 'prize' ? 'bg-primary/5 text-primary' : 'bg-muted/50 text-muted-foreground'
                      }`}>
                        {tx.type === 'deposit' ? <Plus size={20} /> : tx.type === 'withdrawal' ? <ArrowDownLeft size={20} /> : <Banknote size={20} />}
                      </div>
                      <div>
                        <h4 className="font-serif text-sm font-bold text-foreground capitalize leading-tight">{tx.description || tx.type}</h4>
                        <p className="text-[10px] text-foreground/30 font-bold uppercase tracking-wider mt-1">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-heading text-xl ${
                        tx.type === 'deposit' || tx.type === 'prize' ? 'text-primary' : 'text-foreground/40'
                      }`}>
                        {tx.type === 'deposit' || tx.type === 'prize' ? '+' : '-'}₹{Number(tx.amount).toLocaleString()}
                      </p>
                      <Badge className={`px-2 py-0 h-4 text-[8px] font-black uppercase ${
                        tx.status === 'completed' ? 'bg-primary/10 text-primary' : 'bg-muted/50 text-muted-foreground'
                      } border-none rounded-full`}>
                        {tx.status}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <div className="bg-white/60 backdrop-blur-xl p-16 rounded-[3rem] border border-primary/10 text-center space-y-4 shadow-xl">
                <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto text-primary/20">
                  <History size={36} />
                </div>
                <h3 className="text-lg font-heading text-foreground">No Records</h3>
              </div>
            )}
          </div>
        </div>
      </div>
  
      {/* Modals Styled Glassy */}
      <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
        <DialogContent className="rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden bg-white/90 backdrop-blur-xl max-w-[90vw] sm:max-w-[420px]">
          <div className="bg-primary p-10 text-white relative overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-3xl font-heading">Vault Recharge</DialogTitle>
              <DialogDescription className="text-white/60 font-serif italic">Fortify your balance with a quick recharge.</DialogDescription>
            </DialogHeader>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 blur-[40px] rounded-full" />
          </div>
          <div className="p-10 space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest ml-2">Amount (₹)</label>
              <Input 
                type="number" 
                placeholder="500" 
                className="h-20 px-8 rounded-[2rem] border-primary/10 bg-white/50 shadow-inner text-3xl font-heading text-primary focus:ring-primary"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
              />
            </div>
              <button 
                className="w-full h-20 bg-primary text-white rounded-full font-serif text-lg shadow-2xl hover:bg-primary/90 transition-all active:scale-95 flex items-center justify-center gap-3"
                onClick={handleDeposit}
                disabled={processing}
              >
                {processing ? <Loader2 className="w-6 h-6 animate-spin" /> : "Confirm Recharge"}
              </button>
          </div>
        </DialogContent>
      </Dialog>
  
      <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
        <DialogContent className="rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden bg-white/90 backdrop-blur-xl max-w-[90vw] sm:max-w-[420px]">
          <div className="bg-primary p-10 text-white relative overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-3xl font-heading">Secure Payout</DialogTitle>
              <DialogDescription className="text-white/60 font-serif italic">Transfer your dominance into real rewards.</DialogDescription>
            </DialogHeader>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 blur-[40px] rounded-full" />
          </div>
          <div className="p-10 space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest ml-2">Withdraw Amount</label>
              <Input 
                type="number" 
                placeholder="₹100 min" 
                className="h-20 px-8 rounded-[2rem] border-primary/10 bg-white/50 shadow-inner text-3xl font-heading text-primary focus:ring-primary"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
              <p className="text-[10px] text-foreground/40 text-center font-bold">Limit: ₹{(wallet?.balance || 0).toLocaleString()} available</p>
            </div>
              <button 
                className="w-full h-20 bg-primary text-white rounded-full font-serif text-lg shadow-2xl hover:bg-primary/90 transition-all active:scale-95 flex items-center justify-center gap-3"
                onClick={handleWithdraw}
                disabled={processing}
              >
                {processing ? <Loader2 className="w-6 h-6 animate-spin" /> : "Initiate Transfer"}
              </button>
          </div>
        </DialogContent>
      </Dialog>


      <BottomNav />
    </main>
  );
}
