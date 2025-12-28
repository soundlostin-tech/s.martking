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
      <aside className="fixed left-0 top-0 bottom-0 w-72 bg-white text-[#2D3436] border-r border-gray-100 hidden lg:flex flex-col z-50 shadow-sm">
        {/* Brand Header */}
        <div className="p-8 pt-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#2D3436] rounded-[24px] flex items-center justify-center text-white shadow-lg rotate-[-3deg]">
              <Globe size={28} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-black leading-none tracking-tight text-[#2D3436]">ARENA</h1>
              <p className="text-[10px] font-black text-[#95A5A6] uppercase tracking-[0.2em] mt-2">Admin Panel</p>
            </div>
          </div>
        </div>
  
        {/* Navigation */}
        <nav className="flex-1 p-6 space-y-3 overflow-y-auto no-scrollbar">
          <div className="px-4 mb-6">
            <p className="text-[10px] font-black text-[#B2BEC3] uppercase tracking-[0.4em]">Control Hub</p>
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.label} href={item.href} className="block">
                <motion.div
                  whileHover={{ x: 6 }}
                  whileTap={{ scale: 0.96 }}
                  className={cn(
                    "flex items-center gap-4 px-5 py-4 rounded-[24px] transition-all duration-300 group",
                    isActive 
                      ? "bg-[#2D3436] text-white shadow-lg" 
                      : "text-[#95A5A6] hover:text-[#2D3436] hover:bg-gray-50"
                  )}
                >
                  <div className={cn(
                    "p-2.5 rounded-xl transition-colors",
                    isActive ? "bg-white/10 text-white" : "bg-gray-50 group-hover:bg-white shadow-sm"
                  )}>
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className="text-[14px] font-black tracking-tight uppercase">
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div 
                      layoutId="active-nav-indicator"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FFF8E1] shadow-[0_0_12px_rgba(255,248,225,0.8)]" 
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>
  
        {/* Footer */}
        <div className="p-6 border-t border-gray-100">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-5 py-5 rounded-[24px] text-[#95A5A6] hover:text-[#2D3436] hover:bg-gray-50 transition-all group"
          >
            <div className="p-2.5 rounded-xl bg-gray-50 group-hover:bg-white shadow-sm">
              <LogOut size={20} strokeWidth={2} />
            </div>
            <span className="text-[14px] font-black tracking-tight uppercase">Exit Admin</span>
          </motion.button>
        </div>
      </aside>
    );
}
