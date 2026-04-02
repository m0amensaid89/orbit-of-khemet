import type { Metadata } from "next";
import { Geist, Geist_Mono, Cinzel, Cinzel_Decorative, Inter } from "next/font/google";
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
import PageTransition from "@/components/PageTransition";
import { LayoutShell } from "@/components/LayoutShell";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-cinzel" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cinzelDecorative = Cinzel_Decorative({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-cinzel-decorative",
});

export const metadata: Metadata = {
  title: "Orbit of Khemet | Empire Engine",
  description: "The official web platform for the 85-agent Master AI Empire. Powered by the 7 Heroes of Khemet.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${cinzel.variable} ${cinzelDecorative.variable} ${inter.variable} antialiased khemet-pattern text-foreground`}>
        {/* Mobile only: top nav */}
        <div className="md:hidden">
          <GlobalNav />
        </div>
        <LayoutShell>
          <PageTransition>
            <main className="flex-1 flex flex-col min-h-screen">
              {children}
            </main>
            <Footer />
          </PageTransition>
        </LayoutShell>
      </body>
    </html>
  );
}