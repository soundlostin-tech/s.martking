"use client";

import { HeroSection } from "@/components/layout/HeroSection";
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
  Calendar as CalendarIcon,
  CreditCard,
  User as UserIcon,
  Clock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Wallet,
  AlertCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
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
      
      const txDate = new Date(t.created_at);
      const matchesStart = !startDate || txDate >= new Date(startDate);
      const matchesEnd = !endDate || txDate <= new Date(endDate + "T23:59:59");

      return matchesSearch && matchesType && matchesStatus && matchesStart && matchesEnd;
    });
  }, [transactions, search, typeFilter, statusFilter, startDate, endDate]);

  const getTypeBadge = (type: string) => {
    const baseClass = "text-[9px] font-bold px-3 py-1 rounded-full border-none shadow-sm";
    switch (type) {
      case 'deposit': return <Badge className={`${baseClass} bg-sea-green-500/10 text-sea-green-600`}>DEPOSIT</Badge>;
      case 'withdrawal': return <Badge className={`${baseClass} bg-jungle-teal-500/10 text-jungle-teal-600`}>WITHDRAWAL</Badge>;
      case 'prize': return <Badge className={`${baseClass} bg-primary text-white`}>PRIZE</Badge>;
      case 'entry_fee': return <Badge className={`${baseClass} bg-black/5 text-black/40`}>ENTRY FEE</Badge>;
      default: return <Badge className={`${baseClass} bg-black/5 text-black/40`}>{type.replace('_', ' ').toUpperCase()}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClass = "text-[9px] font-bold px-3 py-1 rounded-full border-none shadow-sm";
    switch (status) {
      case 'completed': return <Badge className={`${baseClass} bg-primary text-white`}>COMPLETED</Badge>;
      case 'pending': return <Badge className={`${baseClass} bg-accent text-black`}>PENDING</Badge>;
      case 'failed': return <Badge className={`${baseClass} bg-destructive/10 text-destructive`}>FAILED</Badge>;
      default: return <Badge className={`${baseClass} bg-black/5 text-black/40`}>{status.toUpperCase()}</Badge>;
    }
  };

  return (
    <main className="min-h-screen pb-32 bg-zinc-50">
      <HeroSection 
        title={<>Capital <span className="italic font-serif opacity-60">Flow</span></>}
        subtitle="Operational oversight of platform liquidity and payouts."
        className="mx-0 rounded-none pb-32 bg-zinc-50 border-b border-black/5"
      >
        <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-zinc-200 rounded-full blur-[120px]" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-zinc-300 rounded-full blur-[120px]" />
        </div>
      </HeroSection>

      <div className="px-6 -mt-24 relative z-10 space-y-10 max-w-5xl mx-auto">
        {/* KPI Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Total Revenue", value: stats.totalRevenue, icon: TrendingUp, primary: true },
            { label: "Total Payouts", value: stats.totalPayouts, icon: ArrowDownLeft },
            { label: "Pending Requests", value: stats.pendingPayouts, icon: Clock },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-[2.5rem] p-8 border border-black/5 shadow-2xl shadow-black/5 relative overflow-hidden group ${
                stat.primary ? "bg-primary text-black" : "bg-zinc-50 text-black"
              }`}
            >
              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-1">
                  <p className={`text-[10px] uppercase font-bold tracking-[0.2em] ${stat.primary ? "text-black/40" : "text-black/30"}`}>{stat.label}</p>
                  <h3 className="text-3xl font-heading">₹{stat.value.toLocaleString()}</h3>
                </div>
                <div className={`p-3.5 rounded-[1.5rem] ${stat.primary ? "bg-black/10 text-black" : "bg-black/5 text-black"} group-hover:scale-110 transition-transform duration-500`}>
                  <stat.icon size={24} />
                </div>
              </div>
              <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full blur-2xl ${stat.primary ? "bg-white/20" : "bg-black/[0.02]"}`} />
            </motion.div>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="bg-zinc-50 rounded-[2.5rem] border border-black/5 p-6 shadow-2xl shadow-black/5 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-black/20" size={18} />
              <Input 
                className="bg-black/[0.03] border-none pl-14 rounded-2xl h-14 text-xs font-bold tracking-wide focus-visible:ring-black placeholder:text-black/20" 
                placeholder="SEARCH BY ID OR PLAYER NAME..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px] h-14 rounded-2xl bg-black/[0.03] border-none font-bold text-[10px] tracking-widest">
                  <SelectValue placeholder="TYPE" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-black/5 bg-zinc-50">
                  <SelectItem value="all">ALL TYPES</SelectItem>
                  <SelectItem value="deposit">DEPOSIT</SelectItem>
                  <SelectItem value="withdrawal">WITHDRAWAL</SelectItem>
                  <SelectItem value="prize">PRIZE</SelectItem>
                  <SelectItem value="entry_fee">ENTRY FEE</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] h-14 rounded-2xl bg-black/[0.03] border-none font-bold text-[10px] tracking-widest">
                  <SelectValue placeholder="STATUS" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-black/5 bg-zinc-50">
                  <SelectItem value="all">ALL STATUS</SelectItem>
                  <SelectItem value="pending">PENDING</SelectItem>
                  <SelectItem value="completed">COMPLETED</SelectItem>
                  <SelectItem value="failed">FAILED</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Transaction List */}
        <div className="space-y-6">
          <div className="flex items-end justify-between px-2">
            <div className="space-y-1">
              <h3 className="text-2xl font-heading text-black">Arena <span className="italic font-serif opacity-60">Ledger</span></h3>
              <p className="text-[10px] font-bold text-black/30 uppercase tracking-[0.2em]">{filteredTransactions.length} ENTRIES DETECTED</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-[10px] font-bold text-black/40 hover:text-black uppercase tracking-[0.2em]"
              onClick={() => toast.info("Exporting data feature coming soon")}
            >
              DOWNLOAD CSV <Download size={14} className="ml-1" />
            </Button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-6 bg-zinc-50 rounded-[3rem] border border-black/5">
              <Loader2 className="w-12 h-12 animate-spin text-black/10" />
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/20">Accessing Data Chambers...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx, idx) => (
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
                      className="bg-zinc-50 rounded-[2.5rem] p-6 flex flex-col md:flex-row justify-between md:items-center border border-black/5 hover:border-black/10 hover:shadow-2xl hover:shadow-black/5 transition-all duration-500 group cursor-pointer"
                    >
                      <div className="flex items-center gap-6">
                        <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-transform duration-500 group-hover:scale-110 bg-black/5 text-black/20 group-hover:text-black`}>
                          {['deposit', 'prize'].includes(tx.type) ? <ArrowUpRight size={28} /> : <ArrowDownLeft size={28} />}
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-3">
                            <h4 className="text-lg font-heading text-black leading-none">{tx.profiles?.full_name || 'Arena System'}</h4>
                            {getStatusBadge(tx.status)}
                          </div>
                          <div className="flex items-center gap-3">
                            {getTypeBadge(tx.type)}
                            <span className="text-[9px] text-black/20 flex items-center gap-1 font-bold uppercase tracking-widest">
                              <Clock size={10} strokeWidth={3} /> {new Date(tx.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-10 mt-6 md:mt-0">
                        <div className="text-right">
                          <p className={`text-2xl font-heading ${['deposit', 'prize'].includes(tx.type) ? "text-black" : "text-black/40"}`}>
                            {['deposit', 'prize'].includes(tx.type) ? "+" : "-"}₹{Number(tx.amount).toLocaleString()}
                          </p>
                          <p className="text-[10px] text-black/20 font-bold uppercase tracking-widest">ID: {tx.id.slice(0, 8)}</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-black/5 flex items-center justify-center text-black/20 group-hover:bg-black group-hover:text-white transition-all">
                          <ChevronRight size={20} strokeWidth={3} />
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-32 bg-zinc-50 rounded-[3rem] border border-dashed border-black/10">
                    <AlertCircle size={64} strokeWidth={1} className="text-black/5 mb-6" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/20">No matching signals found</p>
                    <Button variant="link" onClick={() => { setSearch(""); setTypeFilter("all"); setStatusFilter("all"); }} className="text-black font-bold mt-4 text-[10px] tracking-widest uppercase">
                      CLEAR ALL FILTERS
                    </Button>
                  </div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Detail Sheet */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="bg-zinc-50 border-none w-full sm:max-w-xl p-0 overflow-y-auto no-scrollbar">
          {selectedTx && (
            <div className="flex flex-col h-full">
              <div className="p-10 bg-black text-white relative overflow-hidden">
                <SheetHeader className="relative z-10">
                  <div className="flex justify-between items-start mb-10">
                    {getStatusBadge(selectedTx.status)}
                    <Button variant="ghost" size="icon" className="text-white/20 hover:text-white transition-colors">
                      <ExternalLink size={22} />
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.3em]">AUDIT RECORD</p>
                    <SheetTitle className="text-white text-4xl font-heading leading-tight">Transaction Detail</SheetTitle>
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] font-mono">#{selectedTx.id}</p>
                  </div>
                </SheetHeader>
                {/* Visual Glows */}
                <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-zinc-400/20 blur-[100px] rounded-full" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-zinc-600/20 blur-[100px] rounded-full" />
              </div>

              <div className="p-10 space-y-12 flex-1">
                {/* Financial Overview */}
                <div className="bg-zinc-50 p-10 rounded-[2.5rem] border border-black/5 flex flex-col items-center text-center gap-4 shadow-2xl shadow-black/[0.02]">
                  <p className="text-[10px] text-black/20 uppercase font-bold tracking-[0.3em]">TRANSACTION VALUE</p>
                  <h2 className="text-6xl font-heading text-black">₹{Number(selectedTx.amount).toLocaleString()}</h2>
                  {getTypeBadge(selectedTx.type)}
                </div>

                {/* Information Sections */}
                <div className="space-y-10">
                  <div>
                    <h4 className="text-[10px] text-black/20 uppercase font-bold tracking-[0.3em] ml-2 mb-4">DOSSIER DETAILS</h4>
                    <div className="bg-zinc-50 rounded-[2.5rem] border border-black/5 divide-y divide-black/5 overflow-hidden shadow-2xl shadow-black/[0.02]">
                      {[
                        { label: "Beneficiary", value: selectedTx.profiles?.full_name || 'ARENA SYSTEM', icon: UserIcon },
                        { label: "Timestamp", value: new Date(selectedTx.created_at).toLocaleString(), icon: Clock },
                        { label: "Classification", value: selectedTx.type.toUpperCase(), icon: Filter },
                        { label: "Description", value: selectedTx.description || 'OPERATIONAL LEDGER ENTRY', icon: Eye },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-6 hover:bg-black/[0.02] transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center text-black/20">
                              <item.icon size={18} />
                            </div>
                            <span className="text-[10px] text-black/30 font-bold uppercase tracking-widest">{item.label}</span>
                          </div>
                          <span className="text-[11px] font-bold text-black uppercase tracking-wide text-right max-w-[200px]">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedTx.metadata && (
                    <div>
                      <h4 className="text-[10px] text-black/20 uppercase font-bold tracking-[0.3em] ml-2 mb-4">TECHNICAL LOG</h4>
                      <div className="bg-black rounded-[2.5rem] p-8 text-white/40 font-mono text-[10px] leading-loose break-all">
                        {JSON.stringify(selectedTx.metadata, null, 2)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Admin Actions Footer for Withdrawals */}
              {selectedTx.type === 'withdrawal' && selectedTx.status === 'pending' && (
                <div className="p-10 bg-zinc-50 border-t border-black/5 shadow-[0_-20px_50px_rgba(0,0,0,0.05)]">
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      variant="outline"
                      disabled={processingId !== null}
                      className="h-16 rounded-[2rem] border-black/10 text-black font-bold uppercase tracking-[0.2em] text-[10px] gap-3 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                      onClick={() => handleUpdateStatus(selectedTx.id, selectedTx.user_id, selectedTx.amount, 'failed')}
                    >
                      {processingId === selectedTx.id ? <Loader2 className="animate-spin" /> : <XCircle size={20} />} REJECT PAYOUT
                    </Button>
                    <Button 
                      disabled={processingId !== null}
                      className="h-16 rounded-[2rem] bg-black hover:bg-zinc-800 text-white font-bold uppercase tracking-[0.2em] text-[10px] gap-3 shadow-2xl shadow-black/20"
                      onClick={() => handleUpdateStatus(selectedTx.id, selectedTx.user_id, selectedTx.amount, 'completed')}
                    >
                      {processingId === selectedTx.id ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={20} />} APPROVE PAYOUT
                    </Button>
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
