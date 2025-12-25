"use client";

import { HeroSection } from "@/components/layout/HeroSection";
import { AdminNav } from "@/components/layout/AdminNav";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function AdminOverview() {
  const [stats, setStats] = useState({
    revenue: 0,
    tournaments: 0,
    players: 0,
    payouts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { count: tournamentCount } = await supabase
        .from("tournaments")
        .select("*", { count: 'exact', head: true });

      const { count: profileCount } = await supabase
        .from("profiles")
        .select("*", { count: 'exact', head: true });

      const { data: txData } = await supabase
        .from("transactions")
        .select("amount, type, status");

      const revenue = txData?.filter(t => t.type === 'entry_fee').reduce((acc, t) => acc + Number(t.amount), 0) || 0;
      const payouts = txData?.filter(t => t.type === 'winning' || (t.type === 'withdrawal' && t.status === 'completed')).reduce((acc, t) => acc + Number(t.amount), 0) || 0;

      setStats({
        revenue,
        tournaments: tournamentCount || 0,
        players: profileCount || 0,
        payouts,
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { name: "Mon", revenue: 4000 },
    { name: "Tue", revenue: 3000 },
    { name: "Wed", revenue: 2000 },
    { name: "Thu", revenue: 2780 },
    { name: "Fri", revenue: 1890 },
    { name: "Sat", revenue: 2390 },
    { name: "Sun", revenue: stats.revenue / 10 }, // Dummy for now
  ];

  return (
    <main className="min-h-screen pb-24 bg-stone-100">
      <HeroSection 
        title="Admin Dashboard" 
        subtitle="Overview of your arena performance."
        className="mx-0 rounded-none pb-24"
      >
        <div className="bg-white/5 backdrop-blur-md rounded-[24px] p-6 border border-white/10 mt-4 shadow-2xl">
          <p className="text-sm opacity-60 uppercase tracking-widest text-white mb-2">Total Revenue</p>
          <h2 className="text-4xl font-heading text-white">₹{stats.revenue.toLocaleString()}</h2>
          <div className="flex gap-2 mt-2">
            <span className="text-lime-yellow text-xs font-bold">+100%</span>
            <span className="text-white/40 text-xs">all time</span>
          </div>
        </div>
      </HeroSection>

      <div className="px-6 -mt-12 relative z-10 flex flex-col gap-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-lemon-lime" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Tourneys", value: stats.tournaments, color: "text-onyx" },
                { label: "Players", value: stats.players, color: "text-onyx" },
                { label: "Payouts", value: `₹${stats.payouts.toLocaleString()}`, color: "text-amber-600" },
              ].map((kpi, i) => (
                <div key={i} className="bg-alabaster-grey-2 p-4 rounded-2xl border border-stone-200 shadow-sm">
                  <p className="text-[10px] text-stone-500 uppercase font-bold mb-1">{kpi.label}</p>
                  <p className={`text-lg font-heading ${kpi.color}`}>{kpi.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-[24px] p-6 border border-stone-200 shadow-sm">
              <h3 className="font-heading text-xl mb-6">Revenue Trend</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#888" }} />
                    <Tooltip 
                      cursor={{ fill: "transparent" }}
                      contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
                    />
                    <Bar dataKey="revenue" fill="#D6FD02" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>

      <AdminNav />
    </main>
  );
}
