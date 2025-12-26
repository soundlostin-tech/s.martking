"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function TopHeader() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-xl border-b border-jungle-teal/5">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-jungle-teal rounded-lg shape-triangle rotate-90 flex items-center justify-center transition-transform group-hover:scale-110">
            <div className="w-3 h-3 bg-lemon-lime rounded-full" />
          </div>
          <span className="text-xl font-heading tracking-tight text-jungle-teal group-hover:text-sea-green transition-colors">
            Smart<span className="text-lemon-lime italic">King</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {["Learn more", "Explore Course List", "Enroll Now"].map((item, i) => (
            <Link 
              key={item} 
              href="#" 
              className={`text-sm font-bold uppercase tracking-widest transition-all ${
                i === 1 ? "px-6 py-2 border-2 border-lemon-lime text-lemon-lime rounded-lg hover:bg-lemon-lime hover:text-white" :
                i === 2 ? "px-6 py-2 bg-sea-green text-white rounded-lg hover:bg-jungle-teal shadow-lg shadow-sea-green/20" :
                "text-jungle-teal/60 hover:text-jungle-teal"
              }`}
            >
              {item}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Placeholder - Native app pattern */}
        <button className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 group">
          <div className="w-6 h-0.5 bg-jungle-teal rounded-full group-hover:w-8 transition-all" />
          <div className="w-8 h-0.5 bg-jungle-teal rounded-full" />
          <div className="w-4 h-0.5 bg-jungle-teal rounded-full group-hover:w-8 transition-all" />
        </button>
      </div>
    </header>
  );
}
