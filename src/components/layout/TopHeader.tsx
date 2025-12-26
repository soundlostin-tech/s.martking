"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function TopHeader() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-xl border-b border-jungle-teal/5">
      <div className="container mx-auto px-6 h-16 flex items-center">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-jungle-teal rounded-lg shape-triangle rotate-90 flex items-center justify-center transition-transform group-hover:scale-110">
            <div className="w-3 h-3 bg-lemon-lime rounded-full" />
          </div>
          <span className="text-xl font-heading tracking-tight text-jungle-teal group-hover:text-sea-green transition-colors">
            Smart<span className="text-lemon-lime italic">King</span>
          </span>
        </Link>
      </div>
    </header>
  );
}
