"use client";

import { LayoutDashboard, PlayCircle, Trophy, BarChart3, ReceiptIndianRupee, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const navItems = [
  { label: "Dash", icon: LayoutDashboard, href: "/admin" },
  { label: "Live", icon: PlayCircle, href: "/admin/live" },
  { label: "Events", icon: Trophy, href: "/admin/tournaments" },
  { label: "Ranks", icon: BarChart3, href: "/admin/leaderboard" },
  { label: "Cash", icon: ReceiptIndianRupee, href: "/admin/transactions" },
  { label: "Users", icon: Users, href: "/admin/users" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-2xl bg-card/80 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-[2.5rem] px-4 overflow-hidden">
      <div className="flex justify-around items-center h-22 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.label}
              href={item.href}
              className="relative flex flex-col items-center justify-center flex-1 h-full outline-none"
            >
              <div className="relative flex flex-col items-center gap-1.5 transition-all duration-300 py-3">
                  <motion.div
                    animate={{ 
                      scale: isActive ? 1.15 : 1,
                      y: isActive ? -2 : 0 
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className={`relative z-10 p-2.5 rounded-2xl transition-colors ${
                      isActive ? "text-white bg-primary" : "text-foreground/30 hover:text-foreground/60"
                    }`}
                  >
                    <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  </motion.div>
  
                  <span className={`text-[9px] font-bold uppercase tracking-[0.2em] transition-colors ${
                    isActive ? "text-primary" : "text-foreground/20"
                  }`}>
                    {item.label}
                  </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
