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
import { AdminNav } from "@/components/layout/AdminNav";

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
      <main className="min-h-screen pb-32 bg-transparent text-onyx font-sans">
        <div className="px-8 pt-24 relative z-10 max-w-6xl mx-auto space-y-16">
          {/* Hero Header */}
          <header className="relative">
            <div className="absolute -top-20 -left-10 w-64 h-64 bg-pastel-mint/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-[2px] bg-onyx/10" />
                <p className="text-[10px] font-black text-charcoal/40 uppercase tracking-[0.4em]">Operations Center</p>
              </div>
              <h1 className="text-[64px] font-black leading-[0.85] tracking-[-0.04em]">
                System<br />
                <span className="text-onyx/20">Overview</span>
              </h1>
            </div>
            
            <div className="absolute top-0 right-0 hidden md:block">
              <div className="bg-white/80 backdrop-blur-md px-6 py-4 rounded-[32px] shadow-soft border border-black/[0.03] flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-pastel-mint shadow-[0_0_15px_rgba(193,230,192,0.8)] animate-pulse" />
                <div>
                  <p className="text-[10px] font-black text-onyx uppercase tracking-widest">Live Status</p>
                  <p className="text-[12px] font-bold text-charcoal/40 uppercase tracking-tighter">All Systems Nominal</p>
                </div>
              </div>
            </div>
          </header>
  
          {/* KPI Grid */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "Total Users", value: stats.totalUsers, icon: Users, color: "mint" },
              { label: "Active Players", value: stats.activeToday, icon: Activity, color: "lavender" },
              { label: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, icon: IndianRupee, color: "yellow" },
              { label: "Pending Payouts", value: stats.pendingWithdrawals, icon: Clock, color: "coral" },
            ].map((stat, i) => (
              <BentoCard key={i} variant="pastel" pastelColor={stat.color as any} className="p-7 flex flex-col justify-between h-[200px] relative overflow-hidden group">
                <div className="flex justify-between items-start relative z-10">
                  <div className="w-12 h-12 rounded-[20px] bg-white/60 flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                    <stat.icon size={22} className="text-onyx" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight size={14} className="text-onyx" />
                  </div>
                </div>
                <div className="relative z-10">
                  <p className="text-[10px] font-black text-onyx/40 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                  <h3 className="text-[42px] font-black leading-none tracking-tight">{stat.value}</h3>
                </div>
                {/* Decorative blobs inside cards */}
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
              </BentoCard>
            ))}
          </section>
  
          {/* Charts & Activity */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Performance Chart */}
            <BentoCard className="lg:col-span-2 p-10 border-none shadow-soft-lg space-y-10 relative overflow-hidden bg-white">
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black tracking-tight">Financial Performance</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <TrendingUp size={14} className="text-pastel-mint" />
                    <p className="text-[11px] font-bold text-charcoal/40 uppercase tracking-[0.15em]">Last 7 days revenue flow</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {['W', 'M', 'Y'].map((t) => (
                    <button key={t} className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-black transition-all",
                      t === 'W' ? "bg-onyx text-white shadow-lg" : "bg-off-white text-onyx hover:bg-black/5"
                    )}>{t}</button>
                  ))}
                </div>
              </div>
              <div className="relative z-10 h-[320px] -ml-6">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C1E6C0" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#C1E6C0" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="rgba(0,0,0,0.02)" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 10, fontWeight: '900', fill: '#11130D', opacity: 0.2}} 
                      dy={10}
                    />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ borderRadius: '28px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', background: '#11130D', padding: '20px' }}
                      itemStyle={{ color: '#fff', fontSize: '14px', fontWeight: '900' }}
                      labelStyle={{fontWeight: '900', fontSize: '10px', textTransform: 'uppercase', tracking: '0.2em', marginBottom: '8px', color: 'rgba(255,255,255,0.4)'}}
                      cursor={{ stroke: '#11130D', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#11130D" strokeWidth={5} fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </BentoCard>
  
            {/* Latest Activity */}
            <div className="space-y-8">
              <div className="flex justify-between items-center px-2">
                <h3 className="text-2xl font-black tracking-tight">Recent Hub</h3>
                <Link href="/admin/tournaments">
                  <motion.div 
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-2 text-[10px] font-black text-charcoal/40 uppercase tracking-widest group"
                  >
                    View All <ChevronRight size={14} className="group-hover:text-onyx" />
                  </motion.div>
                </Link>
              </div>
              <div className="space-y-4">
                {latestTournaments.map((t, i) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <BentoCard className="p-6 border-none shadow-soft flex items-center justify-between group cursor-pointer hover:shadow-soft-lg transition-all duration-300 bg-white">
                      <div className="flex items-center gap-5">
                        <div className={cn(
                          "w-14 h-14 rounded-[22px] flex items-center justify-center transition-all duration-500 group-hover:scale-110",
                          i % 2 === 0 ? "bg-pastel-sky/30" : "bg-pastel-peach/30"
                        )}>
                          <Trophy size={24} className="text-onyx/40 group-hover:text-onyx transition-colors" />
                        </div>
                        <div>
                          <h4 className="text-[15px] font-black tracking-tight leading-tight truncate max-w-[140px]">{t.title}</h4>
                          <p className="text-[10px] font-bold text-charcoal/30 uppercase tracking-[0.1em] mt-1">{format(new Date(t.created_at), "MMM d • HH:mm")}</p>
                        </div>
                      </div>
                      <StatusBadge variant={t.status === 'active' ? 'live' : 'upcoming'} className="text-[8px] font-black px-4 py-1.5" />
                    </BentoCard>
                  </motion.div>
                ))}
                {latestTournaments.length === 0 && (
                  <div className="py-24 text-center flex flex-col items-center gap-4 bg-white/50 rounded-[40px] border-2 border-dashed border-black/[0.03]">
                    <div className="w-16 h-16 rounded-full bg-off-white flex items-center justify-center">
                      <Zap size={28} className="text-onyx/10" />
                    </div>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-charcoal/20">Empty Activity Log</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    );
}
