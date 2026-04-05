"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { heroOrder } from "@/lib/heroes";
import { saveCustomAgent, AGENT_CATEGORIES } from "@/lib/custom-agents";
import { Zap, ChevronDown, X } from "lucide-react";
import { motion } from "framer-motion";

const heroDisplayNames: Record<string, string> = {
  thoren: "THOREN: The Law",
  ramet: "RAMET: The Stabilizer",
  nexar: "NEXAR: The Destabilizer",
  lyra: "LYRA: Visionary Architect",
  kairo: "KAIRO: Precision Warrior",
  nefra: "NEFRA: Precision Warrior",
  horusen: "HORUSEN: Script Guardian",
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
  const [agentPhoto, setAgentPhoto] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error && (!form.name || !form.role_summary || !form.systemPrompt)) {
       setError("");
    }
  };

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
      setError("System prompt is required: this is what makes your agent unique.");
      return;
    }
    setSaving(true);
    try {
      saveCustomAgent({ ...form, photo: agentPhoto || undefined });
      router.push(`/heroes/${form.heroSlug}?forged=true`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to forge agent.");
      setSaving(false);
    }
  };

  // Custom Input Component for Floating Labels
  const FloatingInput = ({
    id, label, value, onChange, placeholder, maxLength, required = false
  }: {
    id: string; label: string; value: string; onChange: (val: string) => void; placeholder?: string; maxLength?: number; required?: boolean
  }) => {
    const isFocused = focusedField === id;
    const hasValue = value.length > 0;
    const isFloating = isFocused || hasValue;
    const isError = error && required && !hasValue;

    return (
      <div className="relative mb-6">
        <div
          className={`relative rounded-xl border-2 transition-all duration-300 bg-[#1A1A1A] ${
            isError ? "border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]" :
            isFocused ? "border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.15)]" : "border-white/10 hover:border-white/20"
          }`}
        >
          <label
            htmlFor={id}
            className={`absolute left-4 transition-all duration-300 pointer-events-none font-[Orbitron] uppercase tracking-widest ${
              isFloating
                ? "text-[9px] top-2 text-[#D4AF37]"
                : "text-[11px] top-1/2 -translate-y-1/2 text-white/40"
            }`}
          >
            {label} {required && "*"}
          </label>
          <input
            id={id}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocusedField(id)}
            onBlur={() => setFocusedField(null)}
            placeholder={isFocused ? placeholder : ""}
            maxLength={maxLength}
            className="w-full bg-transparent px-4 pt-6 pb-2 text-white font-[Rajdhani] text-lg outline-none placeholder:text-white/20"
          />
        </div>
        {isError && (
          <p className="absolute -bottom-5 left-0 text-red-400 text-xs font-[Rajdhani] flex items-center gap-1 mt-1">
            <X className="w-3 h-3" /> This field is required
          </p>
        )}
      </div>
    );
  };

  return (
    <main className="min-h-screen py-24 px-6 flex justify-center bg-[#0A0A0A] overflow-hidden">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-12">
        {/* Left Side: Form */}
        <div className="w-full lg:w-3/5">
          <div className="mb-10 space-y-2">
            <div className="inline-block px-3 py-1 mb-2 border border-[#D4AF37]/30 bg-[#D4AF37]/10 rounded font-cinzel text-[10px] tracking-widest text-[#D4AF37]">
              ✦ COMMANDER EXCLUSIVE
            </div>
            <h1 className="text-5xl md:text-7xl font-cinzel-decorative font-normal text-transparent bg-clip-text bg-gradient-to-b from-[#FFF5D1] to-[#D4AF37] drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]">
              AGENT FORGE
            </h1>
            <p className="text-xl md:text-2xl font-cinzel-decorative font-normal text-[#d0c5af]/80 tracking-widest uppercase">
              Create a custom agent. Define its intelligence. Assign it to a hero orbit.
            </p>
          </div>

          <div className="flex flex-col">
            {/* Agent Photo Upload */}
            <div className="flex flex-col gap-2 mb-6">
              <label className="font-[Orbitron] text-[8px] tracking-[3px] uppercase"
                style={{ color: 'rgba(212,175,55,0.5)' }}>
                AGENT PHOTO (optional)
              </label>
              <p className="font-[Rajdhani] text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Recommended: 400x400px square, JPG or PNG, max 2MB
              </p>
              {/* Photo display area */}
              <div className="relative mx-auto mb-4 overflow-hidden"
                style={{
                  width: '120px',
                  height: '120px',
                  border: `1px solid rgba(212,175,55,0.2)`,
                  background: '#0A0A0A',
                }}>
                {agentPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={agentPhoto} alt="Agent" className="w-full h-full object-cover" />
                ) : (
                  /* Shadow hero silhouette SVG */
                  <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                    <rect width="120" height="120" fill="#0A0A0A"/>
                    {/* Head */}
                    <ellipse cx="60" cy="38" rx="18" ry="20" fill="rgba(212,175,55,0.08)" stroke="rgba(212,175,55,0.15)" strokeWidth="1"/>
                    {/* Body */}
                    <path d="M30 120 Q35 75 60 70 Q85 75 90 120Z" fill="rgba(212,175,55,0.08)" stroke="rgba(212,175,55,0.15)" strokeWidth="1"/>
                    {/* Shoulders */}
                    <path d="M35 75 Q30 65 25 70 L22 90 Q35 88 40 80Z" fill="rgba(212,175,55,0.06)"/>
                    <path d="M85 75 Q90 65 95 70 L98 90 Q85 88 80 80Z" fill="rgba(212,175,55,0.06)"/>
                    {/* Gold glow hint */}
                    <ellipse cx="60" cy="60" rx="40" ry="45" fill="none" stroke="rgba(212,175,55,0.05)" strokeWidth="20"/>
                  </svg>
                )}
              </div>
              <div className="flex items-center justify-center gap-4 mt-2">
                <label className="cursor-pointer font-[Orbitron] text-[8px] tracking-[2px] uppercase px-4 py-2 transition-all rounded hover:bg-[#D4AF37]/10"
                  style={{
                    border: '1px solid rgba(212,175,55,0.2)',
                    color: 'rgba(212,175,55,0.6)',
                    background: 'transparent',
                  }}>
                  {agentPhoto ? 'CHANGE PHOTO' : 'UPLOAD PHOTO'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 2 * 1024 * 1024) {
                        alert('Photo must be under 2MB');
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = (ev) => setAgentPhoto(ev.target?.result as string);
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
                {agentPhoto && (
                  <button type="button" onClick={() => { setAgentPhoto(null); }}
                    className="font-[Orbitron] text-[8px] tracking-[2px] uppercase px-4 py-2 rounded hover:bg-red-500/10 transition-all"
                    style={{ color: 'rgba(255,68,68,0.5)' }}>
                    REMOVE
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <FloatingInput
                id="name"
                label="AGENT IDENTIFIER"
                value={form.name}
                onChange={(val) => update("name", val)}
                placeholder="e.g. Khepris"
                maxLength={30}
                required
              />
              <FloatingInput
                id="role_summary"
                label="FUNCTIONAL ROLE"
                value={form.role_summary}
                onChange={(val) => update("role_summary", val)}
                placeholder="e.g. Brand Voice Architect"
                maxLength={50}
                required
              />
            </div>

            <FloatingInput
              id="description"
              label="MANIFESTATION LORE (Optional)"
              value={form.description}
              onChange={(val) => update("description", val)}
              placeholder="What does this agent do in one sentence?"
              maxLength={120}
            />

            {/* System Prompt */}
            <div className="relative mb-6">
              <div
                className={`relative rounded-xl border-2 transition-all duration-300 bg-[#1A1A1A] ${
                  error && !form.systemPrompt ? "border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]" :
                  focusedField === "systemPrompt" ? "border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.15)]" : "border-white/10 hover:border-white/20"
                }`}
              >
                <label
                  htmlFor="systemPrompt"
                  className={`absolute left-4 transition-all duration-300 pointer-events-none font-[Orbitron] uppercase tracking-widest ${
                    focusedField === "systemPrompt" || form.systemPrompt.length > 0
                      ? "text-[9px] top-2 text-[#D4AF37]"
                      : "text-[11px] top-6 text-white/40"
                  }`}
                >
                  NEURAL DIRECTIVES *
                </label>
                <textarea
                  id="systemPrompt"
                  value={form.systemPrompt}
                  onChange={(e) => update("systemPrompt", e.target.value)}
                  onFocus={() => setFocusedField("systemPrompt")}
                  onBlur={() => setFocusedField(null)}
                  placeholder={focusedField === "systemPrompt" ? "Define the intelligence, tone, and specific instructions for this agent..." : ""}
                  className="w-full bg-transparent px-4 pt-8 pb-4 text-white font-[Rajdhani] text-lg outline-none min-h-[200px] resize-y placeholder:text-white/20"
                />
              </div>
            </div>

            {/* Category & Hero Selects */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 mb-8">
              <div className="relative mb-6">
                <div className="relative rounded-xl border-2 border-white/10 bg-[#1A1A1A] transition-all hover:border-white/20">
                  <label className="absolute left-4 top-2 text-[9px] font-[Orbitron] uppercase tracking-widest text-[#D4AF37]">CATEGORY</label>
                  <select
                    value={form.category}
                    onChange={(e) => update("category", e.target.value)}
                    className="w-full bg-transparent px-4 pt-6 pb-2 text-white font-[Rajdhani] text-lg outline-none appearance-none cursor-pointer"
                  >
                    {AGENT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-[#131313] text-white">{cat}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                </div>
              </div>

              <div className="relative mb-6">
                <div className="relative rounded-xl border-2 border-white/10 bg-[#1A1A1A] transition-all hover:border-white/20">
                  <label className="absolute left-4 top-2 text-[9px] font-[Orbitron] uppercase tracking-widest text-[#D4AF37]">PATRON DEITY *</label>
                  <select
                    value={form.heroSlug}
                    onChange={(e) => update("heroSlug", e.target.value)}
                    className="w-full bg-transparent px-4 pt-6 pb-2 text-white font-[Rajdhani] text-lg outline-none appearance-none cursor-pointer uppercase"
                  >
                    {heroOrder.map((slug) => (
                      <option key={slug} value={slug} className="bg-[#131313] text-white">
                        {heroDisplayNames[slug] || slug.toUpperCase()}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Error Message Display */}
            {error && (
              <div className="flex items-start gap-3 px-4 py-3 mb-6 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400">
                <X className="w-4 h-4 mt-0.5 shrink-0" />
                <p className="font-[Rajdhani] text-sm">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4">
              <Link href="/profile" className="w-1/3">
                <button className="w-full font-[Orbitron] text-[10px] tracking-[3px] uppercase py-3 border transition-all rounded hover:bg-white/5" style={{ borderColor: 'rgba(212,175,55,0.3)', color: '#D4AF37' }}>
                  CANCEL
                </button>
              </Link>
              <button
                onClick={handleForge}
                disabled={saving}
                className="w-2/3 px-8 py-3 rounded flex items-center justify-center gap-2 font-orbitron font-bold tracking-widest text-black transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #f2ca50, #D4AF37)", boxShadow: "0 0 15px rgba(212,175,55,0.4)" }}
              >
                <Zap className="w-4 h-4" />
                {saving ? "FORGING..." : "FORGE AGENT ✦"}
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Live Preview Panel */}
        <div className="w-full lg:w-2/5 mt-10 lg:mt-0">
          <div className="sticky top-24">
            <h3 className="font-[Orbitron] text-xs tracking-[4px] uppercase text-white/40 mb-4 pl-2 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> LIVE PREVIEW
            </h3>

            <motion.div
              className="w-full flex flex-col relative overflow-hidden group p-8" style={{ backgroundColor: '#131313', border: '1px solid rgba(212,175,55,0.08)', borderRadius: '4px' }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-[#D4AF37]/5 to-transparent opacity-50" />

              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="relative w-24 h-24 mb-6 rounded-full border-2 border-[#D4AF37] p-1 bg-black">
                  {agentPhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={agentPhoto}
                      alt={form.name || "Agent photo"}
                      className="w-full h-full object-cover rounded-full mix-blend-luminosity group-hover:mix-blend-normal transition-all duration-500"
                    />
                  ) : (
                    <Image
                      src={`/${form.heroSlug}.png`}
                      alt={form.heroSlug}
                      fill
                      className="object-cover rounded-full opacity-80 mix-blend-luminosity group-hover:mix-blend-normal transition-all duration-500"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  )}
                  <div className="absolute -bottom-2 -right-2 bg-[#D4AF37] text-black rounded-full p-1 border border-black">
                    <Zap className="w-3 h-3" />
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className="font-[Orbitron] text-[8px] tracking-[3px] uppercase px-2 py-0.5 rounded bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20">
                    ✦ CUSTOM
                  </span>
                  {form.category !== "Custom" && (
                    <span className="font-[Orbitron] text-[8px] tracking-[3px] uppercase px-2 py-0.5 rounded bg-white/5 text-white/60 border border-white/10">
                      {form.category}
                    </span>
                  )}
                </div>

                <h3 className="font-[Orbitron] text-2xl font-black text-white mb-1">
                  {form.name || "UNNAMED AGENT"}
                </h3>

                <p className="font-mono text-xs uppercase tracking-widest text-[#D4AF37] mb-6">
                  {form.role_summary || "FUNCTIONAL ROLE PENDING"}
                </p>

                <div className="w-full bg-[#1A1A1A] border border-white/5 rounded-xl p-4 text-left">
                  <p className="font-[Rajdhani] text-sm text-white/50 italic line-clamp-3">
                    {form.description || "Manifestation lore goes here. Describe the specific purpose of this agent in the overarching empire ecosystem."}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
