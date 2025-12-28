"use client";

import { 
  LayoutDashboard, 
  PlayCircle, 
  Trophy, 
  BarChart3, 
  ReceiptIndianRupee, 
  Users, 
  LogOut, 
  Globe2 as Globe,
  Layout
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Overview", icon: LayoutDashboard, href: "/admin" },
  { label: "Live Arena", icon: PlayCircle, href: "/admin/live" },
  { label: "Tournaments", icon: Trophy, href: "/admin/tournaments" },
  { label: "Leaderboard", icon: BarChart3, href: "/admin/leaderboard" },
  { label: "Transactions", icon: ReceiptIndianRupee, href: "/admin/transactions" },
  { label: "Stories", icon: Layout, href: "/admin/story" },
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
    <aside className="fixed left-0 top-0 bottom-0 w-72 bg-white text-ony border-r border-black/[0.03] hidden lg:flex flex-col z-50 shadow-sm">
      {/* Brand Header */}
      <div className="p-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-onyx rounded-2xl flex items-center justify-center text-white shadow-xl">
            <Globe size={24} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-black leading-none tracking-tight">Arena Admin</h1>
            <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em] mt-1.5">Control Console</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-6 space-y-2 overflow-y-auto no-scrollbar">
        <p className="text-[10px] font-black opacity-20 uppercase tracking-[0.3em] ml-2 mb-6">SYSTEM ACCESS</p>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.label} href={item.href} className="block">
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group",
                  isActive 
                    ? "bg-onyx text-white shadow-xl shadow-onyx/10" 
                    : "text-charcoal/40 hover:text-onyx hover:bg-off-white"
                )}
              >
                <div className={cn(
                  "p-2 rounded-xl transition-colors",
                  isActive ? "bg-white/10 text-white" : "bg-off-white group-hover:bg-white"
                )}>
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="text-[13px] font-black tracking-tight">
                  {item.label}
                </span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-lime-yellow shadow-[0_0_10px_#D7FD03]" />
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
          className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-charcoal/40 hover:text-onyx hover:bg-off-white transition-all group"
        >
          <div className="p-2 rounded-xl bg-off-white group-hover:bg-white">
            <LogOut size={18} strokeWidth={2} />
          </div>
          <span className="text-[13px] font-black tracking-tight">Log Out Terminal</span>
        </button>
      </div>
    </aside>
  );
}
