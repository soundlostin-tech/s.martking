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
  Zap,
  IndianRupee,
  Activity,
  ShieldCheck,
  AlertCircle,
  Clock
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
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
        .single();
      
      if (walletError) throw walletError;
      setWallet(walletData);

      const { data: txData, error: txError } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (txError) throw txError;
      setTransactions(txData || []);
    } catch (error) {
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

      toast.success(`₹${amount} added to your arena balance!`);
      setIsDepositOpen(false);
      setDepositAmount("");
      fetchWalletData();
    } catch (error: any) {
      toast.error("Failed to process deployment funds");
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
      toast.error("Insufficient arena balance");
      return;
    }

    setProcessing(true);
    try {
      const { error: txError } = await supabase.from("transactions").insert({
        user_id: user!.id,
        amount,
        type: "withdrawal",
        status: "pending",
        description: `Funds Extraction Request`,
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

      toast.success(`Withdrawal requested. System audit in progress.`);
      setIsWithdrawOpen(false);
      setWithdrawAmount("");
      fetchWalletData();
    } catch (error: any) {
      toast.error("Extraction protocol failure");
    } finally {
      setProcessing(false);
    }
  };

  if (authLoading) return null;

    return (
      <div className="min-h-screen bg-background text-foreground">
        <main className="pb-32 relative z-10">
          <TopHeader />
  
          <div className="px-6 pt-8 space-y-10 max-w-2xl mx-auto">
            {/* Main Balance Card - Premium Aesthetic */}
            <section>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative h-64 rounded-[40px] premium-gradient overflow-hidden shadow-2xl shadow-evergreen-900/20 p-10 flex flex-col justify-between group"
              >
                <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
                  <WalletIcon size={160} className="text-white" strokeWidth={1} />
                </div>
                
                <div className="relative z-10">
                  <p className="text-[10px] font-bold text-seashell-300 uppercase tracking-[0.4em] mb-2">OPERATIONAL CAPITAL</p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-heading text-seashell-400">₹</span>
                    <h2 className="text-6xl font-heading text-white tracking-tight">
                      {(wallet?.balance || 0).toLocaleString()}
                    </h2>
                  </div>
                </div>
  
                <div className="relative z-10 grid grid-cols-2 gap-8 pt-8 border-t border-white/10">
                  <div>
                    <p className="text-[9px] font-bold text-seashell-300 uppercase tracking-widest mb-1">Lifetime Earnings</p>
                    <p className="text-2xl font-heading text-white">₹{(wallet?.lifetime_earnings || 0).toLocaleString()}</p>
                  </div>
                  <div className="text-right md:text-left">
                    <p className="text-[9px] font-bold text-seashell-300 uppercase tracking-widest mb-1">Pending Extract</p>
                    <p className="text-2xl font-heading text-seashell-200">₹{(wallet?.pending_withdrawals || 0).toLocaleString()}</p>
                  </div>
                </div>
                
                {/* Visual Glow */}
                <div className="absolute top-[-50%] right-[-20%] w-full h-full bg-white/10 blur-[100px] rounded-full pointer-events-none" />
              </motion.div>
            </section>
  
            {/* Quick Actions */}
            <section className="grid grid-cols-2 gap-6">
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsDepositOpen(true)}
                className="bg-card rounded-[32px] py-8 flex flex-col items-center gap-3 border border-border shadow-sm hover:bg-seashell-200 transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-malachite-500/10 flex items-center justify-center text-malachite-600 shadow-sm">
                  <Plus size={24} strokeWidth={3} />
                </div>
                <span className="text-[10px] font-bold text-evergreen-500 uppercase tracking-[0.2em]">Add Funds</span>
              </motion.button>
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsWithdrawOpen(true)}
                className="bg-card rounded-[32px] py-8 flex flex-col items-center gap-3 border border-border shadow-sm hover:bg-seashell-200 transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-seashell-200 flex items-center justify-center text-evergreen-500 shadow-sm">
                  <ArrowDownLeft size={24} strokeWidth={3} />
                </div>
                <span className="text-[10px] font-bold text-evergreen-500 uppercase tracking-[0.2em]">Withdraw</span>
              </motion.button>
            </section>
    
            {/* Activity Section */}
            <section className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <div className="space-y-1">
                  <h3 className="text-xl font-heading text-foreground tracking-wide">Financial <span className="italic font-serif opacity-60">Logs</span></h3>
                  <p className="text-[10px] font-bold text-evergreen-400 uppercase tracking-widest">TRANSACTION HISTORY</p>
                </div>
                <Activity size={20} className="text-evergreen-200" />
              </div>
    
              <div className="space-y-4">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4 bg-card rounded-[40px] border border-border shadow-sm">
                    <Loader2 className="w-8 h-8 animate-spin text-malachite-500" />
                    <p className="text-[10px] text-evergreen-400 font-bold uppercase tracking-widest">Syncing Ledger...</p>
                  </div>
                ) : transactions.length > 0 ? (
                  transactions.map((tx, i) => (
                    <motion.div 
                      key={tx.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-card p-5 rounded-[32px] flex items-center justify-between border border-border shadow-sm hover:border-evergreen-200 transition-all"
                    >
                      <div className="flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${
                          ['deposit', 'prize'].includes(tx.type) ? 'bg-malachite-500/10 text-malachite-600' : 'bg-seashell-200 text-evergreen-500'
                        }`}>
                          {tx.type === 'deposit' ? <Plus size={20} strokeWidth={3} /> : tx.type === 'withdrawal' ? <ArrowDownLeft size={20} strokeWidth={3} /> : <TrendingUp size={20} strokeWidth={3} />}
                        </div>
                        <div>
                          <h4 className="text-[13px] font-bold text-foreground capitalize mb-1">{tx.description || tx.type}</h4>
                          <div className="flex items-center gap-3">
                            <span className="text-[9px] font-bold text-evergreen-400 uppercase tracking-widest flex items-center gap-1.5">
                              <Clock size={10} /> {new Date(tx.created_at).toLocaleDateString()}
                            </span>
                            <Badge variant="outline" className={`border-none rounded-full text-[8px] px-2 py-0 h-4 font-bold tracking-tighter ${
                              tx.status === 'completed' ? 'bg-malachite-500/10 text-malachite-600' : 'bg-seashell-200 text-evergreen-500'
                            }`}>
                              {tx.status.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-xl font-heading ${
                          ['deposit', 'prize'].includes(tx.type) ? 'text-malachite-600' : 'text-evergreen-500'
                        }`}>
                          {['deposit', 'prize'].includes(tx.type) ? '+' : '-'}₹{tx.amount}
                        </p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-20 bg-card rounded-[40px] border border-dashed border-border space-y-4 shadow-sm">
                    <AlertCircle size={40} className="text-evergreen-100 mx-auto" />
                    <p className="text-[10px] text-evergreen-300 font-bold uppercase tracking-[0.3em]">Operational Ledger Empty</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>
  
        {/* Styled Modals */}
        <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
          <DialogContent className="p-0 border-none bg-background rounded-[40px] overflow-hidden max-w-[90vw] sm:max-w-[400px] shadow-2xl border border-border">
            <div className="premium-gradient p-10 relative overflow-hidden">
              <DialogTitle className="text-3xl font-heading text-white mb-2">Fund <span className="italic opacity-60">Arena</span></DialogTitle>
              <DialogDescription className="text-seashell-200 text-[10px] font-bold uppercase tracking-[0.2em]">Inject operational capital for match deployment.</DialogDescription>
              <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-white/10 blur-[60px] rounded-full" />
            </div>
            <div className="p-10 space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-evergreen-400 uppercase tracking-[0.3em] ml-2">AMOUNT (₹)</label>
                <Input 
                  type="number" 
                  placeholder="Enter amount" 
                  className="h-16 rounded-2xl border border-border bg-seashell-100 text-2xl font-heading px-8 focus-visible:ring-malachite-500 text-foreground placeholder:text-evergreen-300"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                />
              </div>
              <button 
                onClick={handleDeposit}
                disabled={processing}
                className="w-full h-16 bg-primary text-primary-foreground rounded-[2rem] text-[11px] font-bold uppercase tracking-[0.3em] shadow-xl shadow-evergreen-900/10 active:scale-95 transition-all"
              >
                {processing ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : "CONFIRM DEPLOYMENT"}
              </button>
            </div>
          </DialogContent>
        </Dialog>
  
        <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
          <DialogContent className="p-0 border-none bg-background rounded-[40px] overflow-hidden max-w-[90vw] sm:max-w-[400px] shadow-2xl border border-border">
            <div className="bg-seashell-200 p-10 relative overflow-hidden">
              <DialogTitle className="text-3xl font-heading text-foreground mb-2">Funds <span className="italic opacity-60">Extraction</span></DialogTitle>
              <DialogDescription className="text-evergreen-400 text-[10px] font-bold uppercase tracking-[0.2em]">Initiate withdrawal of match winnings.</DialogDescription>
              <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-malachite-500/10 blur-[60px] rounded-full" />
            </div>
            <div className="p-10 space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-evergreen-400 uppercase tracking-[0.3em] ml-2">AMOUNT (₹)</label>
                <Input 
                  type="number" 
                  placeholder="Min ₹100" 
                  className="h-16 rounded-2xl border border-border bg-seashell-100 text-2xl font-heading px-8 focus-visible:ring-malachite-500 text-foreground placeholder:text-evergreen-300"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                />
              </div>
              <button 
                onClick={handleWithdraw}
                disabled={processing}
                className="w-full h-16 bg-secondary text-secondary-foreground rounded-[2rem] text-[11px] font-bold uppercase tracking-[0.3em] shadow-xl border-none active:scale-95 transition-all"
              >
                {processing ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : "INITIATE EXTRACTION"}
              </button>
            </div>
          </DialogContent>
        </Dialog>


      <BottomNav />
      {/* Background Glows */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0 opacity-30">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-malachite-400/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-malachite-500/15 blur-[120px] rounded-full" />
      </div>
    </div>
  );
}
