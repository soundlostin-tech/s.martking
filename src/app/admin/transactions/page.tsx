"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Loader2, 
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  Banknote,
  MoreVertical,
  Calendar,
  Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BentoCard } from "@/components/ui/BentoCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription 
} from "@/components/ui/sheet";

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select(`*, profiles:profiles(full_name, avatar_url)`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleUpdateStatus = async (tx: any, newStatus: 'completed' | 'failed') => {
    setProcessingId(tx.id);
    try {
      // Update transaction status
      const { error: txError } = await supabase
        .from("transactions")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", tx.id);

      if (txError) throw txError;

      // If it's a withdrawal and it failed, refund the wallet
      if (tx.type === 'withdrawal' && newStatus === 'failed') {
        const { data: wallet } = await supabase
          .from("wallets")
          .select("*")
          .eq("user_id", tx.user_id)
          .single();
        
        if (wallet) {
          await supabase
            .from("wallets")
            .update({ 
              balance: Number(wallet.balance) + Number(tx.amount),
              pending_withdrawals: Math.max(0, Number(wallet.pending_withdrawals) - Number(tx.amount))
            })
            .eq("user_id", tx.user_id);
        }
      } else if (tx.type === 'withdrawal' && newStatus === 'completed') {
        const { data: wallet } = await supabase
          .from("wallets")
          .select("*")
          .eq("user_id", tx.user_id)
          .single();
        
        if (wallet) {
          await supabase
            .from("wallets")
            .update({ 
              pending_withdrawals: Math.max(0, Number(wallet.pending_withdrawals) - Number(tx.amount))
            })
            .eq("user_id", tx.user_id);
        }
      }

      toast.success(`Transaction marked as ${newStatus}`);
      setIsDetailOpen(false);
      fetchTransactions();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => 
      t.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [transactions, searchQuery]);

  const stats = useMemo(() => {
    const pending = transactions.filter(t => t.status === 'pending').length;
    const completed = transactions.filter(t => t.status === 'completed').length;
    const totalVolume = transactions.reduce((acc, t) => acc + (t.status === 'completed' ? Number(t.amount) : 0), 0);
    return { pending, completed, totalVolume };
  }, [transactions]);

  return (
    <main className="p-8 space-y-10 max-w-7xl mx-auto">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-charcoal/40 uppercase tracking-[0.3em]">Ledger Oversight</p>
          <h1 className="text-[40px] font-black leading-none">Transactions</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal opacity-20" size={18} />
            <Input 
              placeholder="Search by name or ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-14 rounded-2xl border-black/[0.03] bg-white pl-12 pr-4 shadow-sm focus-visible:ring-onyx/5"
            />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Pending Approvals", value: stats.pending, icon: Clock, color: "coral" },
          { label: "Successful Trades", value: stats.completed, icon: CheckCircle2, color: "mint" },
          { label: "Total Volume", value: `₹${stats.totalVolume.toLocaleString()}`, icon: Banknote, color: "yellow" },
        ].map((stat, i) => (
          <BentoCard key={i} variant="pastel" pastelColor={stat.color as any} className="p-6 flex items-center gap-6 border-none shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-white/50 flex items-center justify-center">
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-onyx/40 uppercase tracking-widest leading-none mb-1.5">{stat.label}</p>
              <h3 className="text-2xl font-black">{stat.value}</h3>
            </div>
          </BentoCard>
        ))}
      </div>

      {/* Transactions Table/List */}
      <div className="space-y-4">
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-white/50 rounded-3xl animate-pulse" />
          ))
        ) : filteredTransactions.length > 0 ? (
          filteredTransactions.map((tx, i) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
              onClick={() => { setSelectedTx(tx); setIsDetailOpen(true); }}
              className="bg-white rounded-[2rem] p-5 flex items-center justify-between group cursor-pointer border border-black/[0.03] shadow-sm hover:shadow-xl transition-all"
            >
              <div className="flex items-center gap-5">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center",
                  ['deposit', 'prize'].includes(tx.type) ? 'bg-pastel-mint' : 'bg-pastel-coral'
                )}>
                  {['deposit', 'prize'].includes(tx.type) ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                </div>
                <div>
                  <h4 className="text-sm font-black text-onyx leading-tight">
                    {tx.profiles?.full_name || 'System'}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest">{tx.type.replace('_', ' ')}</span>
                    <div className="w-1 h-1 rounded-full bg-black/10" />
                    <span className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest">#{tx.id.slice(0, 8)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-right hidden md:block">
                  <p className="text-[9px] font-bold text-charcoal/30 uppercase tracking-widest mb-0.5">Date</p>
                  <p className="text-xs font-bold">{new Date(tx.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right w-24">
                  <p className={cn(
                    "text-lg font-black leading-none",
                    ['deposit', 'prize'].includes(tx.type) ? 'text-onyx' : 'text-charcoal/40'
                  )}>
                    {['deposit', 'prize'].includes(tx.type) ? '+' : '-'}₹{tx.amount}
                  </p>
                  <StatusBadge variant={tx.status} className="text-[7px] px-2 py-0.5 mt-1.5" />
                </div>
                <div className="w-10 h-10 rounded-xl bg-off-white flex items-center justify-center group-hover:bg-onyx group-hover:text-white transition-all">
                  <ChevronRight size={18} />
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-32 text-center space-y-6">
            <div className="w-20 h-20 bg-off-white rounded-full flex items-center justify-center mx-auto opacity-20">
              <Banknote size={40} />
            </div>
            <p className="text-[10px] font-black text-charcoal/40 uppercase tracking-[0.3em]">No capital flow records detected</p>
          </div>
        )}
      </div>

      {/* Detail Sheet */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="bg-white border-none sm:max-w-md p-0 overflow-y-auto no-scrollbar rounded-l-[3rem]">
          {selectedTx && (
            <div className="flex flex-col h-full">
              <div className={cn(
                "p-10",
                selectedTx.status === 'completed' ? 'bg-pastel-mint' : 
                selectedTx.status === 'pending' ? 'bg-pastel-yellow' : 'bg-pastel-coral'
              )}>
                <SheetHeader>
                  <div className="flex justify-between items-center mb-8">
                    <StatusBadge variant={selectedTx.status} />
                    <button onClick={() => setIsDetailOpen(false)} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <XCircle size={20} />
                    </button>
                  </div>
                  <SheetTitle className="text-3xl font-black mb-1">Transaction Detail</SheetTitle>
                  <SheetDescription className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Full audit audit record</SheetDescription>
                </SheetHeader>
              </div>

              <div className="p-10 space-y-10">
                <div className="flex flex-col items-center text-center gap-4 py-8 bg-background rounded-[2.5rem] shadow-inner">
                  <p className="text-[10px] font-bold text-charcoal/40 uppercase tracking-widest">Net Value</p>
                  <h2 className="text-5xl font-black">₹{selectedTx.amount}</h2>
                  <div className="px-4 py-1.5 bg-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                    {selectedTx.type.replace('_', ' ')}
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-charcoal/20 uppercase tracking-[0.3em] ml-2">Dossier</h4>
                  <div className="bg-background rounded-[2rem] overflow-hidden divide-y divide-black/[0.03]">
                    {[
                      { label: "Account", value: selectedTx.profiles?.full_name || "System", icon: TrendingUp },
                      { label: "Timestamp", value: new Date(selectedTx.created_at).toLocaleString(), icon: Calendar },
                      { label: "Description", value: selectedTx.description || "Operational Entry", icon: Filter },
                      { label: "Record ID", value: selectedTx.id, icon: MoreVertical },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-5">
                        <span className="text-[10px] font-bold text-charcoal/40 uppercase tracking-widest">{item.label}</span>
                        <span className="text-[11px] font-black text-onyx">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedTx.status === 'pending' && selectedTx.type === 'withdrawal' && (
                  <div className="grid grid-cols-2 gap-4 pt-10 border-t border-black/[0.03]">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleUpdateStatus(selectedTx, 'failed')}
                      disabled={processingId === selectedTx.id}
                      className="py-5 bg-off-white hover:bg-pastel-coral/30 text-onyx rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      {processingId === selectedTx.id ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Decline Payout"}
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleUpdateStatus(selectedTx, 'completed')}
                      disabled={processingId === selectedTx.id}
                      className="py-5 bg-onyx text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl"
                    >
                      {processingId === selectedTx.id ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Approve Payout"}
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </main>
  );
}
