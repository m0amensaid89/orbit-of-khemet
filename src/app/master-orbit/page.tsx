"use client";

import { heroData, heroOrder } from "@/lib/heroes";
import { heroAgents, heroMeta } from "@/lib/agents";
import Link from "next/link";

export default function MasterOrbitPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">

      {/* Header */}
      <div className="px-8 py-10 border-b" style={{ borderColor: 'rgba(212,175,55,0.08)' }}>
        <p className="font-[Orbitron] text-[9px] tracking-[5px] uppercase mb-2"
          style={{ color: 'rgba(212,175,55,0.5)' }}>EMPIRE ENGINE</p>
        <h1 className="font-[Orbitron] text-4xl font-black tracking-tighter"
          style={{ color: '#D4AF37' }}>MASTER ORBIT</h1>
        <p className="font-[Rajdhani] text-lg mt-2" style={{ color: '#d0c5af' }}>
          Command all 7 heroes from a single unified control matrix.
        </p>
      </div>

      {/* Hero cards — one per row */}
      <div className="flex flex-col">
        {heroOrder.map((slug) => {
          const hero = heroData[slug];
          const meta = heroMeta[slug as keyof typeof heroMeta];
          const agentCount = heroAgents[slug as keyof typeof heroAgents]?.length || 0;

          return (
            <div key={slug}
              className="flex flex-col md:flex-row w-full border-b"
              style={{
                borderColor: 'rgba(212,175,55,0.06)',
                minHeight: '280px',
              }}>

              {/* Left: Hero image */}
              <div className="relative md:w-[320px] shrink-0 overflow-hidden"
                style={{ minHeight: '280px', background: hero.palette['bg-deep'] }}>
                <img
                  src={`/${slug}-suit.png`}
                  alt={hero.name}
                  className="w-full h-full object-cover object-top"
                  onError={(e) => { (e.target as HTMLImageElement).src = `/${slug}.png`; }}
                  style={{ position: 'absolute', inset: 0 }}
                />
                <div className="absolute inset-0"
                  style={{ background: `linear-gradient(to right, transparent 70%, #0A0A0A)` }} />
              </div>

              {/* Right: Info + CTAs */}
              <div className="flex-1 flex flex-col justify-center px-8 py-8 gap-4">

                {/* Archetype */}
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full animate-pulse"
                    style={{ background: meta?.color_signature || hero.accentColor }} />
                  <span className="font-[Orbitron] text-[9px] tracking-[3px] uppercase"
                    style={{ color: meta?.color_signature || hero.accentColor }}>
                    {meta?.archetype || hero.role}
                  </span>
                </div>

                {/* Name */}
                <h2 className="font-[Orbitron] text-4xl font-black tracking-tighter"
                  style={{ color: meta?.color_signature || hero.palette.primary }}>
                  {hero.name}
                </h2>

                {/* Quote */}
                <p className="font-[Rajdhani] text-lg italic max-w-xl"
                  style={{ color: 'rgba(255,255,255,0.6)' }}>
                  &quot;{meta?.bio?.split('.')[0] || hero.quote}&quot;
                </p>

                {/* Agent count */}
                <div className="flex items-center gap-2">
                  <span className="font-[Orbitron] text-2xl font-bold"
                    style={{ color: '#D4AF37' }}>{agentCount}</span>
                  <span className="font-[Orbitron] text-[8px] tracking-[3px] uppercase"
                    style={{ color: 'rgba(255,255,255,0.3)' }}>AGENTS</span>
                </div>

                {/* CTAs */}
                <div className="flex gap-3 flex-wrap">
                  <Link href={`/chat/${slug}`}>
                    <button className="font-[Orbitron] text-[9px] tracking-[3px] uppercase px-8 py-3 transition-all"
                      style={{
                        background: `linear-gradient(135deg, ${meta?.color_signature}, ${meta?.color_signature}cc)`,
                        color: '#0A0A0A',
                        fontWeight: 700,
                      }}>
                      ENTER {hero.name} ORBIT
                    </button>
                  </Link>
                  <Link href={`/heroes/${slug}`}>
                    <button className="font-[Orbitron] text-[9px] tracking-[3px] uppercase px-8 py-3 transition-all"
                      style={{
                        background: 'transparent',
                        border: `1px solid ${meta?.color_signature}40`,
                        color: meta?.color_signature,
                      }}>
                      VIEW DETAILS
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
