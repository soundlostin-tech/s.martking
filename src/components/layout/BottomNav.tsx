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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-t border-border px-4">
      <div className="max-w-4xl mx-auto flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.label}
              href={item.href}
              className="relative flex flex-col items-center justify-center flex-1 h-full outline-none group"
            >
              <div className="relative flex flex-col items-center gap-1 transition-all duration-300">
                <div className={`transition-colors duration-300 ${
                  isActive ? "text-jungle-teal" : "text-muted-foreground group-hover:text-primary"
                }`}>
                  <Icon size={20} />
                </div>

                <span className={`text-[10px] font-medium transition-colors duration-300 ${
                  isActive ? "text-jungle-teal" : "text-muted-foreground group-hover:text-primary"
                }`}>
                  {item.label}
                </span>

                {isActive && (
                  <motion.div 
                    layoutId="nav-indicator-bottom"
                    className="absolute -bottom-2 w-8 h-1 bg-jungle-teal rounded-full"
                  />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
