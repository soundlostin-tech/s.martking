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
  ResponsiveContainer
} from 'recharts';
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";

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
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
        <Loader2 className="w-12 h-12 animate-spin text-[#1A1A1A]/20" />
      </div>
    );
  }

  return (
    <main className="min-h-screen p-8 lg:p-12 space-y-12 relative z-10 bg-[#F5F5F5]">
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div>
          <p className="text-[10px] font-black text-[#1A1A1A]/40 uppercase tracking-[0.3em] mb-2">HQ DASHBOARD</p>
          <h1 className="text-[44px] font-heading font-black leading-none tracking-tight text-[#1A1A1A]">
            OVERVIEW <br />
            <span className="text-[#6B7280]/40">ARENA CONTROL</span>
          </h1>
        </div>
        
        <div className="flex bg-white p-1.5 rounded-[24px] shadow-md border-2 border-[#E5E7EB] overflow-x-auto no-scrollbar">
          {["Today", "Week", "Month", "All"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                timeRange === range 
                  ? "bg-[#1A1A1A] text-white shadow-xl shadow-[#1A1A1A]/10" 
                  : "text-[#6B7280]/40 hover:text-[#1A1A1A]"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <BentoCard variant="blue" className="p-8 relative overflow-hidden h-48 flex flex-col justify-between border-none shadow-xl">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black text-[#1A1A1A]/40 uppercase tracking-widest">TOTAL LOOT</p>
              <div className="w-10 h-10 rounded-xl bg-[#1A1A1A] flex items-center justify-center shadow-lg">
                <IndianRupee size={20} className="text-[#A8E6CF]" />
              </div>
            </div>
            <h3 className="text-3xl font-heading font-black text-[#1A1A1A]">₹{stats.totalRevenue.toLocaleString()}</h3>
            <div className="mt-2 flex items-center gap-1 text-[9px] font-black text-emerald-600 uppercase">
              <TrendingUp size={12} strokeWidth={3} />
              {stats.revenueGrowth} GROWTH
            </div>
          </div>
          <div className="absolute right-[-10px] bottom-[-10px] rotate-[-15deg] opacity-[0.05] pointer-events-none">
            <Zap size={100} />
          </div>
        </BentoCard>

        <BentoCard variant="purple" className="p-8 h-48 flex flex-col justify-between border-none shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black text-[#1A1A1A]/40 uppercase tracking-widest">OPERATIVES</p>
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md">
                <Users size={20} className="text-[#1A1A1A]" />
              </div>
            </div>
            <h3 className="text-3xl font-heading font-black text-[#1A1A1A]">{stats.totalUsers.toLocaleString()}</h3>
            <div className="mt-2 flex items-center gap-1 text-[9px] font-black text-[#1A1A1A]/60 uppercase">
              <ArrowUpRight size={12} strokeWidth={3} />
              {stats.userGrowth} ENLISTED
            </div>
          </div>
        </BentoCard>

        <BentoCard variant="mint" className="p-8 h-48 flex flex-col justify-between border-none shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black text-[#1A1A1A]/40 uppercase tracking-widest">ACTIVE NOW</p>
              <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center shadow-sm">
                <Activity size={20} className="text-[#1A1A1A]" />
              </div>
            </div>
            <h3 className="text-3xl font-heading font-black text-[#1A1A1A]">{stats.activeToday}</h3>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#1A1A1A] animate-pulse" />
              <p className="text-[9px] font-black text-[#1A1A1A]/40 uppercase tracking-widest">REAL-TIME INTEL</p>
            </div>
          </div>
        </BentoCard>

        <BentoCard variant="pink" className={`p-8 h-48 flex flex-col justify-between border-none shadow-xl ${stats.pendingWithdrawals > 0 ? 'ring-4 ring-[#1A1A1A]' : ''}`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black text-[#1A1A1A]/40 uppercase tracking-widest">PENDING PAYOUTS</p>
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md">
                <Wallet size={20} className="text-[#1A1A1A]" />
              </div>
            </div>
            <h3 className="text-3xl font-heading font-black text-[#1A1A1A]">{stats.pendingWithdrawals}</h3>
            <div className="mt-2">
              {stats.pendingWithdrawals > 0 ? (
                <Link href="/admin/transactions" className="text-[9px] font-black text-[#1A1A1A] uppercase underline decoration-4 underline-offset-4 decoration-[#1A1A1A]/20">EXECUTE TRANSFERS</Link>
              ) : (
                <p className="text-[9px] font-black text-[#1A1A1A]/40 uppercase tracking-widest">QUEUE SECURE</p>
              )}
            </div>
          </div>
        </BentoCard>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <BentoCard className="lg:col-span-2 p-8 border-none shadow-2xl h-[400px] flex flex-col bg-white">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-heading font-black text-[#1A1A1A]">REVENUE TELEMETRY</h3>
              <p className="text-[10px] font-black text-[#6B7280]/40 uppercase tracking-widest mt-1">OPERATIONAL VOLUME</p>
            </div>
            <div className="flex items-center gap-2 bg-[#F5F5F5] px-4 py-2 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-[#1A1A1A]" />
              <span className="text-[9px] font-black text-[#1A1A1A] uppercase">Validated Deposits</span>
            </div>
          </div>
          <div className="flex-1 -ml-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1A1A1A" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#1A1A1A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: '900', fill: '#1A1A1A', opacity: 0.4}} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', background: '#FFFFFF', padding: '20px' }}
                  itemStyle={{ color: '#1A1A1A', fontSize: '16px', fontWeight: '900' }}
                  labelStyle={{ fontWeight: '900', fontSize: '10px', color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', marginBottom: '8px' }}
                />
                <Area type="monotone" dataKey="value" stroke="#1A1A1A" strokeWidth={6} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </BentoCard>

        <div className="space-y-8">
          <BentoCard variant="peach" className="p-8 border-none shadow-xl flex flex-col justify-between h-[180px]">
            <h4 className="text-[10px] font-black text-[#1A1A1A]/40 uppercase tracking-[0.2em]">MISSION CONTROL</h4>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/admin/tournaments">
                <button className="w-full bg-[#1A1A1A] text-white rounded-[20px] py-5 flex flex-col items-center gap-2 shadow-xl active:scale-95 transition-all">
                  <Trophy size={20} className="text-[#A8E6CF]" />
                  <span className="text-[9px] font-black uppercase">NEW BATTLE</span>
                </button>
              </Link>
              <Link href="/admin/live">
                <button className="w-full bg-white text-[#1A1A1A] rounded-[20px] py-5 flex flex-col items-center gap-2 shadow-md active:scale-95 transition-all border border-[#E5E7EB]">
                  <Activity size={20} className="text-[#1A1A1A]/40" />
                  <span className="text-[9px] font-black uppercase">LIVE FEED</span>
                </button>
              </Link>
            </div>
          </BentoCard>

          <BentoCard variant="yellow" className="p-8 border-none shadow-xl flex flex-col justify-between h-[180px]">
            <h4 className="text-[10px] font-black text-[#1A1A1A]/40 uppercase tracking-[0.2em]">CORE INTEGRITY</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#1A1A1A]" />
                  <span className="text-[11px] font-black text-[#1A1A1A]">LATENCY</span>
                </div>
                <span className="text-[11px] font-black text-emerald-600">8MS</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#1A1A1A]" />
                  <span className="text-[11px] font-black text-[#1A1A1A]">SHIELD</span>
                </div>
                <StatusBadge variant="completed" className="px-3 py-1 text-[8px] bg-[#1A1A1A] text-white rounded-lg">MAX</StatusBadge>
              </div>
            </div>
          </BentoCard>
        </div>
      </section>

      <section className="space-y-6 pb-12">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-3xl font-heading text-[#1A1A1A] font-black tracking-tighter">LATEST MISSIONS</h3>
          <Link href="/admin/tournaments" className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-widest bg-white px-4 py-2 rounded-xl border-2 border-[#E5E7EB] hover:bg-gray-50 transition-all">ALL RESOURCES</Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {latestTournaments.map((t, idx) => {
            const colors = ["mint", "blue", "pink", "peach"];
            const color = colors[idx % colors.length] as any;
            return (
              <BentoCard key={t.id} variant={color} className="p-6 flex items-center justify-between shadow-lg border-none active:scale-[0.98] transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/40 flex items-center justify-center shadow-sm">
                    <Trophy size={24} className="text-[#1A1A1A]" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-[#1A1A1A] leading-tight truncate max-w-[120px] tracking-tight">{t.title}</h4>
                    <p className="text-[9px] font-bold text-[#1A1A1A]/40 uppercase tracking-widest mt-1">{format(new Date(t.created_at), "MMM d, HH:mm")}</p>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center shadow-lg">
                  <ChevronRight size={20} className="text-white" strokeWidth={3} />
                </div>
              </BentoCard>
            );
          })}
        </div>
      </section>

      <AdminNav />
    </main>
  );
}
