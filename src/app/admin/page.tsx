"use client";

import { HeroSection } from "@/components/layout/HeroSection";
import { AdminNav } from "@/components/layout/AdminNav";
import { AnalyticsCard } from "@/components/ui/AnalyticsCard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Mon", revenue: 4000, tournaments: 24 },
  { name: "Tue", revenue: 3000, tournaments: 18 },
  { name: "Wed", revenue: 2000, tournaments: 12 },
  { name: "Thu", revenue: 2780, tournaments: 20 },
  { name: "Fri", revenue: 1890, tournaments: 15 },
  { name: "Sat", revenue: 2390, tournaments: 25 },
  { name: "Sun", revenue: 3490, tournaments: 30 },
];

export default function AdminOverview() {
  return (
    <main className="min-h-screen pb-24 bg-stone-100">
      <HeroSection 
        title="Admin Dashboard" 
        subtitle="Overview of your arena performance."
        className="mx-0 rounded-none pb-24"
      >
        <div className="bg-white/5 backdrop-blur-md rounded-[24px] p-6 border border-white/10 mt-4 shadow-2xl">
          <p className="text-sm opacity-60 uppercase tracking-widest text-white mb-2">This Month Revenue</p>
          <h2 className="text-4xl font-heading text-white">₹8,42,500.00</h2>
          <div className="flex gap-2 mt-2">
            <span className="text-lime-yellow text-xs font-bold">+22.5%</span>
            <span className="text-white/40 text-xs">from last month</span>
          </div>
        </div>
      </HeroSection>

      <div className="px-6 -mt-12 relative z-10 flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Tourneys", value: "142", color: "text-onyx" },
            { label: "Players", value: "12.5k", color: "text-onyx" },
            { label: "Payouts", value: "₹2.1L", color: "text-amber-600" },
          ].map((kpi, i) => (
            <div key={i} className="bg-alabaster-grey-2 p-4 rounded-2xl border border-stone-200 shadow-sm">
              <p className="text-[10px] text-stone-500 uppercase font-bold mb-1">{kpi.label}</p>
              <p className={`text-lg font-heading ${kpi.color}`}>{kpi.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[24px] p-6 border border-stone-200 shadow-sm">
          <h3 className="font-heading text-xl mb-6">Revenue vs Events</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#888" }} />
                <Tooltip 
                  cursor={{ fill: "transparent" }}
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
                />
                <Bar dataKey="revenue" fill="#D6FD02" radius={[4, 4, 0, 0]} />
                <Bar dataKey="tournaments" fill="#11130D" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-heading text-xl px-2">Top Performers</h3>
          <div className="bg-alabaster-grey-2 rounded-[24px] border border-stone-200 overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center p-4 border-b border-stone-300 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-onyx rounded-full flex items-center justify-center text-white font-heading">
                    {i}
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Squad Hunters #{i}</h4>
                    <p className="text-[10px] text-stone-500">24 Matches • 86% Win Rate</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">₹12,400</p>
                  <p className="text-[10px] text-olive font-bold">TOP EARNER</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AdminNav />
    </main>
  );
}
