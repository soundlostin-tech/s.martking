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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-3xl border-t border-jungle-teal/5 pb-safe shadow-[0_-10px_40px_-15px_rgba(0,127,95,0.1)]">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.label}
              href={item.href}
              className="relative flex flex-col items-center justify-center flex-1 h-full outline-none group"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="relative flex flex-col items-center gap-1 transition-all duration-300"
              >
                <div className={`relative z-10 transition-colors ${
                  isActive ? "text-primary" : "text-foreground/30 group-hover:text-primary/60"
                }`}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  {isActive && (
                    <motion.div 
                      layoutId="nav-indicator"
                      className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-accent rounded-full shadow-[0_0_8px_rgba(191,210,0,0.6)]"
                    />
                  )}
                </div>

                <span className={`text-[9px] font-bold uppercase tracking-wider transition-colors ${
                  isActive ? "text-primary" : "text-foreground/20"
                }`}>
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
      {/* iOS Home Indicator Space */}
      <div className="h-5" />
    </nav>
  );
}
