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
      className="fixed bottom-0 left-0 right-0 z-[1000] bg-[#1A1A1A]/95 backdrop-blur-xl border-t border-white/10 rounded-t-[20px] shadow-[0_-8px_24px_rgba(0,0,0,0.4)]"
      style={{ 
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.25rem)',
        paddingTop: '0.5rem'
      }}
    >
      <div className="flex justify-around items-center h-14 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.label}
              href={item.href}
              className="nav-item relative flex flex-col items-center justify-center flex-1 min-w-[56px] h-full group touch-manipulation"
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <motion.div 
                className="nav-item-inner relative flex flex-col items-center justify-center w-full"
                animate={isActive ? { y: -1 } : { y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="relative flex items-center justify-center w-10 h-8 mb-0.5">
                  <AnimatePresence>
                    {isActive && (
                      <motion.div 
                        layoutId="nav-active-pill"
                        className="absolute inset-0 rounded-xl"
                        style={{ backgroundColor: `${item.color}25` }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </AnimatePresence>
                  
                  <motion.div
                    animate={isActive ? { 
                      scale: [1, 1.1, 1],
                    } : { scale: 1 }}
                    transition={{ 
                      duration: 0.3,
                    }}
                  >
                    <Icon 
                      size={20} 
                      className="relative z-10 transition-colors duration-300"
                      style={{ color: isActive ? item.color : 'rgba(255, 255, 255, 0.4)' }}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                  </motion.div>
                </div>
                
                <motion.span 
                  className="nav-label text-[8px] font-black uppercase tracking-[0.05em] transition-colors duration-300"
                  style={{ color: isActive ? item.color : 'rgba(255, 255, 255, 0.4)' }}
                  animate={isActive ? { scale: 1.02 } : { scale: 1 }}
                >
                  {item.label}
                </motion.span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

