"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Bell, Search, Wifi, Battery, Signal } from "lucide-react";

export function TopHeader() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-2xl border-b border-jungle-teal/5">
      {/* Simulated Status Bar */}
      <div className="flex justify-between items-center px-6 py-1 text-[10px] font-bold text-foreground/40">
        <span>9:41</span>
        <div className="flex items-center gap-1.5">
          <Signal size={10} />
          <Wifi size={10} />
          <Battery size={10} className="rotate-90" />
        </div>
      </div>

      <div className="px-6 h-14 flex items-center justify-between">
        <button className="p-2 -ml-2 text-foreground/40 hover:text-jungle-teal transition-colors">
          <Search size={20} />
        </button>

        <Link href="/" className="flex items-center gap-2 group absolute left-1/2 -translate-x-1/2">
          <div className="w-7 h-7 bg-jungle-teal rounded-lg shape-triangle rotate-90 flex items-center justify-center transition-transform group-hover:scale-110">
            <div className="w-2.5 h-2.5 bg-lemon-lime rounded-full" />
          </div>
          <span className="text-lg font-heading tracking-tight text-jungle-teal">
            Smart<span className="text-lemon-lime italic">King</span>
          </span>
        </Link>

        <button className="p-2 -mr-2 text-foreground/40 hover:text-jungle-teal transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full border-2 border-white" />
        </button>
      </div>
    </header>
  );
}
