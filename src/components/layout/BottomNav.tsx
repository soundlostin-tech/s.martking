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
    <nav className="fixed bottom-8 left-6 right-6 z-50 bg-onyx text-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] px-4 py-3 max-w-lg mx-auto">
      <div className="flex justify-around items-center h-14">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          const isLive = item.label === "LIVE";
          
          return (
            <Link
              key={item.label}
              href={item.href}
              className="relative flex flex-col items-center justify-center flex-1 h-full"
            >
              <motion.div
                initial={false}
                animate={{ 
                  scale: isActive ? 1.05 : 1,
                  y: isActive ? -2 : 0 
                }}
                className="relative flex flex-col items-center"
              >
                  <div className={`p-2.5 rounded-2xl transition-all duration-300 ${
                    isActive 
                      ? "bg-electric-blue text-onyx shadow-[0_4px_16px_rgba(168,230,207,0.3)]" 
                      : "text-white/40 hover:text-white"
                  }`}>
                    <Icon size={20} strokeWidth={isActive ? 3 : 2} />
                    {isLive && !isActive && (
                      <span className="absolute top-2 right-2 w-2 h-2 bg-electric-blue rounded-full border border-onyx" />
                    )}
                  </div>
                  {isActive && (
                    <motion.span 
                      layoutId="nav-label"
                      className="text-[9px] font-black uppercase tracking-widest mt-1 text-electric-blue"
                    >
                      {item.label}
                    </motion.span>
                  )}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
