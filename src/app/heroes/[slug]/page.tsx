import { getHero, heroOrder } from "@/lib/heroes";
import { heroMeta } from "@/lib/agents";
import { notFound } from "next/navigation";
import HeroSplash from "@/components/hero/HeroSplash";
import { AgentCommandCenter } from "@/components/hero/AgentCommandCenter";
import UniverseConnections from "@/components/hero/UniverseConnections";
import HeroNav from "@/components/hero/HeroNav";

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
      <UniverseConnections slug={slug} />
      <HeroNav slug={slug} />
    </main>
  );
}
