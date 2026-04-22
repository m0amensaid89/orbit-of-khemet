"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useMemo, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { heroData, heroOrder } from "@/lib/heroes";
import { heroAgents, heroMeta } from "@/lib/agents";
import { skillsRegistry } from "@/lib/agent-skills";
import { useLanguage } from "@/hooks/useLanguage";

const HERO_PILLS = ["ALL", "KAIRO", "LYRA", "NEFRA", "NEXAR", "RAMET", "THOREN", "HORUSEN"];

function HubPageContent() {
  const [search, setSearch] = useState("");
  const [heroFilter, setHeroFilter] = useState("ALL");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [lang] = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('orbit_favorite_heroes') || '[]');
      setFavorites(saved);
    } catch {}
  }, []);

  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.get('focus') === 'search' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchParams]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearch("");
        setHeroFilter("ALL");
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const toggleFavorite = (slug: string) => {
    setFavorites(prev => {
      const next = prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug];
      localStorage.setItem('orbit_favorite_heroes', JSON.stringify(next));
      return next;
    });
  };

  const allAgents = useMemo(() => Object.values(skillsRegistry), []);

  const agentResults = useMemo(() => {
    const q = search.toLowerCase().trim();
    return allAgents.filter(agent => {
      const matchHero = heroFilter === "ALL" || agent.hero === heroFilter;
      const matchSearch = !q ||
        agent.name.toLowerCase().includes(q) ||
        (agent.capabilities || []).some((c: string) => c.toLowerCase().includes(q)) ||
        (agent.routingHints || []).some((h: string) => h.toLowerCase().includes(q));
      return matchHero && matchSearch;
    });
  }, [allAgents, search, heroFilter]);

  const heroes = heroOrder.map(slug => ({
    slug,
    data: heroData[slug],
    meta: heroMeta[slug as keyof typeof heroMeta],
  }));

  const isSearchMode = search.trim() !== "" || heroFilter !== "ALL";

  const HERO_COLORS: Record<string, string> = {
    KAIRO: "#22d3ee",
    LYRA: "#a78bfa",
    NEFRA: "#fb923c",
    NEXAR: "#4ade80",
    RAMET: "#f472b6",
    THOREN: "#D4AF37",
    HORUSEN: "#60a5fa",
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A] text-white pb-24" dir={lang === 'ar' ? 'rtl' : 'ltr'}>

      {/* Header */}
      <div className="w-full px-6 md:px-12 pt-12 pb-6 text-center">
        <p className="font-[Orbitron] text-empire-xs tracking-[5px] uppercase mb-3"
          style={{ color: 'rgba(212,175,55,0.5)' }}>
          EMPIRE ENGINE
        </p>
        <h1 className="font-[Orbitron] text-empire-xl font-black tracking-tighter mb-4"
          style={{ color: '#ffffff', textShadow: '0 0 30px rgba(212,175,55,0.2)' }}>
          HERO HUB
        </h1>
        <p className="font-[Rajdhani] text-empire-sm mb-2" style={{ color: '#d0c5af' }}>
          Pick an AI specialist by goal: strategy, writing, analysis, growth, operations, sales, or learning.
        </p>
      </div>

      {/* Search + Filters */}
      <div className="w-full px-6 md:px-12 pb-8 flex flex-col gap-4">

        {/* Search bar */}
        <div className="relative max-w-2xl w-full mx-auto">
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={lang === 'ar' ? 'ابحث عن وكيل بالاسم أو المهارة...' : 'Search 120 agents by name, skill, or task...'}
            className="w-full py-3 pl-4 pr-10 text-sm transition-all"
            style={{
              background: '#111111',
              border: search ? '1px solid #D4AF37' : '1px solid #333',
              color: '#d0c5af',
              outline: 'none',
              borderRadius: '4px',
              fontFamily: 'Roboto, sans-serif',
            }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{
                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: 'rgba(212,175,55,0.6)',
                cursor: 'pointer', fontSize: '16px', lineHeight: 1,
              }}>
              x
            </button>
          )}
        </div>

        {/* Hero filter pills */}
        <div className="flex flex-wrap gap-2 justify-center">
          {HERO_PILLS.map(hero => (
            <button
              key={hero === 'ALL' ? (lang === 'ar' ? 'الكل' : 'ALL') : hero}
              onClick={() => setHeroFilter(hero)}
              style={{
                fontFamily: 'Orbitron, monospace',
                fontSize: '9px',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                padding: '6px 12px',
                borderRadius: '4px',
                border: heroFilter === hero ? '1px solid #D4AF37' : '1px solid rgba(212,175,55,0.2)',
                background: heroFilter === hero ? 'rgba(212,175,55,0.1)' : 'transparent',
                color: heroFilter === hero ? '#D4AF37' : 'rgba(212,175,55,0.5)',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}>
              {hero}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 px-6 md:px-12">

        {/* AGENT SEARCH RESULTS */}
        {isSearchMode ? (
          <div className="max-w-7xl mx-auto">
            <p style={{
              fontFamily: 'Orbitron, monospace', fontSize: '9px',
              letterSpacing: '3px', textTransform: 'uppercase',
              color: 'rgba(212,175,55,0.5)', marginBottom: '16px',
            }}>
              {lang === 'ar' ? `عرض ${agentResults.length} من أصل ${allAgents.length} وكيل` : `Showing ${agentResults.length} of ${allAgents.length} agents`}
            </p>

            {agentResults.length === 0 ? (
              <div className="text-center py-24">
                <p style={{
                  fontFamily: 'Orbitron, monospace', fontSize: '9px',
                  letterSpacing: '3px', textTransform: 'uppercase',
                  color: 'rgba(212,175,55,0.3)',
                }}>
                  {lang === 'ar' ? 'لا يوجد وكلاء مطابقون لبحثك' : 'No agents found for your search'}
                </p>
                <button
                  onClick={() => { setSearch(""); setHeroFilter("ALL"); }}
                  style={{
                    marginTop: '16px',
                    fontFamily: 'Orbitron, monospace', fontSize: '9px',
                    letterSpacing: '2px', textTransform: 'uppercase',
                    padding: '8px 16px',
                    border: '1px solid rgba(212,175,55,0.3)',
                    color: 'rgba(212,175,55,0.6)',
                    background: 'transparent', cursor: 'pointer',
                    borderRadius: '4px',
                  }}>
                  CLEAR FILTERS
                </button>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '12px',
              }}>
                {agentResults.map(agent => {
                  const heroKey = agent.hero.toUpperCase();
                  const badgeColor = HERO_COLORS[heroKey] || '#D4AF37';
                  return (
                    <a
                      key={agent.slug}
                      href={`/chat?agent=${agent.slug}&hero=${agent.hero.toLowerCase()}`}
                      style={{
                        display: 'block',
                        background: '#111111',
                        border: '1px solid rgba(212,175,55,0.1)',
                        borderLeft: `3px solid ${badgeColor}`,
                        padding: '16px',
                        textDecoration: 'none',
                        borderRadius: '0 4px 4px 0',
                        transition: 'border-color 0.15s, background 0.15s',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.background = '#161616';
                        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,55,0.3)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.background = '#111111';
                        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,55,0.1)';
                      }}
                    >
                      <div style={{
                        display: 'inline-block',
                        background: badgeColor,
                        color: '#0A0A0A',
                        fontFamily: 'Orbitron, monospace',
                        fontSize: '8px',
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                        padding: '2px 8px',
                        borderRadius: '2px',
                        marginBottom: '8px',
                        fontWeight: 700,
                      }}>
                        {agent.hero}
                      </div>
                      <p style={{
                        fontFamily: 'Cinzel Decorative, serif',
                        fontSize: '13px',
                        color: '#ffffff',
                        letterSpacing: '0.04em',
                        marginBottom: '6px',
                        lineHeight: 1.3,
                      }}>
                        {agent.name}
                      </p>
                      <p style={{
                        fontFamily: 'Roboto, sans-serif',
                        fontSize: '11px',
                        color: 'rgba(208,197,175,0.65)',
                        lineHeight: 1.4,
                      }}>
                        {(agent.capabilities || [])[0] || ''}
                      </p>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* DEFAULT HERO GRID */
          <>
            {favorites.length > 0 && (
              <div style={{ marginBottom: '28px', maxWidth: '1280px', margin: '0 auto 28px' }}>
                <div style={{
                  fontFamily: 'Orbitron, monospace', fontSize: '9px',
                  letterSpacing: '0.16em', color: 'rgba(212,175,55,0.4)',
                  marginBottom: '12px', paddingBottom: '6px',
                  borderBottom: '1px solid rgba(212,175,55,0.08)',
                }}>
                  PINNED HEROES
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {heroes.filter(h => favorites.includes(h.slug)).map(({ slug, data }) => (
                    <Link key={slug} href={`/heroes/${slug}`} style={{ textDecoration: 'none' }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '7px 12px',
                        border: '1px solid rgba(212,175,55,0.25)',
                        background: 'rgba(212,175,55,0.04)',
                        borderRadius: '4px', cursor: 'pointer',
                      }}>
                        <div style={{
                          fontFamily: 'Cinzel Decorative, serif', fontSize: '11px',
                          color: '#D4AF37', letterSpacing: '0.06em',
                        }}>
                          {data.name.toUpperCase()}
                        </div>
                        <button
                          onClick={e => { e.preventDefault(); e.stopPropagation(); toggleFavorite(slug); }}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: 'rgba(212,175,55,0.4)', fontSize: '11px',
                            padding: '0 2px', lineHeight: 1,
                          }}>
                          x
                        </button>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '16px',
              padding: '0 0 32px',
              maxWidth: '1280px',
              margin: '0 auto',
            }}>
              {heroes.map(({ slug, data, meta }, i) => (
                <motion.div key={slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}>
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={e => { e.preventDefault(); e.stopPropagation(); toggleFavorite(slug); }}
                      title={favorites.includes(slug) ? 'Remove from favorites' : 'Add to favorites'}
                      style={{
                        position: 'absolute', top: '8px', right: '8px', zIndex: 10,
                        background: favorites.includes(slug) ? 'rgba(212,175,55,0.2)' : 'rgba(0,0,0,0.5)',
                        border: `1px solid ${favorites.includes(slug) ? 'rgba(212,175,55,0.5)' : 'rgba(255,255,255,0.1)'}`,
                        color: favorites.includes(slug) ? '#D4AF37' : 'rgba(255,255,255,0.4)',
                        width: '28px', height: '28px', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', fontSize: '14px', borderRadius: '4px', transition: 'all 0.2s',
                      }}>
                      {favorites.includes(slug) ? '★' : '☆'}
                    </button>
                    <Link href={`/heroes/${slug}`} className="group block h-full">
                      <div style={{
                        position: 'relative', width: '100%', aspectRatio: '3/4',
                        overflow: 'hidden', cursor: 'pointer',
                        border: '1px solid rgba(212,175,55,0.2)', background: '#0A0A0A',
                      }}>
                        <Image
                          src={`/${slug}.png`}
                          alt={data.name}
                          fill
                          style={{ objectFit: 'cover', objectPosition: 'top center' }}
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                        <div style={{
                          position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px',
                          background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)',
                        }}>
                          <div style={{
                            fontFamily: 'Cinzel Decorative, serif', fontSize: '13px',
                            color: '#D4AF37', letterSpacing: '0.08em',
                          }}>
                            {lang === 'ar' ? (
                              slug === 'thoren' ? 'ثورين — القانون' :
                              slug === 'ramet' ? 'رامت — المثبِّت' :
                              slug === 'nexar' ? 'نيكسار — المزعزِع' :
                              slug === 'lyra' ? 'ليرا — الإشارة' :
                              slug === 'kairo' ? 'كايرو — سائر الشبكة' :
                              slug === 'nefra' ? 'نيفرا — الحارس' :
                              slug === 'horusen' ? 'هوروسن — المُقفِل' :
                              data.name
                            ) : (
                              slug === 'thoren' ? 'THOREN The Law' :
                              slug === 'ramet' ? 'RAMET The Stabilizer' :
                              slug === 'nexar' ? 'NEXAR The Destabilizer' :
                              slug === 'lyra' ? 'LYRA The Signal' :
                              slug === 'kairo' ? 'KAIRO The Gridwalker' :
                              slug === 'nefra' ? 'NEFRA The Keeper' :
                              slug === 'horusen' ? 'HORUSEN The Closer' :
                              data.name
                            )}
                          </div>
                          <div style={{
                            fontFamily: 'monospace', fontSize: '9px',
                            color: 'rgba(208,197,175,0.5)', letterSpacing: '0.12em', marginTop: '4px',
                          }}>
                            {slug === 'thoren' ? 'Governance & Finance Strategist' :
                             slug === 'ramet' ? 'Operations & Execution Lead' :
                             slug === 'nexar' ? 'Transformation Architect' :
                             slug === 'lyra' ? 'Growth Content & Virality Engine' :
                             slug === 'kairo' ? 'Social & Creator Systems Director' :
                             slug === 'nefra' ? 'Experience & Relationship Guardian' :
                             slug === 'horusen' ? 'Revenue, Offers & Deals Strategist' :
                             meta?.archetype || data.role}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
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
