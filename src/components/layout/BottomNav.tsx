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
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-2xl border-t border-stone-200/50 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] px-4 pb-safe">
      <div className="flex justify-around items-center h-20 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.label}
              href={item.href}
              className="relative flex flex-col items-center justify-center flex-1 h-full outline-none"
            >
              <div className="relative flex flex-col items-center gap-1.5 transition-all duration-300">
                <motion.div
                  animate={{ 
                    scale: isActive ? 1.1 : 1,
                    y: isActive ? -2 : 0 
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className={`relative z-10 p-2 rounded-2xl transition-colors ${
                    isActive ? "text-onyx bg-stone-50" : "text-stone-400 hover:text-onyx"
                  }`}
                >
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  {isActive && (
                    <motion.div 
                      layoutId="nav-dot"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-onyx rounded-full"
                    />
                  )}
                </motion.div>

                <span className={`text-[9px] font-black uppercase tracking-[0.15em] transition-colors ${
                  isActive ? "text-onyx opacity-100" : "text-stone-400 opacity-60"
                }`}>
                  {item.label}
                </span>
              </div>
              
              {isActive && (
                <motion.div 
                  layoutId="nav-pill"
                  className="absolute inset-x-2 inset-y-3 bg-stone-50/50 rounded-[24px] -z-0 border border-stone-100/50"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
