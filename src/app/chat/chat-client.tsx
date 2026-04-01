"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import Image from "next/image";
import { heroAgents, getOnboardingMessage } from "@/lib/agents";
import { getHero } from "@/lib/heroes";
import { getCustomAgentById } from "@/lib/custom-agents";
import { consumeEnergy, trackMessage, getEnergyCost } from "@/lib/energy";

export default function ChatPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const heroParam = (searchParams.get("hero") || "MASTER").toLowerCase();
  const agentParam = searchParams.get("agent") || "";
  const isMaster = heroParam === "master";

  const agents = heroAgents[heroParam] || [];
  const customAgent = agentParam.startsWith("custom_") ? getCustomAgentById(agentParam) : null;
  const agent = customAgent || (agentParam ? agents.find(a => a.id === agentParam) || null : null);
  const hero = getHero(heroParam);

  const accentColor = hero?.palette?.accent || "#D4AF37";
  const primaryColor = hero?.palette?.primary || "#C0C0C0";
  const bgDeep = hero?.palette?.["bg-deep"] || "#0d0f14";
  const bgMid = hero?.palette?.["bg-mid"] || "#151820";
  const cardBorder = hero?.palette?.["card-border"] || "rgba(212,175,55,0.15)";

  const agentName = agent?.name || (isMaster ? "Master Orbit" : (hero?.name || heroParam.toUpperCase()));
  const agentRole = agent?.role_summary || (isMaster ? "Full Council of 85 Agents" : hero?.class_title || "");
  const agentInitials = agentName.substring(0, 2).toUpperCase();
  const heroName = hero?.name || heroParam.toUpperCase();

  const [messages, setMessages] = useState<{ id: string; role: string; content: string; modelBadge?: string }[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const heroModelMap: Record<string, string> = {
    master:  "anthropic/claude-sonnet-4-5:online",
    thoren:  "xiaomi/mimo-7b",
    nexar:   "openai/o3-mini:online",
    ramet:   "google/gemini-2.5-flash:online",
    lyra:    "anthropic/claude-sonnet-4-5:online",
    kairo:   "xiaomi/mimo-7b",
    nefra:   "google/gemini-2.5-flash:online",
    horusen: "xiaomi/mimo-7b",
  };
  const currentModel = heroModelMap[heroParam] || "google/gemini-2.5-flash";
  const energyCost = getEnergyCost(currentModel);

  // Agent speaks first — onboarding message
  useEffect(() => {
    if (agent && "prompt" in agent && agent.prompt) {
      const onboarding = getOnboardingMessage();
      if (onboarding) {
        setMessages([{ id: "onboarding", role: "assistant", content: onboarding }]);
      } else {
        setMessages([{ id: "onboarding", role: "assistant", content: `I am ${agentName}. ${agent.description || ""} How can I assist you today?` }]);
      }
    } else if (isMaster) {
      setMessages([{ id: "onboarding", role: "assistant", content: `The Empire Engine is online. All 85 agents are standing by. What directive shall I execute?` }]);
    }
  }, [agentParam, heroParam, agent, agentName, isMaster]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Energy gate
    const energyResult = consumeEnergy(currentModel);
    if (!energyResult.success) {
      setMessages(prev => [...prev, {
        id: "energy-" + Date.now(),
        role: "assistant",
        content: `⚡ GRID ENERGY DEPLETED — You've used all your daily energy. It resets at midnight UTC.\n\nUpgrade to Explorer for 200 energy/day, or Commander for unlimited.`,
      }]);
      setIsLoading(false);
      return;
    }

    const userMessage = { id: Date.now().toString(), role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          hero: heroParam,
          agent: agentParam,
          customSystemPrompt: agentParam.startsWith("custom_") ? getCustomAgentById(agentParam)?.systemPrompt : undefined
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      const badgeInfo = data.modelUsed;
      let finalContent = data.response || '';

      if (badgeInfo !== "xiaomi/mimo-7b" && badgeInfo) {
        finalContent += `\n\n---\n*Model: ${badgeInfo}*`;
      }

      setMessages(prev => [...prev, {
        id: (Date.now()+1).toString(),
        role: 'assistant',
        content: finalContent,
        modelBadge: badgeInfo === "xiaomi/mimo-7b" ? "MiMo" : undefined
      }]);
      trackMessage();
    } catch {
      setMessages(prev => [...prev, { id: "err-"+Date.now(), role: "assistant", content: "Connection interrupted. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: `linear-gradient(135deg, ${bgDeep} 0%, ${bgMid} 100%)` }}>

      {/* Messenger window */}
      <div className="w-full max-w-2xl flex flex-col rounded-2xl overflow-hidden shadow-2xl border"
        style={{ borderColor: cardBorder, minHeight: '85vh', maxHeight: '90vh', background: bgDeep }}>

        {/* Window header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b shrink-0"
          style={{ borderColor: cardBorder, background: bgMid }}>
          <button onClick={() => router.back()} className="text-white/40 hover:text-white/80 transition-colors p-1">
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Agent avatar */}
          <div className="relative w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-[Orbitron] font-bold text-sm border-2"
            style={{ background: `rgba(${hero?.palette?.["primary-rgb"] || "192,192,192"},0.15)`, borderColor: accentColor, color: accentColor }}>
            {agentInitials}
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2"
              style={{ borderColor: bgMid }} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-[Orbitron] text-xs font-bold tracking-wider truncate" style={{ color: primaryColor }}>
                {agentName}
              </p>
              {agentParam.startsWith("custom_") && (
                <span className="font-[Orbitron] text-[8px] tracking-[2px] uppercase px-1.5 py-0.5 rounded-sm shrink-0"
                  style={{ background: "rgba(212,175,55,0.15)", color: "#D4AF37", border: "1px solid rgba(212,175,55,0.3)" }}>
                  ✦ CUSTOM
                </span>
              )}
            </div>
            <p className="text-[10px] font-mono tracking-widest uppercase truncate" style={{ color: accentColor, opacity: 0.7 }}>
              {agentRole}
            </p>
          </div>

          {/* Hero attribution badge */}
          <button onClick={() => router.push(`/heroes/${heroParam}`)}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-mono uppercase tracking-widest hover:opacity-80 transition-opacity"
            style={{ borderColor: cardBorder, color: accentColor, background: `rgba(${hero?.palette?.["accent-rgb"] || "212,175,55"},0.08)` }}>
            <div className="w-4 h-4 rounded-full overflow-hidden">
              <Image src={`/${heroParam}.png`} alt={heroName} width={16} height={16} className="object-cover" unoptimized
                onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
            </div>
            {heroName}
          </button>
        </div>

        {/* Breadcrumb */}
        <div className="px-4 py-2 text-[10px] font-mono tracking-widest flex items-center gap-2 shrink-0"
          style={{ color: accentColor, opacity: 0.5, borderBottom: `0.5px solid ${cardBorder}` }}>
          <span className="cursor-pointer hover:opacity-100 transition-opacity" onClick={() => router.push('/')}>Universe</span>
          <span>›</span>
          <span className="cursor-pointer hover:opacity-100 transition-opacity" onClick={() => router.push(`/heroes/${heroParam}`)}>{heroName}</span>
          <span>›</span>
          <span style={{ opacity: 1, color: primaryColor }}>{agentName}</span>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3"
          style={{ background: bgDeep }}>
          {messages.map((m) => (
            <div key={m.id} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>

              {/* Avatar */}
              {m.role === "assistant" && (
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 self-end font-[Orbitron] text-xs border mt-auto"
                  style={{ background: `rgba(${hero?.palette?.["primary-rgb"] || "192,192,192"},0.1)`, borderColor: cardBorder, color: accentColor }}>
                  {agentInitials}
                </div>
              )}

              {/* Bubble */}
              <div className="flex flex-col gap-1 max-w-[75%]">
                <div className={`px-4 py-3 text-sm leading-relaxed ${m.role === "user" ? "rounded-2xl rounded-br-sm" : "rounded-2xl rounded-bl-sm"}`}
                  style={m.role === "user"
                    ? { background: accentColor, color: "#000", fontFamily: "var(--font-body)" }
                    : { background: bgMid, border: `0.5px solid ${cardBorder}`, color: "rgba(255,255,255,0.87)", fontFamily: "var(--font-body)" }}>
                  <div className="whitespace-pre-wrap break-words">{m.content}</div>
                </div>
                {m.modelBadge && (
                  <div className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <span className="font-[Orbitron] text-[10px] font-bold tracking-[1px] uppercase px-2 py-0.5 rounded-sm bg-orange-500/10 text-orange-500 border border-orange-500/30">
                      {m.modelBadge}
                    </span>
                  </div>
                )}
              </div>

              {/* User avatar */}
              {m.role === "user" && (
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 self-end bg-white/10 border border-white/20 text-xs font-mono text-white/60 mt-auto">
                  YOU
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-[Orbitron] text-xs border"
                style={{ background: `rgba(${hero?.palette?.["primary-rgb"] || "192,192,192"},0.1)`, borderColor: cardBorder, color: accentColor }}>
                {agentInitials}
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-2"
                style={{ background: bgMid, border: `0.5px solid ${cardBorder}` }}>
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: accentColor, animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: accentColor, animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: accentColor, animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <div className="shrink-0 px-4 py-3 border-t" style={{ borderColor: cardBorder, background: bgMid }}>
          <div className="flex items-center justify-between px-2 mb-1">
            <span className="font-mono text-[9px] text-muted-foreground/40">
              ⚡ {energyCost} energy per message
            </span>
          </div>
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              className="flex-1 px-4 py-2.5 rounded-full text-sm outline-none transition-all"
              style={{ background: bgDeep, border: `1.5px solid ${cardBorder}`, color: "rgba(255,255,255,0.87)",
                fontFamily: "var(--font-body)" }}
              value={input}
              placeholder={`Message ${agentName}...`}
              onChange={e => setInput(e.target.value)}
              disabled={isLoading}
              onFocus={e => { e.target.style.borderColor = accentColor; }}
              onBlur={e => { e.target.style.borderColor = cardBorder; }}
            />
            <button type="submit" disabled={isLoading || !input.trim()}
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all disabled:opacity-40"
              style={{ background: accentColor, color: "#000" }}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}