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
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <div className="bg-onyx/90 backdrop-blur-2xl border border-white/10 px-2 py-2 flex justify-between items-center rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto w-full max-w-lg overflow-hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center gap-1 group relative flex-1 py-1 outline-none"
            >
              <motion.div 
                whileTap={{ scale: 0.9 }}
                className="relative flex flex-col items-center"
              >
                <div className="relative">
                  {isActive && (
                    <motion.div 
                      layoutId="nav-glow"
                      className="absolute -inset-4 bg-cyan-400/20 blur-2xl rounded-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  {isActive && (
                    <motion.div 
                      layoutId="nav-active-bg"
                      className="absolute inset-0 bg-cyan-400 rounded-2xl shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    />
                  )}
                  
                  <motion.div 
                    animate={{ 
                      scale: isActive ? 1.1 : 1,
                      y: isActive ? -2 : 0,
                      rotate: isActive ? [0, -5, 5, 0] : 0
                    }}
                    transition={{ 
                      scale: { type: "spring", stiffness: 400, damping: 25 },
                      y: { type: "spring", stiffness: 400, damping: 25 },
                      rotate: { duration: 0.4, ease: "easeInOut" }
                    }}
                    className={`relative z-10 p-2.5 rounded-2xl transition-colors duration-300 ${isActive ? "text-onyx" : "text-stone-500 group-hover:text-white"}`}
                  >
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  </motion.div>
                </div>

                <motion.span 
                  animate={{ 
                    scale: isActive ? 1.05 : 1,
                    opacity: isActive ? 1 : 0.6,
                    y: isActive ? 1 : 0
                  }}
                  className={`text-[9px] font-black uppercase tracking-widest mt-1 ${isActive ? "text-cyan-400" : "text-stone-500"}`}
                >
                  {item.label}
                </motion.span>
                
                {isActive && (
                  <motion.div 
                    layoutId="nav-dot"
                    className="absolute -bottom-2 w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,1)]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.div>
            </Link>
          );

        })}
      </div>
    </div>
  );
}
