"use client";

import Image from "next/image";
import { useState } from "react";
import { getHero } from "@/lib/heroes";

interface HeroImageProps {
  slug: string;
  type: 'splash' | 'suit';
  className?: string;
}

export default function HeroImage({ slug, type, className = '' }: HeroImageProps) {
  const [hasError, setHasError] = useState(false);
  const hero = getHero(slug);

  if (!hero) return null;

  const src = type === 'splash'
    ? `/heroes/${slug}.png`
    : `/heroes/${slug}-suit.png`;

  if (hasError) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center overflow-hidden bg-black/80 ${className}`}
      >
        <div
          className="absolute inset-0 opacity-30 mix-blend-screen"
          style={{
            background: `radial-gradient(circle at center, var(--hero-accent) 0%, transparent 70%)`
          }}
        />
        <div className="relative z-10 flex flex-col items-center justify-center gap-2 p-8 text-center backdrop-blur-sm rounded-2xl border border-white/5">
          <span
            className="font-[Orbitron] font-black text-6xl md:text-8xl tracking-tighter opacity-90"
            style={{ color: 'var(--hero-primary)' }}
          >
            {hero.name.substring(0, 2).toUpperCase()}
          </span>
          <span
            className="font-[Orbitron] text-xs md:text-sm tracking-[0.3em] uppercase opacity-70"
            style={{ color: 'var(--hero-accent)' }}
          >
            {hero.class_title}
          </span>
          <div className="mt-4 px-4 py-1 text-[10px] font-mono uppercase tracking-widest text-white/40 border border-white/10 rounded-full bg-white/5">
            {type === 'splash' ? 'Visual Core Offline' : 'Suit Schematics Offline'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <Image
        src={src}
        alt={`${hero.name} ${type}`}
        fill
        className={`object-${type === 'splash' ? 'cover' : 'contain'}`}
        onError={() => setHasError(true)}
        priority={type === 'splash'}
        unoptimized
      />
    </div>
  );
}
