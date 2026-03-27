"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const heroes = [
  { id: 1, name: "NEXAR", slug: "nexar", role: "The frontline smasher of weak prompts", description: "Destroys weak inputs and demands high-leverage context.", image: "https://picsum.photos/id/1015/600/800" },
  { id: 2, name: "HORUSEN", slug: "horusen", role: "The visionary strategist", description: "Oversees the grand board, plotting multi-step empire growth.", image: "https://picsum.photos/id/1016/600/800" },
  { id: 3, name: "KAIRO", slug: "kairo", role: "The data & systems architect", description: "Structures chaos into scalable, unbreakable database schemas.", image: "https://picsum.photos/id/1018/600/800" },
  { id: 4, name: "LYRA", slug: "lyra", role: "The creative storyteller & content master", description: "Weaves compelling narratives that captivate and convert audiences.", image: "https://picsum.photos/id/1019/600/800" },
  { id: 5, name: "NEFRA", slug: "nefra", role: "The emotional intelligence & empathy agent", description: "Reads between the lines, ensuring tone aligns with intent.", image: "https://picsum.photos/id/1020/600/800" },
  { id: 6, name: "RAMET", slug: "ramet", role: "The relentless executor & optimizer", description: "Turns ideas into precise, high-speed, flawless execution.", image: "https://picsum.photos/id/1021/600/800" },
  { id: 7, name: "THOREN", slug: "thoren", role: "The guardian of ethics, security & long-term vision", description: "Protects the core, ensuring safe and sustainable operations.", image: "https://picsum.photos/id/1022/600/800" },
];

export default function HubPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative pb-20">
      {/* Top Navigation */}
      <header className="w-full border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex flex-col gap-1 group">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-primary/50 group-hover:border-secondary transition-colors duration-300 shadow-[0_0_10px_rgba(212,175,119,0.3)] group-hover:shadow-[0_0_15px_rgba(245,211,140,0.5)]">
                <Image
                  src="/logo.png"
                  alt="Orbit of Khemet Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="font-extrabold text-xl tracking-widest text-primary drop-shadow-[0_0_5px_rgba(212,175,119,0.5)] group-hover:text-secondary transition-colors duration-300">
                ORBIT OF KHEMET
              </span>
            </div>
            <span className="text-xs text-muted-foreground font-mono tracking-widest ml-15">The Rise of the Grid • Leverage is the new gravity.</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/hub" className="text-sm font-semibold text-secondary hover:text-primary transition-colors tracking-widest uppercase">
              Hero Hub
            </Link>
            <Link href="#" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors tracking-widest uppercase">
              Codex
            </Link>
            <Link href="#" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors tracking-widest uppercase">
              Visions
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Grid Section */}
      <main className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center">
        <div className="text-center mb-16 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-primary tracking-tighter drop-shadow-[0_0_10px_rgba(212,175,119,0.4)]">
            THE PANTHEON
          </h1>
          <p className="text-muted-foreground text-lg">
            Choose your avatar. The heroes are visual echoes of the Empire Engine&apos;s power.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
          {heroes.map((hero) => (
            <Link
              key={hero.id}
              href={`/heroes/${hero.slug}`}
              className="group relative rounded-xl overflow-hidden border border-border bg-card hover:border-primary/80 transition-all duration-500 hover:shadow-[0_0_25px_rgba(212,175,119,0.2)] aspect-[3/4] flex flex-col cursor-pointer block"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10" />

              <div className="relative flex-1 w-full bg-muted/30 flex items-center justify-center">
                <Image
                  src={`/${hero.slug}.png`}
                  alt={hero.name}
                  fill
                  className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                  unoptimized
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 z-20 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <div className="h-1 w-12 bg-secondary mb-3 rounded-full opacity-50 group-hover:opacity-100 group-hover:w-20 group-hover:shadow-[0_0_10px_rgba(245,211,140,0.8)] transition-all duration-500" />
                <h3 className="text-2xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                  {hero.name}
                </h3>
                <p className="text-sm font-mono text-secondary/80 tracking-widest uppercase mb-2">
                  {hero.role}
                </p>
                <p className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                  {hero.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* Floating Master Orbit Button */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <Link href="/chat?hero=MASTER">
          <Button
            size="lg"
            className="rounded-full w-24 h-24 bg-background border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground shadow-[0_0_20px_rgba(212,175,119,0.3)] hover:shadow-[0_0_30px_rgba(245,211,140,0.6)] transition-all duration-300 flex flex-col items-center justify-center gap-1 group"
          >
            <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center mb-1">
               <div className="w-3 h-3 bg-current rounded-full group-hover:animate-pulse" />
            </div>
            <span className="text-[10px] font-mono tracking-widest font-bold uppercase text-center leading-tight">MASTER<br/>ORBIT</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
