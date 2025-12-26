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
  User as UserIcon
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
    const baseClass = "text-[9px] font-bold px-3 py-1 rounded-full border-none shadow-sm";
    switch (type) {
      case 'deposit': return <Badge className={`${baseClass} bg-muted-teal/20 text-muted-teal`}>DEPOSIT</Badge>;
      case 'withdrawal': return <Badge className={`${baseClass} bg-white/10 text-white/60`}>WITHDRAWAL</Badge>;
      case 'prize': return <Badge className={`${baseClass} bg-muted-teal text-white`}>PRIZE</Badge>;
      case 'entry_fee': return <Badge className={`${baseClass} bg-white/5 text-white/40`}>ENTRY FEE</Badge>;
      default: return <Badge className={`${baseClass} bg-white/5 text-white/40`}>{type.replace('_', ' ').toUpperCase()}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClass = "text-[9px] font-bold px-3 py-1 rounded-full border-none shadow-sm";
    switch (status) {
      case 'completed': return <Badge className={`${baseClass} bg-muted-teal text-white`}>COMPLETED</Badge>;
      case 'pending': return <Badge className={`${baseClass} bg-white/20 text-white`}>PENDING</Badge>;
      case 'failed': return <Badge className={`${baseClass} bg-red-500/20 text-red-400`}>FAILED</Badge>;
      default: return <Badge className={`${baseClass} bg-white/5 text-white/40`}>{status.toUpperCase()}</Badge>;
    }
  };

  return (
    <main className="min-h-screen pb-32 bg-dark-slate-grey bg-[radial-gradient(circle_at_50%_0%,_#2d4d43_0%,_#243e36_100%)]">
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-muted-teal/10 rounded-full blur-[120px]" />
      </div>

      <div className="px-6 pt-24 relative z-10 space-y-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="space-y-1">
          <h4 className="text-[10px] font-bold text-muted-teal uppercase tracking-[0.4em]">Financial Command</h4>
          <h1 className="text-4xl font-heading text-white">Capital <span className="italic font-serif text-white/60">Flow</span></h1>
        </div>

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
              className={`rounded-[2.5rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden group ${
                stat.primary ? "bg-muted-teal/20 backdrop-blur-xl border-muted-teal/30" : "bg-white/5 backdrop-blur-xl"
              }`}
            >
              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-1">
                  <p className={`text-[10px] uppercase font-bold tracking-[0.2em] ${stat.primary ? "text-muted-teal" : "text-white/40"}`}>{stat.label}</p>
                  <h3 className="text-3xl font-heading text-white">₹{stat.value.toLocaleString()}</h3>
                </div>
                <div className={`p-4 rounded-2xl ${stat.primary ? "bg-muted-teal text-white shadow-[0_0_20px_rgba(107,191,89,0.3)]" : "bg-white/10 text-muted-teal"} group-hover:scale-110 transition-transform duration-500`}>
                  <stat.icon size={24} />
                </div>
              </div>
              <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-[60px] ${stat.primary ? "bg-muted-teal/20" : "bg-white/5"}`} />
            </motion.div>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-6 shadow-2xl flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <Input 
              className="bg-white/5 border-none pl-14 rounded-2xl h-14 text-xs font-bold tracking-wide focus-visible:ring-muted-teal placeholder:text-white/20 text-white" 
              placeholder="SEARCH BY ID OR PLAYER NAME..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px] h-14 rounded-2xl bg-white/5 border-none font-bold text-[10px] tracking-widest text-white">
                <SelectValue placeholder="TYPE" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-white/10 bg-[#0a4d4b] text-white">
                <SelectItem value="all">ALL TYPES</SelectItem>
                <SelectItem value="deposit">DEPOSIT</SelectItem>
                <SelectItem value="withdrawal">WITHDRAWAL</SelectItem>
                <SelectItem value="prize">PRIZE</SelectItem>
                <SelectItem value="entry_fee">ENTRY FEE</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] h-14 rounded-2xl bg-white/5 border-none font-bold text-[10px] tracking-widest text-white">
                <SelectValue placeholder="STATUS" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-white/10 bg-[#0a4d4b] text-white">
                <SelectItem value="all">ALL STATUS</SelectItem>
                <SelectItem value="pending">PENDING</SelectItem>
                <SelectItem value="completed">COMPLETED</SelectItem>
                <SelectItem value="failed">FAILED</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Transaction List */}
        <div className="space-y-6">
          <div className="flex items-end justify-between px-2">
            <div className="space-y-1">
              <h3 className="text-2xl font-heading text-white">Arena <span className="italic font-serif text-white/60">Ledger</span></h3>
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">{filteredTransactions.length} ENTRIES DETECTED</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-[10px] font-bold text-white/40 hover:text-muted-teal uppercase tracking-[0.2em]"
              onClick={() => toast.info("Exporting data feature coming soon")}
            >
              DOWNLOAD CSV <Download size={14} className="ml-1" />
            </Button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-6 bg-white/5 backdrop-blur-xl rounded-[3rem] border border-white/10">
              <Loader2 className="w-12 h-12 animate-spin text-white/10" />
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">Accessing Data Chambers...</p>
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
                      className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-6 flex flex-col md:flex-row justify-between md:items-center border border-white/10 hover:border-muted-teal/30 hover:bg-white/[0.08] transition-all duration-500 group cursor-pointer"
                    >
                      <div className="flex items-center gap-6">
                        <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-transform duration-500 group-hover:scale-110 bg-white/5 text-white/20 group-hover:text-muted-teal`}>
                          {['deposit', 'prize'].includes(tx.type) ? <ArrowUpRight size={28} /> : <ArrowDownLeft size={28} />}
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-3">
                            <h4 className="text-lg font-heading text-white leading-none">{tx.profiles?.full_name || 'Arena System'}</h4>
                            {getStatusBadge(tx.status)}
                          </div>
                          <div className="flex items-center gap-3">
                            {getTypeBadge(tx.type)}
                            <span className="text-[9px] text-white/20 flex items-center gap-1 font-bold uppercase tracking-widest">
                              <Clock size={10} strokeWidth={3} /> {new Date(tx.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-10 mt-6 md:mt-0">
                        <div className="text-right">
                          <p className={`text-2xl font-heading ${['deposit', 'prize'].includes(tx.type) ? "text-muted-teal" : "text-white/40"}`}>
                            {['deposit', 'prize'].includes(tx.type) ? "+" : "-"}₹{Number(tx.amount).toLocaleString()}
                          </p>
                          <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">ID: {tx.id.slice(0, 8)}</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 group-hover:bg-muted-teal group-hover:text-white transition-all">
                          <ChevronRight size={20} strokeWidth={3} />
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-32 bg-white/5 backdrop-blur-xl rounded-[3rem] border border-dashed border-white/10">
                    <AlertCircle size={64} strokeWidth={1} className="text-white/5 mb-6" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">No matching signals found</p>
                    <Button variant="link" onClick={() => { setSearch(""); setTypeFilter("all"); setStatusFilter("all"); }} className="text-muted-teal font-bold mt-4 text-[10px] tracking-widest uppercase">
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
        <SheetContent className="bg-[#073b3a] border-white/10 w-full sm:max-w-xl p-0 overflow-y-auto no-scrollbar text-white">
          {selectedTx && (
            <div className="flex flex-col h-full">
              <div className="p-10 bg-[#0a4d4b] border-b border-white/10 relative overflow-hidden">
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
                <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-muted-teal/20 blur-[100px] rounded-full" />
              </div>

              <div className="p-10 space-y-12 flex-1">
                {/* Financial Overview */}
                <div className="bg-white/5 p-10 rounded-[2.5rem] border border-white/10 flex flex-col items-center text-center gap-4 shadow-2xl">
                  <p className="text-[10px] text-white/20 uppercase font-bold tracking-[0.3em]">TRANSACTION VALUE</p>
                  <h2 className="text-6xl font-heading text-white">₹{Number(selectedTx.amount).toLocaleString()}</h2>
                  {getTypeBadge(selectedTx.type)}
                </div>

                {/* Information Sections */}
                <div className="space-y-10">
                  <div>
                    <h4 className="text-[10px] text-white/20 uppercase font-bold tracking-[0.3em] ml-2 mb-4">DOSSIER DETAILS</h4>
                    <div className="bg-white/5 rounded-[2.5rem] border border-white/10 divide-y divide-white/5 overflow-hidden shadow-2xl">
                      {[
                        { label: "Beneficiary", value: selectedTx.profiles?.full_name || 'ARENA SYSTEM', icon: UserIcon },
                        { label: "Timestamp", value: new Date(selectedTx.created_at).toLocaleString(), icon: Clock },
                        { label: "Classification", value: selectedTx.type.toUpperCase(), icon: Filter },
                        { label: "Description", value: selectedTx.description || 'OPERATIONAL LEDGER ENTRY', icon: Eye },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-6 hover:bg-white/[0.02] transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20">
                              <item.icon size={18} />
                            </div>
                            <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{item.label}</span>
                          </div>
                          <span className="text-[11px] font-bold text-white uppercase tracking-wide text-right max-w-[200px]">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedTx.metadata && (
                    <div>
                      <h4 className="text-[10px] text-white/20 uppercase font-bold tracking-[0.3em] ml-2 mb-4">TECHNICAL LOG</h4>
                      <div className="bg-black/40 rounded-[2.5rem] p-8 text-white/40 font-mono text-[10px] leading-loose break-all border border-white/5">
                        {JSON.stringify(selectedTx.metadata, null, 2)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Admin Actions Footer for Withdrawals */}
              {selectedTx.type === 'withdrawal' && selectedTx.status === 'pending' && (
                <div className="p-10 bg-[#0a4d4b] border-t border-white/10 shadow-2xl">
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      variant="outline"
                      disabled={processingId !== null}
                      className="h-16 rounded-[2rem] border-white/10 bg-white/5 text-white font-bold uppercase tracking-[0.2em] text-[10px] gap-3 hover:bg-red-900/20 hover:text-red-400"
                      onClick={() => handleUpdateStatus(selectedTx.id, selectedTx.user_id, selectedTx.amount, 'failed')}
                    >
                      {processingId === selectedTx.id ? <Loader2 className="animate-spin" /> : <XCircle size={20} />} REJECT PAYOUT
                    </Button>
                    <Button 
                      disabled={processingId !== null}
                      className="h-16 rounded-[2rem] bg-muted-teal hover:bg-muted-teal/80 text-white font-bold uppercase tracking-[0.2em] text-[10px] gap-3 shadow-2xl shadow-muted-teal/20 border-none"
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
