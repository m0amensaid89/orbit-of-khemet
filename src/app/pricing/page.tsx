import Link from "next/link";
import { PLANS } from "@/lib/plans";

export const metadata = {
  title: "Pricing — Orbit of Khemet",
  description: "Choose your plan. 7 heroes. 85 agents. Every AI model.",
};

export default function PricingPage() {
  return (
    <main className="flex flex-col min-h-screen pt-24 pb-12 items-center">
      <div className="text-center mb-16 px-4">
        <p className="font-[Orbitron] text-[10px] tracking-[6px] uppercase text-[#D4AF37]/70 mb-4">
          The I-Gamify Grid
        </p>
        <h1 className="font-[Orbitron] text-4xl md:text-5xl font-black tracking-tighter mb-4"
          style={{ color: "#D4AF37", textShadow: "0 0 30px rgba(212,175,55,0.25)" }}>
          CHOOSE YOUR ORBIT
        </h1>
        <p className="font-[Rajdhani] text-lg text-muted-foreground max-w-xl mx-auto">
          7 heroes. 85 agents. Claude, Gemini, GPT, DeepSeek — all in one universe.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-24 grid grid-cols-1 md:grid-cols-3 gap-5">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className="relative rounded-sm p-8 flex flex-col gap-8 transition-all duration-300"
            style={plan.popular ? { background: "#131313", outline: "1.5px solid #D4AF37", boxShadow: "0 0 48px rgba(212,175,55,0.1)" } : { background: "#131313", outline: "1px solid rgba(255,255,255,0.06)" }}
          >
            {plan.popular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="font-[Orbitron] text-[9px] tracking-[3px] uppercase bg-[#D4AF37] text-black px-4 py-1.5 font-bold rounded-sm">
                  MOST POPULAR
                </span>
              </div>
            )}

            <div>
              <p className="font-[Orbitron] text-[9px] tracking-[5px] uppercase mb-3 text-primary/60">{plan.name}</p>
              <div className="flex items-baseline gap-2">
                <span className="font-[Orbitron] text-5xl font-black text-foreground leading-none">{plan.priceLabel}</span>
                {plan.price > 0 && <span className="font-[Rajdhani] text-muted-foreground text-base">/EPOCH</span>}
              </div>
              {plan.price === 0 && <p className="font-[Rajdhani] text-muted-foreground text-sm mt-1">Free forever</p>}
            </div>

            <ul className="flex flex-col gap-3 flex-1">
              {[
                { text: plan.monthlyMessages === "unlimited" ? "Unlimited messages" : `${plan.monthlyMessages} messages / month`, active: true },
                { text: plan.heroOrbits === "all" ? "All 7 hero orbits" : "1 hero orbit", active: true },
                { text: "All 85 named agents", active: plan.heroOrbits === "all" },
                { text: plan.models, active: true },
                { text: "Image generation in chat", active: plan.imageGeneration },
                { text: "Claude (Thoren orbit)", active: plan.claudeAccess },
                { text: "Auto-Router — AI picks best model", active: plan.autoRouter },
                { text: plan.support, active: true },
              ].map((f, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="text-sm shrink-0" style={{ color: f.active ? "#D4AF37" : "rgba(128,128,128,0.3)" }}>
                    {f.active ? "✦" : "·"}
                  </span>
                  <span className="font-[Rajdhani] text-sm"
                    style={{ color: f.active ? "var(--foreground)" : "rgba(128,128,128,0.3)" }}>
                    {f.text}
                  </span>
                </li>
              ))}
            </ul>

            <Link href={plan.id === "free" ? "/hub" : "#"} className="block">
              <button
                className="w-full font-[Orbitron] text-[10px] tracking-[3px] uppercase py-4 transition-all duration-300 hover:opacity-80 rounded-sm"
                style={plan.popular
                  ? { background: "linear-gradient(135deg, #f2ca50, #D4AF37)", color: "#0a0a0a" }
                  : { background: "transparent", color: "#D4AF37", border: "1px solid rgba(212,175,55,0.3)" }}
              >
                {plan.id === "free" ? "DEPLOY AS SCOUT" : plan.id === "explorer" ? "CHOOSE EXPLORER" : "ASCEND TO COMMANDER"}
              </button>
            </Link>
          </div>
        ))}
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
          Payments coming soon. Start free today — no credit card required.
        </p>
        <p className="font-[Orbitron] text-[9px] tracking-widest uppercase text-primary/20">
          The Rise of the Grid · Leverage is the new gravity.
        </p>
      </div>
    </main>
  );
}
