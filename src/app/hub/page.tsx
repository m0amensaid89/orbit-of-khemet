"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { heroData, heroOrder } from "@/lib/heroes";
import { heroMeta } from "@/lib/agents";

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

export default function HubPage() {
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("All");
  const [outcome, setOutcome] = useState("All");

  const heroes = heroOrder.map(slug => ({
    slug,
    data: heroData[slug],
    meta: heroMeta[slug as keyof typeof heroMeta],
  }));

  const filtered = useMemo(() => {
    return heroes.filter(({ slug, data, meta }) => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        data.name.toLowerCase().includes(q) ||
        (meta?.archetype || '').toLowerCase().includes(q) ||
        (meta?.role_line || '').toLowerCase().includes(q);
      const matchDept = dept === "All" || (departmentMap[slug] || []).includes(dept);
      const matchOutcome = outcome === "All" || (outcomeMap[slug] || []).includes(outcome);
      return matchSearch && matchDept && matchOutcome;
    });
  }, [heroes, search, dept, outcome]);

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
        <p className="font-[Rajdhani] text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Thoren: Governance — Ramet: Operations — Nexar: Transformation — Lyra: Growth Content — Kairo: Creator Systems — Nefra: Experience — Horusen: Revenue
        </p>
      </div>

      {/* Filters */}
      <div className="w-full px-6 md:px-12 pb-8 flex flex-col gap-4">

        {/* Search */}
        <div className="relative max-w-md w-full mx-auto">
          <input
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
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
                      (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 30px ${meta?.color_signature || data.accentColor}20`;
                      (e.currentTarget as HTMLDivElement).style.borderColor = `${meta?.color_signature || data.accentColor}40`;
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                      (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(212,175,55,0.08)';
                    }}>

                    {/* Hero image */}
                    <div className="relative w-full aspect-[4/3] overflow-hidden">
                      <Image
                        src={`/${slug}.png`}
                        alt={data.name}
                        fill
                        className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                        unoptimized
                      />
                      <div className="absolute inset-0"
                        style={{ background: `linear-gradient(to top, #111111 0%, transparent 60%)` }} />
                    </div>

                    {/* Content */}
                    <div className="p-5 flex flex-col gap-3 flex-1">

                      {/* Archetype */}
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full"
                          style={{ background: meta?.color_signature || data.accentColor }} />
                        <span className="font-[Orbitron] text-[7px] tracking-[2px] uppercase"
                          style={{ color: meta?.color_signature || data.accentColor }}>
                          {meta?.archetype || data.role}
                        </span>
                      </div>

                      {/* Name */}
                      <h2 className="font-[Orbitron] text-xl font-black tracking-tight"
                        style={{ color: '#ffffff' }}>
                        {data.name}
                      </h2>

                      {/* Role line */}
                      <p className="font-[Rajdhani] text-sm leading-relaxed"
                        style={{ color: '#d0c5af', opacity: 0.8 }}>
                        {meta?.role_line || data.role}
                      </p>

                      {/* Specialties */}
                      <div className="flex flex-col gap-1 mt-1">
                        {(meta?.specialties || []).slice(0, 2).map((s, idx) => (
                          <div key={idx} className="flex items-center gap-1.5">
                            <span style={{ color: meta?.color_signature, fontSize: '10px' }}>✦</span>
                            <span className="font-[Rajdhani] text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{s}</span>
                          </div>
                        ))}
                      </div>

                      {/* CTA */}
                      <div className="mt-auto pt-4 flex items-center justify-between"
                        style={{ borderTop: `1px solid ${meta?.color_signature || '#D4AF37'}15` }}>
                        <span className="font-[Orbitron] text-[8px] tracking-[2px] uppercase"
                          style={{ color: meta?.color_signature || '#D4AF37' }}>
                          ENTER ORBIT
                        </span>
                        <span style={{ color: meta?.color_signature || '#D4AF37', fontSize: '12px' }}>→</span>
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
