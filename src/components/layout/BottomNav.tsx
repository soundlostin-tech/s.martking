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
    <nav className="bottom-nav-floating max-w-lg mx-auto left-4 right-4 sm:left-6 sm:right-6">
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
                  scale: isActive ? 1.1 : 1,
                  y: isActive ? -4 : 0 
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="relative flex flex-col items-center"
              >
                <div className={`p-2.5 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? "bg-lime-vibrant text-onyx" 
                    : "text-white/50 hover:text-white"
                }`}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  {isLive && !isActive && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-lime-vibrant rounded-full border border-onyx" />
                  )}
                </div>
                {isActive && (
                  <motion.div 
                    layoutId="nav-dot"
                    className="absolute -bottom-2 w-1 h-1 bg-lime-vibrant rounded-full"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom,0px)]" />
    </nav>
  );
}
