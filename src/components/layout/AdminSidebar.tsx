"use client";

import { LayoutDashboard, PlayCircle, Trophy, BarChart3, ReceiptIndianRupee, Users, LogOut, Globe2 as Globe, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const navItems = [
  { label: "Overview", icon: LayoutDashboard, href: "/admin" },
  { label: "Live", icon: PlayCircle, href: "/admin/live" },
  { label: "Tournaments", icon: Trophy, href: "/admin/tournaments" },
  { label: "Leaderboard", icon: BarChart3, href: "/admin/leaderboard" },
  { label: "Transactions", icon: ReceiptIndianRupee, href: "/admin/transactions" },
  { label: "Users", icon: Users, href: "/admin/users" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    window.location.href = "/signin";
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-72 bg-white text-onyx hidden lg:flex flex-col z-50 border-r border-black/[0.03] shadow-sm">
      {/* Brand Header */}
      <div className="p-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-lime-yellow rounded-2xl flex items-center justify-center text-onyx shadow-lg shadow-lime-yellow/20">
            <Zap size={28} strokeWidth={3} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-heading font-black leading-none tracking-tight">SK Arena</h1>
            <p className="text-[10px] font-bold text-charcoal/40 uppercase tracking-[0.2em] mt-1.5">Control Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-6 space-y-2 overflow-y-auto no-scrollbar pt-4">
        <p className="text-[10px] font-black text-charcoal/30 uppercase tracking-[0.3em] ml-4 mb-6">Operations Hub</p>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.label}
              href={item.href}
              className="block"
            >
              <motion.div
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group ${
                  isActive 
                    ? "bg-onyx text-white shadow-xl shadow-onyx/10" 
                    : "text-charcoal/60 hover:text-onyx hover:bg-black/[0.02]"
                }`}
              >
                <div className={`p-2 rounded-xl transition-colors ${
                  isActive ? "bg-white/10 text-lime-yellow" : "bg-black/[0.03] group-hover:bg-black/[0.05]"
                }`}>
                  <Icon size={20} strokeWidth={isActive ? 3 : 2} />
                </div>
                <span className="text-[13px] font-black tracking-tight">
                  {item.label}
                </span>
                {isActive && (
                  <motion.div 
                    layoutId="admin-active-dot"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-lime-yellow shadow-[0_0_8px_#D7FD03]"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-black/[0.03]">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-charcoal/40 hover:text-onyx hover:bg-black/[0.02] transition-all group"
        >
          <div className="p-2 rounded-xl bg-black/[0.03] group-hover:bg-black/[0.05]">
            <LogOut size={20} strokeWidth={2.5} />
          </div>
          <span className="text-[13px] font-black tracking-tight uppercase tracking-widest">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
