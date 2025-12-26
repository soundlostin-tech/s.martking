"use client";

import { motion } from "framer-motion";

export function TopHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-foreground/[0.04] px-6 py-4">
      <div className="flex flex-col">
        <h1 className="text-xl font-heading text-foreground font-bold tracking-tight">
          Smartking's
        </h1>
        <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-[0.2em] mt-0.5">
          Said Hamare Zamane Mein....
        </p>
      </div>
    </header>
  );
}
