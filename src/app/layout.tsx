import "./globals.css";
import { GeometricBackground } from "@/components/layout/GeometricBackground";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Smartking's Arena",
  description: "The ultimate competitive gaming arena",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <GeometricBackground />
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
