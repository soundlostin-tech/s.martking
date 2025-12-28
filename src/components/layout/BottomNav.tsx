"use client";

import { Home, Play, Swords, Wallet, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", icon: Home, href: "/" },
  { label: "LIVE", icon: Play, href: "/live" },
  { label: "MATCHES", icon: Swords, href: "/matches" },
  { label: "Wallet", icon: Wallet, href: "/wallet" },
  { label: "Profile", icon: User, href: "/profile" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md" suppressHydrationWarning={true}>
      <div className="bg-white/95 backdrop-blur-xl border border-gray-100 rounded-[32px] shadow-[0_4px_24px_rgba(0,0,0,0.08)] px-4 py-3" suppressHydrationWarning={true}>
        <div className="flex justify-between items-center h-12" suppressHydrationWarning={true}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
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
                      y: isActive ? -2 : 0 
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="flex flex-col items-center gap-1"
                    suppressHydrationWarning={true}
                  >
                        <div className={cn(
                          "p-2.5 rounded-full transition-all duration-300",
                          isActive 
                            ? "bg-[#2D3436] text-white shadow-md" 
                            : "text-[#95A5A6] hover:text-[#2D3436]"
                        )} suppressHydrationWarning={true}>
                        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                      </div>
                  {isActive && (
                    <span className="text-[9px] font-bold text-[#2D3436] uppercase tracking-tighter">
                      {item.label}
                    </span>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
      <div className="h-[env(safe-area-inset-bottom,0px)]" suppressHydrationWarning={true} />
    </nav>
  );
}
