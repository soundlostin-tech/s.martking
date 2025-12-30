"use client";

import { BottomNav } from "@/components/layout/BottomNav";
import { FeedList } from "@/components/feed/FeedList";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, TrendingUp, Clock, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";

export function FeedPageClient() {
  const { user } = useAuth(false);
  const [activeTab, setActiveTab] = useState<"trending" | "latest" | "following">("trending");

  const tabs = [
    { key: "trending" as const, label: "Trending", icon: TrendingUp },
    { key: "latest" as const, label: "Latest", icon: Clock },
    { key: "following" as const, label: "Following", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#1A1A1A]">
      <header className="sticky top-0 z-50 bg-[#F8F6F0]/80 backdrop-blur-xl border-b border-[#E5E7EB]">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/">
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 bg-white border border-[#E5E7EB] rounded-xl flex items-center justify-center shadow-sm"
            >
              <ArrowLeft size={18} className="text-[#1A1A1A]" />
            </motion.button>
          </Link>
          <div className="flex-1">
            <GlobalSearch placeholder="Search feed..." />
          </div>
        </div>

        <div className="px-4 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wide flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? "bg-[#1A1A1A] text-white"
                  : "bg-white text-[#6B7280] border border-[#E5E7EB]"
              }`}
            >
              <tab.icon size={12} />
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="px-4 pt-4 pb-24">
        <FeedList userId={user?.id} />
      </main>

      <BottomNav />
    </div>
  );
}
