"use client";

import { motion } from "framer-motion";
import { Search, Bell, Menu } from "lucide-react";

export function TopHeader() {
    return (
      <header className="sticky top-0 z-50 bg-transparent px-6 py-6 flex items-center justify-between">
        <div className="flex flex-col -rotate-3">
          <h1 className="text-3xl font-heading text-ink-blue leading-none">
            Smartking's
          </h1>
          <p className="text-[12px] font-handwritten text-ink-blue/40 uppercase tracking-widest">
            The Arena Awaits
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <motion.button 
            whileTap={{ scale: 0.9, rotate: 5 }}
            className="w-12 h-12 rounded-2xl border-2 border-ink-blue/10 flex items-center justify-center text-ink-blue/60 hover:border-ink-blue/30 transition-all"
          >
            <Search size={24} />
          </motion.button>
            <motion.button 
              whileTap={{ scale: 0.9, rotate: -5 }}
              className="relative w-12 h-12 rounded-2xl border-2 border-ink-blue/10 flex items-center justify-center text-ink-blue/60 hover:border-ink-blue/30 transition-all"
            >
              <Bell size={24} />
                <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
            </motion.button>
        </div>
      </header>
    );
}

