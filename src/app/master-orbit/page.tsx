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

      {/* Hero cards — 2 per row grid */}
      <div className="grid grid-cols-1 md:grid-cols-2">
        {heroOrder.map((slug) => {
          const hero = heroData[slug];
          const meta = heroMeta[slug as keyof typeof heroMeta];
          const agentCount = heroAgents[slug as keyof typeof heroAgents]?.length || 0;

          return (
            <div key={slug}
              className="flex flex-col border-b border-r"
              style={{
                borderColor: 'rgba(212,175,55,0.06)',
                minHeight: '320px',
              }}>

              {/* Hero image — top half */}
              <div className="relative w-full overflow-hidden" style={{ height: '220px' }}>
                <img
                  src={`/${slug}-suit.png`}
                  alt={hero.name}
                  className="w-full h-full object-cover object-top"
                  onError={(e) => { (e.target as HTMLImageElement).src = `/${slug}.png`; }}
                  style={{ display: 'block' }}
                />
                <div className="absolute inset-0"
                  style={{ background: 'linear-gradient(to bottom, transparent 40%, #0A0A0A)' }} />

                {/* Agent count bubble — bottom left of image */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full"
                  style={{
                    background: 'rgba(10,10,10,0.85)',
                    border: `1px solid ${meta?.color_signature || '#D4AF37'}40`,
                    backdropFilter: 'blur(4px)',
                  }}>
                  <div className="w-1.5 h-1.5 rounded-full"
                    style={{ background: meta?.color_signature || '#D4AF37' }} />
                  <span className="font-[Orbitron] text-[9px] font-bold"
                    style={{ color: meta?.color_signature || '#D4AF37' }}>
                    {agentCount}
                  </span>
                  <span className="font-[Orbitron] text-[7px] tracking-[1px] uppercase"
                    style={{ color: 'rgba(255,255,255,0.4)' }}>
                    AGENTS
                  </span>
                </div>
              </div>

              {/* Info + CTAs — bottom half */}
              <div className="flex flex-col justify-between flex-1 px-6 py-5 gap-3">
                <div>
                  {/* Archetype */}
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full"
                      style={{ background: meta?.color_signature || hero.accentColor }} />
                    <span className="font-[Orbitron] text-[8px] tracking-[2px] uppercase"
                      style={{ color: meta?.color_signature || hero.accentColor }}>
                      {meta?.archetype || hero.role}
                    </span>
                  </div>

                  {/* Name */}
                  <h2 className="font-[Orbitron] text-2xl font-black"
                    style={{ color: meta?.color_signature || hero.palette.primary }}>
                    {hero.name}
                  </h2>

                  {/* Quote */}
                  <p className="font-[Rajdhani] text-sm mt-1 leading-relaxed"
                    style={{ color: 'rgba(255,255,255,0.5)' }}>
                    &quot;{(meta?.bio || hero.quote || '').split('.')[0]}&quot;
                  </p>
                </div>

                {/* CTAs */}
                <div className="flex gap-2">
                  <Link href={`/chat/${slug}`} className="flex-1">
                    <button className="w-full font-[Orbitron] text-[8px] tracking-[2px] uppercase py-2.5 transition-all"
                      style={{
                        background: `linear-gradient(135deg, ${meta?.color_signature}, ${meta?.color_signature}cc)`,
                        color: '#0A0A0A',
                        fontWeight: 700,
                      }}>
                      ENTER ORBIT
                    </button>
                  </Link>
                  <Link href={`/heroes/${slug}`} className="flex-1">
                    <button className="w-full font-[Orbitron] text-[8px] tracking-[2px] uppercase py-2.5 transition-all"
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
