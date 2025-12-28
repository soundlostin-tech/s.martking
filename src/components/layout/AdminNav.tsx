"use client";

import { LayoutDashboard, PlayCircle, Trophy, BarChart3, ReceiptIndianRupee, ImageIcon, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Overview", icon: LayoutDashboard, href: "/admin" },
  { label: "Live", icon: PlayCircle, href: "/admin/live" },
  { label: "Matches", icon: Trophy, href: "/admin/tournaments" },
  { label: "Leaders", icon: BarChart3, href: "/admin/leaderboard" },
  { label: "Txns", icon: ReceiptIndianRupee, href: "/admin/transactions" },
  { label: "Stories", icon: ImageIcon, href: "/admin/story" },
  { label: "Users", icon: Users, href: "/admin/users" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-lg" suppressHydrationWarning={true}>
      <div className="bg-white/95 backdrop-blur-xl border border-gray-100 rounded-[32px] shadow-[0_4px_24px_rgba(0,0,0,0.08)] px-4 py-3" suppressHydrationWarning={true}>
        <div className="flex justify-between items-center h-12" suppressHydrationWarning={true}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.label}
                href={item.href}
                className="relative flex flex-col items-center justify-center flex-1 h-full"
              >
                  <motion.div
                    initial={false}
                    animate={{ 
                      scale: isActive ? 1.1 : 1,
                      y: isActive ? -2 : 0 
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="flex flex-col items-center gap-1"
                    suppressHydrationWarning={true}
                  >
                        <div className={cn(
                          "p-2.5 rounded-full transition-all duration-300",
                          isActive 
                            ? "bg-[#2D3436] text-white shadow-md" 
                            : "text-[#95A5A6] hover:text-[#2D3436]"
                        )} suppressHydrationWarning={true}>
                        <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                      </div>
                  {isActive && (
                    <span className="text-[8px] font-black text-[#2D3436] uppercase tracking-tighter">
                      {item.label}
                    </span>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
      <div className="h-[env(safe-area-inset-bottom,0px)]" suppressHydrationWarning={true} />
    </nav>
  );
}
