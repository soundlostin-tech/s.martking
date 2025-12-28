"use client";

import { 
  Trophy, 
  Users, 
  Activity, 
  IndianRupee, 
  ChevronRight,
  Clock,
  Zap,
  TrendingUp,
  Loader2,
  ArrowUpRight
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
} from 'recharts';
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import Link from "next/link";
import { motion } from "framer-motion";
import { BentoCard } from "@/components/ui/BentoCard";
import { StatusBadge } from "@/components/ui/StatusBadge";

const revenueData = [
  { name: 'Mon', value: 4000 },
  { name: 'Tue', value: 3000 },
  { name: 'Wed', value: 2000 },
  { name: 'Thu', value: 2780 },
  { name: 'Fri', value: 1890 },
  { name: 'Sat', value: 2390 },
  { name: 'Sun', value: 3490 },
];

export default function AdminOverview() {
  const [stats, setStats] = useState({
    totalTournaments: 0,
    totalUsers: 0,
    activeToday: 0,
    totalRevenue: 0,
    pendingWithdrawals: 0
  });
  const [latestTournaments, setLatestTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [tRes, uRes, aRes, revRes, wRes] = await Promise.all([
        supabase.from("tournaments").select("id"),
        supabase.from("profiles").select("id"),
        supabase.from("participants").select("user_id")
          .gte("joined_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
        supabase.from("transactions").select("amount")
          .in("type", ["fee", "deposit", "entry_fee"]),
        supabase.from("transactions").select("id").eq("status", "pending").eq("type", "withdrawal")
      ]);

      setStats({
        totalTournaments: tRes.data?.length || 0,
        totalUsers: uRes.data?.length || 0,
        activeToday: aRes.data?.length || 0,
        totalRevenue: revRes.data?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0,
        pendingWithdrawals: wRes.data?.length || 0
      });

      const { data: tournaments } = await supabase
        .from("tournaments")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(4);
      setLatestTournaments(tournaments || []);
    } catch (error: any) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-onyx/20 mb-4" />
        <p className="text-[10px] font-black text-charcoal/40 uppercase tracking-[0.3em]">Synching Data...</p>
      </div>
    );
  }

  return (
    <main className="p-8 space-y-10">
      {/* Header */}
      <div className="space-y-1">
        <p className="text-[10px] font-black text-charcoal/40 uppercase tracking-[0.2em]">Operations</p>
        <h1 className="text-[40px] font-black leading-none">Overview</h1>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Users", value: stats.totalUsers, icon: Users, color: "mint" },
          { label: "Active Players", value: stats.activeToday, icon: Activity, color: "lavender" },
          { label: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, icon: IndianRupee, color: "yellow" },
          { label: "Pending Payouts", value: stats.pendingWithdrawals, icon: Clock, color: "coral" },
        ].map((stat, i) => (
          <BentoCard key={i} variant="pastel" pastelColor={stat.color as any} className="p-6 flex flex-col justify-between min-h-[160px]">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center">
                <stat.icon size={20} />
              </div>
              <ArrowUpRight size={16} className="opacity-20" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-onyx/40 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black">{stat.value}</h3>
            </div>
          </BentoCard>
        ))}
      </div>

      {/* Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Chart */}
        <BentoCard className="lg:col-span-2 p-8 border-none shadow-sm space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black">Revenue Performance</h3>
              <p className="text-[10px] font-bold text-charcoal/40 uppercase tracking-widest mt-1">Last 7 days growth</p>
            </div>
            <StatusBadge variant="live" className="text-[9px]" />
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D7FD03" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#D7FD03" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#888'}} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', background: '#fff', padding: '15px' }}
                  labelStyle={{fontWeight: 'black', fontSize: '12px', marginBottom: '5px'}}
                />
                <Area type="monotone" dataKey="value" stroke="#11130D" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </BentoCard>

        {/* Latest Activity */}
        <div className="space-y-6">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-xl font-black">Latest Events</h3>
            <Link href="/admin/tournaments" className="text-[10px] font-bold text-charcoal/40 uppercase tracking-widest underline">View Hub</Link>
          </div>
          <div className="space-y-4">
            {latestTournaments.map((t) => (
              <BentoCard key={t.id} className="p-5 border-none shadow-sm flex items-center justify-between group cursor-pointer hover:bg-off-white transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-off-white flex items-center justify-center group-hover:bg-white transition-colors">
                    <Trophy size={20} className="text-onyx/30" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black truncate max-w-[120px]">{t.title}</h4>
                    <p className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest mt-0.5">{format(new Date(t.created_at), "MMM d, HH:mm")}</p>
                  </div>
                </div>
                <StatusBadge variant={t.status === 'active' ? 'live' : 'upcoming'} className="text-[8px] px-2 py-0.5" />
              </BentoCard>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
