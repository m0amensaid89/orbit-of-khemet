"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { heroOrder } from "@/lib/heroes";
import { saveCustomAgent, AGENT_CATEGORIES } from "@/lib/custom-agents";
import { Zap, ChevronDown, X } from "lucide-react";

const heroDisplayNames: Record<string, string> = {
  thoren: "THOREN — The Law",
  ramet: "RAMET — The Stabilizer",
  nexar: "NEXAR — The Destabilizer",
  lyra: "LYRA — Visionary Architect",
  kairo: "KAIRO — Precision Warrior",
  nefra: "NEFRA — Precision Warrior",
  horusen: "HORUSEN — Script Guardian",
};

export default function ForgePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    role_summary: "",
    description: "",
    systemPrompt: "",
    category: "Custom",
    heroSlug: "thoren",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleForge = () => {
    if (!form.name.trim()) {
      setError("Agent name is required.");
      return;
    }
    if (!form.role_summary.trim()) {
      setError("Role summary is required.");
      return;
    }
    if (!form.systemPrompt.trim()) {
      setError("System prompt is required — this is what makes your agent unique.");
      return;
    }
    setSaving(true);
    try {
      saveCustomAgent(form);
      router.push(`/heroes/${form.heroSlug}?forged=true`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to forge agent.");
      setSaving(false);
    }
  };

  const inputClass =
    "w-full bg-transparent border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:border-primary/60 font-[Rajdhani]";
  const labelClass =
    "font-[Orbitron] text-[9px] tracking-[4px] uppercase text-primary/60 mb-1.5 block";

  return (
    <main className="min-h-screen py-24 px-6 flex justify-center">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="font-[Orbitron] text-[9px] tracking-[4px] uppercase px-3 py-1 rounded-full"
              style={{
                background: "rgba(212,175,55,0.1)",
                color: "#D4AF37",
                border: "1px solid rgba(212,175,55,0.2)",
              }}
            >
              ✦ COMMANDER EXCLUSIVE
            </span>
          </div>
          <h1 className="font-[Orbitron] text-4xl md:text-5xl font-black tracking-tighter text-foreground mb-3 leading-none">
            AGENT FORGE
          </h1>
          <p className="font-[Rajdhani] text-lg text-muted-foreground">
            Create a custom agent. Define its intelligence. Assign it to a hero orbit. It will appear in the roster and respond using your exact system prompt.
          </p>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-6 p-8 rounded-2xl border bg-card" style={{ borderColor: "var(--border)" }}>
          {/* Row 1: Name + Role */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Agent Name *</label>
              <input
                className={inputClass}
                style={{ borderColor: "var(--border)" }}
                placeholder="e.g. Khepris"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                maxLength={30}
              />
              <p className="font-mono text-[9px] text-muted-foreground/40 mt-1">Egyptian naming encouraged</p>
            </div>
            <div>
              <label className={labelClass}>Role / Title *</label>
              <input
                className={inputClass}
                style={{ borderColor: "var(--border)" }}
                placeholder="e.g. Brand Voice Architect"
                value={form.role_summary}
                onChange={(e) => update("role_summary", e.target.value)}
                maxLength={50}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Description</label>
            <input
              className={inputClass}
              style={{ borderColor: "var(--border)" }}
              placeholder="What does this agent do in one sentence?"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              maxLength={120}
            />
          </div>

          {/* System Prompt — the critical field */}
          <div>
            <label className={labelClass}>System Prompt * — the intelligence of your agent</label>
            <textarea
              className={`${inputClass} min-h-[160px] resize-y leading-relaxed`}
              style={{ borderColor: "var(--border)" }}
              placeholder={`You are [Agent Name], a specialized AI agent within the Orbit of Khemet Empire Engine.\nYour expertise: [describe what this agent is trained to do]\nYour tone: [authoritative / empathetic / analytical / creative]\nYour approach: [how you tackle problems]\n\nWhen a user comes to you, you always: [define your behavior]`}
              value={form.systemPrompt}
              onChange={(e) => update("systemPrompt", e.target.value)}
            />
            <p className="font-mono text-[9px] text-muted-foreground/40 mt-1 text-right">
              This prompt runs as the system instruction every time a user chats with this agent.
            </p>
          </div>

          {/* Row 3: Category + Hero */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Category</label>
              <div className="relative">
                <select
                  className={`${inputClass} appearance-none cursor-pointer bg-background`}
                  style={{ borderColor: "var(--border)" }}
                  value={form.category}
                  onChange={(e) => update("category", e.target.value)}
                >
                  {AGENT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Assign to Hero Orbit *</label>
              <div className="relative">
                <select
                  className={`${inputClass} appearance-none cursor-pointer bg-background`}
                  style={{ borderColor: "var(--border)" }}
                  value={form.heroSlug}
                  onChange={(e) => update("heroSlug", e.target.value)}
                >
                  {heroOrder.map((slug) => (
                    <option key={slug} value={slug}>
                      {heroDisplayNames[slug] || slug.toUpperCase()}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400">
              <X className="w-4 h-4 mt-0.5 shrink-0" />
              <p className="font-[Rajdhani] text-sm">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Link href="/profile" className="flex-1">
              <button className="w-full font-[Orbitron] text-[9px] tracking-[2px] uppercase py-3 border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all rounded-sm">
                CANCEL
              </button>
            </Link>
            <button
              onClick={handleForge}
              disabled={saving}
              className="flex-1 font-[Orbitron] text-[9px] tracking-[2px] uppercase py-3 font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 rounded-sm hover:opacity-90"
              style={{ background: "#D4AF37", color: "#000" }}
            >
              <Zap className="w-3.5 h-3.5" />
              {saving ? "FORGING..." : "FORGE AGENT ✦"}
            </button>
          </div>

          <p className="font-mono text-[9px] text-muted-foreground/30 text-center">
            Commander plan allows up to 3 custom agents · Egyptian naming encouraged
          </p>
        </div>
      </div>
    </main>
  );
}
