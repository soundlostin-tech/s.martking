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
  Zap
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
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";

// Mock data for charts
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { count: tournamentsCount } = await supabase
          .from("tournaments")
          .select("*", { count: 'exact', head: true });
        
        const { count: usersCount } = await supabase
          .from("profiles")
          .select("*", { count: 'exact', head: true });

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const { count: activeCount } = await supabase
          .from("participants")
          .select("user_id", { count: 'exact', head: true })
          .gte("joined_at", today.toISOString());

        const { data: revenueData } = await supabase
          .from("transactions")
          .select("amount")
          .in("type", ["fee", "deposit"]);
        
        const totalRevenue = revenueData?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

        setStats(prev => ({
          ...prev,
          totalTournaments: tournamentsCount || 0,
          totalUsers: usersCount || 0,
          activeToday: activeCount || 0,
          totalRevenue: totalRevenue,
        }));

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
          { id: 1, event: "Tournament Created", detail: "PUBG Mobile Pro League", time: "2m ago", icon: Trophy },
          { id: 2, event: "User Suspended", detail: "User ID #8821 for cheating", time: "15m ago", icon: Users },
          { id: 3, event: "Payout Approved", detail: "₹5,000 to Rahul Sharma", time: "1h ago", icon: IndianRupee },
          { id: 4, event: "New Organizer", detail: "Matrix Esports joined", time: "3h ago", icon: Activity },
        ]);

      } catch (error) {
        console.error("Error fetching admin dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <main className="min-h-screen pb-32 bg-transparent">
      <div className="px-6 pt-24 relative z-10 space-y-10 max-w-5xl mx-auto">
        {/* Time Range Selector */}
        <div className="flex bg-card/50 backdrop-blur-xl p-1.5 rounded-[1.5rem] border border-white/10 shadow-2xl w-fit mx-auto md:mx-0">
          {["Today", "Week", "Month", "All"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
                timeRange === range 
                  ? "bg-accent text-accent-foreground shadow-xl" 
                  : "text-white/40 hover:text-white hover:bg-white/5"
              }`}
            >
              {range}
            </button>
          ))}
        </div>

        {/* Summary KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                  stat.primary ? "bg-primary/40 backdrop-blur-xl text-white" : "bg-card/30 backdrop-blur-xl text-white"
                }`}
              >
                <div className="flex justify-between items-start relative z-10">
                  <div className="space-y-1">
                    <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${stat.primary ? "text-white/60" : "text-moss-green/60"}`}>
                      {stat.label}
                    </p>
                    <h3 className="text-3xl font-heading leading-none">{stat.value}</h3>
                    {stat.growth && (
                      <div className="flex items-center gap-1 text-[10px] font-bold mt-2 text-accent">
                        <ArrowUpRight size={12} strokeWidth={3} />
                        {stat.growth}% GROWTH
                      </div>
                    )}
                    {stat.sub && (
                      <p className="text-[9px] font-bold uppercase tracking-widest mt-2 text-white/40">{stat.sub}</p>
                    )}
                  </div>
                  <div className={`p-3.5 rounded-2xl ${stat.primary ? "bg-white/10 text-white" : "bg-moss-green/10 text-moss-green"} group-hover:scale-110 transition-transform duration-500`}>
                    <stat.icon size={22} />
                  </div>
                </div>
                <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full blur-2xl ${stat.primary ? "bg-white/10" : "bg-moss-green/5"}`} />
              </motion.div>
            ))}
        </div>

        {/* Analytics Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="rounded-[3rem] border-white/10 shadow-2xl overflow-hidden bg-card/30 backdrop-blur-xl p-8 space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-moss-green/40">FINANCIALS</h4>
                <h3 className="text-xl font-heading text-white">Revenue <span className="italic font-serif opacity-60">Flow</span></h3>
              </div>
              <Badge className="bg-accent text-accent-foreground rounded-full text-[9px] px-3 py-1 font-bold border-none">LIVE FEED</Badge>
            </div>
            <div className="h-[240px]">
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
                    contentStyle={{borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', background: 'rgba(7, 59, 58, 0.9)', color: '#fff'}}
                    labelStyle={{fontWeight: 'bold', fontSize: '12px', color: '#6bbf59'}}
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

          <Card className="rounded-[3rem] border-white/10 shadow-2xl overflow-hidden bg-card/30 backdrop-blur-xl p-8 space-y-8">
            <div className="space-y-1">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-moss-green/40">ENGAGEMENT</h4>
              <h3 className="text-xl font-heading text-white">Warrior <span className="italic font-serif opacity-60">Retention</span></h3>
            </div>
            <div className="h-[240px]">
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
                    contentStyle={{borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', background: 'rgba(7, 59, 58, 0.9)', color: '#fff'}}
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
        </section>

        {/* Intelligence Feeds */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Latest Tournaments */}
          <section className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-end px-2">
              <div className="space-y-1">
                <h3 className="text-2xl font-heading text-white">Live <span className="italic font-serif opacity-60">Deployments</span></h3>
                <p className="text-[10px] font-bold text-moss-green/40 uppercase tracking-[0.2em]">RECENT TOURNAMENTS</p>
              </div>
              <Link href="/admin/tournaments" className="text-[10px] font-bold text-white/40 hover:text-accent uppercase tracking-[0.2em] flex items-center gap-2 mb-1 transition-colors">
                EXPLORE ALL <ChevronRight size={14} strokeWidth={3} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {latestTournaments.length > 0 ? (
                latestTournaments.map((t) => (
                  <div key={t.id} className="bg-card/20 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10 shadow-2xl flex items-center justify-between group hover:border-accent/30 transition-all duration-500">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-accent group-hover:bg-accent/10 transition-all duration-500">
                        <Trophy size={24} />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="font-heading text-sm text-white">{t.title}</h4>
                        <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">{format(new Date(t.created_at), "MMM d, HH:mm")}</p>
                      </div>
                    </div>
                    <Badge className={`${t.status === 'upcoming' ? 'bg-accent text-accent-foreground' : 'bg-white/5 text-white/40'} border-none text-[8px] px-3 font-bold tracking-widest rounded-full`}>
                      {t.status.toUpperCase()}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="col-span-2 bg-card/10 backdrop-blur-xl p-12 rounded-[2.5rem] border border-dashed border-white/10 text-center">
                  <p className="text-[10px] text-white/20 font-bold uppercase tracking-[0.3em]">No recent deployments detected</p>
                </div>
              )}
            </div>
          </section>

          {/* Activity Log */}
          <section className="space-y-6">
            <div className="space-y-1 px-2">
              <h3 className="text-2xl font-heading text-white">Signal <span className="italic font-serif opacity-60">Logs</span></h3>
              <p className="text-[10px] font-bold text-moss-green/40 uppercase tracking-[0.2em]">SYSTEM ACTIVITY</p>
            </div>
            <div className="bg-card/20 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden">
              {activities.map((activity, index) => (
                <div 
                  key={activity.id} 
                  className={`flex items-start gap-4 p-6 ${index !== activities.length - 1 ? 'border-b border-white/5' : ''} hover:bg-white/[0.02] transition-colors`}
                >
                  <div className="mt-1 p-2.5 rounded-xl bg-white/5 text-moss-green/40">
                    <activity.icon size={18} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <h5 className="text-[10px] font-bold text-moss-green uppercase tracking-widest">{activity.event}</h5>
                      <span className="text-[9px] text-white/20 font-bold uppercase tracking-tighter flex items-center gap-1.5">
                        <Clock size={10} strokeWidth={3} /> {activity.time.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[11px] font-serif italic text-white/60 leading-relaxed">{activity.detail}</p>
                  </div>
                </div>
              ))}
              <div className="p-6 bg-white/[0.02] text-center">
                <button className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20 hover:text-white transition-colors">
                  VIEW ARCHIVES
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      <AdminNav />
    </main>
  );
}
