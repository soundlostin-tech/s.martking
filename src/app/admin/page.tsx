"use client";

import { AdminNav } from "@/components/layout/AdminNav";
import { Card } from "@/components/ui/card";
import { 
  Trophy, 
  Users, 
  Activity, 
  IndianRupee, 
  ChevronRight,
  Clock,
  Zap,
  TrendingUp
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
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
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

      const { data: tournaments } = await supabase
        .from("tournaments")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(4);
      setLatestTournaments(tournaments || []);

      setActivities([
        { id: 1, event: "System Sync", detail: "Telemetry updated", time: "Just now", icon: Activity },
        { id: 2, event: "Payout", detail: "Processing withdrawals", time: "15m ago", icon: IndianRupee },
        { id: 3, event: "Event", detail: "Data verified", time: "1h ago", icon: Trophy },
        { id: 4, event: "Users", detail: "Registry synchronized", time: "3h ago", icon: Users },
      ]);
    } catch (error: any) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading && !stats.totalUsers) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="space-y-3 text-center">
          <Activity className="w-10 h-10 animate-pulse text-primary mx-auto" />
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-24 bg-transparent text-foreground">
      <div className="px-4 sm:px-6 pt-6 sm:pt-8 relative z-10 space-y-6 sm:space-y-8 max-w-6xl mx-auto">
        {/* Header - Mobile Optimized */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-0.5">
            <h4 className="text-[9px] sm:text-[10px] font-bold text-secondary uppercase tracking-wider">Dashboard</h4>
            <h1 className="text-2xl sm:text-3xl font-heading text-foreground">Arena <span className="italic font-serif opacity-60">Overview</span></h1>
          </div>
          
          <div className="flex bg-muted p-1 rounded-xl border border-border overflow-x-auto no-scrollbar">
            {["Today", "Week", "Month", "All"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 sm:px-5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all whitespace-nowrap ${
                  timeRange === range 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground active:bg-muted/80"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* KPIs - Mobile Optimized */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: "Events", value: stats.totalTournaments, icon: Trophy, growth: stats.revenueGrowth, primary: true },
            { label: "Members", value: stats.totalUsers, icon: Users, growth: stats.userGrowth },
            { label: "Active", value: stats.activeToday, icon: Activity, sub: "Today" },
            { label: "Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, icon: IndianRupee, sub: "Total" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`mobile-card p-4 sm:p-6 relative overflow-hidden ${
                stat.primary ? "bg-accent/10 border-accent/30" : ""
              }`}
            >
              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-0.5">
                  <p className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wide ${stat.primary ? "text-secondary" : "text-muted-foreground"}`}>
                    {stat.label}
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-heading text-foreground leading-none">{stat.value}</h3>
                  {stat.growth && (
                    <div className="flex items-center gap-1 text-[9px] font-bold mt-1.5 text-secondary">
                      <TrendingUp size={10} strokeWidth={3} />
                      {stat.growth}%
                    </div>
                  )}
                  {stat.sub && (
                    <p className="text-[8px] font-bold uppercase tracking-wide mt-1.5 text-muted-foreground">{stat.sub}</p>
                  )}
                </div>
                <div className={`p-2.5 sm:p-3 rounded-xl ${stat.primary ? "bg-accent text-primary-foreground" : "bg-muted text-secondary"} border border-border`}>
                  <stat.icon size={18} className="sm:w-5 sm:h-5" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts - Mobile Optimized */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card className="mobile-card p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wide text-secondary">Revenue</h4>
                <h3 className="text-base sm:text-lg font-heading text-foreground">Performance</h3>
              </div>
              <Badge className="bg-accent/15 text-secondary rounded-full text-[8px] px-2 py-0.5 font-bold border-none">LIVE</Badge>
            </div>
            <div className="h-[180px] sm:h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16DB65" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#16DB65" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 'bold', fill: '#888'}} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e5e5e5', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', background: '#fff', padding: '10px' }}
                    labelStyle={{fontWeight: 'bold', fontSize: '11px', color: '#058c42'}}
                  />
                  <Area type="monotone" dataKey="value" stroke="#058C42" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="mobile-card p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div className="space-y-0.5">
              <h4 className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wide text-secondary">Engagement</h4>
              <h3 className="text-base sm:text-lg font-heading text-foreground">Activity</h3>
            </div>
            <div className="h-[180px] sm:h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={playerData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 'bold', fill: '#888'}} />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{fill: 'rgba(0,0,0,0.02)'}}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e5e5e5', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', background: '#fff', padding: '10px' }}
                  />
                  <Bar dataKey="players" fill="#058C42" radius={[6, 6, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Recent & Activity - Mobile Optimized */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Events */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-end px-1">
              <div className="space-y-0.5">
                <h3 className="text-base sm:text-lg font-heading text-foreground">Recent <span className="italic font-serif opacity-60">Events</span></h3>
                <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Latest activity</p>
              </div>
              <Link href="/admin/tournaments" className="text-[9px] sm:text-[10px] font-bold text-secondary uppercase tracking-wide flex items-center gap-1 touch-target">
                VIEW ALL <ChevronRight size={12} />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {latestTournaments.length > 0 ? (
                latestTournaments.map((t) => (
                  <motion.div 
                    key={t.id}
                    whileTap={{ scale: 0.98 }}
                    className="mobile-card p-4 flex items-center justify-between haptic-tap"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground border border-border">
                        <Trophy size={18} className="sm:w-5 sm:h-5" />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="font-heading text-foreground text-sm sm:text-base leading-none truncate max-w-[140px] sm:max-w-[180px]">{t.title}</h4>
                        <p className="text-[8px] sm:text-[9px] text-muted-foreground font-medium flex items-center gap-1.5">
                          <Clock size={10} />
                          {format(new Date(t.created_at), "MMM d, HH:mm")}
                        </p>
                      </div>
                    </div>
                    <Badge className={`border-none text-[7px] sm:text-[8px] px-2 py-0.5 font-bold tracking-wide rounded-full ${
                      t.status === 'active' ? 'bg-accent text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      {t.status.toUpperCase()}
                    </Badge>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-2 bg-muted/30 p-10 rounded-[20px] border border-dashed border-border text-center">
                  <Zap className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" strokeWidth={1} />
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide">No events</p>
                </div>
              )}
            </div>
          </div>

          {/* Activity Log */}
          <div className="space-y-4">
            <div className="px-1 space-y-0.5">
              <h3 className="text-base sm:text-lg font-heading text-foreground">System <span className="italic font-serif opacity-60">Log</span></h3>
              <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Real-time</p>
            </div>
            
            <div className="bg-card rounded-[20px] border border-border overflow-hidden">
              <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                {activities.map((activity, index) => (
                  <div 
                    key={activity.id} 
                    className={`flex items-start gap-3 p-4 ${index !== activities.length - 1 ? 'border-b border-border' : ''} active:bg-muted/50 transition-colors`}
                  >
                    <div className="mt-0.5 p-2 rounded-lg bg-muted text-muted-foreground border border-border">
                      <activity.icon size={14} />
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <div className="flex justify-between items-start">
                        <h5 className="text-[10px] font-bold text-foreground uppercase tracking-wide">{activity.event}</h5>
                        <span className="text-[8px] text-muted-foreground font-medium flex items-center gap-1">
                          <Clock size={9} /> {activity.time}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{activity.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AdminNav />
    </main>
  );
}
