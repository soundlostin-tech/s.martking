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
      
      // Calculate Stats
      // Revenue = Fees + Entry Fees + Deposits (maybe just Fees/Entry Fees?)
      // Prompt says "Total revenue", "Total payouts", "Pending payouts"
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
      // 1. Update Transaction
      const { error: txError } = await supabase
        .from("transactions")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (txError) throw txError;

      // 2. Update Wallet
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
        // Refund if failed
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'deposit': return 'text-green-500 bg-green-50';
      case 'withdrawal': return 'text-blue-500 bg-blue-50';
      case 'prize': return 'text-amber-500 bg-amber-50';
      case 'entry_fee': return 'text-red-500 bg-red-50';
      default: return 'text-stone-500 bg-stone-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return 'bg-stone-100 text-stone-700';
    }
  };

  const handleExport = () => {
    const headers = ["ID", "User", "Type", "Amount", "Status", "Date"];
    const csvData = filteredTransactions.map(t => [
      t.id,
      t.profiles?.full_name || 'System',
      t.type,
      t.amount,
      t.status,
      new Date(t.created_at).toLocaleString()
    ]);
    
    const csvContent = [headers, ...csvData].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `transactions_${new Date().toISOString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="min-h-screen pb-24 bg-stone-50">
      <HeroSection 
        title="Arena Transactions" 
        subtitle="Full financial oversight and payout management."
        className="mx-0 rounded-none pb-32"
      >
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-lime-yellow/30 rounded-full blur-[100px]" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-onyx/30 rounded-full blur-[100px]" />
        </div>
      </HeroSection>

      <div className="px-6 -mt-24 relative z-10 space-y-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Total Revenue", value: stats.totalRevenue, icon: TrendingUp, color: "text-lime-yellow", trend: "+12.5%" },
            { label: "Total Payouts", value: stats.totalPayouts, icon: ArrowDownLeft, color: "text-blue-400", trend: "+5.2%" },
            { label: "Pending Payouts", value: stats.pendingPayouts, icon: Clock, color: "text-amber-400", trend: "Current" },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-onyx rounded-[32px] p-6 text-white border border-white/10 shadow-2xl relative overflow-hidden group"
            >
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-[10px] text-white/50 uppercase font-bold tracking-[0.2em] mb-1">{stat.label}</p>
                  <h3 className="text-3xl font-heading text-white">₹{stat.value.toLocaleString()}</h3>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className={`text-[10px] font-bold ${stat.color}`}>{stat.trend}</span>
                    <span className="text-[10px] text-white/30">vs last month</span>
                  </div>
                </div>
                <div className={`p-3 rounded-2xl bg-white/5 ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon size={24} />
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
            </motion.div>
          ))}
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-[40px] border border-stone-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <Input 
                className="bg-stone-50 border-stone-100 pl-12 rounded-2xl h-14 text-sm focus-visible:ring-lime-yellow" 
                placeholder="Search by ID or Player Name..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px] h-14 rounded-2xl bg-stone-50 border-stone-100">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-stone-200">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="deposit">Deposit</SelectItem>
                  <SelectItem value="withdrawal">Withdrawal</SelectItem>
                  <SelectItem value="prize">Prize</SelectItem>
                  <SelectItem value="entry_fee">Entry Fee</SelectItem>
                  <SelectItem value="fee">Service Fee</SelectItem>
                  <SelectItem value="bonus">Bonus</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] h-14 rounded-2xl bg-stone-50 border-stone-100">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-stone-200">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-4 pt-2 border-t border-stone-100">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <CalendarIcon size={16} className="text-stone-400" />
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Date Range:</span>
              <Input 
                type="date" 
                className="w-full md:w-36 h-10 rounded-xl bg-stone-50 border-stone-100 text-xs"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <span className="text-stone-300">to</span>
              <Input 
                type="date" 
                className="w-full md:w-36 h-10 rounded-xl bg-stone-50 border-stone-100 text-xs"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto md:ml-auto">
              <Button 
                variant="outline" 
                onClick={handleExport}
                className="flex-1 md:flex-none h-11 rounded-xl border-stone-200 text-onyx font-bold gap-2"
              >
                <Download size={18} /> Export
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => {
                  setSearch("");
                  setTypeFilter("all");
                  setStatusFilter("all");
                  setStartDate("");
                  setEndDate("");
                }}
                className="flex-1 md:flex-none h-11 rounded-xl text-stone-500 font-bold"
              >
                Reset
              </Button>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-heading text-xl text-onyx">History <span className="text-stone-400 text-sm font-sans ml-2">({filteredTransactions.length})</span></h3>
            <div className="flex items-center gap-2 text-stone-400 text-xs font-bold uppercase tracking-wider">
              <span>Sort:</span>
              <button className="text-onyx">Newest First</button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="relative">
                <Loader2 className="w-12 h-12 animate-spin text-lime-yellow" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 bg-onyx rounded-full" />
                </div>
              </div>
              <p className="text-stone-400 font-medium">Synchronizing arena ledgers...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx, idx) => (
                    <motion.div 
                      key={tx.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      layout
                      onClick={() => {
                        setSelectedTx(tx);
                        setIsDetailOpen(true);
                      }}
                      className="bg-white rounded-[32px] p-5 flex flex-col md:flex-row justify-between md:items-center border border-stone-200 hover:border-lime-yellow hover:shadow-xl hover:shadow-onyx/5 transition-all cursor-pointer group relative overflow-hidden"
                    >
                      <div className="flex items-center gap-4 z-10">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${getTypeColor(tx.type)}`}>
                          {['deposit', 'prize', 'bonus'].includes(tx.type) ? <ArrowUpRight size={24} /> : <ArrowDownLeft size={24} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-onyx">{tx.profiles?.full_name || 'Arena System'}</h4>
                            <Badge className={`text-[9px] font-bold px-2 py-0.5 rounded-full border-none ${getStatusColor(tx.status)}`}>
                              {tx.status.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-xs text-stone-400 mt-0.5 flex items-center gap-1.5">
                            <span className="font-bold uppercase text-[10px] tracking-wider text-stone-500">{tx.type.replace('_', ' ')}</span>
                            <span>•</span>
                            <Clock size={12} />
                            {new Date(tx.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-6 mt-4 md:mt-0 z-10">
                        <div className="text-right">
                          <p className={`text-xl font-heading ${['deposit', 'prize', 'bonus'].includes(tx.type) ? "text-green-600" : "text-onyx"}`}>
                            {['deposit', 'prize', 'bonus'].includes(tx.type) ? "+" : "-"}₹{Number(tx.amount).toLocaleString()}
                          </p>
                          <p className="text-[10px] text-stone-400 font-medium truncate max-w-[120px]">ID: ...{tx.id.slice(-8)}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-300 group-hover:bg-onyx group-hover:text-white transition-all">
                          <ChevronRight size={20} />
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-24 bg-white rounded-[40px] border border-dashed border-stone-300"
                  >
                    <div className="w-20 h-20 rounded-full bg-stone-50 flex items-center justify-center text-stone-300 mb-4">
                      <AlertCircle size={40} />
                    </div>
                    <p className="text-stone-500 font-medium">No transactions match your filters</p>
                    <Button variant="link" onClick={() => { setSearch(""); setTypeFilter("all"); setStatusFilter("all"); }} className="text-lime-yellow font-bold mt-2">
                      Clear all filters
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Detail Sheet */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="bg-stone-50 border-none w-full sm:max-w-md p-0 overflow-y-auto">
          {selectedTx && (
            <div className="flex flex-col h-full">
              <div className="p-8 bg-onyx text-white relative overflow-hidden">
                <SheetHeader className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <Badge className={`px-3 py-1 rounded-full border-none text-[10px] font-bold ${getStatusColor(selectedTx.status)}`}>
                      {selectedTx.status.toUpperCase()}
                    </Badge>
                    <div className="text-white/30 hover:text-white transition-colors cursor-pointer">
                      <ExternalLink size={20} />
                    </div>
                  </div>
                  <SheetTitle className="text-white text-3xl font-heading mb-1">Transaction Details</SheetTitle>
                  <SheetDescription className="text-white/50 text-xs uppercase tracking-widest font-bold">
                    ID: {selectedTx.id}
                  </SheetDescription>
                </SheetHeader>
                <div className="absolute top-0 right-0 w-64 h-64 bg-lime-yellow/20 rounded-full blur-[80px] -mr-32 -mt-32" />
              </div>

              <div className="p-8 space-y-8 flex-1">
                {/* Financial Summary */}
                <div className="bg-white rounded-[32px] p-6 shadow-sm border border-stone-100 flex flex-col items-center text-center">
                  <p className="text-[10px] text-stone-400 uppercase font-bold tracking-[0.2em] mb-2">Transaction Amount</p>
                  <h2 className="text-5xl font-heading text-onyx mb-4">₹{Number(selectedTx.amount).toLocaleString()}</h2>
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-[11px] font-bold ${getTypeColor(selectedTx.type)}`}>
                    {selectedTx.type.replace('_', ' ').toUpperCase()}
                  </div>
                </div>

                {/* User & Meta Information */}
                <div className="space-y-4">
                  <h4 className="text-[11px] text-stone-400 uppercase font-bold tracking-[0.2em] ml-2">Audit Information</h4>
                  <div className="bg-white rounded-[32px] border border-stone-100 divide-y divide-stone-50 overflow-hidden shadow-sm">
                    {[
                      { label: "Player / User", value: selectedTx.profiles?.full_name || 'Arena System', icon: UserIcon },
                      { label: "Date & Time", value: new Date(selectedTx.created_at).toLocaleString(), icon: CalendarIcon },
                      { label: "Description", value: selectedTx.description || 'No description provided', icon: Eye },
                      { label: "Method / Provider", value: selectedTx.metadata?.method || 'Smartking Wallet', icon: CreditCard },
                      { label: "Tournament Ref", value: selectedTx.metadata?.tournament_id ? `#${selectedTx.metadata.tournament_id.slice(-8)}` : 'N/A', icon: Target },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 hover:bg-stone-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-500">
                            <item.icon size={16} />
                          </div>
                          <span className="text-xs text-stone-500 font-medium">{item.label}</span>
                        </div>
                        <span className="text-xs font-bold text-onyx">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metadata Raw */}
                {selectedTx.metadata && Object.keys(selectedTx.metadata).length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-[11px] text-stone-400 uppercase font-bold tracking-[0.2em] ml-2">Technical Metadata</h4>
                    <div className="bg-onyx rounded-[32px] p-6 text-white/70 text-[10px] font-mono whitespace-pre-wrap leading-relaxed">
                      {JSON.stringify(selectedTx.metadata, null, 2)}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Footer for Payouts */}
              {selectedTx.type === 'withdrawal' && selectedTx.status === 'pending' && (
                <div className="p-8 bg-white border-t border-stone-100 shadow-[0_-10px_30px_rgba(0,0,0,0.03)] space-y-4">
                  <div className="flex gap-4">
                    <Button 
                      onClick={() => handleUpdateStatus(selectedTx.id, selectedTx.user_id, selectedTx.amount, 'failed')}
                      disabled={processingId !== null}
                      variant="outline"
                      className="flex-1 h-14 rounded-[24px] border-red-200 text-red-600 hover:bg-red-50 font-bold gap-2"
                    >
                      {processingId === selectedTx.id ? <Loader2 className="animate-spin" size={20} /> : <XCircle size={20} />}
                      Reject Payout
                    </Button>
                    <Button 
                      onClick={() => handleUpdateStatus(selectedTx.id, selectedTx.user_id, selectedTx.amount, 'completed')}
                      disabled={processingId !== null}
                      className="flex-1 h-14 rounded-[24px] bg-onyx hover:bg-lime-yellow hover:text-onyx text-white font-bold gap-2 transition-all"
                    >
                      {processingId === selectedTx.id ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                      Approve Payout
                    </Button>
                  </div>
                  <p className="text-[10px] text-stone-400 text-center px-4">
                    Approval will instantly mark this transaction as completed and update the user&apos;s wallet ledger.
                  </p>
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
