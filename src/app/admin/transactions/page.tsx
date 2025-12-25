"use client";

import { HeroSection } from "@/components/layout/HeroSection";
import { AdminNav } from "@/components/layout/AdminNav";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownLeft, Search, Filter, Download } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function AdminTransactions() {
  return (
    <main className="min-h-screen pb-24 bg-stone-100">
      <HeroSection 
        title="Transactions" 
        subtitle="Revenue and payouts monitoring."
        className="mx-0 rounded-none pb-32"
      />

      <div className="px-6 -mt-24 relative z-10 flex flex-col gap-6">
        <div className="bg-alabaster-grey p-1 rounded-[32px] border border-stone-200 shadow-xl">
          <div className="bg-onyx rounded-[28px] p-6 text-white">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-[10px] opacity-40 uppercase mb-1">Revenue</p>
                <p className="font-heading text-lg text-lime-yellow">₹12.4L</p>
              </div>
              <div>
                <p className="text-[10px] opacity-40 uppercase mb-1">Pending</p>
                <p className="font-heading text-lg">₹42.5k</p>
              </div>
              <div>
                <p className="text-[10px] opacity-40 uppercase mb-1">Paid</p>
                <p className="font-heading text-lg">₹8.2L</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
            <Input className="bg-white border-stone-200 pl-10 rounded-full h-10 text-xs" placeholder="Search transactions..." />
          </div>
          <button className="p-2.5 bg-white border border-stone-200 rounded-full text-stone-500">
            <Filter size={18} />
          </button>
          <button className="p-2.5 bg-white border border-stone-200 rounded-full text-onyx">
            <Download size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {[
            { user: "KillerKing_99", type: "Payout", amount: "-₹12,000", date: "Today, 02:45 PM", status: "Success" },
            { user: "ShadowNinja", type: "Entry Fee", amount: "+₹150", date: "Today, 01:12 PM", status: "Success" },
            { user: "Pro_Slayer", type: "Payout", amount: "-₹4,500", date: "Yesterday", status: "Pending" },
            { user: "Elite_Gamer", type: "Entry Fee", amount: "+₹150", date: "Yesterday", status: "Success" },
            { user: "FireStorm", type: "Entry Fee", amount: "+₹150", date: "24 Dec", status: "Success" },
          ].map((tx, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 flex justify-between items-center border border-stone-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${tx.type === "Entry Fee" ? "bg-lime-yellow/10 text-olive" : "bg-stone-100 text-stone-400"}`}>
                  {tx.type === "Entry Fee" ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                </div>
                <div>
                  <h4 className="font-medium text-sm">{tx.user}</h4>
                  <p className="text-[10px] text-stone-500">{tx.type} • {tx.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold text-sm ${tx.type === "Entry Fee" ? "text-olive" : "text-onyx"}`}>{tx.amount}</p>
                <Badge className={`text-[8px] h-4 rounded-full border-none ${tx.status === "Pending" ? "bg-amber-100 text-amber-600" : "bg-stone-100 text-stone-400"}`}>
                  {tx.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AdminNav />
    </main>
  );
}
