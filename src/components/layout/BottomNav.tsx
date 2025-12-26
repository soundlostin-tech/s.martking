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
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-lg bg-white/70 backdrop-blur-2xl border border-primary/10 shadow-[0_20px_50px_rgba(34,119,58,0.1)] rounded-[2.5rem] px-4 overflow-hidden">
        <div className="flex justify-around items-center h-22 py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.label}
                href={item.href}
                className="relative flex flex-col items-center justify-center flex-1 h-full outline-none"
              >
                <div className="relative flex flex-col items-center gap-1.5 transition-all duration-300 py-3">
                    <motion.div
                      animate={{ 
                        scale: isActive ? 1.15 : 1,
                        y: isActive ? -2 : 0 
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className={`relative z-10 transition-colors ${
                          isActive ? "text-primary" : "text-foreground/20 hover:text-foreground/40"
                        }`}
                    >
                      <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                    </motion.div>
  
                    <span className={`text-[9px] font-bold uppercase tracking-[0.2em] transition-colors ${
                      isActive ? "text-primary" : "text-foreground/10"
                    }`}>
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
