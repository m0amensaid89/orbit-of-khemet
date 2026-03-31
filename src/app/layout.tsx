import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@fontsource/orbitron/400.css";
import "@fontsource/orbitron/700.css";
import "@fontsource/orbitron/900.css";
import "@fontsource/rajdhani/300.css";
import "@fontsource/rajdhani/500.css";
import "@fontsource/rajdhani/700.css";
import "@fontsource/exo-2/400.css";
import "@fontsource/exo-2/400-italic.css";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { GlobalNav } from "@/components/GlobalNav";
import { Sidebar } from "@/components/Sidebar";
import PageTransition from "@/components/PageTransition";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Orbit of Khemet | Empire Engine",
  description: "The official web platform for the 85-agent Master AI Empire. Powered by the 7 Heroes of Khemet.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased khemet-pattern text-foreground`}>
        {/* Mobile only: top nav */}
        <div className="md:hidden">
          <GlobalNav />
        </div>
        {/* Full layout: sidebar + content */}
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <PageTransition>
              <main className="flex-1 flex flex-col">
                {children}
              </main>
              <Footer />
            </PageTransition>
          </div>
        </div>
      </body>
    </html>
  );
}