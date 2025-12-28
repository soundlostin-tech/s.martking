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
      <main className="min-h-screen pb-32 bg-off-white text-onyx font-sans">
        <div className="px-8 pt-24 relative z-10 max-w-6xl mx-auto space-y-16">
          {/* Hero Header */}
          <header className="relative flex flex-col md:flex-row md:items-end justify-between gap-10">
            <div className="absolute -top-20 -left-10 w-64 h-64 bg-pastel-mint/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-[2px] bg-onyx/10" />
                <p className="text-[10px] font-black text-charcoal/40 uppercase tracking-[0.4em]">Capital Flow</p>
              </div>
              <h1 className="text-[64px] font-black leading-[0.85] tracking-[-0.04em]">
                Transaction<br />
                <span className="text-onyx/20">Ledger</span>
              </h1>
            </div>
            
            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4">
              <div className="relative w-full sm:w-80 group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-charcoal/20 group-focus-within:text-onyx transition-colors" size={18} />
                <Input 
                  placeholder="Filter Records..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-16 rounded-[24px] border-none bg-white pl-14 pr-6 shadow-soft focus-visible:ring-onyx/5 font-black text-[12px] uppercase tracking-wider"
                />
              </div>
            </div>
          </header>
  
          {/* KPI Grid */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: "Pending Approvals", value: stats.pending, icon: Clock, color: "coral" },
              { label: "Trade Success", value: stats.completed, icon: CheckCircle2, color: "mint" },
              { label: "Total Volume", value: `₹${stats.totalVolume.toLocaleString()}`, icon: Banknote, color: "yellow" },
            ].map((stat, i) => (
              <BentoCard key={i} variant="pastel" pastelColor={stat.color as any} className="p-8 flex items-center gap-8 h-[140px] relative overflow-hidden group">
                <div className="w-16 h-16 rounded-[24px] bg-white/60 flex items-center justify-center relative z-10 group-hover:rotate-12 transition-transform duration-500">
                  <stat.icon size={28} className="text-onyx" />
                </div>
                <div className="relative z-10">
                  <p className="text-[10px] font-black text-onyx/40 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                  <h3 className="text-3xl font-black tracking-tight leading-none">{stat.value}</h3>
                </div>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
              </BentoCard>
            ))}
          </section>
  
          {/* Activity Stream */}
          <section className="space-y-8">
            <div className="flex justify-between items-center px-2">
              <h3 className="text-3xl font-black tracking-tight">Financial Stream</h3>
              <div className="px-4 py-2 bg-white rounded-full shadow-sm border border-black/[0.03]">
                <p className="text-[10px] font-black text-charcoal/30 uppercase tracking-[0.2em]">{filteredTransactions.length} LOGS RETRIEVED</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <div key={i} className="h-24 bg-white rounded-[32px] shadow-soft animate-pulse" />
                ))
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx, i) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    onClick={() => { setSelectedTx(tx); setIsDetailOpen(true); }}
                  >
                    <BentoCard className="p-6 flex items-center justify-between group cursor-pointer border-none shadow-soft hover:shadow-soft-lg transition-all duration-500 bg-white relative overflow-hidden">
                      <div className="flex items-center gap-6 relative z-10">
                        <div className={cn(
                          "w-16 h-16 rounded-[22px] flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-sm",
                          ['deposit', 'prize'].includes(tx.type) ? 'bg-pastel-mint/30' : 'bg-pastel-coral/30'
                        )}>
                          {['deposit', 'prize'].includes(tx.type) ? 
                            <ArrowUpRight size={24} className="text-onyx" /> : 
                            <ArrowDownLeft size={24} className="text-onyx" />
                          }
                        </div>
                        <div>
                          <h4 className="text-[17px] font-black tracking-tight leading-tight">
                            {tx.profiles?.full_name || 'Arena System'}
                          </h4>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="px-3 py-0.5 bg-off-white text-[9px] font-black text-charcoal/30 uppercase tracking-[0.15em] rounded-full">{tx.type.replace('_', ' ')}</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-black/[0.05]" />
                            <span className="text-[10px] font-bold text-charcoal/20 uppercase tracking-widest">SIGNAL #{tx.id.slice(0, 8)}</span>
                          </div>
                        </div>
                      </div>
  
                      <div className="flex items-center gap-12 relative z-10">
                        <div className="text-right hidden md:block">
                          <p className="text-[9px] font-black text-charcoal/20 uppercase tracking-[0.2em] mb-1">timestamp</p>
                          <p className="text-[12px] font-black uppercase tracking-tighter text-charcoal/40">{format(new Date(tx.created_at), "MMM d, HH:mm")}</p>
                        </div>
                        <div className="text-right min-w-[120px]">
                          <p className={cn(
                            "text-[28px] font-black leading-none tracking-tight",
                            ['deposit', 'prize'].includes(tx.type) ? 'text-onyx' : 'text-charcoal/30'
                          )}>
                            {['deposit', 'prize'].includes(tx.type) ? '+' : '-'}₹{tx.amount}
                          </p>
                          <StatusBadge variant={tx.status} className="text-[8px] font-black px-4 py-1.5 mt-2" />
                        </div>
                        <div className="w-14 h-14 rounded-[22px] bg-off-white flex items-center justify-center group-hover:bg-onyx group-hover:text-white transition-all duration-500 shadow-sm group-hover:shadow-xl group-hover:rotate-12">
                          <ChevronRight size={20} strokeWidth={3} />
                        </div>
                      </div>
                      <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-off-white rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
                    </BentoCard>
                  </motion.div>
                ))
              ) : (
                <div className="py-40 text-center flex flex-col items-center gap-8 bg-white/50 rounded-[48px] border-2 border-dashed border-black/[0.03]">
                  <div className="w-24 h-24 bg-off-white rounded-[32px] flex items-center justify-center opacity-20 rotate-12">
                    <Banknote size={48} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[14px] font-black uppercase tracking-[0.4em] text-charcoal/40">Vault Silent</p>
                    <p className="text-[10px] font-bold text-charcoal/20 uppercase tracking-widest italic">No financial signals detected in this sector</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
  
        {/* Detail Sheet */}
        <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <SheetContent className="bg-off-white border-none sm:max-w-xl p-0 overflow-y-auto no-scrollbar rounded-l-[48px] shadow-2xl">
            {selectedTx && (
              <div className="flex flex-col h-full">
                <div className={cn(
                  "p-12 pb-16 relative overflow-hidden",
                  selectedTx.status === 'completed' ? 'bg-pastel-mint/40' : 
                  selectedTx.status === 'pending' ? 'bg-soft-yellow/40' : 'bg-pastel-coral/40'
                )}>
                  <SheetHeader className="relative z-10">
                    <div className="flex justify-between items-center mb-12">
                      <StatusBadge variant={selectedTx.status} className="text-[10px] font-black px-6 py-2" />
                      <button 
                        onClick={() => setIsDetailOpen(false)} 
                        className="w-14 h-14 bg-white/40 hover:bg-white rounded-full flex items-center justify-center backdrop-blur-md transition-all group shadow-sm"
                      >
                        <XCircle size={24} className="group-hover:rotate-90 transition-transform" />
                      </button>
                    </div>
                    <SheetTitle className="text-[48px] font-black leading-none tracking-tight">Audit<br />Record</SheetTitle>
                    <SheetDescription className="text-[10px] font-black opacity-40 uppercase tracking-[0.4em] mt-2">Dossier ID: {selectedTx.id}</SheetDescription>
                  </SheetHeader>
                  <Banknote size={200} className="absolute -bottom-20 -right-20 text-black/5 rotate-[-15deg]" />
                </div>
  
                <div className="p-12 space-y-12">
                  <div className="flex flex-col items-center text-center gap-4 py-12 bg-white rounded-[40px] shadow-soft border border-black/[0.02]">
                    <p className="text-[10px] font-black text-charcoal/40 uppercase tracking-[0.4em]">Net Signal Value</p>
                    <h2 className="text-[64px] font-black tracking-tight leading-none">₹{selectedTx.amount}</h2>
                    <div className="px-6 py-2 bg-onyx text-white rounded-full text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl">
                      {selectedTx.type.replace('_', ' ')}
                    </div>
                  </div>
  
                  <div className="space-y-6">
                    <h4 className="text-[12px] font-black text-charcoal/30 uppercase tracking-[0.4em] ml-2">Mission Intelligence</h4>
                    <div className="bg-white rounded-[32px] overflow-hidden divide-y divide-black/[0.02] shadow-soft border border-black/[0.01]">
                      {[
                        { label: "Account Holder", value: selectedTx.profiles?.full_name || "Arena Operations", icon: TrendingUp },
                        { label: "Temporal Log", value: format(new Date(selectedTx.created_at), "MMM d, yyyy HH:mm:ss"), icon: Calendar },
                        { label: "Description", value: selectedTx.description || "Operational Credit Entry", icon: Filter },
                        { label: "Protocol", value: selectedTx.type.toUpperCase(), icon: ShieldAlert },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-6 group hover:bg-off-white transition-colors">
                          <span className="text-[10px] font-black text-charcoal/40 uppercase tracking-[0.2em]">{item.label}</span>
                          <span className="text-[13px] font-black text-onyx tracking-tight">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
  
                  {selectedTx.status === 'pending' && selectedTx.type === 'withdrawal' && (
                    <div className="grid grid-cols-2 gap-6 pt-8">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => handleUpdateStatus(selectedTx, 'failed')}
                        disabled={processingId === selectedTx.id}
                        className="py-6 bg-white hover:bg-pastel-coral/30 text-onyx rounded-[24px] text-[11px] font-black uppercase tracking-[0.3em] transition-all shadow-sm flex items-center justify-center gap-3 border border-black/[0.03]"
                      >
                        {processingId === selectedTx.id ? <Loader2 size={18} className="animate-spin" /> : (
                          <>
                            <XCircle size={18} />
                            Decline Signal
                          </>
                        )}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => handleUpdateStatus(selectedTx, 'completed')}
                        disabled={processingId === selectedTx.id}
                        className="py-6 bg-onyx text-white rounded-[24px] text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl flex items-center justify-center gap-3 hover:bg-carbon-black"
                      >
                        {processingId === selectedTx.id ? <Loader2 size={18} className="animate-spin" /> : (
                          <>
                            <CheckCircle2 size={18} className="text-pastel-mint" />
                            Approve Funds
                          </>
                        )}
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
  
        <AdminNav />
      </main>
    );
}
