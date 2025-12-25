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
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <div className="bg-onyx/90 backdrop-blur-2xl border border-white/10 p-1.5 flex justify-between items-center rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto w-full max-w-lg">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.label}
              href={item.href}
              className="relative flex flex-col items-center flex-1 py-1.5 outline-none group"
            >
              <div className="relative flex flex-col items-center gap-1.5">
                <div className="relative p-2.5 z-10">
                  {isActive && (
                    <>
                      <motion.div 
                        layoutId="active-glow"
                        className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                      <motion.div 
                        layoutId="active-pill"
                        className="absolute inset-0 bg-cyan-400 rounded-[20px] shadow-[0_8px_20px_rgba(34,211,238,0.3)]"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    </>
                  )}
                  
                  <motion.div
                    animate={{ 
                      scale: isActive ? 1.1 : 1,
                      y: isActive ? -2 : 0 
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className={`relative z-20 ${isActive ? "text-onyx" : "text-stone-500 group-hover:text-white transition-colors"}`}
                  >
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  </motion.div>
                </div>

                <motion.span 
                  animate={{ 
                    opacity: isActive ? 1 : 0.5,
                    scale: isActive ? 1.05 : 1,
                    y: isActive ? -1 : 0
                  }}
                  className={`text-[9px] font-black uppercase tracking-[0.15em] relative z-10 ${isActive ? "text-cyan-400" : "text-stone-500"}`}
                >
                  {item.label}
                </motion.span>
              </div>

              {isActive && (
                <motion.div 
                  layoutId="active-dot"
                  className="absolute bottom-0.5 w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
