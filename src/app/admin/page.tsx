"use client";

import { HeroSection } from "@/components/layout/HeroSection";
import { AdminNav } from "@/components/layout/AdminNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Trophy, 
  Users, 
  Activity, 
  IndianRupee, 
  TrendingUp, 
  Calendar, 
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  LayoutDashboard
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

// Mock data for charts since DB might be empty
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
        // Fetch KPIs
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

        // Fetch Latest Tournaments
        const { data: tournaments } = await supabase
          .from("tournaments")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(4);
        setLatestTournaments(tournaments || []);

        // Fetch Latest Payouts (withdrawals)
        const { data: payouts, error: payoutsError } = await supabase
          .from("transactions")
          .select("*")
          .eq("type", "withdrawal")
          .order("created_at", { ascending: false })
          .limit(4);
        
        if (payoutsError) {
          console.error("Payouts fetch error:", payoutsError);
          setLatestPayouts([]);
        } else {
          setLatestPayouts(payouts || []);
        }

        // Mock Activity Log (since we don't have a dedicated table yet)
        setActivities([
          { id: 1, event: "Tournament Created", detail: "PUBG Mobile Pro League", time: "2m ago", icon: Trophy, color: "text-lemon-lime" },
          { id: 2, event: "User Suspended", detail: "User ID #8821 for cheating", time: "15m ago", icon: Users, color: "text-red-500" },
          { id: 3, event: "Payout Approved", detail: "₹5,000 to Rahul Sharma", time: "1h ago", icon: IndianRupee, color: "text-green-500" },
          { id: 4, event: "New Organizer", detail: "Matrix Esports joined", time: "3h ago", icon: Activity, color: "text-purple-500" },
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
    <main className="min-h-screen pb-32 bg-stone-50">
      <HeroSection 
        title="Admin Overview" 
        subtitle={`Welcome back, Admin. Here's what's happening today.`}
        className="mx-0 rounded-none pb-32"
      />

      <div className="px-6 -mt-24 relative z-10 space-y-6">
        {/* Time Range Selector */}
        <div className="flex bg-white p-1 rounded-2xl border border-stone-200 shadow-sm w-fit">
          {["Today", "Week", "Month", "All"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                timeRange === range 
                  ? "bg-onyx text-white shadow-md" 
                  : "text-stone-400 hover:text-onyx"
              }`}
            >
              {range}
            </button>
          ))}
        </div>

        {/* Summary KPIs */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="rounded-[32px] border-none shadow-xl bg-onyx text-white overflow-hidden relative">
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-lemon-lime">
                  <Trophy size={20} />
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-lemon-lime">
                  <ArrowUpRight size={12} />
                  {stats.revenueGrowth}%
                </div>
              </div>
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Total Tournaments</p>
              <h4 className="text-2xl font-heading mt-1">{stats.totalTournaments}</h4>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-lemon-lime/10 rounded-full blur-2xl" />
            </CardContent>
          </Card>

          <Card className="rounded-[32px] border-none shadow-xl bg-white overflow-hidden relative border border-stone-100">
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500">
                  <Users size={20} />
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-blue-500">
                  <ArrowUpRight size={12} />
                  {stats.userGrowth}%
                </div>
              </div>
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Registered Users</p>
              <h4 className="text-2xl font-heading mt-1">{stats.totalUsers}</h4>
            </CardContent>
          </Card>

          <Card className="rounded-[32px] border-none shadow-xl bg-white overflow-hidden relative border border-stone-100">
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-500">
                  <Activity size={20} />
                </div>
              </div>
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Active Players</p>
              <h4 className="text-2xl font-heading mt-1">{stats.activeToday}</h4>
              <p className="text-[9px] text-stone-400 mt-1 font-medium">Currently in arena</p>
            </CardContent>
          </Card>

          <Card className="rounded-[32px] border-none shadow-xl bg-white overflow-hidden relative border border-stone-100">
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-2xl bg-green-50 flex items-center justify-center text-green-500">
                  <IndianRupee size={20} />
                </div>
              </div>
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Platform Revenue</p>
              <h4 className="text-2xl font-heading mt-1">₹{stats.totalRevenue.toLocaleString()}</h4>
              <p className="text-[9px] text-stone-400 mt-1 font-medium">Net earnings</p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-heading text-onyx">Analytics</h2>
          
          <div className="space-y-4">
            <Card className="rounded-[32px] border-stone-200 shadow-sm overflow-hidden bg-white">
              <CardHeader className="p-6 pb-0">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-stone-400 flex items-center justify-between">
                  Revenue Growth
                  <Badge variant="outline" className="text-[9px] border-stone-100">Live</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-2 h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D6FD02" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#D6FD02" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 10, fill: '#A8A29E'}}
                    />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                      labelStyle={{fontWeight: 'bold', marginBottom: '4px'}}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#D6FD02" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorValue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="rounded-[32px] border-stone-200 shadow-sm overflow-hidden bg-white">
              <CardHeader className="p-6 pb-0">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-stone-400">
                  Player Engagement
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-2 h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={playerData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 10, fill: '#A8A29E'}}
                    />
                    <YAxis hide />
                    <Tooltip 
                      cursor={{fill: '#f8f8f8'}}
                      contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                    />
                    <Bar 
                      dataKey="players" 
                      fill="#1C1917" 
                      radius={[6, 6, 0, 0]} 
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Quick Panels */}
        <div className="grid grid-cols-1 gap-6">
          {/* Latest Tournaments */}
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-heading text-onyx">Latest Tournaments</h2>
              <Link href="/admin/tournaments" className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1">
                View All <ChevronRight size={14} />
              </Link>
            </div>
            <div className="space-y-3">
              {latestTournaments.length > 0 ? (
                latestTournaments.map((t) => (
                  <div key={t.id} className="bg-white p-4 rounded-[24px] border border-stone-100 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center text-stone-400">
                        <Trophy size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs leading-tight">{t.title}</h4>
                        <p className="text-[9px] text-stone-400 font-medium">Created {format(new Date(t.created_at), "MMM d, HH:mm")}</p>
                      </div>
                    </div>
                    <Badge className={`${t.status === 'upcoming' ? 'bg-green-50 text-green-600' : 'bg-stone-100 text-stone-500'} border-none text-[8px] uppercase`}>
                      {t.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="bg-white p-8 rounded-[24px] border border-dashed border-stone-200 text-center">
                  <p className="text-[10px] text-stone-400 font-bold uppercase">No recent tournaments</p>
                </div>
              )}
            </div>
          </section>

          {/* Latest Payouts */}
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-heading text-onyx">Latest Withdrawals</h2>
              <Link href="/admin/transactions" className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1">
                View All <ChevronRight size={14} />
              </Link>
            </div>
            <div className="space-y-3">
              {latestPayouts.length > 0 ? (
                latestPayouts.map((p) => (
                  <div key={p.id} className="bg-white p-4 rounded-[24px] border border-stone-100 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-green-50 text-green-500 flex items-center justify-center">
                        <IndianRupee size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs leading-tight">{p.profile?.full_name || 'Arena Player'}</h4>
                        <p className="text-[9px] text-stone-400 font-medium">{format(new Date(p.created_at), "MMM d, HH:mm")}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-heading text-sm">₹{Number(p.amount).toLocaleString()}</p>
                      <span className={`text-[8px] font-bold uppercase tracking-widest ${p.status === 'completed' ? 'text-green-500' : 'text-orange-500'}`}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white p-8 rounded-[24px] border border-dashed border-stone-200 text-center">
                  <p className="text-[10px] text-stone-400 font-bold uppercase">No recent withdrawals</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Activity Log */}
        <section className="space-y-4">
          <h2 className="text-xl font-heading text-onyx">Activity Log</h2>
          <div className="bg-white rounded-[32px] border border-stone-200 shadow-sm p-2">
            {activities.map((activity, index) => (
              <div 
                key={activity.id} 
                className={`flex items-start gap-4 p-4 ${index !== activities.length - 1 ? 'border-b border-stone-50' : ''}`}
              >
                <div className={`mt-1 p-2 rounded-xl bg-stone-50 ${activity.color}`}>
                  <activity.icon size={16} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h5 className="text-[11px] font-bold text-onyx">{activity.event}</h5>
                    <span className="text-[9px] text-stone-400 font-medium flex items-center gap-1">
                      <Clock size={10} /> {activity.time}
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-500 mt-0.5">{activity.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <AdminNav />
    </main>
  );
}
