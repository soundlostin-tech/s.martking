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
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // When path or search params change, we consider navigation started
    // But since this is a client layout, we need to hide it once the new page is rendered.
    // However, the best way to handle "working in the entire app" is to show it 
    // when Next.js is actually loading the next page.
    // Root loading.tsx handles initial load and streaming.
    // For client-side transitions, we can show a brief overlay.
    
    const handleStart = () => setIsNavigating(true);
    const handleStop = () => setIsNavigating(false);

    // This is a simple way to show it briefly during transitions
    // In a real app, you'd use router events if they were available in App Router (they are not as simple as Pages Router)
    // We'll rely on loading.tsx for actual data loading transitions.
  }, [pathname, searchParams]);

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
