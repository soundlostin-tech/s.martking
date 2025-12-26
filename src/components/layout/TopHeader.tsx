"use client";

import { motion } from "framer-motion";
import { Search, Bell, User } from "lucide-react";
import Link from "next/link";

export function TopHeader() {
    return (
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] w-[90%] max-w-lg px-6 py-4 flex items-center justify-between bg-white/80 backdrop-blur-sm border-2 border-[#000033]/10 rounded-2xl rotate-1 shadow-sm">
        <Link href="/" className="flex flex-col -rotate-3">
          <h1 className="text-2xl font-heading text-[#000033] leading-none mb-0">
            Arena
          </h1>
          <p className="text-[10px] font-handwritten text-[#000033]/40 uppercase tracking-widest">
            Smartking
          </p>
        </Link>
        
        <div className="flex items-center gap-4">
          <motion.button 
            whileTap={{ scale: 0.9, rotate: 5 }}
            className="text-[#000033]/60 hover:text-[#000033] transition-all"
          >
            <Search size={20} strokeWidth={2} />
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.9, rotate: -5 }}
            className="relative text-[#000033]/60 hover:text-[#000033] transition-all"
          >
            <Bell size={20} strokeWidth={2} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </motion.button>
          <Link href="/profile">
            <motion.div whileTap={{ scale: 0.9 }}>
              <User size={20} strokeWidth={2} className="text-[#000033]/60" />
            </motion.div>
          </Link>
        </div>
      </header>
    );
}

