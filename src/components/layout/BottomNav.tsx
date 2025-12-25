"use client";

import { Home, Play, Swords, Wallet, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

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
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-stone-100 px-6 pt-3 pb-8 flex justify-between items-center z-50 rounded-t-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        
        return (
          <Link
            key={item.label}
            href={item.href}
            className="flex flex-col items-center gap-1 group relative"
          >
            <div className={`p-2 rounded-2xl transition-all duration-300 ${isActive ? "bg-onyx text-lime-yellow shadow-lg scale-110 -translate-y-1" : "text-stone-400 group-hover:text-onyx"}`}>
              <Icon size={22} />
            </div>
            {isActive && (
              <motion.div 
                layoutId="nav-indicator"
                className="absolute -bottom-2 w-1.5 h-1.5 bg-onyx rounded-full" 
              />
            )}
            {!isActive && <span className="text-[10px] font-bold text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">{item.label}</span>}
          </Link>
        );
      })}
    </div>
  );
}
