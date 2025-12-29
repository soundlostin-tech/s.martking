"use client";

import { LayoutDashboard, PlayCircle, Trophy, BarChart3, ReceiptIndianRupee, Users, LogOut, Globe2 as Globe } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const navItems = [
  { label: "Overview", icon: LayoutDashboard, href: "/admin" },
  { label: "Live Arena", icon: PlayCircle, href: "/admin/live" },
  { label: "Tournament Management", icon: Trophy, href: "/admin/tournaments" },
  { label: "Leaderboard", icon: BarChart3, href: "/admin/leaderboard" },
  { label: "Transactions", icon: ReceiptIndianRupee, href: "/admin/transactions" },
  { label: "User Control", icon: Users, href: "/admin/users" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    window.location.href = "/signin";
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-72 bg-dark-emerald text-white hidden lg:flex flex-col z-50 shadow-2xl">
      {/* Brand Header */}
      <div className="p-8 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-dark-emerald shadow-xl">
            <Globe size={28} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-heading font-bold leading-none tracking-tight">Arena Admin</h1>
            <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em] mt-1">Control Console</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-6 space-y-2 overflow-y-auto no-scrollbar">
        <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.3em] ml-2 mb-4">SYSTEM ACCESS</p>
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
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group ${
                  isActive 
                    ? "bg-emerald-depths text-white shadow-lg shadow-black/10" 
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className={`p-2 rounded-xl transition-colors ${
                  isActive ? "bg-white text-dark-emerald shadow-inner" : "bg-white/5 group-hover:bg-white/10"
                }`}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="text-[13px] font-bold tracking-tight">
                  {item.label}
                </span>
                {isActive && (
                  <motion.div 
                    layoutId="active-nav-glow"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_white]"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-white/10">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-white/50 hover:text-white hover:bg-white/5 transition-all group"
        >
          <div className="p-2 rounded-xl bg-white/5 group-hover:bg-white/10">
            <LogOut size={20} strokeWidth={2} />
          </div>
          <span className="text-[13px] font-bold tracking-tight">Log Out Terminal</span>
        </button>
      </div>
    </aside>
  );
}
