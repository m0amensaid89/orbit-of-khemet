"use client";

import { useState, useRef } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const THINKING_DEPTHS = [
  { id: "thorough",      label: "THOROUGH",      labelAr: "شامل",         tokens: 8000,  desc: "Deep analysis with full reasoning chain",   descAr: "تحليل عميق مع سلسلة تفكير كاملة",    badge: "8K"  },
  { id: "exhaustive",    label: "EXHAUSTIVE",     labelAr: "مستفيض",       tokens: 16000, desc: "Maximum depth. Explores every angle.",       descAr: "أقصى عمق. يستكشف كل الزوايا.",        badge: "16K" },
  { id: "ultra",         label: "ULTRA",          labelAr: "فائق",         tokens: 32000, desc: "Research-grade reasoning. Takes longer.",    descAr: "تفكير بمستوى البحث العلمي. يستغرق وقتاً.", badge: "32K" },
];

const THINKING_PROMPTS = [
  { en: "Analyze the first principles behind this problem:",       ar: "حلّل المبادئ الأساسية لهذه المسألة:" },
  { en: "What are the strongest counterarguments to this idea?",   ar: "ما هي أقوى الحجج المضادة لهذه الفكرة؟" },
  { en: "Build a complete mental model of this system:",           ar: "ابنِ نموذجاً ذهنياً كاملاً لهذا النظام:" },
  { en: "What would a world-class expert think about this?",       ar: "كيف سيفكر خبير من الطراز العالمي في هذا؟" },
  { en: "Identify hidden assumptions and challenge each one:",     ar: "حدّد الافتراضات المخفية وتحدَّ كل واحدة:" },
];

interface ThinkResult {
  answer: string;
  thinkingTokens?: number;
  model: string;
  depth: string;
  duration: number;
}

export default function DeepThinkPage() {
  const [lang] = useLanguage();
  const isAr = lang === "ar";

  const [query, setQuery] = useState("");
  const [depth, setDepth] = useState("thorough");
  const [isThinking, setIsThinking] = useState(false);
  const [result, setResult] = useState<ThinkResult | null>(null);
  const [thinkingPhase, setThinkingPhase] = useState("");
  const [error, setError] = useState("");
  const [history, setHistory] = useState<{ query: string; result: ThinkResult }[]>([]);
  const phaseRef = useRef<NodeJS.Timeout | null>(null);

  const gold = "#D4AF37";
  const goldFaint = "rgba(212,175,55,0.06)";
  const goldBorder = "rgba(212,175,55,0.18)";
  const goldText = "rgba(212,175,55,0.5)";
  const selectedDepth = THINKING_DEPTHS.find(d => d.id === depth) || THINKING_DEPTHS[0];

  const THINKING_PHASES_EN = [
    "Activating deep reasoning matrix...",
    "Scanning problem space...",
    "Building mental model...",
    "Challenging assumptions...",
    "Synthesizing insight chains...",
    "Validating conclusions...",
    "Composing final analysis...",
  ];
  const THINKING_PHASES_AR = [
    "تفعيل مصفوفة التفكير العميق...",
    "مسح فضاء المشكلة...",
    "بناء النموذج الذهني...",
    "تحدّي الافتراضات...",
    "تركيب سلاسل الاستبصار...",
    "التحقق من الاستنتاجات...",
    "صياغة التحليل النهائي...",
  ];

  const startThinking = async () => {
    if (!query.trim() || isThinking) return;
    setIsThinking(true);
    setResult(null);
    setError("");
    const phases = isAr ? THINKING_PHASES_AR : THINKING_PHASES_EN;
    let phaseIdx = 0;
    setThinkingPhase(phases[0]);
    phaseRef.current = setInterval(() => {
      phaseIdx = (phaseIdx + 1) % phases.length;
      setThinkingPhase(phases[phaseIdx]);
    }, 2800);

    const startTime = Date.now();
    try {
      const tokenMap: Record<string, number> = { thorough: 8000, exhaustive: 16000, ultra: 32000 };
      const res = await fetch("/api/deep-think", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, depth, thinkingTokens: tokenMap[depth] }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      const r: ThinkResult = {
        answer: data.answer,
        thinkingTokens: data.thinkingTokens,
        model: data.model || "Claude Opus",
        depth,
        duration: Math.round((Date.now() - startTime) / 1000),
      };
      setResult(r);
      setHistory(prev => [{ query, result: r }, ...prev].slice(0, 10));
    } catch {
      setError(isAr ? "فشل الاتصال بالخادم" : "Server connection failed");
    } finally {
      if (phaseRef.current) clearInterval(phaseRef.current);
      setIsThinking(false);
      setThinkingPhase("");
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#d0c5af]" dir={isAr ? "rtl" : "ltr"}>

      {/* Header */}
      <div className="px-8 py-6 border-b" style={{ borderColor: "rgba(212,175,55,0.1)" }}>
        <p className="font-[Orbitron] text-[9px] tracking-[5px] uppercase mb-1" style={{ color: goldText }}>
          {isAr ? "المهارات المتقدمة" : "SUPER SKILLS"}
        </p>
        <h1 className="font-[Orbitron] text-3xl font-black tracking-tighter" style={{ color: gold }}>
          {isAr ? "التفكير العميق" : "DEEP THINK"}
        </h1>
        <p className="font-[Rajdhani] text-sm mt-1" style={{ color: goldText }}>
          {isAr
            ? "محرك استدلال متقدم — كلود أوبوس مع ميزانية تفكير موسّعة حتى 32K رمز"
            : "Extended reasoning engine — Claude Opus with up to 32K thinking tokens"}
        </p>
      </div>

      <div className="flex h-[calc(100vh-132px)]">

        {/* Left panel */}
        <div className="w-[340px] shrink-0 border-r overflow-y-auto p-6 flex flex-col gap-5"
          style={{ borderColor: "rgba(212,175,55,0.08)" }}>

          {/* Query */}
          <div>
            <label className="font-[Orbitron] text-[8px] tracking-[3px] uppercase block mb-2" style={{ color: goldText }}>
              {isAr ? "المسألة" : "QUESTION OR PROBLEM"}
            </label>
            <textarea value={query} onChange={e => setQuery(e.target.value)}
              placeholder={isAr ? "اطرح مسألتك للتحليل العميق..." : "Ask a question or describe a problem for deep analysis..."}
              rows={6}
              className="w-full px-4 py-3 text-sm font-[Rajdhani] resize-none"
              style={{ background: goldFaint, border: `1px solid ${goldBorder}`, color: "#d0c5af", outline: "none" }} />
          </div>

          {/* Starter prompts */}
          <div>
            <label className="font-[Orbitron] text-[8px] tracking-[3px] uppercase block mb-2" style={{ color: goldText }}>
              {isAr ? "بدايات جاهزة" : "STARTER PROMPTS"}
            </label>
            <div className="flex flex-col gap-1">
              {THINKING_PROMPTS.map((p, i) => (
                <button key={i}
                  onClick={() => setQuery(prev => (isAr ? p.ar : p.en) + " " + prev)}
                  className="text-left px-3 py-2 transition-all"
                  style={{ background: goldFaint, border: `1px solid ${goldBorder}` }}>
                  <p className="font-[Rajdhani] text-xs" style={{ color: "rgba(208,197,175,0.7)" }}>
                    {isAr ? p.ar : p.en}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Depth selection */}
          <div>
            <label className="font-[Orbitron] text-[8px] tracking-[3px] uppercase block mb-2" style={{ color: goldText }}>
              {isAr ? "عمق التفكير" : "THINKING DEPTH"}
            </label>
            <div className="flex flex-col gap-1.5">
              {THINKING_DEPTHS.map(d => (
                <button key={d.id} onClick={() => setDepth(d.id)}
                  className="text-left px-3 py-2.5 transition-all"
                  style={{
                    background: depth === d.id ? "rgba(212,175,55,0.1)" : "transparent",
                    border: `1px solid ${depth === d.id ? gold : goldBorder}`,
                  }}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-[Orbitron] text-[10px] font-bold" style={{ color: depth === d.id ? gold : "#d0c5af" }}>
                      {isAr ? d.labelAr : d.label}
                    </span>
                    <span className="font-mono text-[9px] px-1.5 py-0.5" style={{ background: "rgba(212,175,55,0.1)", color: goldText }}>
                      {d.badge}
                    </span>
                  </div>
                  <p className="font-[Rajdhani] text-[11px]" style={{ color: goldText }}>
                    {isAr ? d.descAr : d.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Think button */}
          <button onClick={startThinking} disabled={isThinking || !query.trim()}
            className="w-full font-[Orbitron] text-[10px] tracking-[3px] uppercase py-4 transition-all disabled:opacity-40"
            style={{ background: "rgba(212,175,55,0.12)", border: `1px solid ${gold}`, color: gold }}>
            {isThinking
              ? (isAr ? "⟳ جارٍ التفكير العميق..." : "⟳ DEEP THINKING...")
              : (isAr ? "✦ ابدأ التفكير العميق" : "✦ START DEEP THINK")}
          </button>

          {error && <p className="font-[Rajdhani] text-sm text-center" style={{ color: "#ef4444" }}>{error}</p>}

          {/* History */}
          {history.length > 0 && (
            <div>
              <label className="font-[Orbitron] text-[8px] tracking-[3px] uppercase block mb-2" style={{ color: goldText }}>
                {isAr ? "السجل" : "HISTORY"}
              </label>
              <div className="flex flex-col gap-1">
                {history.slice(0, 5).map((h, i) => (
                  <button key={i}
                    onClick={() => { setQuery(h.query); setResult(h.result); }}
                    className="text-left px-3 py-2 transition-all"
                    style={{ background: goldFaint, border: `1px solid ${goldBorder}` }}>
                    <p className="font-[Rajdhani] text-xs truncate" style={{ color: "#d0c5af" }}>
                      {h.query.slice(0, 40)}...
                    </p>
                    <p className="font-mono text-[9px] mt-0.5" style={{ color: goldText }}>
                      {h.result.duration}s · {h.result.depth}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right — result canvas */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {isThinking ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-8">
              {/* Animated thinking indicator */}
              <div className="relative">
                <div className="w-24 h-24 border border-t-transparent rounded-full animate-spin"
                  style={{ borderColor: `${gold} transparent` }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="font-[Orbitron] text-2xl" style={{ color: gold }}>𓂀</div>
                </div>
              </div>
              <div className="text-center max-w-sm">
                <p className="font-[Orbitron] text-xs tracking-[3px] uppercase mb-3" style={{ color: gold }}>
                  {isAr ? "التفكير العميق نشط" : "DEEP THINKING ACTIVE"}
                </p>
                <p className="font-[Rajdhani] text-sm" style={{ color: goldText }}>
                  {thinkingPhase}
                </p>
                <p className="font-mono text-[10px] mt-2" style={{ color: "rgba(212,175,55,0.3)" }}>
                  {isAr ? `${selectedDepth.tokens.toLocaleString()} رمز تفكير` : `${selectedDepth.tokens.toLocaleString()} thinking tokens`}
                </p>
              </div>
            </div>
          ) : result ? (
            <>
              {/* Result toolbar */}
              <div className="flex items-center gap-4 px-5 py-2.5 border-b shrink-0"
                style={{ borderColor: "rgba(212,175,55,0.08)", background: "#0d0d0d" }}>
                <div className="flex items-center gap-3 flex-1">
                  <span className="font-mono text-[9px]" style={{ color: goldText }}>{result.model}</span>
                  <span style={{ color: goldText }}>·</span>
                  <span className="font-mono text-[9px] uppercase" style={{ color: gold }}>{result.depth}</span>
                  <span style={{ color: goldText }}>·</span>
                  <span className="font-mono text-[9px]" style={{ color: goldText }}>{result.duration}s</span>
                  {result.thinkingTokens && (
                    <>
                      <span style={{ color: goldText }}>·</span>
                      <span className="font-mono text-[9px]" style={{ color: goldText }}>
                        {result.thinkingTokens.toLocaleString()} {isAr ? "رمز" : "tokens"}
                      </span>
                    </>
                  )}
                </div>
                <button onClick={() => navigator.clipboard.writeText(result.answer)}
                  className="font-[Orbitron] text-[8px] tracking-[2px] uppercase px-3 py-1.5"
                  style={{ border: `1px solid ${goldBorder}`, color: goldText }}>
                  {isAr ? "نسخ" : "COPY"}
                </button>
              </div>

              {/* Result content */}
              <div className="flex-1 overflow-y-auto p-8">
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({children}) => <h1 className="font-[Orbitron] text-xl font-bold mb-4" style={{ color: gold }}>{children}</h1>,
                      h2: ({children}) => <h2 className="font-[Orbitron] text-sm font-bold mb-3 mt-8" style={{ color: gold }}>{children}</h2>,
                      h3: ({children}) => <h3 className="font-[Orbitron] text-xs font-bold mb-2 mt-6" style={{ color: "rgba(212,175,55,0.8)" }}>{children}</h3>,
                      p: ({children}) => <p className="font-[Rajdhani] text-base mb-4 leading-relaxed" style={{ color: "#d0c5af" }}>{children}</p>,
                      li: ({children}) => <li className="font-[Rajdhani] text-sm mb-2" style={{ color: "#d0c5af" }}>▸ {children}</li>,
                      ul: ({children}) => <ul className="mb-4 space-y-1">{children}</ul>,
                      ol: ({children}) => <ol className="mb-4 space-y-1 list-decimal list-inside">{children}</ol>,
                      blockquote: ({children}) => (
                        <blockquote className="px-4 py-3 my-4" style={{ borderLeft: `3px solid ${gold}`, background: "rgba(212,175,55,0.04)" }}>
                          {children}
                        </blockquote>
                      ),
                      code: ({children}) => <code className="px-1.5 py-0.5 text-xs font-mono" style={{ background: "rgba(212,175,55,0.1)", color: gold }}>{children}</code>,
                      strong: ({children}) => <strong style={{ color: gold }}>{children}</strong>,
                    }}>
                    {result.answer}
                  </ReactMarkdown>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center opacity-20">
              <div className="text-center">
                <div className="font-[Orbitron] text-8xl mb-6" style={{ color: gold }}>𓂀</div>
                <p className="font-[Orbitron] text-xs tracking-[6px] uppercase" style={{ color: gold }}>
                  {isAr ? "جاهز للتفكير العميق" : "READY FOR DEEP THOUGHT"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
