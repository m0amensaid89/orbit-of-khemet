"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Sun, Moon, Menu, X } from "lucide-react";

const heroSlugs = [
  { slug: "thoren", name: "THOREN" },
  { slug: "ramet", name: "RAMET" },
  { slug: "nexar", name: "NEXAR" },
  { slug: "lyra", name: "LYRA" },
  { slug: "kairo", name: "KAIRO" },
  { slug: "nefra", name: "NEFRA" },
  { slug: "horusen", name: "HORUSEN" },
];

export function GlobalNav() {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const dark = stored ? stored === "dark" : true;
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.classList.toggle("light", !dark);
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    localStorage.setItem("theme", newDark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", newDark);
    document.documentElement.classList.toggle("light", !newDark);
  };

  const isHeroPage = pathname.startsWith("/heroes/");
  const currentSlug = isHeroPage ? pathname.split("/heroes/")[1] : null;

  return (
    <header className="w-full border-b border-border/50 bg-background/90 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">

        {/* Logo + site name */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-primary/50 group-hover:border-primary transition-colors shadow-[0_0_8px_rgba(212,175,119,0.2)]">
            <Image src="/logo.png" alt="Orbit of Khemet" fill className="object-cover" />
          </div>
          <span className="font-[Orbitron] text-sm font-bold tracking-widest text-primary hidden sm:block">
            ORBIT OF KHEMET
          </span>
        </Link>

        {/* Desktop nav — hero names + pricing */}
        <nav className="hidden lg:flex items-center gap-1">
          {heroSlugs.map((h) => (
            <Link
              key={h.slug}
              href={`/heroes/${h.slug}`}
              className="font-[Orbitron] text-[9px] tracking-[2px] uppercase px-3 py-2 rounded transition-all duration-200 hover:text-primary"
              style={{
                color: currentSlug === h.slug ? "var(--color-khemet-gold, #D4AF37)" : undefined,
                borderBottom: currentSlug === h.slug ? "1px solid #D4AF37" : "1px solid transparent",
              }}
            >
              {h.name}
            </Link>
          ))}
          <div className="w-px h-4 bg-border/50 mx-2" />
          <Link href="/hub" className="font-[Orbitron] text-[9px] tracking-[2px] uppercase px-3 py-2 text-muted-foreground hover:text-primary transition-colors">
            Hub
          </Link>
          <Link href="/pricing" className="font-[Orbitron] text-[9px] tracking-[2px] uppercase px-3 py-2 text-muted-foreground hover:text-primary transition-colors">
            Pricing
          </Link>
        </nav>

        {/* Right side: theme toggle + mobile menu */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={toggleTheme}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-border/50 hover:border-primary/50 transition-colors text-muted-foreground hover:text-primary"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-primary"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border/30 bg-background/95 backdrop-blur-md px-4 py-4 flex flex-col gap-1">
          <p className="font-[Orbitron] text-[8px] tracking-[4px] uppercase text-muted-foreground/50 mb-2 px-2">Heroes</p>
          {heroSlugs.map((h) => (
            <Link
              key={h.slug}
              href={`/heroes/${h.slug}`}
              onClick={() => setMobileOpen(false)}
              className="font-[Orbitron] text-[10px] tracking-[2px] uppercase px-3 py-2.5 rounded hover:bg-primary/10 hover:text-primary transition-colors"
              style={{ color: currentSlug === h.slug ? "#D4AF37" : undefined }}
            >
              {h.name}
            </Link>
          ))}
          <div className="h-px bg-border/30 my-2" />
          <Link href="/hub" onClick={() => setMobileOpen(false)} className="font-[Orbitron] text-[10px] tracking-[2px] uppercase px-3 py-2.5 text-muted-foreground hover:text-primary transition-colors">Hub</Link>
          <Link href="/pricing" onClick={() => setMobileOpen(false)} className="font-[Orbitron] text-[10px] tracking-[2px] uppercase px-3 py-2.5 text-muted-foreground hover:text-primary transition-colors">Pricing</Link>
        </div>
      )}
    </header>
  );
}
