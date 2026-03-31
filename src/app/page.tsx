"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Cpu, Users, Zap, Hexagon, TrendingUp, Shield } from "lucide-react";

export default function Home() {
  return (
    <main className="relative flex flex-col items-center justify-start overflow-x-hidden bg-black text-white w-full min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full h-screen flex flex-col items-center justify-center pt-20">
        <div className="absolute inset-0 z-0">
          <Image
            src="/group-banner.png"
            alt="The 7 Heroes of Khemet"
            fill
            className="object-cover object-center"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/30" />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="font-[Orbitron] text-[10px] tracking-[6px] uppercase text-[#D4AF37]/80 mb-4"
          >
            The I-Gamify Grid
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            className="font-[Orbitron] text-5xl md:text-7xl font-black tracking-tighter text-white leading-none mb-6 drop-shadow-[0_0_30px_rgba(212,175,55,0.4)]"
          >
            ORBIT OF KHEMET
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="font-[Rajdhani] text-xl md:text-2xl font-light text-white/70 max-w-2xl mb-12 leading-relaxed"
          >
            7 heroes. 85 agents. One unified AI system built to elevate your potential and gamify your workflows.
          </motion.p>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.4 }}>
            <Link href="/hub">
              <button className="group relative font-[Orbitron] text-sm tracking-[3px] uppercase px-12 py-5 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-bold transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,215,0,0.6)] hover:-translate-y-1 rounded-sm overflow-hidden">
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative z-10">ENTER THE ORBIT</span>
              </button>
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.6 }}>
            <Link href="/pricing" className="font-[Orbitron] text-[9px] tracking-[3px] uppercase text-[#D4AF37]/50 hover:text-[#D4AF37] transition-colors mt-6 block">
              View pricing & energy tiers →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Social Proof / Stats Bar */}
      <section className="relative z-10 w-full border-y border-[#D4AF37]/20 bg-black/80 backdrop-blur-md py-8">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-[#D4AF37]/10 text-center">
          {[
            { label: "Elite Heroes", value: "7" },
            { label: "Named Agents", value: "85" },
            { label: "AI Models", value: "5" },
            { label: "Potential", value: "Infinite" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="flex flex-col items-center justify-center"
            >
              <div className="font-[Orbitron] text-3xl md:text-5xl font-black text-[#FFD700] mb-2 drop-shadow-[0_0_15px_rgba(255,215,0,0.3)]">{stat.value}</div>
              <div className="font-[Orbitron] text-[10px] md:text-xs tracking-[3px] uppercase text-white/50">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 w-full py-24 px-6 bg-[#0A0A0A]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-[Orbitron] text-3xl md:text-4xl font-bold text-white mb-4">THE POWER OF THE ORBIT</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Users, title: "7 Specialized Heroes", desc: "Command elite AI avatars tailored for coding, marketing, logic, and creative dominance." },
              { icon: Hexagon, title: "85 Named Agents", desc: "A sprawling hierarchy of micro-agents designed to execute any micro-task efficiently." },
              { icon: Cpu, title: "Smart AI Routing", desc: "Seamlessly routes tasks through MiMo, Claude 3.5 Sonnet, and OpenAI o3-mini based on complexity." },
            ].map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.2, duration: 0.6 }}
                className="bg-[#131313] border border-[#D4AF37]/20 rounded-xl p-8 hover:border-[#D4AF37]/60 transition-colors group hover:shadow-[0_0_30px_rgba(212,175,55,0.1)] relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-[#D4AF37]/10 transition-colors" />
                <feat.icon className="w-10 h-10 text-[#D4AF37] mb-6 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
                <h3 className="font-[Orbitron] text-xl font-bold text-white mb-3">{feat.title}</h3>
                <p className="text-white/60 font-[Rajdhani] text-lg leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 w-full py-24 px-6 bg-black border-t border-white/5">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="font-[Orbitron] text-3xl md:text-4xl font-bold text-white mb-16">HOW IT WORKS</h2>

          <div className="flex flex-col md:flex-row items-center justify-center gap-12 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent -translate-y-1/2 z-0" />

            {[
              { step: "01", title: "Choose Your Hero", icon: Shield, desc: "Select the specialized avatar that fits your mission parameters." },
              { step: "02", title: "Activate Agents", icon: Zap, desc: "Deploy specific sub-agents to tackle distinct parts of your workload." },
              { step: "03", title: "Dominate the Grid", icon: TrendingUp, desc: "Receive highly optimized, routed AI output to accelerate your progress." },
            ].map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 0.5 }}
                className="relative z-10 flex flex-col items-center max-w-xs"
              >
                <div className="w-20 h-20 rounded-full bg-[#1A1A1A] border-2 border-[#D4AF37] flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                  <span className="font-[Orbitron] font-black text-2xl text-[#FFD700]">{step.step}</span>
                </div>
                <h3 className="font-[Orbitron] text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-white/50 font-[Rajdhani] text-base">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
