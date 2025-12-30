"use client";

import { ArenaLoader } from "./ArenaLoader";

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[100] bg-[#F5F5F5] flex flex-col items-center justify-center">
      {/* Background is now global */}
      
      <div className="relative flex flex-col items-center justify-center scale-90 sm:scale-100">
        <ArenaLoader size={180} />
      </div>
    </div>
  );
}
