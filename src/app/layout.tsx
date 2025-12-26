"use client";

import { Geist, Geist_Mono, Playfair_Display, Berkshire_Swash } from "next/font/google";
import "./globals.css";
import { VisualEditsMessenger } from "orchids-visual-edits";
import { motion, AnimatePresence } from "framer-motion";

import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const berkshire = Berkshire_Swash({
  variable: "--font-berkshire",
  weight: "400",
  subsets: ["latin"],
});

import { TopHeader } from "@/components/layout/TopHeader";
import { GeometricBackground } from "@/components/layout/GeometricBackground";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${berkshire.variable} font-serif antialiased bg-background text-foreground`}
      >
        <GeometricBackground />
        <TopHeader />
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
      </body>
    </html>
  );
}
