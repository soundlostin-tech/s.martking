"use client";

import { Toaster } from "sonner";
import { VisualEditsMessenger } from "orchids-visual-edits";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="min-h-screen" suppressHydrationWarning>
        {children}
      </div>
      <Toaster position="top-center" />
      <VisualEditsMessenger />
    </>
  );
}
