"use client";

import { Toaster } from "sonner";
import { VisualEditsMessenger } from "orchids-visual-edits";
import dynamic from "next/dynamic";

const AnimatedBackground = dynamic(
  () => import("@/components/layout/AnimatedBackground").then(mod => mod.AnimatedBackground),
  { ssr: false }
);

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AnimatedBackground />
      <div className="min-h-screen">
        {children}
      </div>
      <Toaster position="top-center" />
      <VisualEditsMessenger />
    </>
  );
}
