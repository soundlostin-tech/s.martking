"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "sonner";
import { VisualEditsMessenger } from "orchids-visual-edits";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: "linear" }}
          className="min-h-screen"
        >
          {children}
        </motion.div>
      </AnimatePresence>
      <Toaster position="top-center" />
      <VisualEditsMessenger />
    </>
  );
}
