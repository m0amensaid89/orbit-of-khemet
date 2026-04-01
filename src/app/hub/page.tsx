"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Search, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { heroData, heroOrder } from "@/lib/heroes";

const heroes = heroOrder.map((slug, index) => {
  const data = heroData[slug];
  return {
    id: index + 1,
    name: data.name,
    slug: data.slug,
    role: data.role,
    description: data.quote || data.bio.split('.')[0] + '.',
    accentColor: data.accentColor,
    glowColor: data.palette.glow,
    primaryColor: data.palette.primary,
  };
});

export default function HubPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredHeroes = heroes.filter((hero) => {
    const query = searchQuery.toLowerCase();
    return hero.name.toLowerCase().includes(query) || hero.role.toLowerCase().includes(query);
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A] relative pb-32">
      {/* Hero Grid Section */}
      <main className="flex-1 container mx-auto px-4 py-16 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="text-center mb-10 max-w-2xl"
        >
          <p className="font-[Orbitron] text-[10px] tracking-[6px] uppercase mb-4 text-[#D4AF37]/70">
            EMPIRE ENGINE — PHASE IV ACTIVE
          </p>
          <h1 className="font-[Orbitron] text-5xl md:text-6xl font-black tracking-tighter leading-none mb-6 text-white drop-shadow-[0_0_30px_rgba(212,175,55,0.3)]">
            THE HERO HUB
          </h1>
          <p className="font-[Rajdhani] text-xl text-white/60 mb-8">
            Choose your hero. Enter their orbit. Unleash their agents.
          </p>

          {/* Search/Filter Bar */}
          <div className="relative max-w-md mx-auto w-full group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-[#D4AF37]/50 group-focus-within:text-[#D4AF37] transition-colors" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or specialty..."
              className="w-full bg-[#1A1A1A] border border-[#D4AF37]/20 rounded-full py-3 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]"
            />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
          {filteredHeroes.map((hero, i) => (
            <motion.div
              key={hero.id}
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link
                href={`/chat/${hero.slug}`}
                className="group relative rounded-xl overflow-hidden aspect-[3/4] flex flex-col cursor-pointer block transition-all duration-500 bg-[#131313] border border-white/5 hover:-translate-y-2"
                style={{
                  boxShadow: "0 10px 30px -10px rgba(0,0,0,0.8)"
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = hero.primaryColor;
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 20px 40px -10px ${hero.glowColor}`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.05)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 10px 30px -10px rgba(0,0,0,0.8)";
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent z-10" />

                <div className="relative flex-1 w-full bg-[#1A1A1A] flex items-center justify-center">
                  <Image
                    src={`/${hero.slug}.png`}
                    alt={hero.name}
                    fill
                    className="object-cover opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out mix-blend-luminosity group-hover:mix-blend-normal"
                    unoptimized
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>

                <div className="absolute inset-0 z-20 p-6 flex flex-col justify-end">
                  <div className="translate-y-8 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-1.5 w-8 rounded-full transition-all duration-500 group-hover:w-16 shadow-[0_0_10px_currentColor]" style={{ backgroundColor: hero.primaryColor, color: hero.primaryColor }} />
                      <span className="font-[Orbitron] text-[9px] tracking-[3px] uppercase px-2 py-0.5 rounded bg-black/50 border border-white/10 backdrop-blur-md text-white/80 group-hover:border-[currentColor]" style={{ color: hero.primaryColor }}>
                        {hero.role}
                      </span>
                    </div>

                    <h3 className="text-3xl font-black font-[Orbitron] mb-2 text-white group-hover:text-[currentColor] transition-colors duration-300 drop-shadow-md" style={{ color: "white" }} onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = hero.primaryColor; }} onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "white"; }}>
                      {hero.name}
                    </h3>

                    <p className="text-sm font-[Rajdhani] text-white/60 mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 italic">
                      &quot;{hero.description}&quot;
                    </p>

                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200 translate-y-4 group-hover:translate-y-0">
                      <button className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md rounded-md font-[Orbitron] text-[10px] tracking-[3px] uppercase text-white flex items-center justify-center gap-2 transition-colors pointer-events-none">
                        Enter Orbit <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Master Orbit button — redesigned */}
      <motion.div
        initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, duration: 0.6 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
      >
        <Link href="/master-orbit">
          <div className="group flex items-center gap-4 px-8 py-4 rounded-full border border-[#D4AF37]/50 bg-[#0A0A0A]/90 backdrop-blur-xl hover:bg-[#D4AF37] transition-all duration-500 shadow-[0_0_30px_rgba(212,175,55,0.2)] hover:shadow-[0_0_50px_rgba(212,175,55,0.6)] hover:scale-105">
            <div className="relative w-10 h-10 rounded-full border-2 border-[#D4AF37] group-hover:border-black flex items-center justify-center shrink-0">
              <div className="w-3 h-3 rounded-full bg-[#FFD700] group-hover:bg-black animate-pulse" />
              <div className="absolute inset-0 rounded-full border border-[#D4AF37] animate-ping opacity-50 group-hover:hidden" />
            </div>
            <div className="flex flex-col">
              <span className="font-[Orbitron] text-xs tracking-[4px] uppercase text-[#D4AF37] group-hover:text-black font-black leading-tight drop-shadow-[0_0_5px_rgba(212,175,55,0.5)] group-hover:drop-shadow-none">
                MASTER ORBIT
              </span>
              <span className="font-[Rajdhani] text-[11px] uppercase tracking-widest text-white/50 group-hover:text-black/70 leading-tight mt-0.5">
                Command all 85 agents
              </span>
            </div>
          </div>
        </Link>
      </motion.div>
    </div>
  );
}
