"use client";

import { useState, useMemo, useEffect } from "react";
import { heroAgents } from "@/lib/agents";
import { Zap } from "lucide-react";
import Link from "next/link";
import { getCustomAgentsForHero, type CustomAgent } from "@/lib/custom-agents";

type AgentCommandCenterProps = {
  slug: string;
  accentColor: string;
};

export function AgentCommandCenter({ slug, accentColor }: AgentCommandCenterProps) {
  const builtInAgents = heroAgents[slug as keyof typeof heroAgents] || [];
  const [customAgents, setCustomAgents] = useState<CustomAgent[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isCommander, setIsCommander] = useState(false);

  useEffect(() => {
    setIsCommander(localStorage.getItem("orbit_plan") === "commander");
    setCustomAgents(getCustomAgentsForHero(slug));
  }, [slug]);

  // Check for forged=true in URL params to refresh
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("forged") === "true") {
      setCustomAgents(getCustomAgentsForHero(slug));
    }
  }, [slug]);

  const allAgents = useMemo(() => {
    return [...customAgents, ...builtInAgents];
  }, [customAgents, builtInAgents]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(allAgents.map(a => a.category)));
    if (customAgents.length > 0 && !cats.includes("Custom")) {
      cats.unshift("Custom");
    }
    return ["All", ...cats];
  }, [allAgents, customAgents]);

  const filteredAgents = useMemo(() => {
    if (selectedCategory === "All") return allAgents;
    if (selectedCategory === "Custom") return customAgents;
    return allAgents.filter(a => a.category === selectedCategory);
  }, [allAgents, selectedCategory, customAgents]);

  return (
    <div className="w-full">
      {/* Roster Header */}
      <div className="flex flex-col md:flex-row md:items-end gap-6 mb-12">
        <div className="shrink-0 flex items-center justify-between w-full md:w-auto">
          <div>
            <h2 className="font-[Orbitron] text-xs tracking-[4px] uppercase text-muted-foreground mb-2">
              Agent Roster
            </h2>
            <div className="flex items-baseline gap-3">
              <span className="font-[Orbitron] text-5xl font-black text-foreground leading-none">
                {allAgents.length}
              </span>
              <span className="font-mono text-[10px] tracking-widest text-[#00E5FF] bg-[#00E5FF]/10 px-2 py-0.5 rounded">
                ACTIVE
              </span>
            </div>
          </div>

          {/* FORGE AGENT BUTTON (Commander Tier) */}
          {isCommander && (
            <Link href="/forge" className="md:ml-8">
              <button className="flex items-center gap-2 font-[Orbitron] text-[9px] tracking-[2px] uppercase px-4 py-2 border hover:bg-white/5 transition-all rounded-sm"
                style={{ borderColor: "rgba(212,175,55,0.4)", color: "#D4AF37" }}>
                <Zap className="w-3.5 h-3.5" />
                FORGE AGENT
              </button>
            </Link>
          )}
        </div>

        {/* Categories */}
        <div className="flex-1 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="font-[Orbitron] text-[9px] tracking-widest uppercase px-4 py-2 rounded-full border transition-all"
              style={{
                borderColor: selectedCategory === cat ? accentColor : "var(--border)",
                color: selectedCategory === cat ? accentColor : "var(--muted-foreground)",
                background: selectedCategory === cat ? `${accentColor}10` : "transparent",
              }}
            >
              {cat} {cat !== "All" && `(${cat === "Custom" ? customAgents.length : allAgents.filter(a => a.category === cat).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAgents.map((agent) => (
          <div
            key={agent.id}
            className="group relative flex flex-col p-6 rounded-2xl border bg-card transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,0,0,0.5)]"
            style={{
              borderColor: "var(--border)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = accentColor;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
            }}
          >
            <div className="flex items-start gap-4 mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-colors"
                style={{
                  background: "var(--muted)",
                  borderColor: "var(--border)",
                }}
              >
                <div
                  className="w-4 h-4 rounded-sm rotate-45 transition-all group-hover:scale-110"
                  style={{ background: accentColor }}
                />
              </div>
              <div className="flex-1">
                <h3 className="font-[Orbitron] text-lg font-bold text-foreground mb-1 leading-tight group-hover:text-transparent group-hover:bg-clip-text transition-all"
                  style={{ backgroundImage: `linear-gradient(to right, ${accentColor}, #fff)` }}>
                  {agent.name}
                </h3>
                <p className="font-mono text-[9px] tracking-[2px] uppercase"
                  style={{ color: `${accentColor}80` }}>
                  {agent.role_summary}
                </p>
              </div>
            </div>

            <p className="font-[Rajdhani] text-muted-foreground text-sm flex-1 leading-relaxed mb-6">
              {agent.description}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <div className="flex gap-2">
                <span className="font-[Orbitron] text-[8px] tracking-widest uppercase text-muted-foreground/60 bg-muted/50 px-2 py-0.5 rounded-sm">
                  {agent.category}
                </span>

                {/* CUSTOM BADGE */}
                {"isCustom" in agent && (agent as CustomAgent).isCustom && (
                  <span className="font-[Orbitron] text-[8px] tracking-[2px] uppercase px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(212,175,55,0.15)", color: "#D4AF37", border: "1px solid rgba(212,175,55,0.3)" }}>
                    ✦ CUSTOM
                  </span>
                )}
              </div>

              <Link href={`/chat?hero=${slug}&agent=${agent.id}`}>
                <button
                  className="font-[Orbitron] text-[10px] tracking-[3px] uppercase font-bold flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-all"
                  style={{ color: accentColor }}
                >
                  Launch
                  <span className="text-sm">→</span>
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
