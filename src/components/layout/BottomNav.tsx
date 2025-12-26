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
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-lg bg-white/80 backdrop-blur-3xl border border-jungle-teal/10 shadow-[0_25px_60px_-15px_rgba(0,127,95,0.2)] rounded-[2.5rem] px-4">
        <div className="flex justify-around items-center h-20">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.label}
                href={item.href}
                className="relative flex flex-col items-center justify-center flex-1 h-full outline-none group"
              >
                <div className="relative flex flex-col items-center gap-1.5 transition-all duration-300">
                    <motion.div
                      animate={{ 
                        scale: isActive ? 1.2 : 1,
                        y: isActive ? -4 : 0 
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        className={`relative z-10 transition-colors ${
                          isActive ? "text-jungle-teal" : "text-sea-green/30 group-hover:text-sea-green/60"
                        }`}
                    >
                      <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                      {isActive && (
                        <motion.div 
                          layoutId="nav-glow"
                          className="absolute -inset-2 bg-lemon-lime/20 rounded-full blur-md -z-10"
                        />
                      )}
                    </motion.div>
  
                    <span className={`text-[8px] font-bold uppercase tracking-[0.2em] transition-colors ${
                      isActive ? "text-jungle-teal" : "text-sea-green/20"
                    }`}>
                      {item.label}
                    </span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    );
}
