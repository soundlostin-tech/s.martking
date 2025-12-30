"use client";

import { Toaster } from "sonner";
import { VisualEditsMessenger } from "orchids-visual-edits";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { AnimatePresence, motion } from "framer-motion";

const AnimatedBackground = dynamic(
  () => import("@/components/layout/AnimatedBackground").then(mod => mod.AnimatedBackground),
  { ssr: false }
);

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // For client-side transitions, we can show a brief overlay.
    const handleStart = () => setIsNavigating(true);
    const handleStop = () => setIsNavigating(false);
  }, [pathname]);

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
