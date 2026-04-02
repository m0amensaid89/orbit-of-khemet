"use client";

import Link from "next/link";
import { useState } from "react";
import { PLANS } from "@/lib/plans";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, ChevronDown } from "lucide-react";

const FAQ_ITEMS = [
  { question: "How does Grid Energy work?", answer: "Grid Energy is our universal credit system. Different AI models cost varying amounts of energy per message. For example, a fast model like Gemini Flash uses very little energy, while a complex reasoning model like OpenAI o3-mini uses more. Your energy pool refills monthly." },
  { question: "Can I switch plans later?", answer: "Absolutely. You can upgrade or downgrade your Orbit tier at any time. Changes take effect at the start of your next billing cycle." },
  { question: "Do I get access to all 85 agents on the Free plan?", answer: "The Free (Scout) plan gives you access to 1 Hero Orbit and its specific subset of agents. To command all 7 Heroes and all 85 Agents, you need the Explorer or Commander tier." },
  { question: "What is the Auto-Router?", answer: "The Auto-Router is an intelligent system that analyzes your prompt's complexity and automatically routes it to the most efficient AI model (e.g., GPT-4o, Claude 3.5 Sonnet, or MiMo) to save you energy while guaranteeing the best result." }
];

const FEATURES_TABLE = [
  { feature: "Access to 7 Heroes", free: false, explorer: true, commander: true },
  { feature: "Access to 85 Agents", free: false, explorer: true, commander: true },
  { feature: "Grid Energy per month", free: "10,000", explorer: "100,000", commander: "500,000" },
  { feature: "Auto-Router enabled", free: false, explorer: true, commander: true },
  { feature: "Claude 3.5 Sonnet Access", free: false, explorer: false, commander: true },
  { feature: "OpenAI o3-mini Access", free: false, explorer: false, commander: true },
  { feature: "Image Generation", free: false, explorer: true, commander: true },
  { feature: "Custom Agent Forge", free: false, explorer: false, commander: true },
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <main className="flex flex-col min-h-screen pt-24 pb-12 items-center bg-[#0A0A0A] text-white overflow-x-hidden">
      <div className="text-center mb-12 px-4">
        <p className="font-[Orbitron] text-[10px] tracking-[6px] uppercase text-[#D4AF37]/70 mb-4">
          The I-Gamify Grid
        </p>
        <h1 className="font-[Orbitron] text-4xl md:text-5xl font-black tracking-tighter mb-4"
          style={{ color: "#D4AF37", textShadow: "0 0 30px rgba(212,175,55,0.25)" }}>
          CHOOSE YOUR ORBIT
        </h1>
        <p className="font-[Rajdhani] text-lg text-white/60 max-w-xl mx-auto mb-10">
          7 heroes. 85 agents. Claude, Gemini, GPT, DeepSeek: all in one universe.
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-16">
          <span className={`font-[Orbitron] text-xs tracking-widest uppercase transition-colors ${billingCycle === "monthly" ? "text-white" : "text-white/40"}`}>Monthly</span>
          <button
            onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
            className="w-14 h-7 rounded-full bg-[#1A1A1A] border border-[#D4AF37]/30 relative flex items-center px-1 transition-colors hover:border-[#D4AF37]/60"
          >
            <motion.div
              className="w-5 h-5 rounded-full bg-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.5)]"
              layout
              animate={{ x: billingCycle === "monthly" ? 0 : 26 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
          <div className="flex items-center gap-2">
            <span className={`font-[Orbitron] text-xs tracking-widest uppercase transition-colors ${billingCycle === "yearly" ? "text-white" : "text-white/40"}`}>Yearly</span>
            <span className="font-[Rajdhani] text-[10px] font-bold uppercase tracking-widest bg-[#D4AF37]/10 text-[#D4AF37] px-2 py-0.5 rounded-sm border border-[#D4AF37]/20">Save 20%</span>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-6xl w-full mx-auto px-6 pb-24 grid grid-cols-1 md:grid-cols-3 gap-8">
        {PLANS.map((plan, i) => {
          const isPopular = plan.popular;
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative rounded-xl p-8 flex flex-col gap-8 transition-all duration-300 bg-[#131313] ${isPopular ? "border-2 border-[#D4AF37] shadow-[0_0_40px_rgba(212,175,55,0.15)] scale-105 z-10" : "border border-white/10 hover:border-[#D4AF37]/30 mt-4 mb-4"}`}
            >
              {isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 overflow-hidden rounded-sm">
                  <div className="relative font-[Orbitron] text-[10px] tracking-[4px] uppercase bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black px-6 py-2 font-black shadow-[0_0_20px_rgba(255,215,0,0.4)]">
                    MOST POPULAR
                    <motion.div
                      className="absolute top-0 left-[-100%] w-[50%] h-full bg-white/40 skew-x-[-20deg]"
                      animate={{ left: ["-100%", "200%"] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 3 }}
                    />
                  </div>
                </div>
              )}

              <div>
                <p className="font-[Orbitron] text-[11px] tracking-[5px] uppercase mb-4 text-[#D4AF37]">{plan.name}</p>
                <div className="flex items-baseline gap-2">
                  <span className="font-[Orbitron] text-5xl font-black text-white leading-none">
                    {billingCycle === "yearly" && plan.price > 0 ? `$${Math.round(plan.price * 0.8)}` : plan.priceLabel}
                  </span>
                  {plan.price > 0 && <span className="font-[Rajdhani] text-white/40 text-base">/ month</span>}
                </div>
                {plan.price === 0 && <p className="font-[Rajdhani] text-white/50 text-sm mt-2">Free forever</p>}
                {billingCycle === "yearly" && plan.price > 0 && <p className="font-[Rajdhani] text-[#D4AF37] text-sm mt-2">Billed annually at ${Math.round(plan.price * 0.8 * 12)}</p>}
              </div>

              <ul className="flex flex-col gap-4 flex-1 mt-4">
                {[
                  { text: plan.monthlyMessages === "unlimited" ? "Unlimited messages" : `${plan.monthlyMessages} messages / month`, active: true },
                  { text: plan.heroOrbits === "all" ? "All 7 hero orbits" : "1 hero orbit", active: true },
                  { text: "All 85 named agents", active: plan.heroOrbits === "all" },
                  { text: plan.models, active: true },
                  { text: "Image generation in chat", active: plan.imageGeneration },
                  { text: "Claude (Thoren orbit)", active: plan.claudeAccess },
                  { text: "Auto-Router: AI picks best model", active: plan.autoRouter },
                  { text: plan.support, active: true },
                ].map((f, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="mt-0.5 shrink-0" style={{ color: f.active ? "#D4AF37" : "rgba(255,255,255,0.2)" }}>
                      {f.active ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </span>
                    <span className="font-[Rajdhani] text-base leading-tight"
                      style={{ color: f.active ? "white" : "rgba(255,255,255,0.4)" }}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Link href={plan.id === "free" ? "/hub" : "#"} className="block mt-6">
                <button
                  className="w-full font-[Orbitron] text-[11px] tracking-[4px] font-bold uppercase py-4 transition-all duration-300 hover:scale-[1.02] rounded-md relative overflow-hidden group"
                  style={isPopular
                    ? { background: "linear-gradient(135deg, #D4AF37, #FFD700)", color: "#000" }
                    : { background: "rgba(212,175,55,0.1)", color: "#D4AF37", border: "1px solid rgba(212,175,55,0.3)" }}
                >
                  {isPopular && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />}
                  <span className="relative z-10">{plan.id === "free" ? "DEPLOY AS SCOUT" : plan.id === "explorer" ? "CHOOSE EXPLORER" : "ASCEND TO COMMANDER"}</span>
                </button>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Feature Comparison Table */}
      <div className="w-full max-w-5xl mx-auto px-6 mb-32">
        <h2 className="font-[Orbitron] text-2xl md:text-3xl font-bold text-center mb-12 text-white">COMPARE TIERS</h2>
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#131313]">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="p-6 font-[Orbitron] text-xs tracking-widest uppercase text-white/50 w-2/5">Feature</th>
                <th className="p-6 font-[Orbitron] text-xs tracking-widest uppercase text-white/80 text-center">Scout</th>
                <th className="p-6 font-[Orbitron] text-xs tracking-widest uppercase text-[#D4AF37] text-center bg-[#D4AF37]/5">Explorer</th>
                <th className="p-6 font-[Orbitron] text-xs tracking-widest uppercase text-white/80 text-center">Commander</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-[Rajdhani] text-lg">
              {FEATURES_TABLE.map((row, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-6 text-white/80">{row.feature}</td>
                  <td className="p-6 text-center text-white/60">
                    {typeof row.free === "boolean" ? (row.free ? <Check className="w-5 h-5 mx-auto text-white/40" /> : <X className="w-5 h-5 mx-auto text-white/20" />) : row.free}
                  </td>
                  <td className="p-6 text-center text-[#D4AF37] bg-[#D4AF37]/5">
                    {typeof row.explorer === "boolean" ? (row.explorer ? <Check className="w-5 h-5 mx-auto text-[#D4AF37]" /> : <X className="w-5 h-5 mx-auto text-[#D4AF37]/40" />) : row.explorer}
                  </td>
                  <td className="p-6 text-center text-white/80">
                    {typeof row.commander === "boolean" ? (row.commander ? <Check className="w-5 h-5 mx-auto text-white" /> : <X className="w-5 h-5 mx-auto text-white/20" />) : row.commander}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="w-full max-w-3xl mx-auto px-6 mb-24">
        <h2 className="font-[Orbitron] text-2xl md:text-3xl font-bold text-center mb-10 text-white">FREQUENTLY ASKED QUESTIONS</h2>
        <div className="flex flex-col gap-4">
          {FAQ_ITEMS.map((faq, i) => (
            <div key={i} className="border border-white/10 rounded-xl bg-[#131313] overflow-hidden transition-colors hover:border-white/20">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
              >
                <span className="font-[Rajdhani] font-bold text-xl text-white pr-4">{faq.question}</span>
                <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className={`w-5 h-5 ${openFaq === i ? "text-[#D4AF37]" : "text-white/40"}`} />
                </motion.div>
              </button>
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="p-6 pt-0 font-[Rajdhani] text-lg text-white/60 leading-relaxed border-t border-white/5 mt-2">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full max-w-5xl mx-auto mt-12 px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0"
          style={{ borderTop: "1px solid rgba(212,175,55,0.08)" }}>
          {[
            { label: "ACTIVE NODES", value: "4,291" },
            { label: "UPTIME",       value: "99.9%" },
            { label: "LATENCY",      value: "12MS"  },
            { label: "SECURITY",     value: "AES-G" },
          ].map((stat, i) => (
            <div key={stat.label} className="flex flex-col items-center py-8 gap-2"
              style={{ borderRight: i < 3 ? "1px solid rgba(212,175,55,0.06)" : "none" }}>
              <span className="font-[Orbitron] text-[8px] tracking-[4px] uppercase"
                style={{ color: "rgba(212,175,55,0.4)" }}>{stat.label}</span>
              <span className="font-[Orbitron] text-2xl md:text-3xl font-black"
                style={{ color: "#D4AF37" }}>{stat.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center pb-20 px-6 space-y-3">
        <p className="font-[Rajdhani] text-muted-foreground text-sm">
          Payments coming soon. Start free today: no credit card required.
        </p>
        <p className="font-[Orbitron] text-[9px] tracking-widest uppercase text-primary/20">
          The Rise of the Grid · Leverage is the new gravity.
        </p>
      </div>
    </main>
  );
}
