"use client";

import { CrownAnimation } from "@/components/ui/CrownAnimation";
import { TopHeader } from "@/components/layout/TopHeader";
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
          <h1 className="text-2xl font-heading font-bold">Animation Preview</h1>
        </div>

        <div className="space-y-8">
          {/* Large Preview */}
          <section>
            <h2 className="text-[10px] font-bold text-[#6B7280] uppercase tracking-[0.2em] mb-4">
              Production Preview (120px)
            </h2>
            <BentoCard variant="dark" className="p-12 flex items-center justify-center">
              <CrownAnimation size={120} />
            </BentoCard>
          </section>

          {/* Small Preview */}
          <section>
            <h2 className="text-[10px] font-bold text-[#6B7280] uppercase tracking-[0.2em] mb-4">
              Mobile Icon (48px)
            </h2>
            <div className="flex gap-4">
              <BentoCard className="p-8 flex items-center justify-center bg-white shadow-sm border border-gray-100">
                <CrownAnimation size={48} />
              </BentoCard>
              <BentoCard variant="vibrant" className="p-8 flex items-center justify-center">
                <CrownAnimation size={48} />
              </BentoCard>
            </div>
          </section>

          {/* Details */}
          <section className="bg-white p-6 rounded-2xl shadow-[2px_8px_24px_rgba(0,0,0,0.04)]">
            <h3 className="font-heading font-bold mb-4">Technical Specs</h3>
            <ul className="space-y-3">
              <li className="flex justify-between text-sm">
                <span className="text-[#6B7280]">Format</span>
                <span className="font-bold">SVG + Framer Motion</span>
              </li>
              <li className="flex justify-between text-sm">
                <span className="text-[#6B7280]">Loop Duration</span>
                <span className="font-bold">1.6 Seconds</span>
              </li>
              <li className="flex justify-between text-sm">
                <span className="text-[#6B7280]">Primary Color</span>
                <span className="font-bold text-[#FFD24D]">#FFD24D</span>
              </li>
              <li className="flex justify-between text-sm">
                <span className="text-[#6B7280]">Frame Rate</span>
                <span className="font-bold">60 FPS (Native)</span>
              </li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
