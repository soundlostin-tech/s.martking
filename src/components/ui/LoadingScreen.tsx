"use client";

import { CrownAnimation } from "./CrownAnimation";

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[100] bg-[#F5F5F5] flex flex-col items-center justify-center">
      <div className="unified-bg" />
      
      <div className="relative flex flex-col items-center justify-center scale-90 sm:scale-100">
        <CrownAnimation size={180} />
      </div>
    </div>
  );
}
