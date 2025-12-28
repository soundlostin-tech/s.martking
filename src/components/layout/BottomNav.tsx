"use client";

import { Home, Play, Swords, Wallet, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const navItems = [
  { label: "Home", icon: Home, href: "/" },
  { label: "LIVE", icon: Play, href: "/live" },
  { label: "Matches", icon: Swords, href: "/matches" },
  { label: "Wallet", icon: Wallet, href: "/wallet" },
  { label: "Profile", icon: User, href: "/profile" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-6 left-4 right-4 z-50 bg-white/95 backdrop-blur-xl rounded-[24px] shadow-[0_4px_32px_rgba(0,0,0,0.12)] border border-[#C8C8C4]/30 max-w-lg mx-auto">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          const isLive = item.label === "LIVE";
          
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
                  <div className={`relative z-10 p-2.5 rounded-2xl transition-all duration-300 ${
                    isActive 
                      ? "bg-foreground text-white shadow-xl shadow-foreground/20" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}>
                    <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                    {isLive && !isActive && (
                      <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                    )}
                  </div>
    
                  <span className={`text-[9px] font-bold uppercase tracking-widest transition-colors duration-200 ${
                    isActive ? "text-foreground" : "text-muted-foreground"
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
