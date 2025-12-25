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
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-stone-200 shadow-[0_-1px_10px_rgba(0,0,0,0.02)]">
      <div className="flex justify-around items-center h-20 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.label}
              href={item.href}
              className="relative flex flex-col items-center justify-center flex-1 h-full outline-none group"
            >
              {isActive && (
                <motion.div 
                  layoutId="active-line"
                  className="absolute top-0 w-12 h-1 bg-onyx rounded-b-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              
              <div className="relative flex flex-col items-center gap-1">
                <motion.div
                  animate={{ 
                    scale: isActive ? 1.05 : 1,
                    y: isActive ? -1 : 0 
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className={`relative ${isActive ? "text-onyx" : "text-stone-400 group-hover:text-onyx transition-colors"}`}
                >
                  <Icon size={24} strokeWidth={isActive ? 2.5 : 1.5} />
                </motion.div>

                <span className={`text-[10px] font-bold tracking-tight ${isActive ? "text-onyx" : "text-stone-400"}`}>
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
