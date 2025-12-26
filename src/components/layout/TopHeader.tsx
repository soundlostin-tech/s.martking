"use client";

import { motion } from "framer-motion";
import { Search, Bell, User } from "lucide-react";
import Link from "next/link";

export function TopHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-[60] h-16 bg-background/80 backdrop-blur-md border-b border-border px-6">
      <div className="max-w-4xl mx-auto h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-jungle-teal rounded-lg flex items-center justify-center text-white font-bold">S</div>
          <h1 className="text-xl font-bold tracking-tight text-primary m-0">
            Smartking
          </h1>
        </Link>
        
        <div className="flex items-center gap-4">
          <button className="text-muted-foreground hover:text-primary transition-colors">
            <Search size={20} />
          </button>
          <button className="relative text-muted-foreground hover:text-primary transition-colors">
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-jungle-teal rounded-full border-2 border-background" />
          </button>
          <Link href="/profile" className="text-muted-foreground hover:text-primary transition-colors">
            <User size={20} />
          </Link>
        </div>
      </div>
    </header>
  );
}
