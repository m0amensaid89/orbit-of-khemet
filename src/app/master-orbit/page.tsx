"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, MessageSquare, Activity, Database, Users } from "lucide-react";
import { heroData, heroOrder } from "@/lib/heroes";
import { heroAgents } from "@/lib/agents";

// Calculate stats based on real data
const TOTAL_AGENTS = Object.values(heroAgents).reduce((sum, squad) => sum + squad.length, 0);

export default function MasterOrbitPage() {
  const [stats, setStats] = useState({
    energyUsed: 0,
    messagesSent: 0,
  });

  useEffect(() => {
    // In a real app, these would come from the backend/database.
    // We'll mock some numbers for the platform stats or load from localStorage if available.
    try {
      const storedStats = localStorage.getItem("orbit_stats");
      if (storedStats) {
        const parsed = JSON.parse(storedStats);
        setStats({
          energyUsed: parsed.energy_used || 12450,
          messagesSent: parsed.messages_sent || 842,
        });
      } else {
        setStats({
          energyUsed: 12450,
          messagesSent: 842,
        });
      }
        } catch {
      setStats({ energyUsed: 12450, messagesSent: 842 });
    }
  }, []);

  const featuredHero = heroData["nexar"]; // Rotating weekly, mocked as Nexar for now

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A] relative pb-32">
      <main className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="text-center mb-12 max-w-3xl"
        >
          <div className="inline-flex items-center justify-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30">
            <Activity className="w-4 h-4 text-[#D4AF37]" />
            <span className="font-[Orbitron] text-[10px] tracking-[4px] uppercase text-[#D4AF37]">
              Command Center Active
            </span>
          </div>
          <h1 className="font-[Orbitron] text-4xl md:text-5xl font-black tracking-tighter leading-none mb-6 text-white drop-shadow-[0_0_30px_rgba(212,175,55,0.3)]">
            MASTER ORBIT
          </h1>
          <p className="font-[Rajdhani] text-lg text-white/60">
            Oversee all 7 heroes and their specialized agents from a single unified control matrix.
          </p>
        </motion.div>

        {/* Global Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mb-16">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1, duration: 0.5 }} className="bg-[#131313] border border-white/10 rounded-xl p-6 relative overflow-hidden group hover:border-white/30 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Users className="w-16 h-16 text-white" />
            </div>
            <div className="relative z-10">
              <div className="text-white/50 font-[Orbitron] text-[10px] tracking-widest uppercase mb-2">Total Agents</div>
              <div className="text-4xl font-[Orbitron] font-black text-white">{TOTAL_AGENTS}</div>
              <div className="text-[#D4AF37] font-[Rajdhani] text-sm mt-2">Deployed & Ready</div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.5 }} className="bg-[#131313] border border-white/10 rounded-xl p-6 relative overflow-hidden group hover:border-[#FFD700]/50 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Zap className="w-16 h-16 text-[#FFD700]" />
            </div>
            <div className="relative z-10">
              <div className="text-white/50 font-[Orbitron] text-[10px] tracking-widest uppercase mb-2">Energy Used (Today)</div>
              <div className="text-4xl font-[Orbitron] font-black text-[#FFD700]">{stats.energyUsed.toLocaleString()}</div>
              <div className="text-[#D4AF37] font-[Rajdhani] text-sm mt-2">Grid Operations</div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.5 }} className="bg-[#131313] border border-white/10 rounded-xl p-6 relative overflow-hidden group hover:border-[#00E5FF]/50 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <MessageSquare className="w-16 h-16 text-[#00E5FF]" />
            </div>
            <div className="relative z-10">
              <div className="text-white/50 font-[Orbitron] text-[10px] tracking-widest uppercase mb-2">Total Communications</div>
              <div className="text-4xl font-[Orbitron] font-black text-[#00E5FF]">{stats.messagesSent.toLocaleString()}</div>
              <div className="text-[#00E5FF]/80 font-[Rajdhani] text-sm mt-2">Messages Sent</div>
            </div>
          </motion.div>
        </div>

        {/* Featured Hero Banner */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }} className="w-full max-w-5xl mb-16">
          <div className="bg-gradient-to-r from-[#1A1A1A] to-[#0A0A0A] border border-[#D4AF37]/30 rounded-2xl overflow-hidden flex flex-col md:flex-row relative">
            <div className="absolute top-4 left-4 z-20">
              <span className="font-[Orbitron] text-[9px] tracking-[3px] uppercase px-3 py-1 rounded bg-black/80 border border-[#D4AF37]/50 text-[#D4AF37]">
                COMMAND SUPER HEROES
              </span>
            </div>

            <div className="w-full md:w-1/3 aspect-square md:aspect-auto relative bg-[#131313] flex items-center justify-center overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-tr from-[#FF4444]/20 to-transparent z-10 mix-blend-overlay" />
               <Image
                 src={`/${featuredHero.slug}-suit.png`}
                 alt={featuredHero.name}
                 fill
                 className="object-cover object-top opacity-80"
                 unoptimized
                 onError={(e) => {
                   (e.target as HTMLImageElement).src = `/${featuredHero.slug}.png`;
                 }}
               />
            </div>

            <div className="w-full md:w-2/3 p-8 md:p-12 flex flex-col justify-center relative z-20">
              <h2 className="font-[Orbitron] text-3xl font-black text-white mb-2" style={{ color: featuredHero.palette.primary }}>{featuredHero.name}</h2>
              <h3 className="font-[Orbitron] text-sm tracking-widest text-white/50 uppercase mb-4">{featuredHero.role}</h3>
              <p className="font-[Rajdhani] text-lg text-white/80 mb-6 italic border-l-2 border-[#D4AF37]/50 pl-4">
                &quot;{featuredHero.quote}&quot;
              </p>

              <div className="flex items-center gap-4 mt-auto">
                <Link href={`/heroes/${featuredHero.slug}`}>
                  <button className="font-[Orbitron] text-[9px] tracking-[3px] uppercase px-6 py-3 transition-all"
                    style={{
                      background: 'linear-gradient(135deg, #D4AF37, #FBBF24)',
                      color: '#0A0A0A',
                      fontWeight: 700,
                    }}>
                    ENTER {featuredHero.name.toUpperCase()} ORBIT
                  </button>
                </Link>
                <Link href={`/heroes/${featuredHero.slug}`}>
                   <button className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 font-[Orbitron] text-xs tracking-widest uppercase rounded transition-colors">
                     View Details
                   </button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* The 7 Heroes Grid */}
        <div className="w-full max-w-5xl">
          <div className="flex items-center gap-4 mb-8">
            <Database className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="font-[Orbitron] text-2xl font-bold text-white tracking-widest uppercase">Grid Nodes</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-[#D4AF37]/20 to-transparent ml-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {heroOrder.map((slug, i) => {
              const hero = heroData[slug];
              const squadCount = heroAgents[slug]?.length || 0;

              return (
                <motion.div
                  key={slug}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + (i * 0.05), duration: 0.5 }}
                >
                  <div className="bg-[#131313] border border-white/5 hover:border-white/20 rounded-lg p-5 flex flex-col transition-all group hover:shadow-[0_0_20px_rgba(0,0,0,0.5)] h-full relative overflow-hidden"
                       style={{ borderLeftColor: hero.palette.primary, borderLeftWidth: '3px' }}>

                    <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" style={{ backgroundColor: hero.palette.primary }} />

                    <div className="flex items-center gap-4 mb-4 relative z-10">
                      <div className="w-12 h-12 rounded-md bg-[#1A1A1A] border border-white/10 overflow-hidden relative shrink-0">
                        <Image
                          src={`/${hero.slug}.png`}
                          alt={hero.name}
                          fill
                          className="object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                          unoptimized
                        />
                      </div>
                      <div>
                        <h3 className="font-[Orbitron] font-bold text-lg text-white group-hover:text-[#D4AF37] transition-colors">{hero.name}</h3>
                        <div className="font-[Rajdhani] text-xs text-white/40 uppercase tracking-wider">{hero.class_title}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5 relative z-10">
                       <div className="flex flex-col">
                         <span className="font-[Orbitron] text-[9px] text-white/30 uppercase tracking-widest">Agents</span>
                         <span className="font-[Rajdhani] font-bold text-[#D4AF37]">{squadCount} Active</span>
                       </div>

                       <Link href={`/heroes/${hero.slug}`}>
                         <button className="font-[Orbitron] text-[8px] tracking-[2px] uppercase px-3 py-1.5 w-full transition-all mt-2"
                           style={{
                             background: 'transparent',
                             border: `1px solid ${heroData[hero.slug]?.palette?.primary || '#D4AF37'}40`,
                             color: heroData[hero.slug]?.palette?.primary || '#D4AF37',
                           }}>
                           ENTER ORBIT
                         </button>
                       </Link>
                    </div>

                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

      </main>
    </div>
  );
}
