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
    <nav 
      className="fixed bottom-0 left-0 right-0 z-[1000] bg-[#1A1A1A] border-t border-white/5 rounded-t-[20px] shadow-[0_-4px_16px_rgba(0,0,0,0.2)] safe-bottom"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.label}
              href={item.href}
              className="relative flex flex-col items-center justify-center flex-1 h-full min-h-[48px] group touch-target"
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <div className="relative flex flex-col items-center justify-center gap-1">
                {/* Active Indicator Badge */}
                {isActive && (
                  <motion.div
                    layoutId="nav-badge"
                    className="absolute inset-0 -m-2 bg-[#5FD3BC]/10 rounded-full"
                    style={{ width: 40, height: 40, left: '50%', top: '40%', transform: 'translate(-50%, -50%)' }}
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                
                <Icon 
                  size={24} 
                  className={`relative z-10 transition-colors duration-300 ${
                    isActive ? "text-[#5FD3BC]" : "text-[#6B7280] group-hover:text-white"
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                
                <span className={`text-[10px] font-bold uppercase tracking-wide transition-colors duration-300 ${
                  isActive ? "text-[#5FD3BC]" : "text-[#6B7280] group-hover:text-white"
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
