"use client";

import { LayoutDashboard, PlayCircle, Trophy, BarChart3, ReceiptIndianRupee, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
    <div className="fixed bottom-0 left-0 right-0 bg-stone-100 border-t border-stone-200 px-4 py-2 flex justify-between items-center z-50 overflow-x-auto no-scrollbar">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        
        return (
          <Link
            key={item.label}
            href={item.href}
            className="flex flex-col items-center gap-1 group min-w-[60px]"
          >
            <div className={`p-1 rounded-md transition-all ${isActive ? "text-black" : "text-stone-400 group-hover:text-stone-600"}`}>
              <Icon size={20} />
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-tighter ${isActive ? "text-black" : "text-stone-400"}`}>
              {item.label}
            </span>
            {isActive && (
              <div className="h-0.5 w-4 bg-lime-yellow rounded-full" />
            )}
          </Link>
        );
      })}
    </div>
  );
}
