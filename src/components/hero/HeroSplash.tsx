"use client";

import { getHero } from "@/lib/heroes";
import { heroAgents, heroMeta } from "@/lib/agents";
import Image from "next/image";
import Link from "next/link";

export default function HeroSplash({ slug }: { slug: string }) {
  const hero = getHero(slug);
  const meta = heroMeta[slug as keyof typeof heroMeta];
  const agents = heroAgents[slug as keyof typeof heroAgents] || [];

  if (!hero || !meta) return null;

  return (
    <section className="relative w-full min-h-[60vh] flex flex-col md:flex-row overflow-hidden border-b"
      style={{ borderColor: 'rgba(212,175,55,0.1)', background: hero.palette['bg-deep'] }}>

      {/* Left: Hero Image */}
      <div className="relative md:w-[380px] w-full min-h-[320px] shrink-0 overflow-hidden flex items-center justify-center">
        {/* Hero Image — full portrait */}
        <div style={{
          position: 'relative',
          width: '280px',
          height: '380px',
          overflow: 'hidden',
          border: '1px solid rgba(212,175,55,0.3)',
          background: '#0A0A0A',
        }}>
          <Image
            src={`/${slug}.png`}
            alt={meta.name || slug}
            fill
            style={{ objectFit: 'cover', objectPosition: 'top center' }}
            sizes="280px"
            priority
          />
        </div>
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to right, transparent 60%, ' + hero.palette['bg-deep'] + ')'
        }} />
      </div>

      {/* Right: Identity Block */}
      <div className="flex-1 flex flex-col justify-center px-8 py-10 gap-6 relative z-10">

        {/* Archetype label */}
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: meta.color_signature }} />
          <span className="font-[Orbitron] text-[10px] tracking-[4px] uppercase"
            style={{ color: meta.color_signature }}>
            {meta.archetype}
          </span>
        </div>

        {/* Hero name */}
        <div>
          <h1 className="font-[Orbitron] font-black leading-none tracking-tighter"
            style={{
              fontSize: 'clamp(48px, 6vw, 80px)',
              color: hero.palette.primary,
              textShadow: `0 0 40px ${meta.color_signature}40`
            }}>
            {meta.name}
          </h1>
          <p className="font-[Rajdhani] text-xl mt-2" style={{ color: 'rgba(212,175,55,0.7)' }}>
            {meta.short_tagline}
          </p>
        </div>

        {/* Role line */}
        <p className="font-[Rajdhani] text-lg leading-relaxed max-w-xl"
          style={{ color: '#d0c5af' }}>
          {meta.role_line}
        </p>

        {/* Specialties */}
        <div className="flex flex-col gap-2">
          {meta.specialties.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <span style={{ color: meta.color_signature }}>✦</span>
              <span className="font-[Rajdhani] text-base" style={{ color: '#d0c5af' }}>{s}</span>
            </div>
          ))}
        </div>

        {/* Best for */}
        <p className="font-[Rajdhani] text-base italic max-w-xl"
          style={{ color: 'rgba(255,255,255,0.4)' }}>
          {meta.best_for}
        </p>

        {/* CTAs */}
        <div className="flex items-center gap-4 flex-wrap">
          <Link href={`/chat/${slug}`}>
            <button className="font-[Orbitron] text-xs tracking-[3px] uppercase px-8 py-3 transition-all hover:-translate-y-0.5"
              style={{
                background: `linear-gradient(135deg, ${meta.color_signature}, ${meta.color_signature}cc)`,
                color: '#0A0A0A',
                fontWeight: 700
              }}>
              {meta.cta_primary}
            </button>
          </Link>
          <button className="font-[Orbitron] text-xs tracking-[3px] uppercase px-8 py-3 transition-all"
            style={{
              background: 'transparent',
              border: `1px solid ${meta.color_signature}40`,
              color: meta.color_signature
            }}
            onClick={() => {
              document.getElementById('agent-grid')?.scrollIntoView({ behavior: 'smooth' });
            }}>
            {meta.cta_secondary}
          </button>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-8 pt-2">
          <div>
            <p className="font-[Orbitron] text-xl font-bold" style={{ color: '#D4AF37' }}>{agents.length}</p>
            <p className="font-[Orbitron] text-[8px] tracking-[3px] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>Agents</p>
          </div>
          <div style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,0.1)' }} />
          <div>
            <p className="font-[Orbitron] text-xl font-bold" style={{ color: '#D4AF37' }}>
              {Array.from(new Set(agents.map(a => a.category))).length}
            </p>
            <p className="font-[Orbitron] text-[8px] tracking-[3px] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>Categories</p>
          </div>
          <div style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,0.1)' }} />
          <div>
            <p className="font-[Orbitron] text-xl font-bold" style={{ color: '#D4AF37' }}>ACTIVE</p>
            <p className="font-[Orbitron] text-[8px] tracking-[3px] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>Status</p>
          </div>
        </div>
      </div>
    </section>
  );
}
