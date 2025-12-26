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


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    return (
      <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${berkshire.variable} font-serif antialiased bg-background text-foreground`}
      >
        <div className="mesh-bg">
            <motion.div 
              animate={{ 
                x: [0, 100, 0], 
                y: [0, 50, 0],
                scale: [1, 1.3, 1]
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-primary/30 rounded-full blur-[120px] animate-blob" 
            />
            <motion.div 
              animate={{ 
                x: [0, -80, 0], 
                y: [0, 100, 0],
                scale: [1.3, 1, 1.3]
              }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[80%] bg-accent/30 rounded-full blur-[120px] animate-blob" 
            />
            <motion.div 
              animate={{ 
                x: [0, 50, 0], 
                y: [0, -50, 0],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute top-[20%] right-[10%] w-[50%] h-[50%] bg-secondary/20 rounded-full blur-[100px] animate-blob" 
            />
        </div>
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
