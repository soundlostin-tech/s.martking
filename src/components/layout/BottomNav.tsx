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
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-t border-border pb-safe shadow-[0_-5px_20px_-10px_rgba(0,0,0,0.1)]">
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.label}
                href={item.href}
                className="relative flex flex-col items-center justify-center flex-1 h-full outline-none"
              >
                <motion.div
                  whileTap={{ scale: 0.85 }}
                  className="relative flex flex-col items-center gap-1 transition-all duration-300"
                >
                  <div className={`relative z-10 p-1.5 rounded-2xl transition-all duration-300 ${
                    isActive ? "bg-accent/10 text-secondary" : "text-muted-foreground"
                  }`}>
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
    
                  <span className={`text-[9px] font-bold uppercase tracking-wider transition-all duration-300 ${
                    isActive ? "text-secondary scale-110" : "text-muted-foreground"
                  }`}>
                    {item.label}
                  </span>

                {isActive && (
                  <motion.div 
                    layoutId="nav-indicator-glow"
                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-8 bg-accent/10 blur-xl rounded-full"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>
      {/* iOS Home Indicator Space */}
      <div className="h-4" />
    </nav>
  );
}
