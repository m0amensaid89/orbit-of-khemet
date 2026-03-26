"use client";

import { getHero } from "@/lib/heroes";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function UniverseConnections({ slug }: { slug: string }) {
  const hero = getHero(slug);

  if (!hero || !hero.connections.length) return null;

  return (
    <section className="relative w-full py-32 bg-black min-h-[50vh]" style={{ backgroundColor: 'var(--hero-bg-deep)' }}>
      <div className="container mx-auto px-4 z-10 relative">

        <div className="mb-16 text-center space-y-4">
          <h2 className="text-[10px] font-[Orbitron] tracking-[4px] uppercase opacity-70" style={{ color: 'var(--hero-primary)' }}>UNIVERSE CONNECTIONS</h2>
          <h3 className="text-3xl md:text-5xl font-[Rajdhani] font-bold uppercase leading-none tracking-wider" style={{ color: 'var(--hero-primary)' }}>
            THE GRID NETWORK
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr max-w-6xl mx-auto">
          {hero.connections.map((conn, idx) => (
            <Link
              key={idx}
              href={`/heroes/${conn.slug}`}
              className="group relative flex flex-col p-8 rounded-2xl border border-white/5 bg-white/5 cursor-pointer transition-all duration-400 ease-out hover:-translate-y-2 overflow-hidden"
              style={{
                borderColor: 'var(--hero-card-border)'
              }}
            >
              {/* Hover Effect Layer */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-400"
                style={{ background: 'var(--hero-gradient)' }}
              />
              <div
                className="absolute inset-0 border-2 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
                style={{ borderColor: 'var(--hero-accent)' }}
              />

              <div className="relative z-10 flex flex-col h-full gap-6">
                <div className="flex items-center justify-between border-b pb-6" style={{ borderColor: 'var(--hero-card-border)' }}>
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center font-[Orbitron] font-black text-xl bg-black border shadow-lg transition-colors group-hover:bg-white/10"
                      style={{ color: 'var(--hero-primary)', borderColor: 'var(--hero-accent)' }}
                    >
                      {conn.hero.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xl font-[Rajdhani] font-bold uppercase tracking-widest leading-none" style={{ color: 'var(--hero-primary)' }}>
                        {conn.hero}
                      </span>
                      <span className="text-[10px] font-[Orbitron] uppercase tracking-[0.2em] mt-2 opacity-80" style={{ color: 'var(--hero-accent)' }}>
                        {conn.class}
                      </span>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--hero-accent)' }} />
                </div>

                <div className="flex flex-col gap-4 flex-grow justify-center">
                  <div className="inline-block px-3 py-1 rounded bg-black/50 w-fit text-[9px] font-[Orbitron] uppercase tracking-widest border border-white/10" style={{ color: 'var(--hero-accent)' }}>
                    {conn.relation}
                  </div>
                  <p className="text-[14px] font-['Exo_2'] italic leading-relaxed opacity-80" style={{ color: 'var(--hero-text-dim)' }}>
                    &quot;{conn.workflow}&quot;
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-widest opacity-50">Squad Power</span>
                  <span className="text-sm font-[Orbitron] font-bold" style={{ color: 'var(--hero-primary)' }}>{conn.agent_count} AGENTS</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
