"use client";

import { AdminNav } from "@/components/layout/AdminNav";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Filter, 
  Download, 
  Loader2, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Clock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Wallet,
  AlertCircle,
  IndianRupee,
  User as UserIcon,
  Zap
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BentoCard } from "@/components/ui/BentoCard";

interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: string;
  status: string;
  description: string;
  created_at: string;
  metadata: any;
  profiles?: {
    full_name: string;
    avatar_url?: string;
  };
}

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalPayouts: 0,
    pendingPayouts: 0,
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
      
      const revenue = data?.filter(t => ['entry_fee', 'fee', 'deposit'].includes(t.type)).reduce((acc, t) => acc + Number(t.amount), 0) || 0;
      const payouts = data?.filter(t => (t.type === 'withdrawal' || t.type === 'prize') && t.status === 'completed').reduce((acc, t) => acc + Number(t.amount), 0) || 0;
      const pending = data?.filter(t => t.type === 'withdrawal' && t.status === 'pending').reduce((acc, t) => acc + Number(t.amount), 0) || 0;

      setStats({ 
        totalRevenue: revenue, 
        totalPayouts: payouts, 
        pendingPayouts: pending 
      });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, userId: string, amount: number, newStatus: 'completed' | 'failed') => {
    setProcessingId(id);
    try {
      const { error: txError } = await supabase
        .from("transactions")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (txError) throw txError;

      const { data: wallet, error: walletFetchError } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", userId)
        .single();
      
      if (walletFetchError) throw walletFetchError;

      const updates: any = {
        pending_withdrawals: Math.max(0, Number(wallet.pending_withdrawals) - amount),
      };

      if (newStatus === 'failed') {
        updates.balance = Number(wallet.balance) + amount;
      }

      const { error: walletUpdateError } = await supabase
        .from("wallets")
        .update(updates)
        .eq("user_id", userId);

      if (walletUpdateError) throw walletUpdateError;

      toast.success(`Payout ${newStatus === 'completed' ? 'approved' : 'rejected'} successfully`);
      setIsDetailOpen(false);
      fetchTransactions();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = 
        t.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        t.id.toLowerCase().includes(search.toLowerCase()) ||
        t.description?.toLowerCase().includes(search.toLowerCase());
      
      const matchesType = typeFilter === "all" || t.type === typeFilter;
      const matchesStatus = statusFilter === "all" || t.status === statusFilter;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [transactions, search, typeFilter, statusFilter]);

  const getTypeBadge = (type: string) => {
    const baseClass = "text-[9px] font-black px-3 py-1 rounded-full border-none shadow-sm";
    switch (type) {
      case 'deposit': return <Badge className={`${baseClass} bg-[#D9F9E6] text-[#1A1A1A]`}>DEPOSIT</Badge>;
      case 'withdrawal': return <Badge className={`${baseClass} bg-[#FFD8B1] text-[#1A1A1A]`}>WITHDRAWAL</Badge>;
      case 'prize': return <Badge className={`${baseClass} bg-[#B3E5FC] text-[#1A1A1A]`}>PRIZE</Badge>;
      case 'entry_fee': return <Badge className={`${baseClass} bg-[#FFC0CB] text-[#1A1A1A]`}>ENTRY FEE</Badge>;
      default: return <Badge className={`${baseClass} bg-[#F5F5F5] text-[#1A1A1A]/40`}>{type.replace('_', ' ').toUpperCase()}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClass = "text-[9px] font-black px-3 py-1 rounded-full border-none shadow-sm";
    switch (status) {
      case 'completed': return <Badge className={`${baseClass} bg-[#1A1A1A] text-white`}>COMPLETED</Badge>;
      case 'pending': return <Badge className={`${baseClass} bg-[#FEF3C7] text-[#1A1A1A]`}>PENDING</Badge>;
      case 'failed': return <Badge className={`${baseClass} bg-red-500 text-white`}>FAILED</Badge>;
      default: return <Badge className={`${baseClass} bg-[#F5F5F5] text-[#1A1A1A]/40`}>{status.toUpperCase()}</Badge>;
    }
  };

  return (
    <main className="min-h-screen pb-32 bg-[#F5F5F5] text-[#1A1A1A]">
      <div className="px-8 pt-24 relative z-10 space-y-12 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-[#1A1A1A]/40 uppercase tracking-[0.3em] mb-2">Financial command</p>
            <h1 className="text-[44px] font-heading font-black leading-none tracking-tight text-[#1A1A1A]">
              CAPITAL <br />
              <span className="text-[#6B7280]/40">FLOW</span>
            </h1>
          </div>
          <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-md border-2 border-[#E5E7EB]">
            <div className="w-2 h-2 rounded-full bg-[#5FD3BC] animate-pulse" />
            <p className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-widest">LEDGER SYNCED</p>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: "Total Revenue", value: stats.totalRevenue, icon: TrendingUp, color: "mint" },
            { label: "Total Payouts", value: stats.totalPayouts, icon: ArrowDownLeft, color: "blue" },
            { label: "Pending Requests", value: stats.pendingPayouts, icon: Clock, color: "pink" },
          ].map((stat, i) => (
            <BentoCard 
              key={i}
              variant={stat.color as any}
              className="p-8 shadow-xl relative overflow-hidden group border-none"
            >
              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-black tracking-[0.2em] text-[#1A1A1A]/40">{stat.label}</p>
                  <h3 className="text-4xl font-heading font-black text-[#1A1A1A]">₹{stat.value.toLocaleString()}</h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#1A1A1A] text-white flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                  <stat.icon size={22} strokeWidth={3} />
                </div>
              </div>
              <div className="absolute right-[-20px] bottom-[-20px] opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none">
                <IndianRupee size={140} strokeWidth={1} />
              </div>
            </BentoCard>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-[32px] border-2 border-[#E5E7EB] p-6 shadow-xl flex flex-col md:flex-row gap-6">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={20} strokeWidth={3} />
            <Input 
              className="bg-[#F5F5F5] border-none pl-14 rounded-2xl h-16 text-sm font-black tracking-tight focus-visible:ring-[#1A1A1A] placeholder:text-[#9CA3AF] text-[#1A1A1A]" 
              placeholder="SEARCH BY ID OR OPERATIVE NAME..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[160px] h-16 rounded-2xl bg-[#F5F5F5] border-none font-black text-[10px] tracking-widest text-[#1A1A1A] uppercase px-6">
                <SelectValue placeholder="TYPE" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-none shadow-2xl p-2 bg-white">
                <SelectItem value="all" className="text-[10px] font-black uppercase py-3 rounded-xl">ALL TYPES</SelectItem>
                <SelectItem value="deposit" className="text-[10px] font-black uppercase py-3 rounded-xl">DEPOSIT</SelectItem>
                <SelectItem value="withdrawal" className="text-[10px] font-black uppercase py-3 rounded-xl">WITHDRAWAL</SelectItem>
                <SelectItem value="prize" className="text-[10px] font-black uppercase py-3 rounded-xl">PRIZE</SelectItem>
                <SelectItem value="entry_fee" className="text-[10px] font-black uppercase py-3 rounded-xl">ENTRY FEE</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px] h-16 rounded-2xl bg-[#F5F5F5] border-none font-black text-[10px] tracking-widest text-[#1A1A1A] uppercase px-6">
                <SelectValue placeholder="STATUS" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-none shadow-2xl p-2 bg-white">
                <SelectItem value="all" className="text-[10px] font-black uppercase py-3 rounded-xl">ALL STATUS</SelectItem>
                <SelectItem value="pending" className="text-[10px] font-black uppercase py-3 rounded-xl">PENDING</SelectItem>
                <SelectItem value="completed" className="text-[10px] font-black uppercase py-3 rounded-xl">COMPLETED</SelectItem>
                <SelectItem value="failed" className="text-[10px] font-black uppercase py-3 rounded-xl">FAILED</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Transaction List */}
        <section className="space-y-8 pb-12">
          <div className="flex items-end justify-between px-2">
            <div className="space-y-1">
              <h3 className="text-3xl font-heading text-[#1A1A1A] font-black tracking-tighter uppercase">ARENA <span className="text-[#1A1A1A]/20 italic">LEDGER</span></h3>
              <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-[0.2em]">{filteredTransactions.length} ENTRIES DETECTED</p>
            </div>
            <motion.button 
              whileTap={{ scale: 0.95 }}
              className="text-[10px] font-black text-[#1A1A1A] hover:text-black uppercase tracking-[0.2em] bg-white border-2 border-[#E5E7EB] px-6 py-3 rounded-xl shadow-md flex items-center gap-2"
              onClick={() => toast.info("Export protocol initiated...")}
            >
              DOWNLOAD DATA <Download size={16} strokeWidth={3} />
            </motion.button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-6 bg-white rounded-[48px] shadow-2xl border-none">
              <Loader2 className="w-14 h-14 animate-spin text-[#1A1A1A]/10" />
              <p className="text-[11px] font-black uppercase tracking-[0.4em] text-[#6B7280]">Accessing Data Chambers...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx, idx) => {
                    const colors = ["mint", "blue", "pink", "yellow"];
                    const color = colors[idx % colors.length] as any;
                    return (
                      <motion.div 
                        key={tx.id}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        layout
                        onClick={() => {
                          setSelectedTx(tx);
                          setIsDetailOpen(true);
                        }}
                      >
                        <BentoCard 
                          variant={color}
                          className="p-6 flex flex-col md:flex-row justify-between md:items-center border-none shadow-lg hover:shadow-2xl hover:translate-y-[-4px] transition-all duration-500 cursor-pointer group"
                        >
                          <div className="flex items-center gap-8">
                            <div className="w-16 h-16 rounded-[24px] bg-white/40 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 shadow-sm">
                              {['deposit', 'prize'].includes(tx.type) ? <ArrowUpRight size={28} strokeWidth={3} className="text-[#1A1A1A]" /> : <ArrowDownLeft size={28} strokeWidth={3} className="text-[#1A1A1A]" />}
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-4">
                                <h4 className="text-xl font-heading font-black text-[#1A1A1A] leading-none tracking-tight">{tx.profiles?.full_name || 'ARENA SYSTEM'}</h4>
                                {getStatusBadge(tx.status)}
                              </div>
                              <div className="flex items-center gap-4">
                                {getTypeBadge(tx.type)}
                                <span className="text-[9px] text-[#1A1A1A]/40 flex items-center gap-1 font-black uppercase tracking-widest">
                                  <Clock size={12} strokeWidth={3} /> {new Date(tx.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between md:justify-end gap-12 mt-8 md:mt-0 pt-6 md:pt-0 border-t md:border-t-0 border-[#1A1A1A]/5">
                            <div className="text-right">
                              <p className={`text-3xl font-heading font-black tracking-tighter ${['deposit', 'prize'].includes(tx.type) ? "text-[#1A1A1A]" : "text-[#1A1A1A]/60"}`}>
                                {['deposit', 'prize'].includes(tx.type) ? "+" : "-"}₹{Number(tx.amount).toLocaleString()}
                              </p>
                              <p className="text-[9px] text-[#1A1A1A]/30 font-black uppercase tracking-widest mt-1">SIG: {tx.id.slice(0, 12).toUpperCase()}</p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-[#1A1A1A] flex items-center justify-center text-white shadow-xl group-hover:translate-x-1 transition-transform">
                              <ChevronRight size={22} strokeWidth={3} />
                            </div>
                          </div>
                        </BentoCard>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[48px] border-4 border-dashed border-[#E5E7EB] text-center shadow-inner">
                    <AlertCircle size={64} strokeWidth={1} className="text-[#D1D5DB] mb-6 rotate-12" />
                    <p className="text-[11px] font-black uppercase tracking-[0.4em] text-[#9CA3AF]">NO MATCHING SIGNALS FOUND</p>
                    <Button variant="link" onClick={() => { setSearch(""); setTypeFilter("all"); setStatusFilter("all"); }} className="text-[#1A1A1A] font-black mt-6 text-[10px] tracking-[0.2em] uppercase underline decoration-4 underline-offset-8 decoration-[#FEF3C7]">
                      CLEAR ALL FILTERS
                    </Button>
                  </div>
                )}
              </AnimatePresence>
            </div>
          )}
        </section>
      </div>

      {/* Transaction Detail Sheet */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="bg-white border-none w-full sm:max-w-xl p-0 overflow-y-auto no-scrollbar text-[#1A1A1A] rounded-l-[40px] shadow-2xl">
          {selectedTx && (
            <div className="flex flex-col h-full">
              <div className="p-12 bg-[#F5F5F5] relative overflow-hidden border-b-2 border-[#E5E7EB]">
                <SheetHeader className="relative z-10">
                  <div className="flex justify-between items-start mb-12">
                    {getStatusBadge(selectedTx.status)}
                    <button className="w-12 h-12 rounded-2xl bg-white border-2 border-[#E5E7EB] flex items-center justify-center text-[#1A1A1A] shadow-lg hover:scale-110 transition-transform">
                      <ExternalLink size={24} strokeWidth={3} />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <p className="text-[#6B7280] text-[10px] font-black uppercase tracking-[0.4em]">MISSION LOG RECORD</p>
                    <SheetTitle className="text-[#1A1A1A] text-5xl font-heading font-black leading-none tracking-tighter">Transaction <br />Detail</SheetTitle>
                    <div className="bg-[#1A1A1A] text-white px-4 py-2 rounded-xl inline-block shadow-lg">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] font-mono">SIG#{selectedTx.id.toUpperCase()}</p>
                    </div>
                  </div>
                </SheetHeader>
                <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-[#5FD3BC]/10 blur-[120px] rounded-full pointer-events-none" />
              </div>

              <div className="p-12 space-y-12 flex-1">
                {/* Financial Overview */}
                <BentoCard variant="yellow" className="p-12 text-center relative overflow-hidden shadow-2xl border-none">
                  <p className="text-[11px] text-[#1A1A1A]/40 uppercase font-black tracking-[0.3em] mb-4">TRANSACTION VALUE</p>
                  <h2 className="text-7xl font-heading font-black text-[#1A1A1A] tracking-tighter">₹{Number(selectedTx.amount).toLocaleString()}</h2>
                  <div className="mt-6 inline-block">
                    {getTypeBadge(selectedTx.type)}
                  </div>
                  <div className="absolute right-[-20px] bottom-[-20px] opacity-[0.05] pointer-events-none">
                    <Zap size={140} strokeWidth={1} />
                  </div>
                </BentoCard>

                {/* Information Sections */}
                <div className="space-y-10">
                  <div>
                    <h4 className="text-[11px] text-[#6B7280] uppercase font-black tracking-[0.3em] ml-4 mb-6">OPERATIVE DOSSIER</h4>
                    <div className="bg-white rounded-[32px] border-2 border-[#E5E7EB] divide-y-2 divide-[#E5E7EB] overflow-hidden shadow-xl">
                      {[
                        { label: "Operative", value: selectedTx.profiles?.full_name || 'ARENA SYSTEM', icon: UserIcon },
                        { label: "Timestamp", value: new Date(selectedTx.created_at).toLocaleString(), icon: Clock },
                        { label: "Classification", value: selectedTx.type.toUpperCase(), icon: Filter },
                        { label: "Intel", value: selectedTx.description || 'OPERATIONAL LEDGER ENTRY', icon: Eye },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-8 hover:bg-[#F9FAFB] transition-colors">
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-[#F5F5F5] flex items-center justify-center text-[#1A1A1A] border-2 border-[#E5E7EB] shadow-inner">
                              <item.icon size={20} strokeWidth={3} />
                            </div>
                            <span className="text-[11px] text-[#6B7280] font-black uppercase tracking-widest">{item.label}</span>
                          </div>
                          <span className="text-[12px] font-black text-[#1A1A1A] uppercase tracking-wide text-right max-w-[240px] leading-relaxed">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedTx.metadata && (
                    <div>
                      <h4 className="text-[11px] text-[#6B7280] uppercase font-black tracking-[0.3em] ml-4 mb-6">RAW TELEMETRY</h4>
                      <div className="bg-[#1A1A1A] rounded-[32px] p-10 text-[#5FD3BC] font-mono text-[11px] leading-loose break-all shadow-2xl relative overflow-hidden group">
                        {JSON.stringify(selectedTx.metadata, null, 2)}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#5FD3BC]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Admin Actions Footer for Withdrawals */}
              {selectedTx.type === 'withdrawal' && selectedTx.status === 'pending' && (
                <div className="p-12 bg-[#F5F5F5] border-t-2 border-[#E5E7EB] shadow-[0_-20px_50px_rgba(0,0,0,0.05)]">
                  <div className="grid grid-cols-2 gap-6">
                    <motion.button 
                      whileTap={{ scale: 0.95 }}
                      disabled={processingId !== null}
                      onClick={() => handleUpdateStatus(selectedTx.id, selectedTx.user_id, selectedTx.amount, 'failed')}
                      className="h-20 rounded-[24px] bg-white border-2 border-red-500 text-red-500 font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 hover:bg-red-50 transition-all shadow-lg"
                    >
                      {processingId === selectedTx.id ? <Loader2 className="animate-spin" /> : <XCircle size={22} strokeWidth={3} />} ABORT MISSION
                    </motion.button>
                    <motion.button 
                      whileTap={{ scale: 0.95 }}
                      disabled={processingId !== null}
                      onClick={() => handleUpdateStatus(selectedTx.id, selectedTx.user_id, selectedTx.amount, 'completed')}
                      className="h-20 rounded-[24px] bg-[#1A1A1A] text-white font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 shadow-2xl hover:bg-black transition-all"
                    >
                      {processingId === selectedTx.id ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={22} strokeWidth={3} />} AUTHORIZE PAYOUT
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      <AdminNav />
    </main>
  );
}
