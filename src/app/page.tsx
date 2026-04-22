"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { heroMeta } from "@/lib/agents";
import { heroOrder } from "@/lib/heroes";
import { NEW_PLANS } from "@/lib/new-plans";

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
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.replace('/hub')
      }
    }
    checkAuth()
  }, [router])

  const [isHovered, setIsHovered] = useState(false);
  const [pricingView, setPricingView] = useState<"personal" | "business">("personal");
  const containerRef = useRef<HTMLDivElement>(null);

  const displayedPlans = NEW_PLANS.filter(plan => plan.colorScheme === pricingView);

  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  // Simple auto-scroll that pauses on hover
  useEffect(() => {
    if (isHovered || !containerRef.current) return;

    const interval = setInterval(() => {
      if (containerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
        // If we reached the end, snap back to start
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          containerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          containerRef.current.scrollBy({ left: 400, behavior: 'smooth' });
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isHovered]);

  return (
    <div className="bg-[#0A0A0A] min-h-screen text-[#d0c5af] font-[family-name:var(--font-inter)]">

      {/* 2. HERO SECTION */}
      <section className="relative w-full min-h-[calc(100vh-73px)] py-12 flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/group-banner.png"
            alt="Orbit of Khemet Heroes"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent" />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center px-4">
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="font-[family-name:var(--font-roboto)] text-[#FBBF24] tracking-[0.3em] text-sm md:text-base mb-6 font-bold uppercase"
          >
            THE I-GAMIFY GRID
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
            <h1 className="font-[family-name:var(--font-cinzel)] font-black text-white text-4xl sm:text-5xl md:text-[80px] leading-tight drop-shadow-[0_0_20px_rgba(251,191,36,0.3)]">
              ORBIT OF KHEMET
            </h1>
            <h2 className="font-[family-name:var(--font-cinzel)] font-black text-white text-3xl sm:text-4xl md:text-6xl drop-shadow-[0_0_20px_rgba(251,191,36,0.3)] mt-2">
              The Empire Engine
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="font-[family-name:var(--font-roboto)] mt-8 text-lg md:text-xl font-light tracking-wide max-w-3xl"
          >
            7 Elite Heroes  ✦  85 Named Agents
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
            className="font-[family-name:var(--font-roboto)] mt-2 text-sm text-[#D4AF37] opacity-60 tracking-wider"
          >
            English · Arabic (العربية) · French -- All agents. All languages.
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
            <a href="https://khemet.ai/products/orbit_of_khemet" target="_blank" rel="noopener noreferrer">
              <button className="w-full sm:w-auto bg-transparent border-2 border-[#FBBF24] text-[#FBBF24] font-bold text-lg px-8 py-4 rounded-md hover:bg-[#FBBF24]/10 transition-colors">
                Request Full Demo
              </button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* 3. 7 ELITE HEROES SHOWCASE */}
      <section id="heroes" className="py-[120px] px-6 md:px-12 max-w-full mx-auto relative overflow-hidden">
        <FadeInSection className="text-center mb-16 relative">
          <h2 className="font-[family-name:var(--font-cinzel)] text-[#d4af37] text-3xl md:text-5xl font-bold">
            7 Heroes. Every Business Function.
          </h2>
          <div className="flex gap-4 justify-center mt-8">
            <button
              onClick={scrollLeft}
              className="w-12 h-12 flex items-center justify-center rounded-full border border-[#FBBF24]/30 text-[#FBBF24] hover:bg-[#FBBF24]/10 transition-colors"
            >
              ←
            </button>
            <button
              onClick={scrollRight}
              className="w-12 h-12 flex items-center justify-center rounded-full border border-[#FBBF24]/30 text-[#FBBF24] hover:bg-[#FBBF24]/10 transition-colors"
            >
              →
            </button>
          </div>
        </FadeInSection>

        <div
          className="relative -mx-6 md:-mx-12 px-6 md:px-12"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div
            ref={containerRef}
            className="flex gap-4 lg:gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth pb-8"
            style={{
              scrollbarWidth: 'none', /* Firefox */
              msOverflowStyle: 'none'  /* IE and Edge */
            }}
          >
            <style jsx>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>

            {heroes.map((hero, i) => (
              <FadeInSection key={hero.slug} delay={i * 0.1} className="shrink-0 w-[85vw] md:w-[calc(33.333%-16px)] snap-center">
                <div
                  className="bg-[#111111] border border-[rgba(251,191,36,0.1)] rounded-lg p-7 h-full flex flex-col group transition-all duration-300 hover:border-[#FBBF24]"
                  style={{
                    borderLeftColor: hero.color,
                    borderLeftWidth: '3px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 30px ${hero.color}20`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0"
                      style={{ border: `2px solid ${hero.color}40` }}>
                      <Image
                        src={hero.photo}
                        alt={hero.name}
                        fill
                        className="object-cover object-top"
                      />
                    </div>
                    <div>
                      <h4 className="font-[family-name:var(--font-cinzel)] text-[#FBBF24] font-bold text-lg leading-tight">
                        {hero.name}
                      </h4>
                      <p className="font-[family-name:var(--font-roboto)] text-[#06B6D4] text-xs font-medium mt-1 uppercase tracking-wider">{hero.title}</p>
                    </div>
                  </div>

                  <div className="mb-4 flex-grow font-[family-name:var(--font-roboto)]">
                    <p className="font-[family-name:var(--font-roboto)] text-[10px] text-[#FBBF24] font-bold tracking-widest uppercase mb-2">WHEN TO CHOOSE</p>
                    <p className="font-[family-name:var(--font-roboto)] text-sm text-[#d0c5af] opacity-90 leading-relaxed mb-4 line-clamp-3">{hero.choose}</p>

                    <ul className="space-y-2 font-[family-name:var(--font-roboto)]">
                      {hero.powers.slice(0, 3).map(power => (
                        <li key={power} className="font-[family-name:var(--font-roboto)] text-sm flex items-start gap-2">
                          <span style={{ color: hero.color }}>✦</span>
                          <span className="font-[family-name:var(--font-roboto)] text-[#d0c5af] opacity-80 line-clamp-1">{power}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-auto pt-6">
                    <Link href="/pricing">
                      <button
                        className="w-full py-3 rounded-md text-sm font-semibold transition-colors duration-300 border"
                        style={{
                          borderColor: hero.color,
                          color: hero.color,
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
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section id="how-it-works" className="pt-[120px] pb-[60px] px-6 md:px-12 bg-[#111111]/50">
        <div className="max-w-7xl mx-auto">
          <FadeInSection className="text-center mb-16">
            <h2 className="font-[family-name:var(--font-cinzel)] text-[#d4af37] text-3xl md:text-5xl font-bold">
              Command the Empire in 3 Steps
            </h2>
          </FadeInSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                num: "1",
                title: "CHOOSE YOUR HERO",
                desc: "Select the specialist that matches your mission: content, code, or sales."
              },
              {
                num: "2",
                title: "BRIEF YOUR MISSION",
                desc: "Type your goal in plain language. No prompting skills needed. The agents know what to do."
              },
              {
                num: "3",
                title: "RECEIVE YOUR DELIVERABLE",
                desc: "Get a complete, actionable output: copy, strategy, code, or analysis. Ready to deploy."
              }
            ].map((step, i) => (
              <FadeInSection key={step.num} delay={i * 0.2}>
                <div className="bg-[#111111] rounded-lg p-8 relative overflow-hidden group hover:shadow-[0_0_30px_rgba(251,191,36,0.15)] transition-all duration-300 h-full border border-[rgba(251,191,36,0.05)] hover:border-[rgba(251,191,36,0.2)]">
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#FBBF24] to-[#F59E0B]" />
                  <div className="flex items-center gap-4 mb-4">
                    <div className="font-[family-name:var(--font-cinzel)] text-[48px] text-[#FBBF24]/50 font-bold leading-none group-hover:text-[#FBBF24]/70 transition-colors">
                      {step.num}
                    </div>
                    <h3 className="font-[family-name:var(--font-cinzel)] text-white text-xl font-bold">{step.title}</h3>
                  </div>
                  <p className="font-[family-name:var(--font-roboto)] text-[#d0c5af] opacity-80 leading-relaxed">{step.desc}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* 4.5 BUILT FOR THE MENA REGION (Arabic Capability) */}
      <section className="w-full bg-[#1A1814] border-y border-[rgba(212,175,55,0.2)] py-16 px-6 md:px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/5 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
          <FadeInSection className="lg:w-1/2">
            <h3 className="font-[family-name:var(--font-cinzel)] text-[#D4AF37] font-bold tracking-widest text-sm mb-3">
              BUILT FOR THE MENA REGION
            </h3>
            <h2 className="font-[family-name:var(--font-cinzel)] text-white text-3xl md:text-4xl font-black mb-6">
              Arabic Output. Native. One Click.
            </h2>
            <p className="font-[family-name:var(--font-roboto)] text-[#d0c5af] text-lg leading-relaxed opacity-90">
              Every agent responds in Arabic on demand -- strategy documents, marketing copy, sales scripts, and analysis. Full RTL formatting. No extra cost. Built into every plan including Free.
            </p>
          </FadeInSection>

          <FadeInSection delay={0.2} className="lg:w-1/2 flex flex-col gap-4 w-full sm:w-auto">
            {[
              "Arabic Input support",
              "In-chat Translate button",
              "Native RTL formatting"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-4 bg-[#0A0A0A] border border-[rgba(212,175,55,0.3)] rounded-lg p-5 hover:border-[#D4AF37] transition-colors">
                <div className="text-[#D4AF37] font-[family-name:var(--font-orbitron)]">✦</div>
                <div className="font-[family-name:var(--font-orbitron)] text-[#d0c5af] tracking-wide text-sm font-medium">{feature}</div>
              </div>
            ))}
          </FadeInSection>
        </div>
      </section>

      {/* 5. PRICING TEASER */}
      <section id="pricing" className="pt-[60px] pb-[120px] px-6 md:px-12 max-w-5xl mx-auto">
        <FadeInSection className="text-center mb-10">
          <h2 className="font-[family-name:var(--font-cinzel)] text-[#d4af37] text-3xl md:text-5xl font-bold mb-4">
            Choose Your Tier
          </h2>
          <p className="text-xl text-[#d0c5af] opacity-90">Start free. Scale as you grow.</p>
        </FadeInSection>

        <FadeInSection className="flex justify-center mb-12">
          <div className="bg-[#111111] border border-[rgba(251,191,36,0.2)] rounded-full p-1 inline-flex">
            <button
              onClick={() => setPricingView("personal")}
              className={`px-8 py-3 rounded-full text-sm font-bold font-[family-name:var(--font-cinzel)] transition-all ${
                pricingView === "personal"
                  ? "bg-[#D4AF37] text-black"
                  : "text-[#d0c5af] hover:text-white"
              }`}
            >
              Personal
            </button>
            <button
              onClick={() => setPricingView("business")}
              className={`px-8 py-3 rounded-full text-sm font-bold font-[family-name:var(--font-cinzel)] transition-all ${
                pricingView === "business"
                  ? "bg-[#D4AF37] text-black"
                  : "text-[#d0c5af] hover:text-white"
              }`}
            >
              Business
            </button>
          </div>
        </FadeInSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayedPlans.map((plan, i) => (
            <FadeInSection key={plan.id} delay={i * 0.1}>
              <div className={`bg-[#111111] rounded-lg p-8 text-center flex flex-col items-center justify-between h-full border ${plan.popular ? 'border-[#FBBF24] shadow-[0_0_20px_rgba(251,191,36,0.2)]' : 'border-[rgba(251,191,36,0.1)]'}`}>
                <div>
                  <h3 className="font-[family-name:var(--font-cinzel)] text-[#FBBF24] text-xl font-bold mb-2">{plan.name}</h3>
                  <p className="font-[family-name:var(--font-roboto)] text-sm text-[#d0c5af] h-10 mb-6">{plan.description}</p>
                  <div className="text-white text-4xl font-bold mb-2">${plan.monthlyPrice} <span className="text-sm font-normal text-[#d0c5af]">/mo</span></div>
                  <div className="text-[#D4AF37] font-[family-name:var(--font-roboto)] text-sm mb-8">{plan.credits.toLocaleString()} Credits</div>
                </div>
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

    </div>
  );
}
