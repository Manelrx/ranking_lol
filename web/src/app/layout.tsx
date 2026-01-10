import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

import { Suspense } from "react";

// ... existing imports

import { QueueProvider } from "@/contexts/QueueContext";

export const metadata: Metadata = {
  title: "Ranking dos Crias",
  description: "Acompanhe o ranking da galera no League of Legends",
  icons: {
    icon: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${inter.variable} antialiased bg-[#050505] text-white font-sans selection:bg-emerald-500/30 selection:text-emerald-200`}
      >
        <QueueProvider>
          <AppShell>
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div></div>}>
              {children}
            </Suspense>
          </AppShell>
        </QueueProvider>
      </body>
    </html>
  );
}
