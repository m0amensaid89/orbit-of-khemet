"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { Globe, Loader2, CheckCircle, ExternalLink } from "lucide-react";

/* ─── Types ─── */
interface BrowserResult {
  success: boolean; task: string;
  visitedUrls?: { url: string; title: string }[];
  steps?: string[]; answer?: string;
  finalUrl?: string; finalTitle?: string; error?: string;
}

type ControlMode = "read" | "control";

/* ─── Constants ─── */
const QUICK_CMDS = [
  { id: "scroll_down", label: "Scroll Down", labelAr: "تمرير لأسفل" },
  { id: "scroll_up",   label: "Scroll Up",   labelAr: "تمرير لأعلى" },
  { id: "back",        label: "Go Back",     labelAr: "رجوع" },
];

export default function BrowserPage() {
  const [lang] = useLanguage();
  const isAr = lang === "ar";

  /* ─── Shared ─── */
  const [mode, setMode] = useState<ControlMode>("read");

  /* ─── READ mode ─── */
  const [task, setTask] = useState("");
  const [startUrl, setStartUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BrowserResult | null>(null);
  const [activeUrl, setActiveUrl] = useState("");

  /* ─── TAKE CONTROL mode ─── */
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [liveUrl, setLiveUrl] = useState<string | null>(null);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [navUrl, setNavUrl] = useState("");
  const [clickSel, setClickSel] = useState("");
  const [typeSel, setTypeSel] = useState("");
  const [typeText, setTypeText] = useState("");
  const [sessionStatus, setSessionStatus] = useState<"idle"|"starting"|"active"|"closing">("idle");
  const [actionLog, setActionLog] = useState<string[]>([]);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const gold = "#D4AF37";
  const goldFaint = "rgba(212,175,55,0.06)";
  const goldBorder = "rgba(212,175,55,0.18)";
  const goldText = "rgba(212,175,55,0.5)";

  /* ─── Screenshot polling ─── */
  const startPolling = useCallback((sid: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch("/api/browser/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "screenshot", sessionId: sid }),
        });
        const data = await res.json();
        if (data.screenshot) setScreenshot(data.screenshot);
      } catch { /* continue */ }
    }, 3000);
  }, []);

  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  /* ─── Session controls ─── */
  const startSession = async () => {
    setSessionStatus("starting");
    setActionLog(["Starting browser session..."]);
    try {
      const res = await fetch("/api/browser/session", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", url: navUrl || undefined }),
      });
      const data = await res.json();
      if (data.error) {
        setActionLog(prev => [...prev, "Error: " + data.error]);
        setSessionStatus("idle"); return;
      }
      setSessionId(data.sessionId);
      setLiveUrl(data.liveViewUrl || null);
      setSessionStatus("active");
      setActionLog(prev => [...prev, "Session active: " + data.sessionId.slice(0, 8)]);
      startPolling(data.sessionId);
    } catch {
      setActionLog(prev => [...prev, "Connection failed"]);
      setSessionStatus("idle");
    }
  };

  const closeSession = async () => {
    if (!sessionId) return;
    setSessionStatus("closing");
    if (pollRef.current) clearInterval(pollRef.current);
    await fetch("/api/browser/session", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "close", sessionId }),
    }).catch(() => {});
    setSessionId(null); setLiveUrl(null); setScreenshot(null);
    setSessionStatus("idle");
    setActionLog(prev => [...prev, "Session closed"]);
  };

  const sendNav = async () => {
    if (!sessionId || !navUrl.trim()) return;
    setActionLog(prev => [...prev, "Navigating to " + navUrl]);
    await fetch("/api/browser/session", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "navigate", sessionId, url: navUrl }),
    }).catch(() => {});
  };

  const sendCommand = async (cmd: string, extra?: Record<string, string|number>) => {
    if (!sessionId) return;
    setActionLog(prev => [...prev, "Command: " + cmd]);
    await fetch("/api/browser/session", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "command", sessionId, command: cmd, ...extra }),
    }).catch(() => {});
  };

  /* ─── READ execute ─── */
  const execute = async () => {
    if (!task.trim()) return;
    setLoading(true); setResult(null); setActiveUrl("");

    // S47Q-02: Add explicit client-side timeout matching server maxDuration.
    // Previously the request could hang indefinitely with no user feedback.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90_000);

    try {
      const res = await fetch("/api/browser", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task, url: startUrl.trim() || undefined }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        setResult({
          success: false,
          task,
          error: isAr
            ? `فشل الطلب (${res.status}). ${errText.slice(0, 200)}`
            : `Request failed (${res.status}). ${errText.slice(0, 200)}`,
        });
        return;
      }

      const data: BrowserResult = await res.json();
      setResult(data);
      if (data.visitedUrls?.[0]) setActiveUrl(data.visitedUrls[0].url);
    } catch (err) {
      clearTimeout(timeoutId);
      const isTimeout = err instanceof Error && err.name === "AbortError";
      setResult({
        success: false,
        task,
        error: isTimeout
          ? (isAr ? "انتهت المهلة بعد 90 ثانية. الموقع المستهدف بطيء أو محظور. حاول برابط مختلف." : "Timed out after 90 seconds. The target site is slow or blocked. Try a different URL.")
          : (isAr ? "فشل الاتصال. تحقق من الرابط وحاول مرة أخرى." : "Connection failed. Check the URL and try again."),
      });
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#d0c5af]" dir={isAr ? "rtl" : "ltr"}>

      {/* Header */}
      <div className="px-8 py-6 border-b" style={{ borderColor: "rgba(212,175,55,0.1)" }}>
        <p className="font-[Orbitron] text-[9px] tracking-[5px] uppercase mb-1" style={{ color: goldText }}>
          {isAr ? "المهارات المتقدمة" : "SUPER SKILLS"}
        </p>
        <h1 className="font-[Orbitron] text-3xl font-black tracking-tighter" style={{ color: gold }}>
          {isAr ? "التحكم بالمتصفح" : "BROWSER CONTROL"}
        </h1>
        <p className="font-[Rajdhani] text-sm mt-1" style={{ color: goldText }}>
          {isAr ? "اقرأ ويب أو تحكم بمتصفح حقيقي في الوقت الفعلي" : "Read the web or take control of a real browser in real-time"}
        </p>

        {/* Mode tabs */}
        <div className="flex gap-1 mt-5">
          {([
            { id: "read",    label: "READ MODE",    labelAr: "وضع القراءة" },
            { id: "control", label: "TAKE CONTROL", labelAr: "وضع التحكم" },
          ] as const).map(m => (
            <button key={m.id} onClick={() => setMode(m.id)}
              className="font-[Orbitron] text-[9px] tracking-[2px] uppercase px-5 py-2.5 transition-all"
              style={{
                background: mode === m.id ? gold : "transparent",
                color: mode === m.id ? "#0A0A0A" : goldText,
                border: `1px solid ${mode === m.id ? gold : goldBorder}`,
                fontWeight: mode === m.id ? 700 : 400,
              }}>
              {isAr ? m.labelAr : m.label}
            </button>
          ))}
        </div>
      </div>

      {/* ═══════════════════ READ MODE ═══════════════════ */}
      {mode === "read" && (
        <div className="flex h-[calc(100vh-180px)]">
          {/* Left */}
          <div className="w-[320px] shrink-0 border-r p-6 flex flex-col gap-4" style={{ borderColor: "rgba(212,175,55,0.08)" }}>
            <div>
              <label className="font-[Orbitron] text-[8px] tracking-[3px] uppercase block mb-2" style={{ color: goldText }}>
                {isAr ? "رابط البداية (اختياري)" : "START URL (optional)"}
              </label>
              <input type="text" value={startUrl} onChange={e => setStartUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-2.5 text-sm font-mono"
                style={{ background: goldFaint, border: `1px solid ${goldBorder}`, color: "#d0c5af", outline: "none" }} />
            </div>
            <div>
              <label className="font-[Orbitron] text-[8px] tracking-[3px] uppercase block mb-2" style={{ color: goldText }}>
                {isAr ? "المهمة" : "TASK"}
              </label>
              <textarea value={task} onChange={e => setTask(e.target.value)}
                placeholder={isAr ? "ابحث عن... | لخّص... | اجمع بيانات من..." : "Search for... | Summarize... | Collect data from..."}
                rows={5}
                className="w-full px-4 py-3 text-sm font-[Rajdhani] resize-none"
                style={{ background: goldFaint, border: `1px solid ${goldBorder}`, color: "#d0c5af", outline: "none" }} />
            </div>
            <button onClick={execute} disabled={loading || !task.trim()}
              className="w-full font-[Orbitron] text-[10px] tracking-[3px] uppercase py-3 transition-all disabled:opacity-40"
              style={{ background: "rgba(212,175,55,0.12)", border: `1px solid ${gold}`, color: gold }}>
              {loading ? (isAr ? "⟳ جارٍ التنفيذ..." : "⟳ EXECUTING...") : (isAr ? "✦ تنفيذ" : "✦ EXECUTE")}
            </button>
          </div>

          {/* Right */}
          <div className="flex-1 overflow-y-auto p-6">
            {result ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  {result.success
                    ? <CheckCircle className="w-5 h-5 text-green-500" />
                    : <Loader2 className="w-5 h-5 text-red-400" />}
                  <span className="font-[Orbitron] text-xs tracking-wide" style={{ color: result.success ? "#22C55E" : "#EF4444" }}>
                    {result.success ? (isAr ? "مكتمل" : "COMPLETED") : (isAr ? "فشل" : "FAILED")}
                  </span>
                </div>
                {result.visitedUrls && result.visitedUrls.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {result.visitedUrls.map((v, i) => (
                      <a key={i} href={v.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 font-[Rajdhani] text-xs transition-all"
                        style={{ background: goldFaint, border: `1px solid ${goldBorder}`, color: goldText }}>
                        <Globe className="w-3 h-3" />
                        {v.title?.slice(0, 30) || v.url.slice(0, 30)}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ))}
                  </div>
                )}
                {result.answer && (
                  <div className="p-5" style={{ background: goldFaint, border: `1px solid ${goldBorder}` }}>
                    <p className="font-[Rajdhani] text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "#d0c5af" }}>
                      {result.answer}
                    </p>
                  </div>
                )}
                {result.error && (
                  <p className="font-[Rajdhani] text-sm" style={{ color: "#ef4444" }}>{result.error}</p>
                )}
              </div>
            ) : loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 opacity-60">
                <Loader2 className="w-10 h-10 animate-spin" style={{ color: gold }} />
                <p className="font-[Orbitron] text-xs tracking-widest uppercase" style={{ color: gold }}>
                  {isAr ? "جارٍ التصفح..." : "BROWSING..."}
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full opacity-20">
                <div className="text-center">
                  <Globe className="w-16 h-16 mx-auto mb-4" style={{ color: gold }} />
                  <p className="font-[Orbitron] text-xs tracking-widest uppercase" style={{ color: gold }}>
                    {isAr ? "النتائج ستظهر هنا" : "RESULTS WILL APPEAR HERE"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════ TAKE CONTROL MODE ═══════════════════ */}
      {mode === "control" && (
        <div className="flex h-[calc(100vh-180px)]">
          {/* Left controls */}
          <div className="w-[300px] shrink-0 border-r overflow-y-auto p-5 flex flex-col gap-4"
            style={{ borderColor: "rgba(212,175,55,0.08)" }}>

            {/* Session status */}
            <div className="flex items-center justify-between">
              <span className="font-[Orbitron] text-[8px] tracking-[3px] uppercase" style={{ color: goldText }}>
                {isAr ? "الجلسة" : "SESSION"}
              </span>
              <span className="font-mono text-[9px]" style={{
                color: sessionStatus === "active" ? "#22C55E"
                     : sessionStatus === "idle" ? goldText
                     : gold
              }}>
                {isAr
                  ? { idle: "خاملة", starting: "تشغيل...", active: "نشطة ●", closing: "إغلاق..." }[sessionStatus]
                  : { idle: "IDLE", starting: "STARTING...", active: "ACTIVE ●", closing: "CLOSING..." }[sessionStatus]}
              </span>
            </div>

            {/* Navigation URL */}
            <div>
              <label className="font-[Orbitron] text-[8px] tracking-[3px] uppercase block mb-1.5" style={{ color: goldText }}>
                {isAr ? "الرابط" : "URL"}
              </label>
              <div className="flex gap-1">
                <input type="text" value={navUrl} onChange={e => setNavUrl(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 px-3 py-2 text-xs font-mono"
                  style={{ background: goldFaint, border: `1px solid ${goldBorder}`, color: "#d0c5af", outline: "none" }} />
                {sessionStatus === "active" && (
                  <button onClick={sendNav}
                    className="font-[Orbitron] text-[8px] tracking-[1px] uppercase px-2 py-1 transition-all"
                    style={{ background: "rgba(212,175,55,0.1)", border: `1px solid ${goldBorder}`, color: goldText }}>
                    {isAr ? "انتقال" : "GO"}
                  </button>
                )}
              </div>
            </div>

            {/* Start/Stop button */}
            {sessionStatus === "idle" ? (
              <button onClick={startSession}
                className="w-full font-[Orbitron] text-[9px] tracking-[2px] uppercase py-3 transition-all"
                style={{ background: "rgba(212,175,55,0.12)", border: `1px solid ${gold}`, color: gold }}>
                {isAr ? "✦ تشغيل الجلسة" : "✦ START SESSION"}
              </button>
            ) : sessionStatus === "active" ? (
              <button onClick={closeSession}
                className="w-full font-[Orbitron] text-[9px] tracking-[2px] uppercase py-3 transition-all"
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", color: "#EF4444" }}>
                {isAr ? "إيقاف الجلسة" : "STOP SESSION"}
              </button>
            ) : (
              <button disabled
                className="w-full font-[Orbitron] text-[9px] tracking-[2px] uppercase py-3 opacity-40"
                style={{ border: `1px solid ${goldBorder}`, color: goldText }}>
                {isAr ? "جارٍ..." : "WORKING..."}
              </button>
            )}

            {sessionStatus === "active" && (
              <>
                {/* Quick commands */}
                <div>
                  <label className="font-[Orbitron] text-[8px] tracking-[3px] uppercase block mb-2" style={{ color: goldText }}>
                    {isAr ? "أوامر سريعة" : "QUICK COMMANDS"}
                  </label>
                  <div className="flex flex-col gap-1">
                    {QUICK_CMDS.map(cmd => (
                      <button key={cmd.id}
                        onClick={() => sendCommand(
                          cmd.id === "scroll_down" ? "scroll"
                        : cmd.id === "scroll_up" ? "scroll"
                        : "back",
                          cmd.id === "scroll_up" ? { scrollY: -400 } : {}
                        )}
                        className="font-[Orbitron] text-[8px] tracking-[2px] uppercase px-3 py-2 text-left transition-all"
                        style={{ background: goldFaint, border: `1px solid ${goldBorder}`, color: goldText }}>
                        {isAr ? cmd.labelAr : cmd.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Click */}
                <div>
                  <label className="font-[Orbitron] text-[8px] tracking-[3px] uppercase block mb-1.5" style={{ color: goldText }}>
                    {isAr ? "انقر على عنصر (CSS)" : "CLICK ELEMENT (CSS)"}
                  </label>
                  <div className="flex gap-1">
                    <input value={clickSel} onChange={e => setClickSel(e.target.value)}
                      placeholder="#btn, .submit"
                      className="flex-1 px-3 py-2 text-xs font-mono"
                      style={{ background: goldFaint, border: `1px solid ${goldBorder}`, color: "#d0c5af", outline: "none" }} />
                    <button onClick={() => sendCommand("click", { selector: clickSel })}
                      disabled={!clickSel.trim()}
                      className="font-[Orbitron] text-[8px] px-2 py-1 disabled:opacity-40"
                      style={{ background: "rgba(212,175,55,0.1)", border: `1px solid ${goldBorder}`, color: goldText }}>
                      {isAr ? "انقر" : "CLICK"}
                    </button>
                  </div>
                </div>

                {/* Type */}
                <div>
                  <label className="font-[Orbitron] text-[8px] tracking-[3px] uppercase block mb-1.5" style={{ color: goldText }}>
                    {isAr ? "اكتب في حقل (CSS + نص)" : "TYPE IN FIELD (CSS + TEXT)"}
                  </label>
                  <input value={typeSel} onChange={e => setTypeSel(e.target.value)}
                    placeholder="CSS selector..."
                    className="w-full px-3 py-2 mb-1 text-xs font-mono"
                    style={{ background: goldFaint, border: `1px solid ${goldBorder}`, color: "#d0c5af", outline: "none" }} />
                  <div className="flex gap-1">
                    <input value={typeText} onChange={e => setTypeText(e.target.value)}
                      placeholder={isAr ? "النص..." : "Text to type..."}
                      className="flex-1 px-3 py-2 text-xs font-[Rajdhani]"
                      style={{ background: goldFaint, border: `1px solid ${goldBorder}`, color: "#d0c5af", outline: "none" }} />
                    <button onClick={() => sendCommand("type", { selector: typeSel, text: typeText })}
                      disabled={!typeSel.trim()}
                      className="font-[Orbitron] text-[8px] px-2 py-1 disabled:opacity-40"
                      style={{ background: "rgba(212,175,55,0.1)", border: `1px solid ${goldBorder}`, color: goldText }}>
                      {isAr ? "أدخل" : "TYPE"}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Action log */}
            {actionLog.length > 0 && (
              <div>
                <label className="font-[Orbitron] text-[8px] tracking-[3px] uppercase block mb-2" style={{ color: goldText }}>
                  {isAr ? "السجل" : "LOG"}
                </label>
                <div className="flex flex-col gap-0.5 max-h-32 overflow-y-auto">
                  {actionLog.slice(-8).reverse().map((entry, i) => (
                    <p key={i} className="font-mono text-[9px]" style={{ color: "rgba(208,197,175,0.5)" }}>{entry}</p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right — screenshot canvas */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {sessionStatus === "active" && screenshot ? (
              <>
                <div className="flex items-center gap-2 px-4 py-2 border-b shrink-0"
                  style={{ borderColor: "rgba(212,175,55,0.08)", background: "#0d0d0d" }}>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="font-[Orbitron] text-[8px] tracking-widest uppercase" style={{ color: goldText }}>
                    {isAr ? "بث مباشر — يتحدث كل 3 ثوانٍ" : "LIVE VIEW — UPDATES EVERY 3s"}
                  </span>
                  {liveUrl && (
                    <a href={liveUrl} target="_blank" rel="noopener noreferrer"
                      className="font-[Orbitron] text-[8px] tracking-wide uppercase ml-auto"
                      style={{ color: gold }}>
                      {isAr ? "فتح المباشر ←" : "→ OPEN LIVE"}
                    </a>
                  )}
                </div>
                <div className="flex-1 overflow-hidden flex items-center justify-center p-4"
                  style={{ background: "#080808" }}>
                  <img src={screenshot} alt="Browser screenshot"
                    className="max-w-full max-h-full object-contain"
                    style={{ border: `1px solid ${goldBorder}` }} />
                </div>
              </>
            ) : sessionStatus === "starting" ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4"
                    style={{ borderColor: `${gold} transparent` }} />
                  <p className="font-[Orbitron] text-[10px] tracking-[3px] uppercase" style={{ color: gold }}>
                    {isAr ? "جارٍ تشغيل المتصفح..." : "LAUNCHING BROWSER..."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center opacity-20">
                <div className="text-center">
                  <Globe className="w-20 h-20 mx-auto mb-4" style={{ color: gold }} />
                  <p className="font-[Orbitron] text-xs tracking-[5px] uppercase" style={{ color: gold }}>
                    {isAr ? "ابدأ الجلسة للتحكم بمتصفح حقيقي" : "START SESSION TO CONTROL A REAL BROWSER"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
