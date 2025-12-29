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
    <nav className="fixed bottom-4 left-4 right-4 z-50 bg-[#1A1A1A] text-white rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] px-4 py-3 max-w-lg mx-auto safe-bottom" style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 12px))' }}>
      <div className="flex justify-around items-center h-14">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          const isLive = item.label === "LIVE";
          
          return (
            <Link
              key={item.label}
              href={item.href}
              className="relative flex flex-col items-center justify-center flex-1 h-full touch-target"
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
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
                    ? "bg-[#5FD3BC] text-[#1A1A1A] shadow-[0_4px_16px_rgba(95,211,188,0.3)]" 
                    : "text-[#9CA3AF] hover:text-white"
                }`}>
                  <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                  {isLive && !isActive && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-[#5FD3BC] rounded-full border border-[#1A1A1A]" />
                  )}
                </div>
                {isActive && (
                  <motion.span 
                    layoutId="nav-label"
                    className="text-[9px] font-bold uppercase tracking-widest mt-1 text-[#5FD3BC]"
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
