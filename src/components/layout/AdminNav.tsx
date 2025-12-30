"use client";

import { LayoutDashboard, PlayCircle, Trophy, BarChart3, ReceiptIndianRupee, ImageIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const navItems = [
  { label: "Overview", icon: LayoutDashboard, href: "/admin" },
  { label: "Live", icon: PlayCircle, href: "/admin/live" },
  { label: "Tournaments", icon: Trophy, href: "/admin/tournaments" },
  { label: "Leaderboard", icon: BarChart3, href: "/admin/leaderboard" },
  { label: "Transactions", icon: ReceiptIndianRupee, href: "/admin/transactions" },
  { label: "Stories", icon: ImageIcon, href: "/admin/stories" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-6 left-4 right-4 z-50 bg-white/95 backdrop-blur-xl rounded-[24px] shadow-[0_4px_32px_rgba(0,0,0,0.12)] border border-[#C8C8C4]/30 max-w-2xl mx-auto">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.label}
              href={item.href}
              className="relative flex flex-col items-center justify-center flex-1 h-full touch-target"
            >
              <motion.div
                initial={false}
                animate={{ 
                  scale: isActive ? 1.05 : 1,
                  y: isActive ? -2 : 0 
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="relative flex flex-col items-center gap-1"
              >
                <div className={`relative z-10 p-2 rounded-xl transition-all duration-300 ${
                    isActive 
                      ? "bg-[#A8E6CF] text-[#1A1A1A] shadow-lg shadow-[#A8E6CF]/30" 
                      : "text-[#4A4B48] hover:text-[#11130D]"
                  }`}>
                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  </div>

                  <span className={`text-[8px] font-black uppercase tracking-wide transition-colors duration-200 ${
                    isActive ? "text-[#1A1A1A]" : "text-[#4A4B48]"
                  }`}>
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom,0px)]" />
    </nav>
  );
}
