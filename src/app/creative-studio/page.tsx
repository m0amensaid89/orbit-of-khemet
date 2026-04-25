"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useLanguage } from "@/hooks/useLanguage";

const MODELS = [
  { id: "dall-e-3",    label: "DALL-E 3",    labelAr: "دالي 3",        badge: "OpenAI",   desc: "Photorealistic. Prompt-accurate. HD quality.",    descAr: "واقعي عالي الدقة، يتبع التعليمات بدقة." },
  { id: "grok-aurora", label: "Grok Aurora", labelAr: "غروك أورورا",   badge: "xAI",      desc: "Vivid. Creative. Unique artistic style.",         descAr: "إبداعي وحيوي بأسلوب فني مميز." },
  { id: "flux",        label: "Flux Schnell",labelAr: "فلكس سريع",     badge: "Fal.ai",   desc: "Ultra-fast generation. Open source power.",       descAr: "توليد فائق السرعة، مدعوم بالمصدر المفتوح." },
];

const SIZES = [
  { id: "1024x1024", label: "1:1",  labelAr: "مربع",       icon: "◼" },
  { id: "1792x1024", label: "16:9", labelAr: "عرض",        icon: "▬" },
  { id: "1024x1792", label: "9:16", labelAr: "طولي",       icon: "▮" },
];

const PRESETS = [
  { id: "none",     label: "None",      labelAr: "بدون",        icon: "○" },
  { id: "khemet",   label: "Khemet",    labelAr: "كيميت",       icon: "𓂀" },
  { id: "pharaoh",  label: "Pharaoh",   labelAr: "فرعون",       icon: "𓁿" },
  { id: "papyrus",  label: "Papyrus",   labelAr: "بردي",        icon: "𓏜" },
  { id: "cosmos",   label: "Cosmos",    labelAr: "الكون",       icon: "✦" },
  { id: "warrior",  label: "Warrior",   labelAr: "محارب",       icon: "⚔" },
  { id: "oracle",   label: "Oracle",    labelAr: "عراف",        icon: "𓁢" },
];

const QUALITY_OPTIONS = [
  { id: "standard", label: "Standard", labelAr: "قياسي" },
  { id: "hd",       label: "HD",       labelAr: "دقة عالية" },
];

interface GeneratedImage {
  id: string;
  url: string;
  model: string;
  prompt: string;
  preset: string;
  size: string;
  timestamp: string;
}

export default function CreativeStudioPage() {
  const [lang] = useLanguage();
  const isAr = lang === "ar";

  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("dall-e-3");
  const [size, setSize] = useState("1024x1024");
  const [preset, setPreset] = useState("none");
  const [quality, setQuality] = useState("standard");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState<GeneratedImage[]>([]);
  const [activeImg, setActiveImg] = useState<GeneratedImage | null>(null);
  const [error, setError] = useState("");
  const promptRef = useRef<HTMLTextAreaElement>(null);

  const gold = "#D4AF37";
  const goldFaint = "rgba(212,175,55,0.06)";
  const goldBorder = "rgba(212,175,55,0.18)";
  const goldText = "rgba(212,175,55,0.5)";

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/creative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, model, size, quality, egyptianPreset: preset }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      const img: GeneratedImage = {
        id: Date.now().toString(),
        url: data.url,
        model: data.model,
        prompt: data.prompt,
        preset,
        size,
        timestamp: new Date().toLocaleTimeString(),
      };
      setGenerated(prev => [img, ...prev]);
      setActiveImg(img);
      // Save to gallery localStorage
      try {
        const gallery = JSON.parse(localStorage.getItem("orbit_gallery") || "[]");
        gallery.unshift({ id: img.id, heroSlug: "creative", agentName: "Creative Studio",
          prompt: img.prompt, output: img.url, type: "image", savedAt: new Date().toISOString(), starred: false });
        localStorage.setItem("orbit_gallery", JSON.stringify(gallery.slice(0, 100)));
      } catch { /* ignore */ }
    } catch {
      setError(isAr ? "فشل الاتصال بالخادم" : "Connection failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (img: GeneratedImage) => {
    const a = document.createElement("a");
    a.href = img.url;
    a.download = `khemet-${img.id}.jpg`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#d0c5af]" dir={isAr ? "rtl" : "ltr"}>

      {/* Header */}
      <div className="px-8 py-6 border-b" style={{ borderColor: "rgba(212,175,55,0.1)" }}>
        <p className="font-[Orbitron] text-[9px] tracking-[5px] uppercase mb-1" style={{ color: goldText }}>
          {isAr ? "المهارات المتقدمة" : "SUPER SKILLS"}
        </p>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-[Orbitron] text-3xl font-black tracking-tighter" style={{ color: gold }}>
              {isAr ? "الاستوديو الإبداعي" : "CREATIVE STUDIO"}
            </h1>
            <p className="font-[Rajdhani] text-sm mt-1" style={{ color: goldText }}>
              {isAr ? "توليد صور احترافية بأسلوب مصري أصيل — ثلاثة محركات ذكاء اصطناعي" : "Professional image generation with Egyptian heritage presets — 3 AI engines"}
            </p>
          </div>
          <Link href="/cinema" className="font-[Orbitron] text-[8px] tracking-[2px] uppercase px-4 py-2 transition-all"
            style={{ border: `1px solid ${goldBorder}`, color: goldText }}>
            {isAr ? "محرك السينما ←" : "→ CINEMA ENGINE"}
          </Link>
        </div>
      </div>

      <div className="flex h-[calc(100vh-132px)]">

        {/* ── Left control panel ── */}
        <div className="w-[340px] shrink-0 border-r overflow-y-auto p-6 flex flex-col gap-5"
          style={{ borderColor: "rgba(212,175,55,0.08)" }}>

          {/* Prompt */}
          <div>
            <label className="font-[Orbitron] text-[8px] tracking-[3px] uppercase block mb-2" style={{ color: goldText }}>
              {isAr ? "الوصف" : "PROMPT"}
            </label>
            <textarea
              ref={promptRef}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && e.metaKey) handleGenerate(); }}
              placeholder={isAr ? "صف الصورة التي تريد إنشاءها..." : "Describe the image you want to create..."}
              rows={5}
              className="w-full px-4 py-3 text-sm font-[Rajdhani] resize-none"
              style={{ background: goldFaint, border: `1px solid ${goldBorder}`, color: "#d0c5af", outline: "none" }}
            />
            <p className="font-mono text-[9px] mt-1" style={{ color: goldText }}>
              {isAr ? "Cmd+Enter للتوليد" : "Cmd+Enter to generate"}
            </p>
          </div>

          {/* Model */}
          <div>
            <label className="font-[Orbitron] text-[8px] tracking-[3px] uppercase block mb-2" style={{ color: goldText }}>
              {isAr ? "المحرك" : "ENGINE"}
            </label>
            <div className="flex flex-col gap-1.5">
              {MODELS.map(m => (
                <button key={m.id} onClick={() => setModel(m.id)}
                  className="text-left px-3 py-2.5 transition-all"
                  style={{
                    background: model === m.id ? "rgba(212,175,55,0.1)" : "transparent",
                    border: `1px solid ${model === m.id ? gold : goldBorder}`,
                  }}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-[Orbitron] text-[10px] font-bold" style={{ color: model === m.id ? gold : "#d0c5af" }}>
                      {isAr ? m.labelAr : m.label}
                    </span>
                    <span className="font-mono text-[8px] px-1.5 py-0.5" style={{ background: "rgba(212,175,55,0.1)", color: goldText }}>
                      {m.badge}
                    </span>
                  </div>
                  <p className="font-[Rajdhani] text-[11px]" style={{ color: goldText }}>
                    {isAr ? m.descAr : m.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Egyptian Preset */}
          <div>
            <label className="font-[Orbitron] text-[8px] tracking-[3px] uppercase block mb-2" style={{ color: goldText }}>
              {isAr ? "النمط المصري" : "EGYPTIAN PRESET"}
            </label>
            <div className="grid grid-cols-4 gap-1">
              {PRESETS.map(p => (
                <button key={p.id} onClick={() => setPreset(p.id)}
                  className="flex flex-col items-center gap-1 px-2 py-2 transition-all"
                  style={{
                    background: preset === p.id ? "rgba(212,175,55,0.12)" : "transparent",
                    border: `1px solid ${preset === p.id ? gold : goldBorder}`,
                  }}>
                  <span className="text-base">{p.icon}</span>
                  <span className="font-[Orbitron] text-[7px] tracking-wide uppercase" style={{ color: preset === p.id ? gold : goldText }}>
                    {isAr ? p.labelAr : p.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Size */}
          <div>
            <label className="font-[Orbitron] text-[8px] tracking-[3px] uppercase block mb-2" style={{ color: goldText }}>
              {isAr ? "النسبة" : "ASPECT RATIO"}
            </label>
            <div className="flex gap-2">
              {SIZES.map(s => (
                <button key={s.id} onClick={() => setSize(s.id)}
                  className="flex-1 flex flex-col items-center gap-1 py-2.5 transition-all"
                  style={{
                    background: size === s.id ? "rgba(212,175,55,0.12)" : "transparent",
                    border: `1px solid ${size === s.id ? gold : goldBorder}`,
                  }}>
                  <span className="text-lg" style={{ color: size === s.id ? gold : goldText }}>{s.icon}</span>
                  <span className="font-[Orbitron] text-[8px]" style={{ color: size === s.id ? gold : goldText }}>
                    {isAr ? s.labelAr : s.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Quality — DALL-E 3 only */}
          {model === "dall-e-3" && (
            <div>
              <label className="font-[Orbitron] text-[8px] tracking-[3px] uppercase block mb-2" style={{ color: goldText }}>
                {isAr ? "الجودة" : "QUALITY"}
              </label>
              <div className="flex gap-2">
                {QUALITY_OPTIONS.map(q => (
                  <button key={q.id} onClick={() => setQuality(q.id)}
                    className="flex-1 font-[Orbitron] text-[9px] tracking-[2px] uppercase py-2 transition-all"
                    style={{
                      background: quality === q.id ? "rgba(212,175,55,0.12)" : "transparent",
                      border: `1px solid ${quality === q.id ? gold : goldBorder}`,
                      color: quality === q.id ? gold : goldText,
                    }}>
                    {isAr ? q.labelAr : q.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Generate button */}
          <button onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full font-[Orbitron] text-[10px] tracking-[3px] uppercase py-4 transition-all disabled:opacity-40"
            style={{ background: "rgba(212,175,55,0.12)", border: `1px solid ${gold}`, color: gold }}>
            {isGenerating
              ? (isAr ? "⟳ جارٍ التوليد..." : "⟳ GENERATING...")
              : (isAr ? "✦ توليد الصورة" : "✦ GENERATE IMAGE")}
          </button>

          {error && (
            <p className="font-[Rajdhani] text-sm text-center" style={{ color: "#ef4444" }}>{error}</p>
          )}

          {/* History strip */}
          {generated.length > 1 && (
            <div>
              <p className="font-[Orbitron] text-[8px] tracking-[3px] uppercase mb-2" style={{ color: goldText }}>
                {isAr ? "السجل" : "HISTORY"}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {generated.slice(0, 8).map(img => (
                  <button key={img.id} onClick={() => setActiveImg(img)}
                    className="w-12 h-12 overflow-hidden transition-all"
                    style={{
                      border: `1px solid ${activeImg?.id === img.id ? gold : goldBorder}`,
                      outline: activeImg?.id === img.id ? `2px solid ${gold}` : "none",
                    }}>
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right canvas ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeImg ? (
            <>
              {/* Toolbar */}
              <div className="flex items-center gap-3 px-5 py-2.5 border-b shrink-0"
                style={{ borderColor: "rgba(212,175,55,0.08)", background: "#0d0d0d" }}>
                <div className="flex items-center gap-2 flex-1">
                  <span className="font-mono text-[9px]" style={{ color: goldText }}>{activeImg.model}</span>
                  <span style={{ color: goldText }}>·</span>
                  <span className="font-mono text-[9px]" style={{ color: goldText }}>{activeImg.size}</span>
                  {activeImg.preset !== "none" && (
                    <>
                      <span style={{ color: goldText }}>·</span>
                      <span className="font-mono text-[9px] uppercase" style={{ color: gold }}>
                        {PRESETS.find(p => p.id === activeImg.preset)?.label}
                      </span>
                    </>
                  )}
                </div>
                <button onClick={() => handleDownload(activeImg)}
                  className="font-[Orbitron] text-[8px] tracking-[2px] uppercase px-3 py-1.5 transition-all"
                  style={{ border: `1px solid ${goldBorder}`, color: goldText }}>
                  {isAr ? "تحميل" : "DOWNLOAD"}
                </button>
                <button onClick={() => {
                    setPrompt(activeImg.prompt.replace(/,\s*ancient Egyptian.*$/i, ""));
                  }}
                  className="font-[Orbitron] text-[8px] tracking-[2px] uppercase px-3 py-1.5 transition-all"
                  style={{ border: `1px solid ${goldBorder}`, color: goldText }}>
                  {isAr ? "إعادة استخدام" : "REUSE PROMPT"}
                </button>
              </div>

              {/* Image display */}
              <div className="flex-1 flex items-center justify-center p-6 overflow-hidden"
                style={{ background: "#080808" }}>
                <img
                  src={activeImg.url}
                  alt={activeImg.prompt}
                  className="max-h-full max-w-full object-contain"
                  style={{
                    border: `1px solid ${goldBorder}`,
                    boxShadow: `0 0 60px rgba(212,175,55,0.08)`,
                  }}
                />
              </div>

              {/* Prompt display */}
              <div className="px-5 py-3 border-t shrink-0" style={{ borderColor: "rgba(212,175,55,0.08)", background: "#0d0d0d" }}>
                <p className="font-[Rajdhani] text-xs leading-relaxed" style={{ color: "rgba(208,197,175,0.5)" }}>
                  {activeImg.prompt.length > 140 ? activeImg.prompt.slice(0, 140) + "..." : activeImg.prompt}
                </p>
              </div>
            </>
          ) : (
            /* Empty state */
            <div className="flex-1 flex flex-col items-center justify-center opacity-20">
              <div className="text-center">
                <div className="font-[Orbitron] text-8xl mb-6" style={{ color: gold }}>𓂀</div>
                <p className="font-[Orbitron] text-xs tracking-[6px] uppercase" style={{ color: gold }}>
                  {isAr ? "صورتك ستظهر هنا" : "YOUR IMAGE WILL APPEAR HERE"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
