import { getHero } from "@/lib/heroes";
import { heroAgents } from "@/lib/agents";
import HeroImage from "./HeroImage";
import { ChevronDown } from "lucide-react";

export default function HeroSplash({ slug }: { slug: string }) {
  const hero = getHero(slug);
  const agents = heroAgents[slug] || [];

  if (!hero) return null;

  const categories = new Set(agents.map(a => a.category)).size;

  return (
    <section className="relative w-full min-h-[70vh] flex flex-col md:flex-row items-center justify-center overflow-hidden border-b border-white/5">
      <div
        className="absolute inset-0 z-0 opacity-80"
        style={{ background: 'var(--hero-gradient)' }}
      />

      <div className="container mx-auto px-4 z-10 flex flex-col md:flex-row items-stretch h-full gap-8 py-12 md:py-0">

        {/* Left Side: Hero Image */}
        <div className="flex-1 relative min-h-[40vh] md:min-h-full flex items-center justify-center order-2 md:order-1 rounded-2xl overflow-hidden border border-white/10" style={{ borderColor: 'var(--hero-card-border)' }}>
           <HeroImage slug={slug} type="splash" className="w-full h-full min-h-[40vh]" />
        </div>

        {/* Right Side: Identity Block */}
        <div className="flex-1 flex flex-col justify-center order-1 md:order-2 space-y-6">
          <div className="space-y-2">
            <span
              className="inline-block px-3 py-1 rounded-full text-[11px] font-[Orbitron] uppercase tracking-[0.2em]"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--hero-accent)', border: '1px solid var(--hero-card-border)' }}
            >
              {hero.class_title}
            </span>
            <h1
              className="text-[clamp(48px,7vw,96px)] font-[Orbitron] font-black uppercase leading-none tracking-tighter drop-shadow-lg"
              style={{ color: 'var(--hero-primary)', textShadow: '0 0 40px var(--hero-glow-strong)' }}
            >
              {hero.name}
            </h1>
            <p
              className="text-[22px] font-[Rajdhani] font-light leading-relaxed max-w-2xl"
              style={{ color: '#e0e0e0' }}
            >
              {hero.origin_line}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/10 mt-8" style={{ borderColor: 'var(--hero-card-border)' }}>
            <div className="flex flex-col">
              <span className="text-[10px] font-[Orbitron] tracking-[4px] uppercase opacity-70 mb-1" style={{ color: 'var(--hero-primary)' }}>Agents</span>
              <span className="text-2xl font-[Orbitron] font-bold" style={{ color: 'var(--hero-accent)' }}>{hero.squad?.agent_count || agents.length}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-[Orbitron] tracking-[4px] uppercase opacity-70 mb-1" style={{ color: 'var(--hero-primary)' }}>Categories</span>
              <span className="text-2xl font-[Orbitron] font-bold" style={{ color: 'var(--hero-accent)' }}>{categories}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-[Orbitron] tracking-[4px] uppercase opacity-70 mb-1" style={{ color: 'var(--hero-primary)' }}>Domain</span>
              <span className="text-sm font-[Rajdhani] font-medium tracking-widest uppercase mt-1" style={{ color: 'var(--hero-text-dim)' }}>{hero.faction}</span>
            </div>
          </div>
        </div>

      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 animate-bounce opacity-50">
        <ChevronDown className="w-8 h-8" style={{ color: 'var(--hero-primary)' }} />
      </div>
    </section>
  );
}
