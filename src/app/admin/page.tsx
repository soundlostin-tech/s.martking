"use client";

import { AdminNav } from "@/components/layout/AdminNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Trophy, 
  Users, 
  Activity, 
  IndianRupee, 
  ChevronRight,
  ArrowUpRight,
  Clock,
  Zap,
  TrendingUp,
  ShieldCheck,
  AlertCircle
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
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// Mock data for charts - in a real app these would be aggregated from DB
const revenueData = [
  { name: 'Mon', value: 4000 },
  { name: 'Tue', value: 3000 },
  { name: 'Wed', value: 2000 },
  { name: 'Thu', value: 2780 },
  { name: 'Fri', value: 1890 },
  { name: 'Sat', value: 2390 },
  { name: 'Sun', value: 3490 },
];

const playerData = [
  { name: 'Mon', players: 120 },
  { name: 'Tue', players: 150 },
  { name: 'Wed', players: 180 },
  { name: 'Thu', players: 140 },
  { name: 'Fri', players: 210 },
  { name: 'Sat', players: 350 },
  { name: 'Sun', players: 280 },
];

export default function AdminOverview() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState("Week");
  const [stats, setStats] = useState({
    totalTournaments: 0,
    totalUsers: 0,
    activeToday: 0,
    totalRevenue: 0,
    revenueGrowth: 12.5,
    userGrowth: 8.2,
  });
  const [latestTournaments, setLatestTournaments] = useState<any[]>([]);
  const [latestPayouts, setLatestPayouts] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      // Individual try-catches for robustness and to prevent one failure blocking all
      const [tRes, uRes, aRes, revRes] = await Promise.all([
        supabase.from("tournaments").select("id"),
        supabase.from("profiles").select("id"),
        supabase.from("participants").select("user_id")
          .gte("joined_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
        supabase.from("transactions").select("amount")
          .in("type", ["fee", "deposit", "entry_fee"])
      ]);

      const tCount = tRes.data?.length || 0;
      const uCount = uRes.data?.length || 0;
      const aCount = aRes.data?.length || 0;
      const rev = revRes.data?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

      setStats(prev => ({
        ...prev,
        totalTournaments: tCount,
        totalUsers: uCount,
        activeToday: aCount,
        totalRevenue: rev,
      }));

      // Fetch latest items
      const { data: tournaments } = await supabase
        .from("tournaments")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(4);
      setLatestTournaments(tournaments || []);

      const { data: payouts } = await supabase
        .from("transactions")
        .select("*")
        .eq("type", "withdrawal")
        .order("created_at", { ascending: false })
        .limit(4);
      setLatestPayouts(payouts || []);

      setActivities([
        { id: 1, event: "System Sync", detail: "Arena telemetry updated", time: "Just now", icon: Activity },
        { id: 2, event: "Payout Monitor", detail: "Scanning withdrawal requests", time: "15m ago", icon: IndianRupee },
        { id: 3, event: "Event Audit", detail: "Tournament data integrity verified", time: "1h ago", icon: Trophy },
        { id: 4, event: "User Audit", detail: "Member registry synchronized", time: "3h ago", icon: Users },
      ]);
    } catch (error: any) {
      console.error("Error fetching admin dashboard data:", error);
      // toast.error("Telemetry failure. Reconnecting...");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading && !stats.totalUsers) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#073b3a]">
        <div className="space-y-4 text-center">
          <Activity className="w-12 h-12 animate-pulse text-muted-teal mx-auto" />
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Establishing Uplink...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-32 bg-dark-slate-grey bg-[radial-gradient(circle_at_50%_0%,_#2d4d43_0%,_#243e36_100%)]">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-muted-teal/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px]" />
      </div>

      <div className="px-6 pt-24 relative z-10 space-y-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h4 className="text-[10px] font-bold text-muted-teal uppercase tracking-[0.4em]">Intelligence Command</h4>
            <h1 className="text-4xl md:text-5xl font-heading text-white">Arena <span className="italic font-serif text-white/60">Overview</span></h1>
          </div>
          
          <div className="flex bg-white/5 backdrop-blur-xl p-1 rounded-[1.2rem] border border-white/10 shadow-2xl">
            {["Today", "Week", "Month", "All"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
                  timeRange === range 
                    ? "bg-muted-teal text-white shadow-[0_0_20px_rgba(107,191,89,0.3)]" 
                    : "text-white/40 hover:text-white hover:bg-white/5"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Summary KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "Tournaments", value: stats.totalTournaments, icon: Trophy, growth: stats.revenueGrowth, primary: true },
              { label: "Members", value: stats.totalUsers, icon: Users, growth: stats.userGrowth },
              { label: "Active Now", value: stats.activeToday, icon: Activity, sub: "In the Arena" },
              { label: "Net Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, icon: IndianRupee, sub: "Platform Earnings" },
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
                    <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${stat.primary ? "text-muted-teal" : "text-white/40"}`}>
                      {stat.label}
                    </p>
                    <h3 className="text-4xl font-heading text-white leading-none">{stat.value}</h3>
                    {stat.growth && (
                      <div className="flex items-center gap-1 text-[10px] font-bold mt-3 text-muted-teal">
                        <TrendingUp size={12} strokeWidth={3} />
                        {stat.growth}%
                      </div>
                    )}
                    {stat.sub && (
                      <p className="text-[9px] font-bold uppercase tracking-widest mt-3 text-white/20">{stat.sub}</p>
                    )}
                  </div>
                  <div className={`p-4 rounded-2xl ${stat.primary ? "bg-muted-teal text-white shadow-[0_0_20px_rgba(107,191,89,0.3)]" : "bg-white/10 text-muted-teal"} group-hover:scale-110 transition-all duration-500`}>
                    <stat.icon size={22} />
                  </div>
                </div>
                <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-[60px] ${stat.primary ? "bg-muted-teal/20" : "bg-white/5"}`} />
              </motion.div>
            ))}
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="rounded-[3rem] border-white/10 shadow-2xl overflow-hidden bg-white/5 backdrop-blur-xl p-8 space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-teal">FINANCIALS</h4>
                <h3 className="text-2xl font-heading text-white font-normal">Revenue <span className="italic font-serif text-white/60">Performance</span></h3>
              </div>
              <Badge className="bg-muted-teal/20 text-muted-teal rounded-full text-[9px] px-3 py-1 font-bold border border-muted-teal/20">LIVE DATA</Badge>
            </div>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6bbf59" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6bbf59" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fontWeight: 'bold', fill: '#ffffff30'}}
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{
                      borderRadius: '24px', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      boxShadow: '0 20px 40px rgba(0,0,0,0.4)', 
                      background: 'rgba(7, 59, 58, 0.95)', 
                      color: '#fff',
                      padding: '16px'
                    }}
                    labelStyle={{fontWeight: 'bold', fontSize: '12px', color: '#6bbf59', marginBottom: '8px'}}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#6bbf59" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="rounded-[3rem] border-white/10 shadow-2xl overflow-hidden bg-white/5 backdrop-blur-xl p-8 space-y-8">
            <div className="space-y-1">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-teal">ENGAGEMENT</h4>
              <h3 className="text-2xl font-heading text-white font-normal">Warrior <span className="italic font-serif text-white/60">Activity</span></h3>
            </div>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={playerData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fontWeight: 'bold', fill: '#ffffff30'}}
                  />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{fill: '#ffffff05'}}
                    contentStyle={{
                      borderRadius: '24px', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      boxShadow: '0 20px 40px rgba(0,0,0,0.4)', 
                      background: 'rgba(7, 59, 58, 0.95)', 
                      color: '#fff',
                      padding: '16px'
                    }}
                  />
                  <Bar 
                    dataKey="players" 
                    fill="#6bbf59" 
                    radius={[12, 12, 0, 0]} 
                    barSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Operations Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Latest Tournaments */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-end px-4">
              <div className="space-y-1">
                <h3 className="text-2xl font-heading text-white">Live <span className="italic font-serif text-white/60">Deployments</span></h3>
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">RECENT ARENA ACTIVITY</p>
              </div>
              <Link href="/admin/tournaments" className="group flex items-center gap-2 text-[10px] font-bold text-muted-teal uppercase tracking-widest hover:text-white transition-colors pb-1">
                COMMAND CENTER <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {latestTournaments.length > 0 ? (
                latestTournaments.map((t) => (
                  <motion.div 
                    key={t.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white/5 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10 shadow-xl flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 group-hover:bg-muted-teal/10 group-hover:text-muted-teal transition-all duration-500">
                        <Trophy size={24} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-heading text-white text-base leading-none">{t.title}</h4>
                        <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest flex items-center gap-2">
                          <Clock size={10} />
                          {format(new Date(t.created_at), "MMM d, HH:mm")}
                        </p>
                      </div>
                    </div>
                    <Badge className={`border-none text-[8px] px-3 py-1 font-bold tracking-widest rounded-full ${
                      t.status === 'active' ? 'bg-muted-teal text-white' : 'bg-white/10 text-white/40'
                    }`}>
                      {t.status.toUpperCase()}
                    </Badge>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-2 bg-white/5 backdrop-blur-xl p-16 rounded-[3rem] border border-dashed border-white/10 text-center space-y-4">
                  <Zap className="w-10 h-10 text-white/10 mx-auto" strokeWidth={1} />
                  <p className="text-[10px] text-white/20 font-bold uppercase tracking-[0.4em]">No active deployments</p>
                </div>
              )}
            </div>
          </div>

          {/* Activity Logs */}
          <div className="space-y-6">
            <div className="px-4 space-y-1">
              <h3 className="text-2xl font-heading text-white">System <span className="italic font-serif text-white/60">Logs</span></h3>
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">REAL-TIME AUDIT</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden">
              <div className="max-h-[420px] overflow-y-auto no-scrollbar">
                {activities.map((activity, index) => (
                  <div 
                    key={activity.id} 
                    className={`flex items-start gap-4 p-6 ${index !== activities.length - 1 ? 'border-b border-white/5' : ''} hover:bg-white/[0.02] transition-colors group`}
                  >
                    <div className="mt-1 p-3 rounded-xl bg-white/5 text-white/20 group-hover:text-muted-teal transition-colors">
                      <activity.icon size={18} />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div className="flex justify-between items-start">
                        <h5 className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{activity.event}</h5>
                        <span className="text-[8px] text-white/20 font-bold uppercase tracking-tighter flex items-center gap-1.5">
                          <Clock size={10} /> {activity.time}
                        </span>
                      </div>
                      <p className="text-xs text-white/40 font-serif italic leading-relaxed">{activity.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full py-6 bg-white/[0.02] text-[9px] font-bold uppercase tracking-[0.4em] text-white/20 hover:text-muted-teal hover:bg-white/[0.04] transition-all border-t border-white/5">
                ACCESS SYSTEM ARCHIVES
              </button>
            </div>
          </div>
        </div>
      </div>

      <AdminNav />
    </main>
  );
}
