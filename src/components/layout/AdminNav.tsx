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
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-2 sm:px-4 pb-safe">
      <div className="max-w-2xl mx-auto bg-card/95 backdrop-blur-xl border border-border shadow-[0_-4px_30px_rgba(0,0,0,0.15)] rounded-t-[24px] sm:rounded-[24px] sm:mb-4 overflow-hidden">
        <div className="flex justify-around items-center h-16 sm:h-18">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.label}
                href={item.href}
                className="relative flex flex-col items-center justify-center flex-1 h-full touch-target haptic-tap"
              >
                <motion.div
                  initial={false}
                  animate={{ 
                    scale: isActive ? 1.05 : 1,
                    y: isActive ? -1 : 0 
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="relative flex flex-col items-center gap-0.5 py-2"
                >
                  <div className={`relative z-10 p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all duration-200 ${
                    isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
                  }`}>
                    <Icon size={18} className="sm:w-5 sm:h-5" strokeWidth={isActive ? 2.5 : 2} />
                  </div>
  
                  <span className={`text-[8px] sm:text-[9px] font-bold uppercase tracking-wide sm:tracking-[0.15em] transition-colors duration-200 ${
                    isActive ? "text-primary" : "text-muted-foreground/60"
                  }`}>
                    {item.label}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
