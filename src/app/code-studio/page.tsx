"use client";

import { useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/hooks/useLanguage";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const TABS = ["ui", "app", "review"] as const;
type Tab = typeof TABS[number];

const COMPONENT_OPTIONS = [
  "Navigation Bar", "Hero Section", "Features Grid", "Pricing Table",
  "Testimonials", "FAQ Accordion", "Contact Form", "Footer",
  "Image Gallery", "Stats Counter", "Team Section", "CTA Banner",
  "Login Form", "Dashboard Layout", "Card Grid", "Timeline",
];

const QUICK_TASKS = [
  "ARCHITECTURE OVERVIEW", "FIND BUGS", "SECURITY AUDIT", "SUGGEST IMPROVEMENTS",
];

function CodeStudioContent() {
  const [lang] = useLanguage();
  const isAr = lang === "ar";
  const searchParams = useSearchParams();

  const initialTab = (searchParams.get("tab") as Tab) || "ui";
  const [activeTab, setActiveTab] = useState<Tab>(
    TABS.includes(initialTab) ? initialTab : "ui"
  );

  // ── UI BUILDER state ──
  const [description, setDescription] = useState("");
  const [style, setStyle] = useState("dark");
  const [complexity, setComplexity] = useState("standard");
  const [selectedComponents, setSelectedComponents] = useState<string[]>(["Navigation Bar", "Hero Section", "Features Grid"]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState("");
  const [uiView, setUiView] = useState<"preview" | "code">("preview");
  const [refinement, setRefinement] = useState("");
  const [uiHistory, setUiHistory] = useState<{ html: string; description: string; time: string }[]>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // ── APP BUILDER state ──
  const [appIdea, setAppIdea] = useState("");
  const [platform, setPlatform] = useState<"website" | "mobile">("website");
  const [isBuilding, setIsBuilding] = useState(false);
  const [builtApp, setBuiltApp] = useState<{ html?: string; spec?: string; idea: string } | null>(null);
  const [appView, setAppView] = useState<"preview" | "code">("preview");

  // ── CODE REVIEW state ──
  const [repoUrl, setRepoUrl] = useState("");
  const [reviewTask, setReviewTask] = useState("");
  const [selectedTask, setSelectedTask] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reviewResult, setReviewResult] = useState<{
    analysis: string;
    repoInfo: { name: string; stars: number; forks: number; language: string | null; description: string | null };
    fileCount: number;
    filesAnalyzed: number;
  } | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  const gold = "#D4AF37";
  const goldFaint = "rgba(212,175,55,0.06)";
  const goldBorder = "rgba(212,175,55,0.2)";
  const goldText = "rgba(212,175,55,0.5)";

  // ── HANDLERS ──
  const toggleComponent = (c: string) =>
    setSelectedComponents(prev =>
      prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
    );

  const handleGenerate = async () => {
    if (!description.trim() || isGenerating) return;
    setIsGenerating(true);
    try {
      const res = await fetch("/api/ui-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, style, complexity, components: selectedComponents }),
      });
      const data = await res.json();
      if (data.html) {
        setGeneratedHtml(data.html);
        setUiView("preview");
        setUiHistory(prev => [{ html: data.html, description: description.slice(0, 40), time: new Date().toLocaleTimeString() }, ...prev].slice(0, 5));
      }
    } catch (err) { console.error(err); }
    finally { setIsGenerating(false); }
  };

  const handleRefine = async () => {
    if (!refinement.trim() || !generatedHtml || isGenerating) return;
    setIsGenerating(true);
    try {
      const res = await fetch("/api/ui-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: `Take this existing HTML and improve it: ${refinement}\n\nExisting HTML:\n${generatedHtml}`, style, complexity }),
      });
      const data = await res.json();
      if (data.html) { setGeneratedHtml(data.html); setRefinement(""); }
    } catch (err) { console.error(err); }
    finally { setIsGenerating(false); }
  };

  const handleDownloadHtml = (html: string, filename: string) => {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const handleBuild = async () => {
    if (!appIdea.trim() || isBuilding) return;
    setIsBuilding(true); setBuiltApp(null);
    try {
      const res = await fetch("/api/sentinel/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appIdea, platform }),
      });
      const data = await res.json();
      if (data.result) {
        setBuiltApp({ html: platform === "website" ? data.result : undefined, spec: platform === "mobile" ? data.result : undefined, idea: appIdea });
        setAppView("preview");
      }
    } catch { /* handle error */ }
    finally { setIsBuilding(false); }
  };

  const handleAnalyze = async () => {
    if (!repoUrl.trim() || isAnalyzing) return;
    setIsAnalyzing(true); setReviewResult(null);
    const msgs = [
      isAr ? "⟳ جارٍ الاتصال بالمستودع..." : "⟳ Connecting to repository...",
      isAr ? "⟳ جارٍ تحليل الكود..." : "⟳ Analyzing code structure...",
      isAr ? "⟳ جارٍ تشغيل محرك الاستخبارات..." : "⟳ Running intelligence engine...",
    ];
    let idx = 0;
    setStatusMessage(msgs[idx]);
    const interval = setInterval(() => { idx = Math.min(idx + 1, msgs.length - 1); setStatusMessage(msgs[idx]); }, 3000);
    try {
      const res = await fetch("/api/sentinel/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl, task: reviewTask || selectedTask }),
      });
      const data = await res.json();
      if (data.analysis) setReviewResult(data);
    } catch { setStatusMessage(isAr ? "فشل الاتصال" : "Connection failed"); }
    finally { clearInterval(interval); setIsAnalyzing(false); setStatusMessage(""); }
  };

  // ── TAB LABELS ──
  const tabLabels: Record<Tab, string> = {
    ui: isAr ? "منشئ الواجهات" : "UI BUILDER",
    app: isAr ? "منشئ التطبيقات" : "APP BUILDER",
    review: isAr ? "مراجعة الكود" : "CODE REVIEW",
  };

  const tabDesc: Record<Tab, string> = {
    ui: isAr ? "أنشئ واجهات وصفحات ومكونات من وصف نصي" : "Generate interfaces, landing pages and components from a prompt",
    app: isAr ? "ابنِ تطبيقات كاملة من فكرة واحدة" : "Build complete apps from a single idea",
    review: isAr ? "حلّل مستودعات GitHub وافحص الكود" : "Analyze GitHub repositories and audit code",
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#d0c5af]" dir={isAr ? "rtl" : "ltr"}>

      {/* Header */}
      <div className="px-8 py-6 border-b" style={{ borderColor: "rgba(212,175,55,0.1)" }}>
        <p className="font-[Orbitron] text-[9px] tracking-[5px] uppercase mb-1" style={{ color: goldText }}>
          {isAr ? "المهارات المتقدمة" : "SUPER SKILLS"}
        </p>
        <div className="flex items-center gap-4">
          <div>
            <h1 className="font-[Orbitron] text-3xl font-black tracking-tighter" style={{ color: gold }}>
              {isAr ? "استوديو الكود" : "CODE STUDIO"}
            </h1>
            <p className="font-[Rajdhani] text-sm mt-1" style={{ color: goldText }}>
              {tabDesc[activeTab]}
            </p>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 mt-6">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="font-[Orbitron] text-[9px] tracking-[2px] uppercase px-5 py-2.5 transition-all"
              style={{
                background: activeTab === tab ? gold : "transparent",
                color: activeTab === tab ? "#0A0A0A" : goldText,
                border: `1px solid ${activeTab === tab ? gold : goldBorder}`,
                fontWeight: activeTab === tab ? 700 : 400,
              }}
            >
              {tabLabels[tab]}
            </button>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          TAB 1 — UI BUILDER
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "ui" && (
        <div className="flex h-[calc(100vh-200px)]">
          {/* Left panel */}
          <div className="w-[340px] shrink-0 border-r overflow-y-auto p-6 flex flex-col gap-5" style={{ borderColor: "rgba(212,175,55,0.08)" }}>

            <div>
              <label className="font-[Orbitron] text-[8px] tracking-[3px] uppercase block mb-2" style={{ color: goldText }}>
                {isAr ? "صف ما تريد بناءه" : "DESCRIBE WHAT TO BUILD"}
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder={isAr ? "صفحة هبوط لشركة ناشئة في مجال الذكاء الاصطناعي..." : "A dark landing page for an AI startup with hero section, features grid..."}
                rows={5}
                className="w-full px-4 py-3 text-sm font-[Rajdhani] resize-none"
                style={{ background: goldFaint, border: `1px solid ${goldBorder}`, color: "#d0c5af", outline: "none" }}
              />
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="font-[Orbitron] text-[8px] tracking-[3px] uppercase block mb-2" style={{ color: goldText }}>
                  {isAr ? "النمط" : "STYLE"}
                </label>
                <select value={style} onChange={e => setStyle(e.target.value)}
                  className="w-full px-3 py-2 text-sm"
                  style={{ background: "#111", border: `1px solid ${goldBorder}`, color: "#d0c5af" }}>
                  <option value="dark">{isAr ? "داكن" : "Dark"}</option>
                  <option value="light">{isAr ? "فاتح" : "Light"}</option>
                  <option value="glass">{isAr ? "زجاجي" : "Glass"}</option>
                  <option value="egyptian">{isAr ? "مصري" : "Egyptian"}</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="font-[Orbitron] text-[8px] tracking-[3px] uppercase block mb-2" style={{ color: goldText }}>
                  {isAr ? "التعقيد" : "COMPLEXITY"}
                </label>
                <select value={complexity} onChange={e => setComplexity(e.target.value)}
                  className="w-full px-3 py-2 text-sm"
                  style={{ background: "#111", border: `1px solid ${goldBorder}`, color: "#d0c5af" }}>
                  <option value="simple">{isAr ? "بسيط" : "Simple"}</option>
                  <option value="standard">{isAr ? "قياسي" : "Standard"}</option>
                  <option value="advanced">{isAr ? "متقدم" : "Advanced"}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-[Orbitron] text-[8px] tracking-[3px] uppercase block mb-2" style={{ color: goldText }}>
                {isAr ? "المكونات" : "COMPONENTS"}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {COMPONENT_OPTIONS.map(c => (
                  <button key={c} onClick={() => toggleComponent(c)}
                    className="font-[Rajdhani] text-[11px] px-2 py-1 transition-all"
                    style={{
                      background: selectedComponents.includes(c) ? "rgba(212,175,55,0.15)" : "transparent",
                      border: `1px solid ${selectedComponents.includes(c) ? gold : goldBorder}`,
                      color: selectedComponents.includes(c) ? gold : goldText,
                    }}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleGenerate} disabled={isGenerating || !description.trim()}
              className="w-full font-[Orbitron] text-[10px] tracking-[3px] uppercase py-3 transition-all disabled:opacity-40"
              style={{ background: "rgba(212,175,55,0.12)", border: `1px solid ${gold}`, color: gold }}>
              {isGenerating ? (isAr ? "⟳ جارٍ التوليد..." : "⟳ GENERATING...") : (isAr ? "✦ توليد الواجهة" : "✦ GENERATE INTERFACE")}
            </button>

            {generatedHtml && (
              <div className="flex flex-col gap-2">
                <textarea value={refinement} onChange={e => setRefinement(e.target.value)}
                  placeholder={isAr ? "اجعل الزر ذهبياً..." : "Make the button gold..."}
                  rows={2} className="w-full px-3 py-2 text-sm font-[Rajdhani] resize-none"
                  style={{ background: goldFaint, border: `1px solid ${goldBorder}`, color: "#d0c5af", outline: "none" }} />
                <button onClick={handleRefine} disabled={isGenerating || !refinement.trim()}
                  className="w-full font-[Orbitron] text-[9px] tracking-[2px] uppercase py-2 transition-all disabled:opacity-40"
                  style={{ background: "transparent", border: `1px solid ${goldBorder}`, color: goldText }}>
                  {isAr ? "تحسين" : "REFINE"}
                </button>
                <button onClick={() => handleDownloadHtml(generatedHtml, "khemet-ui.html")}
                  className="w-full font-[Orbitron] text-[9px] tracking-[2px] uppercase py-2 transition-all"
                  style={{ background: "transparent", border: `1px solid ${goldBorder}`, color: goldText }}>
                  {isAr ? "تحميل HTML" : "DOWNLOAD HTML"}
                </button>
              </div>
            )}

            {uiHistory.length > 0 && (
              <div>
                <p className="font-[Orbitron] text-[8px] tracking-[3px] uppercase mb-2" style={{ color: goldText }}>
                  {isAr ? "السجل" : "HISTORY"}
                </p>
                <div className="flex flex-col gap-1">
                  {uiHistory.map((h, i) => (
                    <button key={i} onClick={() => { setGeneratedHtml(h.html); setUiView("preview"); }}
                      className="text-left px-3 py-2 transition-all"
                      style={{ background: goldFaint, border: `1px solid ${goldBorder}` }}>
                      <p className="font-[Rajdhani] text-xs truncate" style={{ color: "#d0c5af" }}>{h.description}</p>
                      <p className="font-mono text-[9px]" style={{ color: goldText }}>{h.time}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right panel — preview */}
          <div className="flex-1 flex flex-col">
            {generatedHtml ? (
              <>
                <div className="flex items-center gap-2 px-4 py-2 border-b" style={{ borderColor: "rgba(212,175,55,0.08)", background: "#0d0d0d" }}>
                  {(["preview", "code"] as const).map(v => (
                    <button key={v} onClick={() => setUiView(v)}
                      className="font-[Orbitron] text-[8px] tracking-[2px] uppercase px-3 py-1.5 transition-all"
                      style={{ background: uiView === v ? gold : "transparent", color: uiView === v ? "#0A0A0A" : goldText, border: `1px solid ${uiView === v ? gold : goldBorder}` }}>
                      {v === "preview" ? (isAr ? "معاينة" : "PREVIEW") : (isAr ? "كود" : "CODE")}
                    </button>
                  ))}
                </div>
                {uiView === "preview" ? (
                  <iframe ref={iframeRef} srcDoc={generatedHtml} className="flex-1 w-full border-0"
                    title="UI Preview" sandbox="allow-scripts" style={{ background: "#fff" }} />
                ) : (
                  <pre className="flex-1 overflow-auto p-6 text-xs font-mono"
                    style={{ background: "#0d0d0d", color: "#d0c5af" }}>{generatedHtml}</pre>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center opacity-20">
                <div className="text-center">
                  <div className="font-[Orbitron] text-6xl mb-4" style={{ color: gold }}>&#x2756;</div>
                  <p className="font-[Orbitron] text-xs tracking-widest uppercase" style={{ color: gold }}>
                    {isAr ? "سيظهر العرض هنا" : "PREVIEW WILL APPEAR HERE"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          TAB 2 — APP BUILDER
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "app" && (
        <div className="flex h-[calc(100vh-200px)]">
          {/* Left panel */}
          <div className="w-[340px] shrink-0 border-r overflow-y-auto p-6 flex flex-col gap-5" style={{ borderColor: "rgba(212,175,55,0.08)" }}>
            <div>
              <label className="font-[Orbitron] text-[8px] tracking-[3px] uppercase block mb-2" style={{ color: goldText }}>
                {isAr ? "فكرة التطبيق" : "APP IDEA"}
              </label>
              <textarea value={appIdea} onChange={e => setAppIdea(e.target.value)}
                placeholder={isAr ? "تطبيق لإدارة المهام مع ميزة الفريق..." : "A task management app with team collaboration features..."}
                rows={6} className="w-full px-4 py-3 text-sm font-[Rajdhani] resize-none"
                style={{ background: goldFaint, border: `1px solid ${goldBorder}`, color: "#d0c5af", outline: "none" }} />
            </div>

            <div>
              <label className="font-[Orbitron] text-[8px] tracking-[3px] uppercase block mb-2" style={{ color: goldText }}>
                {isAr ? "المنصة" : "PLATFORM"}
              </label>
              <div className="flex gap-2">
                {(["website", "mobile"] as const).map(p => (
                  <button key={p} onClick={() => setPlatform(p)}
                    className="flex-1 font-[Orbitron] text-[9px] tracking-[2px] uppercase py-2.5 transition-all"
                    style={{
                      background: platform === p ? "rgba(212,175,55,0.15)" : "transparent",
                      border: `1px solid ${platform === p ? gold : goldBorder}`,
                      color: platform === p ? gold : goldText,
                    }}>
                    {p === "website" ? (isAr ? "موقع ويب" : "WEBSITE") : (isAr ? "موبايل" : "MOBILE")}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleBuild} disabled={isBuilding || !appIdea.trim()}
              className="w-full font-[Orbitron] text-[10px] tracking-[3px] uppercase py-3 transition-all disabled:opacity-40"
              style={{ background: "rgba(212,175,55,0.12)", border: `1px solid ${gold}`, color: gold }}>
              {isBuilding ? (isAr ? "⟳ جارٍ البناء..." : "⟳ BUILDING APP...") : (isAr ? "✦ بناء التطبيق" : "✦ BUILD APP")}
            </button>

            {builtApp?.html && (
              <button onClick={() => handleDownloadHtml(builtApp.html!, "khemet-app.html")}
                className="w-full font-[Orbitron] text-[9px] tracking-[2px] uppercase py-2 transition-all"
                style={{ background: "transparent", border: `1px solid ${goldBorder}`, color: goldText }}>
                {isAr ? "تحميل التطبيق" : "DOWNLOAD APP"}
              </button>
            )}
          </div>

          {/* Right panel */}
          <div className="flex-1 flex flex-col">
            {builtApp ? (
              <>
                <div className="flex items-center gap-2 px-4 py-2 border-b" style={{ borderColor: "rgba(212,175,55,0.08)", background: "#0d0d0d" }}>
                  {(["preview", "code"] as const).map(v => (
                    <button key={v} onClick={() => setAppView(v)}
                      className="font-[Orbitron] text-[8px] tracking-[2px] uppercase px-3 py-1.5 transition-all"
                      style={{ background: appView === v ? gold : "transparent", color: appView === v ? "#0A0A0A" : goldText, border: `1px solid ${appView === v ? gold : goldBorder}` }}>
                      {v === "preview" ? (isAr ? "معاينة" : "PREVIEW") : (isAr ? "المواصفات" : "SPEC")}
                    </button>
                  ))}
                </div>
                {appView === "preview" && builtApp.html ? (
                  <iframe srcDoc={builtApp.html} className="flex-1 w-full border-0"
                    title="App Preview" sandbox="allow-scripts" style={{ background: "#fff" }} />
                ) : (
                  <pre className="flex-1 overflow-auto p-6 text-sm font-[Rajdhani]"
                    style={{ background: "#0d0d0d", color: "#d0c5af", whiteSpace: "pre-wrap" }}>
                    {builtApp.html || builtApp.spec}
                  </pre>
                )}
              </>
            ) : isBuilding ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-6" style={{ borderColor: `${gold} transparent` }} />
                  <p className="font-[Orbitron] text-[10px] tracking-[3px] uppercase" style={{ color: gold }}>
                    {isAr ? "جارٍ بناء التطبيق..." : "BUILDING YOUR APP..."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center opacity-20">
                <div className="text-center">
                  <div className="font-[Orbitron] text-6xl mb-4" style={{ color: gold }}>&#x2756;</div>
                  <p className="font-[Orbitron] text-xs tracking-widest uppercase" style={{ color: gold }}>
                    {isAr ? "سيظهر تطبيقك هنا" : "YOUR APP WILL APPEAR HERE"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          TAB 3 — CODE REVIEW
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "review" && (
        <div className="flex h-[calc(100vh-200px)]">
          {/* Left panel */}
          <div className="w-[340px] shrink-0 border-r overflow-y-auto p-6 flex flex-col gap-5" style={{ borderColor: "rgba(212,175,55,0.08)" }}>
            <div>
              <label className="font-[Orbitron] text-[8px] tracking-[3px] uppercase block mb-2" style={{ color: goldText }}>
                {isAr ? "رابط المستودع" : "REPOSITORY URL"}
              </label>
              <input type="text" value={repoUrl} onChange={e => setRepoUrl(e.target.value)}
                placeholder="https://github.com/owner/repo"
                className="w-full px-4 py-2.5 text-sm font-mono"
                style={{ background: goldFaint, border: `1px solid ${goldBorder}`, color: "#d0c5af", outline: "none" }} />
            </div>

            <div>
              <label className="font-[Orbitron] text-[8px] tracking-[3px] uppercase block mb-2" style={{ color: goldText }}>
                {isAr ? "مهام سريعة" : "QUICK TASKS"}
              </label>
              <div className="flex flex-col gap-1.5">
                {QUICK_TASKS.map(t => (
                  <button key={t} onClick={() => { setSelectedTask(t); setReviewTask(t); }}
                    className="text-left font-[Orbitron] text-[8px] tracking-[2px] uppercase px-3 py-2 transition-all"
                    style={{
                      background: selectedTask === t ? "rgba(212,175,55,0.12)" : "transparent",
                      border: `1px solid ${selectedTask === t ? gold : goldBorder}`,
                      color: selectedTask === t ? gold : goldText,
                    }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-[Orbitron] text-[8px] tracking-[3px] uppercase block mb-2" style={{ color: goldText }}>
                {isAr ? "أو أدخل مهمتك" : "OR CUSTOM TASK"}
              </label>
              <textarea value={reviewTask} onChange={e => { setReviewTask(e.target.value); setSelectedTask(""); }}
                placeholder={isAr ? "ابحث عن ثغرات أمنية في منطق المصادقة..." : "Look for security vulnerabilities in the auth logic..."}
                rows={3} className="w-full px-4 py-3 text-sm font-[Rajdhani] resize-none"
                style={{ background: goldFaint, border: `1px solid ${goldBorder}`, color: "#d0c5af", outline: "none" }} />
            </div>

            <button onClick={handleAnalyze} disabled={isAnalyzing || !repoUrl.trim()}
              className="w-full font-[Orbitron] text-[10px] tracking-[3px] uppercase py-3 transition-all disabled:opacity-40"
              style={{ background: "rgba(212,175,55,0.12)", border: `1px solid ${gold}`, color: gold }}>
              {isAnalyzing ? (isAr ? "⟳ جارٍ التحليل..." : "⟳ ANALYZING...") : (isAr ? "✦ تحليل المستودع" : "✦ ANALYZE REPOSITORY")}
            </button>

            {statusMessage && (
              <p className="font-[Orbitron] text-[9px] tracking-[2px] text-center" style={{ color: gold }}>
                {statusMessage}
              </p>
            )}
          </div>

          {/* Right panel — results */}
          <div className="flex-1 overflow-y-auto p-6">
            {reviewResult ? (
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-6 p-4" style={{ background: goldFaint, border: `1px solid ${goldBorder}` }}>
                  <div className="text-center">
                    <p className="font-[Orbitron] text-2xl font-black" style={{ color: gold }}>{reviewResult.repoInfo.stars}</p>
                    <p className="font-[Orbitron] text-[8px] tracking-[2px] uppercase" style={{ color: goldText }}>Stars</p>
                  </div>
                  <div className="text-center">
                    <p className="font-[Orbitron] text-2xl font-black" style={{ color: gold }}>{reviewResult.repoInfo.forks}</p>
                    <p className="font-[Orbitron] text-[8px] tracking-[2px] uppercase" style={{ color: goldText }}>Forks</p>
                  </div>
                  <div className="text-center">
                    <p className="font-[Orbitron] text-2xl font-black" style={{ color: gold }}>{reviewResult.filesAnalyzed}</p>
                    <p className="font-[Orbitron] text-[8px] tracking-[2px] uppercase" style={{ color: goldText }}>Files</p>
                  </div>
                  <div>
                    <p className="font-[Orbitron] text-sm font-bold" style={{ color: gold }}>{reviewResult.repoInfo.name}</p>
                    <p className="font-[Rajdhani] text-xs" style={{ color: goldText }}>{reviewResult.repoInfo.language}</p>
                    <p className="font-[Rajdhani] text-xs mt-1" style={{ color: "rgba(208,197,175,0.6)" }}>{reviewResult.repoInfo.description}</p>
                  </div>
                </div>
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({children}) => <h1 className="font-[Orbitron] text-lg font-bold mb-3" style={{ color: gold }}>{children}</h1>,
                      h2: ({children}) => <h2 className="font-[Orbitron] text-sm font-bold mb-2 mt-6" style={{ color: gold }}>{children}</h2>,
                      h3: ({children}) => <h3 className="font-[Orbitron] text-xs font-bold mb-2 mt-4" style={{ color: "rgba(212,175,55,0.8)" }}>{children}</h3>,
                      p: ({children}) => <p className="font-[Rajdhani] text-sm mb-3 leading-relaxed" style={{ color: "#d0c5af" }}>{children}</p>,
                      li: ({children}) => <li className="font-[Rajdhani] text-sm mb-1" style={{ color: "#d0c5af" }}>✦ {children}</li>,
                      code: ({children}) => <code className="px-1.5 py-0.5 text-xs font-mono" style={{ background: "rgba(212,175,55,0.1)", color: gold }}>{children}</code>,
                      pre: ({children}) => <pre className="p-4 overflow-x-auto text-xs font-mono mb-4" style={{ background: "#0d0d0d", border: `1px solid ${goldBorder}` }}>{children}</pre>,
                      strong: ({children}) => <strong style={{ color: gold }}>{children}</strong>,
                    }}>
                    {reviewResult.analysis}
                  </ReactMarkdown>
                </div>
              </div>
            ) : !isAnalyzing ? (
              <div className="h-full flex items-center justify-center opacity-20">
                <div className="text-center">
                  <div className="font-[Orbitron] text-6xl mb-4" style={{ color: gold }}>&#x2756;</div>
                  <p className="font-[Orbitron] text-xs tracking-widest uppercase" style={{ color: gold }}>
                    {isAr ? "سيظهر تحليل الكود هنا" : "CODE ANALYSIS WILL APPEAR HERE"}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CodeStudioPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="font-[Orbitron] text-[#D4AF37] text-xs tracking-widest animate-pulse">LOADING CODE STUDIO...</div>
      </div>
    }>
      <CodeStudioContent />
    </Suspense>
  );
}
