"use client";

import { getHeroNav } from "@/lib/heroes";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function HeroNav({ slug }: { slug: string }) {
  const nav = getHeroNav(slug);

  return (
    <section className="relative w-full border-t border-white/10" style={{ backgroundColor: 'var(--hero-bg-mid)' }}>
      <div className="grid grid-cols-2 min-h-[160px] md:min-h-[240px]">
        {/* Prev */}
        <Link
          href={`/heroes/${nav.prev}`}
          className="group flex flex-col justify-center px-8 md:px-16 lg:px-24 transition-colors hover:bg-white/5 relative"
        >
          <div className="absolute inset-y-0 right-0 w-px bg-white/10" />
          <div className="flex items-center gap-4 mb-2 opacity-50 group-hover:opacity-100 transition-opacity">
            <ArrowLeft className="w-4 h-4 md:w-6 md:h-6" style={{ color: 'var(--hero-accent)' }} />
            <span className="text-[10px] font-[Orbitron] tracking-[4px] uppercase" style={{ color: 'var(--hero-accent)' }}>PREVIOUS ORBIT</span>
          </div>
          <span className="text-2xl md:text-5xl font-[Orbitron] font-black uppercase tracking-wider" style={{ color: 'var(--hero-primary)' }}>
            {nav.prev.toUpperCase()}
          </span>
        </Link>

        {/* Next */}
        <Link
          href={`/heroes/${nav.next}`}
          className="group flex flex-col items-end text-right justify-center px-8 md:px-16 lg:px-24 transition-colors hover:bg-white/5 relative"
        >
          <div className="flex items-center justify-end gap-4 mb-2 opacity-50 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] font-[Orbitron] tracking-[4px] uppercase" style={{ color: 'var(--hero-accent)' }}>NEXT ORBIT</span>
            <ArrowRight className="w-4 h-4 md:w-6 md:h-6" style={{ color: 'var(--hero-accent)' }} />
          </div>
          <span className="text-2xl md:text-5xl font-[Orbitron] font-black uppercase tracking-wider" style={{ color: 'var(--hero-primary)' }}>
            {nav.next.toUpperCase()}
          </span>
        </Link>
      </div>
    </section>
  );
}
