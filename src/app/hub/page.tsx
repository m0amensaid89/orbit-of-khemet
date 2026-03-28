"use client";

import Image from "next/image";
import Link from "next/link";

const heroes = [
  { id: 1, name: "NEXAR", slug: "nexar", role: "The Destabilizer", description: "Destroys weak inputs and demands high-leverage context.", accentColor: "#FF4444", glowColor: "rgba(255,68,68,0.35)", },
  { id: 2, name: "HORUSEN", slug: "horusen", role: "Ancient Script Guardian", description: "Oversees the grand board, plotting multi-step empire growth.", accentColor: "#D4AF37", glowColor: "rgba(212,175,55,0.35)", },
  { id: 3, name: "KAIRO", slug: "kairo", role: "Precision Stream Warrior", description: "Structures chaos into scalable, unbreakable precision.", accentColor: "#00E5FF", glowColor: "rgba(0,229,255,0.35)", },
  { id: 4, name: "LYRA", slug: "lyra", role: "Visionary Systems Architect", description: "Weaves compelling narratives that captivate and convert.", accentColor: "#D4AF37", glowColor: "rgba(212,175,55,0.35)", },
  { id: 5, name: "NEFRA", slug: "nefra", role: "Precision Stream Warrior", description: "Reads between the lines, ensuring tone aligns with intent.", accentColor: "#E040FB", glowColor: "rgba(224,64,251,0.35)", },
  { id: 6, name: "RAMET", slug: "ramet", role: "The Stabilizer", description: "Turns ideas into precise, high-speed, flawless execution.", accentColor: "#4ECDC4", glowColor: "rgba(78,205,196,0.35)", },
  { id: 7, name: "THOREN", slug: "thoren", role: "The Law", description: "Protects the core, ensuring safe and sustainable operations.", accentColor: "#D4AF37", glowColor: "rgba(212,175,55,0.35)", },
];

export default function HubPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Grid Section */}
      <main className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center">
        <div className="text-center mb-16 max-w-2xl">
          <h1 className="font-[Orbitron] text-4xl md:text-5xl font-black mb-4 text-primary tracking-tighter drop-shadow-[0_0_10px_rgba(212,175,119,0.4)]">
            OUR SUPER HEROES
          </h1>
          <p className="text-muted-foreground text-lg font-[Rajdhani]">
            Choose your hero. Enter their orbit. Unleash their agents.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
          {heroes.map((hero) => (
            <Link
              key={hero.id}
              href={`/heroes/${hero.slug}`}
              className="group relative rounded-xl overflow-hidden border aspect-[3/4] flex flex-col cursor-pointer block transition-all duration-500"
              style={{
                borderColor: "rgba(255,255,255,0.08)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = hero.accentColor;
                (e.currentTarget as HTMLElement).style.boxShadow = `0 0 30px ${hero.glowColor}`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10" />

              <div className="relative flex-1 w-full bg-muted/30 flex items-center justify-center">
                <Image
                  src={`/${hero.slug}.png`}
                  alt={hero.name}
                  fill
                  className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                  unoptimized
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 z-20 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <div
                  className="h-1 w-12 mb-3 rounded-full opacity-50 group-hover:opacity-100 group-hover:w-20 transition-all duration-500"
                  style={{ backgroundColor: hero.accentColor }}
                />
                <h3
                  className="text-2xl font-bold font-[Orbitron] mb-1 transition-colors text-foreground"
                  style={{ color: undefined }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = hero.accentColor; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = ""; }}
                >
                  {hero.name}
                </h3>
                <p className="text-sm font-mono tracking-widest uppercase mb-2"
                  style={{ color: `${hero.accentColor}99` }}>
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

      {/* Master Orbit button — redesigned */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <Link href="/chat?hero=MASTER">
          <div className="group flex items-center gap-3 px-6 py-3 rounded-full border-2 border-[#D4AF37] bg-black/80 backdrop-blur-md hover:bg-[#D4AF37] transition-all duration-300 shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_40px_rgba(212,175,55,0.6)]">
            <div className="relative w-8 h-8 rounded-full border border-[#D4AF37] group-hover:border-black flex items-center justify-center shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] group-hover:bg-black animate-pulse" />
              <div className="absolute inset-0 rounded-full border border-[#D4AF37]/40 animate-ping group-hover:hidden" />
            </div>
            <div className="flex flex-col">
              <span className="font-[Orbitron] text-[10px] tracking-[3px] uppercase text-[#D4AF37] group-hover:text-black font-bold leading-tight">
                MASTER ORBIT
              </span>
              <span className="font-[Rajdhani] text-[10px] text-[#D4AF37]/60 group-hover:text-black/60 leading-tight">
                Command all 85 agents
              </span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
