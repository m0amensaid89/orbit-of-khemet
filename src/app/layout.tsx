import type { Metadata } from "next";
import { Geist, Geist_Mono, Cinzel, Cinzel_Decorative, Inter, Indie_Flower, Roboto } from "next/font/google";
import "@fontsource/orbitron/400.css";
import "@fontsource/orbitron/700.css";
import "@fontsource/orbitron/900.css";
import "@fontsource/rajdhani/300.css";
import "@fontsource/rajdhani/500.css";
import "@fontsource/rajdhani/700.css";
import "@fontsource/exo-2/400.css";
import "@fontsource/exo-2/400-italic.css";
import "./globals.css";
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

const indieFlower = Indie_Flower({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-indie-flower",
});

const roboto = Roboto({
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "Orbit of Khemet | Empire Engine",
  description: "The official web platform for the 85-agent Master AI Empire. Powered by the 7 Heroes of Khemet.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${cinzel.variable} ${cinzelDecorative.variable} ${inter.variable} ${roboto.variable} antialiased khemet-pattern text-foreground`}>
        <LayoutShell>
          <PageTransition>
            <main className="flex-1 flex flex-col min-h-screen">
              {children}
            </main>
          </PageTransition>
        </LayoutShell>
      </body>
    </html>
  );
}