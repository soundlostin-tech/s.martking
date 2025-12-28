import { Geist, Geist_Mono, Playfair_Display, Berkshire_Swash, Outfit } from "next/font/google";
import "./globals.css";
import { AnimatedBackground } from "@/components/layout/AnimatedBackground";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { Metadata, Viewport } from "next";

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

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const berkshire = Berkshire_Swash({
  variable: "--font-berkshire",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smartking's Arena",
  description: "The ultimate competitive gaming arena",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Smartking's Arena",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${berkshire.variable} ${outfit.variable} font-sans antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        <AnimatedBackground />
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
