"use client";

import { Home, Play, Swords, Wallet, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { label: "Home", icon: Home, href: "/", color: "#6EBF8B" },
  { label: "Live", icon: Play, href: "/live", color: "#F5A78E" },
  { label: "Matches", icon: Swords, href: "/matches", color: "#C9B6E4" },
  { label: "Wallet", icon: Wallet, href: "/wallet", color: "#A8D8EA" },
  { label: "Profile", icon: User, href: "/profile", color: "#FFB6C1" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-[1000] bg-[#1A1A1A] border-t border-white/5 rounded-t-[24px] shadow-[0_-8px_32px_rgba(0,0,0,0.4)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex justify-around items-center h-16 px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.label}
              href={item.href}
              className="nav-item relative flex flex-col items-center justify-center flex-1 h-full group"
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <motion.div 
                className="nav-item-inner relative flex flex-col items-center justify-center"
                animate={isActive ? { y: -2 } : { y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="relative flex items-center justify-center w-12 h-9 mb-1">
                  <AnimatePresence>
                    {isActive && (
                      <motion.div 
                        layoutId="nav-active-pill"
                        className="absolute inset-0 rounded-2xl"
                        style={{ backgroundColor: `${item.color}20` }} // 12% opacity
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </AnimatePresence>
                  
                  <motion.div
                    animate={isActive ? { 
                      scale: [1, 1.2, 1],
                      rotate: [0, -10, 10, 0]
                    } : { scale: 1, rotate: 0 }}
                    transition={{ 
                      duration: 0.4,
                      times: [0, 0.2, 0.5, 1],
                      ease: "easeInOut"
                    }}
                  >
                    <Icon 
                      size={24} 
                      className="relative z-10 transition-colors duration-300"
                      style={{ color: isActive ? item.color : 'rgba(255, 255, 255, 0.3)' }}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                  </motion.div>
                </div>
                
                <motion.span 
                  className="nav-label text-[9px] font-black uppercase tracking-[0.1em] transition-colors duration-300"
                  style={{ color: isActive ? item.color : 'rgba(255, 255, 255, 0.3)' }}
                  animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                >
                  {item.label}
                </motion.span>
                
                {isActive && (
                  <motion.div 
                    layoutId="nav-dot"
                    className="absolute -bottom-1.5 w-1 h-1 rounded-full"
                    style={{ backgroundColor: item.color }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
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

