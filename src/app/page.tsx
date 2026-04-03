"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { heroMeta } from "@/lib/agents";
import { heroOrder } from "@/lib/heroes";

const heroes = heroOrder.map(slug => {
  const meta = heroMeta[slug as keyof typeof heroMeta];
  return {
    slug,
    name: meta?.name || slug.toUpperCase(),
    title: meta?.archetype || '',
    color: meta?.color_signature || '#D4AF37',
    choose: meta?.best_for || '',
    powers: meta?.specialties || [],
    photo: `/${slug}.png`,
  };
});

const tiers = [
  { name: "Scout", price: "Free" },
  { name: "Explorer", price: "$19 / month", highlight: true },
  { name: "Commander", price: "$49 / month" },
];

const FadeInSection = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default function LandingPage() {
  return (
    <div className="bg-[#0A0A0A] min-h-screen text-[#d0c5af] font-[family-name:var(--font-inter)]">

      {/* 1. STICKY NAV */}
      <nav className="sticky top-0 z-50 bg-[#0A0A0A] border-b border-[rgba(251,191,36,0.1)] py-4 px-6 md:px-12 flex justify-between items-center backdrop-blur-sm bg-opacity-90">
        <div className="font-[family-name:var(--font-cinzel)] font-bold text-[#FBBF24] text-xl tracking-wider">
          KHEMET
        </div>
        <div className="hidden md:flex gap-8 items-center text-sm tracking-wide">
          <Link href="#heroes" className="hover:text-[#FBBF24] transition-colors">HEROES</Link>
          <Link href="#agents" className="hover:text-[#FBBF24] transition-colors">AGENTS</Link>
          <Link href="#how-it-works" className="hover:text-[#FBBF24] transition-colors">HOW IT WORKS</Link>
          <Link href="/pricing" className="hover:text-[#FBBF24] transition-colors">PRICING</Link>
          <Link href="/hub">
            <button className="bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] text-black font-semibold py-2 px-6 rounded-md hover:scale-105 transition-transform duration-300">
              ENTER THE ORBIT
            </button>
          </Link>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative w-full h-[calc(100vh-73px)] flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/group-banner.png"
            alt="Orbit of Khemet Heroes"
            fill
            className="object-cover object-center"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent" />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center px-4">
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="font-[family-name:var(--font-cinzel)] text-[#FBBF24] tracking-[0.3em] text-sm md:text-base mb-6 font-bold uppercase"
          >
            THE I-GAMIFY GRID
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
            <h1 className="font-[family-name:var(--font-cinzel)] font-black text-white text-5xl md:text-[80px] leading-tight drop-shadow-[0_0_20px_rgba(251,191,36,0.3)]">
              ORBIT OF KHEMET
            </h1>
            <h2 className="font-[family-name:var(--font-cinzel)] font-black text-white text-4xl md:text-6xl drop-shadow-[0_0_20px_rgba(251,191,36,0.3)] mt-2">
              The Empire Engine
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 text-lg md:text-xl font-light tracking-wide max-w-3xl"
          >
            7 Elite Heroes  ✦  85 Named Agents
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12 flex flex-col sm:flex-row gap-6"
          >
            <Link href="/hub">
              <button className="w-full sm:w-auto font-[family-name:var(--font-cinzel)] bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] text-black font-bold text-lg px-8 py-4 rounded-md shadow-[0_0_15px_rgba(251,191,36,0.4)] animate-[pulse_2s_infinite]">
                ENTER THE ORBIT
              </button>
            </Link>
            <a href="https://wa.me/+201553545453" target="_blank" rel="noopener noreferrer">
              <button className="w-full sm:w-auto bg-transparent border-2 border-[#FBBF24] text-[#FBBF24] font-bold text-lg px-8 py-4 rounded-md hover:bg-[#FBBF24]/10 transition-colors">
                Request Full Demo
              </button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* 3. 7 ELITE HEROES SHOWCASE */}
      <section id="heroes" className="py-[120px] px-6 md:px-12 max-w-7xl mx-auto">
        <FadeInSection className="text-center mb-16">
          <h3 className="font-[family-name:var(--font-cinzel)] text-[#FBBF24] text-sm tracking-widest uppercase mb-4 font-bold">
            ELITE COUNCIL
          </h3>
          <h2 className="font-[family-name:var(--font-cinzel)] text-white text-3xl md:text-5xl font-bold">
            7 Heroes. Every Business Function.
          </h2>
        </FadeInSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {heroes.map((hero, i) => (
            <FadeInSection key={hero.slug} delay={i * 0.1}>
              <div
                className="bg-[#111111] border border-[rgba(251,191,36,0.1)] rounded-lg p-7 h-full flex flex-col group transition-all duration-300 hover:border-[#FBBF24]"
                style={{ borderLeftColor: hero.color, borderLeftWidth: '3px' }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = `0 0 30px ${hero.color}20`}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0"
                    style={{ border: `2px solid ${hero.color}40` }}>
                    <Image
                      src={hero.photo}
                      alt={hero.name}
                      fill
                      className="object-cover object-top"
                      unoptimized
                    />
                  </div>
                  <div>
                    <h4 className="font-[family-name:var(--font-cinzel)] text-[#FBBF24] font-bold text-lg leading-tight">
                      {hero.name}
                    </h4>
                    <p className="text-[#06B6D4] text-xs font-medium mt-1 uppercase tracking-wider">{hero.title}</p>
                  </div>
                </div>

                <div className="mb-4 flex-grow">
                  <p className="text-[10px] text-[#FBBF24] font-bold tracking-widest uppercase mb-2">WHEN TO CHOOSE</p>
                  <p className="text-sm text-[#d0c5af] opacity-90 leading-relaxed mb-4">{hero.choose}</p>

                  <ul className="space-y-2">
                    {hero.powers.map(power => (
                      <li key={power} className="text-sm flex items-start gap-2">
                        <span style={{ color: hero.color }}>✦</span>
                        <span className="text-[#d0c5af] opacity-80">{power}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto pt-6">
                  <Link href={`/heroes/${hero.slug}`}>
                    <button
                      className="w-full py-3 rounded-md text-sm font-semibold transition-colors duration-300 border"
                      style={{
                        borderColor: hero.color,
                        color: hero.color,
                        // CSS hover effect handled with a styled approach using global classes or inline styles would be tricky, using tailwind trick:
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = `${hero.color}20`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      ACTIVATE HERO →
                    </button>
                  </Link>
                </div>
              </div>
            </FadeInSection>
          ))}
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section id="how-it-works" className="py-[120px] px-6 md:px-12 bg-[#111111]/50">
        <div className="max-w-7xl mx-auto">
          <FadeInSection className="text-center mb-16">
            <h2 className="font-[family-name:var(--font-cinzel)] text-white text-3xl md:text-5xl font-bold">
              Command the Empire in 3 Steps
            </h2>
          </FadeInSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                num: "01",
                title: "CHOOSE YOUR HERO",
                desc: "Select the specialist that matches your mission: content, code, or sales."
              },
              {
                num: "02",
                title: "BRIEF YOUR MISSION",
                desc: "Type your goal in plain language. No prompting skills needed. The agents know what to do."
              },
              {
                num: "03",
                title: "RECEIVE YOUR DELIVERABLE",
                desc: "Get a complete, actionable output: copy, strategy, code, or analysis. Ready to deploy."
              }
            ].map((step, i) => (
              <FadeInSection key={step.num} delay={i * 0.2}>
                <div className="bg-[#111111] rounded-lg p-8 relative overflow-hidden group hover:shadow-[0_0_30px_rgba(251,191,36,0.15)] transition-all duration-300 h-full border border-[rgba(251,191,36,0.05)] hover:border-[rgba(251,191,36,0.2)]">
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#FBBF24] to-[#F59E0B]" />
                  <div className="font-[family-name:var(--font-cinzel)] text-[72px] text-[#FBBF24]/20 font-bold leading-none mb-4 group-hover:text-[#FBBF24]/30 transition-colors">
                    {step.num}
                  </div>
                  <h3 className="font-[family-name:var(--font-cinzel)] text-white text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-[#d0c5af] opacity-80 leading-relaxed">{step.desc}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* 5. PRICING TEASER */}
      <section id="pricing" className="py-[120px] px-6 md:px-12 max-w-5xl mx-auto">
        <FadeInSection className="text-center mb-16">
          <h2 className="font-[family-name:var(--font-cinzel)] text-white text-3xl md:text-5xl font-bold mb-4">
            Choose Your Tier
          </h2>
          <p className="text-xl text-[#d0c5af] opacity-90">Start free. Scale as you grow.</p>
        </FadeInSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier, i) => (
            <FadeInSection key={tier.name} delay={i * 0.1}>
              <div className={`bg-[#111111] rounded-lg p-8 text-center flex flex-col items-center justify-center h-full border ${tier.highlight ? 'border-[#FBBF24] shadow-[0_0_20px_rgba(251,191,36,0.2)]' : 'border-[rgba(251,191,36,0.1)]'}`}>
                <h3 className="font-[family-name:var(--font-cinzel)] text-[#FBBF24] text-2xl font-bold mb-6">{tier.name}</h3>
                <div className="text-white text-3xl font-bold mb-8">{tier.price}</div>
                <Link href="/pricing" className="w-full">
                  <button className="w-full border border-[#FBBF24] text-[#FBBF24] py-3 rounded-md hover:bg-[#FBBF24] hover:text-black transition-colors duration-300 font-semibold text-sm">
                    VIEW FULL PRICING →
                  </button>
                </Link>
              </div>
            </FadeInSection>
          ))}
        </div>
      </section>

      {/* 6. FLOATING WHATSAPP BUTTON */}
      <a
        href="https://wa.me/+201553545453"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-[60px] h-[60px] bg-[#25D366] rounded-full flex items-center justify-center z-[9999] hover:scale-110 transition-transform shadow-lg cursor-pointer"
        aria-label="Contact us on WhatsApp"
      >
        <svg viewBox="0 0 24 24" width="32" height="32" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
        </svg>
      </a>

    </div>
  );
}
