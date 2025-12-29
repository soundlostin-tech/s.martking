"use client";

import { ArenaLoader } from "@/components/ui/ArenaLoader";
import { BentoCard } from "@/components/ui/BentoCard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AnimationDemo() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#1A1A1A]">
      <div className="unified-bg" />
      
      <main className="pb-[80px] relative z-10 px-4">
        <div className="pt-6 mb-8 flex items-center gap-4">
          <Link href="/" className="p-2 bg-white rounded-xl shadow-sm">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-heading font-bold">Arena Loader Preview</h1>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-[10px] font-bold text-[#6B7280] uppercase tracking-[0.2em] mb-4">
              Production Preview (120px)
            </h2>
            <BentoCard variant="dark" className="p-12 flex items-center justify-center">
              <ArenaLoader size={120} />
            </BentoCard>
          </section>

          <section>
            <h2 className="text-[10px] font-bold text-[#6B7280] uppercase tracking-[0.2em] mb-4">
              Mobile Icon (48px)
            </h2>
            <div className="flex gap-4">
              <BentoCard className="p-8 flex items-center justify-center bg-white shadow-sm border border-gray-100">
                <ArenaLoader size={48} />
              </BentoCard>
              <BentoCard variant="vibrant" className="p-8 flex items-center justify-center">
                <ArenaLoader size={48} />
              </BentoCard>
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl shadow-[2px_8px_24px_rgba(0,0,0,0.04)]">
            <h3 className="font-heading font-bold mb-4">Animation Timing</h3>
            <ul className="space-y-3">
              <li className="flex justify-between text-sm">
                <span className="text-[#6B7280]">Stage 1: Ring Pulse</span>
                <span className="font-bold">0 – 0.45s</span>
              </li>
              <li className="flex justify-between text-sm">
                <span className="text-[#6B7280]">Stage 2: Crest Rise + Flash</span>
                <span className="font-bold">0.45 – 1.1s</span>
              </li>
              <li className="flex justify-between text-sm">
                <span className="text-[#6B7280]">Stage 3: Settle + Breathe</span>
                <span className="font-bold">1.1 – 1.6s</span>
              </li>
            </ul>
          </section>

          <section className="bg-white p-6 rounded-2xl shadow-[2px_8px_24px_rgba(0,0,0,0.04)]">
            <h3 className="font-heading font-bold mb-4">Easing & Motion</h3>
            <ul className="space-y-3">
              <li className="flex justify-between text-sm">
                <span className="text-[#6B7280]">Rise Easing</span>
                <span className="font-bold font-mono text-xs">[0.34, 1.56, 0.64, 1]</span>
              </li>
              <li className="flex justify-between text-sm">
                <span className="text-[#6B7280]">Flash Scale Pop</span>
                <span className="font-bold">110% → 95% → 100%</span>
              </li>
              <li className="flex justify-between text-sm">
                <span className="text-[#6B7280]">Breathing Scale</span>
                <span className="font-bold">±2% (subtle)</span>
              </li>
              <li className="flex justify-between text-sm">
                <span className="text-[#6B7280]">Layer Count</span>
                <span className="font-bold">&lt;15 shapes</span>
              </li>
            </ul>
          </section>

          <section className="bg-white p-6 rounded-2xl shadow-[2px_8px_24px_rgba(0,0,0,0.04)]">
            <h3 className="font-heading font-bold mb-4">Colors</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#FFD24D]" />
                <div>
                  <p className="text-xs font-bold">#FFD24D</p>
                  <p className="text-[10px] text-[#6B7280]">Primary Gold</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#1F2937]" />
                <div>
                  <p className="text-xs font-bold">#1F2937</p>
                  <p className="text-[10px] text-[#6B7280]">Dark Slate</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#FF6B6B]" />
                <div>
                  <p className="text-xs font-bold">#FF6B6B</p>
                  <p className="text-[10px] text-[#6B7280]">Accent Red</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#FFE6A7]" />
                <div>
                  <p className="text-xs font-bold">#FFE6A7</p>
                  <p className="text-[10px] text-[#6B7280]">Soft Glow</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
