"use client";

import { useState } from "react";
import { getHero } from "@/lib/heroes";
import { Agent, heroAgents } from "@/lib/agents";
import { ArrowRight, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Props {
  slug: string;
}

export default function AgentCommandCenter({ slug }: Props) {
  const hero = getHero(slug);
  const agents = heroAgents[slug] || [];

  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  if (!hero) return null;

  // Dynamically generate categories and counts
  const categoryCounts = agents.reduce((acc, agent) => {
    acc[agent.category] = (acc[agent.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categories = ["ALL", ...Object.keys(categoryCounts)];

  const filteredAgents = activeCategory === "ALL"
    ? agents
    : agents.filter(a => a.category === activeCategory);

  return (
    <section className="relative w-full py-24 min-h-screen" style={{ backgroundColor: 'var(--hero-bg-deep)' }}>
      <div className="container mx-auto px-4 z-10 relative">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b pb-8" style={{ borderColor: 'var(--hero-card-border)' }}>
          <div>
            <h2 className="text-[10px] font-[Orbitron] tracking-[4px] uppercase opacity-70 mb-2" style={{ color: 'var(--hero-primary)' }}>AGENT ROSTER</h2>
            <div className="flex items-center gap-4">
              <span className="text-4xl md:text-5xl font-[Orbitron] font-bold text-white leading-none">{hero.squad?.agent_count || agents.length}</span>
              <span className="px-3 py-1 rounded bg-green-500/20 text-green-400 font-mono text-xs uppercase tracking-widest font-bold">Active</span>
            </div>
          </div>

          {/* Dynamic Filter Bar */}
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-[Rajdhani] font-bold uppercase tracking-wider transition-all duration-200 border`}
                style={{
                  borderColor: activeCategory === cat ? 'var(--hero-accent)' : 'var(--hero-card-border)',
                  backgroundColor: activeCategory === cat ? 'rgba(var(--hero-accent-rgb), 0.15)' : 'transparent',
                  color: activeCategory === cat ? 'var(--hero-primary)' : 'var(--hero-text-dim)'
                }}
              >
                {cat} {cat !== "ALL" && <span className="opacity-50 ml-1">({categoryCounts[cat]})</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Agent Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
          {filteredAgents.map(agent => (
            <div
              key={agent.id}
              onClick={() => setSelectedAgent(agent)}
              className="group relative flex flex-col p-6 rounded-xl border cursor-pointer transition-all duration-300 ease-out bg-black/40 hover:-translate-y-1 overflow-hidden"
              style={{
                borderColor: 'var(--hero-card-border)',
                boxShadow: `0 0 0 rgba(var(--hero-accent-rgb), 0)`
              }}
            >
              {/* Hover Effect Layer */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-25 transition-opacity duration-300"
                style={{ background: 'var(--hero-gradient)' }}
              />
              <div
                className="absolute inset-0 border-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ borderColor: 'var(--hero-accent)' }}
              />

              <div className="relative z-10 flex flex-col h-full gap-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-[Orbitron] font-bold text-sm bg-white/5 border"
                      style={{ color: 'var(--hero-primary)', borderColor: 'var(--hero-card-border)' }}
                    >
                      {agent.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[18px] font-[Rajdhani] font-bold uppercase tracking-wide leading-none" style={{ color: 'var(--hero-primary)' }}>
                        {agent.name}
                      </span>
                      <span className="text-[9px] font-[Orbitron] uppercase tracking-wider mt-1 opacity-80" style={{ color: 'var(--hero-accent)' }}>
                        {agent.role_summary.substring(0, 30)}{agent.role_summary.length > 30 ? '...' : ''}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-[13px] font-['Exo_2'] leading-relaxed flex-grow opacity-80" style={{ color: 'var(--hero-text-dim)' }}>
                  {agent.description?.substring(0, 80)}...
                </p>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                  <span className="text-[9px] font-[Orbitron] uppercase tracking-widest px-2 py-1 rounded bg-white/5 text-white/50">
                    {agent.category}
                  </span>

                  {/* LAUNCH Arrow (appears on hover) */}
                  <div
                    className="flex items-center gap-1 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200"
                  >
                    <span className="text-xs font-[Orbitron] font-bold uppercase tracking-widest" style={{ color: 'var(--hero-accent)' }}>LAUNCH</span>
                    <ArrowRight className="w-4 h-4" style={{ color: 'var(--hero-accent)' }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Overlay */}
      {selectedAgent && (
        <AgentDetailOverlay
          agent={selectedAgent}
          heroName={hero.name}
          classTitle={hero.class_title}
          slug={slug}
          onClose={() => setSelectedAgent(null)}
        />
      )}
    </section>
  );
}

function AgentDetailOverlay({
  agent,
  heroName,
  classTitle,
  slug,
  onClose
}: {
  agent: Agent, heroName: string, classTitle: string, slug: string, onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-end animate-in fade-in duration-300">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="relative z-10 w-full max-w-md h-full bg-black border-l flex flex-col animate-in slide-in-from-right duration-300 ease-out"
        style={{ borderColor: 'var(--hero-accent)' }}
      >
        <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'var(--hero-gradient)' }} />

        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <span className="text-[10px] font-[Orbitron] tracking-[4px] uppercase" style={{ color: 'var(--hero-primary)' }}>AGENT ARCHIVE</span>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white/70" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center font-[Orbitron] font-black text-2xl bg-white/5 border-2 shadow-lg"
              style={{ color: 'var(--hero-primary)', borderColor: 'var(--hero-accent)', boxShadow: '0 0 20px var(--hero-glow)' }}
            >
              {agent.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-3xl font-[Rajdhani] font-bold uppercase leading-none" style={{ color: 'var(--hero-primary)' }}>{agent.name}</h3>
              <p className="text-sm font-[Orbitron] mt-2 uppercase tracking-widest" style={{ color: 'var(--hero-accent)' }}>{agent.role_summary}</p>
            </div>
          </div>

          <div className="inline-block px-3 py-1 rounded bg-white/5 text-[10px] font-[Orbitron] uppercase tracking-widest text-white/70 border border-white/10">
            {agent.category}
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-[Orbitron] tracking-[4px] uppercase" style={{ color: 'var(--hero-primary)' }}>DIRECTIVE</h4>
            <p className="text-[14px] font-['Exo_2'] leading-relaxed" style={{ color: 'var(--hero-text-dim)' }}>
              {agent.description}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-white/5 border border-white/10 mt-8">
            <p className="text-[10px] font-mono uppercase tracking-widest opacity-60 mb-2">Attribution</p>
            <p className="text-sm font-[Rajdhani] font-bold tracking-wider" style={{ color: 'var(--hero-primary)' }}>
              COMMANDED BY {heroName} — {classTitle}
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-white/10 bg-black/50">
          <Link href={`/chat?hero=${slug}&agent=${agent.id}`}>
            <Button
              className="w-full py-6 rounded-none font-[Orbitron] font-bold uppercase tracking-widest text-black hover:opacity-90 transition-opacity"
              style={{ backgroundColor: 'var(--hero-accent)' }}
            >
              LAUNCH AGENT <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
