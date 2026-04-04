"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useMemo, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { heroData, heroOrder } from "@/lib/heroes";
import { heroAgents, heroMeta } from "@/lib/agents";

const DEPARTMENTS = ["All", "Strategy", "Operations", "Marketing", "Sales", "Content", "Finance", "Learning"];
const OUTCOMES = ["All", "Generate", "Analyze", "Automate", "Optimize", "Close"];

const departmentMap: Record<string, string[]> = {
  thoren:  ["Strategy", "Finance"],
  ramet:   ["Operations"],
  nexar:   ["Marketing", "Learning"],
  lyra:    ["Content", "Marketing"],
  kairo:   ["Content"],
  nefra:   ["Sales", "Operations"],
  horusen: ["Sales", "Strategy"],
};

const outcomeMap: Record<string, string[]> = {
  thoren:  ["Analyze", "Optimize"],
  ramet:   ["Automate", "Optimize"],
  nexar:   ["Generate", "Automate"],
  lyra:    ["Generate"],
  kairo:   ["Generate", "Automate"],
  nefra:   ["Optimize", "Close"],
  horusen: ["Close", "Generate"],
};

function HubPageContent() {
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("All");
  const [outcome, setOutcome] = useState("All");
  const searchParams = useSearchParams();
  const focusSearch = searchParams.get('focus') === 'search';
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focusSearch && searchRef.current) {
      searchRef.current.focus();
    }
  }, [focusSearch]);

  const heroes = heroOrder.map(slug => ({
    slug,
    data: heroData[slug],
    meta: heroMeta[slug as keyof typeof heroMeta],
  }));

  const searchResults = useMemo(() => {
    const q = search.toLowerCase().trim();

    const filteredHeroes = heroes.filter(({ slug, data, meta }) => {
      const matchSearch = !q ||
        data.name.toLowerCase().includes(q) ||
        (meta?.archetype || '').toLowerCase().includes(q) ||
        (meta?.role_line || '').toLowerCase().includes(q);
      const matchDept = dept === "All" || (departmentMap[slug] || []).includes(dept);
      const matchOutcome = outcome === "All" || (outcomeMap[slug] || []).includes(outcome);
      return matchSearch && matchDept && matchOutcome;
    });

    const agentMatches: Array<{
      heroSlug: string;
      heroName: string;
      heroColor: string;
      agentName: string;
      agentRole: string;
      agentId: string;
    }> = [];

    heroOrder.forEach(slug => {
      const matchDept = dept === "All" || (departmentMap[slug] || []).includes(dept);
      const matchOutcome = outcome === "All" || (outcomeMap[slug] || []).includes(outcome);
      if (!matchDept || !matchOutcome) return;

      const agents = heroAgents[slug as keyof typeof heroAgents] || [];
      const meta = heroMeta[slug as keyof typeof heroMeta];

      agents.forEach(agent => {
        const matchSearch = !q ||
          agent.name.toLowerCase().includes(q) ||
          agent.role_summary.toLowerCase().includes(q) ||
          agent.category.toLowerCase().includes(q) ||
          agent.description.toLowerCase().includes(q);

        if (matchSearch) {
          agentMatches.push({
            heroSlug: slug,
            heroName: meta?.name || slug.toUpperCase(),
            heroColor: meta?.color_signature || '#D4AF37',
            agentName: agent.name,
            agentRole: agent.role_summary,
            agentId: agent.id,
          });
        }
      });
    });

    return { heroes: filteredHeroes, agentMatches };
  }, [heroes, search, dept, outcome]);

  const filtered = searchResults.heroes;

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A] text-white pb-24">

      {/* Onboarding header */}
      <div className="w-full px-6 md:px-12 pt-12 pb-6 text-center">
        <p className="font-[Orbitron] text-[9px] tracking-[5px] uppercase mb-3"
          style={{ color: 'rgba(212,175,55,0.5)' }}>
          EMPIRE ENGINE
        </p>
        <h1 className="font-[Orbitron] text-4xl md:text-5xl font-black tracking-tighter mb-4"
          style={{ color: '#ffffff', textShadow: '0 0 30px rgba(212,175,55,0.2)' }}>
          HERO HUB
        </h1>
        <p className="font-[Rajdhani] text-lg mb-2" style={{ color: '#d0c5af' }}>
          Pick an AI specialist by goal: strategy, writing, analysis, growth, operations, sales, or learning.
        </p>
      </div>

      {/* Filters */}
      <div className="w-full px-6 md:px-12 pb-8 flex flex-col gap-4">

        {/* Search */}
        <div className="relative max-w-md w-full mx-auto">
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or specialty..."
            className="w-full py-3 pl-4 pr-4 text-sm"
            style={{
              background: '#111111',
              border: '1px solid rgba(212,175,55,0.2)',
              color: '#d0c5af',
              outline: 'none',
            }}
          />
        </div>

        {/* Department chips */}
        <div className="flex flex-wrap gap-2 justify-center">
          <span className="font-[Orbitron] text-[8px] tracking-[3px] uppercase self-center mr-2"
            style={{ color: 'rgba(212,175,55,0.4)' }}>DEPT:</span>
          {DEPARTMENTS.map(d => (
            <button key={d} onClick={() => setDept(d)}
              className="font-[Orbitron] text-[8px] tracking-[2px] uppercase px-3 py-1.5 transition-all"
              style={{
                background: dept === d ? '#D4AF37' : 'transparent',
                color: dept === d ? '#0A0A0A' : 'rgba(212,175,55,0.6)',
                border: '1px solid rgba(212,175,55,0.25)',
                fontWeight: dept === d ? 700 : 400,
              }}>
              {d}
            </button>
          ))}
        </div>

        {/* Outcome chips */}
        <div className="flex flex-wrap gap-2 justify-center">
          <span className="font-[Orbitron] text-[8px] tracking-[3px] uppercase self-center mr-2"
            style={{ color: 'rgba(212,175,55,0.4)' }}>OUTCOME:</span>
          {OUTCOMES.map(o => (
            <button key={o} onClick={() => setOutcome(o)}
              className="font-[Orbitron] text-[8px] tracking-[2px] uppercase px-3 py-1.5 transition-all"
              style={{
                background: outcome === o ? '#2563EB' : 'transparent',
                color: outcome === o ? '#ffffff' : 'rgba(255,255,255,0.4)',
                border: '1px solid rgba(37,99,235,0.3)',
                fontWeight: outcome === o ? 700 : 400,
              }}>
              {o}
            </button>
          ))}
        </div>
      </div>

      {/* Hero Grid */}
      <main className="flex-1 px-6 md:px-12">
        {(search.trim() || dept !== 'All' || outcome !== 'All') && searchResults.agentMatches.length > 0 && (
          <div className="mb-8 max-w-7xl mx-auto">
            <p className="font-[Orbitron] text-[8px] tracking-[3px] uppercase mb-3"
              style={{ color: 'rgba(212,175,55,0.5)' }}>
              AGENT MATCHES ({searchResults.agentMatches.length})
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {searchResults.agentMatches.slice(0, 6).map((match, i) => (
                <a key={i} href={`/chat/${match.heroSlug}?agent=${match.agentId}`}
                  className="flex items-center gap-3 p-3 transition-all"
                  style={{
                    background: '#111111',
                    border: '1px solid rgba(212,175,55,0.08)',
                    borderLeft: `3px solid ${match.heroColor}`,
                  }}>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-[Orbitron] text-[7px] tracking-[2px] uppercase"
                        style={{ color: match.heroColor }}>
                        {match.heroName}
                      </span>
                    </div>
                    <p className="font-[Orbitron] text-xs font-bold" style={{ color: '#ffffff' }}>
                      {match.agentName}
                    </p>
                    <p className="font-[Rajdhani] text-xs" style={{ color: '#d0c5af', opacity: 0.7 }}>
                      {match.agentRole}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-[Orbitron] text-xs tracking-widest uppercase"
              style={{ color: 'rgba(212,175,55,0.3)' }}>NO HEROES MATCH YOUR FILTERS</p>
            <button onClick={() => { setSearch(""); setDept("All"); setOutcome("All"); }}
              className="mt-4 font-[Orbitron] text-[9px] tracking-[2px] uppercase px-4 py-2"
              style={{ border: '1px solid rgba(212,175,55,0.3)', color: 'rgba(212,175,55,0.6)' }}>
              CLEAR FILTERS
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 md:gap-4 w-full mx-auto" style={{ maxWidth: '1920px' }}>
            {filtered.map(({ slug, data, meta }, i) => (
              <motion.div key={slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.07 }}>
                <Link href={`/heroes/${slug}`} className="group block h-full">
                  <div className="h-full flex flex-col transition-all duration-300"
                    style={{
                      background: '#111111',
                      border: '1px solid rgba(212,175,55,0.08)',
                      borderTop: `3px solid ${meta?.color_signature || data.accentColor}`,
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 30px ${meta?.color_signature}20`;
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                    }}>

                    {/* Hero image — full width, flexible aspect ratio */}
                    <div className="relative w-full overflow-hidden aspect-[3/4] max-h-[300px]">
                      <Image
                        src={`/${slug}.png`}
                        alt={data.name}
                        fill
                        className="object-cover object-top transition-transform duration-500 group-hover:scale-105"

                      />
                      <div className="absolute inset-0"
                        style={{ background: 'linear-gradient(to top, #111111 0%, transparent 60%)' }} />
                    </div>

                    {/* Content */}
                    <div className="p-2 sm:p-3 lg:p-5 flex flex-col gap-2 lg:gap-3 flex-1 overflow-hidden">

                      {/* Hero name (Main title) */}
                      <h2 className="font-[Orbitron] text-xs sm:text-sm lg:text-base font-black tracking-tight uppercase"
                        style={{ color: meta?.color_signature || data.accentColor }}>
                        {
                          slug === 'thoren' ? 'THOREN The Law' :
                          slug === 'ramet' ? 'RAMET The Stabilizer' :
                          slug === 'nexar' ? 'NEXAR The Destabilizer' :
                          slug === 'lyra' ? 'LYRA The Signal' :
                          slug === 'kairo' ? 'KAIRO The Gridwalker' :
                          slug === 'nefra' ? 'NEFRA The Keeper' :
                          slug === 'horusen' ? 'HORUSEN The Closer' :
                          data.name
                        }
                      </h2>

                      {/* Subtitle */}
                      <p className="font-[Orbitron] text-[8px] sm:text-[9px] lg:text-[10px] tracking-widest uppercase leading-snug"
                        style={{ color: '#ffffff' }}>
                        {
                          slug === 'thoren' ? 'Governance & Finance Strategist' :
                          slug === 'ramet' ? 'Operations & Execution Lead' :
                          slug === 'nexar' ? 'Transformation Architect' :
                          slug === 'lyra' ? 'Growth Content & Virality Engine' :
                          slug === 'kairo' ? 'Social & Creator Systems Director' :
                          slug === 'nefra' ? 'Experience & Relationship Guardian' :
                          slug === 'horusen' ? 'Revenue, Offers & Deals Strategist' :
                          meta?.archetype || data.role
                        }
                      </p>

                      {/* Agent count */}
                      <div className="flex items-center gap-2 mt-auto pt-2">
                        <span className="font-[Orbitron] text-lg lg:text-xl font-bold" style={{ color: '#D4AF37' }}>
                          {heroAgents[slug as keyof typeof heroAgents]?.length || 0}
                        </span>
                        <span className="font-[Orbitron] text-[8px] sm:text-[10px] tracking-[2px] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>
                          AGENTS
                        </span>
                      </div>

                      {/* Two action buttons side-by-side */}
                      <div className="flex flex-row gap-2 pt-3"
                        style={{ borderTop: `1px solid ${meta?.color_signature || '#D4AF37'}15` }}>
                        <Link href={`/chat/${slug}`} className="flex-1 w-full min-w-0" onClick={e => e.stopPropagation()}>
                          <button className="w-full font-[Orbitron] text-[9px] sm:text-[10px] tracking-widest uppercase py-2 transition-all truncate px-2 rounded-full"
                            style={{
                              background: `linear-gradient(135deg, ${meta?.color_signature}, ${meta?.color_signature}cc)`,
                              color: '#0A0A0A',
                              fontWeight: 700,
                            }}>
                            ENTER
                          </button>
                        </Link>
                        <Link href={`/heroes/${slug}`} className="flex-1 w-full min-w-0" onClick={e => e.stopPropagation()}>
                          <button className="w-full font-[Orbitron] text-[9px] sm:text-[10px] tracking-widest uppercase py-2 transition-all truncate px-2 rounded-full"
                            style={{
                              background: 'transparent',
                              border: `1px solid ${meta?.color_signature}40`,
                              color: meta?.color_signature,
                            }}>
                            DETAILS
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function HubPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A]" />}>
      <HubPageContent />
    </Suspense>
  );
}
