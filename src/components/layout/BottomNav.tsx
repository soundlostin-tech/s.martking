"use client";

import { Home, Play, Swords, Wallet, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Home", icon: Home, href: "/" },
  { label: "Live", icon: Play, href: "/live" },
  { label: "Matches", icon: Swords, href: "/matches" },
  { label: "Wallet", icon: Wallet, href: "/wallet" },
  { label: "Profile", icon: User, href: "/profile" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-stone-100 border-t border-stone-200 px-6 py-3 flex justify-between items-center z-50">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        
        return (
          <Link
            key={item.label}
            href={item.href}
            className="flex flex-col items-center gap-1 group"
          >
            <div className={`p-1 rounded-md transition-all ${isActive ? "text-black" : "text-stone-400 group-hover:text-stone-600"}`}>
              <Icon size={24} />
            </div>
            {isActive && (
              <div className="h-1 w-6 bg-lime-yellow rounded-full" />
            )}
          </Link>
        );
      })}
    </div>
  );
}
