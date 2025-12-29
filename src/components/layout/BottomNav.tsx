"use client";

import { Home, Play, Swords, Wallet, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
      className="fixed bottom-0 left-0 right-0 z-[1000] bg-[#1A1A1A] border-t border-white/5 rounded-t-[20px] shadow-[0_-4px_16px_rgba(0,0,0,0.2)]"
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
                className="nav-item relative flex flex-col items-center justify-center flex-1 h-full min-h-[48px] group"
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
              >
                  <div className="nav-item-inner relative flex flex-col items-center justify-center">
                      <div className="relative flex items-center justify-center w-12 h-8 mb-1">
                        <Icon 
                          size={24} 
                          className={`nav-icon relative z-10 ${isActive ? 'nav-icon-active' : 'nav-icon-inactive'}`}
                          strokeWidth={isActive ? 2.5 : 2}
                        />
                      </div>
                  
                    <span className={`nav-label text-[10px] font-bold uppercase tracking-wide ${isActive ? 'nav-label-active' : 'nav-label-inactive'}`}>
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
