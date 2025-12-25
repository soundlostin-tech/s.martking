"use client";

import { HeroSection } from "@/components/layout/HeroSection";
import { AdminNav } from "@/components/layout/AdminNav";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownLeft, Search, Filter, Download, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: string;
  status: string;
  description: string;
  created_at: string;
  profiles?: {
    full_name: string;
  };
}

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState({
    revenue: 0,
    pending: 0,
    paid: 0
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
            full_name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
      
      const revenue = data?.filter(t => t.type === 'entry_fee').reduce((acc, t) => acc + Number(t.amount), 0) || 0;
      const paid = data?.filter(t => t.type === 'withdrawal' && t.status === 'completed').reduce((acc, t) => acc + Number(t.amount), 0) || 0;
      const pending = data?.filter(t => t.status === 'pending').reduce((acc, t) => acc + Number(t.amount), 0) || 0;

      setStats({ revenue, paid, pending });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(t => 
    t.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    t.description?.toLowerCase().includes(search.toLowerCase()) ||
    t.type?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen pb-24 bg-stone-100">
      <HeroSection 
        title="Transactions" 
        subtitle="Revenue and payouts monitoring."
        className="mx-0 rounded-none pb-32"
      />

      <div className="px-6 -mt-24 relative z-10 flex flex-col gap-6">
        <div className="bg-alabaster-grey p-1 rounded-[32px] border border-stone-200 shadow-xl">
          <div className="bg-onyx rounded-[28px] p-6 text-white">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-[10px] opacity-40 uppercase mb-1">Revenue</p>
                <p className="font-heading text-lg text-lime-yellow">₹{stats.revenue.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] opacity-40 uppercase mb-1">Pending</p>
                <p className="font-heading text-lg">₹{stats.pending.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] opacity-40 uppercase mb-1">Paid Out</p>
                <p className="font-heading text-lg">₹{stats.paid.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
            <Input 
              className="bg-white border-stone-200 pl-10 rounded-full h-10 text-xs shadow-sm" 
              placeholder="Search transactions..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="p-2.5 bg-white border border-stone-200 rounded-full text-stone-500 shadow-sm">
            <Filter size={18} />
          </button>
          <button className="p-2.5 bg-white border border-stone-200 rounded-full text-onyx shadow-sm">
            <Download size={18} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-lemon-lime" />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((tx) => (
                <div key={tx.id} className="bg-white rounded-2xl p-4 flex justify-between items-center border border-stone-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${['deposit', 'entry_fee'].includes(tx.type) ? "bg-lime-yellow/10 text-olive" : "bg-stone-100 text-stone-400"}`}>
                      {['deposit', 'entry_fee'].includes(tx.type) ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{tx.profiles?.full_name || 'System'}</h4>
                      <p className="text-[10px] text-stone-500 capitalize">{tx.type.replace('_', ' ')} • {new Date(tx.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-sm ${['deposit', 'entry_fee'].includes(tx.type) ? "text-olive" : "text-onyx"}`}>
                      {['deposit', 'entry_fee'].includes(tx.type) ? "+" : "-"}₹{Number(tx.amount).toLocaleString()}
                    </p>
                    <Badge className={`text-[8px] h-4 rounded-full border-none ${tx.status === "pending" ? "bg-amber-100 text-amber-600" : "bg-stone-100 text-stone-400"}`}>
                      {tx.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-stone-500 py-12">No transactions found</p>
            )}
          </div>
        )}
      </div>

      <AdminNav />
    </main>
  );
}
