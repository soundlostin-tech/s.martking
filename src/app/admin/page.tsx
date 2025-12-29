"use client";

import { AdminNav } from "@/components/layout/AdminNav";
import { BentoCard } from "@/components/ui/BentoCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
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
  Calendar,
  ArrowUpRight,
  ShieldAlert,
  Wallet
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";

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
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState("Week");
  const [stats, setStats] = useState({
    totalTournaments: 0,
    totalUsers: 0,
    activeToday: 0,
    totalRevenue: 0,
    pendingWithdrawals: 0,
    revenueGrowth: "+12.5%",
    userGrowth: "+8.2%",
  });
  const [latestTournaments, setLatestTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [tRes, uRes, aRes, revRes, wRes] = await Promise.all([
        supabase.from("tournaments").select("id"),
        supabase.from("profiles").select("id"),
        supabase.from("participants").select("user_id", { count: 'exact' })
          .gte("joined_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
        supabase.from("transactions").select("amount")
          .in("type", ["deposit", "entry_fee"]),
        supabase.from("transactions").select("id", { count: 'exact' })
          .eq("type", "withdrawal").eq("status", "pending")
      ]);

      setStats(prev => ({
        ...prev,
        totalTournaments: tRes.data?.length || 0,
        totalUsers: uRes.data?.length || 0,
        activeToday: aRes.count || 0,
        totalRevenue: revRes.data?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0,
        pendingWithdrawals: wRes.count || 0,
      }));

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-onyx/20" />
      </div>
    );
  }

  return (
    <main className="min-h-screen p-8 lg:p-12 space-y-12">
      {/* Header Section */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 blob-header blob-header-yellow">
        <div className="relative z-10">
          <p className="text-[10px] font-black text-charcoal/40 uppercase tracking-[0.3em] mb-2">Operations Hub</p>
          <h1 className="text-[44px] font-heading font-black leading-none tracking-tight text-onyx">
            Overview <br />
            <span className="text-charcoal-brown/40">Arena Performance</span>
          </h1>
        </div>
        
        <div className="relative z-10 flex bg-white p-1.5 rounded-[20px] shadow-sm border border-black/5 overflow-x-auto no-scrollbar">
          {["Today", "Week", "Month", "All"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                timeRange === range 
                  ? "bg-onyx text-white shadow-lg shadow-onyx/10" 
                  : "text-charcoal/40 hover:text-onyx"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </section>

      {/* KPI Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <BentoCard variant="vibrant" className="p-8 relative overflow-hidden h-48 flex flex-col justify-between">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black text-onyx/40 uppercase tracking-widest">Total Revenue</p>
              <div className="w-10 h-10 rounded-xl bg-onyx flex items-center justify-center shadow-lg">
                <IndianRupee size={20} className="text-lime-yellow" />
              </div>
            </div>
            <h3 className="text-3xl font-heading font-black text-onyx">₹{stats.totalRevenue.toLocaleString()}</h3>
            <div className="mt-2 flex items-center gap-1 text-[9px] font-black text-onyx/60 uppercase">
              <TrendingUp size={12} strokeWidth={3} />
              {stats.revenueGrowth} this {timeRange.toLowerCase()}
            </div>
          </div>
          <div className="absolute right-[-10px] bottom-[-10px] rotate-[-15deg] opacity-5 pointer-events-none">
            <Zap size={100} />
          </div>
        </BentoCard>

        <BentoCard variant="dark" className="p-8 h-48 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Active Members</p>
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Users size={20} className="text-white" />
              </div>
            </div>
            <h3 className="text-3xl font-heading font-black text-white">{stats.totalUsers.toLocaleString()}</h3>
            <div className="mt-2 flex items-center gap-1 text-[9px] font-black text-lime-yellow uppercase">
              <ArrowUpRight size={12} strokeWidth={3} />
              {stats.userGrowth} new entries
            </div>
          </div>
        </BentoCard>

        <BentoCard variant="pastel" pastelColor="mint" className="p-8 h-48 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black text-onyx/40 uppercase tracking-widest">Live Today</p>
              <div className="w-10 h-10 rounded-xl bg-white/40 flex items-center justify-center">
                <Activity size={20} className="text-onyx" />
              </div>
            </div>
            <h3 className="text-3xl font-heading font-black text-onyx">{stats.activeToday}</h3>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-onyx animate-pulse" />
              <p className="text-[9px] font-black text-onyx/40 uppercase tracking-widest">Real-time Telemetry</p>
            </div>
          </div>
        </BentoCard>

        <BentoCard variant="pastel" pastelColor="coral" className={`p-8 h-48 flex flex-col justify-between ${stats.pendingWithdrawals > 0 ? 'ring-2 ring-onyx shadow-xl' : ''}`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black text-onyx/40 uppercase tracking-widest">Pending Payouts</p>
              <div className="w-10 h-10 rounded-xl bg-white/40 flex items-center justify-center">
                <Wallet size={20} className="text-onyx" />
              </div>
            </div>
            <h3 className="text-3xl font-heading font-black text-onyx">{stats.pendingWithdrawals}</h3>
            <div className="mt-2">
              {stats.pendingWithdrawals > 0 ? (
                <Link href="/admin/transactions" className="text-[9px] font-black text-onyx uppercase underline underline-offset-4">Process Now</Link>
              ) : (
                <p className="text-[9px] font-black text-onyx/40 uppercase tracking-widest">Queue is clear</p>
              )}
            </div>
          </div>
        </BentoCard>
      </section>

      {/* Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <BentoCard className="lg:col-span-2 p-8 border-none shadow-sm h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-heading font-black text-onyx">Revenue Trend</h3>
              <p className="text-[10px] font-black text-charcoal/40 uppercase tracking-widest mt-1">Volume vs Time</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-lime-yellow" />
              <span className="text-[10px] font-black text-charcoal/60 uppercase">Successful deposits</span>
            </div>
          </div>
          <div className="flex-1 -ml-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D7FD03" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#D7FD03" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: '900', fill: '#4A4B48', opacity: 0.4}} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', background: '#11130D', padding: '15px' }}
                  itemStyle={{ color: '#D7FD03', fontSize: '14px', fontWeight: 'bold' }}
                  labelStyle={{ fontWeight: 'black', fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '5px' }}
                />
                <Area type="monotone" dataKey="value" stroke="#11130D" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </BentoCard>

        <div className="space-y-8">
          {/* Quick Actions */}
          <BentoCard variant="pastel" pastelColor="lavender" className="p-8 border-none shadow-sm flex flex-col justify-between h-[180px]">
            <h4 className="text-[10px] font-black text-onyx/40 uppercase tracking-[0.2em]">Quick Publish</h4>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/admin/tournaments">
                <button className="w-full bg-onyx text-white rounded-2xl py-4 flex flex-col items-center gap-2 shadow-lg active:scale-95 transition-all">
                  <Trophy size={18} className="text-lime-yellow" />
                  <span className="text-[9px] font-black uppercase">Event</span>
                </button>
              </Link>
              <Link href="/admin/live">
                <button className="w-full bg-white text-onyx rounded-2xl py-4 flex flex-col items-center gap-2 shadow-sm active:scale-95 transition-all">
                  <Activity size={18} className="text-charcoal/40" />
                  <span className="text-[9px] font-black uppercase">Stream</span>
                </button>
              </Link>
            </div>
          </BentoCard>

          {/* System Status */}
          <BentoCard className="p-8 border-none shadow-sm flex flex-col justify-between h-[180px]">
            <h4 className="text-[10px] font-black text-charcoal/40 uppercase tracking-[0.2em]">System Guard</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-pastel-mint" />
                  <span className="text-[11px] font-black text-onyx">DB Response</span>
                </div>
                <span className="text-[11px] font-black text-charcoal/40">12ms</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-pastel-mint" />
                  <span className="text-[11px] font-black text-onyx">Auth Engine</span>
                </div>
                <StatusBadge variant="completed" className="px-2 py-0.5 text-[8px]">ACTIVE</StatusBadge>
              </div>
            </div>
          </BentoCard>
        </div>
      </section>

      {/* Latest Tournaments */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-2xl font-heading text-onyx font-black">Latest Arenas</h3>
          <Link href="/admin/tournaments" className="text-[10px] font-black text-charcoal/40 uppercase tracking-widest hover:text-onyx transition-colors">View All Resources</Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {latestTournaments.map((t) => (
            <BentoCard key={t.id} className="p-6 flex items-center justify-between shadow-sm border-none active:scale-[0.98] transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-off-white flex items-center justify-center">
                  <Trophy size={20} className="text-charcoal/40" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-onyx leading-tight truncate max-w-[120px]">{t.title}</h4>
                  <p className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest mt-1">{format(new Date(t.created_at), "MMM d, HH:mm")}</p>
                </div>
              </div>
              <StatusBadge variant={t.status === 'active' ? 'live' : 'upcoming'} className="text-[8px] px-2 py-0.5" />
            </BentoCard>
          ))}
        </div>
      </section>

      <AdminNav />
    </main>
  );
}
