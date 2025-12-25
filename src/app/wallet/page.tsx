"use client";

import { HeroSection } from "@/components/layout/HeroSection";
import { BottomNav } from "@/components/layout/BottomNav";
import { AnalyticsCard } from "@/components/ui/AnalyticsCard";
import { PillButton } from "@/components/ui/PillButton";
import { ArrowUpRight, ArrowDownLeft, History, Plus } from "lucide-react";

export default function Wallet() {
  return (
    <main className="min-h-screen pb-24 bg-stone-100">
      <HeroSection 
        title="Wallet" 
        subtitle="Track your prize money and payouts."
        className="mx-0 rounded-none pb-32"
      />

      <div className="px-6 -mt-24 relative z-10">
        <div className="bg-onyx rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden border border-white/10">
          <div className="relative z-10">
            <p className="text-sm font-medium opacity-60 uppercase tracking-widest mb-2">Current Balance</p>
            <h2 className="text-5xl font-heading mb-8">₹47,500.00</h2>
            
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10">
              <div>
                <p className="text-[10px] opacity-40 uppercase mb-1">Pending</p>
                <p className="font-heading text-lg">₹5,200</p>
              </div>
              <div>
                <p className="text-[10px] opacity-40 uppercase mb-1">In Play</p>
                <p className="font-heading text-lg text-lime-yellow">₹12,000</p>
              </div>
              <div>
                <p className="text-[10px] opacity-40 uppercase mb-1">Total Earned</p>
                <p className="font-heading text-lg">₹1.2L</p>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-48 h-48 bg-olive-leaf/30 blur-[60px] rounded-full" />
        </div>

        <div className="flex justify-between gap-4 mt-8">
          <PillButton variant="outline" className="flex-1 flex items-center justify-center gap-2">
            <Plus size={18} /> Add Funds
          </PillButton>
          <PillButton className="flex-1 flex items-center justify-center gap-2">
            <ArrowDownLeft size={18} /> Withdraw
          </PillButton>
        </div>

        <div className="mt-10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-heading">Transactions</h3>
            <button className="text-stone-500 flex items-center gap-1 text-sm font-medium">
              <History size={16} /> History
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {[
              { type: "Credit", label: "Tournament Win", amount: "+₹1,200", date: "24 Dec, 2025", status: "Success" },
              { type: "Debit", label: "Match Entry Fee", amount: "-₹150", date: "23 Dec, 2025", status: "Success" },
              { type: "Debit", label: "Match Entry Fee", amount: "-₹150", date: "22 Dec, 2025", status: "Success" },
              { type: "Credit", label: "Referral Bonus", amount: "+₹500", date: "20 Dec, 2025", status: "Pending" },
            ].map((tx, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 flex justify-between items-center border border-stone-200">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-full ${tx.type === "Credit" ? "bg-lime-yellow/10 text-olive" : "bg-stone-100 text-stone-500"}`}>
                    {tx.type === "Credit" ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{tx.label}</h4>
                    <p className="text-[10px] text-stone-500">{tx.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-sm ${tx.type === "Credit" ? "text-olive" : "text-onyx"}`}>{tx.amount}</p>
                  <p className={`text-[9px] font-bold uppercase ${tx.status === "Pending" ? "text-amber-500" : "text-stone-400"}`}>{tx.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
