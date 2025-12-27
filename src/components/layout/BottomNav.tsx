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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
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
                    y: isActive ? -4 : 0 
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="relative flex flex-col items-center gap-1"
                >
                  <div className={`relative z-10 p-2 rounded-xl transition-all duration-300 ${
                    isActive ? "bg-dark-emerald text-white shadow-lg shadow-dark-emerald/20" : "text-muted-foreground hover:text-foreground"
                  }`}>
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
    
                  <span className={`text-[9px] font-bold uppercase tracking-[0.15em] transition-colors duration-200 ${
                    isActive ? "text-dark-emerald" : "text-muted-foreground"
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
