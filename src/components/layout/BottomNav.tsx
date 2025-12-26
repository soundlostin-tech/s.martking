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
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-lg bg-white/90 backdrop-blur-sm border-2 border-[#000033]/20 rounded-3xl shadow-lg -rotate-1 px-4">
      <div className="flex justify-around items-center h-16">
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
                whileTap={{ scale: 0.85 }}
                className="relative flex flex-col items-center gap-0.5 transition-all duration-300"
              >
                <div className={`relative z-10 p-1 rounded-xl transition-all duration-300 ${
                  isActive ? "text-[#000033] rotate-6 scale-125" : "text-[#000033]/30"
                }`}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </div>

                <span className={`text-[9px] font-handwritten font-bold uppercase tracking-wider transition-all duration-300 ${
                  isActive ? "text-[#000033]" : "text-[#000033]/20"
                }`}>
                  {item.label}
                </span>

                {isActive && (
                  <motion.div 
                    layoutId="nav-indicator"
                    className="absolute -bottom-1 w-6 h-0.5 bg-[#000033]/30 rounded-full"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
