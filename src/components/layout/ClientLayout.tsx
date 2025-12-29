"use client";

import { Toaster } from "sonner";
import { VisualEditsMessenger } from "orchids-visual-edits";
import { useEffect } from "react";
import { PullToRefresh } from "@/components/PullToRefresh";
import { useRouter } from "next/navigation";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").then(
          (registration) => {
            console.log("ServiceWorker registration successful");
          },
          (err) => {
            console.log("ServiceWorker registration failed: ", err);
          }
        );
      });
    }

    // Prevent default touch behavior to avoid "rubber banding" on non-scrollable areas
    const preventDefault = (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault();
    };
    document.addEventListener("touchmove", preventDefault, { passive: false });
    
    return () => {
      document.removeEventListener("touchmove", preventDefault);
    };
  }, []);

  const handleRefresh = async () => {
    router.refresh();
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  return (
    <>
      <div className="min-h-screen bg-transparent" suppressHydrationWarning>
        <PullToRefresh onRefresh={handleRefresh}>
          {children}
        </PullToRefresh>
      </div>
      <Toaster position="top-center" richColors />
      <VisualEditsMessenger />
    </>
  );
}

