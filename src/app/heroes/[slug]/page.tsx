import { getHero, heroOrder } from "@/lib/heroes";
import { heroMeta, heroAgents } from "@/lib/agents";
import { notFound } from "next/navigation";
import HeroSplash from "@/components/hero/HeroSplash";
import { AgentCommandCenter } from "@/components/hero/AgentCommandCenter";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const hero = getHero(slug);
  const meta = heroMeta[slug as keyof typeof heroMeta];

  if (!hero) return {};

  return {
    title: `${hero.name}: ${meta?.archetype || hero.class_title} | Orbit of Khemet`,
    description: meta?.card_description || hero.origin_line,
    openGraph: {
      title: `${hero.name} | I-Gamify Universe`,
      description: hero.quote,
      images: [{ url: `/heroes/${slug}.png` }]
    }
  };
}

export function generateStaticParams() {
  return heroOrder.map(slug => ({ slug }));
}

export default async function HeroPage({ params }: PageProps) {
  const { slug } = await params;
  const hero = getHero(slug);

  if (!hero) {
    notFound();
  }

  const meta = heroMeta[slug as keyof typeof heroMeta];

  const styleProps = {
    '--hero-primary': hero.palette.primary,
    '--hero-primary-rgb': hero.palette["primary-rgb"],
    '--hero-secondary': hero.palette.secondary,
    '--hero-accent': hero.palette.accent,
    '--hero-accent-rgb': hero.palette["accent-rgb"],
    '--hero-bg-deep': hero.palette["bg-deep"],
    '--hero-bg-mid': hero.palette["bg-mid"],
    '--hero-glow': hero.palette.glow,
    '--hero-glow-strong': hero.palette["glow-strong"],
    '--hero-gradient': hero.palette.gradient,
    '--hero-card-border': hero.palette["card-border"],
    '--hero-text-dim': hero.palette["text-dim"],
  } as React.CSSProperties;

  return (
    <main
      className="min-h-screen bg-black text-white selection:bg-white/20"
      style={styleProps}
    >
      <HeroSplash slug={slug} />
      <AgentCommandCenter slug={slug} accentColor={meta?.color_signature || hero.palette.accent} />

      <div className="flex justify-center py-8">
        <div className="flex items-center gap-3 px-6 py-3 rounded-full"
          style={{
            background: 'rgba(212,175,55,0.06)',
            border: '1px solid rgba(212,175,55,0.15)',
          }}>
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#D4AF37' }} />
          <span className="font-[Orbitron] text-xl font-bold" style={{ color: '#D4AF37' }}>
            {heroAgents[slug as keyof typeof heroAgents]?.length || 0}
          </span>
          <span className="font-[Orbitron] text-[9px] tracking-[3px] uppercase"
            style={{ color: 'rgba(255,255,255,0.4)' }}>
            AGENTS ASSIGNED
          </span>
        </div>
      </div>
    </main>
  );
}
