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
  title: "Orbit of Khemet | AI Empire Engine",
  description: "The Egyptian AI platform — 120 specialized agents across 7 hero domains. Strategy, creative, engineering, analytics, and more. Powered by the 7 Heroes of Khemet.",
  keywords: ["AI agents", "AI platform", "Egyptian AI", "Khemet", "gamification AI", "business AI", "AI empire"],
  authors: [{ name: "Khemet.AI", url: "https://khemet.ai" }],
  creator: "Khemet.AI",
  publisher: "Khemet.AI",
  robots: { index: true, follow: true },
  manifest: "/manifest.json",
  themeColor: "#D4AF37",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Orbit of Khemet",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://orbit-of-khemet.vercel.app",
    siteName: "Orbit of Khemet",
    title: "Orbit of Khemet — AI Empire Engine",
    description: "120 AI agents. 7 Egyptian heroes. One platform to build, grow, and command your empire.",
    images: [
      {
        url: "/publiclogo.png.png",
        width: 1200,
        height: 630,
        alt: "Orbit of Khemet — AI Empire Engine",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Orbit of Khemet — AI Empire Engine",
    description: "120 AI agents. 7 Egyptian heroes. Build your AI empire.",
    images: ["/publiclogo.png.png"],
    creator: "@khemetai",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="apple-touch-icon" href="/khemet-logo.png" />
        <link rel="icon" href="/khemet-logo.png" type="image/png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var theme = localStorage.getItem('theme');
              if (theme === 'light') {
                document.documentElement.classList.remove('dark');
                document.documentElement.classList.add('light');
              } else {
                document.documentElement.classList.add('dark');
                document.documentElement.classList.remove('light');
              }
              var lang = localStorage.getItem('orbit_lang');
              if (lang === 'ar') {
                document.documentElement.setAttribute('dir', 'rtl');
                document.documentElement.setAttribute('lang', 'ar');
              }
            } catch(e) {
              document.documentElement.classList.add('dark');
            }
          })();
        ` }} />
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/sw.js').catch(() => {});
            });
          }
        ` }} />
      </head>
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
