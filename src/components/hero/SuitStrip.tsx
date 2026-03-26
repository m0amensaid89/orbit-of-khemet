"use client";

import { useState } from "react";
import { getHero } from "@/lib/heroes";
import { hotspots as hotspotsData } from "@/lib/agents";
import HeroImage from "./HeroImage";

export default function SuitStrip({ slug }: { slug: string }) {
  const hero = getHero(slug);
  const spots = hotspotsData[slug] || [];

  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  if (!hero) return null;

  return (
    <section className="relative w-full py-24 min-h-[60vh] flex flex-col md:flex-row border-y border-white/5 bg-black" style={{ backgroundColor: 'var(--hero-bg-mid)' }}>

      {/* Left: Suit Image with Hotspots */}
      <div className="flex-1 relative min-h-[500px] flex items-center justify-center p-8">
        <div className="relative w-full max-w-[600px] aspect-square rounded-2xl overflow-hidden border border-white/5" style={{ backgroundColor: 'var(--hero-bg-deep)' }}>
          <HeroImage slug={slug} type="suit" className="absolute inset-0" />

          {spots.map((hs) => (
            <div
              key={hs.id}
              className="absolute group z-20 cursor-crosshair transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center"
              style={{ left: hs.x, top: hs.y }}
              onMouseEnter={() => setActiveHotspot(hs.id)}
              onMouseLeave={() => setActiveHotspot(null)}
              onClick={() => setActiveHotspot(hs.id)}
            >
              {/* Pulse Ring */}
              <div
                className="absolute inset-0 rounded-full border-2 opacity-50 pointer-events-none group-hover:opacity-0 transition-opacity"
                style={{
                  borderColor: 'var(--hero-accent)',
                  animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite'
                }}
              />
              {/* Core Dot */}
              <div
                className="w-5 h-5 rounded-full border-2 transition-all duration-300 group-hover:scale-150 group-hover:bg-current shadow-[0_0_15px_rgba(var(--hero-accent-rgb),0.5)]"
                style={{
                  borderColor: 'var(--hero-accent)',
                  backgroundColor: activeHotspot === hs.id ? 'var(--hero-accent)' : 'rgba(var(--hero-accent-rgb), 0.2)',
                  color: 'var(--hero-accent)'
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Right: Suit Details */}
      <div className="flex-1 flex flex-col justify-center p-8 md:p-16 space-y-12">
        <div className="space-y-4 border-b pb-8" style={{ borderColor: 'var(--hero-card-border)' }}>
          <h2 className="text-[10px] font-[Orbitron] tracking-[4px] uppercase opacity-70" style={{ color: 'var(--hero-primary)' }}>SUIT SCHEMATICS</h2>
          <h3 className="text-4xl font-[Rajdhani] font-bold uppercase leading-none" style={{ color: 'var(--hero-primary)' }}>{hero.class_title} ARMOR</h3>
          <p className="text-xl font-['Exo_2'] font-light italic opacity-80" style={{ color: 'var(--hero-text-dim)' }}>
            &quot;{hero.suit_philosophy}&quot;
          </p>
        </div>

        <div className="space-y-6">
          {spots.map((hs) => (
            <div
              key={hs.id}
              className="flex flex-col gap-1 p-4 rounded-xl transition-all duration-300 border border-transparent hover:border-white/10 hover:bg-white/5"
              style={{
                borderColor: activeHotspot === hs.id ? 'var(--hero-card-border)' : 'transparent',
                backgroundColor: activeHotspot === hs.id ? 'rgba(var(--hero-accent-rgb), 0.05)' : 'transparent',
                transform: activeHotspot === hs.id ? 'translateX(8px)' : 'none'
              }}
              onMouseEnter={() => setActiveHotspot(hs.id)}
              onMouseLeave={() => setActiveHotspot(null)}
            >
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono tracking-widest uppercase opacity-50">{hs.zone}</span>
                <span className="h-px flex-1 bg-white/10" />
              </div>
              <h4 className="text-lg font-[Orbitron] font-bold tracking-wider" style={{ color: 'var(--hero-primary)' }}>{hs.name}</h4>
              <p className="text-[13px] font-['Exo_2'] opacity-70" style={{ color: 'var(--hero-text-dim)' }}>{hs.description}</p>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
