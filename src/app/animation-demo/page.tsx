"use client";

import { CrownAnimation } from "@/components/ui/CrownAnimation";

export default function AnimationDemoPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] p-8 flex flex-col items-center justify-center gap-12">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-[#1F2937]">Crown Animation Demo</h1>
        <p className="text-sm text-[#6B7280]">1.6s Looping Esports Animation</p>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-16">
        <div className="flex flex-col items-center gap-4">
          <div className="p-8 bg-white rounded-3xl shadow-xl">
            <CrownAnimation size={120} />
          </div>
          <span className="text-xs font-bold text-[#1F2937]/50 uppercase tracking-widest">120px Preview</span>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="p-8 bg-white rounded-3xl shadow-xl">
            <CrownAnimation size={48} />
          </div>
          <span className="text-xs font-bold text-[#1F2937]/50 uppercase tracking-widest">48px Preview</span>
        </div>
      </div>

      <div className="max-w-md p-6 bg-[#1F2937] text-white rounded-2xl space-y-4">
        <h3 className="font-bold text-[#FFD24D]">Implementation Details</h3>
        <ul className="text-xs space-y-2 list-disc pl-4 text-white/70">
          <li>Pure SVG + Framer Motion for high performance</li>
          <li>Optimized for mobile (lightweight asset)</li>
          <li>Synchronized 1.6s loop with "Burst & Reassemble" logic</li>
          <li>Custom Esports Palette: Gold (#FFD24D) & Coral (#FF6B6B)</li>
        </ul>
      </div>
    </div>
  );
}
