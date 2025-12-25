"use client";

import { Home, Play, Swords, Wallet, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

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
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <div className="bg-onyx/90 backdrop-blur-2xl border border-white/10 px-2 py-2 flex justify-between items-center rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto w-full max-w-lg overflow-hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center gap-1 group relative flex-1 py-1"
            >
              <div className="relative">
                <AnimatePresence>
                  {isActive && (
                    <motion.div 
                      layoutId="nav-glow"
                      className="absolute inset-0 bg-lime-yellow/20 blur-xl rounded-full"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1.5, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                    />
                  )}
                </AnimatePresence>
                
                <div className={`relative z-10 p-2.5 rounded-2xl transition-all duration-500 ease-out ${isActive ? "bg-lime-yellow text-onyx shadow-[0_0_20px_rgba(214,253,2,0.4)] scale-110 -translate-y-1" : "text-stone-500 group-hover:text-white"}`}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </div>
              </div>

              <span className={`text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${isActive ? "text-lime-yellow opacity-100 scale-105" : "text-stone-500 opacity-60"}`}>
                {item.label}
              </span>
              
              {isActive && (
                <motion.div 
                  layoutId="nav-dot"
                  className="absolute -bottom-0.5 w-1 h-1 bg-lime-yellow rounded-full shadow-[0_0_10px_rgba(214,253,2,1)]"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
