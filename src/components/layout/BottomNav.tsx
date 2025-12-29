"use client";

import { Home, Play, Swords, Wallet, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useHaptics } from "@/hooks/useHaptics";

const navItems = [
  { label: "Home", icon: Home, href: "/" },
  { label: "LIVE", icon: Play, href: "/live" },
  { label: "MATCHES", icon: Swords, href: "/matches" },
  { label: "Wallet", icon: Wallet, href: "/wallet" },
  { label: "Profile", icon: User, href: "/profile" },
];

export function BottomNav() {
  const pathname = usePathname();
  const { triggerHaptic } = useHaptics();

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-md" suppressHydrationWarning={true}>
      <div className="bg-white/90 backdrop-blur-xl border-2 border-slate-200/50 rounded-[32px] shadow-[0_12px_40px_rgba(0,0,0,0.15)] px-4 py-3" suppressHydrationWarning={true}>
        <div className="flex justify-between items-center h-14" suppressHydrationWarning={true}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => triggerHaptic('light')}
                className="relative flex flex-col items-center justify-center flex-1 h-full min-w-[44px] min-h-[44px]"
              >
                <motion.div
                  initial={false}
                  animate={{ 
                    scale: isActive ? 1.05 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="flex flex-col items-center gap-1"
                  suppressHydrationWarning={true}
                >
                  <div className={cn(
                    "p-2.5 rounded-2xl transition-all duration-300",
                    isActive 
                      ? "bg-[#1A202C] text-white shadow-lg" 
                      : "text-[#718096] hover:text-[#1A202C]"
                  )} suppressHydrationWarning={true}>
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  {isActive && (
                    <span className="text-[9px] font-black text-[#1A202C] uppercase tracking-tighter">
                      {item.label}
                    </span>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
