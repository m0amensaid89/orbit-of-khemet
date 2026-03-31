"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStats, getEnergyRemaining, getMaxEnergy } from "@/lib/energy";
import { PLANS } from "@/lib/plans";
import { getCustomAgents, deleteCustomAgent, type CustomAgent } from "@/lib/custom-agents";

export default function ProfilePage() {
  const [stats, setStats] = useState({ totalEnergyUsed: 0, level: 1, currentXp: 0, nextLevelXp: 100 });
  const [userPlan, setUserPlan] = useState("explorer");
  const [customAgents, setCustomAgents] = useState<CustomAgent[]>([]);

  useEffect(() => {
    const liveStats = getStats();
    setStats({
      totalEnergyUsed: liveStats.messages * 2,
      level: liveStats.level,
      currentXp: liveStats.xp,
      nextLevelXp: liveStats.nextLevelXP,
    });
    const savedPlan = localStorage.getItem("orbit_plan") || "commander"; // Defaulting to commander for demo
    setUserPlan(savedPlan);
    setCustomAgents(getCustomAgents());
  }, []);

  const planInfo = PLANS.find((p) => p.id === userPlan) || PLANS[0];

  return (
    <main className="container mx-auto px-4 py-12 flex flex-col items-center">
      <div className="w-full max-w-4xl flex flex-col gap-8">

        {/* Profile Header */}
        <div className="flex items-center justify-between p-8 rounded-sm" style={{ background: "#131313", outline: "1px solid rgba(212,175,55,0.08)" }}>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 border-2 flex items-center justify-center font-[Orbitron] text-2xl font-black rounded-full"
              style={{ background: "rgba(212,175,55,0.08)", borderColor: "#D4AF37", color: "#D4AF37", boxShadow: "0 0 20px rgba(212,175,55,0.15)" }}>
              GO
            </div>
            <div>
              <h1 className="text-3xl font-[Orbitron] font-black tracking-wider mb-2">Grid Operative</h1>
              <div className="flex gap-3">
                <span className="font-mono text-[10px] tracking-widest uppercase border border-primary/50 text-primary px-3 py-1 rounded-sm bg-primary/5">
                  {planInfo.name} Plan
                </span>
                <span className="font-mono text-[10px] tracking-widest uppercase border border-muted-foreground/30 text-muted-foreground px-3 py-1 rounded-sm">
                  Lvl {stats.level} — Initiate
                </span>
              </div>

              {/* Energy meter */}
              {userPlan !== "commander" && (
                <div className="mt-4 w-full">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-[Orbitron] text-[8px] tracking-[3px] uppercase text-primary/60">GRID ENERGY TODAY</span>
                    <span className="font-mono text-[10px] text-primary">
                      {getEnergyRemaining()} / {getMaxEnergy()}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.round((getEnergyRemaining() / getMaxEnergy()) * 100)}%`,
                        backgroundColor: getEnergyRemaining() / getMaxEnergy() <= 0.2 ? "#FF4444" :
                                         getEnergyRemaining() / getMaxEnergy() <= 0.5 ? "#F59E0B" : "#4ECDC4",
                      }}
                    />
                  </div>
                  <p className="font-mono text-[8px] text-muted-foreground/40 mt-1">Resets daily at midnight UTC</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Energy Stats */}
        <div className="p-8 rounded-sm flex flex-col gap-6" style={{ background: "#131313", outline: "1px solid rgba(212,175,55,0.08)" }}>
          <h2 className="font-[Orbitron] text-xs tracking-[4px] uppercase" style={{ color: "rgba(212,175,55,0.5)" }}>GRID XP</h2>
          <div>
            <div className="flex justify-between items-end mb-2">
              <span className="text-4xl font-[Orbitron] font-black">{stats.currentXp}</span>
              <div className="text-right">
                <span className="font-[Orbitron] text-[10px] tracking-widest uppercase text-muted-foreground block mb-1">Next Rank</span>
                <span className="font-[Rajdhani] text-primary">Scout</span>
                <p className="font-mono text-[9px] text-muted-foreground mt-1">{stats.nextLevelXp - stats.currentXp} XP away</p>
              </div>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-1000"
                style={{ width: `${(stats.currentXp / stats.nextLevelXp) * 100}%`, background: "linear-gradient(90deg, #D4AF37, #f2ca50)" }}
              />
            </div>
          </div>
        </div>

        {/* MY FORGE Section */}
        <div className="p-8 rounded-sm flex flex-col gap-6" style={{ background: "#131313", outline: "1px solid rgba(212,175,55,0.08)" }}>
          <div className="flex items-center justify-between">
            <h2 className="font-[Orbitron] text-xs tracking-[4px] uppercase" style={{ color: "rgba(212,175,55,0.5)" }}>MY FORGE</h2>
            {customAgents.length < 3 && (
              <Link href="/forge">
                <button className="font-[Orbitron] text-[9px] tracking-widest uppercase px-3 py-1.5 border hover:opacity-80 transition-all rounded-sm"
                  style={{ borderColor: "#D4AF37", color: "#D4AF37" }}>
                  FORGE AGENT
                </button>
              </Link>
            )}
          </div>

          {customAgents.length === 0 ? (
            <div className="text-center py-8 border border-dashed rounded-xl" style={{ borderColor: "var(--border)" }}>
              <p className="font-[Orbitron] text-xs tracking-widest text-muted-foreground mb-2">NO CUSTOM AGENTS YET</p>
              <p className="font-[Rajdhani] text-sm text-muted-foreground/60 mb-6">
                Forge your first custom agent. Define its intelligence. Assign it to any hero orbit.
              </p>
              <Link href="/forge">
                <button className="font-[Orbitron] text-[9px] tracking-[2px] uppercase px-6 py-3 font-bold rounded-sm hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #f2ca50, #D4AF37)", color: "#0a0a0a" }}>
                  FORGE YOUR FIRST AGENT ✦
                </button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {customAgents.map(agent => (
                <div key={agent.id} className="flex items-start gap-4 p-4 rounded-xl transition-all"
                  style={{ background: "#1a1a1a", outline: "1px solid rgba(212,175,55,0.1)" }}>

                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-[Orbitron] text-sm font-bold shrink-0 border"
                    style={{ background: "rgba(212,175,55,0.1)", borderColor: "rgba(212,175,55,0.3)", color: "#D4AF37" }}>
                    {agent.name.substring(0, 2).toUpperCase()}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-[Orbitron] text-sm font-bold text-foreground">{agent.name}</h3>
                      <span className="font-[Orbitron] text-[8px] tracking-widest uppercase px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(212,175,55,0.1)", color: "#D4AF37", border: "1px solid rgba(212,175,55,0.2)" }}>
                        ✦ CUSTOM
                      </span>
                    </div>
                    <p className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground/80 mb-2">
                      {agent.role_summary}
                    </p>
                    <p className="font-[Rajdhani] text-xs text-muted-foreground/60">
                      {agent.heroSlug.toUpperCase()} orbit · {agent.category}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    <Link href={`/heroes/${agent.heroSlug}`}>
                      <button className="w-full font-[Orbitron] text-[8px] tracking-widest uppercase px-3 py-1.5 border hover:opacity-80 transition-opacity rounded-sm"
                        style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
                        VIEW
                      </button>
                    </Link>
                    <button
                      onClick={() => {
                        deleteCustomAgent(agent.id);
                        setCustomAgents(getCustomAgents());
                      }}
                      className="w-full font-[Orbitron] text-[8px] tracking-widest uppercase px-3 py-1.5 border hover:border-red-500/50 hover:text-red-400 transition-all rounded-sm"
                      style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
                      DELETE
                    </button>
                  </div>
                </div>
              ))}
              {customAgents.length >= 3 && (
                <p className="font-mono text-[9px] text-muted-foreground/40 text-center mt-2">
                  Maximum 3 custom agents reached on Commander plan.
                </p>
              )}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
